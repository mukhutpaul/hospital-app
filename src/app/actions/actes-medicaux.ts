
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPES
========================================================== */

export type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   UTILITAIRE
========================================================== */

function normaliserId(value: unknown): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function normaliserMontant(value: unknown): number | null {
  const montant = Number(value);

  if (!Number.isFinite(montant) || montant < 0) {
    return null;
  }

  return Math.round(montant * 100) / 100;
}

function normaliserQuantite(value: unknown): number | null {
  const quantite = Number(value);

  if (!Number.isFinite(quantite) || quantite <= 0) {
    return null;
  }

  return Math.round(quantite * 100) / 100;
}

function cheminModule() {
  return "/facturation/actes-medicaux";
}

/* ==========================================================
   ACTES MÉDICAUX — LISTE
========================================================== */

export async function getActesMedicaux(): Promise<
  ActionResult
> {
  try {
    const actes = await prisma.acteMedical.findMany({
      orderBy: [
        {
          actif: "desc",
        },
        {
          libelle: "asc",
        },
      ],
      include: {
        _count: {
          select: {
            consultations: true,
            lignesFacture: true,
            proformaLignes: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `${actes.length} acte(s) trouvé(s).`,
      data: actes.map((acte) => ({
        ...acte,
        montant: Number(acte.montant),
      })),
    };
  } catch (error) {
    console.error("❌ getActesMedicaux:", error);

    return {
      success: false,
      message:
        "Impossible de récupérer les actes médicaux.",
      data: [],
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — DÉTAIL
========================================================== */

export async function getActeMedicalById(
  idInput: number | string,
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message: "Identifiant de l'acte invalide.",
      };
    }

    const acte = await prisma.acteMedical.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            consultations: true,
            lignesFacture: true,
            proformaLignes: true,
          },
        },
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
      message: "Acte médical trouvé.",
      data: {
        ...acte,
        montant: Number(acte.montant),
      },
    };
  } catch (error) {
    console.error(
      "❌ getActeMedicalById:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer cet acte médical.",
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — CRÉATION
========================================================== */

export async function createActeMedical(data: {
  code: string;
  libelle: string;
  categorie?: string | null;
  montant: number;
  devise?: string;
  actif?: boolean;
}): Promise<ActionResult> {
  try {
    const code = data.code?.trim().toUpperCase();
    const libelle = data.libelle?.trim();
    const categorie =
      data.categorie?.trim() || null;
    const devise =
      data.devise?.trim().toUpperCase() || "USD";

    const montant = normaliserMontant(
      data.montant,
    );

    if (!code) {
      return {
        success: false,
        message: "Le code est obligatoire.",
      };
    }

    if (!libelle) {
      return {
        success: false,
        message: "Le libellé est obligatoire.",
      };
    }

    if (montant === null) {
      return {
        success: false,
        message: "Le montant est invalide.",
      };
    }

    if (!devise) {
      return {
        success: false,
        message: "La devise est obligatoire.",
      };
    }

    const existant =
      await prisma.acteMedical.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
        },
      });

    if (existant) {
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
          categorie,
          montant,
          devise,
          actif: data.actif ?? true,
        },
      });

    revalidatePath(cheminModule());

    return {
      success: true,
      message:
        "Acte médical créé avec succès.",
      data: acte,
    };
  } catch (error) {
    console.error(
      "❌ createActeMedical:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de créer l'acte médical.",
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — MODIFICATION
========================================================== */

export async function updateActeMedical(
  idInput: number | string,
  data: {
    code: string;
    libelle: string;
    categorie?: string | null;
    montant: number;
    devise?: string;
    actif?: boolean;
  },
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const code = data.code?.trim().toUpperCase();
    const libelle = data.libelle?.trim();
    const categorie =
      data.categorie?.trim() || null;
    const devise =
      data.devise?.trim().toUpperCase() || "USD";

    const montant = normaliserMontant(
      data.montant,
    );

    if (!code) {
      return {
        success: false,
        message: "Le code est obligatoire.",
      };
    }

    if (!libelle) {
      return {
        success: false,
        message: "Le libellé est obligatoire.",
      };
    }

    if (montant === null) {
      return {
        success: false,
        message: "Le montant est invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!acte) {
      return {
        success: false,
        message: "Acte médical introuvable.",
      };
    }

    const codeUtilise =
      await prisma.acteMedical.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

    if (codeUtilise) {
      return {
        success: false,
        message:
          "Ce code est déjà utilisé par un autre acte.",
      };
    }

    const acteMisAJour =
      await prisma.acteMedical.update({
        where: {
          id,
        },
        data: {
          code,
          libelle,
          categorie,
          montant,
          devise,
          actif: data.actif ?? true,
        },
      });

    revalidatePath(cheminModule());
    revalidatePath(
      `${cheminModule()}/actes/${id}`,
    );

    return {
      success: true,
      message:
        "Acte médical modifié avec succès.",
      data: acteMisAJour,
    };
  } catch (error) {
    console.error(
      "❌ updateActeMedical:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'acte médical.",
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — ACTIVATION / DÉSACTIVATION
========================================================== */

export async function toggleActeMedical(
  idInput: number | string,
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          actif: true,
          libelle: true,
        },
      });

    if (!acte) {
      return {
        success: false,
        message: "Acte médical introuvable.",
      };
    }

    const nouveauStatut = !acte.actif;

    const resultat =
      await prisma.acteMedical.update({
        where: {
          id,
        },
        data: {
          actif: nouveauStatut,
        },
      });

    revalidatePath(cheminModule());

    return {
      success: true,
      message: nouveauStatut
        ? "Acte médical activé."
        : "Acte médical désactivé.",
      data: resultat,
    };
  } catch (error) {
    console.error(
      "❌ toggleActeMedical:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut de l'acte.",
    };
  }
}

/* ==========================================================
   ACTE MÉDICAL — SUPPRESSION
========================================================== */

export async function deleteActeMedical(
  idInput: number | string,
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              consultations: true,
              lignesFacture: true,
              proformaLignes: true,
            },
          },
        },
      });

    if (!acte) {
      return {
        success: false,
        message: "Acte médical introuvable.",
      };
    }

    const utilise =
      acte._count.consultations > 0 ||
      acte._count.lignesFacture > 0 ||
      acte._count.proformaLignes > 0;

    /*
     * Un acte déjà utilisé doit rester dans l'historique.
     * On le désactive au lieu de le supprimer.
     */

    if (utilise) {
      if (acte.actif) {
        await prisma.acteMedical.update({
          where: {
            id,
          },
          data: {
            actif: false,
          },
        });
      }

      revalidatePath(cheminModule());

      return {
        success: true,
        message:
          "Cet acte est déjà utilisé dans l'historique. Il a donc été désactivé au lieu d'être supprimé.",
      };
    }

    await prisma.acteMedical.delete({
      where: {
        id,
      },
    });

    revalidatePath(cheminModule());

    return {
      success: true,
      message:
        "Acte médical supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "❌ deleteActeMedical:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'acte médical.",
    };
  }
}

