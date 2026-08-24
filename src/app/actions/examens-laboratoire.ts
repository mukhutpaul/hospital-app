"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPE RESULTAT
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   OUTIL : RÉCUPÉRER UNE CHAÎNE DEPUIS FORMDATA
========================================================== */

function getString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/* ==========================================================
   OUTIL : RÉCUPÉRER UN NOMBRE DEPUIS FORMDATA
========================================================== */

function getNumber(
  formData: FormData,
  key: string,
): number {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return NaN;
  }

  const cleanedValue = value.trim();

  if (!cleanedValue) {
    return NaN;
  }

  const number = Number(
    cleanedValue.replace(",", "."),
  );

  return Number.isFinite(number)
    ? number
    : NaN;
}

/* ==========================================================
   LISTE DES EXAMENS
========================================================== */

export async function getExamensLaboratoire(): Promise<
  ActionResult
> {
  try {
    const examens =
      await prisma.examenLaboratoire.findMany({
        orderBy: {
          nom: "asc",
        },
      });

    console.log(
      `[LABORATOIRE] ${examens.length} examen(s) récupéré(s).`,
    );

    return {
      success: true,
      message:
        examens.length > 0
          ? `${examens.length} examen(s) récupéré(s).`
          : "Aucun examen de laboratoire enregistré.",
      data: examens,
    };
  } catch (error) {
    console.error(
      "Erreur getExamensLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les examens de laboratoire.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER UN EXAMEN
========================================================== */

export async function createExamenLaboratoire(
  formData: FormData,
): Promise<ActionResult> {
  try {
    /* ======================================================
       RÉCUPÉRATION
    ====================================================== */

    const code =
      getString(formData, "code").toUpperCase();

    const nom =
      getString(formData, "nom");

    const description =
      getString(formData, "description");

    const unite =
      getString(formData, "unite");

    const valeurNormale =
      getString(formData, "valeurNormale");

    const devise =
      getString(formData, "devise")
        .toUpperCase() || "USD";

    const prix =
      getNumber(formData, "prix");

    /* ======================================================
       VALIDATIONS
    ====================================================== */

    if (!code) {
      return {
        success: false,
        message:
          "Le code de l'examen est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom de l'examen est obligatoire.",
      };
    }

    if (!Number.isFinite(prix)) {
      return {
        success: false,
        message:
          "Le prix doit être un nombre valide.",
      };
    }

    if (prix < 0) {
      return {
        success: false,
        message:
          "Le prix ne peut pas être négatif.",
      };
    }

    /* ======================================================
       VÉRIFIER LE CODE
    ====================================================== */

    const examenExistant =
      await prisma.examenLaboratoire.findUnique({
        where: {
          code,
        },
      });

    if (examenExistant) {
      return {
        success: false,
        message:
          `Le code ${code} existe déjà.`,
      };
    }

    /* ======================================================
       CRÉATION
    ====================================================== */

    const examen =
      await prisma.examenLaboratoire.create({
        data: {
          code,
          nom,

          description:
            description || null,

          unite:
            unite || null,

          valeurNormale:
            valeurNormale || null,

          prix,

          devise,

          actif: true,
        },
      });

    console.log(
      `[LABORATOIRE] Examen créé : ${examen.id} - ${examen.nom}`,
    );

    /* ======================================================
       RAFRAÎCHIR
    ====================================================== */

    revalidatePath("/laboratoire");

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,
      message:
        "Examen de laboratoire ajouté avec succès.",
      data: examen,
    };
  } catch (error) {
    console.error(
      "Erreur createExamenLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de l'ajout de l'examen.",
    };
  }
}

/* ==========================================================
   MODIFIER UN EXAMEN
========================================================== */

export async function updateExamenLaboratoire(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATION ID
    ====================================================== */

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant de l'examen invalide.",
      };
    }

    /* ======================================================
       RÉCUPÉRATION
    ====================================================== */

    const code =
      getString(formData, "code").toUpperCase();

    const nom =
      getString(formData, "nom");

    const description =
      getString(formData, "description");

    const unite =
      getString(formData, "unite");

    const valeurNormale =
      getString(formData, "valeurNormale");

    const devise =
      getString(formData, "devise")
        .toUpperCase() || "USD";

    const prix =
      getNumber(formData, "prix");

    /* ======================================================
       VALIDATIONS
    ====================================================== */

    if (!code) {
      return {
        success: false,
        message:
          "Le code de l'examen est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom de l'examen est obligatoire.",
      };
    }

    if (!Number.isFinite(prix)) {
      return {
        success: false,
        message:
          "Le prix doit être un nombre valide.",
      };
    }

    if (prix < 0) {
      return {
        success: false,
        message:
          "Le prix ne peut pas être négatif.",
      };
    }

    /* ======================================================
       VÉRIFIER QUE L'EXAMEN EXISTE
    ====================================================== */

    const examenExiste =
      await prisma.examenLaboratoire.findUnique({
        where: {
          id,
        },
      });

    if (!examenExiste) {
      return {
        success: false,
        message:
          "Examen introuvable.",
      };
    }

    /* ======================================================
       VÉRIFIER LE CODE
    ====================================================== */

    const codeExiste =
      await prisma.examenLaboratoire.findFirst({
        where: {
          code,
          id: {
            not: id,
          },
        },
      });

    if (codeExiste) {
      return {
        success: false,
        message:
          `Le code ${code} est déjà utilisé.`,
      };
    }

    /* ======================================================
       MODIFICATION
    ====================================================== */

    const examen =
      await prisma.examenLaboratoire.update({
        where: {
          id,
        },

        data: {
          code,
          nom,

          description:
            description || null,

          unite:
            unite || null,

          valeurNormale:
            valeurNormale || null,

          prix,

          devise,
        },
      });

    console.log(
      `[LABORATOIRE] Examen modifié : ${examen.id} - ${examen.nom}`,
    );

    /* ======================================================
       RAFRAÎCHIR
    ====================================================== */

    revalidatePath("/laboratoire");

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,
      message:
        "Examen modifié avec succès.",
      data: examen,
    };
  } catch (error) {
    console.error(
      "Erreur updateExamenLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'examen.",
    };
  }
}

