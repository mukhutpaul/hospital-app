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
   LISTE DES HOSPITALISATIONS
========================================================== */

export async function getHospitalisations(): Promise<ActionResult> {
  try {
    const hospitalisations =
      await prisma.hospitalisation.findMany({
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
              sexe: true,
              telephone: true,
            },
          },

          admission: {
            select: {
              id: true,
              numero: true,
              type: true,
              statut: true,
              dateAdmission: true,
            },
          },

          service: {
            select: {
              id: true,
              nom: true,
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

          lit: {
            include: {
              chambre: {
                select: {
                  id: true,
                  numero: true,
                  type: true,
                  etage: true,
                },
              },
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
      "GET HOSPITALISATIONS:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les hospitalisations.",
      data: [],
    };
  }
}

/* ==========================================================
   HOSPITALISATION PAR ID
========================================================== */

export async function getHospitalisationById(
  id: number
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message:
          "Identifiant d'hospitalisation invalide.",
      };
    }

    const hospitalisation =
      await prisma.hospitalisation.findUnique({
        where: {
          id,
        },

        include: {
          patient: true,

          admission: {
            include: {
              triage: true,
              service: true,
            },
          },

          service: true,

          medecin: {
            include: {
              service: true,
              specialite: true,
            },
          },

          lit: {
            include: {
              chambre: true,
            },
          },

          transferts: {
            orderBy: {
              dateTransfert: "desc",
            },
          },

          soins: {
            orderBy: {
              dateSoin: "desc",
            },
          },

          sorties: {
            orderBy: {
              dateSortie: "desc",
            },
          },
        },
      });

    if (!hospitalisation) {
      return {
        success: false,
        message:
          "Hospitalisation introuvable.",
      };
    }

    return {
      success: true,
      message:
        "Hospitalisation récupérée.",
      data: hospitalisation,
    };
  } catch (error) {
    console.error(
      "GET HOSPITALISATION BY ID:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer l'hospitalisation.",
    };
  }
}

/* ==========================================================
   CRÉER
========================================================== */

