"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   NUMÉRO DE PAIEMENT
========================================================== */

function generateReference() {
  const now = new Date();

  const date = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAY-${date}-${random}`;
}

/* ==========================================================
   LISTE DES PAIEMENTS
========================================================== */

export async function getPaiements(): Promise<ActionResult<any[]>> {
  try {
    const paiements = await prisma.paiement.findMany({
      orderBy: {
        datePaiement: "desc",
      },

      include: {
        patient: true,

        facture: {
          include: {
            consultation: {
              include: {
                medecin: true,
                service: true,
                specialite: true,
              },
            },

            lignes: {
              include: {
                acte: true,
                service: true,
              },
            },
          },
        },

        caissier: true,
      },
    });

    return {
      success: true,
      message: "Paiements chargés avec succès.",
      data: paiements,
    };
  } catch (error) {
    console.error("getPaiements:", error);

    return {
      success: false,
      message: "Impossible de charger les paiements.",
      data: [],
    };
  }
}

/* ==========================================================
   UN PAIEMENT
========================================================== */

export async function getPaiementById(
  id: number
): Promise<ActionResult<any>> {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,

        facture: {
          include: {
            patient: true,

            consultation: {
              include: {
                medecin: true,
                service: true,
                specialite: true,
              },
            },

            lignes: {
              include: {
                acte: true,
                service: true,
              },
            },
          },
        },

        caissier: true,
      },
    });

    if (!paiement) {
      return {
        success: false,
        message: "Paiement introuvable.",
      };
    }

    return {
      success: true,
      message: "Paiement trouvé.",
      data: paiement,
    };
  } catch (error) {
    console.error("getPaiementById:", error);

    return {
      success: false,
      message: "Erreur lors de la récupération du paiement.",
    };
  }
}

/* ==========================================================
   CREER UN PAIEMENT
========================================================== */

export async function createPaiement(data: {
  factureId: number;
  montant: number;
  modePaiement: string;
  type: string;
  description?: string;
}): Promise<ActionResult<any>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Vous devez être connecté.",
      };
    }

    if (!data.factureId) {
      return {
        success: false,
        message: "La facture est obligatoire.",
      };
    }

    if (!data.montant || data.montant <= 0) {
      return {
        success: false,
        message: "Le montant doit être supérieur à zéro.",
      };
    }

    if (!data.modePaiement) {
      return {
        success: false,
        message: "Le mode de paiement est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       FACTURE
    ------------------------------------------------------ */

    const facture = await prisma.facture.findUnique({
      where: {
        id: data.factureId,
      },

      include: {
        patient: true,
      },
    });

    if (!facture) {
      return {
        success: false,
        message: "Facture introuvable.",
      };
    }

    const resteAvantPaiement =
      facture.montantTotal - facture.montantPaye;

    if (resteAvantPaiement <= 0) {
      return {
        success: false,
        message: "Cette facture est déjà entièrement payée.",
      };
    }

    if (data.montant > resteAvantPaiement) {
      return {
        success: false,
        message: `Le montant dépasse le reste à payer (${resteAvantPaiement.toFixed(
          2
        )} ${facture.devise}).`,
      };
    }

    /* ------------------------------------------------------
       CAISSIER
    ------------------------------------------------------ */

    let caissierId: number | undefined;

    if (session.user.id) {
      const userId = Number(session.user.id);

      if (!Number.isNaN(userId)) {
        caissierId = userId;
      }
    }

    /* ------------------------------------------------------
       TRANSACTION
    ------------------------------------------------------ */

    const paiement = await prisma.$transaction(async (tx) => {
      const reference = generateReference();

      const nouveauPaiement = await tx.paiement.create({
        data: {
          reference,

          patientId: facture.patientId,

          factureId: facture.id,

          montant: data.montant,

          devise: facture.devise,

          modePaiement: data.modePaiement,

          type: data.type || "ENCAISSEMENT",

          statut: "PAYE",

          description: data.description || null,

          caissierId,
        },

        include: {
          patient: true,

          facture: {
            include: {
              consultation: {
                include: {
                  medecin: true,
                  service: true,
                  specialite: true,
                },
              },
            },
          },

          caissier: true,
        },
      });

      /* ----------------------------------------------------
         NOUVEAU MONTANT PAYE
      ---------------------------------------------------- */

      const nouveauMontantPaye =
        facture.montantPaye + data.montant;

      const nouveauReste =
        facture.montantTotal - nouveauMontantPaye;

      let statut = "PARTIELLEMENT_PAYEE";

      if (nouveauReste <= 0) {
        statut = "PAYEE";
      } else if (nouveauMontantPaye <= 0) {
        statut = "IMPAYEE";
      }

      await tx.facture.update({
        where: {
          id: facture.id,
        },

        data: {
          montantPaye: nouveauMontantPaye,
          reste: Math.max(0, nouveauReste),
          statut,
        },
      });

      return nouveauPaiement;
    });

    revalidatePath("/paiements");
    revalidatePath("/factures");
    revalidatePath(`/factures/${facture.id}`);

    return {
      success: true,
      message: "Paiement enregistré avec succès.",
      data: paiement,
    };
  } catch (error) {
    console.error("createPaiement:", error);

    return {
      success: false,
      message: "Erreur lors de l'enregistrement du paiement.",
    };
  }
}

/* ==========================================================
   MODIFIER UN PAIEMENT
========================================================== */

export async function updatePaiement(
  id: number,
  data: {
    montant: number;
    modePaiement: string;
    type: string;
    description?: string;
  }
): Promise<ActionResult<any>> {
  try {
    if (!data.montant || data.montant <= 0) {
      return {
        success: false,
        message: "Montant invalide.",
      };
    }

    const ancienPaiement = await prisma.paiement.findUnique({
      where: {
        id,
      },
    });

    if (!ancienPaiement) {
      return {
        success: false,
        message: "Paiement introuvable.",
      };
    }

    if (!ancienPaiement.factureId) {
      return {
        success: false,
        message: "Ce paiement n'est lié à aucune facture.",
      };
    }

    const facture = await prisma.facture.findUnique({
      where: {
        id: ancienPaiement.factureId,
      },
    });

    if (!facture) {
      return {
        success: false,
        message: "Facture introuvable.",
      };
    }

    const nouveauMontantPaye =
      facture.montantPaye -
      ancienPaiement.montant +
      data.montant;

    if (nouveauMontantPaye > facture.montantTotal) {
      return {
        success: false,
        message: "Le nouveau montant dépasse le total de la facture.",
      };
    }

    const nouveauReste =
      facture.montantTotal - nouveauMontantPaye;

    let statut = "IMPAYEE";

    if (nouveauMontantPaye >= facture.montantTotal) {
      statut = "PAYEE";
    } else if (nouveauMontantPaye > 0) {
      statut = "PARTIELLEMENT_PAYEE";
    }

    const paiement = await prisma.$transaction(async (tx) => {
      const updated = await tx.paiement.update({
        where: {
          id,
        },

        data: {
          montant: data.montant,
          modePaiement: data.modePaiement,
          type: data.type,
          description: data.description || null,
        },

        include: {
          patient: true,
          facture: {
            include: {
              consultation: true,
            },
          },
        },
      });

      await tx.facture.update({
        where: {
          id: facture.id,
        },

        data: {
          montantPaye: nouveauMontantPaye,
          reste: Math.max(0, nouveauReste),
          statut,
        },
      });

      return updated;
    });

    revalidatePath("/paiements");
    revalidatePath("/factures");
    revalidatePath(`/factures/${facture.id}`);

    return {
      success: true,
      message: "Paiement modifié avec succès.",
      data: paiement,
    };
  } catch (error) {
    console.error("updatePaiement:", error);

    return {
      success: false,
      message: "Impossible de modifier le paiement.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UN PAIEMENT
========================================================== */

export async function deletePaiement(
  id: number
): Promise<ActionResult> {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: {
        id,
      },
    });

    if (!paiement) {
      return {
        success: false,
        message: "Paiement introuvable.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (paiement.factureId) {
        const facture = await tx.facture.findUnique({
          where: {
            id: paiement.factureId,
          },
        });

        if (facture) {
          const nouveauMontantPaye =
            Math.max(
              0,
              facture.montantPaye - paiement.montant
            );

          const nouveauReste =
            facture.montantTotal - nouveauMontantPaye;

          let statut = "IMPAYEE";

          if (nouveauMontantPaye >= facture.montantTotal) {
            statut = "PAYEE";
          } else if (nouveauMontantPaye > 0) {
            statut = "PARTIELLEMENT_PAYEE";
          }

          await tx.facture.update({
            where: {
              id: facture.id,
            },

            data: {
              montantPaye: nouveauMontantPaye,
              reste: Math.max(0, nouveauReste),
              statut,
            },
          });
        }
      }

      await tx.paiement.delete({
        where: {
          id,
        },
      });
    });

    revalidatePath("/paiements");
    revalidatePath("/factures");

    return {
      success: true,
      message: "Paiement supprimé avec succès.",
    };
  } catch (error) {
    console.error("deletePaiement:", error);

    return {
      success: false,
      message: "Impossible de supprimer le paiement.",
    };
  }
}

/* ==========================================================
   FACTURES DISPONIBLES POUR PAIEMENT
========================================================== */

export async function getFacturesPourPaiement(): Promise<
  ActionResult<any[]>
> {
  try {
    const factures = await prisma.facture.findMany({
      where: {
        reste: {
          gt: 0,
        },

        statut: {
          not: "ANNULEE",
        },
      },

      orderBy: {
        dateFacture: "desc",
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
      },
    });

    return {
      success: true,
      message: "Factures disponibles.",
      data: factures,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Impossible de récupérer les factures.",
      data: [],
    };
  }
}