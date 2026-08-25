"use server";

import { prisma } from "@/lib/prisma";

/* ==========================================================
   TYPES
========================================================== */

export type PharmacieStats = {
  totalMedicaments: number;
  stockDisponible: number;
  totalOrdonnances: number;
  alertesStock: number;
};

/* ==========================================================
   STATISTIQUES PHARMACIE
========================================================== */

export async function getPharmacieStats(): Promise<{
  success: boolean;
  message: string;
  data?: PharmacieStats;
}> {
  try {
    /* ======================================================
       MÉDICAMENTS ACTIFS
    ====================================================== */

    const totalMedicaments =
      await prisma.medicament.count({
        where: {
          actif: true,
        },
      });

    /* ======================================================
       STOCK TOTAL
    ====================================================== */

    const stockResult =
      await prisma.stockMedicament.aggregate({
        _sum: {
          quantite: true,
        },
      });

    const stockDisponible =
      stockResult._sum.quantite ?? 0;

    /* ======================================================
       ORDONNANCES
    ====================================================== */

    const totalOrdonnances =
      await prisma.prescription.count();

    /* ======================================================
       ALERTES STOCK
       
       On récupère les médicaments actifs avec
       leurs stocks puis on calcule le total.
    ====================================================== */

    const medicaments =
      await prisma.medicament.findMany({
        where: {
          actif: true,
        },
        select: {
          id: true,
          seuilAlerte: true,
          stocks: {
            select: {
              quantite: true,
            },
          },
        },
      });

    let alertesStock = 0;

    for (const medicament of medicaments) {
      const quantiteTotale =
        medicament.stocks.reduce(
          (total, stock) =>
            total + stock.quantite,
          0
        );

      if (
        quantiteTotale <=
        medicament.seuilAlerte
      ) {
        alertesStock++;
      }
    }

    /* ======================================================
       RÉSULTAT
    ====================================================== */

    return {
      success: true,
      message:
        "Statistiques pharmacie récupérées.",
      data: {
        totalMedicaments,
        stockDisponible,
        totalOrdonnances,
        alertesStock,
      },
    };
  } catch (error) {
    console.error(
      "Erreur getPharmacieStats :",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les statistiques de la pharmacie.",
    };
  }
}