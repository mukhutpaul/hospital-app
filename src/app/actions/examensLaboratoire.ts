"use server";

import { prisma } from "@/lib/prisma";

/* ==========================================================
   TYPES
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   LISTE DES EXAMENS
========================================================== */

export async function getExamensLaboratoire(): Promise<ActionResult> {
  try {
    const examens = await prisma.examenLaboratoire.findMany({
      orderBy: {
        nom: "asc",
      },
    });

    return {
      success: true,
      message: "Examens de laboratoire récupérés.",
      data: examens,
    };
  } catch (error) {
    console.error("GET EXAMENS LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de récupérer les examens de laboratoire.",
      data: [],
    };
  }
}

/* ==========================================================
   EXAMEN PAR ID
========================================================== */

export async function getExamenLaboratoireById(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant d'examen invalide.",
      };
    }

    const examen = await prisma.examenLaboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen de laboratoire introuvable.",
      };
    }

    return {
      success: true,
      message: "Examen récupéré.",
      data: examen,
    };
  } catch (error) {
    console.error("GET EXAMEN LABORATOIRE BY ID:", error);

    return {
      success: false,
      message: "Impossible de récupérer l'examen.",
    };
  }
}

/* ==========================================================
   CRÉER
========================================================== */

export async function createExamenLaboratoire(data: {
  code: string;
  nom: string;
  description?: string;
  unite?: string;
  valeurNormale?: string;
  prix?: number;
  actif?: boolean;
}): Promise<ActionResult> {
  try {
    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();

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

    if (
      data.prix !== undefined &&
      (!Number.isFinite(data.prix) || data.prix < 0)
    ) {
      return {
        success: false,
        message: "Le prix de l'examen est invalide.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LE CODE
    ------------------------------------------------------ */

    const existing = await prisma.examenLaboratoire.findUnique({
      where: {
        code,
      },
    });

    if (existing) {
      return {
        success: false,
        message: "Un examen avec ce code existe déjà.",
      };
    }

    /* ------------------------------------------------------
       CRÉATION
    ------------------------------------------------------ */

    const examen = await prisma.examenLaboratoire.create({
      data: {
        code,
        nom,

        description:
          data.description?.trim() || null,

        unite:
          data.unite?.trim() || null,

        valeurNormale:
          data.valeurNormale?.trim() || null,

        prix: data.prix ?? 0,

        actif: data.actif ?? true,
      },
    });

    return {
      success: true,
      message: "Examen de laboratoire créé avec succès.",
      data: examen,
    };
  } catch (error) {
    console.error("CREATE EXAMEN LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de créer l'examen.",
    };
  }
}

/* ==========================================================
   MODIFIER
========================================================== */

export async function updateExamenLaboratoire(
  id: number,
  data: {
    code: string;
    nom: string;
    description?: string;
    unite?: string;
    valeurNormale?: string;
    prix?: number;
    actif?: boolean;
  }
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!code) {
      return {
        success: false,
        message: "Le code est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    if (
      data.prix !== undefined &&
      (!Number.isFinite(data.prix) || data.prix < 0)
    ) {
      return {
        success: false,
        message: "Le prix est invalide.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER L'EXAMEN
    ------------------------------------------------------ */

    const examen = await prisma.examenLaboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen introuvable.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LE CODE
    ------------------------------------------------------ */

    const codeExiste = await prisma.examenLaboratoire.findFirst({
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
        message:
          "Ce code est déjà utilisé par un autre examen.",
      };
    }

    /* ------------------------------------------------------
       MISE À JOUR
    ------------------------------------------------------ */

    const updated = await prisma.examenLaboratoire.update({
      where: {
        id,
      },

      data: {
        code,
        nom,

        description:
          data.description?.trim() || null,

        unite:
          data.unite?.trim() || null,

        valeurNormale:
          data.valeurNormale?.trim() || null,

        prix:
          data.prix ?? examen.prix,

        actif:
          data.actif ?? examen.actif,
      },
    });

    return {
      success: true,
      message: "Examen modifié avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error("UPDATE EXAMEN LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de modifier l'examen.",
    };
  }
}

/* ==========================================================
   ACTIVER / DÉSACTIVER
========================================================== */

export async function toggleExamenLaboratoire(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const examen = await prisma.examenLaboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen introuvable.",
      };
    }

    const updated = await prisma.examenLaboratoire.update({
      where: {
        id,
      },

      data: {
        actif: !examen.actif,
      },
    });

    return {
      success: true,
      message: updated.actif
        ? "Examen activé."
        : "Examen désactivé.",
      data: updated,
    };
  } catch (error) {
    console.error("TOGGLE EXAMEN LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de modifier le statut de l'examen.",
    };
  }
}

/* ==========================================================
   SUPPRIMER
========================================================== */

export async function deleteExamenLaboratoire(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER L'EXAMEN
    ------------------------------------------------------ */

    const examen = await prisma.examenLaboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen introuvable.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LES DEMANDES DE LABORATOIRE
       
       IMPORTANT :
       Le modèle Prisma s'appelle :
       DemandeLaboratoireLigne

       Donc Prisma expose :
       prisma.demandeLaboratoireLigne
    ------------------------------------------------------ */

    const lignesCount =
      await prisma.demandeLaboratoireLigne.count({
        where: {
          examenId: id,
        },
      });

    /* ------------------------------------------------------
       VÉRIFIER LES RÉSULTATS
    ------------------------------------------------------ */

    const resultatsCount =
      await prisma.resultatLaboratoire.count({
        where: {
          examenId: id,
        },
      });

    /* ------------------------------------------------------
       EMPÊCHER LA SUPPRESSION SI UTILISÉ
    ------------------------------------------------------ */

    if (
      lignesCount > 0 ||
      resultatsCount > 0
    ) {
      return {
        success: false,
        message:
          "Cet examen est déjà utilisé dans le système. Désactivez-le plutôt que de le supprimer.",
      };
    }

    /* ------------------------------------------------------
       SUPPRESSION
    ------------------------------------------------------ */

    await prisma.examenLaboratoire.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "Examen supprimé avec succès.",
    };
  } catch (error) {
    console.error("DELETE EXAMEN LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de supprimer l'examen.",
    };
  }
}