"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPES
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   PATH
========================================================== */

const PATH = "/hospitalisation/sorties";

/* ==========================================================
   LISTE DES SORTIES
========================================================== */

export async function getSorties(): Promise<ActionResult> {
  try {
    const sorties = await prisma.sortie.findMany({
      orderBy: {
        dateSortie: "desc",
      },

      include: {
        patient: {
          select: {
            id: true,
            numeroDossier: true,
            nom: true,
            postNom: true,
            prenom: true,
          },
        },

        hospitalisation: {
          select: {
            id: true,
            numero: true,

            service: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: "Sorties récupérées avec succès.",
      data: sorties,
    };
  } catch (error) {
    console.error("getSorties :", error);

    return {
      success: false,
      message: "Impossible de récupérer les sorties.",
    };
  }
}

/* ==========================================================
   DETAIL D'UNE SORTIE
========================================================== */

export async function getSortie(
  id: number | string
): Promise<ActionResult> {
  try {
    const sortieId = Number(id);

    if (!sortieId || Number.isNaN(sortieId)) {
      return {
        success: false,
        message: "Identifiant de sortie invalide.",
      };
    }

    const sortie = await prisma.sortie.findUnique({
      where: {
        id: sortieId,
      },

      include: {
        patient: true,

        hospitalisation: {
          include: {
            service: true,
            medecin: true,
            lit: {
              include: {
                chambre: true,
              },
            },
          },
        },
      },
    });

    if (!sortie) {
      return {
        success: false,
        message: "Sortie introuvable.",
      };
    }

    return {
      success: true,
      message: "Sortie récupérée avec succès.",
      data: sortie,
    };
  } catch (error) {
    console.error("getSortie :", error);

    return {
      success: false,
      message: "Impossible de récupérer la sortie.",
    };
  }
}

/* ==========================================================
   HOSPITALISATIONS DISPONIBLES POUR UNE SORTIE
========================================================== */

export async function getHospitalisationsPourSortie(): Promise<ActionResult> {
  try {
    const hospitalisations =
      await prisma.hospitalisation.findMany({
        where: {
          statut: "EN_COURS",

          sorties: {
            none: {},
          },
        },

        orderBy: {
          dateEntree: "desc",
        },

        include: {
          patient: {
            select: {
              id: true,
              numeroDossier: true,
              nom: true,
              postNom: true,
              prenom: true,
            },
          },

          service: {
            select: {
              id: true,
              nom: true,
            },
          },

          lit: {
            include: {
              chambre: true,
            },
          },
        },
      });

    return {
      success: true,
      message: "Hospitalisations récupérées.",
      data: hospitalisations,
    };
  } catch (error) {
    console.error(
      "getHospitalisationsPourSortie :",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les hospitalisations.",
    };
  }
}

/* ==========================================================
   CREER UNE SORTIE
========================================================== */

export async function createSortie(data: {
  hospitalisationId: number | string;
  type: string;
  motif?: string | null;
  diagnosticFinal?: string | null;
  recommandation?: string | null;
  traitement?: string | null;
  dateSortie?: Date | string;
}): Promise<ActionResult> {
  try {
    const hospitalisationId = Number(
      data.hospitalisationId
    );

    if (
      !hospitalisationId ||
      Number.isNaN(hospitalisationId)
    ) {
      return {
        success: false,
        message:
          "L'hospitalisation sélectionnée est invalide.",
      };
    }

    /* ------------------------------------------------------
       Vérifier l'hospitalisation
    ------------------------------------------------------ */

    const hospitalisation =
      await prisma.hospitalisation.findUnique({
        where: {
          id: hospitalisationId,
        },

        include: {
          patient: true,
        },
      });

    if (!hospitalisation) {
      return {
        success: false,
        message: "Hospitalisation introuvable.",
      };
    }

    /* ------------------------------------------------------
       Vérifier qu'elle est encore en cours
    ------------------------------------------------------ */

    if (hospitalisation.statut !== "EN_COURS") {
      return {
        success: false,
        message:
          "Cette hospitalisation n'est plus en cours.",
      };
    }

    /* ------------------------------------------------------
       Vérifier qu'il n'existe pas déjà une sortie
    ------------------------------------------------------ */

    const sortieExistante =
      await prisma.sortie.findFirst({
        where: {
          hospitalisationId,
        },
      });

    if (sortieExistante) {
      return {
        success: false,
        message:
          "Une sortie existe déjà pour cette hospitalisation.",
      };
    }

    /* ------------------------------------------------------
       Date
    ------------------------------------------------------ */

    const dateSortie = data.dateSortie
      ? new Date(data.dateSortie)
      : new Date();

    if (Number.isNaN(dateSortie.getTime())) {
      return {
        success: false,
        message: "La date de sortie est invalide.",
      };
    }

    /* ------------------------------------------------------
       Transaction
    ------------------------------------------------------ */

    const sortie = await prisma.$transaction(
      async (tx) => {
        const nouvelleSortie =
          await tx.sortie.create({
            data: {
              patientId:
                hospitalisation.patientId,

              hospitalisationId,

              type: data.type,

              motif: data.motif ?? null,

              diagnosticFinal:
                data.diagnosticFinal ?? null,

              recommandation:
                data.recommandation ?? null,

              traitement:
                data.traitement ?? null,

              dateSortie,
            },

            include: {
              patient: true,
              hospitalisation: {
                include: {
                  service: true,
                  lit: {
                    include: {
                      chambre: true,
                    },
                  },
                },
              },
            },
          });

        /* -----------------------------------------------
           Mettre l'hospitalisation à jour
        ------------------------------------------------ */

        await tx.hospitalisation.update({
          where: {
            id: hospitalisationId,
          },

          data: {
            statut: "TERMINEE",
            dateSortie,
          },
        });

        /* -----------------------------------------------
           Libérer le lit
        ------------------------------------------------ */

        if (hospitalisation.litId) {
          await tx.lit.update({
            where: {
              id: hospitalisation.litId,
            },

            data: {
              statut: "LIBRE",
            },
          });
        }

        return nouvelleSortie;
      }
    );

    revalidatePath(PATH);
    revalidatePath("/hospitalisation");
    revalidatePath("/hospitalisation/hospitalisations");

    return {
      success: true,
      message: "Sortie enregistrée avec succès.",
      data: sortie,
    };
  } catch (error) {
    console.error("createSortie :", error);

    return {
      success: false,
      message:
        "Impossible d'enregistrer la sortie.",
    };
  }
}

/* ==========================================================
   MODIFIER UNE SORTIE
========================================================== */

export async function updateSortie(
  id: number | string,
  data: {
    type: string;
    motif?: string | null;
    diagnosticFinal?: string | null;
    recommandation?: string | null;
    traitement?: string | null;
    dateSortie?: Date | string;
  }
): Promise<ActionResult> {
  try {
    const sortieId = Number(id);

    if (!sortieId || Number.isNaN(sortieId)) {
      return {
        success: false,
        message: "Identifiant de sortie invalide.",
      };
    }

    /* ------------------------------------------------------
       Vérifier la sortie
    ------------------------------------------------------ */

    const sortieExistante =
      await prisma.sortie.findUnique({
        where: {
          id: sortieId,
        },
      });

    if (!sortieExistante) {
      return {
        success: false,
        message: "Sortie introuvable.",
      };
    }

    /* ------------------------------------------------------
       Date
    ------------------------------------------------------ */

    let dateSortie = sortieExistante.dateSortie;

    if (data.dateSortie) {
      const nouvelleDate = new Date(
        data.dateSortie
      );

      if (Number.isNaN(nouvelleDate.getTime())) {
        return {
          success: false,
          message: "La date de sortie est invalide.",
        };
      }

      dateSortie = nouvelleDate;
    }

    /* ------------------------------------------------------
       Modification
    ------------------------------------------------------ */

    const sortie = await prisma.sortie.update({
      where: {
        id: sortieId,
      },

      data: {
        type: data.type,

        motif: data.motif ?? null,

        diagnosticFinal:
          data.diagnosticFinal ?? null,

        recommandation:
          data.recommandation ?? null,

        traitement:
          data.traitement ?? null,

        dateSortie,
      },

      include: {
        patient: true,

        hospitalisation: {
          include: {
            service: true,
            lit: {
              include: {
                chambre: true,
              },
            },
          },
        },
      },
    });

    /* ------------------------------------------------------
       Synchroniser l'hospitalisation
    ------------------------------------------------------ */

    if (sortie.hospitalisationId) {
      await prisma.hospitalisation.update({
        where: {
          id: sortie.hospitalisationId,
        },

        data: {
          dateSortie,
        },
      });
    }

    revalidatePath(PATH);

    return {
      success: true,
      message: "Sortie modifiée avec succès.",
      data: sortie,
    };
  } catch (error) {
    console.error("updateSortie :", error);

    return {
      success: false,
      message:
        "Impossible de modifier la sortie.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UNE SORTIE
========================================================== */

export async function deleteSortie(
  id: number | string
): Promise<ActionResult> {
  try {
    const sortieId = Number(id);

    if (!sortieId || Number.isNaN(sortieId)) {
      return {
        success: false,
        message: "Identifiant de sortie invalide.",
      };
    }

    const sortie =
      await prisma.sortie.findUnique({
        where: {
          id: sortieId,
        },
      });

    if (!sortie) {
      return {
        success: false,
        message: "Sortie introuvable.",
      };
    }

    await prisma.$transaction(async (tx) => {
      /* -----------------------------------------------
         Supprimer la sortie
      ------------------------------------------------ */

      await tx.sortie.delete({
        where: {
          id: sortieId,
        },
      });

      /* -----------------------------------------------
         Remettre l'hospitalisation EN_COURS
      ------------------------------------------------ */

      if (sortie.hospitalisationId) {
        await tx.hospitalisation.update({
          where: {
            id: sortie.hospitalisationId,
          },

          data: {
            statut: "EN_COURS",
            dateSortie: null,
          },
        });

        /* ---------------------------------------------
           Remettre le lit OCCUPE
        --------------------------------------------- */

        const hospitalisation =
          await tx.hospitalisation.findUnique({
            where: {
              id: sortie.hospitalisationId,
            },

            select: {
              litId: true,
            },
          });

        if (hospitalisation?.litId) {
          await tx.lit.update({
            where: {
              id: hospitalisation.litId,
            },

            data: {
              statut: "OCCUPE",
            },
          });
        }
      }
    });

    revalidatePath(PATH);
    revalidatePath("/hospitalisation");
    revalidatePath("/hospitalisation/hospitalisations");

    return {
      success: true,
      message: "Sortie supprimée avec succès.",
    };
  } catch (error) {
    console.error("deleteSortie :", error);

    return {
      success: false,
      message:
        "Impossible de supprimer la sortie.",
    };
  }
}