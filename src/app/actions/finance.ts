"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPES
========================================================== */

type ActionResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   UTILITAIRE — NUMÉRO
========================================================== */

function generateNumero(prefix: string) {
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
   UTILITAIRE — NOMBRE
========================================================== */

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return Number(
      (value as { toNumber: () => number }).toNumber()
    );
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

/* ==========================================================
   PATIENTS
========================================================== */

export async function getPatientsFinance(): Promise<ActionResult> {
  try {
    const patients = await prisma.patient.findMany({
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
        telephone: true,

        assurances: {
          where: {
            principal: true,
          },

          include: {
            assurance: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Patients récupérés avec succès.",
      data: patients,
    };
  } catch (error) {
    console.error("Erreur getPatientsFinance:", error);

    return {
      success: false,
      message: "Erreur lors du chargement des patients.",
      data: [],
    };
  }
}

/* ==========================================================
   CONSULTATIONS DU PATIENT
========================================================== */

export async function getPatientConsultations(
  patientId: number
): Promise<ActionResult> {
  try {
    const id = Number(patientId);

    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Patient invalide.",
        data: [],
      };
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        patientId: id,
      },

      orderBy: {
        dateConsultation: "desc",
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

        service: {
          select: {
            id: true,
            code: true,
            nom: true,
          },
        },

        specialite: {
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
            type: true,
            statut: true,
            dateAdmission: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Consultations récupérées avec succès.",
      data: consultations,
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

/* ==========================================================
   SITUATION FINANCIÈRE
========================================================== */

export async function getPrestationsFacturables(
  patientId: number,
  consultationId?: number
): Promise<ActionResult> {
  try {
    const idPatient = Number(patientId);

    const idConsultation =
      consultationId !== undefined &&
      consultationId !== null &&
      Number(consultationId) > 0
        ? Number(consultationId)
        : undefined;

    /* ======================================================
       VALIDATION PATIENT
    ====================================================== */

    if (!idPatient || Number.isNaN(idPatient)) {
      return {
        success: false,
        message: "Patient invalide.",
        data: {
          prestations: [],
          statistiques: {
            total: 0,
            consultations: 0,
            laboratoire: 0,
            imagerie: 0,
            pharmacie: 0,
            hospitalisation: 0,
            soins: 0,
            montantTotal: 0,
          },
        },
      };
    }

    /* ======================================================
       PATIENT
    ====================================================== */

    const patient = await prisma.patient.findUnique({
      where: {
        id: idPatient,
      },

      select: {
        id: true,
        numeroDossier: true,
        nom: true,
        postNom: true,
        prenom: true,
        sexe: true,
        telephone: true,
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
        data: {
          prestations: [],
        },
      };
    }

    /* ======================================================
       CONSULTATION SÉLECTIONNÉE
    ====================================================== */

    let consultationSelectionnee = null;

    if (idConsultation) {
      consultationSelectionnee =
        await prisma.consultation.findFirst({
          where: {
            idConsultation: idConsultation,
            patientId: idPatient,
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

            service: {
              select: {
                id: true,
                code: true,
                nom: true,
              },
            },

            specialite: {
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
                type: true,
                statut: true,
                dateAdmission: true,
              },
            },
          },
        });

      if (!consultationSelectionnee) {
        return {
          success: false,
          message:
            "La consultation sélectionnée n'appartient pas à ce patient.",
          data: {
            prestations: [],
          },
        };
      }
    }

    /* ======================================================
       TABLEAU GLOBAL
    ====================================================== */

    const prestations: any[] = [];

    /* ======================================================
       1. CONSULTATIONS
    ====================================================== */

    const consultations =
      await prisma.consultation.findMany({
        where: {
          patientId: idPatient,

          ...(idConsultation
            ? {
                idConsultation: idConsultation,
              }
            : {}),
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

          service: {
            select: {
              id: true,
              code: true,
              nom: true,
            },
          },

          specialite: {
            select: {
              id: true,
              code: true,
              nom: true,
            },
          },
        },

        orderBy: {
          dateConsultation: "desc",
        },
      });

    for (const consultation of consultations) {
      prestations.push({
        id: `consultation-${consultation.idConsultation}`,

        typeOrigine: "CONSULTATION",

        sourceId: consultation.idConsultation,

        consultationId: consultation.idConsultation,

        designation: "Consultation médicale",

        quantite: 1,

        prixUnitaire: 0,

        montant: 0,

        reference: `CONS-${consultation.idConsultation}`,

        date: consultation.dateConsultation,

        serviceId: consultation.serviceId ?? null,

        service: consultation.service
          ? {
              id: consultation.service.id,
              code: consultation.service.code,
              nom: consultation.service.nom,
            }
          : null,

        metadata: {
          medecin: consultation.medecin
            ? [
                consultation.medecin.nom,
                consultation.medecin.postNom,
                consultation.medecin.prenom,
              ]
                .filter(Boolean)
                .join(" ")
            : null,

          specialite:
            consultation.specialite?.nom ?? null,

          motif: consultation.motif ?? null,
        },
      });
    }

    /* ======================================================
       2. LABORATOIRE
    ====================================================== */

    const demandesLaboratoire =
      await prisma.demandeLaboratoire.findMany({
        where: {
          patientId: idPatient,

          ...(idConsultation
            ? {
                consultationId: idConsultation,
              }
            : {}),
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
              examen: true,
            },
          },
        },

        orderBy: {
          dateDemande: "desc",
        },
      });

    for (const demande of demandesLaboratoire) {
      for (const ligne of demande.lignes) {
        const prix = toNumber(ligne.prix);

        prestations.push({
          id: `laboratoire-${ligne.id}`,

          typeOrigine: "LABORATOIRE",

          sourceId: ligne.id,

          consultationId:
            demande.consultationId ?? null,

          demandeLaboratoireId: demande.id,

          designation: ligne.examen.nom,

          quantite: 1,

          prixUnitaire: prix,

          montant: prix,

          reference: demande.numero,

          date: demande.dateDemande,

          serviceId: demande.serviceId ?? null,

          service: demande.service
            ? {
                id: demande.service.id,
                code: demande.service.code,
                nom: demande.service.nom,
              }
            : null,

          metadata: {
            demandeNumero: demande.numero,

            examenId: ligne.examenId,

            examenCode: ligne.examen.code,

            examenNom: ligne.examen.nom,

            unite: ligne.examen.unite,

            statut: demande.statut,

            urgence: demande.urgence,
          },
        });
      }
    }

    /* ======================================================
       3. IMAGERIE
    ====================================================== */

    const demandesImagerie =
      await prisma.demandeImagerie.findMany({
        where: {
          patientId: idPatient,

          ...(idConsultation
            ? {
                consultationId: idConsultation,
              }
            : {}),
        },

        include: {
          service: {
            select: {
              id: true,
              code: true,
              nom: true,
            },
          },

          examen: true,
        },

        orderBy: {
          dateDemande: "desc",
        },
      });

    for (const demande of demandesImagerie) {
      const prix = toNumber(
        demande.examen.prix
      );

      prestations.push({
        id: `imagerie-${demande.id}`,

        typeOrigine: "IMAGERIE",

        sourceId: demande.id,

        consultationId:
          demande.consultationId ?? null,

        demandeImagerieId: demande.id,

        designation: demande.examen.nom,

        quantite: 1,

        prixUnitaire: prix,

        montant: prix,

        reference: demande.numero,

        date: demande.dateDemande,

        serviceId: demande.serviceId ?? null,

        service: demande.service
          ? {
              id: demande.service.id,
              code: demande.service.code,
              nom: demande.service.nom,
            }
          : null,

        metadata: {
          demandeNumero: demande.numero,

          examenId: demande.examenId,

          examenCode: demande.examen.code,

          examenNom: demande.examen.nom,

          type: demande.examen.type,

          statut: demande.statut,

          urgence: demande.urgence,
        },
      });
    }

    /* ======================================================
       4. PHARMACIE
    ====================================================== */

    const prescriptions =
      await prisma.prescription.findMany({
        where: {
          patientId: idPatient,

          ...(idConsultation
            ? {
                consultationId: idConsultation,
              }
            : {}),
        },

        include: {
          lignes: {
            include: {
              medicament: true,
            },
          },
        },

        orderBy: {
          datePrescription: "desc",
        },
      });

    for (const prescription of prescriptions) {
      for (const ligne of prescription.lignes) {
        const quantite = Math.max(
          1,
          toNumber(ligne.quantite)
        );

        const prixUnitaire = toNumber(
          ligne.medicament.prixVente
        );

        const montant =
          quantite * prixUnitaire;

        prestations.push({
          id: `pharmacie-${ligne.id}`,

          typeOrigine: "PHARMACIE",

          sourceId: ligne.id,

          consultationId:
            prescription.consultationId ?? null,

          prescriptionId: prescription.id,

          designation:
            ligne.medicament.nom,

          quantite,

          prixUnitaire,

          montant,

          reference: prescription.numero,

          date: prescription.datePrescription,

          metadata: {
            medicamentId:
              ligne.medicamentId,

            code: ligne.medicament.code,

            denomination:
              ligne.medicament.denomination,

            forme: ligne.medicament.forme,

            dosage: ligne.medicament.dosage,

            quantite: ligne.quantite,

            prescriptionNumero:
              prescription.numero,
          },
        });
      }
    }

    /* ======================================================
       5. HOSPITALISATION
    ====================================================== */

    const hospitalisations =
      await prisma.hospitalisation.findMany({
        where: {
          patientId: idPatient,

          ...(idConsultation
            ? {
                admission: {
                  consultation: {
                    idConsultation: idConsultation,
                  },
                },
              }
            : {}),
        },

        include: {
          service: {
            select: {
              id: true,
              code: true,
              nom: true,
            },
          },

          lit: {
            include: {
              chambre: true,
            },
          },

          admission: {
            include: {
              service: {
                select: {
                  id: true,
                  code: true,
                  nom: true,
                },
              },
            },
          },

          soins: true,
        },

        orderBy: {
          dateEntree: "desc",
        },
      });

    for (const hospitalisation of hospitalisations) {
      const serviceHospitalisation =
        hospitalisation.service ??
        hospitalisation.admission.service ??
        null;

      /* ====================================================
         CHAMBRE
      ==================================================== */

      if (hospitalisation.lit?.chambre) {
        const chambre =
          hospitalisation.lit.chambre;

        const prixJournalier = toNumber(
          chambre.prixJournalier
        );

        const dateEntree =
          hospitalisation.dateEntree;

        const dateSortie =
          hospitalisation.dateSortie ??
          new Date();

        const difference =
          dateSortie.getTime() -
          dateEntree.getTime();

        const nombreJours = Math.max(
          1,
          Math.ceil(
            difference /
              (1000 * 60 * 60 * 24)
          )
        );

        const montant =
          nombreJours *
          prixJournalier;

        prestations.push({
          id: `hospitalisation-${hospitalisation.id}`,

          typeOrigine: "HOSPITALISATION",

          sourceId: hospitalisation.id,

          hospitalisationId:
            hospitalisation.id,

          admissionId:
            hospitalisation.admissionId,

          designation:
            `Chambre ${chambre.numero}`,

          quantite: nombreJours,

          prixUnitaire: prixJournalier,

          montant,

          reference:
            hospitalisation.numero,

          date:
            hospitalisation.dateEntree,

          serviceId:
            serviceHospitalisation?.id ??
            null,

          service: serviceHospitalisation
            ? {
                id: serviceHospitalisation.id,
                code: serviceHospitalisation.code,
                nom: serviceHospitalisation.nom,
              }
            : null,

          metadata: {
            chambre: chambre.numero,

            lit:
              hospitalisation.lit?.numero ??
              null,

            typeChambre:
              chambre.type,

            nombreJours,
          },
        });
      }

      /* ====================================================
         SOINS
      ==================================================== */

      for (const soin of hospitalisation.soins) {
        prestations.push({
          id: `soin-${soin.id}`,

          typeOrigine: "SOIN",

          sourceId: soin.id,

          hospitalisationId:
            hospitalisation.id,

          admissionId:
            hospitalisation.admissionId,

          designation: soin.description
            ? `${soin.type} - ${soin.description}`
            : soin.type,

          quantite: 1,

          prixUnitaire: 0,

          montant: 0,

          reference:
            hospitalisation.numero,

          date: soin.dateSoin,

          serviceId:
            serviceHospitalisation?.id ??
            null,

          service: serviceHospitalisation
            ? {
                id: serviceHospitalisation.id,
                code: serviceHospitalisation.code,
                nom: serviceHospitalisation.nom,
              }
            : null,

          metadata: {
            soinId: soin.id,

            type: soin.type,

            description:
              soin.description,

            observation:
              soin.observation,
          },
        });
      }
    }

    /* ======================================================
       TRI
    ====================================================== */

    prestations.sort((a, b) => {
      const dateA = a.date
        ? new Date(a.date).getTime()
        : 0;

      const dateB = b.date
        ? new Date(b.date).getTime()
        : 0;

      return dateB - dateA;
    });

    /* ======================================================
       STATISTIQUES
    ====================================================== */

    const statistiques = {
      total: prestations.length,

      consultations: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "CONSULTATION"
      ).length,

      laboratoire: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "LABORATOIRE"
      ).length,

      imagerie: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "IMAGERIE"
      ).length,

      pharmacie: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "PHARMACIE"
      ).length,

      hospitalisation: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "HOSPITALISATION"
      ).length,

      soins: prestations.filter(
        (p) =>
          p.typeOrigine ===
          "SOIN"
      ).length,

      montantTotal: prestations.reduce(
        (total, prestation) =>
          total +
          toNumber(prestation.montant),
        0
      ),
    };

    return {
      success: true,

      message: idConsultation
        ? "Situation financière de la consultation récupérée avec succès."
        : "Situation financière du patient récupérée avec succès.",

      data: {
        patient,

        consultation:
          consultationSelectionnee,

        prestations,

        statistiques,
      },
    };
  } catch (error) {
    console.error(
      "Erreur getPrestationsFacturables:",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors du chargement de la situation financière.",

      data: {
        prestations: [],

        statistiques: {
          total: 0,
          consultations: 0,
          laboratoire: 0,
          imagerie: 0,
          pharmacie: 0,
          hospitalisation: 0,
          soins: 0,
          montantTotal: 0,
        },
      },
    };
  }
}