/* ==========================================================
   CONSULTATION — LISTE
========================================================== */

export async function getConsultationsAvecActes(): Promise<
  ActionResult
> {
  try {
    const consultations =
      await prisma.consultation.findMany({
        include: {
          patient: {
            select: {
              id: true,
              nom: true,
              postNom: true,
              prenom: true,
              numeroDossier: true,
            },
          },

          medecin: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              matricule: true,
            },
          },

          actes: {
            include: {
              acte: {
                select: {
                  id: true,
                  code: true,
                  libelle: true,
                  montant: true,
                  devise: true,
                  actif: true,
                },
              },
            },
            orderBy: {
              dateActe: "desc",
            },
          },

          _count: {
            select: {
              actes: true,
            },
          },
        },

        orderBy: {
          dateConsultation: "desc",
        },
      });

    const data = consultations.map(
      (consultation) => ({
        ...consultation,

        actes: consultation.actes.map(
          (item) => ({
            ...item,
            prixUnitaire:
              Number(item.prixUnitaire),
            montant:
              Number(item.montant),

            acte: {
              ...item.acte,
              montant:
                Number(item.acte.montant),
            },
          }),
        ),
      }),
    );

    return {
      success: true,
      message:
        `${data.length} consultation(s) trouvée(s).`,
      data,
    };
  } catch (error) {
    console.error(
      "❌ getConsultationsAvecActes:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les consultations.",
      data: [],
    };
  }
}

/* ==========================================================
   ACTES D'UNE CONSULTATION
========================================================== */

