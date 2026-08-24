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
   LISTE DES CATÉGORIES D'IMAGERIE
========================================================== */

export async function getCategoriesImagerie(): Promise<
  ActionResult
> {
  try {
    const categories =
      await prisma.categorieImagerie.findMany({
        orderBy: {
          nom: "asc",
        },
      });

    return {
      success: true,
      message:
        "Catégories d'imagerie récupérées avec succès.",
      data: categories,
    };
  } catch (error) {
    console.error(
      "getCategoriesImagerie:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les catégories d'imagerie.",
      data: [],
    };
  }
}