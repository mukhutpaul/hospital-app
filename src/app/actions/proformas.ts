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

export type ProformaLigneInput = {
  typeOrigine?: string;

  acteId?: number | null;
  serviceId?: number | null;

  consultationId?: number | null;
  demandeLaboratoireId?: number | null;
  demandeImagerieId?: number | null;
  dispensationId?: number | null;
  hospitalisationId?: number | null;

  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant?: number;

  reference?: string | null;
};

/* ==========================================================
   NUMÉRO
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
   UTILITAIRES
========================================================== */

function isValidId(id?: number | null): boolean {
  return id == null || (Number.isInteger(id) && id > 0);
}

function toPositiveNumber(value: unknown): number {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
}

/* ==========================================================
   LISTE DES PROFORMAS
========================================================== */

export async function getProformas(): Promise<ActionResult> {
  try {
    const proformas = await prisma.proforma.findMany({
      orderBy: {
        dateEmission: "desc",
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

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            service: true,
            acte: true,
          },
        },

        facture: {
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
      message: "Proformas récupérées.",
      data: proformas,
    };
  } catch (error) {
    console.error("getProformas:", error);

    return {
      success: false,
      message: "Erreur lors du chargement des proformas.",
      data: [],
    };
  }
}

/* ==========================================================
   PROFORMA PAR ID
========================================================== */

export async function getProformaById(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const proforma = await prisma.proforma.findUnique({
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

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            service: true,
            acte: true,
          },
        },

        facture: {
          select: {
            id: true,
            numero: true,
            statut: true,
          },
        },
      },
    });

    if (!proforma) {
      return {
        success: false,
        message: "Proforma introuvable.",
      };
    }

    return {
      success: true,
      message: "Proforma récupérée.",
      data: proforma,
    };
  } catch (error) {
    console.error("getProformaById:", error);

    return {
      success: false,
      message: "Erreur lors du chargement de la proforma.",
    };
  }
}

/* ==========================================================
   PRESTATIONS DU PATIENT
========================================================== */

