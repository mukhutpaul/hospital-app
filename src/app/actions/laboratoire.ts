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
   AJOUTER UN EXAMEN DE LABORATOIRE
========================================================== */

export async function createExamenLaboratoire(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const code = String(formData.get("code") ?? "").trim();

    const nom = String(formData.get("nom") ?? "").trim();

    const description = String(formData.get("description") ?? "").trim();

    const unite = String(formData.get("unite") ?? "").trim();

    const valeurNormale = String(formData.get("valeurNormale") ?? "").trim();

    const prixValue = String(formData.get("prix") ?? "0").trim();

    const devise = String(formData.get("devise") ?? "USD").trim();

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!code) {
      return {
        success: false,
        message: "Le code de l'examen est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom de l'examen est obligatoire.",
      };
    }

    const prix = Number(prixValue);

    if (!Number.isFinite(prix) || prix < 0) {
      return {
        success: false,
        message: "Le prix est invalide.",
      };
    }

    /* ======================================================
       VÉRIFIER SI LE CODE EXISTE
    ====================================================== */

    const existe = await prisma.examenLaboratoire.findUnique({
      where: {
        code,
      },
    });

    if (existe) {
      return {
        success: false,
        message: "Un examen avec ce code existe déjà.",
      };
    }

    /* ======================================================
       CRÉATION
    ====================================================== */

    const examen = await prisma.examenLaboratoire.create({
      data: {
        code,
        nom,
        description: description || null,
        unite: unite || null,
        valeurNormale: valeurNormale || null,
        prix,
        devise: devise || "USD",
        actif: true,
      },
    });

    return {
      success: true,
      message: "Examen de laboratoire ajouté avec succès.",
      data: examen,
    };
  } catch (error) {
    console.error("createExamenLaboratoire:", error);

    return {
      success: false,
      message: "Une erreur est survenue lors de l'ajout de l'examen.",
    };
  }
}

/* ==========================================================
   LISTE DES EXAMENS DU CATALOGUE
========================================================== */

export async function getExamensLaboratoire(): Promise<ActionResult> {
  try {
    const examens = await prisma.examenLaboratoire.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

    return {
      success: true,
      message: "Examens récupérés avec succès.",
      data: examens,
    };
  } catch (error) {
    console.error("getExamensLaboratoire:", error);

    return {
      success: false,
      message: "Impossible de récupérer les examens.",
      data: [],
    };
  }
}

/* ==========================================================
   SUPPRIMER / DÉSACTIVER UN EXAMEN
========================================================== */

export async function deleteExamenLaboratoire(
  id: number,
): Promise<ActionResult> {
  try {
    if (!id || !Number.isInteger(id)) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    await prisma.examenLaboratoire.update({
      where: {
        id,
      },

      data: {
        actif: false,
      },
    });

    return {
      success: true,
      message: "Examen désactivé avec succès.",
    };
  } catch (error) {
    console.error("deleteExamenLaboratoire:", error);

    return {
      success: false,
      message: "Impossible de désactiver l'examen.",
    };
  }
}

/* ==========================================================
   TYPES POUR LA RECHERCHE DES DEMANDES
========================================================== */

type RechercheDemandesLaboratoire = {
  recherche?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  urgence?: boolean | string;
};

/* ==========================================================
   DEMANDES DE LABORATOIRE
   - Recherche complète
   - Filtre date début
   - Filtre date fin
   - Filtre statut
   - Filtre urgence
========================================================== */

/* ==========================================================
   DEMANDES DE LABORATOIRE
========================================================== */

