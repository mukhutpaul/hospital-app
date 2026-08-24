"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type RendezVousPayload = {
  patientId: number;
  medecinId?: number | null;
  specialiteId?: number | null;
  serviceId?: number | null;
  dateHeure: string | Date;
  motif?: string | null;
  statut?: string;
  observation?: string | null;
};

function cleanNullable(value?: string | null) {
  if (!value || !value.trim()) {
    return null;
  }

  return value.trim();
}

function parseOptionalId(value?: number | null) {
  if (value === undefined || value === null) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDate(value: string | Date) {
  const date = value instanceof Date
    ? value
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La date et l'heure du rendez-vous sont invalides.");
  }

  return date;
}

/*
|--------------------------------------------------------------------------
| NUMÉRO AUTOMATIQUE
|--------------------------------------------------------------------------
*/

async function generateNumeroRendezVous() {
  const last = await prisma.rendezVous.findFirst({
    orderBy: {
      id: "desc",
    },
    select: {
      numero: true,
    },
  });

  let nextNumber = 1;

  if (last?.numero) {
    const match = last.numero.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `RDV-${String(nextNumber).padStart(6, "0")}`;
}

/*
|--------------------------------------------------------------------------
| LISTE
|--------------------------------------------------------------------------
*/

export async function getRendezVous() {
  try {
    const rendezVous = await prisma.rendezVous.findMany({
      orderBy: {
        dateHeure: "desc",
      },

      include: {
        patient: {
          select: {
            id: true,
            numeroDossier: true,
            nom: true,
            postNom: true,
            prenom: true,
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
          },
        },

        specialite: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        service: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        admission: {
          select: {
            id: true,
            numero: true,
            statut: true,
          },
        },
      },
    });

    return {
      success: true,
      data: rendezVous,
    };
  } catch (error) {
    console.error("getRendezVous:", error);

    return {
      success: false,
      message: "Impossible de récupérer les rendez-vous.",
      data: [],
    };
  }
}

/*
|--------------------------------------------------------------------------
| DONNÉES DU FORMULAIRE
|--------------------------------------------------------------------------
*/

export async function getRendezVousFormData() {
  try {
    const [
      patients,
      medecins,
      specialites,
      services,
    ] = await Promise.all([
      prisma.patient.findMany({
        where: {
          actif: true,
        },
        orderBy: [
          {
            nom: "asc",
          },
          {
            prenom: "asc",
          },
        ],
        select: {
          id: true,
          numeroDossier: true,
          nom: true,
          postNom: true,
          prenom: true,
          telephone: true,
        },
      }),

      prisma.medecin.findMany({
        where: {
          actif: true,
        },
        orderBy: {
          nom: "asc",
        },
        select: {
          id: true,
          matricule: true,
          nom: true,
          postNom: true,
          prenom: true,
          serviceId: true,
          specialiteId: true,
        },
      }),

      prisma.specialite.findMany({
        where: {
          actif: true,
        },
        orderBy: {
          nom: "asc",
        },
        select: {
          id: true,
          code: true,
          nom: true,
          serviceId: true,
        },
      }),

      prisma.service.findMany({
        where: {
          actif: true,
        },
        orderBy: {
          nom: "asc",
        },
        select: {
          id: true,
          code: true,
          nom: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        patients,
        medecins,
        specialites,
        services,
      },
    };
  } catch (error) {
    console.error("getRendezVousFormData:", error);

    return {
      success: false,
      message: "Impossible de charger les données du formulaire.",
      data: {
        patients: [],
        medecins: [],
        specialites: [],
        services: [],
      },
    };
  }
}

/*
|--------------------------------------------------------------------------
| CRÉER
|--------------------------------------------------------------------------
*/

export async function createRendezVous(
  payload: RendezVousPayload
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    if (!payload.patientId) {
      return {
        success: false,
        message: "Veuillez sélectionner un patient.",
      };
    }

    const dateHeure = parseDate(payload.dateHeure);

    if (dateHeure.getTime() < Date.now()) {
      return {
        success: false,
        message: "La date du rendez-vous ne peut pas être dans le passé.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id: payload.patientId,
      },
      select: {
        id: true,
        actif: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    if (!patient.actif) {
      return {
        success: false,
        message: "Ce patient est inactif.",
      };
    }

    const medecinId = parseOptionalId(payload.medecinId);
    const specialiteId = parseOptionalId(payload.specialiteId);
    const serviceId = parseOptionalId(payload.serviceId);

    if (medecinId) {
      const medecin = await prisma.medecin.findUnique({
        where: {
          id: medecinId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!medecin) {
        return {
          success: false,
          message: "Médecin introuvable.",
        };
      }

      if (!medecin.actif) {
        return {
          success: false,
          message: "Ce médecin est inactif.",
        };
      }
    }

    if (specialiteId) {
      const specialite = await prisma.specialite.findUnique({
        where: {
          id: specialiteId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!specialite) {
        return {
          success: false,
          message: "Spécialité introuvable.",
        };
      }
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: {
          id: serviceId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!service) {
        return {
          success: false,
          message: "Service introuvable.",
        };
      }

      if (!service.actif) {
        return {
          success: false,
          message: "Ce service est inactif.",
        };
      }
    }

    /*
    |----------------------------------------------------------------------
    | Vérification utilisateur
    |----------------------------------------------------------------------
    */

    let createdById: number | null = null;

    const sessionUserId = Number(session.user.id);

    if (
      Number.isInteger(sessionUserId) &&
      sessionUserId > 0
    ) {
      const user = await prisma.user.findUnique({
        where: {
          id: sessionUserId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (user?.actif) {
        createdById = user.id;
      }
    }

    /*
    |----------------------------------------------------------------------
    | Vérification conflit médecin
    |----------------------------------------------------------------------
    */

    if (medecinId) {
      const conflit = await prisma.rendezVous.findFirst({
        where: {
          medecinId,
          dateHeure,
          statut: {
            in: [
              "PLANIFIE",
              "CONFIRME",
            ],
          },
        },
      });

      if (conflit) {
        return {
          success: false,
          message: "Ce médecin a déjà un rendez-vous à cette date et heure.",
        };
      }
    }

    /*
    |----------------------------------------------------------------------
    | Numéro
    |----------------------------------------------------------------------
    */

    const numero = await generateNumeroRendezVous();

    const rendezVous = await prisma.rendezVous.create({
      data: {
        numero,

        patientId: payload.patientId,

        medecinId,
        specialiteId,
        serviceId,

        dateHeure,

        motif: cleanNullable(payload.motif),

        statut:
          payload.statut?.trim() ||
          "PLANIFIE",

        observation:
          cleanNullable(payload.observation),

        createdById,
      },

      include: {
        patient: true,

        medecin: true,

        specialite: true,

        service: true,
      },
    });

    revalidatePath("/rendez-vous");

    return {
      success: true,
      message: "Rendez-vous créé avec succès.",
      data: rendezVous,
    };
  } catch (error) {
    console.error("createRendezVous:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de créer le rendez-vous.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MODIFIER
|--------------------------------------------------------------------------
*/

export async function updateRendezVous(
  id: number,
  payload: RendezVousPayload
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const existing = await prisma.rendezVous.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return {
        success: false,
        message: "Rendez-vous introuvable.",
      };
    }

    const dateHeure = parseDate(payload.dateHeure);

    const patient = await prisma.patient.findUnique({
      where: {
        id: payload.patientId,
      },
      select: {
        id: true,
        actif: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    if (!patient.actif) {
      return {
        success: false,
        message: "Ce patient est inactif.",
      };
    }

    const medecinId = parseOptionalId(payload.medecinId);
    const specialiteId = parseOptionalId(payload.specialiteId);
    const serviceId = parseOptionalId(payload.serviceId);

    if (medecinId) {
      const medecin = await prisma.medecin.findUnique({
        where: {
          id: medecinId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!medecin || !medecin.actif) {
        return {
          success: false,
          message: "Médecin invalide ou inactif.",
        };
      }
    }

    if (specialiteId) {
      const specialite = await prisma.specialite.findUnique({
        where: {
          id: specialiteId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!specialite || !specialite.actif) {
        return {
          success: false,
          message: "Spécialité invalide ou inactive.",
        };
      }
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: {
          id: serviceId,
        },
        select: {
          id: true,
          actif: true,
        },
      });

      if (!service || !service.actif) {
        return {
          success: false,
          message: "Service invalide ou inactif.",
        };
      }
    }

    if (medecinId) {
      const conflit = await prisma.rendezVous.findFirst({
        where: {
          id: {
            not: id,
          },

          medecinId,

          dateHeure,

          statut: {
            in: [
              "PLANIFIE",
              "CONFIRME",
            ],
          },
        },
      });

      if (conflit) {
        return {
          success: false,
          message: "Ce médecin a déjà un rendez-vous à cette date et heure.",
        };
      }
    }

    const rendezVous = await prisma.rendezVous.update({
      where: {
        id,
      },

      data: {
        patientId: payload.patientId,

        medecinId,
        specialiteId,
        serviceId,

        dateHeure,

        motif:
          cleanNullable(payload.motif),

        statut:
          payload.statut?.trim() ||
          "PLANIFIE",

        observation:
          cleanNullable(payload.observation),
      },

      include: {
        patient: true,

        medecin: true,

        specialite: true,

        service: true,
      },
    });

    revalidatePath("/rendez-vous");
    revalidatePath(`/rendez-vous/${id}`);

    return {
      success: true,
      message: "Rendez-vous modifié avec succès.",
      data: rendezVous,
    };
  } catch (error) {
    console.error("updateRendezVous:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier le rendez-vous.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER
|--------------------------------------------------------------------------
*/

export async function deleteRendezVous(id: number) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const rendezVous = await prisma.rendezVous.findUnique({
      where: {
        id,
      },

      include: {
        admission: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!rendezVous) {
      return {
        success: false,
        message: "Rendez-vous introuvable.",
      };
    }

    if (rendezVous.admission) {
      return {
        success: false,
        message:
          "Ce rendez-vous est déjà lié à une admission et ne peut pas être supprimé.",
      };
    }

    await prisma.rendezVous.delete({
      where: {
        id,
      },
    });

    revalidatePath("/rendez-vous");

    return {
      success: true,
      message: "Rendez-vous supprimé avec succès.",
    };
  } catch (error) {
    console.error("deleteRendezVous:", error);

    return {
      success: false,
      message: "Impossible de supprimer le rendez-vous.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| CHANGER LE STATUT
|--------------------------------------------------------------------------
*/

export async function updateRendezVousStatut(
  id: number,
  statut: string
) {
  const statuts = [
    "PLANIFIE",
    "CONFIRME",
    "ANNULE",
    "TERMINE",
    "ABSENT",
  ];

  if (!statuts.includes(statut)) {
    return {
      success: false,
      message: "Statut invalide.",
    };
  }

  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    const rendezVous = await prisma.rendezVous.update({
      where: {
        id,
      },

      data: {
        statut,
      },
    });

    revalidatePath("/rendez-vous");

    return {
      success: true,
      message: "Statut mis à jour.",
      data: rendezVous,
    };
  } catch (error) {
    console.error("updateRendezVousStatut:", error);

    return {
      success: false,
      message: "Impossible de modifier le statut.",
    };
  }
}