export async function getPatientPrestations(
  patientId: number,
): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return {
        success: false,
        message: "Patient invalide.",
      };
    }

    /* ======================================================
       PATIENT
    ====================================================== */

    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },

      select: {
        id: true,
        numeroDossier: true,
        nom: true,
        postNom: true,
        prenom: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    /* ======================================================
       FACTURES DU PATIENT
       
       IMPORTANT :
       On travaille maintenant avec FACTURE + LIGNEFACTURE.
       Une prestation n'est considérée comme consommée que
       lorsqu'elle existe réellement dans une facture.
    ====================================================== */

    const factures = await prisma.facture.findMany({
      where: {
        patientId,
      },

      select: {
        id: true,
        numero: true,
        consultationId: true,
        hospitalisationId: true,

        lignes: {
          select: {
            id: true,
            acteId: true,
            consultationActeId: true,
            serviceId: true,
            demandeLaboratoireLigneId: true,
            demandeImagerieId: true,

            designation: true,
            quantite: true,
            prixUnitaire: true,
            montant: true,
            reference: true,
          },
        },
      },
    });

    /* ======================================================
       ENSEMBLES DES PRESTATIONS DÉJÀ FACTURÉES
    ====================================================== */

    /**
     * LABORATOIRE
     *
     * Ici on utilise :
     * LigneFacture.demandeLaboratoireLigneId
     */
    const lignesLaboratoireFacturees = new Set<number>();

    /**
     * IMAGERIE
     *
     * Ici on utilise :
     * LigneFacture.demandeImagerieId
     */
    const demandesImagerieFacturees = new Set<number>();

    /**
     * ACTES DE CONSULTATION
     *
     * Ici on utilise :
     * LigneFacture.consultationActeId
     */
    const consultationsActesFactures = new Set<number>();

    /**
     * ACTES MÉDICAUX DU CATALOGUE
     */
    const actesFactures = new Set<number>();

    /**
     * CONSULTATIONS
     */
    const consultationsFacturees = new Set<number>();

    /**
     * HOSPITALISATIONS
     *
     * Ici on récupère directement Facture.hospitalisationId.
     */
    const hospitalisationsFacturees = new Set<number>();

    for (const facture of factures) {
      /* ----------------------------------------------------
         CONSULTATION
      ---------------------------------------------------- */

      if (facture.consultationId !== null) {
        consultationsFacturees.add(facture.consultationId);
      }

      /* ----------------------------------------------------
         HOSPITALISATION
      ---------------------------------------------------- */

      if (facture.hospitalisationId !== null) {
        hospitalisationsFacturees.add(facture.hospitalisationId);
      }

      /* ----------------------------------------------------
         LIGNES DE FACTURE
      ---------------------------------------------------- */

      for (const ligne of facture.lignes) {
        if (ligne.demandeLaboratoireLigneId !== null) {
          lignesLaboratoireFacturees.add(ligne.demandeLaboratoireLigneId);
        }

        if (ligne.demandeImagerieId !== null) {
          demandesImagerieFacturees.add(ligne.demandeImagerieId);
        }

        if (ligne.consultationActeId !== null) {
          consultationsActesFactures.add(ligne.consultationActeId);
        }

        if (ligne.acteId !== null) {
          actesFactures.add(ligne.acteId);
        }
      }
    }

    /* ======================================================
       PHARMACIE
       
       ATTENTION :
       Ton modèle LigneFacture ne possède actuellement
       aucun dispensationId ni dispensationLigneId.

       On récupère donc les dispensations, mais on ne peut
       PAS déterminer avec certitude qu'une dispensation
       particulière a déjà été facturée.

       On les retourne donc pour le moment.
    ====================================================== */

    const dispensations = await prisma.dispensation.findMany({
      where: {
        patientId,

        statut: {
          not: "ANNULEE",
        },
      },

      orderBy: {
        dateDispensation: "desc",
      },

      select: {
        id: true,
        numero: true,
        dateDispensation: true,
        statut: true,

        lignes: {
          select: {
            id: true,
            quantiteDispensee: true,
            prixUnitaire: true,
            montant: true,

            medicament: {
              select: {
                id: true,
                nom: true,
                code: true,
                forme: true,
                dosage: true,
              },
            },
          },
        },
      },
    });

    const pharmacie = dispensations.flatMap((dispensation) => {
      return dispensation.lignes.map((ligne) => {
        const quantite = toPositiveNumber(ligne.quantiteDispensee);

        const prix = toPositiveNumber(ligne.prixUnitaire);

        const montant = toPositiveNumber(ligne.montant ?? quantite * prix);

        return {
          id: `PHARMACIE-${dispensation.id}-${ligne.id}`,

          sourceId: ligne.id,

          typeOrigine: "PHARMACIE",

          designation:
            `Médicament : ${ligne.medicament.nom}` +
            (ligne.medicament.dosage ? ` ${ligne.medicament.dosage}` : "") +
            (ligne.medicament.forme ? ` (${ligne.medicament.forme})` : ""),

          quantite,

          prixUnitaire: prix,

          montant,

          reference: dispensation.numero,

          dispensationId: dispensation.id,

          dispensationLigneId: ligne.id,
        };
      });
    });

    /* ======================================================
       LABORATOIRE
    ====================================================== */

    const demandesLabo = await prisma.demandeLaboratoire.findMany({
      where: {
        patientId,
      },

      orderBy: {
        dateDemande: "desc",
      },

      select: {
        id: true,
        numero: true,
        dateDemande: true,
        statut: true,

        serviceId: true,
        consultationId: true,

        lignes: {
          select: {
            id: true,
            prix: true,

            examen: {
              select: {
                id: true,
                code: true,
                nom: true,
                prix: true,
              },
            },
          },
        },
      },
    });

    const laboratoire = demandesLabo.flatMap((demande) => {
      return demande.lignes
        .filter((ligne) => !lignesLaboratoireFacturees.has(ligne.id))
        .map((ligne) => {
          const prix = toPositiveNumber(ligne.prix ?? ligne.examen.prix);

          return {
            id: `LABO-${demande.id}-${ligne.id}`,

            sourceId: ligne.id,

            typeOrigine: "LABORATOIRE",

            designation: `Examen laboratoire : ${ligne.examen.nom}`,

            quantite: 1,

            prixUnitaire: prix,

            montant: prix,

            reference: demande.numero,

            demandeLaboratoireId: demande.id,

            demandeLaboratoireLigneId: ligne.id,

            serviceId: demande.serviceId ?? null,

            consultationId: demande.consultationId ?? null,
          };
        });
    });

    /* ======================================================
       IMAGERIE
    ====================================================== */

    const demandesImagerie = await prisma.demandeImagerie.findMany({
      where: {
        patientId,
      },

      orderBy: {
        dateDemande: "desc",
      },

      select: {
        id: true,
        numero: true,
        dateDemande: true,
        statut: true,

        serviceId: true,
        consultationId: true,

        examen: {
          select: {
            id: true,
            code: true,
            nom: true,
            type: true,
            prix: true,
          },
        },
      },
    });

    const imagerie = demandesImagerie
      .filter((demande) => !demandesImagerieFacturees.has(demande.id))
      .map((demande) => {
        const prix = toPositiveNumber(demande.examen.prix);

        return {
          id: `IMAGERIE-${demande.id}`,

          sourceId: demande.id,

          typeOrigine: "IMAGERIE",

          designation: `Imagerie : ${demande.examen.nom}`,

          quantite: 1,

          prixUnitaire: prix,

          montant: prix,

          reference: demande.numero,

          demandeImagerieId: demande.id,

          serviceId: demande.serviceId ?? null,

          consultationId: demande.consultationId ?? null,
        };
      });

    /* ======================================================
       HOSPITALISATION
    ====================================================== */

    const hospitalisations = await prisma.hospitalisation.findMany({
      where: {
        patientId,
      },

      orderBy: {
        dateEntree: "desc",
      },

      select: {
        id: true,
        numero: true,
        dateEntree: true,
        dateSortie: true,
        statut: true,

        serviceId: true,

        lit: {
          select: {
            numero: true,

            chambre: {
              select: {
                numero: true,
                type: true,
                prixJournalier: true,
              },
            },
          },
        },

        service: {
          select: {
            id: true,
            nom: true,
          },
        },

        soins: {
          select: {
            id: true,
            type: true,
            description: true,
            dateSoin: true,
          },
        },
      },
    });

    const hospitalisationPrestations = hospitalisations.flatMap(
      (hospitalisation) => {
        /*
         * Si une facture possède hospitalisationId,
         * on considère cette hospitalisation comme déjà
         * facturée.
         */
        if (hospitalisationsFacturees.has(hospitalisation.id)) {
          return [];
        }

        const result: ProformaLigneInput[] = [];

        /* ==============================================
             CHAMBRE
          ============================================== */

        const prixJournalier = toPositiveNumber(
          hospitalisation.lit?.chambre?.prixJournalier,
        );

        if (prixJournalier > 0) {
          const dateDebut = new Date(hospitalisation.dateEntree);

          const dateFin = hospitalisation.dateSortie
            ? new Date(hospitalisation.dateSortie)
            : new Date();

          const difference = Math.max(
            0,
            dateFin.getTime() - dateDebut.getTime(),
          );

          const jours = Math.max(
            1,
            Math.ceil(difference / (1000 * 60 * 60 * 24)),
          );

          result.push({
            typeOrigine: "HOSPITALISATION",

            designation: `Hospitalisation - Chambre ${
              hospitalisation.lit?.chambre?.numero ||
              hospitalisation.lit?.numero ||
              "N/A"
            }`,

            quantite: jours,

            prixUnitaire: prixJournalier,

            montant: jours * prixJournalier,

            reference: hospitalisation.numero,

            hospitalisationId: hospitalisation.id,

            serviceId: hospitalisation.serviceId ?? null,
          });
        }

        /* ==============================================
             SOINS
          ============================================== */

        for (const soin of hospitalisation.soins) {
          result.push({
            typeOrigine: "HOSPITALISATION",

            designation: soin.description
              ? `${soin.type} - ${soin.description}`
              : `Soin : ${soin.type}`,

            quantite: 1,

            prixUnitaire: 0,

            montant: 0,

            reference: hospitalisation.numero,

            hospitalisationId: hospitalisation.id,

            serviceId: hospitalisation.serviceId ?? null,
          });
        }

        return result;
      },
    );

    /* ======================================================
       CONSULTATIONS
    ====================================================== */

    const consultations = await prisma.consultation.findMany({
      where: {
        patientId,
      },

      orderBy: {
        dateConsultation: "desc",
      },

      select: {
        idConsultation: true,
        dateConsultation: true,
        diagnostic: true,

        medecin: {
          select: {
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

        actes: {
          select: {
            id: true,
            acteId: true,
            quantite: true,
            prixUnitaire: true,
            montant: true,

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
      },
    });

    const autres = consultations
      .filter(
        (consultation) =>
          !consultationsFacturees.has(consultation.idConsultation),
      )
      .map((consultation) => {
        const nomMedecin = consultation.medecin
          ? [
              consultation.medecin.nom,
              consultation.medecin.postNom,
              consultation.medecin.prenom,
            ]
              .filter(Boolean)
              .join(" ")
          : "";

        return {
          id: `AUTRE-CONSULTATION-${consultation.idConsultation}`,

          sourceId: consultation.idConsultation,

          typeOrigine: "AUTRES",

          designation:
            `Consultation médicale` + (nomMedecin ? ` - Dr ${nomMedecin}` : ""),

          quantite: 1,

          prixUnitaire: 0,

          montant: 0,

          reference: `CONS-${consultation.idConsultation}`,

          consultationId: consultation.idConsultation,

          serviceId: consultation.service?.id ?? null,
        };
      });

    /* ======================================================
       ACTES MÉDICAUX DU CATALOGUE
       
       IMPORTANT :
       Les actes médicaux sont un catalogue.
       On ne les supprime pas simplement parce qu'un autre
       patient les a déjà facturés.

       Ils restent disponibles pour être ajoutés.
    ====================================================== */

    const actes = await prisma.acteMedical.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        libelle: "asc",
      },

      select: {
        id: true,
        code: true,
        libelle: true,
        categorie: true,
        montant: true,
        devise: true,
      },
    });

    const actesMedicaux = actes.map((acte) => {
      const prix = toPositiveNumber(acte.montant);

      return {
        id: `ACTE-${acte.id}`,

        sourceId: acte.id,

        typeOrigine: "ACTE_MEDICAL",

        designation: acte.categorie
          ? `${acte.libelle} (${acte.categorie})`
          : acte.libelle,

        quantite: 1,

        prixUnitaire: prix,

        montant: prix,

        reference: acte.code,

        acteId: acte.id,

        devise: acte.devise,
      };
    });

    /* ======================================================
       LIGNES AUTOMATIQUES
    ====================================================== */

    const lignes = [
      ...pharmacie,
      ...laboratoire,
      ...imagerie,
      ...hospitalisationPrestations,
      ...autres,
    ];

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message: "Prestations disponibles du patient récupérées.",

      data: {
        patient,

        pharmacie,

        laboratoire,

        imagerie,

        hospitalisation: hospitalisationPrestations,

        actesMedicaux,

        autres,

        lignes,
      },
    };
  } catch (error) {
    console.error("getPatientPrestations:", error);

    return {
      success: false,

      message: "Erreur lors du chargement des prestations du patient.",

      data: {
        patient: null,
        pharmacie: [],
        laboratoire: [],
        imagerie: [],
        hospitalisation: [],
        actesMedicaux: [],
        autres: [],
        lignes: [],
      },
    };
  }
}

