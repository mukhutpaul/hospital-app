
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

type FactureLigneInput = {
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant?: number;
  acteId?: number;
  serviceId?: number;
  reference?: string;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

/**
 * Génère un numéro de facture lisible.
 *
 * Exemple :
 * FAC-20260828-103025-4821
 */
function generateNumero(prefix: string): string {
  const now = new Date();

  const date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${date}-${time}-${random}`;
}

/**
 * Vérifie qu'un nombre est valide.
 */
function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Vérifie qu'un ID est un entier positif.
 */
function isValidId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

/**
 * Arrondit un montant à deux décimales.
 */
function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Convertit une valeur en ID valide ou null.
 */
function normalizeOptionalId(
  value: unknown
): number | null {
  return isValidId(value) ? value : null;
}

/**
 * Nettoie une chaîne.
 */
function cleanString(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Génère un numéro de facture réellement disponible.
 */
async function generateUniqueFactureNumero(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const numero = generateNumero("FAC");

    const existe = await prisma.facture.findUnique({
      where: { numero },
      select: { id: true },
    });

    if (!existe) {
      return numero;
    }
  }

  throw new Error(
    "Impossible de générer un numéro de facture unique."
  );
}

/* ==========================================================
   FACTURES — LISTE
========================================================== */

export async function getFactures(): Promise<ActionResult> {
  try {
    const factures = await prisma.facture.findMany({
      orderBy: {
        dateFacture: "desc",
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

        consultation: {
          select: {
            idConsultation: true,
            dateConsultation: true,

            medecin: {
              select: {
                id: true,
                matricule: true,
                nom: true,
                postNom: true,
                prenom: true,
              },
            },

            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },
          },
        },

        admission: {
          select: {
            id: true,
            numero: true,
            type: true,
            statut: true,

            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },
          },
        },

        hospitalisation: {
          select: {
            id: true,
            numero: true,
            statut: true,

            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            lit: {
              select: {
                id: true,
                numero: true,

                chambre: {
                  select: {
                    id: true,
                    numero: true,
                    type: true,
                  },
                },
              },
            },
          },
        },

        proforma: {
          select: {
            id: true,
            numero: true,
            statut: true,
          },
        },

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            acte: {
              select: {
                id: true,
                code: true,
                libelle: true,
                categorie: true,
                montant: true,
                devise: true,
              },
            },
          },
        },

        paiements: {
          orderBy: {
            datePaiement: "desc",
          },

          select: {
            id: true,
            reference: true,
            montant: true,
            devise: true,
            modePaiement: true,
            type: true,
            statut: true,
            datePaiement: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Factures récupérées avec succès.",
      data: factures,
    };
  } catch (error) {
    console.error("ERREUR getFactures :", error);

    return {
      success: false,
      message: "Erreur lors du chargement des factures.",
    };
  }
}

/* ==========================================================
   FACTURE — PAR ID
========================================================== */

export async function getFactureById(
  id: number
): Promise<ActionResult> {
  try {
    if (!isValidId(id)) {
      return {
        success: false,
        message: "Identifiant de facture invalide.",
      };
    }

    const facture = await prisma.facture.findUnique({
      where: { id },

      include: {
        patient: true,

        consultation: {
          include: {
            medecin: true,
            service: true,
            specialite: true,
          },
        },

        admission: {
          include: {
            service: true,
          },
        },

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

        proforma: true,

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            service: true,
            acte: true,
          },
        },

        paiements: {
          orderBy: {
            datePaiement: "desc",
          },

          include: {
            caissier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!facture) {
      return {
        success: false,
        message: "Facture introuvable.",
      };
    }

    return {
      success: true,
      message: "Facture récupérée avec succès.",
      data: facture,
    };
  } catch (error) {
    console.error("ERREUR getFactureById :", error);

    return {
      success: false,
      message: "Erreur lors du chargement de la facture.",
    };
  }
}

/* ==========================================================
   CRÉER FACTURE
========================================================== */

export async function createFacture(
  input: {
    patientId: number;

    consultationId?: number;
    admissionId?: number;
    hospitalisationId?: number;
    proformaId?: number;

    serviceId?: number;

    reduction?: number;
    typeReduction?: string;

    devise?: string;

    lignes: FactureLigneInput[];
  },
): Promise<ActionResult> {
  try {
    /* =======================================================
       VALIDATION GÉNÉRALE
    ======================================================= */

    if (!input) {
      return {
        success: false,
        message: "Les données de facturation sont obligatoires.",
      };
    }

    if (!Array.isArray(input.lignes)) {
      return {
        success: false,
        message: "Les lignes de facture sont invalides.",
      };
    }

    if (!isValidId(input.patientId)) {
      return {
        success: false,
        message: "Patient invalide.",
      };
    }

    /* =======================================================
       PATIENT
    ======================================================= */

    const patient = await prisma.patient.findUnique({
      where: {
        id: input.patientId,
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
        message: "Le patient est désactivé.",
      };
    }

    /* =======================================================
       NORMALISATION IDS
    ======================================================= */

    const consultationId = normalizeOptionalId(
      input.consultationId,
    );

    const admissionId = normalizeOptionalId(
      input.admissionId,
    );

    const hospitalisationId = normalizeOptionalId(
      input.hospitalisationId,
    );

    const proformaId = normalizeOptionalId(
      input.proformaId,
    );

    const serviceId = normalizeOptionalId(
      input.serviceId,
    );

    /* =======================================================
       CONSULTATION
    ======================================================= */

    if (consultationId) {
      const consultation =
        await prisma.consultation.findUnique({
          where: {
            idConsultation: consultationId,
          },

          select: {
            idConsultation: true,
            patientId: true,
          },
        });

      if (!consultation) {
        return {
          success: false,
          message: "Consultation introuvable.",
        };
      }

      if (
        consultation.patientId !==
        input.patientId
      ) {
        return {
          success: false,
          message:
            "La consultation sélectionnée n'appartient pas à ce patient.",
        };
      }
    }

    /* =======================================================
       ADMISSION
    ======================================================= */

    if (admissionId) {
      const admission =
        await prisma.admission.findUnique({
          where: {
            id: admissionId,
          },

          select: {
            id: true,
            patientId: true,
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
        input.patientId
      ) {
        return {
          success: false,
          message:
            "L'admission sélectionnée n'appartient pas à ce patient.",
        };
      }
    }

    /* =======================================================
       HOSPITALISATION
    ======================================================= */

    if (hospitalisationId) {
      const hospitalisation =
        await prisma.hospitalisation.findUnique({
          where: {
            id: hospitalisationId,
          },

          select: {
            id: true,
            patientId: true,
          },
        });

      if (!hospitalisation) {
        return {
          success: false,
          message: "Hospitalisation introuvable.",
        };
      }

      if (
        hospitalisation.patientId !==
        input.patientId
      ) {
        return {
          success: false,
          message:
            "L'hospitalisation sélectionnée n'appartient pas à ce patient.",
        };
      }
    }

    /* =======================================================
       PROFORMA
    ======================================================= */

    if (proformaId) {
      const proforma =
        await prisma.proforma.findUnique({
          where: {
            id: proformaId,
          },

          select: {
            id: true,
            statut: true,
            patientId: true,
          },
        });

      if (!proforma) {
        return {
          success: false,
          message: "Proforma introuvable.",
        };
      }

      if (
        proforma.patientId !==
        input.patientId
      ) {
        return {
          success: false,
          message:
            "La proforma sélectionnée n'appartient pas à ce patient.",
        };
      }

      if (
        proforma.statut === "FACTUREE"
      ) {
        return {
          success: false,
          message:
            "Cette proforma a déjà été facturée.",
        };
      }
    }

    /* =======================================================
       SERVICE GLOBAL
    ======================================================= */

    if (serviceId) {
      const service =
        await prisma.service.findUnique({
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
          message:
            "Le service sélectionné est désactivé.",
        };
      }
    }

    /* =======================================================
       LIGNES
    ======================================================= */

    if (input.lignes.length === 0) {
      return {
        success: false,
        message:
          "La facture doit contenir au moins une ligne.",
      };
    }

    const lignes: FactureLigneInput[] = [];

    for (const ligne of input.lignes) {
      /* =====================================================
         DONNÉES DE BASE
      ===================================================== */

      const designation =
        cleanString(
          ligne?.designation,
        );

      const quantite =
        Number(ligne?.quantite);

      const prixUnitaire =
        Number(ligne?.prixUnitaire);

      if (!designation) {
        return {
          success: false,
          message:
            "Chaque ligne doit avoir une désignation.",
        };
      }

      if (
        !Number.isFinite(quantite) ||
        quantite <= 0
      ) {
        return {
          success: false,
          message:
            `La quantité de "${designation}" est invalide.`,
        };
      }

      if (
        !Number.isFinite(prixUnitaire) ||
        prixUnitaire < 0
      ) {
        return {
          success: false,
          message:
            `Le prix de "${designation}" est invalide.`,
        };
      }

      /* =====================================================
         IDS DE LA LIGNE
      ===================================================== */

      let acteId =
        normalizeOptionalId(
          ligne?.acteId,
        );

      let consultationActeId =
        normalizeOptionalId(
          ligne?.consultationActeId,
        );

      const ligneServiceId =
        normalizeOptionalId(
          ligne?.serviceId,
        ) ?? serviceId;

      const demandeLaboratoireLigneId =
        normalizeOptionalId(
          ligne?.demandeLaboratoireLigneId,
        );

      const demandeImagerieId =
        normalizeOptionalId(
          ligne?.demandeImagerieId,
        );

      const dispensationLigneId =
        normalizeOptionalId(
          ligne?.dispensationLigneId,
        );

      /* =====================================================
         CONSULTATION ACTE
         
         IMPORTANT :
         Si consultationActeId n'est pas envoyé mais que
         consultationId + acteId existent, on recherche
         automatiquement le ConsultationActe.
      ===================================================== */

      if (
        !consultationActeId &&
        consultationId &&
        acteId
      ) {
        const consultationActe =
          await prisma.consultationActe.findFirst({
            where: {
              consultationId: consultationId,
              acteId: acteId,
            },

            select: {
              id: true,
              acteId: true,
              consultationId: true,
            },
          });

        if (consultationActe) {
          consultationActeId =
            consultationActe.id;
        }
      }

      /* =====================================================
         SI UN consultationActeId EXISTE
         
         ON RÉCUPÈRE L'ACTE RÉELLEMENT RÉALISÉ
      ===================================================== */

      if (consultationActeId) {
        const consultationActe =
          await prisma.consultationActe.findUnique({
            where: {
              id: consultationActeId,
            },

            select: {
              id: true,
              acteId: true,
              consultationId: true,

              acte: {
                select: {
                  id: true,
                  libelle: true,
                  montant: true,
                  actif: true,
                },
              },

              consultation: {
                select: {
                  idConsultation: true,
                  patientId: true,
                },
              },
            },
          });

        if (!consultationActe) {
          return {
            success: false,
            message:
              `L'acte de consultation #${consultationActeId} est introuvable.`,
          };
        }

        /* ---------------------------------------------------
           PATIENT
        --------------------------------------------------- */

        if (
          consultationActe.consultation.patientId !==
          input.patientId
        ) {
          return {
            success: false,
            message:
              "L'acte de consultation sélectionné n'appartient pas à ce patient.",
          };
        }

        /* ---------------------------------------------------
           CONSULTATION
        --------------------------------------------------- */

        if (
          consultationId &&
          consultationActe.consultationId !==
            consultationId
        ) {
          return {
            success: false,
            message:
              "L'acte sélectionné n'appartient pas à la consultation indiquée.",
          };
        }

        /* ---------------------------------------------------
           ACTE
           
           On force acteId à correspondre à l'acte réalisé.
        --------------------------------------------------- */

        acteId =
          consultationActe.acteId;

        /* ---------------------------------------------------
           ACTE ACTIF
        --------------------------------------------------- */

        if (
          consultationActe.acte &&
          !consultationActe.acte.actif
        ) {
          return {
            success: false,
            message:
              `L'acte médical #${consultationActe.acteId} est désactivé.`,
          };
        }

        /* ---------------------------------------------------
           DOUBLE FACTURATION
        --------------------------------------------------- */

        const dejaFacture =
          await prisma.ligneFacture.findFirst({
            where: {
              consultationActeId:
                consultationActeId,
            },

            select: {
              id: true,

              facture: {
                select: {
                  numero: true,
                  statut: true,
                },
              },
            },
          });

        if (dejaFacture) {
          return {
            success: false,
            message:
              `L'acte de consultation #${consultationActeId} est déjà facturé dans la facture ${dejaFacture.facture.numero}.`,
          };
        }
      }

      /* =====================================================
         ACTE DU CATALOGUE
         
         Seulement si l'acte existe directement sans
         consultationActe.
      ===================================================== */

      if (acteId) {
        const acte =
          await prisma.acteMedical.findUnique({
            where: {
              id: acteId,
            },

            select: {
              id: true,
              actif: true,
            },
          });

        if (!acte) {
          return {
            success: false,
            message:
              `L'acte médical #${acteId} est introuvable.`,
          };
        }

        if (!acte.actif) {
          return {
            success: false,
            message:
              `L'acte médical #${acteId} est désactivé.`,
          };
        }
      }

      /* =====================================================
         SERVICE DE LA LIGNE
      ===================================================== */

      if (ligneServiceId) {
        const ligneService =
          await prisma.service.findUnique({
            where: {
              id: ligneServiceId,
            },

            select: {
              id: true,
              actif: true,
            },
          });

        if (!ligneService) {
          return {
            success: false,
            message:
              `Le service #${ligneServiceId} est introuvable.`,
          };
        }

        if (!ligneService.actif) {
          return {
            success: false,
            message:
              `Le service #${ligneServiceId} est désactivé.`,
          };
        }
      }

      /* =====================================================
         LABORATOIRE
      ===================================================== */

      if (demandeLaboratoireLigneId) {
        const demandeLaboratoireLigne =
          await prisma.demandeLaboratoireLigne.findUnique({
            where: {
              id:
                demandeLaboratoireLigneId,
            },

            select: {
              id: true,

              demande: {
                select: {
                  patientId: true,
                },
              },
            },
          });

        if (!demandeLaboratoireLigne) {
          return {
            success: false,
            message:
              `La ligne de laboratoire #${demandeLaboratoireLigneId} est introuvable.`,
          };
        }

        if (
          demandeLaboratoireLigne.demande
            .patientId !== input.patientId
        ) {
          return {
            success: false,
            message:
              "La ligne de laboratoire sélectionnée n'appartient pas à ce patient.",
          };
        }

        const dejaFacture =
          await prisma.ligneFacture.findFirst({
            where: {
              demandeLaboratoireLigneId,
            },

            select: {
              id: true,

              facture: {
                select: {
                  numero: true,
                },
              },
            },
          });

        if (dejaFacture) {
          return {
            success: false,
            message:
              `La ligne de laboratoire #${demandeLaboratoireLigneId} est déjà facturée dans la facture ${dejaFacture.facture.numero}.`,
          };
        }
      }

      /* =====================================================
         IMAGERIE
      ===================================================== */

      if (demandeImagerieId) {
        const demandeImagerie =
          await prisma.demandeImagerie.findUnique({
            where: {
              id: demandeImagerieId,
            },

            select: {
              id: true,
              patientId: true,
            },
          });

        if (!demandeImagerie) {
          return {
            success: false,
            message:
              `La demande d'imagerie #${demandeImagerieId} est introuvable.`,
          };
        }

        if (
          demandeImagerie.patientId !==
          input.patientId
        ) {
          return {
            success: false,
            message:
              "La demande d'imagerie sélectionnée n'appartient pas à ce patient.",
          };
        }

        const dejaFacture =
          await prisma.ligneFacture.findFirst({
            where: {
              demandeImagerieId,
            },

            select: {
              id: true,

              facture: {
                select: {
                  numero: true,
                },
              },
            },
          });

        if (dejaFacture) {
          return {
            success: false,
            message:
              `La demande d'imagerie #${demandeImagerieId} est déjà facturée dans la facture ${dejaFacture.facture.numero}.`,
          };
        }
      }

      /* =====================================================
         PHARMACIE
      ===================================================== */

      if (dispensationLigneId) {
        const dispensationLigne =
          await prisma.dispensationLigne.findUnique({
            where: {
              id: dispensationLigneId,
            },

            select: {
              id: true,

              dispensation: {
                select: {
                  patientId: true,
                },
              },
            },
          });

        if (!dispensationLigne) {
          return {
            success: false,
            message:
              `La ligne de dispensation #${dispensationLigneId} est introuvable.`,
          };
        }

        if (
          dispensationLigne.dispensation
            .patientId !== input.patientId
        ) {
          return {
            success: false,
            message:
              "La ligne de dispensation sélectionnée n'appartient pas à ce patient.",
          };
        }

        const dejaFacture =
          await prisma.ligneFacture.findFirst({
            where: {
              dispensationLigneId,
            },

            select: {
              id: true,

              facture: {
                select: {
                  numero: true,
                },
              },
            },
          });

        if (dejaFacture) {
          return {
            success: false,
            message:
              `La ligne de dispensation #${dispensationLigneId} est déjà facturée dans la facture ${dejaFacture.facture.numero}.`,
          };
        }
      }

      /* =====================================================
         MONTANT
      ===================================================== */

      const montant =
        roundMoney(
          quantite *
            prixUnitaire,
        );

      /* =====================================================
         AJOUT LIGNE
      ===================================================== */

      lignes.push({
        designation,
        quantite,

        prixUnitaire:
          roundMoney(
            prixUnitaire,
          ),

        montant,

        /*
         * ACTE DU CATALOGUE
         */
        acteId,

        /*
         * ACTE RÉELLEMENT RÉALISÉ
         */
        consultationActeId,

        serviceId:
          ligneServiceId,

        demandeLaboratoireLigneId,

        demandeImagerieId,

        dispensationLigneId,

        reference:
          cleanString(
            ligne?.reference,
          ) || undefined,
      });
    }

    /* =======================================================
       VALIDATION FINALE
    ======================================================= */

    if (lignes.length === 0) {
      return {
        success: false,
        message:
          "Aucune ligne de facture valide.",
      };
    }

    /* =======================================================
       MONTANT BRUT
    ======================================================= */

    const montantBrut =
      roundMoney(
        lignes.reduce(
          (total, ligne) =>
            total +
            Number(
              ligne.montant ?? 0,
            ),
          0,
        ),
      );

    /* =======================================================
       TYPE RÉDUCTION
    ======================================================= */

    const typeReduction =
      input.typeReduction ===
      "POURCENTAGE"
        ? "POURCENTAGE"
        : "MONTANT";

    /* =======================================================
       RÉDUCTION
    ======================================================= */

    let reductionInput =
      Number(
        input.reduction ?? 0,
      );

    if (
      !Number.isFinite(
        reductionInput,
      ) ||
      reductionInput < 0
    ) {
      reductionInput = 0;
    }

    let reduction = 0;

    if (
      typeReduction ===
      "POURCENTAGE"
    ) {
      reductionInput =
        Math.min(
          reductionInput,
          100,
        );

      reduction =
        roundMoney(
          montantBrut *
            (reductionInput /
              100),
        );
    } else {
      reduction =
        roundMoney(
          Math.min(
            reductionInput,
            montantBrut,
          ),
        );
    }

    /* =======================================================
       TOTAL
    ======================================================= */

    const montantTotal =
      roundMoney(
        Math.max(
          0,
          montantBrut -
            reduction,
        ),
      );

    /* =======================================================
       DEVISE
    ======================================================= */

    const devise =
      cleanString(
        input.devise,
      ).toUpperCase() ||
      "USD";

    /* =======================================================
       STATUT
    ======================================================= */

    const statut =
      montantTotal === 0
        ? "PAYEE"
        : "IMPAYEE";

    /* =======================================================
       NUMÉRO FACTURE
    ======================================================= */

    const numero =
      await generateUniqueFactureNumero();

    /* =======================================================
       TRANSACTION
    ======================================================= */

    const facture =
      await prisma.$transaction(
        async (tx) => {

          /* =================================================
             DOUBLE FACTURATION DANS TRANSACTION
          ================================================= */

          for (const ligne of lignes) {
            if (
              ligne.consultationActeId
            ) {
              const existe =
                await tx.ligneFacture.findFirst({
                  where: {
                    consultationActeId:
                      ligne.consultationActeId,
                  },

                  select: {
                    id: true,

                    facture: {
                      select: {
                        numero: true,
                      },
                    },
                  },
                });

              if (existe) {
                throw new Error(
                  `L'acte de consultation #${ligne.consultationActeId} est déjà facturé dans la facture ${existe.facture.numero}.`,
                );
              }
            }
          }

          /* =================================================
             CRÉATION FACTURE
          ================================================= */

          const nouvelleFacture =
            await tx.facture.create({
              data: {
                numero,

                patientId:
                  input.patientId,

                consultationId,
                admissionId,
                hospitalisationId,
                proformaId,

                montantBrut,
                reduction,
                montantTotal,

                montantPaye: 0,

                reste:
                  montantTotal,

                typeReduction,

                devise,

                statut,

                lignes: {
                  create:
                    lignes.map(
                      (ligne) => ({
                        designation:
                          ligne.designation,

                        quantite:
                          ligne.quantite,

                        prixUnitaire:
                          ligne.prixUnitaire,

                        montant:
                          ligne.montant!,

                        /*
                         * ACTE CATALOGUE
                         */
                        acteId:
                          ligne.acteId,

                        /*
                         * ⭐ ACTE RÉALISÉ
                         *
                         * C'EST CETTE VALEUR QUI DOIT
                         * ÊTRE ENREGISTRÉE.
                         */
                        consultationActeId:
                          ligne.consultationActeId,

                        /*
                         * SERVICE
                         */
                        serviceId:
                          ligne.serviceId,

                        /*
                         * LABORATOIRE
                         */
                        demandeLaboratoireLigneId:
                          ligne.demandeLaboratoireLigneId,

                        /*
                         * IMAGERIE
                         */
                        demandeImagerieId:
                          ligne.demandeImagerieId,

                        /*
                         * PHARMACIE
                         */
                        dispensationLigneId:
                          ligne.dispensationLigneId,

                        /*
                         * RÉFÉRENCE
                         */
                        reference:
                          ligne.reference,
                      }),
                    ),
                },
              },

              include: {
                patient: true,

                consultation: {
                  include: {
                    medecin: true,
                    service: true,
                  },
                },

                admission: {
                  include: {
                    service: true,
                  },
                },

                hospitalisation: {
                  include: {
                    service: true,
                  },
                },

                proforma: true,

                lignes: {
                  include: {
                    service: true,
                    acte: true,

                    /*
                     * ⭐ TRÈS IMPORTANT
                     */
                    consultationActe: {
                      include: {
                        acte: true,
                        consultation: true,
                      },
                    },

                    demandeLaboratoireLigne:
                      true,

                    demandeImagerie:
                      true,

                    dispensationLigne:
                      true,
                  },
                },
              },
            });

          /* =================================================
             PROFORMA → FACTUREE
          ================================================= */

          if (proformaId) {
            await tx.proforma.update({
              where: {
                id: proformaId,
              },

              data: {
                statut:
                  "FACTUREE",
              },
            });
          }

          return nouvelleFacture;
        },
      );

    /* =======================================================
       REVALIDATION
    ======================================================= */

    revalidatePath(
      "/facturation",
    );

    revalidatePath(
      "/facturation/factures",
    );

    revalidatePath(
      "/facturation/proformas",
    );

    revalidatePath(
      "/facturation/paiements",
    );

    revalidatePath(
      "/facturation/actes",
    );

    revalidatePath(
      "/facturation/factures/nouveau",
    );

    /* =======================================================
       RETOUR
    ======================================================= */

    return {
      success: true,

      message:
        "Facture créée avec succès.",

      data: facture,
    };

  } catch (error) {
    console.error(
      "ERREUR createFacture :",
      error,
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la facture.",
    };
  }
}


