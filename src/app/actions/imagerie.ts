"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPE
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   NUMÉRO
========================================================== */

async function generateNumeroImagerie() {
  const count =
    await prisma.demandeImagerie.count();

  return `IMG-${String(count + 1).padStart(
    6,
    "0",
  )}`;
}

/* ==========================================================
   EXAMENS IMAGERIE
========================================================== */

export async function getExamensImagerie(): Promise<ActionResult> {
  try {
    const examens =
      await prisma.examenImagerie.findMany({
        where: {
          actif: true,
        },

        orderBy: {
          nom: "asc",
        },
      });

    return {
      success: true,
      message: "Examens récupérés.",
      data: examens,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Impossible de récupérer les examens d'imagerie.",
    };
  }
}

/* ==========================================================
   CRÉER DEMANDE
========================================================== */

export async function createDemandeImagerie(
  data: {
    patientId: number;
    consultationId?: number | null;
    serviceId?: number | null;
    examenId: number;
    motif?: string;
    urgence?: boolean;
  },
): Promise<ActionResult> {
  try {
    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    if (!data.examenId) {
      return {
        success: false,
        message:
          "L'examen d'imagerie est obligatoire.",
      };
    }

    const examen =
      await prisma.examenImagerie.findFirst({
        where: {
          id: data.examenId,
          actif: true,
        },
      });

    if (!examen) {
      return {
        success: false,
        message:
          "Examen d'imagerie introuvable.",
      };
    }

    const numero =
      await generateNumeroImagerie();

    const demande =
      await prisma.demandeImagerie.create({
        data: {
          numero,

          patientId:
            data.patientId,

          consultationId:
            data.consultationId ?? null,

          serviceId:
            data.serviceId ?? null,

          examenId:
            data.examenId,

          motif:
            data.motif?.trim() || null,

          urgence:
            data.urgence ?? false,

          statut: "DEMANDE",
        },

        include: {
          patient: true,
          examen: true,
          service: true,
          consultation: {
            include: {
              medecin: true,
            },
          },
        },
      });

    revalidatePath("/imagerie");

    if (data.consultationId) {
      revalidatePath(
        `/consultations/${data.consultationId}`,
      );
    }

    return {
      success: true,
      message: `Demande ${numero} créée avec succès.`,
      data: demande,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Erreur lors de la création de la demande d'imagerie.",
    };
  }
}

/* ==========================================================
   LISTE
========================================================== */

export async function getDemandesImagerie(): Promise<ActionResult> {
  try {
    const demandes =
      await prisma.demandeImagerie.findMany({
        orderBy: {
          dateDemande: "desc",
        },

        include: {
          patient: true,
          examen: true,
          service: true,

          consultation: {
            include: {
              medecin: true,
            },
          },
        },
      });

    return {
      success: true,
      message: "Demandes récupérées.",
      data: demandes,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Impossible de récupérer les demandes d'imagerie.",
    };
  }
}

/* ==========================================================
   DÉTAIL
========================================================== */

export async function getDemandeImagerie(
  id: number,
): Promise<ActionResult> {
  try {
    const demande =
      await prisma.demandeImagerie.findUnique({
        where: {
          id,
        },

        include: {
          patient: true,
          examen: true,
          service: true,

          consultation: {
            include: {
              medecin: true,
              specialite: true,
            },
          },
        },
      });

    if (!demande) {
      return {
        success: false,
        message:
          "Demande d'imagerie introuvable.",
      };
    }

    return {
      success: true,
      message: "Demande récupérée.",
      data: demande,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Erreur lors du chargement.",
    };
  }
}

/* ==========================================================
   ENREGISTRER LE COMPTE RENDU
========================================================== */

export async function updateCompteRenduImagerie(
  id: number,
  data: {
    dateExamen?: string;
    compteRendu?: string;
    conclusion?: string;
    fichier?: string;
  },
): Promise<ActionResult> {
  try {
    const demande =
      await prisma.demandeImagerie.update({
        where: {
          id,
        },

        data: {
          dateExamen: data.dateExamen
            ? new Date(data.dateExamen)
            : undefined,

          compteRendu:
            data.compteRendu?.trim() ||
            null,

          conclusion:
            data.conclusion?.trim() ||
            null,

          fichier:
            data.fichier?.trim() ||
            null,

          statut: "TERMINE",
        },

        include: {
          patient: true,
          examen: true,
          consultation: true,
        },
      });

    revalidatePath("/imagerie");

    revalidatePath(
      `/imagerie/${id}`,
    );

    if (demande.consultationId) {
      revalidatePath(
        `/consultations/${demande.consultationId}`,
      );
    }

    return {
      success: true,
      message:
        "Compte rendu d'imagerie enregistré.",
      data: demande,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Impossible d'enregistrer le compte rendu.",
    };
  }
}