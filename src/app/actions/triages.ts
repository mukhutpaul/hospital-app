"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =========================================================
   TYPES
========================================================= */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* =========================================================
   UTILITAIRE
========================================================= */

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

/* =========================================================
   LISTE DES TRIAGES
========================================================= */

export async function getTriages(): Promise<ActionResult> {
  try {
    const triages = await prisma.triage.findMany({
      orderBy: {
        dateTriage: "desc",
      },

      include: {
        admission: {
          include: {
            patient: {
              select: {
                id: true,
                numeroDossier: true,
                nom: true,
                postNom: true,
                prenom: true,
                sexe: true,
              },
            },

            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            constantes: {
              orderBy: {
                dateMesure: "desc",
              },

              take: 1,
            },
          },
        },
      },
    });

    return {
      success: true,
      message: "Triages récupérés avec succès.",
      data: triages,
    };
  } catch (error) {
    console.error("❌ getTriages:", error);

    return {
      success: false,
      message: "Erreur lors du chargement des triages.",
      data: [],
    };
  }
}

/* =========================================================
   TRIAGE PAR ID
========================================================= */

export async function getTriageById(
  id: number,
): Promise<ActionResult> {
  try {
    const triageId = Number(id);

    if (!Number.isInteger(triageId) || triageId <= 0) {
      return {
        success: false,
        message: "Identifiant du triage invalide.",
      };
    }

    const triage = await prisma.triage.findUnique({
      where: {
        id: triageId,
      },

      include: {
        admission: {
          include: {
            patient: true,

            service: true,

            constantes: {
              orderBy: {
                dateMesure: "desc",
              },
            },

            rendezVous: true,
          },
        },
      },
    });

    if (!triage) {
      return {
        success: false,
        message: "Triage introuvable.",
      };
    }

    return {
      success: true,
      message: "Triage récupéré avec succès.",
      data: triage,
    };
  } catch (error) {
    console.error("❌ getTriageById:", error);

    return {
      success: false,
      message: "Erreur lors du chargement du triage.",
    };
  }
}

/* =========================================================
   ADMISSIONS DISPONIBLES POUR TRIAGE
========================================================= */

export async function getAdmissionsPourTriage(): Promise<ActionResult> {
  try {
    const admissions = await prisma.admission.findMany({
      where: {
        triage: null,

        statut: {
          not: "ANNULEE",
        },
      },

      orderBy: {
        dateAdmission: "desc",
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
          },
        },

        service: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        constantes: {
          orderBy: {
            dateMesure: "desc",
          },

          take: 1,
        },
      },
    });

    return {
      success: true,
      message: "Admissions disponibles récupérées.",
      data: admissions,
    };
  } catch (error) {
    console.error("❌ getAdmissionsPourTriage:", error);

    return {
      success: false,
      message:
        "Erreur lors du chargement des admissions disponibles.",
      data: [],
    };
  }
}

/* =========================================================
   ADMISSION POUR MODIFICATION
========================================================= */

export async function getAdmissionAvecTriage(
  admissionId: number,
): Promise<ActionResult> {
  try {
    const id = Number(admissionId);

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant d'admission invalide.",
      };
    }

    const admission = await prisma.admission.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,

        service: true,

        triage: true,

        constantes: {
          orderBy: {
            dateMesure: "desc",
          },

          take: 1,
        },
      },
    });

    if (!admission) {
      return {
        success: false,
        message: "Admission introuvable.",
      };
    }

    return {
      success: true,
      message: "Admission récupérée.",
      data: admission,
    };
  } catch (error) {
    console.error("❌ getAdmissionAvecTriage:", error);

    return {
      success: false,
      message: "Erreur lors du chargement de l'admission.",
    };
  }
}

/* =========================================================
   CRÉER TRIAGE
========================================================= */

export async function createTriage(input: {
  admissionId: number;
  niveauUrgence?: string | null;
  motif?: string | null;
  observation?: string | null;

  constantes?: {
    temperature?: number | null;
    tensionSystolique?: number | null;
    tensionDiastolique?: number | null;
    pouls?: number | null;
    saturation?: number | null;
    poids?: number | null;
    taille?: number | null;
    frequenceRespiratoire?: number | null;
    glycemie?: number | null;
  };
}): Promise<ActionResult> {
  try {
    const admissionId = Number(input.admissionId);

    if (!Number.isInteger(admissionId) || admissionId <= 0) {
      return {
        success: false,
        message: "Admission invalide.",
      };
    }

    const admission = await prisma.admission.findUnique({
      where: {
        id: admissionId,
      },

      include: {
        patient: true,
        triage: true,
      },
    });

    if (!admission) {
      return {
        success: false,
        message: "Admission introuvable.",
      };
    }

    if (admission.triage) {
      return {
        success: false,
        message:
          "Cette admission possède déjà un triage.",
      };
    }

    const niveauUrgence =
      input.niveauUrgence?.trim() || "NORMAL";

    const triage = await prisma.$transaction(async (tx) => {
      const nouveauTriage = await tx.triage.create({
        data: {
          admissionId,

          niveauUrgence,

          motif:
            input.motif?.trim() || null,

          observation:
            input.observation?.trim() || null,
        },
      });

      const c = input.constantes;

      if (c) {
        const hasConstantes = Object.values(c).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== "",
        );

        if (hasConstantes) {
          await tx.constante.create({
            data: {
              patientId: admission.patientId,

              admissionId,

              temperature: toNumber(c.temperature),

              tensionSystolique: toNumber(
                c.tensionSystolique,
              ),

              tensionDiastolique: toNumber(
                c.tensionDiastolique,
              ),

              pouls: toNumber(c.pouls),

              saturation: toNumber(c.saturation),

              poids: toNumber(c.poids),

              taille: toNumber(c.taille),

              frequenceRespiratoire: toNumber(
                c.frequenceRespiratoire,
              ),

              glycemie: toNumber(c.glycemie),
            },
          });
        }
      }

      return nouveauTriage;
    });

    revalidatePath("/triages");
    revalidatePath("/admissions");

    return {
      success: true,
      message: "Triage enregistré avec succès.",
      data: triage,
    };
  } catch (error) {
    console.error("❌ createTriage:", error);

    return {
      success: false,
      message: "Erreur lors de la création du triage.",
    };
  }
}

