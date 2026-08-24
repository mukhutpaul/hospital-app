"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateDepartementData = {
  code?: string | null;
  nom: string;
  description?: string | null;
  actif: boolean;
};

export type UpdateDepartementData = {
  id: number;
  code?: string | null;
  nom: string;
  description?: string | null;
  actif: boolean;
};

async function verifierAuthentification() {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false as const,
      message: "Vous devez être connecté.",
    };
  }

  return {
    success: true as const,
    session,
  };
}

/* ==========================================================
   RÉCUPÉRER LES DÉPARTEMENTS
========================================================== */

export async function getDepartements() {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const departements = await prisma.departement.findMany({
      orderBy: {
        nom: "asc",
      },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return {
      success: true as const,
      data: departements,
    };
  } catch (error) {
    console.error("GET_DEPARTEMENTS_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de récupérer les départements.",
    };
  }
}

/* ==========================================================
   RÉCUPÉRER UN DÉPARTEMENT
========================================================== */

export async function getDepartementById(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!id) {
      return {
        success: false as const,
        message: "L'identifiant du département est obligatoire.",
      };
    }

    const departement = await prisma.departement.findUnique({
      where: {
        id,
      },
      include: {
        services: {
          orderBy: {
            nom: "asc",
          },
          include: {
            _count: {
              select: {
                employes: true,
                medecins: true,
                rendezVous: true,
                admissions: true,
                consultations: true,
                hospitalisations: true,
                chambres: true,
                demandesLabo: true,
                demandesImagerie: true,
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!departement) {
      return {
        success: false as const,
        message: "Département introuvable.",
      };
    }

    return {
      success: true as const,
      data: departement,
    };
  } catch (error) {
    console.error("GET_DEPARTEMENT_BY_ID_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de récupérer le département.",
    };
  }
}

/* ==========================================================
   CRÉER
========================================================== */

export async function createDepartement(
  data: CreateDepartementData
) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const nom = data.nom?.trim();
    const code = data.code?.trim() || null;
    const description = data.description?.trim() || null;

    if (!nom) {
      return {
        success: false as const,
        message: "Le nom du département est obligatoire.",
      };
    }

    if (code) {
      const codeExiste = await prisma.departement.findUnique({
        where: {
          code,
        },
      });

      if (codeExiste) {
        return {
          success: false as const,
          message: "Ce code de département existe déjà.",
        };
      }
    }

    const nomExiste = await prisma.departement.findFirst({
      where: {
        nom,
      },
    });

    if (nomExiste) {
      return {
        success: false as const,
        message: "Ce département existe déjà.",
      };
    }

    const departement = await prisma.departement.create({
      data: {
        code,
        nom,
        description,
        actif: data.actif,
      },
    });

    revalidatePath("/departements");

    return {
      success: true as const,
      data: departement,
      message: "Département créé avec succès.",
    };
  } catch (error) {
    console.error("CREATE_DEPARTEMENT_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de créer le département.",
    };
  }
}

/* ==========================================================
   MODIFIER
========================================================== */

export async function updateDepartement(
  data: UpdateDepartementData
) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!data.id) {
      return {
        success: false as const,
        message: "L'identifiant du département est obligatoire.",
      };
    }

    const nom = data.nom?.trim();
    const code = data.code?.trim() || null;
    const description = data.description?.trim() || null;

    if (!nom) {
      return {
        success: false as const,
        message: "Le nom du département est obligatoire.",
      };
    }

    const departement = await prisma.departement.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!departement) {
      return {
        success: false as const,
        message: "Département introuvable.",
      };
    }

    if (code) {
      const autreCode = await prisma.departement.findFirst({
        where: {
          code,
          NOT: {
            id: data.id,
          },
        },
      });

      if (autreCode) {
        return {
          success: false as const,
          message: "Ce code est déjà utilisé.",
        };
      }
    }

    const autreNom = await prisma.departement.findFirst({
      where: {
        nom,
        NOT: {
          id: data.id,
        },
      },
    });

    if (autreNom) {
      return {
        success: false as const,
        message: "Ce nom de département est déjà utilisé.",
      };
    }

    const departementModifie =
      await prisma.departement.update({
        where: {
          id: data.id,
        },
        data: {
          code,
          nom,
          description,
          actif: data.actif,
        },
      });

    revalidatePath("/departements");
    revalidatePath(`/departements/${data.id}`);
    revalidatePath(`/departements/${data.id}/modifier`);

    return {
      success: true as const,
      data: departementModifie,
      message: "Département modifié avec succès.",
    };
  } catch (error) {
    console.error("UPDATE_DEPARTEMENT_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de modifier le département.",
    };
  }
}

/* ==========================================================
   ACTIVER / DÉSACTIVER
========================================================== */

export async function toggleDepartement(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const departement = await prisma.departement.findUnique({
      where: {
        id,
      },
    });

    if (!departement) {
      return {
        success: false as const,
        message: "Département introuvable.",
      };
    }

    const nouvelEtat = !departement.actif;

    await prisma.departement.update({
      where: {
        id,
      },
      data: {
        actif: nouvelEtat,
      },
    });

    revalidatePath("/departements");
    revalidatePath(`/departements/${id}`);

    return {
      success: true as const,
      actif: nouvelEtat,
      message: nouvelEtat
        ? "Département activé avec succès."
        : "Département désactivé avec succès.",
    };
  } catch (error) {
    console.error("TOGGLE_DEPARTEMENT_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de modifier le statut du département.",
    };
  }
}

/* ==========================================================
   SUPPRIMER
========================================================== */

export async function deleteDepartement(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const departement = await prisma.departement.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (!departement) {
      return {
        success: false as const,
        message: "Département introuvable.",
      };
    }

    if (departement._count.services > 0) {
      return {
        success: false as const,
        message:
          "Impossible de supprimer ce département car il contient encore des services.",
      };
    }

    await prisma.departement.delete({
      where: {
        id,
      },
    });

    revalidatePath("/departements");

    return {
      success: true as const,
      message: "Département supprimé avec succès.",
    };
  } catch (error) {
    console.error("DELETE_DEPARTEMENT_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de supprimer le département.",
    };
  }
}