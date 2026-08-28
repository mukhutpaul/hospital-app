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
   RÉFÉRENCE PAIEMENT
========================================================== */

function generateReference(): string {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `PAY-${date}-${random}`;
}

/* ==========================================================
   PATIENTS
========================================================== */

export async function getPatientsPourPaiement() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        nom: true,
        postNom: true,
        prenom: true,
        numeroDossier: true,
      },
      orderBy: {
        nom: "asc",
      },
    });

    return patients;
  } catch (error) {
    console.error("❌ getPatientsPourPaiement:", error);

    return [];
  }
}

/* ==========================================================
   FACTURES D'UN PATIENT
========================================================== */

/* ==========================================================
   FACTURES D'UN PATIENT
========================================================== */
/* ==========================================================
   FACTURES D'UN PATIENT
========================================================== */

export async function getFacturesPourPaiement(
  patientId: number,
): Promise<ActionResult> {
  try {
    const id = Number(patientId);

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant patient invalide.",
        data: [],
      };
    }

    /* ------------------------------------------------------
       VÉRIFIER LE PATIENT
    ------------------------------------------------------ */

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

    /* ------------------------------------------------------
       RÉCUPÉRER LES FACTURES
    ------------------------------------------------------ */

    const factures = await prisma.facture.findMany({
      where: {
        patientId: id,

        NOT: {
          statut: "ANNULEE",
        },
      },

      select: {
        id: true,
        patientId: true,
        numero: true,

        montantTotal: true,
        montantPaye: true,
        reste: true,

        devise: true,
        statut: true,

        dateFacture: true,
      },

      orderBy: {
        id: "desc",
      },
    });

    /* ------------------------------------------------------
       TRANSFORMATION
    ------------------------------------------------------ */

    const data = factures
      .map((facture) => {
        const montantTotal = Number(
          facture.montantTotal,
        );

        const montantPaye = Number(
          facture.montantPaye,
        );

        const reste = Math.max(
          0,
          Math.round(
            (montantTotal - montantPaye) * 100,
          ) / 100,
        );

        return {
          id: facture.id,

          patientId: facture.patientId,

          numero: facture.numero,

          montantTotal,

          montantPaye,

          reste,

          devise:
            facture.devise || "USD",

          statut: facture.statut,

          dateFacture:
            facture.dateFacture instanceof Date
              ? facture.dateFacture.toISOString()
              : null,

          /*
           * Pour l'instant, on ne charge pas
           * la consultation car son identifiant
           * n'est pas `id`.
           */
          consultation: null,
        };
      })

      .filter(
        (facture) =>
          facture.reste > 0,
      );

    /* ------------------------------------------------------
       RETOUR
    ------------------------------------------------------ */

    return {
      success: true,

      message:
        data.length > 0
          ? `${data.length} facture(s) trouvée(s).`
          : "Aucune facture non soldée pour ce patient.",

      data,
    };
  } catch (error) {
    console.error(
      "==================================================",
    );

    console.error(
      "❌ getFacturesPourPaiement",
    );

    console.error(
      "==================================================",
    );

    console.error(
      error,
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des factures.",

      data: [],
    };
  }
}
/* ==========================================================
   RECALCUL FACTURE
========================================================== */

async function recalculerFactureDansTransaction(tx: any, factureId: number) {
  const facture = await tx.facture.findUnique({
    where: {
      id: factureId,
    },

    include: {
      paiements: {
        where: {
          statut: "PAYE",
        },

        select: {
          montant: true,
        },
      },
    },
  });

  if (!facture) {
    throw new Error("FACTURE_INTROUVABLE");
  }

  const montantTotal = Number(facture.montantTotal);

  const montantPaye = facture.paiements.reduce(
    (total: number, paiement: { montant: unknown }) =>
      total + Number(paiement.montant),
    0,
  );

  const montantPayeFinal = Math.min(montantTotal, montantPaye);

  const reste = Math.max(0, montantTotal - montantPayeFinal);

  let statut: "IMPAYEE" | "PARTIELLE" | "PAYEE";

  if (montantPayeFinal <= 0) {
    statut = "IMPAYEE";
  } else if (reste > 0) {
    statut = "PARTIELLE";
  } else {
    statut = "PAYEE";
  }

  return tx.facture.update({
    where: {
      id: factureId,
    },

    data: {
      montantPaye: montantPayeFinal,
      reste,
      statut,
    },
  });
}

