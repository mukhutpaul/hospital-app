"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type MedicamentInput = {
  code: string;
  nom: string;
  denomination?: string;
  forme?: string;
  dosage?: string;
  laboratoire?: string;
  categorie?: string;
  unite?: string;
  prixAchat?: number;
  prixVente?: number;
  devise?: string;
  seuilAlerte?: number;
  actif?: boolean;
};

/* ==========================================================
   LISTE DES MÉDICAMENTS
========================================================== */

export async function getMedicaments(): Promise<ActionResult> {
  try {
    const medicaments = await prisma.medicament.findMany({
      orderBy: {
        nom: "asc",
      },

      include: {
        stocks: true,
      },
    });

    return {
      success: true,
      message: "Médicaments récupérés.",
      data: medicaments,
    };
  } catch (error) {
    console.error("Erreur getMedicaments:", error);

    return {
      success: false,
      message: "Impossible de récupérer les médicaments.",
    };
  }
}

/* ==========================================================
   MÉDICAMENT PAR ID
========================================================== */

export async function getMedicamentById(
  id: number
): Promise<ActionResult> {
  try {
    const medicament = await prisma.medicament.findUnique({
      where: {
        id,
      },

      include: {
        stocks: {
          orderBy: {
            dateExpiration: "asc",
          },
        },
      },
    });

    if (!medicament) {
      return {
        success: false,
        message: "Médicament introuvable.",
      };
    }

    return {
      success: true,
      message: "Médicament trouvé.",
      data: medicament,
    };
  } catch (error) {
    console.error("Erreur getMedicamentById:", error);

    return {
      success: false,
      message: "Impossible de récupérer le médicament.",
    };
  }
}

/* ==========================================================
   CRÉER UN MÉDICAMENT
========================================================== */

export async function createMedicament(
  data: MedicamentInput
): Promise<ActionResult> {
  try {
    const code = data.code.trim();
    const nom = data.nom.trim();

    if (!code) {
      return {
        success: false,
        message: "Le code du médicament est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom du médicament est obligatoire.",
      };
    }

    const existe = await prisma.medicament.findUnique({
      where: {
        code,
      },
    });

    if (existe) {
      return {
        success: false,
        message: "Un médicament avec ce code existe déjà.",
      };
    }

    const medicament = await prisma.medicament.create({
      data: {
        code,
        nom,

        denomination:
          data.denomination?.trim() || null,

        forme:
          data.forme?.trim() || null,

        dosage:
          data.dosage?.trim() || null,

        laboratoire:
          data.laboratoire?.trim() || null,

        categorie:
          data.categorie?.trim() || null,

        unite:
          data.unite?.trim() || null,

        prixAchat:
          data.prixAchat !== undefined
            ? Number(data.prixAchat)
            : 0,

        prixVente:
          data.prixVente !== undefined
            ? Number(data.prixVente)
            : 0,

        devise:
          data.devise?.trim() || "CDF",

        seuilAlerte:
          data.seuilAlerte !== undefined
            ? Number(data.seuilAlerte)
            : 10,

        actif:
          data.actif ?? true,
      },
    });

    revalidatePath("/pharmacie/medicaments");

    return {
      success: true,
      message: "Médicament créé avec succès.",
      data: medicament,
    };
  } catch (error) {
    console.error("Erreur createMedicament:", error);

    return {
      success: false,
      message: "Impossible de créer le médicament.",
    };
  }
}

/* ==========================================================
   MODIFIER UN MÉDICAMENT
========================================================== */

export async function updateMedicament(
  id: number,
  data: Partial<MedicamentInput>
): Promise<ActionResult> {
  try {
    const medicament = await prisma.medicament.findUnique({
      where: {
        id,
      },
    });

    if (!medicament) {
      return {
        success: false,
        message: "Médicament introuvable.",
      };
    }

    const updated = await prisma.medicament.update({
      where: {
        id,
      },

      data: {
        ...(data.code !== undefined && {
          code: data.code.trim(),
        }),

        ...(data.nom !== undefined && {
          nom: data.nom.trim(),
        }),

        ...(data.denomination !== undefined && {
          denomination:
            data.denomination.trim() || null,
        }),

        ...(data.forme !== undefined && {
          forme:
            data.forme.trim() || null,
        }),

        ...(data.dosage !== undefined && {
          dosage:
            data.dosage.trim() || null,
        }),

        ...(data.laboratoire !== undefined && {
          laboratoire:
            data.laboratoire.trim() || null,
        }),

        ...(data.categorie !== undefined && {
          categorie:
            data.categorie.trim() || null,
        }),

        ...(data.unite !== undefined && {
          unite:
            data.unite.trim() || null,
        }),

        ...(data.prixAchat !== undefined && {
          prixAchat: Number(data.prixAchat),
        }),

        ...(data.prixVente !== undefined && {
          prixVente: Number(data.prixVente),
        }),

        ...(data.devise !== undefined && {
          devise: data.devise.trim(),
        }),

        ...(data.seuilAlerte !== undefined && {
          seuilAlerte: Number(data.seuilAlerte),
        }),

        ...(data.actif !== undefined && {
          actif: data.actif,
        }),
      },
    });

    revalidatePath("/pharmacie/medicaments");

    return {
      success: true,
      message: "Médicament modifié avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error("Erreur updateMedicament:", error);

    return {
      success: false,
      message: "Impossible de modifier le médicament.",
    };
  }
}

/* ==========================================================
   SUPPRIMER
========================================================== */

export async function deleteMedicament(
  id: number
): Promise<ActionResult> {
  try {
    const medicament = await prisma.medicament.findUnique({
      where: {
        id,
      },

      include: {
        stocks: true,
      },
    });

    if (!medicament) {
      return {
        success: false,
        message: "Médicament introuvable.",
      };
    }

    if (medicament.stocks.length > 0) {
      return {
        success: false,
        message:
          "Ce médicament possède un historique de stock et ne peut pas être supprimé.",
      };
    }

    await prisma.medicament.delete({
      where: {
        id,
      },
    });

    revalidatePath("/pharmacie/medicaments");

    return {
      success: true,
      message: "Médicament supprimé avec succès.",
    };
  } catch (error) {
    console.error("Erreur deleteMedicament:", error);

    return {
      success: false,
      message: "Impossible de supprimer le médicament.",
    };
  }
}

/* ==========================================================
   ACTIVER / DÉSACTIVER
========================================================== */

export async function toggleMedicament(
  id: number
): Promise<ActionResult> {
  try {
    const medicament = await prisma.medicament.findUnique({
      where: {
        id,
      },
    });

    if (!medicament) {
      return {
        success: false,
        message: "Médicament introuvable.",
      };
    }

    const updated = await prisma.medicament.update({
      where: {
        id,
      },

      data: {
        actif: !medicament.actif,
      },
    });

    revalidatePath("/pharmacie/medicaments");

    return {
      success: true,
      message: updated.actif
        ? "Médicament activé."
        : "Médicament désactivé.",
      data: updated,
    };
  } catch (error) {
    console.error("Erreur toggleMedicament:", error);

    return {
      success: false,
      message:
        "Impossible de modifier le statut du médicament.",
    };
  }
}