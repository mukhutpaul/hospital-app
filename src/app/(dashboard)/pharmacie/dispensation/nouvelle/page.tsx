import { getOrdonnanceById } from "@/app/actions/dispensations";
import DispensationForm from "@/components/pharmacie/DispensationForm";

/* ==========================================================
   TYPES
========================================================== */

type Ordonnance = {
  id: number;
  numero: string;
  statut: string;
  datePrescription: Date | string;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  lignes: {
    id: number;
    quantite: number;

    posologie?: string | null;
    dose?: string | null;
    frequence?: string | null;
    duree?: string | null;
    voie?: string | null;

    medicament?: {
      id: number;
      code: string;
      nom: string;
      forme?: string | null;
      dosage?: string | null;
    } | null;
  }[];
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  searchParams: Promise<{
    prescriptionId?: string;
  }>;
};

/* ==========================================================
   PAGE
========================================================== */

export default async function NouvelleDispensationPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const prescriptionId = Number(
    params.prescriptionId
  );

  /* ========================================================
     VÉRIFICATION ID
  ======================================================== */

  if (
    !prescriptionId ||
    !Number.isInteger(prescriptionId)
  ) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          Veuillez sélectionner une ordonnance valide.
        </div>
      </div>
    );
  }

  /* ========================================================
     RÉCUPÉRATION DE L'ORDONNANCE
  ======================================================== */

  const result =
    await getOrdonnanceById(
      prescriptionId
    );

  if (
    !result.success ||
    !result.data
  ) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          {result.message}
        </div>
      </div>
    );
  }

  /* ========================================================
     NORMALISATION
  ======================================================== */

  const data =
    result.data as {
      id: number;
      numero: string;
      statut: string;
      datePrescription: Date | string;

      patient?: {
        id: number;
        nom: string;
        postNom?: string | null;
        prenom?: string | null;
        numeroDossier?: string | null;
      } | null;

      lignes?: {
        id: number;
        quantite: number;

        posologie?: string | null;
        dose?: string | null;
        frequence?: string | null;
        duree?: string | null;
        voie?: string | null;

        medicament?: {
          id: number;
          code: string;
          nom: string;
          forme?: string | null;
          dosage?: string | null;
        } | null;
      }[];
    };

  const ordonnance: Ordonnance = {
    id: data.id,

    numero: data.numero,

    statut: data.statut,

    datePrescription:
      data.datePrescription,

    patient: data.patient
      ? {
          id: data.patient.id,

          nom: data.patient.nom,

          postNom:
            data.patient.postNom ??
            null,

          prenom:
            data.patient.prenom ??
            null,

          numeroDossier:
            data.patient
              .numeroDossier ??
            null,
        }
      : null,

    lignes: Array.isArray(
      data.lignes
    )
      ? data.lignes.map(
          (ligne) => ({
            id: ligne.id,

            quantite:
              Number(
                ligne.quantite
              ),

            posologie:
              ligne.posologie ??
              null,

            dose:
              ligne.dose ??
              null,

            frequence:
              ligne.frequence ??
              null,

            duree:
              ligne.duree ??
              null,

            voie:
              ligne.voie ??
              null,

            medicament:
              ligne.medicament
                ? {
                    id:
                      ligne
                        .medicament
                        .id,

                    code:
                      ligne
                        .medicament
                        .code,

                    nom:
                      ligne
                        .medicament
                        .nom,

                    forme:
                      ligne
                        .medicament
                        .forme ??
                      null,

                    dosage:
                      ligne
                        .medicament
                        .dosage ??
                      null,
                  }
                : null,
          })
        )
      : [],
  };

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <div className="p-6 space-y-6">

      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Nouvelle dispensation
        </h1>

        <p className="text-sm text-base-content/60">
          Délivrez les médicaments prescrits
          au patient.
        </p>
      </div>

      {/* ====================================================
          ORDONNANCE
      ==================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Ordonnance sélectionnée
          </h2>

          <div className="mb-4">
            <span className="font-semibold">
              N° ordonnance :
            </span>{" "}
            {ordonnance.numero}
          </div>

          <DispensationForm
            ordonnances={[
              ordonnance,
            ]}
          />

        </div>
      </div>

    </div>
  );
}