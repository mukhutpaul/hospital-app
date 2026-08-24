"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type CreateServiceData = {
  code: string;
  nom: string;
  description?: string | null;
  departementId?: number | null;
  actif: boolean;
};

export type UpdateServiceData = {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  departementId?: number | null;
  actif: boolean;
};

/*
|--------------------------------------------------------------------------
| AUTHENTIFICATION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| RÉCUPÉRER LES SERVICES
|--------------------------------------------------------------------------
*/

export async function getServices() {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const services = await prisma.service.findMany({
      orderBy: {
        nom: "asc",
      },

      include: {
        departement: true,

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
    });

    return {
      success: true as const,
      data: services,
    };
  } catch (error) {
    console.error("GET_SERVICES_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de récupérer les services.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| RÉCUPÉRER UN SERVICE
|--------------------------------------------------------------------------
*/

export async function getServiceById(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false as const,
        message: "L'identifiant du service est invalide.",
      };
    }

    const service = await prisma.service.findUnique({
      where: {
        id,
      },

      include: {
        departement: true,

        employes: {
          orderBy: {
            nom: "asc",
          },
        },

        medecins: {
          orderBy: {
            nom: "asc",
          },
        },

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
    });

    if (!service) {
      return {
        success: false as const,
        message: "Service introuvable.",
      };
    }

    return {
      success: true as const,
      data: service,
    };
  } catch (error) {
    console.error("GET_SERVICE_BY_ID_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de récupérer le service.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| RÉCUPÉRER LES DÉPARTEMENTS
|--------------------------------------------------------------------------
*/

export async function getDepartementsPourService() {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const departements = await prisma.departement.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },

      select: {
        id: true,
        code: true,
        nom: true,
      },
    });

    return {
      success: true as const,
      data: departements,
    };
  } catch (error) {
    console.error("GET_DEPARTEMENTS_POUR_SERVICE_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de récupérer les départements.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| CRÉER UN SERVICE
|--------------------------------------------------------------------------
*/

export async function createService(data: CreateServiceData) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const description = data.description?.trim() || null;

    const departementId =
      data.departementId && Number.isInteger(data.departementId)
        ? data.departementId
        : null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!code) {
      return {
        success: false as const,
        message: "Le code du service est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false as const,
        message: "Le nom du service est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VÉRIFIER LE CODE
    |--------------------------------------------------------------------------
    */

    const codeExiste = await prisma.service.findUnique({
      where: {
        code,
      },
    });

    if (codeExiste) {
      return {
        success: false as const,
        message: "Ce code de service existe déjà.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VÉRIFIER LE DÉPARTEMENT
    |--------------------------------------------------------------------------
    */

    if (departementId) {
      const departement = await prisma.departement.findUnique({
        where: {
          id: departementId,
        },
      });

      if (!departement) {
        return {
          success: false as const,
          message: "Le département sélectionné est introuvable.",
        };
      }

      if (!departement.actif) {
        return {
          success: false as const,
          message: "Le département sélectionné est désactivé.",
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CRÉATION
    |--------------------------------------------------------------------------
    */

    const service = await prisma.service.create({
      data: {
        code,
        nom,
        description,
        departementId,
        actif: data.actif,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHISSEMENT
    |--------------------------------------------------------------------------
    */

    revalidatePath("/services");

    return {
      success: true as const,
      data: service,
      message: "Service créé avec succès.",
    };
  } catch (error) {
    console.error("CREATE_SERVICE_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de créer le service.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MODIFIER UN SERVICE
|--------------------------------------------------------------------------
*/

export async function updateService(data: UpdateServiceData) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!Number.isInteger(data.id) || data.id <= 0) {
      return {
        success: false as const,
        message: "L'identifiant du service est invalide.",
      };
    }

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const description = data.description?.trim() || null;

    const departementId =
      data.departementId && Number.isInteger(data.departementId)
        ? data.departementId
        : null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!code) {
      return {
        success: false as const,
        message: "Le code du service est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false as const,
        message: "Le nom du service est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | SERVICE
    |--------------------------------------------------------------------------
    */

    const service = await prisma.service.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!service) {
      return {
        success: false as const,
        message: "Service introuvable.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | CODE UNIQUE
    |--------------------------------------------------------------------------
    */

    const autreService = await prisma.service.findFirst({
      where: {
        code,

        NOT: {
          id: data.id,
        },
      },
    });

    if (autreService) {
      return {
        success: false as const,
        message: "Ce code de service est déjà utilisé.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | DÉPARTEMENT
    |--------------------------------------------------------------------------
    */

    if (departementId) {
      const departement = await prisma.departement.findUnique({
        where: {
          id: departementId,
        },
      });

      if (!departement) {
        return {
          success: false as const,
          message: "Le département sélectionné est introuvable.",
        };
      }

      if (!departement.actif) {
        return {
          success: false as const,
          message: "Le département sélectionné est désactivé.",
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | MODIFICATION
    |--------------------------------------------------------------------------
    */

    const serviceModifie = await prisma.service.update({
      where: {
        id: data.id,
      },

      data: {
        code,
        nom,
        description,
        departementId,
        actif: data.actif,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHISSEMENT
    |--------------------------------------------------------------------------
    */

    revalidatePath("/services");
    revalidatePath(`/services/${data.id}`);
    revalidatePath(`/services/${data.id}/modifier`);

    return {
      success: true as const,
      data: serviceModifie,
      message: "Service modifié avec succès.",
    };
  } catch (error) {
    console.error("UPDATE_SERVICE_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de modifier le service.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| ACTIVER / DÉSACTIVER
|--------------------------------------------------------------------------
*/

export async function toggleService(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false as const,
        message: "L'identifiant du service est invalide.",
      };
    }

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return {
        success: false as const,
        message: "Service introuvable.",
      };
    }

    const nouvelEtat = !service.actif;

    await prisma.service.update({
      where: {
        id,
      },

      data: {
        actif: nouvelEtat,
      },
    });

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);

    return {
      success: true as const,
      actif: nouvelEtat,
      message: nouvelEtat
        ? "Service activé avec succès."
        : "Service désactivé avec succès.",
    };
  } catch (error) {
    console.error("TOGGLE_SERVICE_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de modifier le statut du service.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UN SERVICE
|--------------------------------------------------------------------------
*/

export async function deleteService(id: number) {
  try {
    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false as const,
        message: "L'identifiant du service est invalide.",
      };
    }

    const service = await prisma.service.findUnique({
      where: {
        id,
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
    });

    if (!service) {
      return {
        success: false as const,
        message: "Service introuvable.",
      };
    }

    const utilise =
      service._count.employes > 0 ||
      service._count.medecins > 0 ||
      service._count.rendezVous > 0 ||
      service._count.admissions > 0 ||
      service._count.consultations > 0 ||
      service._count.hospitalisations > 0 ||
      service._count.chambres > 0 ||
      service._count.demandesLabo > 0 ||
      service._count.demandesImagerie > 0;

    if (utilise) {
      return {
        success: false as const,
        message:
          "Impossible de supprimer ce service car il est déjà utilisé dans le système. Désactivez-le plutôt.",
      };
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    revalidatePath("/services");

    return {
      success: true as const,
      message: "Service supprimé avec succès.",
    };
  } catch (error) {
    console.error("DELETE_SERVICE_ERROR:", error);

    return {
      success: false as const,
      message: "Impossible de supprimer le service.",
    };
  }
}
