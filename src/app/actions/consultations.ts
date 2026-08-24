"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
   UTILITAIRE — NUMÉRO
========================================================== */

function generateNumero(prefix: string) {
  const now = new Date();

  const date = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const random = Math.floor(
    1000 + Math.random() * 9000,
  );

  return `${prefix}-${date}-${random}`;
}

/* ==========================================================
   MÉDECIN CONNECTÉ
========================================================== */

export async function getMedecinConnecte(): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Utilisateur non connecté.",
      };
    }

    const userId = Number(session.user.id);

    if (!userId) {
      return {
        success: false,
        message: "Identifiant utilisateur invalide.",
      };
    }

    const medecin =
      await prisma.medecin.findUnique({
        where: {
          userId,
        },

        include: {
          service: true,
          specialite: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              telephone: true,
              actif: true,
            },
          },
        },
      });

    if (!medecin) {
      return {
        success: false,
        message:
          "Aucun médecin n'est associé à votre compte.",
      };
    }

    if (!medecin.actif) {
      return {
        success: false,
        message:
          "Votre compte médecin est désactivé.",
      };
    }

    return {
      success: true,
      message:
        "Médecin connecté récupéré.",
      data: medecin,
    };
  } catch (error) {
    console.error(
      "getMedecinConnecte:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le médecin connecté.",
    };
  }
}

/* ==========================================================
   CRÉER CONSULTATION
   Le médecin est récupéré automatiquement
   depuis la session
========================================================== */

export async function createConsultation(
  data: {
    patientId: number;

    /*
     * Facultatif côté client.
     * Le serveur utilise toujours le médecin connecté.
     */
    medecinId?: number;

    serviceId?: number | null;
    specialiteId?: number | null;
    admissionId?: number | null;

    dateConsultation: string;

    motif?: string;
    diagnostic?: string;
    observation?: string;
    conclusion?: string;
  },
): Promise<ActionResult> {
  try {
    /* ======================================================
       SESSION
    ====================================================== */

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message:
          "Vous devez être connecté pour créer une consultation.",
      };
    }

    const userId = Number(session.user.id);

    if (!userId) {
      return {
        success: false,
        message: "Utilisateur invalide.",
      };
    }

    /* ======================================================
       MÉDECIN CONNECTÉ
    ====================================================== */

    const medecin =
      await prisma.medecin.findUnique({
        where: {
          userId,
        },

        include: {
          service: true,
          specialite: true,
        },
      });

    if (!medecin) {
      return {
        success: false,
        message:
          "Aucun médecin n'est associé à votre compte.",
      };
    }

    if (!medecin.actif) {
      return {
        success: false,
        message:
          "Votre compte médecin est désactivé.",
      };
    }

    /* ======================================================
       PATIENT
    ====================================================== */

    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

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

    /* ======================================================
       ADMISSION
    ====================================================== */

    if (data.admissionId) {
      const admission =
        await prisma.admission.findUnique({
          where: {
            id: data.admissionId,
          },
        });

      if (!admission) {
        return {
          success: false,
          message: "Admission introuvable.",
        };
      }

      if (
        admission.patientId !==
        data.patientId
      ) {
        return {
          success: false,
          message:
            "Cette admission n'appartient pas à ce patient.",
        };
      }
    }

    /* ======================================================
       SERVICE AUTOMATIQUE
    ====================================================== */

    const serviceId =
      data.serviceId ??
      medecin.serviceId ??
      null;

    /* ======================================================
       SPÉCIALITÉ AUTOMATIQUE
    ====================================================== */

    const specialiteId =
      data.specialiteId ??
      medecin.specialiteId ??
      null;

    /* ======================================================
       DATE
    ====================================================== */

    const dateConsultation =
      new Date(data.dateConsultation);

    if (
      Number.isNaN(
        dateConsultation.getTime(),
      )
    ) {
      return {
        success: false,
        message:
          "La date de consultation est invalide.",
      };
    }

    /* ======================================================
       CRÉATION
    ====================================================== */

    const consultation =
      await prisma.consultation.create({
        data: {
          patientId:
            data.patientId,

          /*
           * IMPORTANT :
           * On ignore le medecinId envoyé
           * par le navigateur.
           *
           * Le médecin vient de la session.
           */
          medecinId:
            medecin.id,

          serviceId,

          specialiteId,

          admissionId:
            data.admissionId ?? null,

          dateConsultation,

          motif:
            data.motif?.trim() || null,

          diagnostic:
            data.diagnostic?.trim() ||
            null,

          observation:
            data.observation?.trim() ||
            null,

          conclusion:
            data.conclusion?.trim() ||
            null,

          userMedecinId:
            userId,
        },

        include: {
          patient: true,

          medecin: {
            include: {
              service: true,
              specialite: true,
            },
          },

          service: true,

          specialite: true,

          admission: true,
        },
      });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath(
      "/consultations",
    );

    revalidatePath(
      `/consultations/${consultation.idConsultation}`,
    );

    return {
      success: true,
      message:
        "Consultation enregistrée avec succès.",
      data: consultation,
    };
  } catch (error) {
    console.error(
      "createConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible d'enregistrer la consultation.",
    };
  }
}

