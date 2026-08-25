"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   LISTE DES ORDONNANCES
========================================================== */

export async function getOrdonnances(): Promise<
  ActionResult
> {
  try {
    const ordonnances =
      await prisma.prescription.findMany({
        orderBy: {
          datePrescription: "desc",
        },

        include: {
          patient: true,
          medecin: true,
          consultation: true,

          lignes: {
            include: {
              medicament: {
                include: {
                  stocks: true,
                },
              },

              dispensationLignes: true,
            },
          },

          dispensations: {
            orderBy: {
              dateDispensation: "desc",
            },
          },
        },
      });

    return {
      success: true,
      message:
        "Ordonnances récupérées.",
      data: ordonnances,
    };
  } catch (error) {
    console.error(
      "Erreur getOrdonnances:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les ordonnances.",
    };
  }
}

/* ==========================================================
   ORDONNANCE PAR ID
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
          medecin: true,
          consultation: true,

          lignes: {
            include: {
              medicament: {
                include: {
                  stocks: {
                    orderBy: {
                      dateExpiration: "asc",
                    },
                  },
                },
              },

              dispensationLignes: {
                include: {
                  dispensation: true,
                },
              },
            },
          },

          dispensations: {
            include: {
              pharmacien: true,
              lignes: {
                include: {
                  medicament: true,
                  stock: true,
                },
              },
            },

            orderBy: {
              dateDispensation: "desc",
            },
          },
        },
      });

    if (!ordonnance) {
      return {
        success: false,
        message:
          "Ordonnance introuvable.",
      };
    }

    return {
      success: true,
      message:
        "Ordonnance récupérée.",
      data: ordonnance,
    };
  } catch (error) {
    console.error(
      "Erreur getOrdonnanceById:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer l'ordonnance.",
    };
  }
}

/* ==========================================================
   LISTE DES DISPENSATIONS
========================================================== */

export async function getDispensations(): Promise<
  ActionResult
