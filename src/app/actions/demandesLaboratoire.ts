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
   LISTE DES DEMANDES
========================================================== */

export async function getDemandesLaboratoire(): Promise<ActionResult> {
  try {
    const demandes = await prisma.demandeLaboratoire.findMany({
      orderBy: {
        dateDemande: "desc",
      },

      include: {
        patient: true,
        consultation: true,
        service: true,

        lignes: {
          include: {
            examen: true,
          },
        },

        resultats: {
          include: {
            examen: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Demandes de laboratoire récupérées.",
      data: demandes,
    };
  } catch (error) {
    console.error("GET DEMANDES LABORATOIRE:", error);

    return {
      success: false,
      message: "Impossible de récupérer les demandes.",
      data: [],
    };
  }
}

/* ==========================================================
   DEMANDE PAR ID
========================================================== */

export async function getDemandeLaboratoireById(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const demande = await prisma.demandeLaboratoire.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,
        consultation: true,
        service: true,

        lignes: {
          include: {
            examen: true,
          },
        },

        resultats: {
          include: {
            examen: true,
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
      message: "Demande récupérée.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "GET DEMANDE LABORATOIRE BY ID:",
      error
    );

    return {
      success: false,
      message: "Impossible de récupérer la demande.",
    };
  }
}

/* ==========================================================
   GÉNÉRER NUMÉRO
========================================================== */

async function generateNumeroDemande(): Promise<string> {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const prefix = `LAB-${year}${month}`;

  const derniere =
    await prisma.demandeLaboratoire.findFirst({
      where: {
        numero: {
          startsWith: prefix,
        },
      },

      orderBy: {
        id: "desc",
      },
    });

  let sequence = 1;

  if (derniere) {
    const partie = derniere.numero.split("-").pop();

    const dernierNumero = Number(partie);

    if (!Number.isNaN(dernierNumero)) {
      sequence = dernierNumero + 1;
    }
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/* ==========================================================
   CRÉER UNE DEMANDE
========================================================== */

export async function createDemandeLaboratoire(data: {
  patientId: number;
  consultationId?: number;
  serviceId?: number;

  urgence?: boolean;
  observation?: string;

  examens: {
    examenId: number;
  }[];
}): Promise<ActionResult> {
  try {
    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    if (
      !data.examens ||
      data.examens.length === 0
    ) {
      return {
        success: false,
        message:
          "Veuillez sélectionner au moins un examen.",
      };
    }

    /* ------------------------------------------------------
       PATIENT
    ------------------------------------------------------ */

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LES EXAMENS
    ------------------------------------------------------ */

    const examenIds = [
      ...new Set(
        data.examens.map(
          (examen) => examen.examenId
        )
      ),
    ];

    const examens =
      await prisma.examenLaboratoire.findMany({
        where: {
          id: {
            in: examenIds,
          },

          actif: true,
        },
      });

    if (
      examens.length !==
      examenIds.length
    ) {
      return {
        success: false,
        message:
          "Un ou plusieurs examens sélectionnés sont invalides ou désactivés.",
      };
    }

    /* ------------------------------------------------------
       NUMÉRO
    ------------------------------------------------------ */

    const numero =
      await generateNumeroDemande();

    /* ------------------------------------------------------
       CRÉATION TRANSACTIONNELLE
    ------------------------------------------------------ */

    const demande =
      await prisma.$transaction(
        async (tx) => {
          const nouvelleDemande =
            await tx.demandeLaboratoire.create({
              data: {
                numero,

                patientId:
                  data.patientId,

                consultationId:
                  data.consultationId ||
                  null,

                serviceId:
                  data.serviceId ||
                  null,

                urgence:
                  data.urgence ?? false,

                observation:
                  data.observation?.trim() ||
                  null,

                statut: "DEMANDE",

                lignes: {
                  create: examens.map(
                    (examen) => ({
                      examenId:
                        examen.id,

                      prix:
                        examen.prix,
                    })
                  ),
                },
              },

              include: {
                patient: true,

                lignes: {
                  include: {
                    examen: true,
                  },
                },
              },
            });

          return nouvelleDemande;
        }
      );

    return {
      success: true,
      message:
        "Demande de laboratoire créée avec succès.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "CREATE DEMANDE LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de créer la demande de laboratoire.",
    };
  }
}

/* ==========================================================
   CHANGER LE STATUT
========================================================== */

export async function updateStatutDemandeLaboratoire(
  id: number,
  statut: string
): Promise<ActionResult> {
  try {
    const statutsAutorises = [
      "DEMANDE",
      "EN_COURS",
      "TERMINEE",
      "VALIDEE",
      "ANNULEE",
    ];

    if (!statutsAutorises.includes(statut)) {
      return {
        success: false,
        message: "Statut de laboratoire invalide.",
      };
    }

    const demande =
      await prisma.demandeLaboratoire.findUnique({
        where: {
          id,
        },
      });

    if (!demande) {
      return {
        success: false,
        message: "Demande introuvable.",
      };
    }

    const updated =
      await prisma.demandeLaboratoire.update({
        where: {
          id,
        },

        data: {
          statut,
        },
      });

    return {
      success: true,
      message: "Statut de la demande mis à jour.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "UPDATE STATUT DEMANDE LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut.",
    };
  }
}

/* ==========================================================
   ANNULER
========================================================== */

export async function annulerDemandeLaboratoire(
  id: number
): Promise<ActionResult> {
  try {
    const demande =
      await prisma.demandeLaboratoire.findUnique({
        where: {
          id,
        },

        include: {
          resultats: true,
        },
      });

    if (!demande) {
      return {
        success: false,
        message: "Demande introuvable.",
      };
    }

    if (demande.resultats.length > 0) {
      return {
        success: false,
        message:
          "Cette demande possède déjà des résultats et ne peut plus être annulée.",
      };
    }

    const updated =
      await prisma.demandeLaboratoire.update({
        where: {
          id,
        },

        data: {
          statut: "ANNULEE",
        },
      });

    return {
      success: true,
      message: "Demande annulée.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "ANNULER DEMANDE LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'annuler la demande.",
    };
  }
}

/* ==========================================================
   SUPPRIMER
========================================================== */

export async function deleteDemandeLaboratoire(
  id: number
): Promise<ActionResult> {
  try {
    const demande =
      await prisma.demandeLaboratoire.findUnique({
        where: {
          id,
        },

        include: {
          resultats: true,
        },
      });

    if (!demande) {
      return {
        success: false,
        message: "Demande introuvable.",
      };
    }

    if (demande.resultats.length > 0) {
      return {
        success: false,
        message:
          "Cette demande possède des résultats. Elle ne peut pas être supprimée.",
      };
    }

    await prisma.demandeLaboratoire.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        "Demande supprimée avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE DEMANDE LABORATOIRE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la demande.",
    };
  }
}