export async function getDemandesLaboratoire(
  filters: RechercheDemandesLaboratoire = {},
): Promise<ActionResult> {
  try {
    const {
      recherche = "",
      dateDebut = "",
      dateFin = "",
      statut = "",
      urgence,
    } = filters;

    /* ======================================================
       WHERE
    ====================================================== */

    const where: any = {};

    /* ======================================================
       FILTRE STATUT
    ====================================================== */

    if (statut && statut !== "TOUS") {
      where.statut = statut;
    }

    /* ======================================================
       FILTRE URGENCE
    ====================================================== */

    if (urgence !== undefined && urgence !== "") {
      where.urgence = urgence === true || urgence === "true";
    }

    /* ======================================================
       FILTRE DATE
    ====================================================== */

    if (dateDebut || dateFin) {
      where.dateDemande = {};

      if (dateDebut) {
        const debut = new Date(`${dateDebut}T00:00:00`);

        if (!Number.isNaN(debut.getTime())) {
          where.dateDemande.gte = debut;
        }
      }

      if (dateFin) {
        const fin = new Date(`${dateFin}T23:59:59.999`);

        if (!Number.isNaN(fin.getTime())) {
          where.dateDemande.lte = fin;
        }
      }
    }

    /* ======================================================
       RECHERCHE
    ====================================================== */

    if (recherche.trim()) {
      const terme = recherche.trim();

      where.OR = [
        {
          numero: {
            contains: terme,
          },
        },

        {
          patient: {
            numeroDossier: {
              contains: terme,
            },
          },
        },

        {
          patient: {
            nom: {
              contains: terme,
            },
          },
        },

        {
          patient: {
            postNom: {
              contains: terme,
            },
          },
        },

        {
          patient: {
            prenom: {
              contains: terme,
            },
          },
        },

        {
          patient: {
            telephone: {
              contains: terme,
            },
          },
        },
      ];
    }

    /* ======================================================
       RÉCUPÉRATION
    ====================================================== */

    const demandes = await prisma.demandeLaboratoire.findMany({
      where,

      orderBy: {
        dateDemande: "desc",
      },

      include: {
        /* ==================================================
             PATIENT
          ================================================== */

        patient: {
          select: {
            id: true,
            numeroDossier: true,
            nom: true,
            postNom: true,
            prenom: true,
            sexe: true,
            dateNaissance: true,
            telephone: true,
            email: true,
            adresse: true,
          },
        },

        /* ==================================================
             CONSULTATION
          ================================================== */

        consultation: {
          include: {
            medecin: true,
            service: true,
            specialite: true,
          },
        },

        /* ==================================================
             SERVICE
          ================================================== */

        service: true,

        /* ==================================================
             LIGNES / EXAMENS
          ================================================== */

        lignes: {
          orderBy: {
            id: "asc",
          },

          include: {
            examen: true,
          },
        },

        /* ==================================================
             RÉSULTATS

             IMPORTANT :
             On ne met PAS examen ici parce que
             ResultatLaboratoire ne possède pas actuellement
             de relation Prisma nommée "examen".
          ================================================== */

        resultats: {
          orderBy: {
            dateResultat: "desc",
          },
        },
      },
    });

    /* ======================================================
       LOG
    ====================================================== */

    console.log(`[LABORATOIRE] ${demandes.length} demande(s) récupérée(s).`);

    /* ======================================================
       RETOUR
    ====================================================== */

    return {
      success: true,

      message:
        demandes.length > 0
          ? `${demandes.length} demande(s) récupérée(s).`
          : "Aucune demande de laboratoire trouvée.",

      data: demandes,
    };
  } catch (error) {
    console.error("❌ ERREUR getDemandesLaboratoire:", error);

    return {
      success: false,

      message: "Impossible de récupérer les demandes de laboratoire.",

      data: [],
    };
  }
}

/* ==========================================================
   DÉTAIL D'UNE DEMANDE
========================================================== */

export async function getDemandeLaboratoireById(
  id: number,
): Promise<ActionResult> {
  try {
    if (!id || !Number.isInteger(id)) {
      return {
        success: false,
        message: "Identifiant de la demande invalide.",
      };
    }

    const demande = await prisma.demandeLaboratoire.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,

        consultation: {
          include: {
            medecin: {
              include: {
                service: true,
                specialite: true,
                user: true,
              },
            },

            service: true,
            specialite: true,
          },
        },

        service: true,

        lignes: {
          include: {
            examen: true,
          },
        },

        resultats: {
          include: {
            examen: true,
          },

          orderBy: {
            dateResultat: "desc",
          },
        },
      },
    });

    if (!demande) {
      return {
        success: false,
        message: "Demande de laboratoire introuvable.",
      };
    }

    return {
      success: true,
      message: "Détail de la demande récupéré.",
      data: demande,
    };
  } catch (error) {
    console.error("getDemandeLaboratoireById:", error);

    return {
      success: false,
      message: "Impossible de récupérer le détail de la demande.",
    };
  }
}

/* ==========================================================
   ENREGISTRER UN RÉSULTAT
========================================================== */

