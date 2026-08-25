"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPE GÉNÉRIQUE DES RÉSULTATS
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   TYPE POUR CRÉATION / MODIFICATION D'UN STOCK
========================================================== */

type StockInput = {
  medicamentId: number;
  lot?: string | null;
  dateExpiration?: Date | string | null;
  quantite: number;
  utilisateurId?: number | null;
  motif?: string | null;
  reference?: string | null;
};

type UpdateStockInput = {
  lot?: string | null;
  dateExpiration?: Date | string | null;
  quantite: number;
};

/* ==========================================================
   LISTE DES STOCKS
========================================================== */

export async function getStocks(): Promise<ActionResult> {
  try {
    const stocks = await prisma.stockMedicament.findMany({
      orderBy: {
        dateExpiration: "asc",
      },

      include: {
        medicament: true,

        mouvements: {
          orderBy: {
            dateMouvement: "desc",
          },

          take: 10,
        },

        dispensationLignes: {
          orderBy: {
            createdAt: "desc",
          },

          take: 10,
        },
      },
    });

    return {
      success: true,
      message: "Stocks récupérés.",
      data: stocks,
    };
  } catch (error) {
    console.error("Erreur getStocks:", error);

    return {
      success: false,
      message: "Impossible de récupérer les stocks.",
    };
  }
}

/* ==========================================================
   STOCK PAR ID
========================================================== */