> {
  try {
    const dispensations =
      await prisma.dispensation.findMany({
        orderBy: {
          dateDispensation: "desc",
        },

        include: {
          patient: true,
          pharmacien: true,
          prescription: {
            include: {
              medecin: true,
            },
          },

          lignes: {
            include: {
              medicament: true,
              stock: true,
              prescriptionLigne: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        "Dispensations récupérées.",
      data: dispensations,
    };
  } catch (error) {
    console.error(
      "Erreur getDispensations:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les dispensations.",
    };
  }
}

/* ==========================================================
   DISPENSATION PAR ID
========================================================== */

export async function getDispensationById(
  id: number
): Promise<ActionResult> {
  try {
    const dispensation =
      await prisma.dispensation.findUnique({
        where: {
          id,
        },

        include: {
          patient: true,
          pharmacien: true,

          prescription: {
            include: {
              medecin: true,
              lignes: {
                include: {
                  medicament: true,
                },
              },
            },
          },

          lignes: {
            include: {
              medicament: true,
              stock: true,
              prescriptionLigne: true,
            },
          },
        },
      });

    if (!dispensation) {
      return {
        success: false,
        message:
          "Dispensation introuvable.",
      };
    }

    return {
      success: true,
      message:
        "Dispensation récupérée.",
      data: dispensation,
    };
  } catch (error) {
    console.error(
      "Erreur getDispensationById:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer la dispensation.",
    };
  }
}

/* ==========================================================
   CRÉER UNE DISPENSATION
========================================================== */

export async function createDispensation(data: {
  prescriptionId?: number;
  patientId: number;
  pharmacienId?: number;
  observation?: string;

  lignes: {
    prescriptionLigneId?: number;
    medicamentId: number;
    stockId?: number;
    quantiteDispensee: number;
    prixUnitaire?: number;
    observation?: string;
  }[];
}): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATIONS DE BASE
    ====================================================== */

    if (
      !data.patientId ||
      !Number.isInteger(
        Number(data.patientId)
      )
    ) {
      return {
        success: false,
        message:
          "Patient invalide.",
      };
    }

    if (
      !Array.isArray(data.lignes) ||
      data.lignes.length === 0
    ) {
      return {
        success: false,
        message:
          "Aucun médicament à dispenser.",
      };
    }

    for (const ligne of data.lignes) {
      const quantite =
        Number(
          ligne.quantiteDispensee
        );

      if (
        !Number.isFinite(
          quantite
        ) ||
        quantite <= 0
      ) {
        return {
          success: false,
          message:
            "Toutes les quantités dispensées doivent être supérieures à zéro.",
        };
      }

      if (
        !ligne.medicamentId
      ) {
        return {
          success: false,
          message:
            "Un médicament est manquant.",
        };
      }
    }

    /* ======================================================
       TRANSACTION
    ====================================================== */

    const result =
      await prisma.$transaction(
        async (tx) => {
          let prescription =
            null;

          /*
           * Si une ordonnance est fournie,
           * on la verrouille logiquement
           * en la rechargeant dans la transaction.
           */

          if (
            data.prescriptionId
          ) {
            prescription =
              await tx.prescription.findUnique({
                where: {
                  id:
                    data.prescriptionId,
                },

                include: {
                  lignes: {
                    include: {
                      medicament: true,
                      dispensationLignes:
                        true,
                    },
                  },
                },
              });

            if (!prescription) {
              throw new Error(
                "Ordonnance introuvable."
              );
            }

            if (
              prescription.patientId !==
              data.patientId
            ) {
              throw new Error(
                "L'ordonnance ne correspond pas au patient sélectionné."
              );
            }

            if (
              prescription.statut ===
                "ANNULEE" ||
              prescription.statut ===
                "EXPIREE"
            ) {
              throw new Error(
                "Cette ordonnance ne peut plus être dispensée."
              );
            }
          }

          /* ==================================================
             VÉRIFICATION DU PATIENT
          ================================================== */

          const patient =
            await tx.patient.findUnique({
              where: {
                id:
                  data.patientId,
              },
            });

          if (!patient) {
            throw new Error(
              "Patient introuvable."
            );
          }

          /* ==================================================
             VÉRIFICATION DU PHARMACIEN
          ================================================== */

          if (
            data.pharmacienId
          ) {
            const pharmacien =
              await tx.user.findUnique({
                where: {
                  id:
                    data.pharmacienId,
                },
              });

            if (!pharmacien) {
              throw new Error(
                "Pharmacien/utilisateur introuvable."
              );
            }
          }

          /* ==================================================
             NUMÉRO DISPENSATION
          ================================================== */

          const numero =
            `DISP-${Date.now()}-${Math.floor(
              Math.random() * 10000
            )}`;

          /* ==================================================
             CALCUL DES LIGNES
          ================================================== */

          const lignesFinales: {
            prescriptionLigneId:
              number | null;

            medicamentId: number;

            stockId:
              number | null;

            quantitePrescrite:
              number | null;

            quantiteDispensee:
              number;

            prixUnitaire:
              number;

            montant:
              number;

            observation:
              string | null;
          }[] = [];

          /* ==================================================
             TRAITER CHAQUE MÉDICAMENT
          ================================================== */

          for (
            const ligne of data.lignes
          ) {
            const quantite =
              Number(
                ligne.quantiteDispensee
              );

            /* ================================================
               MÉDICAMENT
            ================================================= */

            const medicament =
              await tx.medicament.findUnique({
                where: {
                  id:
                    ligne.medicamentId,
                },
              });

            if (!medicament) {
              throw new Error(
                `Médicament ${ligne.medicamentId} introuvable.`
              );
            }

            /* ================================================
               QUANTITÉ PRESCRITE
            ================================================= */

            let quantitePrescrite:
              number | null =
              null;

            let quantiteDejaDispensee =
              0;

            if (
              ligne.prescriptionLigneId
            ) {
              const prescriptionLigne =
                await tx.prescriptionLigne.findUnique({
                  where: {
                    id:
                      ligne.prescriptionLigneId,
                  },

                  include: {
                    dispensationLignes:
                      true,
                  },
                });

              if (
                !prescriptionLigne
              ) {
                throw new Error(
                  "Ligne d'ordonnance introuvable."
                );
              }

              if (
                prescriptionLigne.prescriptionId !==
                data.prescriptionId
              ) {
                throw new Error(
                  "La ligne ne correspond pas à l'ordonnance."
                );
              }

              if (
                prescriptionLigne.medicamentId !==
                ligne.medicamentId
              ) {
                throw new Error(
                  "Le médicament ne correspond pas à la ligne prescrite."
                );
              }

              quantitePrescrite =
                Number(
                  prescriptionLigne.quantite
                );

              quantiteDejaDispensee =
                prescriptionLigne
                  .dispensationLignes
                  .reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.quantiteDispensee
                      ),
                    0
                  );

              const reste =
                quantitePrescrite -
                quantiteDejaDispensee;

              if (
                quantite >
                reste
              ) {
                throw new Error(
                  `Impossible de dispenser ${quantite} unité(s) de ${medicament.nom}. Il ne reste que ${reste} unité(s) à dispenser.`
                );
              }
            }

            /* ================================================
               STOCK
            ================================================= */

            let stock = null;

            if (
              ligne.stockId
            ) {
              stock =
                await tx.stockMedicament.findUnique({
                  where: {
                    id:
                      ligne.stockId,
                  },
                });

              if (!stock) {
                throw new Error(
                  `Stock introuvable pour ${medicament.nom}.`
                );
              }

              if (
                stock.medicamentId !==
                ligne.medicamentId
              ) {
                throw new Error(
                  `Le lot sélectionné ne correspond pas à ${medicament.nom}.`
                );
              }

              if (
                stock.quantite <
                quantite
              ) {
                throw new Error(
                  `Stock insuffisant pour ${medicament.nom}. Disponible : ${stock.quantite}, demandé : ${quantite}.`
                );
              }
            } else {
              /*
               * FIFO :
               * on prend les lots avec
               * expiration la plus proche.
               */

              const stocks =
                await tx.stockMedicament.findMany({
                  where: {
                    medicamentId:
                      ligne.medicamentId,

                    quantite: {
                      gt: 0,
                    },
                  },

                  orderBy: [
                    {
                      dateExpiration:
                        "asc",
                    },
                    {
                      id: "asc",
                    },
                  ],
                });

              const totalDisponible =
                stocks.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    Number(
                      item.quantite
                    ),
                  0
                );

              if (
                totalDisponible <
                quantite
              ) {
                throw new Error(
                  `Stock insuffisant pour ${medicament.nom}. Disponible : ${totalDisponible}, demandé : ${quantite}.`
                );
              }

              /*
               * Pour simplifier la ligne de
               * dispensation, on choisit le
               * premier lot suffisamment fourni.
               *
               * Si aucun lot individuel ne suffit,
               * on prend le premier lot disponible.
               */

              stock =
                stocks.find(
                  (item) =>
                    item.quantite >=
                    quantite
                ) ??
                stocks[0];

              if (!stock) {
                throw new Error(
                  `Aucun stock disponible pour ${medicament.nom}.`
                );
              }

              /*
               * Si le premier lot n'est pas
               * suffisant mais que plusieurs lots
               * pourraient couvrir la quantité,
               * nous refusons ici afin de garder
               * une ligne = un lot.
               */
              if (
                stock.quantite <
                quantite
              ) {
                throw new Error(
                  `La quantité demandée pour ${medicament.nom} nécessite plusieurs lots. Sélectionnez un lot disposant de la quantité demandée.`
                );
              }
            }

            /* ================================================
               DIMINUTION DU STOCK
            ================================================= */

            await tx.stockMedicament.update({
              where: {
                id:
                  stock.id,
              },

              data: {
                quantite: {
                  decrement:
                    quantite,
                },
              },
            });

            /* ================================================
               MOUVEMENT STOCK
            ================================================= */

            await tx.mouvementStock.create({
              data: {
                medicamentId:
                  ligne.medicamentId,

                stockId:
                  stock.id,

                type: "SORTIE",

                quantite,

                motif:
                  "Dispensation pharmacie",

                reference:
                  numero,

                utilisateurId:
                  data.pharmacienId ??
                  null,
              },
            });

            /* ================================================
               PRIX
            ================================================= */

            const prixUnitaire =
              Number(
                ligne.prixUnitaire ??
                  medicament.prixVente ??
                  0
              );

            const montant =
              prixUnitaire *
              quantite;

            lignesFinales.push({
              prescriptionLigneId:
                ligne.prescriptionLigneId ??
                null,

              medicamentId:
                ligne.medicamentId,

              stockId:
                stock.id,

              quantitePrescrite,

              quantiteDispensee:
                quantite,

              prixUnitaire,

              montant,

              observation:
                ligne.observation?.trim() ||
                null,
            });
          }

          /* ==================================================
             CRÉATION DISPENSATION
          ================================================== */

          const dispensation =
            await tx.dispensation.create({
              data: {
                numero,

                patientId:
                  data.patientId,

                prescriptionId:
                  data.prescriptionId ??
                  null,

                pharmacienId:
                  data.pharmacienId ??
                  null,

                statut:
                  "TERMINEE",

                observation:
                  data.observation?.trim() ||
                  null,

                lignes: {
                  create:
                    lignesFinales.map(
                      (ligne) => ({
                        prescriptionLigneId:
                          ligne.prescriptionLigneId,

                        medicamentId:
                          ligne.medicamentId,

                        stockId:
                          ligne.stockId,

                        quantitePrescrite:
                          ligne.quantitePrescrite,

                        quantiteDispensee:
                          ligne.quantiteDispensee,

                        prixUnitaire:
                          ligne.prixUnitaire,

                        montant:
                          ligne.montant,

                        observation:
                          ligne.observation,
                      })
                    ),
                },
              },

              include: {
                patient: true,
                pharmacien: true,

                prescription: {
                  include: {
                    medecin: true,
                  },
                },

                lignes: {
                  include: {
                    medicament: true,
                    stock: true,
                  },
                },
              },
            });

          /* ==================================================
             MISE À JOUR DE L'ORDONNANCE
          ================================================== */

          if (
            prescription
          ) {
            const lignesOrdonnance =
              await tx.prescriptionLigne.findMany({
                where: {
                  prescriptionId:
                    prescription.id,
                },

                include: {
                  dispensationLignes:
                    true,
                },
              });

            let toutesDispensees =
              true;

            let auMoinsUneDispensee =
              false;

            for (
              const ligne of lignesOrdonnance
            ) {
              const prescrite =
                Number(
                  ligne.quantite
                );

              const dispensee =
                ligne.dispensationLignes.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    Number(
                      item.quantiteDispensee
                    ),
                  0
                );

              if (
                dispensee > 0
              ) {
                auMoinsUneDispensee =
                  true;
              }

              if (
                dispensee <
                prescrite
              ) {
                toutesDispensees =
                  false;
              }
            }

            let statut =
              "ACTIVE";

            if (
              toutesDispensees
            ) {
              statut =
                "DISPENSEE";
            } else if (
              auMoinsUneDispensee
            ) {
              statut =
                "PARTIELLE";
            }

            await tx.prescription.update({
              where: {
                id:
                  prescription.id,
              },

              data: {
                statut,
              },
            });
          }

          return dispensation;
        }
      );

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath(
      "/pharmacie/dispensations"
    );

    revalidatePath(
      "/pharmacie/ordonnances"
    );

    revalidatePath(
      "/pharmacie/stocks"
    );

    revalidatePath(
      "/pharmacie/mouvements"
    );

    revalidatePath(
      "/pharmacie/medicaments"
    );

    return {
      success: true,
      message:
        "Dispensation effectuée avec succès. Le stock a été mis à jour.",
      data: result,
    };
  } catch (error) {
    console.error(
      "Erreur createDispensation:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'effectuer la dispensation.",
    };
  }
}