/* ==========================================================
   COMPATIBILITÉ
========================================================== */

export async function getPatientPrestationsFinance(
  patientId: number,
): Promise<ActionResult> {
  return getPatientPrestations(patientId);
}

/* ==========================================================
   NORMALISATION DES LIGNES
========================================================== */

function normalizeProformaLignes(
  lignes: ProformaLigneInput[],
  input: {
    consultationId?: number;
    hospitalisationId?: number;
    serviceId?: number;
  },
) {
  return lignes
    .filter(
      (ligne) =>
        typeof ligne.designation === "string" &&
        ligne.designation.trim().length > 0,
    )
    .map((ligne) => {
      const quantite = toPositiveNumber(ligne.quantite);

      const prixUnitaire = toPositiveNumber(ligne.prixUnitaire);

      return {
        typeOrigine: ligne.typeOrigine || "MANUEL",

        acteId: ligne.acteId ?? null,

        serviceId: ligne.serviceId ?? input.serviceId ?? null,

        consultationId: ligne.consultationId ?? input.consultationId ?? null,

        demandeLaboratoireId: ligne.demandeLaboratoireId ?? null,

        demandeImagerieId: ligne.demandeImagerieId ?? null,

        dispensationId: ligne.dispensationId ?? null,

        hospitalisationId:
          ligne.hospitalisationId ?? input.hospitalisationId ?? null,

        designation: ligne.designation.trim(),

        quantite,

        prixUnitaire,

        montant: quantite * prixUnitaire,

        reference: ligne.reference ?? null,
      };
    })
    .filter((ligne) => ligne.quantite > 0);
}

