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
   MÉDICAMENTS
========================================================== */

export async function getMedicaments(): Promise<
  ActionResult
> {
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
      message: "Médicaments récupérés avec succès.",
      data: medicaments,
    };
  } catch (error) {
    console.error("getMedicaments:", error);

    return {
      success: false,
      message: "Impossible de récupérer les médicaments.",
    };
  }
}

/* ==========================================================
   STOCKS
========================================================== */

export async function getStocksPharmacie(): Promise<
  ActionResult
> {
  try {
    const stocks = await prisma.stockMedicament.findMany({
      orderBy: {
        dateExpiration: "asc",
      },
      include: {
        medicament: true,
      },
    });

    return {
      success: true,
      message: "Stocks récupérés avec succès.",
      data: stocks,
    };
  } catch (error) {
    console.error("getStocksPharmacie:", error);

    return {
      success: false,
      message: "Impossible de récupérer les stocks.",
    };
  }
}

/* ==========================================================
   MOUVEMENTS DE STOCK
========================================================== */

export async function getMouvementsStock(): Promise<
  ActionResult
> {
  try {
    const mouvements =
      await prisma.mouvementStock.findMany({
        orderBy: {
          dateMouvement: "desc",
        },
        include: {
          medicament: true,
        },
      });

    return {
      success: true,
      message: "Mouvements récupérés avec succès.",
      data: mouvements,
    };
  } catch (error) {
    console.error("getMouvementsStock:", error);

    return {
      success: false,
      message: "Impossible de récupérer les mouvements.",
    };
  }
}

/* ==========================================================
   ORDONNANCES
========================================================== */

export async function getOrdonnancesPharmacie(): Promise<
  ActionResult
> {
  try {
    const prescriptions =
      await prisma.prescription.findMany({
        orderBy: {
          datePrescription: "desc",
        },

        include: {
          patient: {
            select: {
              id: true,
              numeroDossier: true,
              nom: true,
              postNom: true,
              prenom: true,
              sexe: true,
              dateNaissance: true,
              telephone: true,
            },
          },

          medecin: {
            select: {
              id: true,
              matricule: true,
              nom: true,
              postNom: true,
              prenom: true,
              numeroOrdre: true,
            },
          },

          consultation: {
            select: {
              idConsultation: true,
              dateConsultation: true,
              diagnostic: true,
              motif: true,
            },
          },

          lignes: {
            include: {
              medicament: {
                select: {
                  id: true,
                  code: true,
                  nom: true,
                  denomination: true,
                  forme: true,
                  dosage: true,
                  laboratoire: true,
                  categorie: true,
                  prixVente: true,
                  devise: true,
                },
              },
            },
          },
        },
      });

    return {
      success: true,
      message: "Ordonnances récupérées avec succès.",
      data: prescriptions,
    };
  } catch (error) {
    console.error("getOrdonnancesPharmacie:", error);

    return {
      success: false,
      message: "Impossible de récupérer les ordonnances.",
    };
  }
}

/* ==========================================================
   UNE ORDONNANCE
========================================================== */

export async function getOrdonnanceById(
  id: number
): Promise<ActionResult> {
  try {
    const ordonnance =
      await prisma.prescription.findUnique({
        where: {
          id,
        },

        include: {
          patient: true,

          medecin: {
            include: {
              service: true,
              specialite: true,
            },
          },

          consultation: true,

          auteur: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          lignes: {
            include: {
              medicament: true,
            },
          },
        },
      });

    if (!ordonnance) {
      return {
        success: false,
        message: "Ordonnance introuvable.",
      };
    }

    return {
      success: true,
      message: "Ordonnance récupérée.",
      data: ordonnance,
    };
  } catch (error) {
    console.error("getOrdonnanceById:", error);

    return {
      success: false,
      message: "Impossible de récupérer l'ordonnance.",
    };
  }
}

/* ==========================================================
   CHANGER LE STATUT D'UNE ORDONNANCE
========================================================== */

export async function updateStatutOrdonnance(
  id: number,
  statut: string
): Promise<ActionResult> {
  try {
    const ordonnance =
      await prisma.prescription.update({
        where: {
          id,
        },

        data: {
          statut,
        },
      });

    return {
      success: true,
      message: "Statut de l'ordonnance mis à jour.",
      data: ordonnance,
    };
  } catch (error) {
    console.error(
      "updateStatutOrdonnance:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut de l'ordonnance.",
    };
  }
}