/* ==========================================================
   ANNULER UNE DISPENSATION
========================================================== */

export async function annulerDispensation(
  id: number
): Promise<ActionResult> {
  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          const dispensation =
            await tx.dispensation.findUnique({
              where: {
                id,
              },

              include: {
                lignes: true,
              },
            });

          if (!dispensation) {
            throw new Error(
              "Dispensation introuvable."
            );
          }

          if (
            dispensation.statut ===
            "ANNULEE"
          ) {
            throw new Error(
              "Cette dispensation est déjà annulée."
            );
          }

          /*
           * RESTITUTION DU STOCK
           */

          for (
            const ligne of dispensation.lignes
          ) {
            if (
              ligne.stockId
            ) {
              await tx.stockMedicament.update({
                where: {
                  id:
                    ligne.stockId,
                },

                data: {
                  quantite: {
                    increment:
                      ligne.quantiteDispensee,
                  },
                },
              });

              await tx.mouvementStock.create({
                data: {
                  medicamentId:
                    ligne.medicamentId,

                  stockId:
                    ligne.stockId,

                  type: "RETOUR",

                  quantite:
                    ligne.quantiteDispensee,

                  motif:
                    "Annulation de dispensation",

                  reference:
                    dispensation.numero,

                  utilisateurId:
                    dispensation.pharmacienId,
                },
              });
            }
          }

          /*
           * ANNULATION
           */

          const updated =
            await tx.dispensation.update({
              where: {
                id,
              },

              data: {
                statut:
                  "ANNULEE",
              },
            });

          /*
           * RECALCUL ORDONNANCE
           */

          if (
            dispensation.prescriptionId
          ) {
            const prescription =
              await tx.prescription.findUnique({
                where: {
                  id:
                    dispensation.prescriptionId,
                },

                include: {
                  lignes: {
                    include: {
                      dispensationLignes:
                        true,
                    },
                  },
                },
              });

            if (
              prescription
            ) {
              let toutesDispensees =
                true;

              let auMoinsUne =
                false;

              for (
                const ligne of prescription.lignes
              ) {
                const prescrite =
                  Number(
                    ligne.quantite
                  );

                const dispensee =
                  ligne.dispensationLignes
                    .filter(
                      (item) =>
                        item.dispensationId !==
                        dispensation.id
                    )
                    .reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        Number(
                          item.quantiteDispensee
                        ),
                      0
                    );

                if (
                  dispensee > 0
                ) {
                  auMoinsUne =
                    true;
                }

                if (
                  dispensee <
                  prescrite
                ) {
                  toutesDispensees =
                    false;
                }
              }

              let statut =
                "ACTIVE";

              if (
                toutesDispensees
              ) {
                statut =
                  "DISPENSEE";
              } else if (
                auMoinsUne
              ) {
                statut =
                  "PARTIELLE";
              }

              await tx.prescription.update({
                where: {
                  id:
                    prescription.id,
                },

                data: {
                  statut,
                },
              });
            }
          }

          return updated;
        }
      );

    revalidatePath(
      "/pharmacie/dispensations"
    );

    revalidatePath(
      "/pharmacie/ordonnances"
    );

    revalidatePath(
      "/pharmacie/stocks"
    );

    revalidatePath(
      "/pharmacie/mouvements"
    );

    return {
      success: true,
      message:
        "Dispensation annulée et stock restitué.",
      data: result,
    };
  } catch (error) {
    console.error(
      "Erreur annulerDispensation:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'annuler la dispensation.",
    };
  }
}