export async function getActesConsultation(
  consultationIdInput: number | string,
): Promise<ActionResult> {
  try {
    const consultationId =
      normaliserId(consultationIdInput);

    if (!consultationId) {
      return {
        success: false,
        message:
          "Identifiant de consultation invalide.",
        data: [],
      };
    }

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation: consultationId,
        },

        include: {
          patient: {
            select: {
              id: true,
              nom: true,
              postNom: true,
              prenom: true,
              numeroDossier: true,
            },
          },

          medecin: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              matricule: true,
            },
          },

          actes: {
            include: {
              acte: true,
            },

            orderBy: {
              dateActe: "desc",
            },
          },
        },
      });

    if (!consultation) {
      return {
        success: false,
        message:
          "Consultation introuvable.",
        data: [],
      };
    }

    const data = {
      ...consultation,

      actes: consultation.actes.map(
        (item) => ({
          ...item,

          quantite:
            Number(item.quantite),

          prixUnitaire:
            Number(item.prixUnitaire),

          montant:
            Number(item.montant),

          acte: {
            ...item.acte,
            montant:
              Number(item.acte.montant),
          },
        }),
      ),
    };

    return {
      success: true,
      message:
        "Actes de consultation récupérés.",
      data,
    };
  } catch (error) {
    console.error(
      "❌ getActesConsultation:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les actes de cette consultation.",
      data: [],
    };
  }
}

/* ==========================================================
   CONSULTATION ACTE — DÉTAIL
========================================================== */

export async function getConsultationActeById(
  idInput: number | string,
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message:
          "Identifiant de l'acte de consultation invalide.",
      };
    }

    const item =
      await prisma.consultationActe.findUnique({
        where: {
          id,
        },

        include: {
          acte: true,

          consultation: {
            include: {
              patient: {
                select: {
                  id: true,
                  nom: true,
                  postNom: true,
                  prenom: true,
                  numeroDossier: true,
                },
              },

              medecin: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  matricule: true,
                },
              },
            },
          },
        },
      });

    if (!item) {
      return {
        success: false,
        message:
          "Acte de consultation introuvable.",
      };
    }

    return {
      success: true,
      message:
        "Acte de consultation trouvé.",
      data: {
        ...item,
        quantite:
          Number(item.quantite),
        prixUnitaire:
          Number(item.prixUnitaire),
        montant:
          Number(item.montant),

        acte: {
          ...item.acte,
          montant:
            Number(item.acte.montant),
        },
      },
    };
  } catch (error) {
    console.error(
      "❌ getConsultationActeById:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer l'acte de consultation.",
    };
  }
}

/* ==========================================================
   AJOUTER ACTE À UNE CONSULTATION
========================================================== */

export async function createConsultationActe(
  data: {
    consultationId: number;
    acteId: number;
    quantite?: number;
    observation?: string | null;
  },
): Promise<ActionResult> {
  try {
    const consultationId =
      normaliserId(data.consultationId);

    const acteId =
      normaliserId(data.acteId);

    const quantite =
      normaliserQuantite(
        data.quantite ?? 1,
      );

    if (!consultationId) {
      return {
        success: false,
        message:
          "Consultation invalide.",
      };
    }

    if (!acteId) {
      return {
        success: false,
        message:
          "Acte médical invalide.",
      };
    }

    if (quantite === null) {
      return {
        success: false,
        message:
          "La quantité doit être supérieure à zéro.",
      };
    }

    const consultation =
      await prisma.consultation.findUnique({
        where: {
          idConsultation:
            consultationId,
        },
        select: {
          idConsultation: true,
        },
      });

    if (!consultation) {
      return {
        success: false,
        message:
          "Consultation introuvable.",
      };
    }

    const acte =
      await prisma.acteMedical.findUnique({
        where: {
          id: acteId,
        },
        select: {
          id: true,
          libelle: true,
          montant: true,
          devise: true,
          actif: true,
        },
      });

    if (!acte) {
      return {
        success: false,
        message:
          "Acte médical introuvable.",
      };
    }

    if (!acte.actif) {
      return {
        success: false,
        message:
          "Cet acte médical est actuellement désactivé.",
      };
    }

    /*
     * Le prix est copié dans ConsultationActe.
     * Ainsi, une modification future du tarif
     * ne modifiera pas l'historique.
     */

    const prixUnitaire =
      Number(acte.montant);

    const montant =
      Math.round(
        prixUnitaire * quantite * 100,
      ) / 100;

    const observation =
      data.observation?.trim() || null;

    const consultationActe =
      await prisma.consultationActe.create({
        data: {
          consultationId,
          acteId,
          quantite,
          prixUnitaire,
          montant,
          observation,
        },

        include: {
          acte: true,
        },
      });

    revalidatePath(cheminModule());
    revalidatePath(
      `${cheminModule()}/consultations/${consultationId}`,
    );

    return {
      success: true,
      message:
        "Acte ajouté à la consultation.",
      data: {
        ...consultationActe,
        prixUnitaire:
          Number(
            consultationActe.prixUnitaire,
          ),
        montant:
          Number(
            consultationActe.montant,
          ),
        acte: {
          ...consultationActe.acte,
          montant:
            Number(
              consultationActe.acte.montant,
            ),
        },
      },
    };
  } catch (error) {
    console.error(
      "❌ createConsultationActe:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible d'ajouter l'acte à la consultation.",
    };
  }
}