/* ==========================================================
   CALCUL RÉDUCTION
========================================================== */

function calculerReduction(
  montantBrut: number,
  reductionDemandee: number = 0,
  typeReduction?: string,
): number {
  const reductionValue = toPositiveNumber(reductionDemandee);

  if (montantBrut <= 0) {
    return 0;
  }

  if (String(typeReduction).toUpperCase() === "POURCENTAGE") {
    const pourcentage = Math.min(100, reductionValue);

    return Math.min(montantBrut, (montantBrut * pourcentage) / 100);
  }

  return Math.min(montantBrut, reductionValue);
}

/* ==========================================================
   CRÉER UNE PROFORMA
========================================================== */

export async function createProforma(input: {
  patientId: number;

  consultationId?: number;
  admissionId?: number;
  hospitalisationId?: number;

  serviceId?: number;

  reduction?: number;
  typeReduction?: string;
  devise?: string;

  dateExpiration?: Date;

  lignes: ProformaLigneInput[];
}): Promise<ActionResult> {
  try {
    /* ======================================================
       VALIDATION PATIENT
    ====================================================== */

    if (!Number.isInteger(input.patientId) || input.patientId <= 0) {
      return {
        success: false,
        message: "Patient invalide.",
      };
    }

    /* ======================================================
       VALIDATION IDs
    ====================================================== */

    if (
      !isValidId(input.consultationId) ||
      !isValidId(input.admissionId) ||
      !isValidId(input.hospitalisationId) ||
      !isValidId(input.serviceId)
    ) {
      return {
        success: false,
        message: "Un des identifiants fournis est invalide.",
      };
    }

    /* ======================================================
       DATE EXPIRATION
    ====================================================== */

    if (input.dateExpiration && !(input.dateExpiration instanceof Date)) {
      return {
        success: false,
        message: "Date d'expiration invalide.",
      };
    }

    /* ======================================================
       PATIENT
    ====================================================== */

    const patient = await prisma.patient.findUnique({
      where: {
        id: input.patientId,
      },

      select: {
        id: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    /* ======================================================
       LIGNES
    ====================================================== */

    if (!Array.isArray(input.lignes) || input.lignes.length === 0) {
      return {
        success: false,
        message: "La proforma doit contenir au moins une ligne.",
      };
    }

    const lignes = normalizeProformaLignes(input.lignes, {
      consultationId: input.consultationId,

      hospitalisationId: input.hospitalisationId,

      serviceId: input.serviceId,
    });

    if (lignes.length === 0) {
      return {
        success: false,
        message: "Aucune ligne de prestation valide.",
      };
    }

    /* ======================================================
       CALCULS
    ====================================================== */

    const montantBrut = lignes.reduce(
      (total, ligne) => total + ligne.montant,
      0,
    );

    const typeReduction = input.typeReduction || "MONTANT";

    const reduction = calculerReduction(
      montantBrut,
      input.reduction ?? 0,
      typeReduction,
    );

    const montantTotal = Math.max(0, montantBrut - reduction);

    /* ======================================================
       CRÉATION
    ====================================================== */

    const proforma = await prisma.proforma.create({
      data: {
        numero: generateNumero("PRO"),

        patientId: input.patientId,

        consultationId: input.consultationId ?? null,

        admissionId: input.admissionId ?? null,

        hospitalisationId: input.hospitalisationId ?? null,

        montantBrut,

        typeReduction,

        reduction,

        montantTotal,

        devise: input.devise || "USD",

        statut: "BROUILLON",

        dateExpiration: input.dateExpiration ?? null,

        lignes: {
          create: lignes,
        },
      },

      include: {
        patient: true,

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            service: true,
            acte: true,
          },
        },
      },
    });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath("/facturation");

    revalidatePath("/facturation/proformas");

    return {
      success: true,

      message: "Proforma créée avec succès.",

      data: proforma,
    };
  } catch (error) {
    console.error("createProforma:", error);

    return {
      success: false,

      message: "Erreur lors de la création de la proforma.",
    };
  }
}

/* ==========================================================
   CRÉER PROFORMA À PARTIR DES PRESTATIONS
========================================================== */

export async function createProformaFromPrestations(input: {
  patientId: number;

  consultationId?: number;
  admissionId?: number;
  hospitalisationId?: number;

  serviceId?: number;

  reduction?: number;
  typeReduction?: string;
  devise?: string;

  dateExpiration?: Date;

  prestations?: ProformaLigneInput[];
  lignes?: ProformaLigneInput[];
}): Promise<ActionResult> {
  try {
    if (!Number.isInteger(input.patientId) || input.patientId <= 0) {
      return {
        success: false,
        message: "Patient invalide.",
      };
    }

    const lignesSelectionnees = input.prestations?.length
      ? input.prestations
      : input.lignes || [];

    if (lignesSelectionnees.length === 0) {
      return {
        success: false,
        message: "Veuillez sélectionner au moins une prestation.",
      };
    }

    const lignesValides = lignesSelectionnees.filter(
      (ligne) =>
        typeof ligne.designation === "string" &&
        ligne.designation.trim().length > 0 &&
        toPositiveNumber(ligne.quantite) > 0,
    );

    if (lignesValides.length === 0) {
      return {
        success: false,
        message: "Les prestations sélectionnées sont invalides.",
      };
    }

    return await createProforma({
      patientId: input.patientId,

      consultationId: input.consultationId,

      admissionId: input.admissionId,

      hospitalisationId: input.hospitalisationId,

      serviceId: input.serviceId,

      reduction: input.reduction,

      typeReduction: input.typeReduction,

      devise: input.devise,

      dateExpiration: input.dateExpiration,

      lignes: lignesValides,
    });
  } catch (error) {
    console.error("createProformaFromPrestations:", error);

    return {
      success: false,

      message:
        "Erreur lors de la création de la proforma à partir des prestations.",
    };
  }
}

/* ==========================================================
   CRÉER AUTOMATIQUEMENT UNE PROFORMA PATIENT
========================================================== */

export async function createProformaPatient(input: {
  patientId: number;

  reduction?: number;
  typeReduction?: string;

  devise?: string;

  dateExpiration?: Date;

  consultationId?: number;
  admissionId?: number;
  hospitalisationId?: number;

  lignesSupplementaires?: ProformaLigneInput[];
}): Promise<ActionResult> {
  try {
    const prestations = await getPatientPrestations(input.patientId);

    if (!prestations.success || !prestations.data) {
      return {
        success: false,
        message: prestations.message,
      };
    }

    const lignesAutomatiques = prestations.data.lignes || [];

    const lignesManuelles = input.lignesSupplementaires || [];

    const lignes = [...lignesAutomatiques, ...lignesManuelles];

    if (lignes.length === 0) {
      return {
        success: false,
        message: "Aucune prestation facturable trouvée pour ce patient.",
      };
    }

    return await createProforma({
      patientId: input.patientId,

      consultationId: input.consultationId,

      admissionId: input.admissionId,

      hospitalisationId: input.hospitalisationId,

      reduction: input.reduction,

      typeReduction: input.typeReduction,

      devise: input.devise,

      dateExpiration: input.dateExpiration,

      lignes,
    });
  } catch (error) {
    console.error("createProformaPatient:", error);

    return {
      success: false,

      message: "Erreur lors de la génération automatique de la proforma.",
    };
  }
}

/* ==========================================================
   VALIDATION
========================================================== */

export async function validerProforma(id: number): Promise<ActionResult> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const proforma = await prisma.proforma.findUnique({
      where: {
        id,
      },
    });

    if (!proforma) {
      return {
        success: false,
        message: "Proforma introuvable.",
      };
    }

    if (proforma.statut === "FACTUREE") {
      return {
        success: false,
        message: "Cette proforma a déjà été facturée.",
      };
    }

    if (proforma.statut === "VALIDEE") {
      return {
        success: true,
        message: "Cette proforma est déjà validée.",
        data: proforma,
      };
    }

    if (proforma.dateExpiration && proforma.dateExpiration < new Date()) {
      return {
        success: false,
        message: "Cette proforma est expirée.",
      };
    }

    const updated = await prisma.proforma.update({
      where: {
        id,
      },

      data: {
        statut: "VALIDEE",
      },
    });

    revalidatePath("/facturation");

    revalidatePath("/facturation/proformas");

    revalidatePath(`/facturation/proformas/${id}`);

    return {
      success: true,

      message: "Proforma validée.",

      data: updated,
    };
  } catch (error) {
    console.error("validerProforma:", error);

    return {
      success: false,

      message: "Erreur lors de la validation.",
    };
  }
}