export async function getStockById(
  id: number
): Promise<ActionResult> {
  try {
    const stock =
      await prisma.stockMedicament.findUnique({
        where: {
          id,
        },

        include: {
          medicament: true,

          mouvements: {
            orderBy: {
              dateMouvement: "desc",
            },
          },

          dispensationLignes: {
            include: {
              dispensation: {
                include: {
                  patient: true,
                },
              },
            },

            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!stock) {
      return {
        success: false,
        message: "Stock introuvable.",
      };
    }

    return {
      success: true,
      message: "Stock trouvé.",
      data: stock,
    };
  } catch (error) {
    console.error(
      "Erreur getStockById:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le stock.",
    };
  }
}

/* ==========================================================
   STOCK DISPONIBLE D'UN MÉDICAMENT
========================================================== */

export async function getStockDisponible(
  medicamentId: number
): Promise<ActionResult> {
  try {
    if (!Number.isInteger(medicamentId)) {
      return {
        success: false,
        message: "Identifiant du médicament invalide.",
      };
    }

    const stocks =
      await prisma.stockMedicament.findMany({
        where: {
          medicamentId,
          quantite: {
            gt: 0,
          },
        },

        orderBy: [
          {
            dateExpiration: "asc",
          },
          {
            id: "asc",
          },
        ],
      });

    const total = stocks.reduce(
      (somme, stock) =>
        somme + stock.quantite,
      0
    );

    return {
      success: true,
      message:
        "Stock disponible récupéré.",
      data: {
        total,
        stocks,
      },
    };
  } catch (error) {
    console.error(
      "Erreur getStockDisponible:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le stock disponible.",
    };
  }
}

/* ==========================================================
   CRÉER / AJOUTER UN STOCK
========================================================== */

export async function createStock(
  data: StockInput
): Promise<ActionResult> {
  try {
    const medicamentId =
      Number(data.medicamentId);

    const quantite =
      Number(data.quantite);

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!Number.isInteger(medicamentId)) {
      return {
        success: false,
        message:
          "L'identifiant du médicament est invalide.",
      };
    }

    if (
      !Number.isFinite(quantite) ||
      quantite <= 0
    ) {
      return {
        success: false,
        message:
          "La quantité doit être supérieure à zéro.",
      };
    }

    /* -------------------------------------------------------
       VÉRIFICATION DU MÉDICAMENT
    ------------------------------------------------------- */

    const medicament =
      await prisma.medicament.findUnique({
        where: {
          id: medicamentId,
        },
      });

    if (!medicament) {
      return {
        success: false,
        message:
          "Médicament introuvable.",
      };
    }

    /* -------------------------------------------------------
       NORMALISATION DES DONNÉES
    ------------------------------------------------------- */

    const lot =
      data.lot?.trim() || null;

    const dateExpiration =
      data.dateExpiration
        ? new Date(data.dateExpiration)
        : null;

    if (
      dateExpiration &&
      Number.isNaN(dateExpiration.getTime())
    ) {
      return {
        success: false,
        message:
          "La date d'expiration est invalide.",
      };
    }

    /* -------------------------------------------------------
       TRANSACTION
    ------------------------------------------------------- */

    const stock =
      await prisma.$transaction(
        async (tx) => {
          let stock =
            await tx.stockMedicament.findFirst({
              where: {
                medicamentId,
                lot,
              },
            });

          /* -------------------------------------------------
             STOCK EXISTANT
          ------------------------------------------------- */

          if (stock) {
            stock =
              await tx.stockMedicament.update({
                where: {
                  id: stock.id,
                },

                data: {
                  quantite: {
                    increment: quantite,
                  },

                  dateExpiration:
                    dateExpiration ??
                    stock.dateExpiration,
                },
              });
          }

          /* -------------------------------------------------
             NOUVEAU STOCK
          ------------------------------------------------- */

          else {
            stock =
              await tx.stockMedicament.create({
                data: {
                  medicamentId,
                  lot,
                  dateExpiration,
                  quantite,
                },
              });
          }

          /* -------------------------------------------------
             MOUVEMENT D'ENTRÉE
          ------------------------------------------------- */

          await tx.mouvementStock.create({
            data: {
              medicamentId,

              stockId: stock.id,

              type: "ENTREE",

              quantite,

              motif:
                data.motif?.trim() ||
                "Entrée en stock",

              reference:
                data.reference?.trim() ||
                null,

              utilisateurId:
                data.utilisateurId ??
                null,
            },
          });

          return stock;
        }
      );

    /* -------------------------------------------------------
       CACHE
    ------------------------------------------------------- */

    revalidatePath(
      "/pharmacie/stocks"
    );

    revalidatePath(
      "/pharmacie/mouvements"
    );

    revalidatePath(
      "/pharmacie/medicaments"
    );

    revalidatePath(
      "/pharmacie/dispensations"
    );

    /* -------------------------------------------------------
       RÉPONSE
    ------------------------------------------------------- */

    return {
      success: true,
      message:
        "Stock ajouté avec succès.",
      data: stock,
    };
  } catch (error) {
    console.error(
      "Erreur createStock:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'ajouter le stock.",
    };
  }
}

/* ==========================================================
   MODIFIER UN STOCK
========================================================== */

export async function updateStock(
  id: number,
  data: UpdateStockInput
): Promise<ActionResult> {
  try {
    const stockId = Number(id);

    const quantite =
      Number(data.quantite);

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!Number.isInteger(stockId)) {
      return {
        success: false,
        message:
          "Identifiant du stock invalide.",
      };
    }

    if (
      !Number.isFinite(quantite) ||
      quantite < 0
    ) {
      return {
        success: false,
        message:
          "La quantité est invalide.",
      };
    }

    /* -------------------------------------------------------
       RECHERCHE DU STOCK
    ------------------------------------------------------- */

    const stock =
      await prisma.stockMedicament.findUnique({
        where: {
          id: stockId,
        },
      });

    if (!stock) {
      return {
        success: false,
        message:
          "Stock introuvable.",
      };
    }

    /* -------------------------------------------------------
       NORMALISATION
    ------------------------------------------------------- */

    const lot =
      data.lot?.trim() || null;

    const dateExpiration =
      data.dateExpiration
        ? new Date(data.dateExpiration)
        : null;

    if (
      dateExpiration &&
      Number.isNaN(dateExpiration.getTime())
    ) {
      return {
        success: false,
        message:
          "La date d'expiration est invalide.",
      };
    }

    /* -------------------------------------------------------
       MODIFICATION
    ------------------------------------------------------- */

    const updated =
      await prisma.stockMedicament.update({
        where: {
          id: stockId,
        },

        data: {
          lot,

          dateExpiration,

          quantite,
        },
      });

    /* -------------------------------------------------------
       CACHE
    ------------------------------------------------------- */

    revalidatePath(
      "/pharmacie/stocks"
    );

    revalidatePath(
      "/pharmacie/medicaments"
    );

    return {
      success: true,
      message:
        "Stock modifié avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "Erreur updateStock:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le stock.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UN STOCK
========================================================== */

export async function deleteStock(
  id: number
): Promise<ActionResult> {
  try {
    const stockId = Number(id);

    if (!Number.isInteger(stockId)) {
      return {
        success: false,
        message:
          "Identifiant du stock invalide.",
      };
    }

    /* -------------------------------------------------------
       RECHERCHE DU STOCK ET DE SON HISTORIQUE
    ------------------------------------------------------- */

    const stock =
      await prisma.stockMedicament.findUnique({
        where: {
          id: stockId,
        },

        include: {
          mouvements: true,
          dispensationLignes: true,
        },
      });

    if (!stock) {
      return {
        success: false,
        message:
          "Stock introuvable.",
      };
    }

    /* -------------------------------------------------------
       PROTECTION DE L'HISTORIQUE
    ------------------------------------------------------- */

    if (
      stock.mouvements.length > 0 ||
      stock.dispensationLignes.length > 0
    ) {
      return {
        success: false,
        message:
          "Ce stock possède un historique et ne peut pas être supprimé.",
      };
    }

    /* -------------------------------------------------------
       SUPPRESSION
    ------------------------------------------------------- */

    await prisma.stockMedicament.delete({
      where: {
        id: stockId,
      },
    });

    /* -------------------------------------------------------
       CACHE
    ------------------------------------------------------- */

    revalidatePath(
      "/pharmacie/stocks"
    );

    revalidatePath(
      "/pharmacie/medicaments"
    );

    return {
      success: true,
      message:
        "Stock supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "Erreur deleteStock:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer le stock.",
    };
  }
}