export async function createResultatLaboratoire(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const demandeId = Number(formData.get("demandeId"));

    const examenId = Number(formData.get("examenId"));

    const valeur = String(formData.get("valeur") ?? "").trim();

    const unite = String(formData.get("unite") ?? "").trim();

    const commentaire = String(formData.get("commentaire") ?? "").trim();

    const interpretation = String(formData.get("interpretation") ?? "").trim();

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!Number.isInteger(demandeId) || demandeId <= 0) {
      return {
        success: false,
        message: "La demande de laboratoire est invalide.",
      };
    }

    if (!Number.isInteger(examenId) || examenId <= 0) {
      return {
        success: false,
        message: "L'examen de laboratoire est invalide.",
      };
    }

    if (!valeur) {
      return {
        success: false,
        message: "La valeur du résultat est obligatoire.",
      };
    }

    /* ======================================================
       VÉRIFIER LA DEMANDE
    ====================================================== */

    const demande = await prisma.demandeLaboratoire.findUnique({
      where: {
        id: demandeId,
      },

      include: {
        lignes: true,
      },
    });

    if (!demande) {
      return {
        success: false,
        message: "Demande de laboratoire introuvable.",
      };
    }

    /* ======================================================
       VÉRIFIER QUE L'EXAMEN FAIT PARTIE
       DE LA DEMANDE
    ====================================================== */

    const examenDemande = demande.lignes.some(
      (ligne) => ligne.examenId === examenId,
    );

    if (!examenDemande) {
      return {
        success: false,
        message: "Cet examen ne fait pas partie de cette demande.",
      };
    }

    /* ======================================================
       VÉRIFIER SI UN RÉSULTAT EXISTE DÉJÀ
    ====================================================== */

    const resultatExistant = await prisma.resultatLaboratoire.findFirst({
      where: {
        demandeId,
        examenId,
      },
    });

    let resultat;

    if (resultatExistant) {
      /* ==============================================
         MISE À JOUR
      ============================================== */

      resultat = await prisma.resultatLaboratoire.update({
        where: {
          id: resultatExistant.id,
        },

        data: {
          valeur,
          unite: unite || null,
          commentaire: commentaire || null,
          interpretation: interpretation || null,
          dateResultat: new Date(),
        },
      });
    } else {
      /* ==============================================
         CRÉATION
      ============================================== */

      resultat = await prisma.resultatLaboratoire.create({
        data: {
          demandeId,
          examenId,
          valeur,
          unite: unite || null,
          commentaire: commentaire || null,
          interpretation: interpretation || null,
        },
      });
    }

    /* ======================================================
       METTRE LA DEMANDE EN COURS
       SI ELLE ÉTAIT ENCORE À DEMANDE
    ====================================================== */

    if (demande.statut === "DEMANDE") {
      await prisma.demandeLaboratoire.update({
        where: {
          id: demandeId,
        },

        data: {
          statut: "EN_COURS",
        },
      });
    }

    return {
      success: true,
      message: resultatExistant
        ? "Résultat mis à jour avec succès."
        : "Résultat enregistré avec succès.",
      data: resultat,
    };
  } catch (error) {
    console.error("createResultatLaboratoire:", error);

    return {
      success: false,
      message: "Impossible d'enregistrer le résultat.",
    };
  }
}

/* ==========================================================
   VALIDER UN RÉSULTAT
========================================================== */

export async function validerResultatLaboratoire(
  id: number,
): Promise<ActionResult> {
  try {
    if (!id || !Number.isInteger(id)) {
      return {
        success: false,
        message: "Identifiant du résultat invalide.",
      };
    }

    const resultat = await prisma.resultatLaboratoire.findUnique({
      where: {
        id,
      },
    });

    if (!resultat) {
      return {
        success: false,
        message: "Résultat de laboratoire introuvable.",
      };
    }

    const resultatValide = await prisma.resultatLaboratoire.update({
      where: {
        id,
      },

      data: {
        valide: true,
      },
    });

    /* ======================================================
       VÉRIFIER SI TOUS LES EXAMENS ONT UN RÉSULTAT VALIDÉ
    ====================================================== */

    const demande = await prisma.demandeLaboratoire.findUnique({
      where: {
        id: resultat.demandeId,
      },

      include: {
        lignes: true,

        resultats: true,
      },
    });

    if (demande) {
      const tousLesExamensSontValides =
        demande.lignes.length > 0 &&
        demande.lignes.every((ligne) =>
          demande.resultats.some(
            (resultat) =>
              resultat.examenId === ligne.examenId && resultat.valide === true,
          ),
        );

      if (tousLesExamensSontValides) {
        await prisma.demandeLaboratoire.update({
          where: {
            id: demande.id,
          },

          data: {
            statut: "TERMINE",
          },
        });
      } else {
        await prisma.demandeLaboratoire.update({
          where: {
            id: demande.id,
          },

          data: {
            statut: "EN_COURS",
          },
        });
      }
    }

    return {
      success: true,
      message: "Résultat validé avec succès.",
      data: resultatValide,
    };
  } catch (error) {
    console.error("validerResultatLaboratoire:", error);

    return {
      success: false,
      message: "Impossible de valider le résultat.",
    };
  }
}
