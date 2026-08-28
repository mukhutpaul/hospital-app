"use server";

import { prisma } from "@/lib/prisma";

/* =========================================================
   TYPES
========================================================= */

export type DashboardData = {
  patients: number;
  rendezVousAujourdhui: number;
  hospitalises: number;
  facturesImpayees: number;

  consultationsAujourdhui: number;
  examensLaboratoire: number;
  examensImagerie: number;

  chiffreAffaires: number;
  paiementsAujourdhui: number;
  impayes: number;

  activiteMedicale: {
    date: string;
    consultations: number;
    actes: number;
    laboratoire: number;
    imagerie: number;
  }[];

  services: {
    id: number;
    nom: string;
    consultations: number;
    actif: boolean;
  }[];
};

/* =========================================================
   UTILITAIRE : DÉBUT / FIN DE JOURNÉE
========================================================= */

function getTodayRange() {
  const now = new Date();

  const debut = new Date(now);
  debut.setHours(0, 0, 0, 0);

  const fin = new Date(now);
  fin.setHours(23, 59, 59, 999);

  return {
    debut,
    fin,
  };
}

/* =========================================================
   DASHBOARD
========================================================= */

export async function getDashboardData(): Promise<
  | {
      success: true;
      data: DashboardData;
    }
  | {
      success: false;
      message: string;
    }
> {
  try {
    const { debut, fin } = getTodayRange();

    /* =====================================================
       STATISTIQUES PRINCIPALES
    ===================================================== */

    const [
      patients,
      rendezVousAujourdhui,
      hospitalises,
      facturesImpayees,

      consultationsAujourdhui,
      examensLaboratoire,
      examensImagerie,

      paiementsAujourdhui,
      chiffreAffairesResult,
      impayesResult,
    ] = await Promise.all([
      /* PATIENTS */
      prisma.patient.count({
        where: {
          actif: true,
        },
      }),

      /* RENDEZ-VOUS DU JOUR */
      prisma.rendezVous.count({
        where: {
          dateHeure: {
            gte: debut,
            lte: fin,
          },
        },
      }),

      /* HOSPITALISATIONS EN COURS */
      prisma.hospitalisation.count({
        where: {
          statut: "EN_COURS",
        },
      }),

      /* FACTURES IMPAYÉES */
      prisma.facture.count({
        where: {
          statut: {
            in: ["IMPAYEE", "PARTIELLE"],
          },
        },
      }),

      /* CONSULTATIONS DU JOUR */
      prisma.consultation.count({
        where: {
          dateConsultation: {
            gte: debut,
            lte: fin,
          },
        },
      }),

      /* DEMANDES LABORATOIRE DU JOUR */
      prisma.demandeLaboratoire.count({
        where: {
          dateDemande: {
            gte: debut,
            lte: fin,
          },
        },
      }),

      /* DEMANDES IMAGERIE DU JOUR */
      prisma.demandeImagerie.count({
        where: {
          dateDemande: {
            gte: debut,
            lte: fin,
          },
        },
      }),

      /* PAIEMENTS DU JOUR */
      prisma.paiement.aggregate({
        where: {
          datePaiement: {
            gte: debut,
            lte: fin,
          },
          statut: "PAYE",
        },
        _sum: {
          montant: true,
        },
      }),

      /* CHIFFRE D'AFFAIRES */
      prisma.facture.aggregate({
        where: {
          statut: {
            not: "ANNULEE",
          },
        },
        _sum: {
          montantTotal: true,
        },
      }),

      /* IMPAYÉS */
      prisma.facture.aggregate({
        where: {
          statut: {
            in: ["IMPAYEE", "PARTIELLE"],
          },
        },
        _sum: {
          reste: true,
        },
      }),
    ]);

    /* =====================================================
       ACTIVITÉ DES 7 DERNIERS JOURS
    ===================================================== */

    const activiteMedicale = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      const jourDebut = new Date(date);
      jourDebut.setHours(0, 0, 0, 0);

      const jourFin = new Date(date);
      jourFin.setHours(23, 59, 59, 999);

      const [
        consultations,
        actes,
        laboratoire,
        imagerie,
      ] = await Promise.all([
        prisma.consultation.count({
          where: {
            dateConsultation: {
              gte: jourDebut,
              lte: jourFin,
            },
          },
        }),

        prisma.consultationActe.count({
          where: {
            dateActe: {
              gte: jourDebut,
              lte: jourFin,
            },
          },
        }),

        prisma.demandeLaboratoire.count({
          where: {
            dateDemande: {
              gte: jourDebut,
              lte: jourFin,
            },
          },
        }),

        prisma.demandeImagerie.count({
          where: {
            dateDemande: {
              gte: jourDebut,
              lte: jourFin,
            },
          },
        }),
      ]);

      activiteMedicale.push({
        date: jourDebut.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),

        consultations,
        actes,
        laboratoire,
        imagerie,
      });
    }

    /* =====================================================
       SERVICES
    ===================================================== */

    const services = await prisma.service.findMany({
      where: {
        actif: true,
      },

      select: {
        id: true,
        nom: true,
        actif: true,

        _count: {
          select: {
            consultations: true,
          },
        },
      },

      orderBy: {
        nom: "asc",
      },

      take: 10,
    });

    return {
      success: true,

      data: {
        patients,

        rendezVousAujourdhui,

        hospitalises,

        facturesImpayees,

        consultationsAujourdhui,

        examensLaboratoire,

        examensImagerie,

        chiffreAffaires:
          chiffreAffairesResult._sum.montantTotal ?? 0,

        paiementsAujourdhui:
          paiementsAujourdhui._sum.montant ?? 0,

        impayes:
          impayesResult._sum.reste ?? 0,

        activiteMedicale,

        services: services.map((service) => ({
          id: service.id,
          nom: service.nom,
          actif: service.actif,
          consultations:
            service._count.consultations,
        })),
      },
    };
  } catch (error) {
    console.error(
      "Erreur Dashboard :",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de charger les données du tableau de bord.",
    };
  }
}