/* ==========================================================
   CRÉER PAIEMENT
========================================================== */

export async function createPaiement(data: {
  patientId: number;
  factureId: number;
  montant: number;
  devise?: string;
  modePaiement: string;
  type: string;
  description?: string | null;
  caissierId?: number | null;
}): Promise<ActionResult> {
  try {
    const patientId = Number(data.patientId);
    const factureId = Number(data.factureId);
    const montant = Number(data.montant);

    /* ------------------------------------------------------
       VALIDATION PATIENT
    ------------------------------------------------------ */

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return {
        success: false,
        message: "Le patient sélectionné est invalide.",
      };
    }

    /* ------------------------------------------------------
       VALIDATION FACTURE
    ------------------------------------------------------ */

    if (!Number.isInteger(factureId) || factureId <= 0) {
      return {
        success: false,
        message: "Veuillez sélectionner une facture.",
      };
    }

    /* ------------------------------------------------------
       VALIDATION MONTANT
    ------------------------------------------------------ */

    if (!Number.isFinite(montant) || montant <= 0) {
      return {
        success: false,
        message: "Le montant doit être supérieur à 0.",
      };
    }

    const montantFinal = Math.round(montant * 100) / 100;

    /* ------------------------------------------------------
       MODE
    ------------------------------------------------------ */

    if (!data.modePaiement?.trim()) {
      return {
        success: false,
        message: "Le mode de paiement est obligatoire.",
      };
    }

    /* ------------------------------------------------------
       TYPE
    ------------------------------------------------------ */

    if (!data.type?.trim()) {
      return {
        success: false,
        message: "Le type de paiement est obligatoire.",
      };
    }

    /* ======================================================
       TRANSACTION
    ====================================================== */

    const paiement = await prisma.$transaction(async (tx) => {
      /* --------------------------------------------------
           PATIENT
        -------------------------------------------------- */

      const patient = await tx.patient.findUnique({
        where: {
          id: patientId,
        },

        select: {
          id: true,
        },
      });

      if (!patient) {
        throw new Error("PATIENT_INTROUVABLE");
      }

      /* --------------------------------------------------
           FACTURE
        -------------------------------------------------- */

      const facture = await tx.facture.findUnique({
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
          statut: true,
        },
      });

      if (!facture) {
        throw new Error("FACTURE_INTROUVABLE");
      }

      /* --------------------------------------------------
           VÉRIFIER PATIENT
        -------------------------------------------------- */

      if (facture.patientId !== patientId) {
        throw new Error("FACTURE_PATIENT_INCORRECT");
      }

      /* --------------------------------------------------
           FACTURE ANNULÉE
        -------------------------------------------------- */

      if (facture.statut === "ANNULEE") {
        throw new Error("FACTURE_ANNULEE");
      }

      /* --------------------------------------------------
           CALCUL DU VRAI RESTE
        -------------------------------------------------- */

      const montantTotal = Number(facture.montantTotal);

      const montantPaye = Number(facture.montantPaye);

      const resteReel = Math.max(0, montantTotal - montantPaye);

      /* --------------------------------------------------
           FACTURE DÉJÀ SOLDÉE
        -------------------------------------------------- */

      if (resteReel <= 0) {
        throw new Error("FACTURE_SOLDEE");
      }

      /* --------------------------------------------------
           DÉPASSEMENT
        -------------------------------------------------- */

      if (montantFinal > resteReel) {
        throw new Error(
          `MONTANT_SUPERIEUR:${resteReel}:${facture.devise || "USD"}`,
        );
      }

      /* --------------------------------------------------
           DEVISE DE LA FACTURE
        -------------------------------------------------- */

      const devise = facture.devise || "USD";

      /* --------------------------------------------------
           RÉFÉRENCE
        -------------------------------------------------- */

      let reference = generateReference();

      /*
       * Très faible risque de collision,
       * mais on vérifie quand même.
       */

      while (
        await tx.paiement.findUnique({
          where: {
            reference,
          },
          select: {
            id: true,
          },
        })
      ) {
        reference = generateReference();
      }

      /* --------------------------------------------------
           CAISSIER
        -------------------------------------------------- */

      let caissierConnect:
        | {
            connect: {
              id: number;
            };
          }
        | undefined;

      if (data.caissierId !== null && data.caissierId !== undefined) {
        const caissierId = Number(data.caissierId);

        if (Number.isInteger(caissierId) && caissierId > 0) {
          caissierConnect = {
            connect: {
              id: caissierId,
            },
          };
        }
      }

      /* --------------------------------------------------
           CRÉATION PAIEMENT
        -------------------------------------------------- */

      const nouveauPaiement = await tx.paiement.create({
        data: {
          reference,

          patient: {
            connect: {
              id: patientId,
            },
          },

          facture: {
            connect: {
              id: factureId,
            },
          },

          montant: montantFinal,

          devise,

          modePaiement: data.modePaiement.trim(),

          type: data.type.trim(),

          statut: "PAYE",

          description: data.description?.trim() || null,

          caissier: caissierConnect,
        },

        select: {
          id: true,
          reference: true,
          patientId: true,
          factureId: true,
          montant: true,
          devise: true,
          modePaiement: true,
          type: true,
          statut: true,
        },
      });

      /* --------------------------------------------------
           RECALCUL FACTURE
        -------------------------------------------------- */

      const factureMiseAJour = await recalculerFactureDansTransaction(
        tx,
        factureId,
      );

      return {
        paiement: nouveauPaiement,

        facture: factureMiseAJour,
      };
    });

    /* ======================================================
       CACHE
    ====================================================== */

    revalidatePath("/facturation/paiements");

    revalidatePath("/facturation/factures");

    revalidatePath(`/facturation/factures/${factureId}`);

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message: "Paiement enregistré avec succès.",

      data: {
        id: paiement.paiement.id,

        reference: paiement.paiement.reference,

        patientId: paiement.paiement.patientId,

        factureId: paiement.paiement.factureId,

        montant: Number(paiement.paiement.montant),

        devise: paiement.paiement.devise,

        modePaiement: paiement.paiement.modePaiement,

        type: paiement.paiement.type,

        statut: paiement.paiement.statut,

        facture: {
          montantTotal: Number(paiement.facture.montantTotal),

          montantPaye: Number(paiement.facture.montantPaye),

          reste: Number(paiement.facture.reste),

          statut: paiement.facture.statut,
        },
      },
    };
  } catch (error) {
    console.error("❌ createPaiement:", error);

    const message = error instanceof Error ? error.message : "";

    if (message === "PATIENT_INTROUVABLE") {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    if (message === "FACTURE_INTROUVABLE") {
      return {
        success: false,
        message: "La facture sélectionnée est introuvable.",
      };
    }

    if (message === "FACTURE_PATIENT_INCORRECT") {
      return {
        success: false,
        message: "Cette facture n'appartient pas au patient sélectionné.",
      };
    }

    if (message === "FACTURE_ANNULEE") {
      return {
        success: false,
        message: "Impossible de payer une facture annulée.",
      };
    }

    if (message === "FACTURE_SOLDEE") {
      return {
        success: false,
        message: "Cette facture est déjà entièrement soldée.",
      };
    }

    if (message.startsWith("MONTANT_SUPERIEUR:")) {
      const [, reste, devise] = message.split(":");

      return {
        success: false,
        message: `Le montant dépasse le reste à payer (${Number(reste).toFixed(
          2,
        )} ${devise}).`,
      };
    }

    return {
      success: false,
      message: "Une erreur est survenue lors de l'enregistrement du paiement.",
    };
  }
}

