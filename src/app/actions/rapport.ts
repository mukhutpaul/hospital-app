"use server";

import { prisma } from "@/lib/prisma";

/* ==========================================================
   TYPES
========================================================== */

export type RapportFilter = {
  dateDebut?: string;
  dateFin?: string;

  periode?: string;

  serviceId?: number;
  medecinId?: number;

  devise?: string;
};

function getDateRange(filters: RapportFilter) {
  let dateDebut: Date | undefined;
  let dateFin: Date | undefined;

  const now = new Date();

  if (filters.periode) {
    switch (filters.periode) {
      case "AUJOURDHUI": {
        dateDebut = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        dateFin = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );

        break;
      }

      case "HIER": {
        dateDebut = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );

        dateFin = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        break;
      }

      case "SEMAINE": {
        const day = now.getDay();

        const diff = day === 0 ? 6 : day - 1;

        dateDebut = new Date(now);

        dateDebut.setDate(
          now.getDate() - diff
        );

        dateDebut.setHours(
          0,
          0,
          0,
          0
        );

        dateFin = new Date(
          dateDebut
        );

        dateFin.setDate(
          dateDebut.getDate() + 7
        );

        break;
      }

      case "MOIS": {
        dateDebut = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        dateFin = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );

        break;
      }

      case "ANNEE": {
        dateDebut = new Date(
          now.getFullYear(),
          0,
          1
        );

        dateFin = new Date(
          now.getFullYear() + 1,
          0,
          1
        );

        break;
      }
    }
  }

  if (filters.dateDebut) {
    dateDebut = new Date(
      `${filters.dateDebut}T00:00:00`
    );
  }

  if (filters.dateFin) {
    dateFin = new Date(
      `${filters.dateFin}T23:59:59.999`
    );
  }

  return {
    dateDebut,
    dateFin,
  };
}

/* ==========================================================
   RAPPORT GLOBAL
========================================================== */