export async function createHospitalisation(data: {
  patientId: number;
  admissionId: number;

  serviceId?: number;
  medecinId?: number;
  litId?: number;

  motif?: string;
  diagnostic?: string;

  dateEntree?: Date;
  statut?: string;
}): Promise<ActionResult> {
  try {
    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    if (!data.admissionId) {
      return {
        success: false,
        message:
          "L'admission est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       Vérifier l'admission
    ------------------------------------------------------ */

    const admission =
      await prisma.admission.findUnique({
        where: {
          id: data.admissionId,
        },
      });

    if (!admission) {
      return {
        success: false,
        message:
          "L'admission sélectionnée est introuvable.",
      };
    }

    /* ------------------------------------------------------
       Vérifier si l'admission possède déjà
       une hospitalisation
    ------------------------------------------------------ */

    const existing =
      await prisma.hospitalisation.findUnique({
        where: {
          admissionId: data.admissionId,
        },
      });

    if (existing) {
      return {
        success: false,
        message:
          "Cette admission possède déjà une hospitalisation.",
      };
    }

    /* ------------------------------------------------------
       Vérifier le lit
    ------------------------------------------------------ */

    if (data.litId) {
      const lit =
        await prisma.lit.findUnique({
          where: {
            id: data.litId,
          },
        });

      if (!lit) {
        return {
          success: false,
          message: "Lit introuvable.",
        };
      }

      if (lit.statut !== "LIBRE") {
        return {
          success: false,
          message:
            "Le lit sélectionné n'est pas disponible.",
        };
      }
    }

    /* ------------------------------------------------------
       NUMÉRO
    ------------------------------------------------------ */

    const numero =
      `HOSP-${Date.now()}`;

    /* ------------------------------------------------------
       TRANSACTION
    ------------------------------------------------------ */

    const hospitalisation =
      await prisma.$transaction(
        async (tx) => {
          const created =
            await tx.hospitalisation.create({
              data: {
                numero,

                patientId:
                  data.patientId,

                admissionId:
                  data.admissionId,

                serviceId:
                  data.serviceId ||
                  undefined,

                medecinId:
                  data.medecinId ||
                  undefined,

                litId:
                  data.litId ||
                  undefined,

                motif:
                  data.motif?.trim() ||
                  undefined,

                diagnostic:
                  data.diagnostic?.trim() ||
                  undefined,

                dateEntree:
                  data.dateEntree ||
                  new Date(),

                statut:
                  data.statut ||
                  "EN_COURS",
              },
            });

          /* ----------------------------------------------
             OCCUPER LE LIT
          ---------------------------------------------- */

          if (data.litId) {
            await tx.lit.update({
              where: {
                id: data.litId,
              },

              data: {
                statut: "OCCUPE",
              },
            });
          }

          /* ----------------------------------------------
             METTRE L'ADMISSION À JOUR
          ---------------------------------------------- */

          await tx.admission.update({
            where: {
              id: data.admissionId,
            },

            data: {
              statut: "HOSPITALISE",
            },
          });

          return created;
        }
      );

    return {
      success: true,
      message:
        "Hospitalisation créée avec succès.",
      data: hospitalisation,
    };
  } catch (error) {
    console.error(
      "CREATE HOSPITALISATION:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de créer l'hospitalisation.",
    };
  }
}

/* ==========================================================
   MODIFIER
========================================================== */

export async function updateHospitalisation(
  id: number,
  data: {
    serviceId?: number;
    medecinId?: number;
    litId?: number;

    motif?: string;
    diagnostic?: string;

    statut?: string;
  }
): Promise<ActionResult> {
  try {
    const existing =
      await prisma.hospitalisation.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return {
        success: false,
        message:
          "Hospitalisation introuvable.",
      };
    }

    /* ------------------------------------------------------
       Si le lit change
    ------------------------------------------------------ */

    if (
      data.litId &&
      data.litId !== existing.litId
    ) {
      const newLit =
        await prisma.lit.findUnique({
          where: {
            id: data.litId,
          },
        });

      if (!newLit) {
        return {
          success: false,
          message: "Nouveau lit introuvable.",
        };
      }

      if (newLit.statut !== "LIBRE") {
        return {
          success: false,
          message:
            "Le nouveau lit n'est pas disponible.",
        };
      }
    }

    const hospitalisation =
      await prisma.$transaction(
        async (tx) => {
          /* ----------------------------------------------
             Libérer ancien lit
          ---------------------------------------------- */

          if (
            existing.litId &&
            data.litId &&
            existing.litId !== data.litId
          ) {
            await tx.lit.update({
              where: {
                id: existing.litId,
              },

              data: {
                statut: "LIBRE",
              },
            });
          }

          /* ----------------------------------------------
             Occuper nouveau lit
          ---------------------------------------------- */

          if (
            data.litId &&
            data.litId !== existing.litId
          ) {
            await tx.lit.update({
              where: {
                id: data.litId,
              },

              data: {
                statut: "OCCUPE",
              },
            });
          }

          /* ----------------------------------------------
             Mise à jour
          ---------------------------------------------- */

          return await tx.hospitalisation.update({
            where: {
              id,
            },

            data: {
              serviceId:
                data.serviceId ||
                null,

              medecinId:
                data.medecinId ||
                null,

              litId:
                data.litId ||
                null,

              motif:
                data.motif?.trim() ||
                null,

              diagnostic:
                data.diagnostic?.trim() ||
                null,

              statut:
                data.statut ||
                undefined,
            },
          });
        }
      );

    return {
      success: true,
      message:
        "Hospitalisation modifiée avec succès.",
      data: hospitalisation,
    };
  } catch (error) {
    console.error(
      "UPDATE HOSPITALISATION:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'hospitalisation.",
    };
  }
}

/* ==========================================================
   SUPPRIMER
========================================================== */

export async function deleteHospitalisation(
  id: number
): Promise<ActionResult> {
  try {
    const hospitalisation =
      await prisma.hospitalisation.findUnique({
        where: {
          id,
        },
      });

    if (!hospitalisation) {
      return {
        success: false,
        message:
          "Hospitalisation introuvable.",
      };
    }

    /* ------------------------------------------------------
       On évite de supprimer une hospitalisation active
    ------------------------------------------------------ */

    if (
      hospitalisation.statut ===
      "EN_COURS"
    ) {
      return {
        success: false,
        message:
          "Impossible de supprimer une hospitalisation en cours. Veuillez d'abord effectuer la sortie du patient.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        /* Libérer le lit */

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

        await tx.hospitalisation.delete({
          where: {
            id,
          },
        });
      }
    );

    return {
      success: true,
      message:
        "Hospitalisation supprimée avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE HOSPITALISATION:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'hospitalisation.",
    };
  }
}

/* ==========================================================
   CHANGER LE STATUT
========================================================== */

export async function updateHospitalisationStatut(
  id: number,
  statut: string
): Promise<ActionResult> {
  try {
    const hospitalisation =
      await prisma.hospitalisation.findUnique({
        where: {
          id,
        },
      });

    if (!hospitalisation) {
      return {
        success: false,
        message:
          "Hospitalisation introuvable.",
      };
    }

    const allowedStatuses = [
      "EN_COURS",
      "TERMINEE",
      "ANNULEE",
    ];

    if (
      !allowedStatuses.includes(statut)
    ) {
      return {
        success: false,
        message:
          "Statut d'hospitalisation invalide.",
      };
    }

    const updated =
      await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.hospitalisation.update({
              where: {
                id,
              },

              data: {
                statut,

                dateSortie:
                  statut === "TERMINEE"
                    ? new Date()
                    : undefined,
              },
            });

          /* ----------------------------------------------
             Si hospitalisation terminée :
             libérer le lit
          ---------------------------------------------- */

          if (
            statut === "TERMINEE" &&
            hospitalisation.litId
          ) {
            await tx.lit.update({
              where: {
                id: hospitalisation.litId,
              },

              data: {
                statut: "LIBRE",
              },
            });
          }

          /* ----------------------------------------------
             Admission
          ---------------------------------------------- */

          if (
            statut === "TERMINEE"
          ) {
            await tx.admission.update({
              where: {
                id: hospitalisation.admissionId,
              },

              data: {
                statut: "TERMINEE",
                dateSortie: new Date(),
              },
            });
          }

          return result;
        }
      );

    return {
      success: true,
      message:
        "Statut de l'hospitalisation mis à jour.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "UPDATE HOSPITALISATION STATUT:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut.",
    };
  }
}