/* ==========================================================
   LISTE PAIEMENTS
========================================================== */

export async function getPaiements() {
  try {
    return await prisma.paiement.findMany({
      include: {
        patient: true,
        facture: true,
        caissier: true,
      },

      orderBy: {
        datePaiement: "desc",
      },
    });
  } catch (error) {
    console.error("❌ getPaiements:", error);

    return [];
  }
}

/* ==========================================================
   DÉTAIL PAIEMENT
========================================================== */

export async function getPaiementById(id: number) {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        patient: true,

        facture: {
          include: {
            lignes: true,
          },
        },

        caissier: true,
      },
    });

    return paiement;
  } catch (error) {
    console.error("❌ getPaiementById:", error);

    return null;
  }
}


/* ==========================================================
ANNULER PAIEMENT
========================================================== */

export async function deletePaiement(
paiementId: number,
): Promise<ActionResult> {
try {
const id = Number(paiementId);


/* ------------------------------------------------------
   VALIDATION
------------------------------------------------------ */

if (!Number.isInteger(id) || id <= 0) {
  return {
    success: false,
    message: "Identifiant du paiement invalide.",
  };
}

/* ======================================================
   TRANSACTION
====================================================== */

const resultat = await prisma.$transaction(async (tx) => {
  /* --------------------------------------------------
     RECHERCHER LE PAIEMENT
  -------------------------------------------------- */

  const paiement = await tx.paiement.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      reference: true,
      factureId: true,
      montant: true,
      statut: true,
    },
  });

  if (!paiement) {
    throw new Error("PAIEMENT_INTROUVABLE");
  }

  /* --------------------------------------------------
     DÉJÀ ANNULÉ
  -------------------------------------------------- */

  if (paiement.statut === "ANNULE") {
    throw new Error("PAIEMENT_DEJA_ANNULE");
  }

  /* --------------------------------------------------
     SEUL UN PAIEMENT PAYÉ PEUT ÊTRE ANNULÉ
  -------------------------------------------------- */

  if (paiement.statut !== "PAYE") {
    throw new Error("PAIEMENT_NON_PAYE");
  }

  /* --------------------------------------------------
     ANNULATION
     
     IMPORTANT :
     On ne supprime pas physiquement le paiement.
     On conserve sa trace comptable.
  -------------------------------------------------- */

  const paiementAnnule = await tx.paiement.update({
    where: {
      id,
    },

    data: {
      statut: "ANNULE",
    },

    select: {
      id: true,
      reference: true,
      factureId: true,
      montant: true,
      statut: true,
    },
  });

  /* --------------------------------------------------
     RECALCUL DE LA FACTURE
     
     La fonction recalculerFactureDansTransaction()
     ne prend en compte que les paiements PAYE.
  -------------------------------------------------- */

  const facture = await recalculerFactureDansTransaction(
    tx,
    paiement.factureId,
  );

  return {
    paiement: paiementAnnule,
    facture,
  };
});

