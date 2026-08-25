"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   LISTE DES MOUVEMENTS
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
          stock: true,
          utilisateur: true,
        },
      });

    return {
      success: true,
      message:
        "Mouvements récupérés.",
      data: mouvements,
    };
  } catch (error) {
    console.error(
      "Erreur getMouvementsStock:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les mouvements.",
    };
  }
}

/* ==========================================================
   MOUVEMENT PAR ID
========================================================== */

export async function getMouvementStockById(
  id: number
): Promise<ActionResult> {
  try {
    const mouvement =
      await prisma.mouvementStock.findUnique({
        where: {
          id,
        },

        include: {
          medicament: true,
          stock: true,
          utilisateur: true,
        },
      });

    if (!mouvement) {
      return {
        success: false,
        message:
          "Mouvement introuvable.",
      };
    }

    return {
      success: true,
      message: "Mouvement trouvé.",
      data: mouvement,
    };
  } catch (error) {
    console.error(
      "Erreur getMouvementStockById:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le mouvement.",
    };
  }
}

/* ==========================================================
   CRÉER UN MOUVEMENT
========================================================== */

export async function createMouvementStock(data: {
  medicamentId: number;
  stockId?: number;
  type: string;
  quantite: number;
  motif?: string;
  reference?: string;
  utilisateurId?: number;
}): Promise<ActionResult> {
  try {
    const quantite = Number(
      data.quantite
    );

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

    const typesAutorises = [
      "ENTREE",
      "SORTIE",
      "AJUSTEMENT",
      "RETOUR",
      "PERTE",
      "PEREMPTION",
    ];

    if (
      !typesAutorises.includes(
        data.type
      )
    ) {
      return {
        success: false,
        message:
          "Type de mouvement invalide.",
      };
    }

    const mouvement =
      await prisma.$transaction(
        async (tx) => {
          const medicament =
            await tx.medicament.findUnique({
              where: {
                id: data.medicamentId,
              },
            });

          if (!medicament) {
            throw new Error(
              "Médicament introuvable."
            );
          }

          let stockId =
            data.stockId ?? null;

          if (stockId) {
            const stock =
              await tx.stockMedicament.findUnique({
                where: {
                  id: stockId,
                },
              });

            if (!stock) {
              throw new Error(
                "Stock introuvable."
              );
            }

            if (
              stock.medicamentId !==
              data.medicamentId
            ) {
              throw new Error(
                "Le stock sélectionné ne correspond pas au médicament."
              );
            }
          }

          /*
           * ENTREE / RETOUR
           * augmentent le stock
           */
          if (
            data.type === "ENTREE" ||
            data.type === "RETOUR"
          ) {
            if (!stockId) {
              const stock =
                await tx.stockMedicament.findFirst({
                  where: {
                    medicamentId:
                      data.medicamentId,
                  },

                  orderBy: {
                    id: "asc",
                  },
                });

              if (stock) {
                stockId = stock.id;
              } else {
                const nouveauStock =
                  await tx.stockMedicament.create({
                    data: {
                      medicamentId:
                        data.medicamentId,

                      quantite: 0,
                    },
                  });

                stockId =
                  nouveauStock.id;
              }
            }

            await tx.stockMedicament.update({
              where: {
                id: stockId,
              },

              data: {
                quantite: {
                  increment: quantite,
                },
              },
            });
          }

          /*
           * SORTIE / PERTE / PEREMPTION
           * diminuent le stock
           */
          if (
            data.type === "SORTIE" ||
            data.type === "PERTE" ||
            data.type === "PEREMPTION"
          ) {
            if (!stockId) {
              throw new Error(
                "Un stock doit être sélectionné pour cette opération."
              );
            }

            const stock =
              await tx.stockMedicament.findUnique({
                where: {
                  id: stockId,
                },
              });

            if (!stock) {
              throw new Error(
                "Stock introuvable."
              );
            }

            if (
              stock.quantite <
              quantite
            ) {
              throw new Error(
                `Stock insuffisant. Disponible : ${stock.quantite}`
              );
            }

            await tx.stockMedicament.update({
              where: {
                id: stockId,
              },

              data: {
                quantite: {
                  decrement: quantite,
                },
              },
            });
          }

          /*
           * AJUSTEMENT
           *
           * Ici quantite représente
           * la nouvelle quantité du stock.
           */
          if (
            data.type === "AJUSTEMENT"
          ) {
            if (!stockId) {
              throw new Error(
                "Un stock doit être sélectionné pour un ajustement."
              );
            }

            await tx.stockMedicament.update({
              where: {
                id: stockId,
              },

              data: {
                quantite,
              },
            });
          }

          return tx.mouvementStock.create({
            data: {
              medicamentId:
                data.medicamentId,

              stockId,

              type:
                data.type,

              quantite,

              motif:
                data.motif?.trim() ||
                null,

              reference:
                data.reference?.trim() ||
                null,

              utilisateurId:
                data.utilisateurId ??
                null,
            },

            include: {
              medicament: true,
              stock: true,
              utilisateur: true,
            },
          });
        }
      );

    revalidatePath("/pharmacie/mouvements");
    revalidatePath("/pharmacie/stocks");
    revalidatePath("/pharmacie/medicaments");

    return {
      success: true,
      message:
        "Mouvement enregistré avec succès.",
      data: mouvement,
    };
  } catch (error) {
    console.error(
      "Erreur createMouvementStock:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer le mouvement.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UN MOUVEMENT
========================================================== */

export async function deleteMouvementStock(
  id: number
): Promise<ActionResult> {
  try {
    const mouvement =
      await prisma.mouvementStock.findUnique({
        where: {
          id,
        },
      });

    if (!mouvement) {
      return {
        success: false,
        message:
          "Mouvement introuvable.",
      };
    }

    /*
     * On ne supprime pas l'historique
     * d'un stock dans une vraie application
     * médicale/pharmaceutique.
     */

    return {
      success: false,
      message:
        "Les mouvements de stock ne doivent pas être supprimés. Utilisez un mouvement de correction.",
    };
  } catch (error) {
    console.error(
      "Erreur deleteMouvementStock:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de traiter le mouvement.",
    };
  }
}