/* ==========================================================
   ACTES MÉDICAUX
========================================================== */

export async function getActesMedicaux(): Promise<ActionResult> {
  try {
    const actes =
      await prisma.acteMedical.findMany({
        where: {
          actif: true,
        },

        orderBy: {
          libelle: "asc",
        },
      });

    return {
      success: true,
      message:
        "Actes médicaux récupérés.",
      data: actes,
    };
  } catch (error) {
    console.error(
      "Erreur getActesMedicaux:",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement des actes médicaux.",
      data: [],
    };
  }
}

/* ==========================================================
   SERVICES
========================================================== */

export async function getServicesFinance(): Promise<ActionResult> {
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
      message: "Services récupérés.",
      data: services,
    };
  } catch (error) {
    console.error(
      "Erreur getServicesFinance:",
      error
    );

    return {
      success: false,
      message:
        "Erreur lors du chargement des services.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER FACTURE
========================================================== */

export async function createFacture(input: {
  patientId: number;
  devise?: string;

  lignes: {
    typeOrigine: string;
    designation: string;
    quantite: number;
    prixUnitaire: number;
    montant?: number;
    acteId?: number;
    reference?: string;
  }[];
}): Promise<ActionResult> {
  try {
    const patientId =
      Number(input.patientId);

    /* ======================================================
       PATIENT
    ====================================================== */

    if (
      !patientId ||
      Number.isNaN(patientId)
    ) {
      return {
        success: false,
        message:
          "Identifiant du patient invalide.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
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
        message:
          "Patient introuvable.",
      };
    }

    /* ======================================================
       LIGNES
    ====================================================== */

    if (
      !Array.isArray(input.lignes) ||
      input.lignes.length === 0
    ) {
      return {
        success: false,
        message:
          "La facture doit contenir au moins une ligne.",
      };
    }

    const lignes =
      input.lignes
        .filter((ligne) => {
          return (
            ligne &&
            ligne.designation?.trim() &&
            Number(ligne.quantite) > 0
          );
        })
        .map((ligne) => {
          const quantite =
            Number(ligne.quantite);

          const prixUnitaire =
            Number(ligne.prixUnitaire);

          if (
            !Number.isFinite(quantite) ||
            !Number.isFinite(prixUnitaire)
          ) {
            return null;
          }

          const montant =
            quantite *
            prixUnitaire;

          return {
            designation:
              ligne.designation.trim(),

            quantite,

            prixUnitaire,

            montant,

            acteId:
              ligne.acteId !== undefined &&
              ligne.acteId !== null
                ? Number(ligne.acteId)
                : null,

            reference:
              ligne.reference?.trim() ||
              null,
          };
        })
        .filter(
          (
            ligne
          ): ligne is NonNullable<typeof ligne> =>
            ligne !== null
        );

    if (lignes.length === 0) {
      return {
        success: false,
        message:
          "Aucune ligne valide à enregistrer.",
      };
    }

    /* ======================================================
       TOTAL
    ====================================================== */

    const montantTotal =
      lignes.reduce(
        (total, ligne) =>
          total +
          ligne.montant,
        0
      );

    /* ======================================================
       NUMÉRO
    ====================================================== */

    const numero =
      generateNumero("FAC");

    /* ======================================================
       CRÉATION
    ====================================================== */

    const facture =
      await prisma.facture.create({
        data: {
          numero,

          patientId,

          montantTotal,

          montantPaye: 0,

          reste: montantTotal,

          devise:
            input.devise?.trim() ||
            "USD",

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

          lignes: {
            include: {
              acte: true,
            },
          },
        },
      });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath(
      "/facturation"
    );

    revalidatePath(
      "/facturation/factures"
    );

    return {
      success: true,

      message:
        "Facture créée avec succès.",

      data: {
        ...facture,

        montantTotal:
          toNumber(
            facture.montantTotal
          ),

        montantPaye:
          toNumber(
            facture.montantPaye
          ),

        reste:
          toNumber(
            facture.reste
          ),

        lignes:
          facture.lignes.map(
            (ligne) => ({
              ...ligne,

              quantite:
                toNumber(
                  ligne.quantite
                ),

              prixUnitaire:
                toNumber(
                  ligne.prixUnitaire
                ),

              montant:
                toNumber(
                  ligne.montant
                ),
            })
          ),
      },
    };
  } catch (error) {
    console.error(
      "Erreur createFacture:",
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
   LISTE DES FACTURES
========================================================== */

export async function getFactures(): Promise<ActionResult> {
  try {
    const factures =
      await prisma.facture.findMany({
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
              telephone: true,
            },
          },

          lignes: {
            orderBy: {
              id: "asc",
            },

            include: {
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

    const data = factures.map(
      (facture) => ({
        ...facture,

        montantTotal:
          toNumber(
            facture.montantTotal
          ),

        montantPaye:
          toNumber(
            facture.montantPaye
          ),

        reste:
          toNumber(
            facture.reste
          ),

        lignes:
          facture.lignes.map(
            (ligne) => ({
              ...ligne,

              quantite:
                toNumber(
                  ligne.quantite
                ),

              prixUnitaire:
                toNumber(
                  ligne.prixUnitaire
                ),

              montant:
                toNumber(
                  ligne.montant
                ),
            })
          ),

        paiements:
          facture.paiements.map(
            (paiement) => ({
              ...paiement,

              montant:
                toNumber(
                  paiement.montant
                ),
            })
          ),
      })
    );

    return {
      success: true,

      message:
        "Factures récupérées avec succès.",

      data,
    };
  } catch (error) {
    console.error(
      "Erreur getFactures:",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors du chargement des factures.",

      data: [],
    };
  }
}

/* ==========================================================
   FACTURE PAR ID
========================================================== */

export async function getFactureFinance(
  factureId: number
): Promise<ActionResult> {
  try {
    const id =
      Number(factureId);

    if (
      !id ||
      Number.isNaN(id)
    ) {
      return {
        success: false,
        message:
          "Identifiant de facture invalide.",
      };
    }

    const facture =
      await prisma.facture.findUnique({
        where: {
          id,
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

          lignes: {
            orderBy: {
              id: "asc",
            },

            include: {
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
        message:
          "Facture introuvable.",
      };
    }

    return {
      success: true,

      message:
        "Facture récupérée avec succès.",

      data: {
        ...facture,

        montantTotal:
          toNumber(
            facture.montantTotal
          ),

        montantPaye:
          toNumber(
            facture.montantPaye
          ),

        reste:
          toNumber(
            facture.reste
          ),

        lignes:
          facture.lignes.map(
            (ligne) => ({
              ...ligne,

              quantite:
                toNumber(
                  ligne.quantite
                ),

              prixUnitaire:
                toNumber(
                  ligne.prixUnitaire
                ),

              montant:
                toNumber(
                  ligne.montant
                ),
            })
          ),

        paiements:
          facture.paiements.map(
            (paiement) => ({
              ...paiement,

              montant:
                toNumber(
                  paiement.montant
                ),
            })
          ),
      },
    };
  } catch (error) {
    console.error(
      "Erreur getFactureFinance:",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors de la récupération de la facture.",
    };
  }
}

/* ==========================================================
   ENREGISTRER PAIEMENT
========================================================== */

export async function enregistrerPaiement(
  input: {
    factureId: number;

    montant: number;

    modePaiement?: string;

    type?: string;

    reference?: string;

    description?: string;

    devise?: string;

    caissierId?: number;
  }
): Promise<ActionResult> {
  try {
    const factureId =
      Number(input.factureId);

    const montant =
      Number(input.montant);

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (
      !factureId ||
      Number.isNaN(factureId)
    ) {
      return {
        success: false,
        message:
          "Identifiant de facture invalide.",
      };
    }

    if (
      !Number.isFinite(montant) ||
      montant <= 0
    ) {
      return {
        success: false,
        message:
          "Le montant du paiement doit être supérieur à zéro.",
      };
    }

    /* ======================================================
       FACTURE
    ====================================================== */

    const facture =
      await prisma.facture.findUnique({
        where: {
          id: factureId,
        },

        select: {
          id: true,
          patientId: true,
          montantTotal: true,
          montantPaye: true,
          reste: true,
          devise: true,
        },
      });

    if (!facture) {
      return {
        success: false,
        message:
          "Facture introuvable.",
      };
    }

    const montantTotal =
      toNumber(
        facture.montantTotal
      );

    const montantPaye =
      toNumber(
        facture.montantPaye
      );

    const reste =
      Math.max(
        0,
        montantTotal -
          montantPaye
      );

    /* ======================================================
       CONTRÔLES
    ====================================================== */

    if (reste <= 0) {
      return {
        success: false,
        message:
          "Cette facture est déjà entièrement payée.",
      };
    }

    if (montant > reste) {
      return {
        success: false,

        message:
          `Le montant maximum autorisé est de ${reste.toFixed(
            2
          )} ${facture.devise}.`,
      };
    }

    /* ======================================================
       NOUVEAUX TOTAUX
    ====================================================== */

    const nouveauMontantPaye =
      montantPaye +
      montant;

    const nouveauReste =
      Math.max(
        0,
        montantTotal -
          nouveauMontantPaye
      );

    const nouveauStatut =
      nouveauReste <= 0
        ? "PAYEE"
        : "PARTIELLEMENT_PAYEE";

    /* ======================================================
       RÉFÉRENCE
    ====================================================== */

    const reference =
      input.reference?.trim() ||
      generateNumero("PAY");

    /* ======================================================
       TRANSACTION
    ====================================================== */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const paiement =
            await tx.paiement.create({
              data: {
                reference,

                patientId:
                  facture.patientId,

                factureId:
                  facture.id,

                montant,

                devise:
                  input.devise?.trim() ||
                  facture.devise,

                modePaiement:
                  input.modePaiement?.trim() ||
                  "ESPECES",

                type:
                  input.type?.trim() ||
                  "PAIEMENT_FACTURE",

                statut: "PAYE",

                datePaiement:
                  new Date(),

                description:
                  input.description?.trim() ||
                  null,

                caissierId:
                  input.caissierId ??
                  null,
              },
            });

          const factureUpdated =
            await tx.facture.update({
              where: {
                id: factureId,
              },

              data: {
                montantPaye:
                  nouveauMontantPaye,

                reste:
                  nouveauReste,

                statut:
                  nouveauStatut,
              },
            });

          return {
            paiement,

            facture:
              factureUpdated,
          };
        }
      );

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath(
      "/facturation"
    );

    revalidatePath(
      "/facturation/factures"
    );

    revalidatePath(
      `/facturation/factures/${factureId}`
    );

    revalidatePath(
      "/paiements"
    );

    return {
      success: true,

      message:
        "Paiement enregistré avec succès.",

      data: {
        paiement: {
          ...result.paiement,

          montant:
            toNumber(
              result.paiement.montant
            ),
        },

        facture: {
          ...result.facture,

          montantTotal:
            toNumber(
              result.facture.montantTotal
            ),

          montantPaye:
            toNumber(
              result.facture.montantPaye
            ),

          reste:
            toNumber(
              result.facture.reste
            ),
        },
      },
    };
  } catch (error) {
    console.error(
      "Erreur enregistrerPaiement:",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors de l'enregistrement du paiement.",
    };
  }
}

/* ==========================================================
   LISTE DES PAIEMENTS
========================================================== */

export async function getPaiements(): Promise<ActionResult> {
  try {
    const paiements = await prisma.paiement.findMany({
      orderBy: {
        datePaiement: "desc",
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

        facture: {
          select: {
            id: true,
            numero: true,
            montantTotal: true,
            montantPaye: true,
            reste: true,
            devise: true,
            statut: true,
          },
        },

        caissier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const data = paiements.map((paiement) => ({
      ...paiement,

      montant: toNumber(paiement.montant),

      facture: paiement.facture
        ? {
            ...paiement.facture,

            montantTotal: toNumber(
              paiement.facture.montantTotal
            ),

            montantPaye: toNumber(
              paiement.facture.montantPaye
            ),

            reste: toNumber(
              paiement.facture.reste
            ),
          }
        : null,
    }));

    return {
      success: true,

      message:
        "Paiements récupérés avec succès.",

      data,
    };
  } catch (error) {
    console.error(
      "Erreur getPaiements:",
      error
    );

    return {
      success: false,

      message:
        "Erreur lors du chargement des paiements.",

      data: [],
    };
  }
}