/* ======================================================
   CACHE
====================================================== */

revalidatePath("/facturation/paiements");

revalidatePath("/facturation/factures");

revalidatePath(
  `/facturation/factures/${resultat.paiement.factureId}`,
);

revalidatePath(
  `/facturation/paiements/${resultat.paiement.id}`,
);

/* ======================================================
   RETOUR
====================================================== */

return {
  success: true,

  message: `Le paiement ${resultat.paiement.reference} a été annulé avec succès.`,

  data: {
    paiement: {
      id: resultat.paiement.id,
      reference: resultat.paiement.reference,
      factureId: resultat.paiement.factureId,
      montant: Number(resultat.paiement.montant),
      statut: resultat.paiement.statut,
    },

    facture: {
      montantTotal: Number(
        resultat.facture.montantTotal,
      ),

      montantPaye: Number(
        resultat.facture.montantPaye,
      ),

      reste: Number(
        resultat.facture.reste,
      ),

      statut: resultat.facture.statut,
    },
  },
};


} catch (error) {
console.error(
"❌ deletePaiement:",
error,
);


const message =
  error instanceof Error
    ? error.message
    : "";

if (
  message === "PAIEMENT_INTROUVABLE"
) {
  return {
    success: false,
    message: "Paiement introuvable.",
  };
}

if (
  message === "PAIEMENT_DEJA_ANNULE"
) {
  return {
    success: false,
    message: "Ce paiement est déjà annulé.",
  };
}

if (
  message === "PAIEMENT_NON_PAYE"
) {
  return {
    success: false,
    message:
      "Seul un paiement valide peut être annulé.",
  };
}

if (
  message === "FACTURE_INTROUVABLE"
) {
  return {
    success: false,
    message:
      "La facture associée est introuvable.",
  };
}

return {
  success: false,
  message:
    "Une erreur est survenue lors de l'annulation du paiement.",
};


}
}