/* ==========================================================
   SUPPRIMER CONSULTATION
========================================================== */

export async function deleteConsultation(
  id: number,
): Promise<ActionResult> {
  try {
    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation: id,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message: "Consultation introuvable.",
      };
    }

    await prisma.$transaction([
      prisma.constante.deleteMany({
        where: {
          consultationId: id,
        },
      }),

      prisma.prescription.deleteMany({
        where: {
          consultationId: id,
        },
      }),

      prisma.demandeLaboratoire.deleteMany({
        where: {
          consultationId: id,
        },
      }),

      prisma.demandeImagerie.deleteMany({
        where: {
          consultationId: id,
        },
      }),

      prisma.consultation.delete({
        where: {
          idConsultation: id,
        },
      }),
    ]);

    revalidatePath(
      "/consultations",
    );

    return {
      success: true,
      message:
        "Consultation supprimée.",
    };
  } catch (error) {
    console.error(
      "deleteConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la consultation.",
    };
  }
}

/* ==========================================================
   LISTE DES CONSULTATIONS
========================================================== */

export async function getConsultations(): Promise<ActionResult> {
  try {
    const consultations =
      await prisma.consultation.findMany({
        orderBy: {
          dateConsultation: "desc",
        },

        include: {
          patient: true,

          medecin: {
            include: {
              service: true,
              specialite: true,
            },
          },

          service: true,

          specialite: true,

          admission: true,

          constantes: true,

          prescriptions: {
            include: {
              lignes: {
                include: {
                  medicament: true,
                },
              },
            },
          },

          /* ==================================================
             LABORATOIRE
          ================================================== */

          demandesLabo: {
            include: {
              lignes: {
                include: {
                  examen: true,
                },
              },

              /*
               * IMPORTANT :
               * Ne pas mettre examen: true ici.
               *
               * ResultatLaboratoire n'a pas de relation
               * Prisma appelée "examen".
               */
              resultats: true,
            },
          },

          /* ==================================================
             IMAGERIE
          ================================================== */

          demandesImagerie: {
            include: {
              examen: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        "Consultations récupérées avec succès.",
      data: consultations,
    };
  } catch (error) {
    console.error(
      "getConsultations:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les consultations.",
      data: [],
    };
  }
}

/* ==========================================================
   PATIENTS POUR CONSULTATION
========================================================== */

export async function getPatientsPourConsultation(): Promise<ActionResult> {
  try {
    const patients =
      await prisma.patient.findMany({
        where: {
          actif: true,
        },

        orderBy: [
          {
            nom: "asc",
          },
          {
            postNom: "asc",
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
          sexe: true,
          dateNaissance: true,
          telephone: true,
        },
      });

    return {
      success: true,
      message:
        "Patients récupérés avec succès.",
      data: patients,
    };
  } catch (error) {
    console.error(
      "getPatientsPourConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les patients.",
      data: [],
    };
  }
}

/* ==========================================================
   SERVICES POUR CONSULTATION
========================================================== */

export async function getServicesPourConsultation(): Promise<ActionResult> {
  try {
    const services =
      await prisma.service.findMany({
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
          description: true,
          departementId: true,
        },
      });

    return {
      success: true,
      message:
        "Services récupérés avec succès.",
      data: services,
    };
  } catch (error) {
    console.error(
      "getServicesPourConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les services.",
      data: [],
    };
  }
}

/* ==========================================================
   SPÉCIALITÉS POUR CONSULTATION
========================================================== */

export async function getSpecialitesPourConsultation(): Promise<ActionResult> {
  try {
    const specialites =
      await prisma.specialite.findMany({
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
          description: true,
          serviceId: true,
        },
      });

    return {
      success: true,
      message:
        "Spécialités récupérées avec succès.",
      data: specialites,
    };
  } catch (error) {
    console.error(
      "getSpecialitesPourConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les spécialités.",
      data: [],
    };
  }
}

/* ==========================================================
   ADMISSIONS POUR CONSULTATION
========================================================== */

export async function getAdmissionsPourConsultation(): Promise<ActionResult> {
  try {
    const admissions =
      await prisma.admission.findMany({
        where: {
          statut: {
            not: "TERMINEE",
          },
        },

        orderBy: {
          dateAdmission: "desc",
        },

        select: {
          id: true,
          numero: true,
          patientId: true,
          serviceId: true,
          type: true,
          motif: true,
          statut: true,
          dateAdmission: true,

          patient: {
            select: {
              id: true,
              numeroDossier: true,
              nom: true,
              postNom: true,
              prenom: true,
            },
          },
        },
      });

    return {
      success: true,
      message:
        "Admissions récupérées avec succès.",
      data: admissions,
    };
  } catch (error) {
    console.error(
      "getAdmissionsPourConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les admissions.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER PRESCRIPTION
========================================================== */

export async function createPrescription(
  data: {
    consultationId: number;
    patientId: number;
    medecinId?: number;
    auteurId?: number | null;

    lignes: {
      medicamentId: number;
      posologie?: string;
      dose?: string;
      frequence?: string;
      duree?: string;
      voie?: string;
      quantite?: number | null;
      observation?: string;
    }[];
  },
): Promise<ActionResult> {
  try {
    if (!data.consultationId) {
      return {
        success: false,
        message:
          "Consultation obligatoire.",
      };
    }

    if (!data.patientId) {
      return {
        success: false,
        message:
          "Patient obligatoire.",
      };
    }

    if (!data.lignes?.length) {
      return {
        success: false,
        message:
          "Ajoutez au moins un médicament.",
      };
    }

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation:
            data.consultationId,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message:
          "Consultation introuvable.",
      };
    }

    const prescription =
      await prisma.prescription.create({
        data: {
          numero:
            generateNumero("ORD"),

          patientId:
            data.patientId,

          consultationId:
            data.consultationId,

          /*
           * Le médecin de la consultation
           * est utilisé automatiquement.
           */
          medecinId:
            consultation.medecinId,

          auteurId:
            data.auteurId ?? null,

          lignes: {
            create:
              data.lignes.map(
                (ligne) => ({
                  medicamentId:
                    ligne.medicamentId,

                  posologie:
                    ligne.posologie?.trim() ||
                    null,

                  dose:
                    ligne.dose?.trim() ||
                    null,

                  frequence:
                    ligne.frequence?.trim() ||
                    null,

                  duree:
                    ligne.duree?.trim() ||
                    null,

                  voie:
                    ligne.voie?.trim() ||
                    null,

                  quantite:
                    ligne.quantite ?? null,

                  observation:
                    ligne.observation?.trim() ||
                    null,
                }),
              ),
          },
        },

        include: {
          lignes: {
            include: {
              medicament: true,
            },
          },
        },
      });

    revalidatePath(
      `/consultations/${data.consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    return {
      success: true,
      message:
        "Prescription créée avec succès.",
      data: prescription,
    };
  } catch (error) {
    console.error(
      "createPrescription:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de créer la prescription.",
    };
  }
}

/* ==========================================================
   SUPPRIMER PRESCRIPTION
========================================================== */

export async function deletePrescription(
  id: number,
  consultationId: number,
): Promise<ActionResult> {
  try {
    await prisma.prescription.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/consultations/${consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    return {
      success: true,
      message:
        "Prescription supprimée.",
    };
  } catch (error) {
    console.error(
      "deletePrescription:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la prescription.",
    };
  }
}

/* ==========================================================
   CRÉER UNE DEMANDE DE LABORATOIRE
========================================================== */

export async function createDemandeLaboratoire(
  data: {
    consultationId: number;
    patientId: number;
    serviceId?: number | null;

    observation?: string;

    urgence?: boolean;

    /*
     * Le frontend envoie uniquement les IDs
     *
     * Exemple :
     * examens: [3, 1, 2]
     */
    examens: number[];
  },
): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATIONS
    ====================================================== */

    if (!data.consultationId) {
      return {
        success: false,
        message: "Consultation obligatoire.",
      };
    }

    if (!data.patientId) {
      return {
        success: false,
        message: "Patient obligatoire.",
      };
    }

    if (!Array.isArray(data.examens) || data.examens.length === 0) {
      return {
        success: false,
        message: "Sélectionnez au moins un examen.",
      };
    }

    /* ======================================================
       NORMALISER LES IDS
       Évite les doublons
       Exemple [3,1,3,2] => [3,1,2]
    ====================================================== */

    const examenIds = [
      ...new Set(
        data.examens
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    if (examenIds.length === 0) {
      return {
        success: false,
        message: "Aucun examen valide n'a été sélectionné.",
      };
    }

    /* ======================================================
       CONSULTATION
    ====================================================== */

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation: data.consultationId,
        },

        select: {
          idConsultation: true,
          patientId: true,
          serviceId: true,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message: "Consultation introuvable.",
      };
    }

    /* ======================================================
       VÉRIFIER LE PATIENT
    ====================================================== */

    if (
      consultation.patientId !==
      data.patientId
    ) {
      return {
        success: false,
        message:
          "Le patient ne correspond pas à cette consultation.",
      };
    }

    /* ======================================================
       RÉCUPÉRER LES EXAMENS DE LABORATOIRE
       
       IMPORTANT :
       Le modèle Prisma est ExamenLaboratoire
       donc le delegate est :
       
       prisma.examenLaboratoire
    ====================================================== */

    const examens =
      await prisma.examenLaboratoire.findMany({
        where: {
          id: {
            in: examenIds,
          },

          actif: true,
        },

        select: {
          id: true,
          code: true,
          nom: true,
          prix: true,
          devise: true,
        },
      });

    /* ======================================================
       VÉRIFIER QUE TOUS LES EXAMENS EXISTENT
    ====================================================== */

    if (
      examens.length !==
      examenIds.length
    ) {
      const idsTrouves =
        new Set(
          examens.map(
            (examen) => examen.id,
          ),
        );

      const examensManquants =
        examenIds.filter(
          (id) => !idsTrouves.has(id),
        );

      return {
        success: false,
        message:
          `Examen(s) de laboratoire introuvable(s) ou inactif(s) : ${examensManquants.join(", ")}`,
      };
    }

    /* ======================================================
       SERVICE
       
       Si le frontend n'envoie pas de service,
       on utilise celui de la consultation.
    ====================================================== */

    const serviceId =
      data.serviceId ??
      consultation.serviceId ??
      null;

    /* ======================================================
       CRÉATION DE LA DEMANDE
    ====================================================== */

    const demande =
      await prisma.demandeLaboratoire.create({
        data: {
          numero:
            generateNumero("LAB"),

          patientId:
            data.patientId,

          consultationId:
            data.consultationId,

          serviceId,

          dateDemande:
            new Date(),

          statut:
            "DEMANDE",

          urgence:
            data.urgence ?? false,

          observation:
            data.observation?.trim() ||
            null,

          /* ==================================================
             LIGNES DE LA DEMANDE
          ================================================== */

          lignes: {
            create:
              examens.map(
                (examen) => ({
                  examenId:
                    examen.id,

                  /*
                   * Le prix vient de la base.
                   * Il n'est jamais envoyé par le navigateur.
                   */
                  prix:
                    examen.prix,
                }),
              ),
          },
        },

        include: {
          lignes: {
            include: {
              examen: true,
            },
          },

          resultats: true,
        },
      });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath(
      `/consultations/${data.consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    revalidatePath(
      "/laboratoire",
    );

    /* ======================================================
       RÉPONSE
    ====================================================== */

    return {
      success: true,
      message:
        "Demande de laboratoire créée avec succès.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "createDemandeLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de créer la demande laboratoire.",
    };
  }
}
/* ==========================================================
   SUPPRIMER DEMANDE LABORATOIRE
========================================================== */

export async function deleteDemandeLaboratoire(
  id: number,
  consultationId: number,
): Promise<ActionResult> {
  try {
    await prisma.demandeLaboratoire.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/consultations/${consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    revalidatePath(
      "/laboratoire",
    );

    return {
      success: true,
      message:
        "Demande laboratoire supprimée.",
    };
  } catch (error) {
    console.error(
      "deleteDemandeLaboratoire:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la demande.",
    };
  }
}

/* ==========================================================
   DEMANDE IMAGERIE
========================================================== */

export async function createDemandeImagerie(
  data: {
    consultationId: number;
    patientId: number;
    serviceId?: number | null;

    examenId: number;

    motif?: string;

    urgence?: boolean;
  },
): Promise<ActionResult> {
  try {
    if (!data.consultationId) {
      return {
        success: false,
        message:
          "Consultation obligatoire.",
      };
    }

    if (!data.patientId) {
      return {
        success: false,
        message:
          "Patient obligatoire.",
      };
    }

    if (!data.examenId) {
      return {
        success: false,
        message:
          "Examen d'imagerie obligatoire.",
      };
    }

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation:
            data.consultationId,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message:
          "Consultation introuvable.",
      };
    }

    const demande =
      await prisma.demandeImagerie.create({
        data: {
          numero:
            generateNumero("IMG"),

          patientId:
            data.patientId,

          consultationId:
            data.consultationId,

          serviceId:
            data.serviceId ?? null,

          examenId:
            data.examenId,

          motif:
            data.motif?.trim() ||
            null,

          urgence:
            data.urgence ?? false,

          statut:
            "DEMANDE",

          dateDemande:
            new Date(),
        },

        include: {
          examen: true,
        },
      });

    revalidatePath(
      `/consultations/${data.consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    revalidatePath(
      "/imagerie",
    );

    return {
      success: true,
      message:
        "Demande d'imagerie créée.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "createDemandeImagerie:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de créer la demande d'imagerie.",
    };
  }
}

/* ==========================================================
   SUPPRIMER DEMANDE IMAGERIE
========================================================== */

export async function deleteDemandeImagerie(
  id: number,
  consultationId: number,
): Promise<ActionResult> {
  try {
    await prisma.demandeImagerie.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/consultations/${consultationId}`,
    );

    revalidatePath(
      "/consultations",
    );

    revalidatePath(
      "/imagerie",
    );

    return {
      success: true,
      message:
        "Demande d'imagerie supprimée.",
    };
  } catch (error) {
    console.error(
      "deleteDemandeImagerie:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la demande.",
    };
  }
}

/* ==========================================================
   CRÉER UNE CONSTANTE POUR UNE CONSULTATION
========================================================== */

/* ==========================================================
   CRÉER UNE CONSTANTE POUR UNE CONSULTATION
========================================================== */

export async function createConstanteConsultation(data: {
  consultationId: number;
  patientId: number;
  admissionId?: number | null;

  temperature?: number | null;

  tensionSystolique?: number | null;
  tensionDiastolique?: number | null;

  pouls?: number | null;
  saturation?: number | null;

  poids?: number | null;
  taille?: number | null;

  frequenceRespiratoire?: number | null;
  glycemie?: number | null;
}) {
  try {
    /* ======================================================
       VÉRIFIER LA CONSULTATION
    ====================================================== */

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation:
            data.consultationId,
        },
        select: {
          idConsultation: true,
          patientId: true,
          admissionId: true,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message:
          "Consultation introuvable.",
      };
    }

    /* ======================================================
       VÉRIFIER QUE LE PATIENT CORRESPOND
    ====================================================== */

    if (
      consultation.patientId !==
      data.patientId
    ) {
      return {
        success: false,
        message:
          "Le patient ne correspond pas à cette consultation.",
      };
    }

    /* ======================================================
       CRÉER LA CONSTANTE
    ====================================================== */

    const constante =
      await prisma.constante.create({
        data: {
          patientId: data.patientId,

          consultationId:
            data.consultationId,

          admissionId:
            data.admissionId ?? null,

          temperature:
            data.temperature ?? null,

          tensionSystolique:
            data.tensionSystolique ?? null,

          tensionDiastolique:
            data.tensionDiastolique ?? null,

          pouls:
            data.pouls ?? null,

          saturation:
            data.saturation ?? null,

          poids:
            data.poids ?? null,

          taille:
            data.taille ?? null,

          frequenceRespiratoire:
            data.frequenceRespiratoire ??
            null,

          glycemie:
            data.glycemie ?? null,
        },
      });

    return {
      success: true,
      message:
        "Les constantes ont été enregistrées avec succès.",
      data: constante,
    };
  } catch (error) {
    console.error(
      "createConstanteConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible d'enregistrer les constantes.",
    };
  }
}