/* =========================================================
   MODIFIER TRIAGE
========================================================= */

export async function updateTriage(
  id: number,
  input: {
    niveauUrgence?: string | null;
    motif?: string | null;
    observation?: string | null;

    constantes?: {
      temperature?: number | null;
      tensionSystolique?: number | null;
      tensionDiastolique?: number | null;
      pouls?: number | null;
      saturation?: number | null;
      poids?: number | null;
      taille?: number | null;
      frequenceRespiratoire?: number | null;
      glycemie?: number | null;
    };
  },
): Promise<ActionResult> {
  try {
    const triageId = Number(id);

    if (!Number.isInteger(triageId) || triageId <= 0) {
      return {
        success: false,
        message: "Identifiant de triage invalide.",
      };
    }

    const triage = await prisma.triage.findUnique({
      where: {
        id: triageId,
      },

      include: {
        admission: true,
      },
    });

    if (!triage) {
      return {
        success: false,
        message: "Triage introuvable.",
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nouveauTriage = await tx.triage.update({
        where: {
          id: triageId,
        },

        data: {
          niveauUrgence:
            input.niveauUrgence?.trim() ||
            "NORMAL",

          motif:
            input.motif?.trim() || null,

          observation:
            input.observation?.trim() || null,
        },
      });

      const c = input.constantes;

      if (c) {
        const constanteExistante =
          await tx.constante.findFirst({
            where: {
              admissionId: triage.admissionId,
            },

            orderBy: {
              dateMesure: "desc",
            },
          });

        const dataConstante = {
          temperature: toNumber(c.temperature),

          tensionSystolique: toNumber(
            c.tensionSystolique,
          ),

          tensionDiastolique: toNumber(
            c.tensionDiastolique,
          ),

          pouls: toNumber(c.pouls),

          saturation: toNumber(c.saturation),

          poids: toNumber(c.poids),

          taille: toNumber(c.taille),

          frequenceRespiratoire: toNumber(
            c.frequenceRespiratoire,
          ),

          glycemie: toNumber(c.glycemie),
        };

        if (constanteExistante) {
          await tx.constante.update({
            where: {
              id: constanteExistante.id,
            },

            data: dataConstante,
          });
        } else {
          await tx.constante.create({
            data: {
              patientId: triage.admission.patientId,

              admissionId: triage.admissionId,

              ...dataConstante,
            },
          });
        }
      }

      return nouveauTriage;
    });

    revalidatePath("/triages");
    revalidatePath(`/triages/${triageId}`);

    return {
      success: true,
      message: "Triage modifié avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error("❌ updateTriage:", error);

    return {
      success: false,
      message: "Erreur lors de la modification du triage.",
    };
  }
}

/* =========================================================
   SUPPRIMER TRIAGE
========================================================= */

export async function deleteTriage(
  id: number,
): Promise<ActionResult> {
  try {
    const triageId = Number(id);

    if (!Number.isInteger(triageId) || triageId <= 0) {
      return {
        success: false,
        message: "Identifiant de triage invalide.",
      };
    }

    const triage = await prisma.triage.findUnique({
      where: {
        id: triageId,
      },
    });

    if (!triage) {
      return {
        success: false,
        message: "Triage introuvable.",
      };
    }

    await prisma.triage.delete({
      where: {
        id: triageId,
      },
    });

    revalidatePath("/triages");

    return {
      success: true,
      message: "Triage supprimé avec succès.",
    };
  } catch (error) {
    console.error("❌ deleteTriage:", error);

    return {
      success: false,
      message: "Erreur lors de la suppression du triage.",
    };
  }
}

/* =========================================================
   STATISTIQUES
========================================================= */

export async function getTriageStats(): Promise<ActionResult> {
  try {
    const [
      total,
      critiques,
      urgents,
      prioritaires,
      normaux,
      admissionsSansTriage,
    ] = await Promise.all([
      prisma.triage.count(),

      prisma.triage.count({
        where: {
          niveauUrgence: "CRITIQUE",
        },
      }),

      prisma.triage.count({
        where: {
          niveauUrgence: "URGENT",
        },
      }),

      prisma.triage.count({
        where: {
          niveauUrgence: "PRIORITAIRE",
        },
      }),

      prisma.triage.count({
        where: {
          niveauUrgence: "NORMAL",
        },
      }),

      prisma.admission.count({
        where: {
          triage: null,
          statut: {
            not: "ANNULEE",
          },
        },
      }),
    ]);

    return {
      success: true,
      message: "Statistiques du triage récupérées.",
      data: {
        total,
        critiques,
        urgents,
        prioritaires,
        normaux,
        admissionsSansTriage,
      },
    };
  } catch (error) {
    console.error("❌ getTriageStats:", error);

    return {
      success: false,
      message: "Erreur lors du chargement des statistiques.",
    };
  }
}