/* ==========================================================
   CONVERSION PROFORMA → FACTURE
========================================================== */

export async function convertirProformaEnFacture(
  proformaId: number,
): Promise<ActionResult> {
  try {
    if (!Number.isInteger(proformaId) || proformaId <= 0) {
      return {
        success: false,
        message: "Identifiant de proforma invalide.",
      };
    }

    const facture = await prisma.$transaction(async (tx) => {
      const proforma = await tx.proforma.findUnique({
        where: {
          id: proformaId,
        },

        include: {
          lignes: true,
          facture: true,
        },
      });

      if (!proforma) {
        throw new Error("PROFORMA_INTROUVABLE");
      }

      /* ==================================================
             FACTURE EXISTANTE
          ================================================== */

      if (proforma.facture) {
        return proforma.facture;
      }

      /* ==================================================
             VALIDATION
          ================================================== */

      if (proforma.statut === "BROUILLON") {
        throw new Error("PROFORMA_NON_VALIDEE");
      }

      if (proforma.statut !== "VALIDEE") {
        throw new Error("PROFORMA_ETAT_INVALIDE");
      }

      /* ==================================================
             EXPIRATION
          ================================================== */

      if (proforma.dateExpiration && proforma.dateExpiration < new Date()) {
        throw new Error("PROFORMA_EXPIREE");
      }

      /* ==================================================
             LIGNES
          ================================================== */

      if (!proforma.lignes || proforma.lignes.length === 0) {
        throw new Error("PROFORMA_SANS_LIGNES");
      }

      /* ==================================================
             CRÉATION FACTURE
          ================================================== */

      const nouvelleFacture = await tx.facture.create({
        data: {
          numero: generateNumero("FAC"),

          patientId: proforma.patientId,

          consultationId: proforma.consultationId,

          admissionId: proforma.admissionId,

          hospitalisationId: proforma.hospitalisationId,

          proformaId: proforma.id,

          montantBrut: proforma.montantBrut,

          reduction: proforma.reduction,

          montantTotal: proforma.montantTotal,

          montantPaye: 0,

          reste: proforma.montantTotal,

          typeReduction: proforma.typeReduction,

          devise: proforma.devise,

          statut: proforma.montantTotal <= 0 ? "PAYEE" : "IMPAYEE",

          lignes: {
            create: proforma.lignes.map((ligne) => ({
              acteId: ligne.acteId,

              serviceId: ligne.serviceId,

              designation: ligne.designation,

              quantite: ligne.quantite,

              prixUnitaire: ligne.prixUnitaire,

              montant: ligne.montant,

              reference: ligne.reference,
            })),
          },
        },

        include: {
          patient: true,

          lignes: {
            orderBy: {
              id: "asc",
            },

            include: {
              service: true,
              acte: true,
            },
          },
        },
      });

      /* ==================================================
             PROFORMA → FACTUREE
          ================================================== */

      await tx.proforma.update({
        where: {
          id: proformaId,
        },

        data: {
          statut: "FACTUREE",
        },
      });

      return nouvelleFacture;
    });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath("/facturation");

    revalidatePath("/facturation/proformas");

    revalidatePath("/facturation/factures");

    revalidatePath(`/facturation/proformas/${proformaId}`);

    return {
      success: true,

      message: "Proforma convertie en facture.",

      data: facture,
    };
  } catch (error) {
    console.error("convertirProformaEnFacture:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "PROFORMA_INTROUVABLE":
          return {
            success: false,
            message: "Proforma introuvable.",
          };

        case "PROFORMA_NON_VALIDEE":
          return {
            success: false,
            message:
              "La proforma doit être validée avant sa conversion en facture.",
          };

        case "PROFORMA_ETAT_INVALIDE":
          return {
            success: false,
            message:
              "La proforma n'est pas dans un état permettant la facturation.",
          };

        case "PROFORMA_EXPIREE":
          return {
            success: false,
            message:
              "Cette proforma est expirée et ne peut plus être convertie en facture.",
          };

        case "PROFORMA_SANS_LIGNES":
          return {
            success: false,
            message: "Cette proforma ne contient aucune ligne.",
          };
      }
    }

    return {
      success: false,

      message: "Erreur lors de la conversion de la proforma en facture.",
    };
  }
}