/* ==========================================================
   ACTES MÉDICAUX — LISTE
========================================================== */

export async function getActesMedicaux(): Promise<
  ActionResult
> {
  try {
    const actes =
      await prisma.acteMedical.findMany({
        orderBy: {
          libelle: "asc",
        },
      });

    return {
      success: true,
      message:
        "Actes récupérés avec succès.",
      data: actes,
    };
  } catch (error) {
    console.error(
      "ERREUR getActesMedicaux :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement des actes médicaux.",
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — PAR ID
========================================================== */

export async function getActeMedicalById(
  id: number
): Promise<ActionResult> {
  try {
    if (!isValidId(id)) {
      return {
        success: false,
        message:
          "Identifiant d'acte invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
      });

    if (!acte) {
      return {
        success: false,
        message:
          "Acte médical introuvable.",
      };
    }

    return {
      success: true,
      message: "Acte récupéré.",
      data: acte,
    };
  } catch (error) {
    console.error(
      "ERREUR getActeMedicalById :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement de l'acte.",
    };
  }
}

/* ==========================================================
   CRÉER ACTE MÉDICAL
========================================================== */

export async function createActeMedical(input: {
  code: string;
  libelle: string;
  categorie?: string;
  montant: number;
  devise?: string;
  actif?: boolean;
}): Promise<ActionResult> {
  try {
    const code =
      cleanString(input?.code).toUpperCase();

    const libelle =
      cleanString(input?.libelle);

    const montant =
      Number(input?.montant);

    if (!code) {
      return {
        success: false,
        message:
          "Le code est obligatoire.",
      };
    }

    if (!libelle) {
      return {
        success: false,
        message:
          "Le libellé est obligatoire.",
      };
    }

    if (
      !Number.isFinite(montant) ||
      montant < 0
    ) {
      return {
        success: false,
        message:
          "Le montant de l'acte est invalide.",
      };
    }

    const existe =
      await prisma.acteMedical.findUnique({
        where: {
          code,
        },
      });

    if (existe) {
      return {
        success: false,
        message:
          "Un acte médical avec ce code existe déjà.",
      };
    }

    const acte =
      await prisma.acteMedical.create({
        data: {
          code,

          libelle,

          categorie:
            cleanString(input?.categorie) ||
            null,

          montant:
            roundMoney(montant),

          devise:
            cleanString(input?.devise)
              .toUpperCase() || "USD",

          actif:
            input?.actif ?? true,
        },
      });

    revalidatePath(
      "/facturation/actes"
    );

    revalidatePath(
      "/facturation/factures/nouveau"
    );

    return {
      success: true,
      message:
        "Acte médical créé avec succès.",
      data: acte,
    };
  } catch (error) {
    console.error(
      "ERREUR createActeMedical :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors de la création de l'acte médical.",
    };
  }
}

/* ==========================================================
   MODIFIER ACTE MÉDICAL
========================================================== */

export async function updateActeMedical(
  id: number,
  input: {
    code?: string;
    libelle?: string;
    categorie?: string;
    montant?: number;
    devise?: string;
    actif?: boolean;
  }
): Promise<ActionResult> {
  try {
    if (!isValidId(id)) {
      return {
        success: false,
        message:
          "Identifiant d'acte invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
      });

    if (!acte) {
      return {
        success: false,
        message:
          "Acte médical introuvable.",
      };
    }

    const data: {
      code?: string;
      libelle?: string;
      categorie?: string | null;
      montant?: number;
      devise?: string;
      actif?: boolean;
    } = {};

    /* -------------------------------------------------------
       CODE
    ------------------------------------------------------- */

    if (input.code !== undefined) {
      const code =
        cleanString(input.code)
          .toUpperCase();

      if (!code) {
        return {
          success: false,
          message:
            "Le code est obligatoire.",
        };
      }

      const autre =
        await prisma.acteMedical.findFirst({
          where: {
            code,
            NOT: {
              id,
            },
          },
        });

      if (autre) {
        return {
          success: false,
          message:
            "Ce code est déjà utilisé.",
        };
      }

      data.code = code;
    }

    /* -------------------------------------------------------
       LIBELLÉ
    ------------------------------------------------------- */

    if (
      input.libelle !== undefined
    ) {
      const libelle =
        cleanString(input.libelle);

      if (!libelle) {
        return {
          success: false,
          message:
            "Le libellé est obligatoire.",
        };
      }

      data.libelle = libelle;
    }

    /* -------------------------------------------------------
       CATÉGORIE
    ------------------------------------------------------- */

    if (
      input.categorie !== undefined
    ) {
      data.categorie =
        cleanString(input.categorie) ||
        null;
    }

    /* -------------------------------------------------------
       MONTANT
    ------------------------------------------------------- */

    if (
      input.montant !== undefined
    ) {
      const montant =
        Number(input.montant);

      if (
        !Number.isFinite(montant) ||
        montant < 0
      ) {
        return {
          success: false,
          message:
            "Montant invalide.",
        };
      }

      data.montant =
        roundMoney(montant);
    }

    /* -------------------------------------------------------
       DEVISE
    ------------------------------------------------------- */

    if (
      input.devise !== undefined
    ) {
      data.devise =
        cleanString(input.devise)
          .toUpperCase() || "USD";
    }

    /* -------------------------------------------------------
       ACTIF
    ------------------------------------------------------- */

    if (
      input.actif !== undefined
    ) {
      data.actif =
        input.actif;
    }

    /* -------------------------------------------------------
       AUCUNE MODIFICATION
    ------------------------------------------------------- */

    if (
      Object.keys(data).length === 0
    ) {
      return {
        success: false,
        message:
          "Aucune modification à effectuer.",
      };
    }

    const updated =
      await prisma.acteMedical.update({
        where: {
          id,
        },

        data,
      });

    revalidatePath(
      "/facturation/actes"
    );

    revalidatePath(
      "/facturation/factures/nouveau"
    );

    return {
      success: true,
      message:
        "Acte médical modifié avec succès.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "ERREUR updateActeMedical :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors de la modification de l'acte.",
    };
  }
}

/* ==========================================================
   ACTIVER / DÉSACTIVER ACTE
========================================================== */

export async function toggleActeMedical(
  id: number
): Promise<ActionResult> {
  try {
    if (!isValidId(id)) {
      return {
        success: false,
        message:
          "Identifiant d'acte invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
      });

    if (!acte) {
      return {
        success: false,
        message:
          "Acte médical introuvable.",
      };
    }

    const updated =
      await prisma.acteMedical.update({
        where: {
          id,
        },

        data: {
          actif: !acte.actif,
        },
      });

    revalidatePath(
      "/facturation/actes"
    );

    revalidatePath(
      "/facturation/factures/nouveau"
    );

    return {
      success: true,

      message: updated.actif
        ? "Acte activé."
        : "Acte désactivé.",

      data: updated,
    };
  } catch (error) {
    console.error(
      "ERREUR toggleActeMedical :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors de la modification de l'acte.",
    };
  }
}

/* ==========================================================
   DASHBOARD FACTURATION
========================================================== */

export async function getFacturationDashboard(): Promise<
  ActionResult
> {
  try {
    const [
      totalFactures,
      facturesImpayees,
      facturesPartielles,
      facturesPayees,
      totalProformas,
      aggregate,
    ] = await Promise.all([
      prisma.facture.count(),

      prisma.facture.count({
        where: {
          statut: "IMPAYEE",
        },
      }),

      prisma.facture.count({
        where: {
          statut:
            "PARTIELLEMENT_PAYEE",
        },
      }),

      prisma.facture.count({
        where: {
          statut: "PAYEE",
        },
      }),

      prisma.proforma.count(),

      prisma.facture.aggregate({
        _sum: {
          montantTotal: true,
          montantPaye: true,
          reste: true,
          montantBrut: true,
          reduction: true,
        },
      }),
    ]);

    return {
      success: true,

      message:
        "Dashboard de facturation chargé.",

      data: {
        totalFactures,

        facturesImpayees,

        facturesPartielles,

        facturesPayees,

        totalProformas,

        totalFacture:
          aggregate._sum.montantTotal ??
          0,

        totalBrut:
          aggregate._sum.montantBrut ??
          0,

        totalReduction:
          aggregate._sum.reduction ??
          0,

        totalPaye:
          aggregate._sum.montantPaye ??
          0,

        totalReste:
          aggregate._sum.reste ??
          0,
      },
    };
  } catch (error) {
    console.error(
      "ERREUR getFacturationDashboard :",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors du chargement du dashboard de facturation.",
    };
  }
}

/* ==========================================================
   PATIENTS — FORMULAIRE FACTURE
========================================================== */

export async function getPatientsFacturation(): Promise<
  ActionResult
> {
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
      "ERREUR getPatientsFacturation :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement des patients.",
    };
  }
}

/* ==========================================================
   SERVICES — FACTURATION
========================================================== */

export async function getServicesFacturation(): Promise<
  ActionResult
> {
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
      "ERREUR getServicesFacturation :",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement des services.",
    };
  }
}

