"use server";

import { prisma } from "@/lib/prisma";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * ==========================================================
 * LISTE DES ORDONNANCES
 * ==========================================================
 */
export async function getOrdonnances(): Promise<
  ActionResult<any[]>
> {
  try {
    const ordonnances = await prisma.prescription.findMany({
      orderBy: {
        datePrescription: "desc",
      },

      include: {
        patient: true,
        medecin: true,

        lignes: {
          include: {
            medicament: true,
          },
        },

        dispensations: true,
      },
    });

    return {
      success: true,
      message: "Ordonnances récupérées avec succès.",
      data: ordonnances,
    };
  } catch (error) {
    console.error("Erreur getOrdonnances :", error);

    return {
      success: false,
      message: "Impossible de récupérer les ordonnances.",
      data: [],
    };
  }
}

/**
 * ==========================================================
 * UNE ORDONNANCE
 * ==========================================================
 */
export async function getOrdonnanceById(
  id: number
): Promise<ActionResult<any>> {
  try {
    const ordonnance = await prisma.prescription.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,
        medecin: true,

        consultation: true,

        lignes: {
          include: {
            medicament: true,
            dispensationLignes: true,
          },
        },

        dispensations: {
          include: {
            lignes: {
              include: {
                medicament: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!ordonnance) {
      return {
        success: false,
        message: "Ordonnance introuvable.",
        data: null,
      };
    }

    return {
      success: true,
      message: "Ordonnance récupérée avec succès.",
      data: ordonnance,
    };
  } catch (error) {
    console.error("Erreur getOrdonnanceById :", error);

    return {
      success: false,
      message: "Impossible de récupérer l'ordonnance.",
      data: null,
    };
  }
}