/* ==========================================================
   CONSULTATIONS DU PATIENT
========================================================== */

// export async function getPatientConsultations(
//   patientId: number
// ): Promise<ActionResult> {
//   try {
//     const id = Number(patientId);

//     if (!id || Number.isNaN(id)) {
//       return {
//         success: false,
//         message: "Patient invalide.",
//         data: [],
//       };
//     }

//     const consultations =
//       await prisma.consultation.findMany({
//         where: {
//           patientId: id,
//         },

//         orderBy: {
//           dateConsultation: "desc",
//         },

//         include: {
//           medecin: {
//             select: {
//               id: true,
//               matricule: true,
//               nom: true,
//               postNom: true,
//               prenom: true,
//             },
//           },

//           service: {
//             select: {
//               id: true,
//               code: true,
//               nom: true,
//             },
//           },

//           specialite: {
//             select: {
//               id: true,
//               code: true,
//               nom: true,
//             },
//           },
//         },
//       });

//     return {
//       success: true,
//       message: "Consultations récupérées avec succès.",
//       data: consultations,
//     };
//   } catch (error) {
//     console.error(
//       "Erreur getPatientConsultations:",
//       error
//     );

//     return {
//       success: false,
//       message:
//         "Erreur lors du chargement des consultations.",
//       data: [],
//     };
//   }
// }

