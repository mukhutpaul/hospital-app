"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

/* ==========================================================
   TYPE
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   NUMÉRO DEMANDE IMAGERIE
========================================================== */

async function generateNumeroImagerie() {
  const count = await prisma.demandeImagerie.count();

  return `IMG-${String(count + 1).padStart(6, "0")}`;
}

/* ==========================================================
   EXAMENS D'IMAGERIE
========================================================== */

export async function getExamensImagerie(): Promise<ActionResult> {
  try {
    const examens = await prisma.examenImagerie.findMany({
      orderBy: {
        nom: "asc",
      },

      include: {
        _count: {
          select: {
            demandes: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Examens d'imagerie récupérés.",
      data: examens,
    };
  } catch (error) {
    console.error("Erreur getExamensImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les examens d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER UN EXAMEN D'IMAGERIE
========================================================== */

export async function createExamenImagerie(data: {
  code: string;
  nom: string;
  type: string;
  description?: string;
  prix?: number;
  devise?: string;
}): Promise<ActionResult> {
  try {
    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const type = data.type?.trim();

    const description = data.description?.trim() || null;
    const devise = data.devise?.trim().toUpperCase() || "USD";

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

    if (!type) {
      return {
        success: false,
        message: "La catégorie d'imagerie est obligatoire.",
      };
    }

    const examenExiste = await prisma.examenImagerie.findUnique({
      where: {
        code,
      },
    });

    if (examenExiste) {
      return {
        success: false,
        message: `Le code "${code}" est déjà utilisé.`,
      };
    }

    const prix =
      typeof data.prix === "number" && Number.isFinite(data.prix)
        ? data.prix
        : 0;

    const examen = await prisma.examenImagerie.create({
      data: {
        code,
        nom,
        type,
        description,
        prix,
        devise,
        actif: true,
      },
    });

    revalidatePath("/imagerie");

    return {
      success: true,
      message: `L'examen "${nom}" a été créé avec succès.`,
      data: examen,
    };
  } catch (error) {
    console.error("Erreur createExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de créer l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   MODIFIER UN EXAMEN D'IMAGERIE
========================================================== */

export async function updateExamenImagerie(
  id: number,
  data: {
    code: string;
    nom: string;
    type: string;
    description?: string;
    prix?: number;
    devise?: string;
    actif?: boolean;
  },
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    const code = data.code?.trim().toUpperCase();
    const nom = data.nom?.trim();
    const type = data.type?.trim();

    const description = data.description?.trim() || null;
    const devise = data.devise?.trim().toUpperCase() || "USD";

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

    if (!type) {
      return {
        success: false,
        message: "La catégorie d'imagerie est obligatoire.",
      };
    }

    const examen = await prisma.examenImagerie.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable.",
      };
    }

    const codeExiste = await prisma.examenImagerie.findFirst({
      where: {
        code,
        NOT: {
          id,
        },
      },
    });

    if (codeExiste) {
      return {
        success: false,
        message: `Le code "${code}" est déjà utilisé.`,
      };
    }

    const prix =
      typeof data.prix === "number" && Number.isFinite(data.prix)
        ? data.prix
        : 0;

    const examenModifie = await prisma.examenImagerie.update({
      where: {
        id,
      },

      data: {
        code,
        nom,
        type,
        description,
        prix,
        devise,
        actif: data.actif ?? examen.actif,
      },
    });

    revalidatePath("/imagerie");

    return {
      success: true,
      message: "Examen d'imagerie modifié avec succès.",
      data: examenModifie,
    };
  } catch (error) {
    console.error("Erreur updateExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de modifier l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   DÉSACTIVER UN EXAMEN
========================================================== */

export async function deleteExamenImagerie(
  id: number,
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de l'examen invalide.",
      };
    }

    const examen = await prisma.examenImagerie.findUnique({
      where: {
        id,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable.",
      };
    }

    await prisma.examenImagerie.update({
      where: {
        id,
      },

      data: {
        actif: false,
      },
    });

    revalidatePath("/imagerie");

    return {
      success: true,
      message: "Examen d'imagerie désactivé avec succès.",
    };
  } catch (error) {
    console.error("Erreur deleteExamenImagerie :", error);

    return {
      success: false,
      message: "Impossible de désactiver l'examen d'imagerie.",
    };
  }
}

/* ==========================================================
   CATÉGORIES D'IMAGERIE
========================================================== */

export async function getCategoriesImagerie(): Promise<ActionResult> {
  try {
    const categories = await prisma.examenImagerie.findMany({
      where: {
        actif: true,
      },

      select: {
        type: true,
      },

      distinct: ["type"],

      orderBy: {
        type: "asc",
      },
    });

    const resultats = categories
      .map((categorie) => categorie.type?.trim())
      .filter((type): type is string => Boolean(type));

    return {
      success: true,
      message: "Catégories d'imagerie récupérées.",
      data: resultats,
    };
  } catch (error) {
    console.error("Erreur getCategoriesImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les catégories d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   CRÉER UNE DEMANDE D'IMAGERIE
========================================================== */

export async function createDemandeImagerie(data: {
  patientId: number;
  consultationId?: number | null;
  serviceId?: number | null;
  examenId: number;
  motif?: string;
  urgence?: boolean;
}): Promise<ActionResult> {
  try {
    if (!data.patientId) {
      return {
        success: false,
        message: "Le patient est obligatoire.",
      };
    }

    if (!data.examenId) {
      return {
        success: false,
        message: "L'examen d'imagerie est obligatoire.",
      };
    }

    const examen = await prisma.examenImagerie.findFirst({
      where: {
        id: data.examenId,
        actif: true,
      },
    });

    if (!examen) {
      return {
        success: false,
        message: "Examen d'imagerie introuvable ou inactif.",
      };
    }

    const numero = await generateNumeroImagerie();

    const demande = await prisma.demandeImagerie.create({
      data: {
        numero,
        patientId: data.patientId,
        consultationId: data.consultationId ?? null,
        serviceId: data.serviceId ?? null,
        examenId: data.examenId,
        motif: data.motif?.trim() || null,
        urgence: data.urgence ?? false,
        statut: "DEMANDE",
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
          },
        },
      },
    });

    revalidatePath("/imagerie");

    if (data.consultationId) {
      revalidatePath(
        `/consultations/${data.consultationId}`,
      );
    }

    return {
      success: true,
      message: `Demande ${numero} créée avec succès.`,
      data: demande,
    };
  } catch (error) {
    console.error("Erreur createDemandeImagerie :", error);

    return {
      success: false,
      message: "Erreur lors de la création de la demande d'imagerie.",
    };
  }
}

/* ==========================================================
   LISTE DES DEMANDES
========================================================== */

export async function getDemandesImagerie(): Promise<ActionResult> {
  try {
    const demandes = await prisma.demandeImagerie.findMany({
      orderBy: {
        dateDemande: "desc",
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Demandes d'imagerie récupérées.",
      data: demandes,
    };
  } catch (error) {
    console.error("Erreur getDemandesImagerie :", error);

    return {
      success: false,
      message: "Impossible de récupérer les demandes d'imagerie.",
      data: [],
    };
  }
}

/* ==========================================================
   DÉTAIL D'UNE DEMANDE
========================================================== */

export async function getDemandeImagerie(
  id: number,
): Promise<ActionResult> {
  try {
    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de la demande invalide.",
      };
    }

    const demande = await prisma.demandeImagerie.findUnique({
      where: {
        id,
      },

      include: {
        patient: true,
        examen: true,
        service: true,

        consultation: {
          include: {
            medecin: true,
            specialite: true,
          },
        },
      },
    });

    if (!demande) {
      return {
        success: false,
        message: "Demande d'imagerie introuvable.",
      };
    }

    return {
      success: true,
      message: "Demande d'imagerie récupérée.",
      data: demande,
    };
  } catch (error) {
    console.error("Erreur getDemandeImagerie :", error);

    return {
      success: false,
      message: "Erreur lors du chargement de la demande.",
    };
  }
}

/* ==========================================================
   TYPES FICHIERS AUTORISÉS
========================================================== */

const TYPES_FICHIERS_IMAGERIE = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/* ==========================================================
   EXTENSIONS AUTORISÉES
========================================================== */

const EXTENSIONS_FICHIERS_IMAGERIE = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

/* ==========================================================
   TAILLE MAXIMALE
========================================================== */

const TAILLE_MAX_FICHIER = 10 * 1024 * 1024;

/* ==========================================================
   NETTOYER NOM FICHIER
========================================================== */

function nettoyerNomFichier(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

/* ==========================================================
   OBTENIR EXTENSION
========================================================== */

function obtenirExtension(nom: string): string {
  const extension = path.extname(nom).toLowerCase();

  if (
    !EXTENSIONS_FICHIERS_IMAGERIE.includes(
      extension as (typeof EXTENSIONS_FICHIERS_IMAGERIE)[number],
    )
  ) {
    return "";
  }

  return extension;
}

/* ==========================================================
   ENREGISTRER LE FICHIER
========================================================== */

async function sauvegarderFichierImagerie(
  fichier: File,
  numeroDemande: string,
): Promise<string> {
  /* --------------------------------------------------------
     VALIDATION TYPE
  -------------------------------------------------------- */

  if (
    !TYPES_FICHIERS_IMAGERIE.includes(
      fichier.type as (typeof TYPES_FICHIERS_IMAGERIE)[number],
    )
  ) {
    throw new Error(
      "Format de fichier non autorisé. Utilisez PDF, JPG, PNG ou WEBP.",
    );
  }

  /* --------------------------------------------------------
     VALIDATION TAILLE
  -------------------------------------------------------- */

  if (fichier.size > TAILLE_MAX_FICHIER) {
    throw new Error(
      "Le fichier ne doit pas dépasser 10 Mo.",
    );
  }

  if (fichier.size <= 0) {
    throw new Error("Le fichier sélectionné est vide.");
  }

  /* --------------------------------------------------------
     EXTENSION
  -------------------------------------------------------- */

  const extension = obtenirExtension(fichier.name);

  if (!extension) {
    throw new Error(
      "Extension de fichier non autorisée.",
    );
  }

  /* --------------------------------------------------------
     DOSSIER DEMANDE
  -------------------------------------------------------- */

  const dossierUploads = path.join(
    process.cwd(),
    "public",
    "uploads",
    "imagerie",
    numeroDemande,
  );

  await mkdir(dossierUploads, {
    recursive: true,
  });

  /* --------------------------------------------------------
     NOM FICHIER
  -------------------------------------------------------- */

  const nomOriginal = nettoyerNomFichier(
    path.basename(fichier.name, extension),
  );

  const timestamp = Date.now();

  const nomFichier =
    `${nomOriginal}-${timestamp}${extension}`;

  const cheminAbsolu = path.join(
    dossierUploads,
    nomFichier,
  );

  /* --------------------------------------------------------
     CONVERSION
  -------------------------------------------------------- */

  const buffer = Buffer.from(
    await fichier.arrayBuffer(),
  );

  /* --------------------------------------------------------
     ÉCRITURE DISQUE
  -------------------------------------------------------- */

  await writeFile(
    cheminAbsolu,
    buffer,
  );

  /* --------------------------------------------------------
     CHEMIN PUBLIC
  -------------------------------------------------------- */

  return `/uploads/imagerie/${encodeURIComponent(
    numeroDemande,
  )}/${encodeURIComponent(nomFichier)}`;
}

/* ==========================================================
   ENREGISTRER LE COMPTE RENDU
========================================================== */

export async function updateCompteRenduImagerie(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  let nouveauFichierChemin: string | null = null;

  try {
    /* --------------------------------------------------------
       VALIDATION ID
    -------------------------------------------------------- */

    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        message: "Identifiant de la demande invalide.",
      };
    }

    /* --------------------------------------------------------
       VÉRIFIER LA DEMANDE
    -------------------------------------------------------- */

    const demandeExiste =
      await prisma.demandeImagerie.findUnique({
        where: {
          id,
        },
      });

    if (!demandeExiste) {
      return {
        success: false,
        message: "Demande d'imagerie introuvable.",
      };
    }

    /* --------------------------------------------------------
       RÉCUPÉRER LES DONNÉES FORM DATA
    -------------------------------------------------------- */

    const dateExamenValue =
      formData.get("dateExamen");

    const compteRenduValue =
      formData.get("compteRendu");

    const conclusionValue =
      formData.get("conclusion");

    const fichierValue =
      formData.get("fichier");

    /* --------------------------------------------------------
       VALIDATION TEXTE
    -------------------------------------------------------- */

    const dateExamenString =
      typeof dateExamenValue === "string"
        ? dateExamenValue.trim()
        : "";

    const compteRendu =
      typeof compteRenduValue === "string"
        ? compteRenduValue.trim()
        : "";

    const conclusion =
      typeof conclusionValue === "string"
        ? conclusionValue.trim()
        : "";

    /* --------------------------------------------------------
       DATE EXAMEN
    -------------------------------------------------------- */

    let dateExamen: Date | null = null;

    if (dateExamenString) {
      const date = new Date(dateExamenString);

      if (Number.isNaN(date.getTime())) {
        return {
          success: false,
          message: "La date de l'examen est invalide.",
        };
      }

      dateExamen = date;
    }

    /* --------------------------------------------------------
       FICHIER
    -------------------------------------------------------- */

    let fichier: File | null = null;

    if (
      fichierValue &&
      typeof fichierValue !== "string" &&
      fichierValue instanceof File &&
      fichierValue.size > 0
    ) {
      fichier = fichierValue;
    }

    /* --------------------------------------------------------
       SAUVEGARDER NOUVEAU FICHIER
    -------------------------------------------------------- */

    if (fichier) {
      nouveauFichierChemin =
        await sauvegarderFichierImagerie(
          fichier,
          demandeExiste.numero,
        );
    }

    /* --------------------------------------------------------
       CONSERVER ANCIEN FICHIER
    -------------------------------------------------------- */

    const fichierFinal =
      nouveauFichierChemin ??
      demandeExiste.fichier ??
      null;

    /* --------------------------------------------------------
       MISE À JOUR PRISMA
    -------------------------------------------------------- */

    const demande =
      await prisma.demandeImagerie.update({
        where: {
          id,
        },

        data: {
          dateExamen,

          compteRendu:
            compteRendu || null,

          conclusion:
            conclusion || null,

          fichier:
            fichierFinal,

          statut: "TERMINE",
        },

        include: {
          patient: true,
          examen: true,
          consultation: true,
        },
      });

    /* --------------------------------------------------------
       SUPPRIMER ANCIEN FICHIER
       
       Seulement après que Prisma ait correctement
       enregistré le nouveau fichier.
    -------------------------------------------------------- */

    if (
      nouveauFichierChemin &&
      demandeExiste.fichier &&
      demandeExiste.fichier !== nouveauFichierChemin
    ) {
      try {
        const ancienChemin =
          demandeExiste.fichier.startsWith("/")
            ? demandeExiste.fichier.substring(1)
            : demandeExiste.fichier;

        const ancienFichierAbsolu =
          path.join(
            process.cwd(),
            "public",
            ancienChemin,
          );

        await unlink(ancienFichierAbsolu);
      } catch (error) {
        /**
         * L'ancien fichier peut ne plus exister.
         * Ce n'est pas bloquant pour la mise à jour.
         */
        console.warn(
          "Impossible de supprimer l'ancien fichier :",
          error,
        );
      }
    }

    /* --------------------------------------------------------
       REVALIDATION
    -------------------------------------------------------- */

    revalidatePath("/imagerie");

    revalidatePath(`/imagerie/${id}`);

    if (demande.consultationId) {
      revalidatePath(
        `/consultations/${demande.consultationId}`,
      );
    }

    /* --------------------------------------------------------
       RÉSULTAT
    -------------------------------------------------------- */

    return {
      success: true,
      message: "Compte rendu d'imagerie enregistré.",
      data: demande,
    };
  } catch (error) {
    console.error(
      "Erreur updateCompteRenduImagerie :",
      error,
    );

    /* --------------------------------------------------------
       NETTOYER LE NOUVEAU FICHIER SI PRISMA A ÉCHOUÉ
    -------------------------------------------------------- */

    if (nouveauFichierChemin) {
      try {
        const cheminRelatif =
          nouveauFichierChemin.startsWith("/")
            ? nouveauFichierChemin.substring(1)
            : nouveauFichierChemin;

        const cheminAbsolu =
          path.join(
            process.cwd(),
            "public",
            cheminRelatif,
          );

        await unlink(cheminAbsolu);
      } catch (cleanupError) {
        console.warn(
          "Impossible de nettoyer le fichier après erreur :",
          cleanupError,
        );
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer le compte rendu.",
    };
  }
}