/* ==========================================================
   ANNULER PAIEMENT
========================================================== */

export async function annulerPaiement(
  paiementId: number,
): Promise<ActionResult> {
  try {
    const id = Number(paiementId);

    /* ------------------------------------------------------
       VALIDATION
    ------------------------------------------------------ */

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Identifiant du paiement invalide.",
      };
    }

    /* ======================================================
       TRANSACTION
    ====================================================== */

    const resultat = await prisma.$transaction(async (tx) => {
      /* --------------------------------------------------
         RECHERCHER LE PAIEMENT
      -------------------------------------------------- */

      const paiement = await tx.paiement.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          reference: true,
          factureId: true,
          montant: true,
          statut: true,
        },
      });

      if (!paiement) {
        throw new Error("PAIEMENT_INTROUVABLE");
      }

      /* --------------------------------------------------
         DÉJÀ ANNULÉ
      -------------------------------------------------- */

      if (paiement.statut === "ANNULE") {
        throw new Error("PAIEMENT_DEJA_ANNULE");
      }

      /* --------------------------------------------------
         VÉRIFIER LE STATUT
      -------------------------------------------------- */

      if (paiement.statut !== "PAYE") {
        throw new Error("PAIEMENT_NON_PAYE");
      }

      /* --------------------------------------------------
         ANNULER LE PAIEMENT

         On conserve le paiement dans la base
         pour garder la traçabilité comptable.
      -------------------------------------------------- */

      const paiementAnnule = await tx.paiement.update({
        where: {
          id,
        },

        data: {
          statut: "ANNULE",
        },

        select: {
          id: true,
          reference: true,
          factureId: true,
          montant: true,
          statut: true,
        },
      });

      /* --------------------------------------------------
         RECALCULER LA FACTURE

         Seuls les paiements PAYE sont comptabilisés.
      -------------------------------------------------- */

      const facture = await recalculerFactureDansTransaction(
        tx,
        paiement.factureId,
      );

      return {
        paiement: paiementAnnule,
        facture,
      };
    });

    /* ======================================================
       REVALIDATION
    ====================================================== */

    revalidatePath("/facturation");
    revalidatePath("/facturation/paiements");
    revalidatePath("/facturation/factures");

    revalidatePath(
      `/facturation/factures/${resultat.paiement.factureId}`,
    );

    revalidatePath(
      `/paiements/${resultat.paiement.id}`,
    );

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message: `Le paiement ${resultat.paiement.reference} a été annulé avec succès.`,

      data: {
        paiement: {
          id: resultat.paiement.id,
          reference: resultat.paiement.reference,
          factureId: resultat.paiement.factureId,
          montant: Number(resultat.paiement.montant),
          statut: resultat.paiement.statut,
        },

        facture: {
          montantTotal: Number(
            resultat.facture.montantTotal,
          ),

          montantPaye: Number(
            resultat.facture.montantPaye,
          ),

          reste: Number(
            resultat.facture.reste,
          ),

          statut: resultat.facture.statut,
        },
      },
    };
  } catch (error) {
    console.error(
      "❌ annulerPaiement:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (message === "PAIEMENT_INTROUVABLE") {
      return {
        success: false,
        message: "Paiement introuvable.",
      };
    }

    if (message === "PAIEMENT_DEJA_ANNULE") {
      return {
        success: false,
        message: "Ce paiement est déjà annulé.",
      };
    }

    if (message === "PAIEMENT_NON_PAYE") {
      return {
        success: false,
        message:
          "Seul un paiement valide peut être annulé.",
      };
    }

    if (message === "FACTURE_INTROUVABLE") {
      return {
        success: false,
        message:
          "La facture associée est introuvable.",
      };
    }

    return {
      success: false,
      message:
        "Une erreur est survenue lors de l'annulation du paiement.",
    };
  }
}

/* ==========================================================
   COMPATIBILITÉ AVEC L'ANCIEN NOM
========================================================== */