/* ==========================================================
   CONSULTATIONS DU PATIENT
   ----------------------------------------------------------
   Récupère :
   - consultation
   - médecin
   - service
   - spécialité
   - constantes
   - prescriptions
   - lignes de prescription
   - dispensations pharmacie liées aux prescriptions
========================================================== */

export async function getPatientConsultations(
  patientId: number,
): Promise<ActionResult> {
  try {
    const id = Number(patientId);

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Patient invalide.",
        data: [],
      };
    }

    /* ======================================================
       VÉRIFICATION DU PATIENT
    ====================================================== */

    const patient = await prisma.patient.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
        data: [],
      };
    }

    /* ======================================================
       CONSULTATIONS
    ====================================================== */

    const consultations = await prisma.consultation.findMany({
      where: {
        patientId: id,
      },

      orderBy: {
        dateConsultation: "desc",
      },

      include: {
        /* ==================================================
             MÉDECIN
          ================================================== */

        medecin: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            postNom: true,
            prenom: true,
          },
        },

        /* ==================================================
             SERVICE
          ================================================== */

        service: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        /* ==================================================
             SPÉCIALITÉ
          ================================================== */

        specialite: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        /* ==================================================
             CONSTANTES
          ================================================== */

        constantes: {
          orderBy: {
            dateMesure: "desc",
          },
        },

        /* ==================================================
             PRESCRIPTIONS
             --------------------------------------------------
             Une prescription est liée à la consultation
             par consultationId.
          ================================================== */

        prescriptions: {
          orderBy: {
            datePrescription: "desc",
          },

          include: {
            medecin: {
              select: {
                id: true,
                matricule: true,
                nom: true,
                postNom: true,
                prenom: true,
              },
            },

            lignes: {
              include: {
                medicament: {
                  select: {
                    id: true,
                    code: true,
                    nom: true,
                    denomination: true,
                    forme: true,
                    dosage: true,
                    laboratoire: true,
                    categorie: true,
                    prixVente: true,
                    devise: true,
                  },
                },
              },
            },
          },
        },

        /* ==================================================
             LABORATOIRE
          ================================================== */

        demandesLabo: {
          orderBy: {
            dateDemande: "desc",
          },

          include: {
            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            lignes: {
              include: {
                examen: {
                  select: {
                    id: true,
                    code: true,
                    nom: true,
                    prix: true,
                    devise: true,
                  },
                },
              },
            },
          },
        },

        /* ==================================================
             IMAGERIE
          ================================================== */

        demandesImagerie: {
          orderBy: {
            dateDemande: "desc",
          },

          include: {
            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            examen: {
              select: {
                id: true,
                code: true,
                nom: true,
                type: true,
                prix: true,
                devise: true,
              },
            },
          },
        },
      },
    });

    /* ======================================================
       PHARMACIE

       IMPORTANT :
       Dans ton schéma actuel, Dispensation n'est pas
       directement reliée à Consultation.

       Le lien est :

       Consultation
           ↓
       Prescription
           ↓
       Dispensation
           ↓
       Lignes de dispensation
           ↓
       Médicament

       Pour éviter d'inventer une relation Prisma qui
       n'existe pas, on récupère donc les dispensations
       par les prescriptions.
    ====================================================== */

    const prescriptionIds = consultations.flatMap((consultation) =>
      consultation.prescriptions.map((prescription) => prescription.id),
    );

    let dispensations: any[] = [];

    if (prescriptionIds.length > 0) {
      dispensations = await prisma.dispensation.findMany({
        where: {
          prescriptionId: {
            in: prescriptionIds,
          },

          statut: {
            not: "ANNULEE",
          },
        },

        orderBy: {
          dateDispensation: "desc",
        },

        include: {
          prescription: {
            select: {
              id: true,
              numero: true,
              consultationId: true,
            },
          },

          pharmacien: {
            select: {
              id: true,
              name: true,
            },
          },

          lignes: {
            select: {
              id: true,
              quantiteDispensee: true,
              prixUnitaire: true,
              montant: true,

              medicament: {
                select: {
                  id: true,
                  code: true,
                  nom: true,
                  denomination: true,
                  forme: true,
                  dosage: true,
                  laboratoire: true,
                  categorie: true,
                  prixVente: true,
                  devise: true,
                },
              },
            },
          },
        },
      });
    }

    /* ======================================================
       PHARMACIE PAR CONSULTATION
    ====================================================== */

    const pharmacieParConsultation = new Map<number, any[]>();

    for (const dispensation of dispensations) {
      const consultationId = dispensation.prescription?.consultationId;

      if (!consultationId) {
        continue;
      }

      const liste = pharmacieParConsultation.get(consultationId) ?? [];

      liste.push(dispensation);

      pharmacieParConsultation.set(consultationId, liste);
    }

    /* ======================================================
       ENRICHISSEMENT DES CONSULTATIONS
    ====================================================== */

    const consultationsAvecPharmacie = consultations.map((consultation) => {
      const pharmacie =
        pharmacieParConsultation.get(consultation.idConsultation) ?? [];

      return {
        ...consultation,

        pharmacie,

        /* ----------------------------------------------
               Prestations pharmacie aplaties
            ---------------------------------------------- */

        prestationsPharmacie: pharmacie.flatMap((dispensation) =>
          dispensation.lignes.map((ligne: any) => ({
            id: ligne.id,

            dispensationId: dispensation.id,

            prescriptionId: dispensation.prescription?.id ?? null,

            numeroDispensation: dispensation.numero,

            dateDispensation: dispensation.dateDispensation,

            statut: dispensation.statut,

            quantite: Number(ligne.quantiteDispensee) || 0,

            prixUnitaire: Number(ligne.prixUnitaire) || 0,

            montant:
              Number(ligne.montant) ||
              (Number(ligne.quantiteDispensee) || 0) *
                (Number(ligne.prixUnitaire) || 0),

            medicament: ligne.medicament,
          })),
        ),
      };
    });

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message: "Consultations récupérées avec succès.",

      data: consultationsAvecPharmacie,
    };
  } catch (error) {
    console.error("Erreur getPatientConsultations:", error);

    return {
      success: false,

      message: "Erreur lors du chargement des consultations.",

      data: [],
    };
  }
}
