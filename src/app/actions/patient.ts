"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type PatientInput = {
  numeroDossier: string;
  nom: string;
  postNom?: string;
  prenom?: string;
  sexe: string;
  dateNaissance?: Date | null;
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

/*
|--------------------------------------------------------------------------
| CRÉER UN PATIENT
|--------------------------------------------------------------------------
*/

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

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // Input HTML type="date" : YYYY-MM-DD
  const date = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function createPatient(
  data: PatientInput
) {
  try {
    const numeroDossier =
      data.numeroDossier.trim();

    const nom = data.nom.trim();
    const sexe = data.sexe.trim();

    if (!numeroDossier) {
      return {
        success: false,
        message: "Le numéro de dossier est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom du patient est obligatoire.",
      };
    }

    if (!sexe) {
      return {
        success: false,
        message: "Le sexe du patient est obligatoire.",
      };
    }

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
          postNom:
            data.postNom?.trim() || null,
          prenom:
            data.prenom?.trim() || null,

          sexe,

          dateNaissance:
            parseDateOrNull(data.dateNaissance),

          lieuNaissance:
            data.lieuNaissance?.trim() || null,

          telephone:
            data.telephone?.trim() || null,

          email:
            data.email?.trim() || null,

          adresse:
            data.adresse?.trim() || null,

          profession:
            data.profession?.trim() || null,

          nationalite:
            data.nationalite?.trim() || null,

          etatCivil:
            data.etatCivil?.trim() || null,

          groupeSanguin:
            data.groupeSanguin?.trim() || null,

          rhesus:
            data.rhesus?.trim() || null,

          personneContact:
            data.personneContact?.trim() || null,

          contactTelephone:
            data.contactTelephone?.trim() || null,

          contactLien:
            data.contactLien?.trim() || null,

          photo:
            data.photo?.trim() || null,
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
) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Identifiant du patient invalide.",
      };
    }

    const numeroDossier =
      data.numeroDossier.trim();

    const nom = data.nom.trim();
    const sexe = data.sexe.trim();

    if (!numeroDossier) {
      return {
        success: false,
        message: "Le numéro de dossier est obligatoire.",
      };
    }

    if (!nom) {
      return {
        success: false,
        message: "Le nom du patient est obligatoire.",
      };
    }

    if (!sexe) {
      return {
        success: false,
        message: "Le sexe du patient est obligatoire.",
      };
    }

    const patient =
      await prisma.patient.findUnique({
        where: { id },
      });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

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

    const patientModifie =
      await prisma.patient.update({
        where: {
          id,
        },

        data: {
          numeroDossier,

          nom,
          postNom:
            data.postNom?.trim() || null,
          prenom:
            data.prenom?.trim() || null,

          sexe,

 
          dateNaissance: parseDateOrNull(dateNaissance),

          lieuNaissance:
            data.lieuNaissance?.trim() || null,

          telephone:
            data.telephone?.trim() || null,

          email:
            data.email?.trim() || null,

          adresse:
            data.adresse?.trim() || null,

          profession:
            data.profession?.trim() || null,

          nationalite:
            data.nationalite?.trim() || null,

          etatCivil:
            data.etatCivil?.trim() || null,

          groupeSanguin:
            data.groupeSanguin?.trim() || null,

          rhesus:
            data.rhesus?.trim() || null,

          personneContact:
            data.personneContact?.trim() || null,

          contactTelephone:
            data.contactTelephone?.trim() || null,

          contactLien:
            data.contactLien?.trim() || null,

          photo:
            data.photo?.trim() || null,
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
) {
  try {
    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },
      });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
      };
    }

    const nouveauStatut =
      !patient.actif;

    await prisma.patient.update({
      where: {
        id,
      },

      data: {
        actif: nouveauStatut,
      },
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);

    return {
      success: true,
      message: nouveauStatut
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
*/

export async function deletePatient(
  id: number
) {
  try {
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
            },
          },
        },
      });

    if (!patient) {
      return {
        success: false,
        message: "Patient introuvable.",
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
      patient._count.antecedents;

    /*
    |----------------------------------------------------------------------
    | PROTECTION DES DONNÉES MÉDICALES
    |----------------------------------------------------------------------
    |
    | On ne supprime pas physiquement un patient qui possède
    | déjà un historique médical ou financier.
    |
    */

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
*/

export async function getPatientById(
  id: number
) {
  try {
    const patient =
      await prisma.patient.findUnique({
        where: {
          id,
        },

        include: {
          allergies: true,
          antecedents: true,

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

          admissions: {
            orderBy: {
              dateAdmission: "desc",
            },

            include: {
              service: true,
              triage: true,
            },
          },

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

          demandesImagerie: {
            orderBy: {
              dateDemande: "desc",
            },

            include: {
              examen: true,
              service: true,
            },
          },

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

          factures: {
            orderBy: {
              dateFacture: "desc",
            },

            include: {
              lignes: true,
              paiements: true,
            },
          },

          paiements: {
            orderBy: {
              datePaiement: "desc",
            },
          },

          documents: {
            orderBy: {
              dateDocument: "desc",
            },
          },

          assurances: {
            include: {
              assurance: true,
            },
          },

          constantes: {
            orderBy: {
              dateMesure: "desc",
            },
          },

          sorties: {
            orderBy: {
              dateSortie: "desc",
            },
          },
        },
      });

    return patient;
  } catch (error) {
    console.error(
      "GET_PATIENT_ERROR:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| LISTE DES PATIENTS
|--------------------------------------------------------------------------
*/

export async function getPatients() {
  try {
    const patients =
      await prisma.patient.findMany({
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
            },
          },
        },
      });

    return patients;
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
    const terme = search.trim();

    if (!terme) {
      return getPatients();
    }

    const patients =
      await prisma.patient.findMany({
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
            },
          },
        },
      });

    return patients;
  } catch (error) {
    console.error(
      "SEARCH_PATIENTS_ERROR:",
      error
    );

    return [];
  }
}