export async function getRapportGlobal(
  filters: RapportFilter = {}
) {
  const {
    dateDebut,
    dateFin,
  } = getDateRange(filters);

  const dateFilter =
    dateDebut && dateFin
      ? {
          gte: dateDebut,
          lte: dateFin,
        }
      : undefined;

  /* ========================================================
     FACTURES
  ======================================================== */

  const factures =
    await prisma.facture.findMany({
      where: {
        ...(dateFilter && {
          dateFacture: dateFilter,
        }),

        ...(filters.devise && {
          devise: filters.devise,
        }),
      },
      include: {
        patient: true,
      },
      orderBy: {
        dateFacture: "desc",
      },
    });

  const totalFacture =
    factures.reduce(
      (total, facture) =>
        total +
        facture.montantTotal,
      0
    );

  const totalPayeFacture =
    factures.reduce(
      (total, facture) =>
        total +
        facture.montantPaye,
      0
    );

  const totalReste =
    factures.reduce(
      (total, facture) =>
        total +
        facture.reste,
      0
    );

  /* ========================================================
     PAIEMENTS
  ======================================================== */

  const paiements =
    await prisma.paiement.findMany({
      where: {
        ...(dateFilter && {
          datePaiement: dateFilter,
        }),

        ...(filters.devise && {
          devise: filters.devise,
        }),
      },

      include: {
        patient: true,
        facture: true,
      },

      orderBy: {
        datePaiement: "desc",
      },
    });

  const totalPaiements =
    paiements.reduce(
      (total, paiement) =>
        total +
        paiement.montant,
      0
    );

  /* ========================================================
     PATIENTS
  ======================================================== */

  const patients =
    await prisma.patient.count({
      where: {
        ...(dateFilter && {
          createdAt: dateFilter,
        }),
      },
    });

  /* ========================================================
     ADMISSIONS
  ======================================================== */

  const admissions =
    await prisma.admission.count({
      where: {
        ...(dateFilter && {
          dateAdmission: dateFilter,
        }),

        ...(filters.serviceId && {
          serviceId:
            filters.serviceId,
        }),
      },
    });

  /* ========================================================
     CONSULTATIONS
  ======================================================== */

  const consultations =
    await prisma.consultation.count({
      where: {
        ...(dateFilter && {
          dateConsultation:
            dateFilter,
        }),

        ...(filters.serviceId && {
          serviceId:
            filters.serviceId,
        }),

        ...(filters.medecinId && {
          medecinId:
            filters.medecinId,
        }),
      },
    });

  /* ========================================================
     HOSPITALISATIONS
  ======================================================== */

  const hospitalisations =
    await prisma.hospitalisation.count({
      where: {
        ...(dateFilter && {
          dateEntree:
            dateFilter,
        }),

        ...(filters.serviceId && {
          serviceId:
            filters.serviceId,
        }),
      },
    });

  /* ========================================================
     PHARMACIE
  ======================================================== */

  const dispensations =
    await prisma.dispensation.findMany({
      where: {
        ...(dateFilter && {
          dateDispensation:
            dateFilter,
        }),
      },
    });

  /* ========================================================
     LABORATOIRE
  ======================================================== */

  const laboratoire =
    await prisma.demandeLaboratoire.count({
      where: {
        ...(dateFilter && {
          dateDemande:
            dateFilter,
        }),

        ...(filters.serviceId && {
          serviceId:
            filters.serviceId,
        }),
      },
    });

  /* ========================================================
     IMAGERIE
  ======================================================== */

  const imagerie =
    await prisma.demandeImagerie.count({
      where: {
        ...(dateFilter && {
          dateDemande:
            dateFilter,
        }),

        ...(filters.serviceId && {
          serviceId:
            filters.serviceId,
        }),
      },
    });

  /* ========================================================
     PROFORMAS
  ======================================================== */

  const proformas =
    await prisma.proforma.findMany({
      where: {
        ...(dateFilter && {
          dateEmission:
            dateFilter,
        }),
      },
    });

  const totalProforma =
    proformas.reduce(
      (total, proforma) =>
        total +
        proforma.montantTotal,
      0
    );

  /* ========================================================
     PAIEMENTS PAR MODE
  ======================================================== */

  const paiementsParMode =
    paiements.reduce(
      (acc, paiement) => {
        if (!acc[paiement.modePaiement]) {
          acc[paiement.modePaiement] = 0;
        }

        acc[paiement.modePaiement] +=
          paiement.montant;

        return acc;
      },
      {} as Record<string, number>
    );

  /* ========================================================
     PAIEMENTS PAR JOUR
  ======================================================== */

  const paiementsParJour =
    paiements.reduce(
      (acc, paiement) => {
        const date =
          paiement.datePaiement
            .toISOString()
            .split("T")[0];

        if (!acc[date]) {
          acc[date] = 0;
        }

        acc[date] +=
          paiement.montant;

        return acc;
      },
      {} as Record<string, number>
    );

  return {
    resume: {
      totalFacture,
      totalPayeFacture,
      totalPaiements,
      totalReste,

      totalProforma,

      patients,

      admissions,

      consultations,

      hospitalisations,

      dispensations:
        dispensations.length,

      laboratoire,

      imagerie,

      nombreFactures:
        factures.length,

      nombrePaiements:
        paiements.length,

      nombreProformas:
        proformas.length,
    },

    paiementsParMode,

    paiementsParJour,

    factures,

    paiements,
  };
}

/* ==========================================================
   DONNEES POUR FILTRES
========================================================== */

export async function getRapportFilters() {
  const [
    services,
    medecins,
  ] = await Promise.all([
    prisma.service.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },

      select: {
        id: true,
        nom: true,
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
        nom: true,
        postNom: true,
        prenom: true,
      },
    }),
  ]);

  return {
    services,
    medecins,
  };
}