/* ==========================================================
   ACTIVER / DÉSACTIVER
========================================================== */

export async function toggleExamenLaboratoire(
  id: number,
): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATION
    ====================================================== */

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant de l'examen invalide.",
      };
    }

    /* ======================================================
       RECHERCHER
    ====================================================== */

    const examen =
      await prisma.examenLaboratoire.findUnique({
        where: {
          id,
        },
      });

    if (!examen) {
      return {
        success: false,
        message:
          "Examen introuvable.",
      };
    }

    /* ======================================================
       MODIFIER
    ====================================================== */

    const updated =
      await prisma.examenLaboratoire.update({
        where: {
          id,
        },

        data: {
          actif: !examen.actif,
        },
      });

    console.log(
      `[LABORATOIRE] Examen ${updated.id} ${
        updated.actif
          ? "activé"
          : "désactivé"
      }.`,
    );

    /* ======================================================
       RAFRAÎCHIR
    ====================================================== */

    revalidatePath("/laboratoire");

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message: updated.actif
        ? "Examen activé."
        : "Examen désactivé.",

      data: updated,
    };
  } catch (error) {
    console.error(
      "Erreur toggleExamenLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut de l'examen.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UN EXAMEN
========================================================== */

/* ==========================================================
   SUPPRIMER UN EXAMEN
========================================================== */

export async function deleteExamenLaboratoire(
  id: number,
): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATION ID
    ====================================================== */

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    /* ======================================================
       VÉRIFIER QUE L'EXAMEN EXISTE
    ====================================================== */

    const examen = await prisma.examenLaboratoire.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        nom: true,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen introuvable.",
      };
    }

    /* ======================================================
       COMPTER LES UTILISATIONS
       
       On utilise count() au lieu de include + length.
       Cela évite l'erreur TypeScript :
       Property 'length' does not exist on type 'never'.
    ====================================================== */

    const nombreLignes =
      await prisma.ligneDemandeLaboratoire.count({
        where: {
          examenId: id,
        },
      });

    const nombreResultats =
      await prisma.resultatLaboratoire.count({
        where: {
          examenId: id,
        },
      });

    /* ======================================================
       EMPÊCHER LA SUPPRESSION SI L'EXAMEN EST UTILISÉ
    ====================================================== */

    if (
      nombreLignes > 0 ||
      nombreResultats > 0
    ) {
      return {
        success: false,
        message:
          "Cet examen est déjà utilisé. Désactivez-le plutôt que de le supprimer.",
      };
    }

    /* ======================================================
       SUPPRESSION
    ====================================================== */

    await prisma.examenLaboratoire.delete({
      where: {
        id,
      },
    });

    console.log(
      `[LABORATOIRE] Examen supprimé : ${examen.id} - ${examen.nom}`,
    );

    /* ======================================================
       RAFRAÎCHIR LA PAGE
    ====================================================== */

    revalidatePath("/laboratoire");

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,
      message: "Examen supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "Erreur deleteExamenLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer cet examen.",
    };
  }
}