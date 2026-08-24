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
   RÉCUPÉRER LES RÉSULTATS D'UNE DEMANDE
========================================================== */

export async function getResultatsLaboratoire(
  demandeId: number
): Promise<ActionResult> {
  try {
    if (!demandeId || Number.isNaN(demandeId)) {
      return {
        success: false,
        message: "Identifiant de demande invalide.",
      };
    }

    const demande =
      await prisma.demandeLaboratoire.findUnique({
        where: {
          id: demandeId,
        },

        include: {
          patient: true,

          lignes: {
            include: {
              examen: true,
            },
          },

          resultats: {
            include: {
              examen: true,
            },

            orderBy: {
              dateResultat: "asc",
            },
          },
        },
      });

    if (!demande) {
      return {
        success: false,
        message: "Demande de laboratoire introuvable.",
      };
    }

    return {
      success: true,
      message: "Résultats récupérés.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "GET RESULTATS LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les résultats.",
    };
  }
}

/* ==========================================================
   ENREGISTRER LES RÉSULTATS
========================================================== */

export async function saveResultatsLaboratoire(
  demandeId: number,
  resultats: {
    examenId: number;
    valeur?: string;
    unite?: string;
    commentaire?: string;
    interpretation?: string;
  }[]
): Promise<ActionResult> {
  try {
    if (!demandeId || Number.isNaN(demandeId)) {
      return {
        success: false,
        message: "Identifiant de demande invalide.",
      };
    }

    if (!resultats || resultats.length === 0) {
      return {
        success: false,
        message:
          "Aucun résultat à enregistrer.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LA DEMANDE
    ------------------------------------------------------ */

    const demande =
      await prisma.demandeLaboratoire.findUnique({
        where: {
          id: demandeId,
        },

        include: {
          lignes: true,
        },
      });

    if (!demande) {
      return {
        success: false,
        message:
          "Demande de laboratoire introuvable.",
      };
    }

    if (demande.statut === "ANNULEE") {
      return {
        success: false,
        message:
          "Cette demande est annulée.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LES EXAMENS
    ------------------------------------------------------ */

    const examensAutorises =
      new Set(
        demande.lignes.map(
          (ligne) => ligne.examenId
        )
      );

    for (const resultat of resultats) {
      if (
        !examensAutorises.has(
          resultat.examenId
        )
      ) {
        return {
          success: false,
          message:
            "Un résultat concerne un examen qui ne fait pas partie de cette demande.",
        };
      }
    }

    /* ------------------------------------------------------
       ENREGISTREMENT
    ------------------------------------------------------ */

    const saved =
      await prisma.$transaction(
        async (tx) => {
          const resultatsCrees = [];

          for (const resultat of resultats) {
            const valeur =
              resultat.valeur?.trim() || null;

            const unite =
              resultat.unite?.trim() || null;

            const commentaire =
              resultat.commentaire?.trim() ||
              null;

            const interpretation =
              resultat.interpretation
                ?.trim() || null;

            const existing =
              await tx.resultatLaboratoire.findFirst(
                {
                  where: {
                    demandeId,
                    examenId:
                      resultat.examenId,
                  },
                }
              );

            if (existing) {
              const updated =
                await tx.resultatLaboratoire.update(
                  {
                    where: {
                      id: existing.id,
                    },

                    data: {
                      valeur,
                      unite,
                      commentaire,
                      interpretation,
                      valide: false,
                      dateResultat:
                        new Date(),
                    },

                    include: {
                      examen: true,
                    },
                  }
                );

              resultatsCrees.push(
                updated
              );
            } else {
              const created =
                await tx.resultatLaboratoire.create(
                  {
                    data: {
                      demandeId,
                      examenId:
                        resultat.examenId,

                      valeur,
                      unite,
                      commentaire,
                      interpretation,

                      valide: false,
                    },

                    include: {
                      examen: true,
                    },
                  }
                );

              resultatsCrees.push(
                created
              );
            }
          }

          await tx.demandeLaboratoire.update(
            {
              where: {
                id: demandeId,
              },

              data: {
                statut: "EN_COURS",
              },
            }
          );

          return resultatsCrees;
        }
      );

    return {
      success: true,
      message:
        "Résultats enregistrés avec succès.",
      data: saved,
    };
  } catch (error) {
    console.error(
      "SAVE RESULTATS LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'enregistrer les résultats.",
    };
  }
}

/* ==========================================================
   VALIDER UN RÉSULTAT
========================================================== */

export async function validerResultatLaboratoire(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const resultat =
      await prisma.resultatLaboratoire.findUnique(
        {
          where: {
            id,
          },

          include: {
            demande: true,
          },
        }
      );

    if (!resultat) {
      return {
        success: false,
        message: "Résultat introuvable.",
      };
    }

    if (!resultat.valeur?.trim()) {
      return {
        success: false,
        message:
          "Impossible de valider un résultat vide.",
      };
    }

    if (
      resultat.demande.statut ===
      "ANNULEE"
    ) {
      return {
        success: false,
        message:
          "La demande est annulée.",
      };
    }

    const updated =
      await prisma.resultatLaboratoire.update(
        {
          where: {
            id,
          },

          data: {
            valide: true,
          },

          include: {
            examen: true,
          },
        }
      );

    /* ------------------------------------------------------
       VÉRIFIER SI TOUS LES RÉSULTATS SONT VALIDÉS
    ------------------------------------------------------ */

    const resultats =
      await prisma.resultatLaboratoire.findMany(
        {
          where: {
            demandeId:
              resultat.demandeId,
          },
        }
      );

    const tousValides =
      resultats.length > 0 &&
      resultats.every(
        (item) => item.valide
      );

    if (tousValides) {
      await prisma.demandeLaboratoire.update(
        {
          where: {
            id: resultat.demandeId,
          },

          data: {
            statut: "VALIDEE",
          },
        }
      );
    }

    return {
      success: true,
      message:
        "Résultat validé avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "VALIDER RESULTAT LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de valider le résultat.",
    };
  }
}

/* ==========================================================
   VALIDER TOUS LES RÉSULTATS
========================================================== */

export async function validerTousLesResultats(
  demandeId: number
): Promise<ActionResult> {
  try {
    if (!demandeId || Number.isNaN(demandeId)) {
      return {
        success: false,
        message:
          "Identifiant de demande invalide.",
      };
    }

    const demande =
      await prisma.demandeLaboratoire.findUnique(
        {
          where: {
            id: demandeId,
          },

          include: {
            lignes: true,
            resultats: true,
          },
        }
      );

    if (!demande) {
      return {
        success: false,
        message:
          "Demande introuvable.",
      };
    }

    if (demande.statut === "ANNULEE") {
      return {
        success: false,
        message:
          "Cette demande est annulée.",
      };
    }

    if (
      demande.resultats.length === 0
    ) {
      return {
        success: false,
        message:
          "Aucun résultat à valider.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER QUE TOUS LES EXAMENS ONT UN RÉSULTAT
    ------------------------------------------------------ */

    const examensAvecResultat =
      new Set(
        demande.resultats.map(
          (resultat) =>
            resultat.examenId
        )
      );

    const examensManquants =
      demande.lignes.filter(
        (ligne) =>
          !examensAvecResultat.has(
            ligne.examenId
          )
      );

    if (
      examensManquants.length > 0
    ) {
      return {
        success: false,
        message:
          "Tous les examens de la demande ne possèdent pas encore de résultat.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LES VALEURS
    ------------------------------------------------------ */

    const resultatsVides =
      demande.resultats.filter(
        (resultat) =>
          !resultat.valeur?.trim()
      );

    if (resultatsVides.length > 0) {
      return {
        success: false,
        message:
          "Certains résultats sont encore vides.",
      };
    }

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    await prisma.$transaction([
      prisma.resultatLaboratoire.updateMany({
        where: {
          demandeId,
        },

        data: {
          valide: true,
        },
      }),

      prisma.demandeLaboratoire.update({
        where: {
          id: demandeId,
        },

        data: {
          statut: "VALIDEE",
        },
      }),
    ]);

    return {
      success: true,
      message:
        "Tous les résultats ont été validés.",
    };
  } catch (error) {
    console.error(
      "VALIDER TOUS RESULTATS:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de valider les résultats.",
    };
  }
}