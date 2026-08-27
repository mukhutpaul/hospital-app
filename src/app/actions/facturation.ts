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
   UTILITAIRE — NUMÉRO
========================================================== */

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
      message:
        "Erreur lors du chargement des factures.",
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
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant de facture invalide.",
      };
    }

    const facture = await prisma.facture.findUnique({
      where: {
        id,
      },

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
      message:
        "Erreur lors du chargement de la facture.",
    };
  }
}

/* ==========================================================
   CRÉER FACTURE
========================================================== */

export async function createFacture(input: {
  patientId: number;

  consultationId?: number;
  admissionId?: number;
  hospitalisationId?: number;
  proformaId?: number;

  serviceId?: number;

  reduction?: number;
  typeReduction?: string;

  devise?: string;

  lignes: {
    designation: string;
    quantite: number;
    prixUnitaire: number;

    montant?: number;

    acteId?: number;
    serviceId?: number;

    reference?: string;
  }[];
}): Promise<ActionResult> {
  try {
    /* -------------------------------------------------------
       VALIDATION PATIENT
    ------------------------------------------------------- */

    if (
      !Number.isInteger(input.patientId) ||
      input.patientId <= 0
    ) {
      return {
        success: false,
        message: "Patient invalide.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: {
        id: input.patientId,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    /* -------------------------------------------------------
       VALIDATION LIGNES
    ------------------------------------------------------- */

    if (!Array.isArray(input.lignes) || input.lignes.length === 0) {
      return {
        success: false,
        message:
          "La facture doit contenir au moins une ligne.",
      };
    }

    /* -------------------------------------------------------
       CONSTRUCTION DES LIGNES
    ------------------------------------------------------- */

    const lignes = input.lignes
      .map((ligne) => {
        const designation =
          String(ligne.designation ?? "").trim();

        const quantite = Number(ligne.quantite);
        const prixUnitaire = Number(ligne.prixUnitaire);

        if (!designation) {
          return null;
        }

        if (
          !Number.isFinite(quantite) ||
          quantite <= 0
        ) {
          return null;
        }

        if (
          !Number.isFinite(prixUnitaire) ||
          prixUnitaire < 0
        ) {
          return null;
        }

        return {
          designation,

          quantite,

          prixUnitaire,

          montant: quantite * prixUnitaire,

          acteId:
            ligne.acteId &&
            Number.isInteger(ligne.acteId)
              ? ligne.acteId
              : null,

          serviceId:
            ligne.serviceId &&
            Number.isInteger(ligne.serviceId)
              ? ligne.serviceId
              : input.serviceId &&
                  Number.isInteger(input.serviceId)
                ? input.serviceId
                : null,

          reference:
            ligne.reference?.trim() || null,
        };
      })
      .filter(
        (
          ligne
        ): ligne is {
          designation: string;
          quantite: number;
          prixUnitaire: number;
          montant: number;
          acteId: number | null;
          serviceId: number | null;
          reference: string | null;
        } => ligne !== null
      );

    if (lignes.length === 0) {
      return {
        success: false,
        message:
          "Aucune ligne de facture valide.",
      };
    }

    /* -------------------------------------------------------
       MONTANTS
    ------------------------------------------------------- */

    const montantBrut = lignes.reduce(
      (total, ligne) =>
        total + ligne.montant,
      0
    );

    let reduction = Number(
      input.reduction ?? 0
    );

    if (!Number.isFinite(reduction)) {
      reduction = 0;
    }

    reduction = Math.max(
      0,
      Math.min(reduction, montantBrut)
    );

    const montantTotal = Math.max(
      0,
      montantBrut - reduction
    );

    /* -------------------------------------------------------
       TYPE DE RÉDUCTION
    ------------------------------------------------------- */

    const typeReduction =
      input.typeReduction === "POURCENTAGE"
        ? "POURCENTAGE"
        : "MONTANT";

    /* -------------------------------------------------------
       DEVISE
    ------------------------------------------------------- */

    const devise =
      input.devise?.trim() || "USD";

    /* -------------------------------------------------------
       NUMÉRO
    ------------------------------------------------------- */

    const numero =
      generateNumero("FAC");

    /* -------------------------------------------------------
       CRÉATION FACTURE
    ------------------------------------------------------- */

    const facture =
      await prisma.facture.create({
        data: {
          numero,

          patientId:
            input.patientId,

          consultationId:
            input.consultationId &&
            Number.isInteger(
              input.consultationId
            )
              ? input.consultationId
              : null,

          admissionId:
            input.admissionId &&
            Number.isInteger(
              input.admissionId
            )
              ? input.admissionId
              : null,

          hospitalisationId:
            input.hospitalisationId &&
            Number.isInteger(
              input.hospitalisationId
            )
              ? input.hospitalisationId
              : null,

          proformaId:
            input.proformaId &&
            Number.isInteger(
              input.proformaId
            )
              ? input.proformaId
              : null,

          montantBrut,

          reduction,

          montantTotal,

          montantPaye: 0,

          reste: montantTotal,

          typeReduction,

          devise,

          statut:
            montantTotal <= 0
              ? "PAYEE"
              : "IMPAYEE",

          lignes: {
            create: lignes,
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
            },
          },
        },
      });

    /* -------------------------------------------------------
       PROFORMA → FACTURÉE
    ------------------------------------------------------- */

    if (
      input.proformaId &&
      Number.isInteger(input.proformaId)
    ) {
      await prisma.proforma.update({
        where: {
          id: input.proformaId,
        },

        data: {
          statut: "FACTUREE",
        },
      });
    }

    /* -------------------------------------------------------
       REVALIDATION
    ------------------------------------------------------- */

    revalidatePath("/facturation");

    revalidatePath(
      "/facturation/factures"
    );

    revalidatePath(
      "/facturation/proformas"
    );

    return {
      success: true,

      message:
        "Facture créée avec succès.",

      data: facture,
    };
  } catch (error) {
    console.error(
      "ERREUR createFacture :",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors de la création de la facture.",
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
      message: "Actes récupérés avec succès.",
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
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant d'acte invalide.",
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
        message: "Acte médical introuvable.",
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
      input.code?.trim().toUpperCase();

    const libelle =
      input.libelle?.trim();

    const montant =
      Number(input.montant);

    if (!code) {
      return {
        success: false,
        message: "Le code est obligatoire.",
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
            input.categorie?.trim() || null,

          montant,

          devise:
            input.devise?.trim() || "USD",

          actif:
            input.actif ?? true,
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
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant d'acte invalide.",
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

    if (input.code !== undefined) {
      const code =
        input.code.trim().toUpperCase();

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

    if (input.libelle !== undefined) {
      const libelle =
        input.libelle.trim();

      if (!libelle) {
        return {
          success: false,
          message:
            "Le libellé est obligatoire.",
        };
      }

      data.libelle = libelle;
    }

    if (
      input.categorie !== undefined
    ) {
      data.categorie =
        input.categorie.trim() || null;
    }

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

      data.montant = montant;
    }

    if (
      input.devise !== undefined
    ) {
      data.devise =
        input.devise.trim() || "USD";
    }

    if (
      input.actif !== undefined
    ) {
      data.actif = input.actif;
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
    if (!Number.isInteger(id) || id <= 0) {
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
      /* -----------------------------------------------------
         TOTAL FACTURES
      ----------------------------------------------------- */

      prisma.facture.count(),

      /* -----------------------------------------------------
         FACTURES IMPAYÉES
      ----------------------------------------------------- */

      prisma.facture.count({
        where: {
          statut: "IMPAYEE",
        },
      }),

      /* -----------------------------------------------------
         FACTURES PARTIELLEMENT PAYÉES
      ----------------------------------------------------- */

      prisma.facture.count({
        where: {
          statut:
            "PARTIELLEMENT_PAYEE",
        },
      }),

      /* -----------------------------------------------------
         FACTURES PAYÉES
      ----------------------------------------------------- */

      prisma.facture.count({
        where: {
          statut: "PAYEE",
        },
      }),

      /* -----------------------------------------------------
         TOTAL PROFORMAS
      ----------------------------------------------------- */

      prisma.proforma.count(),

      /* -----------------------------------------------------
         AGRÉGATION
      ----------------------------------------------------- */

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
          aggregate._sum.montantTotal ?? 0,

        totalBrut:
          aggregate._sum.montantBrut ?? 0,

        totalReduction:
          aggregate._sum.reduction ?? 0,

        totalPaye:
          aggregate._sum.montantPaye ?? 0,

        totalReste:
          aggregate._sum.reste ?? 0,
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
   PATIENTS — POUR FORMULAIRE FACTURE
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
   SERVICES — POUR FACTURATION
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
    revalidatePath(
      "/facturation"
    );

    revalidatePath(
      "/facturation/factures"
    );

    revalidatePath(
      "/facturation/proformas"
    );

    revalidatePath(
      "/facturation/paiements"
    );

    revalidatePath(
      "/facturation/actes"
    );

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