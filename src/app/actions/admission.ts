"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type AdmissionPayload = {
  patientId: number;
  rendezVousId?: number | null;
  serviceId?: number | null;
  type: string;
  motif?: string | null;
  statut?: string;
  dateAdmission?: string | Date;
};

/*
|--------------------------------------------------------------------------
| NUMERO ADMISSION
|--------------------------------------------------------------------------
*/

async function generateAdmissionNumero() {
  const year = new Date().getFullYear();

  const count = await prisma.admission.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00`),
        lt: new Date(`${year + 1}-01-01T00:00:00`),
      },
    },
  });

  const sequence = String(count + 1).padStart(6, "0");

  return `ADM-${year}-${sequence}`;
}

/*
|--------------------------------------------------------------------------
| CREER ADMISSION
|--------------------------------------------------------------------------
*/

export async function createAdmission(
  data: AdmissionPayload
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    if (!data.type) {
      return {
        success: false,
        message: "Le type d'admission est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFIER PATIENT
    |--------------------------------------------------------------------------
    */

    const patient = await prisma.patient.findUnique({
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

    /*
    |--------------------------------------------------------------------------
    | VERIFIER RENDEZ-VOUS
    |--------------------------------------------------------------------------
    */

    if (data.rendezVousId) {
      const rendezVous =
        await prisma.rendezVous.findUnique({
          where: {
            id: data.rendezVousId,
          },
        });

      if (!rendezVous) {
        return {
          success: false,
          message: "Rendez-vous introuvable.",
        };
      }

      /*
      | Un rendez-vous ne doit normalement être
      | associé qu'à une seule admission.
      */

      const admissionExistante =
        await prisma.admission.findUnique({
          where: {
            rendezVousId: data.rendezVousId,
          },
        });

      if (admissionExistante) {
        return {
          success: false,
          message:
            "Ce rendez-vous possède déjà une admission.",
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | NUMERO
    |--------------------------------------------------------------------------
    */

    const numero =
      await generateAdmissionNumero();

    /*
    |--------------------------------------------------------------------------
    | CREATION
    |--------------------------------------------------------------------------
    */

    const admission =
      await prisma.admission.create({
        data: {
          numero,

          patient: {
            connect: {
              id: data.patientId,
            },
          },

          ...(data.rendezVousId
            ? {
                rendezVous: {
                  connect: {
                    id: data.rendezVousId,
                  },
                },
              }
            : {}),

          ...(data.serviceId
            ? {
                service: {
                  connect: {
                    id: data.serviceId,
                  },
                },
              }
            : {}),

          type: data.type,

          motif:
            data.motif?.trim() || null,

          statut:
            data.statut || "EN_ATTENTE",

          dateAdmission:
            data.dateAdmission
              ? new Date(data.dateAdmission)
              : new Date(),

          createdBy: session.user.id
            ? {
                connect: {
                  id: Number(session.user.id),
                },
              }
            : undefined,
        },
      });

    revalidatePath("/admissions");
    revalidatePath("/rendez-vous");

    return {
      success: true,
      message:
        "Admission créée avec succès.",
      data: admission,
    };
  } catch (error) {
    console.error(
      "createAdmission:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de créer l'admission.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MODIFIER ADMISSION
|--------------------------------------------------------------------------
*/

export async function updateAdmission(
  id: number,
  data: AdmissionPayload
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const admission =
      await prisma.admission.findUnique({
        where: { id },
      });

    if (!admission) {
      return {
        success: false,
        message: "Admission introuvable.",
      };
    }

    const updated =
      await prisma.admission.update({
        where: {
          id,
        },

        data: {
          patientId:
            data.patientId,

          serviceId:
            data.serviceId || null,

          type:
            data.type,

          motif:
            data.motif?.trim() || null,

          statut:
            data.statut ||
            admission.statut,

          dateAdmission:
            data.dateAdmission
              ? new Date(data.dateAdmission)
              : admission.dateAdmission,
        },
      });

    revalidatePath("/admissions");
    revalidatePath(`/admissions/${id}`);

    return {
      success: true,
      message:
        "Admission modifiée avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "updateAdmission:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'admission.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| CHANGER STATUT
|--------------------------------------------------------------------------
*/

export async function updateAdmissionStatut(
  id: number,
  statut: string
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const admission =
      await prisma.admission.findUnique({
        where: { id },
      });

    if (!admission) {
      return {
        success: false,
        message: "Admission introuvable.",
      };
    }

    const updated =
      await prisma.admission.update({
        where: {
          id,
        },

        data: {
          statut,

          /*
          | Si admission terminée,
          | on enregistre automatiquement la date de sortie.
          */

          ...(statut === "TERMINEE"
            ? {
                dateSortie:
                  new Date(),
              }
            : {}),
        },
      });

    revalidatePath("/admissions");
    revalidatePath(`/admissions/${id}`);

    return {
      success: true,
      message:
        "Statut de l'admission mis à jour.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "updateAdmissionStatut:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER
|--------------------------------------------------------------------------
*/

export async function deleteAdmission(
  id: number
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const admission =
      await prisma.admission.findUnique({
        where: { id },
        include: {
          consultation: true,
          hospitalisation: true,
          triage: true,
        },
      });

    if (!admission) {
      return {
        success: false,
        message: "Admission introuvable.",
      };
    }

    /*
    | On évite de supprimer une admission
    | déjà utilisée dans le parcours médical.
    */

    if (
      admission.consultation ||
      admission.hospitalisation ||
      admission.triage
    ) {
      return {
        success: false,
        message:
          "Cette admission possède déjà des données médicales. Elle ne peut pas être supprimée.",
      };
    }

    await prisma.admission.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admissions");

    return {
      success: true,
      message:
        "Admission supprimée avec succès.",
    };
  } catch (error) {
    console.error(
      "deleteAdmission:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'admission.",
    };
  }
}