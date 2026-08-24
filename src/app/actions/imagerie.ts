"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPE
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   NUMÉRO DEMANDE IMAGERIE
========================================================== */

async function generateNumeroImagerie() {
  const count = await prisma.demandeImagerie.count();

  return `IMG-${String(count + 1).padStart(6, "0")}`;
}

/* ==========================================================
   EXAMENS D'IMAGERIE
========================================================== */

/* ==========================================================
   EXAMENS D'IMAGERIE
========================================================== */

export async function getExamensImagerie(): Promise<ActionResult> {
  try {
    const examens = await prisma.examenImagerie.findMany({
      orderBy: {
        nom: "asc",
      },

      include: {
        _count: {
          select: {
            demandes: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Examens d'imagerie récupérés.",
      data: examens,
    };
  } catch (error) {
    console.error("Erreur getExamensImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les examens d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER UN EXAMEN D'IMAGERIE
========================================================== */

export async function createExamenImagerie(data: {
  code: string;
  nom: string;
  type: string;
  description?: string;
  prix?: number;
  devise?: string;
}): Promise<ActionResult> {
  try {
    /* ------------------------------------------------------
       NETTOYAGE
    ------------------------------------------------------ */

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const type = data.type?.trim();

    const description = data.description?.trim() || null;

    const devise = data.devise?.trim().toUpperCase() || "USD";

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!code) {
      return {
        success: false,
        message: "Le code de l'examen est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom de l'examen est obligatoire.",
      };
    }

    if (!type) {
      return {
        success: false,
        message: "La catégorie d'imagerie est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LE CODE
    ------------------------------------------------------ */

    const examenExiste = await prisma.examenImagerie.findUnique({
      where: {
        code,
      },
    });

    if (examenExiste) {
      return {
        success: false,
        message: `Le code "${code}" est déjà utilisé.`,
      };
    }

    /* ------------------------------------------------------
       PRIX
    ------------------------------------------------------ */

    const prix =
      typeof data.prix === "number" && Number.isFinite(data.prix)
        ? data.prix
        : 0;

    /* ------------------------------------------------------
       CRÉATION
    ------------------------------------------------------ */

    const examen = await prisma.examenImagerie.create({
      data: {
        code,
        nom,
        type,
        description,
        prix,
        devise,
        actif: true,
      },
    });

    /* ------------------------------------------------------
       REVALIDATION
    ------------------------------------------------------ */

    revalidatePath("/imagerie");

    return {
      success: true,
      message: `L'examen "${nom}" a été créé avec succès.`,
      data: examen,
    };
  } catch (error) {
    console.error("Erreur createExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de créer l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   MODIFIER UN EXAMEN D'IMAGERIE
========================================================== */

export async function updateExamenImagerie(
  id: number,
  data: {
    code: string;
    nom: string;
    type: string;
    description?: string;
    prix?: number;
    devise?: string;
    actif?: boolean;
  },
): Promise<ActionResult> {
  try {
    /* ------------------------------------------------------
       VALIDATION ID
    ------------------------------------------------------ */

    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    /* ------------------------------------------------------
       NETTOYAGE
    ------------------------------------------------------ */

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const type = data.type?.trim();

    const description = data.description?.trim() || null;

    const devise = data.devise?.trim().toUpperCase() || "USD";

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!code) {
      return {
        success: false,
        message: "Le code de l'examen est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom de l'examen est obligatoire.",
      };
    }

    if (!type) {
      return {
        success: false,
        message: "La catégorie d'imagerie est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER EXISTENCE
    ------------------------------------------------------ */

    const examen = await prisma.examenImagerie.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER CODE
    ------------------------------------------------------ */

    const codeExiste = await prisma.examenImagerie.findFirst({
      where: {
        code,
        NOT: {
          id,
        },
      },
    });

    if (codeExiste) {
      return {
        success: false,
        message: `Le code "${code}" est déjà utilisé.`,
      };
    }

    /* ------------------------------------------------------
       PRIX
    ------------------------------------------------------ */

    const prix =
      typeof data.prix === "number" && Number.isFinite(data.prix)
        ? data.prix
        : 0;

    /* ------------------------------------------------------
       MODIFICATION
    ------------------------------------------------------ */

    const examenModifie = await prisma.examenImagerie.update({
      where: {
        id,
      },

      data: {
        code,
        nom,
        type,
        description,
        prix,
        devise,
        actif: data.actif ?? examen.actif,
      },
    });

    /* ------------------------------------------------------
       REVALIDATION
    ------------------------------------------------------ */

    revalidatePath("/imagerie");

    return {
      success: true,
      message: "Examen d'imagerie modifié avec succès.",
      data: examenModifie,
    };
  } catch (error) {
    console.error("Erreur updateExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de modifier l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   DÉSACTIVER UN EXAMEN
========================================================== */

export async function deleteExamenImagerie(id: number): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER EXISTENCE
    ------------------------------------------------------ */

    const examen = await prisma.examenImagerie.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable.",
      };
    }

    /* ------------------------------------------------------
       DÉSACTIVATION
       
       On ne supprime pas physiquement l'examen,
       car il peut être utilisé dans des demandes.
    ------------------------------------------------------ */

    await prisma.examenImagerie.update({
      where: {
        id,
      },

      data: {
        actif: false,
      },
    });

    revalidatePath("/imagerie");

    return {
      success: true,
      message: "Examen d'imagerie désactivé avec succès.",
    };
  } catch (error) {
    console.error("Erreur deleteExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de désactiver l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   CATÉGORIES D'IMAGERIE
   ----------------------------------------------------------
   IMPORTANT :
   Il n'y a PAS de modèle CategorieImagerie.

   La catégorie correspond au champ "type"
   du modèle ExamenImagerie.
========================================================== */

export async function getCategoriesImagerie(): Promise<ActionResult> {
  try {
    const categories = await prisma.examenImagerie.findMany({
      where: {
        actif: true,
      },

      select: {
        type: true,
      },

      distinct: ["type"],

      orderBy: {
        type: "asc",
      },
    });

    const resultats = categories
      .map((categorie) => categorie.type?.trim())
      .filter((type): type is string => Boolean(type));

    return {
      success: true,
      message: "Catégories d'imagerie récupérées.",
      data: resultats,
    };
  } catch (error) {
    console.error("Erreur getCategoriesImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les catégories d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER UNE DEMANDE D'IMAGERIE
========================================================== */

export async function createDemandeImagerie(data: {
  patientId: number;
  consultationId?: number | null;
  serviceId?: number | null;
  examenId: number;
  motif?: string;
  urgence?: boolean;
}): Promise<ActionResult> {
  try {
    /* ------------------------------------------------------
       VALIDATION PATIENT
    ------------------------------------------------------ */

    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       VALIDATION EXAMEN
    ------------------------------------------------------ */

    if (!data.examenId) {
      return {
        success: false,
        message: "L'examen d'imagerie est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER EXAMEN
    ------------------------------------------------------ */

    const examen = await prisma.examenImagerie.findFirst({
      where: {
        id: data.examenId,
        actif: true,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable ou inactif.",
      };
    }

    /* ------------------------------------------------------
       NUMÉRO
    ------------------------------------------------------ */

    const numero = await generateNumeroImagerie();

    /* ------------------------------------------------------
       CRÉATION DEMANDE
    ------------------------------------------------------ */

    const demande = await prisma.demandeImagerie.create({
      data: {
        numero,

        patientId: data.patientId,

        consultationId: data.consultationId ?? null,

        serviceId: data.serviceId ?? null,

        examenId: data.examenId,

        motif: data.motif?.trim() || null,

        urgence: data.urgence ?? false,

        statut: "DEMANDE",
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
          },
        },
      },
    });

    /* ------------------------------------------------------
       REVALIDATION
    ------------------------------------------------------ */

    revalidatePath("/imagerie");

    if (data.consultationId) {
      revalidatePath(`/consultations/${data.consultationId}`);
    }

    return {
      success: true,
      message: `Demande ${numero} créée avec succès.`,
      data: demande,
    };
  } catch (error) {
    console.error("Erreur createDemandeImagerie :", error);

    return {
      success: false,
      message: "Erreur lors de la création de la demande d'imagerie.",
    };
  }
}

/* ==========================================================
   LISTE DES DEMANDES
========================================================== */

export async function getDemandesImagerie(): Promise<ActionResult> {
  try {
    const demandes = await prisma.demandeImagerie.findMany({
      orderBy: {
        dateDemande: "desc",
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Demandes d'imagerie récupérées.",
      data: demandes,
    };
  } catch (error) {
    console.error("Erreur getDemandesImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les demandes d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   DÉTAIL D'UNE DEMANDE
========================================================== */

export async function getDemandeImagerie(id: number): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de la demande invalide.",
      };
    }

    const demande = await prisma.demandeImagerie.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
            specialite: true,
          },
        },
      },
    });

    if (!demande) {
      return {
        success: false,
        message: "Demande d'imagerie introuvable.",
      };
    }

    return {
      success: true,
      message: "Demande d'imagerie récupérée.",
      data: demande,
    };
  } catch (error) {
    console.error("Erreur getDemandeImagerie :", error);

    return {
      success: false,
      message: "Erreur lors du chargement de la demande.",
    };
  }
}

/* ==========================================================
   ENREGISTRER LE COMPTE RENDU
========================================================== */

export async function updateCompteRenduImagerie(
  id: number,
  data: {
    dateExamen?: string;
    compteRendu?: string;
    conclusion?: string;
    fichier?: string;
  },
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de la demande invalide.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LA DEMANDE
    ------------------------------------------------------ */

    const demandeExiste = await prisma.demandeImagerie.findUnique({
      where: {
        id,
      },
    });

    if (!demandeExiste) {
      return {
        success: false,
        message: "Demande d'imagerie introuvable.",
      };
    }

    /* ------------------------------------------------------
       DATE EXAMEN
    ------------------------------------------------------ */

    let dateExamen: Date | undefined;

    if (data.dateExamen) {
      const date = new Date(data.dateExamen);

      if (Number.isNaN(date.getTime())) {
        return {
          success: false,
          message: "La date de l'examen est invalide.",
        };
      }

      dateExamen = date;
    }

    /* ------------------------------------------------------
       MISE À JOUR
    ------------------------------------------------------ */

    const demande = await prisma.demandeImagerie.update({
      where: {
        id,
      },

      data: {
        dateExamen,

        compteRendu: data.compteRendu?.trim() || null,

        conclusion: data.conclusion?.trim() || null,

        fichier: data.fichier?.trim() || null,

        statut: "TERMINE",
      },

      include: {
        patient: true,
        examen: true,
        consultation: true,
      },
    });

    /* ------------------------------------------------------
       REVALIDATION
    ------------------------------------------------------ */

    revalidatePath("/imagerie");

    revalidatePath(`/imagerie/${id}`);

    if (demande.consultationId) {
      revalidatePath(`/consultations/${demande.consultationId}`);
    }

    return {
      success: true,
      message: "Compte rendu d'imagerie enregistré.",
      data: demande,
    };
  } catch (error) {
    console.error("Erreur updateCompteRenduImagerie :", error);

    return {
      success: false,
      message: "Impossible d'enregistrer le compte rendu.",
    };
  }
}