/* ==========================================================
   MODIFIER ACTE DE CONSULTATION
========================================================== */

export async function updateConsultationActe(
  idInput: number | string,
  data: {
    quantite: number;
    observation?: string | null;
  },
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    const quantite =
      normaliserQuantite(data.quantite);

    if (!id) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    if (quantite === null) {
      return {
        success: false,
        message:
          "La quantité doit être supérieure à zéro.",
      };
    }

    const existant =
      await prisma.consultationActe.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          prixUnitaire: true,
          consultationId: true,
        },
      });

    if (!existant) {
      return {
        success: false,
        message:
          "Acte de consultation introuvable.",
      };
    }

    const montant =
      Math.round(
        Number(existant.prixUnitaire) *
          quantite *
          100,
      ) / 100;

    const resultat =
      await prisma.consultationActe.update({
        where: {
          id,
        },

        data: {
          quantite,
          montant,
          observation:
            data.observation?.trim() ||
            null,
        },

        include: {
          acte: true,
        },
      });

    revalidatePath(cheminModule());
    revalidatePath(
      `${cheminModule()}/consultations/${existant.consultationId}`,
    );

    return {
      success: true,
      message:
        "Acte de consultation modifié.",
      data: {
        ...resultat,
        quantite:
          Number(resultat.quantite),
        prixUnitaire:
          Number(resultat.prixUnitaire),
        montant:
          Number(resultat.montant),
      },
    };
  } catch (error) {
    console.error(
      "❌ updateConsultationActe:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'acte de consultation.",
    };
  }
}

/* ==========================================================
   SUPPRIMER ACTE DE CONSULTATION
========================================================== */

export async function deleteConsultationActe(
  idInput: number | string,
): Promise<ActionResult> {
  try {
    const id = normaliserId(idInput);

    if (!id) {
      return {
        success: false,
        message: "Identifiant invalide.",
      };
    }

    const item =
      await prisma.consultationActe.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          consultationId: true,
        },
      });

    if (!item) {
      return {
        success: false,
        message:
          "Acte de consultation introuvable.",
      };
    }

    await prisma.consultationActe.delete({
      where: {
        id,
      },
    });

    revalidatePath(cheminModule());
    revalidatePath(
      `${cheminModule()}/consultations/${item.consultationId}`,
    );

    return {
      success: true,
      message:
        "Acte retiré de la consultation.",
    };
  } catch (error) {
    console.error(
      "❌ deleteConsultationActe:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'acte de consultation.",
    };
  }
}

/* ==========================================================
   OPTIONS — ACTES ACTIFS
========================================================== */

export async function getActesMedicauxActifs(): Promise<
  ActionResult
> {
  try {
    const actes =
      await prisma.acteMedical.findMany({
        where: {
          actif: true,
        },

        select: {
          id: true,
          code: true,
          libelle: true,
          categorie: true,
          montant: true,
          devise: true,
        },

        orderBy: {
          libelle: "asc",
        },
      });

    return {
      success: true,
      message:
        "Actes actifs récupérés.",
      data: actes.map((acte) => ({
        ...acte,
        montant:
          Number(acte.montant),
      })),
    };
  } catch (error) {
    console.error(
      "❌ getActesMedicauxActifs:",
      error,
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les actes actifs.",
      data: [],
    };
  }
}
