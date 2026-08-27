
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type PatientInput = {
  numeroDossier: string;
  nom: string;
  postNom?: string;
  prenom?: string;
  sexe: string;

  dateNaissance?: string | Date | null;
  lieuNaissance?: string;

  telephone?: string;
  email?: string;
  adresse?: string;
  profession?: string;

  nationalite?: string;
  etatCivil?: string;
  groupeSanguin?: string;
  rhesus?: string;

  personneContact?: string;
  contactTelephone?: string;
  contactLien?: string;

  photo?: string;
};

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/*
|--------------------------------------------------------------------------
| UTILITAIRES
|--------------------------------------------------------------------------
*/

function clean(value?: string | null) {
  return value?.trim() || null;
}

function parseDateOrNull(
  value: string | Date | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  /*
   * HTML input type="date"
   * YYYY-MM-DD
   */
  const date = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

/*
|--------------------------------------------------------------------------
| CRÉER UN PATIENT
|--------------------------------------------------------------------------
*/

export async function createPatient(
  data: PatientInput
): Promise<ActionResult> {
  try {
    const numeroDossier =
      data.numeroDossier?.trim();

    const nom =
      data.nom?.trim();

    const sexe =
      data.sexe?.trim();

    if (!numeroDossier) {
      return {
        success: false,
        message:
          "Le numéro de dossier est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom du patient est obligatoire.",
      };
    }

    if (!sexe) {
      return {
        success: false,
        message:
          "Le sexe du patient est obligatoire.",
      };
    }

    /*
     * Vérification numéro de dossier
     */
    const patientExistant =
      await prisma.patient.findUnique({
        where: {
          numeroDossier,
        },
      });

    if (patientExistant) {
      return {
        success: false,
        message:
          "Un patient possède déjà ce numéro de dossier.",
      };
    }

    const patient =
      await prisma.patient.create({
        data: {
          numeroDossier,

          nom,
          postNom: clean(data.postNom),
          prenom: clean(data.prenom),

          sexe,

          dateNaissance:
            parseDateOrNull(
              data.dateNaissance
            ),

          lieuNaissance:
            clean(data.lieuNaissance),

          telephone:
            clean(data.telephone),

          email:
            clean(data.email),

          adresse:
            clean(data.adresse),

          profession:
            clean(data.profession),

          nationalite:
            clean(data.nationalite),

          etatCivil:
            clean(data.etatCivil),

          groupeSanguin:
            clean(data.groupeSanguin),

          rhesus:
            clean(data.rhesus),

          personneContact:
            clean(data.personneContact),

          contactTelephone:
            clean(data.contactTelephone),

          contactLien:
            clean(data.contactLien),

          photo:
            clean(data.photo),
        },
      });

    revalidatePath("/patients");

    return {
      success: true,
      message:
        "Le patient a été enregistré avec succès.",
      data: patient,
    };
  } catch (error) {
    console.error(
      "CREATE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de l'enregistrement du patient.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MODIFIER UN PATIENT
|--------------------------------------------------------------------------
*/

export async function updatePatient(
  id: number,
  data: PatientInput
): Promise<ActionResult> {
  try {
    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant du patient invalide.",
      };
    }

    const numeroDossier =
      data.numeroDossier?.trim();

    const nom =
      data.nom?.trim();

    const sexe =
      data.sexe?.trim();

    if (!numeroDossier) {
      return {
        success: false,
        message:
          "Le numéro de dossier est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom du patient est obligatoire.",
      };
    }

    if (!sexe) {
      return {
        success: false,
        message:
          "Le sexe du patient est obligatoire.",
      };
    }

    /*
     * Vérifier que le patient existe
     */
    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    /*
     * Vérifier l'unicité du numéro de dossier
     */
    const dossierExistant =
      await prisma.patient.findFirst({
        where: {
          numeroDossier,
          NOT: {
            id,
          },
        },
      });

    if (dossierExistant) {
      return {
        success: false,
        message:
          "Ce numéro de dossier est déjà utilisé par un autre patient.",
      };
    }

    /*
     * Mise à jour
     */
    const patientModifie =
      await prisma.patient.update({
        where: {
          id,
        },

        data: {
          numeroDossier,

          nom,
          postNom:
            clean(data.postNom),
          prenom:
            clean(data.prenom),

          sexe,

          /*
           * IMPORTANT :
           * data.dateNaissance
           * et non dateNaissance
           */
          dateNaissance:
            parseDateOrNull(
              data.dateNaissance
            ),

          lieuNaissance:
            clean(data.lieuNaissance),

          telephone:
            clean(data.telephone),

          email:
            clean(data.email),

          adresse:
            clean(data.adresse),

          profession:
            clean(data.profession),

          nationalite:
            clean(data.nationalite),

          etatCivil:
            clean(data.etatCivil),

          groupeSanguin:
            clean(data.groupeSanguin),

          rhesus:
            clean(data.rhesus),

          personneContact:
            clean(data.personneContact),

          contactTelephone:
            clean(data.contactTelephone),

          contactLien:
            clean(data.contactLien),

          photo:
            clean(data.photo),
        },
      });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    revalidatePath(
      `/patients/${id}/modifier`
    );

    return {
      success: true,
      message:
        "Le patient a été modifié avec succès.",
      data: patientModifie,
    };
  } catch (error) {
    console.error(
      "UPDATE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la modification du patient.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| ACTIVER / DÉSACTIVER
|--------------------------------------------------------------------------
*/

export async function togglePatient(
  id: number
): Promise<ActionResult> {
  try {
    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant du patient invalide.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    const actif =
      !patient.actif;

    await prisma.patient.update({
      where: {
        id,
      },

      data: {
        actif,
      },
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);

    return {
      success: true,
      message: actif
        ? "Le patient a été activé."
        : "Le patient a été désactivé.",
    };
  } catch (error) {
    console.error(
      "TOGGLE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut du patient.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UN PATIENT
|--------------------------------------------------------------------------
|
| Un patient ayant un historique médical/administratif
| ne doit pas être supprimé physiquement.
|
*/

export async function deletePatient(
  id: number
): Promise<ActionResult> {
  try {
    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant du patient invalide.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              rendezVous: true,
              admissions: true,
              consultations: true,
              prescriptions: true,
              demandesLabo: true,
              demandesImagerie: true,
              hospitalisations: true,
              factures: true,
              paiements: true,
              documents: true,
              assurances: true,
              constantes: true,
              sorties: true,
              allergies: true,
              antecedents: true,
              dispensations: true,
              proformas: true,
            },
          },
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    const totalRelations =
      patient._count.rendezVous +
      patient._count.admissions +
      patient._count.consultations +
      patient._count.prescriptions +
      patient._count.demandesLabo +
      patient._count.demandesImagerie +
      patient._count.hospitalisations +
      patient._count.factures +
      patient._count.paiements +
      patient._count.documents +
      patient._count.assurances +
      patient._count.constantes +
      patient._count.sorties +
      patient._count.allergies +
      patient._count.antecedents +
      patient._count.dispensations +
      patient._count.proformas;

    if (totalRelations > 0) {
      return {
        success: false,
        message:
          "Ce patient possède déjà des données médicales ou administratives. Il ne peut pas être supprimé. Désactivez-le plutôt.",
      };
    }

    await prisma.patient.delete({
      where: {
        id,
      },
    });

    revalidatePath("/patients");

    return {
      success: true,
      message:
        "Le patient a été supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer ce patient.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| RÉCUPÉRER UN PATIENT
|--------------------------------------------------------------------------
|
| Cette fonction correspond aux pages :
|
| /patients/[id]
| /patients/[id]/modifier
|
| Elles attendent :
|
| {
|   success: boolean,
|   message: string,
|   data: patient
| }
|
*/

export async function getPatient(
  id: number
): Promise<ActionResult> {
  try {
    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "Identifiant du patient invalide.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },

        include: {
          /*
           * Allergies
           */
          allergies: {
            orderBy: {
              createdAt: "desc",
            },
          },

          /*
           * Antécédents
           */
          antecedents: {
            orderBy: {
              createdAt: "desc",
            },
          },

          /*
           * Rendez-vous
           */
          rendezVous: {
            orderBy: {
              dateHeure: "desc",
            },

            include: {
              medecin: true,
              service: true,
              specialite: true,
            },
          },

          /*
           * Admissions
           */
          admissions: {
            orderBy: {
              dateAdmission: "desc",
            },

            include: {
              service: true,
              triage: true,
            },
          },

          /*
           * Consultations
           */
          consultations: {
            orderBy: {
              dateConsultation: "desc",
            },

            include: {
              medecin: true,
              service: true,
              specialite: true,
            },
          },

          /*
           * Prescriptions
           */
          prescriptions: {
            orderBy: {
              datePrescription: "desc",
            },

            include: {
              medecin: true,

              lignes: {
                include: {
                  medicament: true,
                },
              },
            },
          },

          /*
           * Laboratoire
           */
          demandesLabo: {
            orderBy: {
              dateDemande: "desc",
            },

            include: {
              lignes: {
                include: {
                  examen: true,
                },
              },

              resultats: true,
            },
          },

          /*
           * Imagerie
           */
          demandesImagerie: {
            orderBy: {
              dateDemande: "desc",
            },

            include: {
              examen: true,
              service: true,
            },
          },

          /*
           * Hospitalisations
           */
          hospitalisations: {
            orderBy: {
              dateEntree: "desc",
            },

            include: {
              service: true,
              medecin: true,

              lit: {
                include: {
                  chambre: true,
                },
              },
            },
          },

          /*
           * Factures
           */
          factures: {
            orderBy: {
              dateFacture: "desc",
            },

            include: {
              lignes: true,
              paiements: true,
            },
          },

          /*
           * Paiements
           */
          paiements: {
            orderBy: {
              datePaiement: "desc",
            },
          },

          /*
           * Documents
           */
          documents: {
            orderBy: {
              dateDocument: "desc",
            },
          },

          /*
           * Assurances
           */
          assurances: {
            include: {
              assurance: true,
            },
          },

          /*
           * Constantes
           */
          constantes: {
            orderBy: {
              dateMesure: "desc",
            },
          },

          /*
           * Sorties
           */
          sorties: {
            orderBy: {
              dateSortie: "desc",
            },
          },

          /*
           * Pharmacie
           */
          dispensations: {
            orderBy: {
              dateDispensation: "desc",
            },

            include: {
              lignes: {
                include: {
                  medicament: true,
                },
              },
            },
          },

          /*
           * Proformas
           */
          proformas: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    return {
      success: true,
      message:
        "Patient trouvé.",
      data: patient,
    };
  } catch (error) {
    console.error(
      "GET_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le patient.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| COMPATIBILITÉ ANCIEN NOM
|--------------------------------------------------------------------------
|
| Si un ancien composant utilise encore getPatientById(),
| il bénéficie maintenant du même comportement que getPatient().
|
*/

export async function getPatientById(
  id: number
): Promise<ActionResult> {
  return getPatient(id);
}

/*
|--------------------------------------------------------------------------
| LISTE DES PATIENTS
|--------------------------------------------------------------------------
*/

export async function getPatients() {
  try {
    return await prisma.patient.findMany({
      orderBy: [
        {
          nom: "asc",
        },
        {
          postNom: "asc",
        },
        {
          prenom: "asc",
        },
      ],

      include: {
        _count: {
          select: {
            rendezVous: true,
            admissions: true,
            consultations: true,
            hospitalisations: true,
            factures: true,
            paiements: true,
            documents: true,
            constantes: true,
            allergies: true,
            antecedents: true,
            dispensations: true,
            proformas: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      "GET_PATIENTS_ERROR:",
      error
    );

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| RECHERCHE PATIENTS
|--------------------------------------------------------------------------
*/

export async function searchPatients(
  search: string
) {
  try {
    const terme =
      search?.trim();

    if (!terme) {
      return getPatients();
    }

    return await prisma.patient.findMany({
      where: {
        OR: [
          {
            numeroDossier: {
              contains: terme,
            },
          },

          {
            nom: {
              contains: terme,
            },
          },

          {
            postNom: {
              contains: terme,
            },
          },

          {
            prenom: {
              contains: terme,
            },
          },

          {
            telephone: {
              contains: terme,
            },
          },

          {
            email: {
              contains: terme,
            },
          },
        ],
      },

      orderBy: {
        nom: "asc",
      },

      include: {
        _count: {
          select: {
            rendezVous: true,
            admissions: true,
            consultations: true,
            hospitalisations: true,
            factures: true,
            paiements: true,
            documents: true,
            constantes: true,
            allergies: true,
            antecedents: true,
            dispensations: true,
            proformas: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      "SEARCH_PATIENTS_ERROR:",
      error
    );

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| AJOUTER UNE CONSTANTE
|--------------------------------------------------------------------------
|
| Correspond exactement au modèle Constante du schéma.
|
*/

export async function addConstante(data: {
  patientId: number;
  admissionId?: number | null;
  consultationId?: number | null;

  temperature?: number | null;
  tensionSystolique?: number | null;
  tensionDiastolique?: number | null;
  pouls?: number | null;
  saturation?: number | null;
  poids?: number | null;
  taille?: number | null;
  frequenceRespiratoire?: number | null;
  glycemie?: number | null;
}): Promise<ActionResult> {
  try {
    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    const constante =
      await prisma.constante.create({
        data: {
          patientId:
            data.patientId,

          admissionId:
            data.admissionId ?? null,

          consultationId:
            data.consultationId ?? null,

          temperature:
            data.temperature ?? null,

          tensionSystolique:
            data.tensionSystolique ?? null,

          tensionDiastolique:
            data.tensionDiastolique ?? null,

          pouls:
            data.pouls ?? null,

          saturation:
            data.saturation ?? null,

          poids:
            data.poids ?? null,

          taille:
            data.taille ?? null,

          frequenceRespiratoire:
            data.frequenceRespiratoire ??
            null,

          glycemie:
            data.glycemie ?? null,
        },
      });

    revalidatePath(
      `/patients/${data.patientId}`
    );

    return {
      success: true,
      message:
        "Les constantes ont été enregistrées.",
      data: constante,
    };
  } catch (error) {
    console.error(
      "ADD_CONSTANTE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'enregistrer les constantes.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UNE CONSTANTE
|--------------------------------------------------------------------------
*/

export async function deleteConstante(
  id: number,
  patientId: number
): Promise<ActionResult> {
  try {
    const constante =
      await prisma.constante.findUnique({
        where: {
          id,
        },
      });

    if (!constante) {
      return {
        success: false,
        message:
          "Constante introuvable.",
      };
    }

    if (
      constante.patientId !==
      patientId
    ) {
      return {
        success: false,
        message:
          "Cette constante n'appartient pas à ce patient.",
      };
    }

    await prisma.constante.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/patients/${patientId}`
    );

    return {
      success: true,
      message:
        "La constante a été supprimée.",
    };
  } catch (error) {
    console.error(
      "DELETE_CONSTANTE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer la constante.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| AJOUTER UNE ALLERGIE
|--------------------------------------------------------------------------
*/

export async function addAllergie(data: {
  patientId: number;
  allergene: string;
  reaction?: string;
  gravite?: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    if (!data.allergene?.trim()) {
      return {
        success: false,
        message:
          "L'allergène est obligatoire.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    const allergie =
      await prisma.allergie.create({
        data: {
          patientId:
            data.patientId,

          allergene:
            data.allergene.trim(),

          reaction:
            clean(data.reaction),

          gravite:
            clean(data.gravite),

          description:
            clean(data.description),
        },
      });

    revalidatePath(
      `/patients/${data.patientId}`
    );

    return {
      success: true,
      message:
        "L'allergie a été ajoutée.",
      data: allergie,
    };
  } catch (error) {
    console.error(
      "ADD_ALLERGIE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'ajouter l'allergie.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UNE ALLERGIE
|--------------------------------------------------------------------------
*/

export async function deleteAllergie(
  id: number,
  patientId: number
): Promise<ActionResult> {
  try {
    const allergie =
      await prisma.allergie.findUnique({
        where: {
          id,
        },
      });

    if (!allergie) {
      return {
        success: false,
        message:
          "Allergie introuvable.",
      };
    }

    if (
      allergie.patientId !==
      patientId
    ) {
      return {
        success: false,
        message:
          "Cette allergie n'appartient pas à ce patient.",
      };
    }

    await prisma.allergie.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/patients/${patientId}`
    );

    return {
      success: true,
      message:
        "L'allergie a été supprimée.",
    };
  } catch (error) {
    console.error(
      "DELETE_ALLERGIE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'allergie.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| AJOUTER UN ANTÉCÉDENT
|--------------------------------------------------------------------------
*/

export async function addAntecedent(data: {
  patientId: number;
  type: string;
  libelle: string;
  description?: string;
  dateDebut?: string | Date | null;
  dateFin?: string | Date | null;
}): Promise<ActionResult> {
  try {
    if (!data.type?.trim()) {
      return {
        success: false,
        message:
          "Le type de l'antécédent est obligatoire.",
      };
    }

    if (!data.libelle?.trim()) {
      return {
        success: false,
        message:
          "Le libellé de l'antécédent est obligatoire.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    const antecedent =
      await prisma.antecedent.create({
        data: {
          patientId:
            data.patientId,

          type:
            data.type.trim(),

          libelle:
            data.libelle.trim(),

          description:
            clean(data.description),

          dateDebut:
            parseDateOrNull(
              data.dateDebut
            ),

          dateFin:
            parseDateOrNull(
              data.dateFin
            ),
        },
      });

    revalidatePath(
      `/patients/${data.patientId}`
    );

    return {
      success: true,
      message:
        "L'antécédent a été ajouté.",
      data: antecedent,
    };
  } catch (error) {
    console.error(
      "ADD_ANTECEDENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'ajouter l'antécédent.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UN ANTÉCÉDENT
|--------------------------------------------------------------------------
*/

export async function deleteAntecedent(
  id: number,
  patientId: number
): Promise<ActionResult> {
  try {
    const antecedent =
      await prisma.antecedent.findUnique({
        where: {
          id,
        },
      });

    if (!antecedent) {
      return {
        success: false,
        message:
          "Antécédent introuvable.",
      };
    }

    if (
      antecedent.patientId !==
      patientId
    ) {
      return {
        success: false,
        message:
          "Cet antécédent n'appartient pas à ce patient.",
      };
    }

    await prisma.antecedent.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/patients/${patientId}`
    );

    return {
      success: true,
      message:
        "L'antécédent a été supprimé.",
    };
  } catch (error) {
    console.error(
      "DELETE_ANTECEDENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'antécédent.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| AJOUTER UN DOCUMENT PATIENT
|--------------------------------------------------------------------------
|
| Le modèle DocumentPatient contient :
|
| patientId
| type
| nom
| fichier
| description
| dateDocument
|
| Le fichier est enregistré dans :
|
| public/uploads/patients
|
*/

export async function addDocument(
  formData: FormData
): Promise<ActionResult> {
  try {
    const patientId =
      Number(
        formData.get("patientId")
      );

    const nom =
      String(
        formData.get("nom") || ""
      ).trim();

    const type =
      String(
        formData.get("type") || ""
      ).trim();

    const description =
      String(
        formData.get("description") || ""
      ).trim();

    const file =
      formData.get("file");

    if (
      !patientId ||
      !Number.isInteger(patientId)
    ) {
      return {
        success: false,
        message:
          "Patient invalide.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom du document est obligatoire.",
      };
    }

    if (!type) {
      return {
        success: false,
        message:
          "Le type du document est obligatoire.",
      };
    }

    if (
      !file ||
      !(file instanceof File) ||
      file.size === 0
    ) {
      return {
        success: false,
        message:
          "Veuillez sélectionner un fichier.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

    if (!patient) {
      return {
        success: false,
        message:
          "Patient introuvable.",
      };
    }

    /*
     * Types autorisés
     */
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      return {
        success: false,
        message:
          "Format de fichier non autorisé. PDF, JPG, PNG ou WEBP uniquement.",
      };
    }

    /*
     * Taille maximale : 10 MB
     */
    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        success: false,
        message:
          "Le fichier ne doit pas dépasser 10 Mo.",
      };
    }

    const extension =
      path.extname(
        file.name
      ) || ".bin";

    const safeExtension =
      extension
        .toLowerCase()
        .replace(
          /[^a-z0-9.]/g,
          ""
        );

    const filename =
      `${patientId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}${safeExtension}`;

    const uploadDir =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "patients"
      );

    await mkdir(
      uploadDir,
      {
        recursive: true,
      }
    );

    const filePath =
      path.join(
        uploadDir,
        filename
      );

    const bytes =
      await file.arrayBuffer();

    await writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const fichier =
      `/uploads/patients/${filename}`;

    const document =
      await prisma.documentPatient.create({
        data: {
          patientId,

          type,

          nom,

          fichier,

          description:
            description || null,
        },
      });

    revalidatePath(
      `/patients/${patientId}`
    );

    return {
      success: true,
      message:
        "Le document a été ajouté avec succès.",
      data: document,
    };
  } catch (error) {
    console.error(
      "ADD_DOCUMENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'ajouter le document.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UN DOCUMENT
|--------------------------------------------------------------------------
*/

export async function deleteDocument(
  id: number,
  patientId: number
): Promise<ActionResult> {
  try {
    const document =
      await prisma.documentPatient.findUnique({
        where: {
          id,
        },
      });

    if (!document) {
      return {
        success: false,
        message:
          "Document introuvable.",
      };
    }

    if (
      document.patientId !==
      patientId
    ) {
      return {
        success: false,
        message:
          "Ce document n'appartient pas à ce patient.",
      };
    }

    /*
     * Supprimer le fichier physique
     */
    if (
      document.fichier &&
      document.fichier.startsWith(
        "/uploads/"
      )
    ) {
      const filePath =
        path.join(
          process.cwd(),
          "public",
          document.fichier
            .replace(
              /^\/+/,
              ""
            )
        );

      try {
        await unlink(
          filePath
        );
      } catch {
        /*
         * Le fichier peut déjà
         * ne plus exister.
         */
      }
    }

    await prisma.documentPatient.delete({
      where: {
        id,
      },
    });

    revalidatePath(
      `/patients/${patientId}`
    );

    return {
      success: true,
      message:
        "Le document a été supprimé.",
    };
  } catch (error) {
    console.error(
      "DELETE_DOCUMENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer le document.",
    };
  }
}