/* ==========================================================
   REVALIDATION FACTURATION
========================================================== */

export async function refreshFacturation(): Promise<
  ActionResult
> {
  try {
    const paths = [
      "/facturation",
      "/facturation/factures",
      "/facturation/proformas",
      "/facturation/paiements",
      "/facturation/actes",
      "/facturation/factures/nouveau",
    ];

    for (const path of paths) {
      revalidatePath(path);
    }

    return {
      success: true,
      message:
        "Données de facturation actualisées.",
    };
  } catch (error) {
    console.error(
      "ERREUR refreshFacturation :",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'actualiser les données.",
    };
  }
}


/* ==========================================================
   ACTES MÉDICAUX — DISPONIBLES POUR FACTURATION
========================================================== */

/* ==========================================================
   ACTES MÉDICAUX — DISPONIBLES POUR FACTURATION
========================================================== */

export async function getActesMedicauxDisponibles(
  patientId: number
): Promise<ActionResult> {
  try {
    if (!isValidId(patientId)) {
      return {
        success: false,
        message: "Identifiant du patient invalide.",
      };
    }

    /* -------------------------------------------------------
       PATIENT
    ------------------------------------------------------- */

    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
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
        message: "Le patient est désactivé.",
      };
    }

    /* -------------------------------------------------------
       ACTES DÉJÀ FACTURÉS POUR CE PATIENT
    ------------------------------------------------------- */

    const actesDejaFactures =
      await prisma.factureLigne.findMany({
        where: {
          facture: {
            is: {
              patientId: patientId,
            },
          },

          acteId: {
            not: null,
          },
        },

        select: {
          acteId: true,
        },

        distinct: ["acteId"],
      });

    const actesFacturesIds = actesDejaFactures
      .map((ligne) => ligne.acteId)
      .filter(
        (id): id is number => id !== null
      );

    /* -------------------------------------------------------
       ACTES DISPONIBLES
    ------------------------------------------------------- */

    const actes = await prisma.acteMedical.findMany({
      where: {
        actif: true,

        ...(actesFacturesIds.length > 0
          ? {
              id: {
                notIn: actesFacturesIds,
              },
            }
          : {}),
      },

      orderBy: {
        libelle: "asc",
      },
    });

    return {
      success: true,

      message:
        "Prestations disponibles récupérées avec succès.",

      data: actes,
    };
  } catch (error) {
    console.error(
      "ERREUR getActesMedicauxDisponibles :",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors du chargement des prestations disponibles.",
    };
  }
}