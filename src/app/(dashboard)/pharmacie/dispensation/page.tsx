
import {
  getDispensations,
  getOrdonnances,
} from "@/app/actions/dispensations";

import DispensationForm from "@/components/pharmacie/DispensationForm";
import DispensationTable from "@/components/pharmacie/DispensationTable";

/* ==========================================================
   TYPES
========================================================== */

type MedicamentOrdonnance = {
  id: number;
  code: string;
  nom: string;
  forme: string | null;
  dosage: string | null;
};

type LigneOrdonnance = {
  id: number;
  quantite: number;

  posologie: string | null;
  dose: string | null;
  frequence: string | null;
  duree: string | null;
  voie: string | null;

  medicament: MedicamentOrdonnance | null;
};

type Ordonnance = {
  id: number;
  numero: string;
  statut: string;
  datePrescription: Date | string;

  patient: {
    id: number;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    numeroDossier: string | null;
  } | null;

  lignes: LigneOrdonnance[];
};

/* ==========================================================
   PAGE
========================================================== */

export default async function DispensationsPage() {
  /* ========================================================
     CHARGEMENT DES DONNÉES
  ======================================================== */

  const [
    dispensationsResult,
    ordonnancesResult,
  ] = await Promise.all([
    getDispensations(),
    getOrdonnances(),
  ]);

  /* ========================================================
     DISPENSATIONS
  ======================================================== */

  const dispensations =
    dispensationsResult.success &&
    Array.isArray(dispensationsResult.data)
      ? dispensationsResult.data
      : [];

  /* ========================================================
     NORMALISATION DES ORDONNANCES
  ======================================================== */

  const ordonnances: Ordonnance[] =
    ordonnancesResult.success &&
    Array.isArray(ordonnancesResult.data)
      ? ordonnancesResult.data.map((ordonnance: any) => ({
          id: Number(ordonnance.id),

          numero: ordonnance.numero,

          statut: ordonnance.statut,

          datePrescription:
            ordonnance.datePrescription,

          /* ==================================================
             PATIENT
          ================================================== */

          patient: ordonnance.patient
            ? {
                id: Number(ordonnance.patient.id),

                nom:
                  ordonnance.patient.nom ?? "",

                postNom:
                  ordonnance.patient.postNom ?? null,

                prenom:
                  ordonnance.patient.prenom ?? null,

                numeroDossier:
                  ordonnance.patient.numeroDossier ??
                  null,
              }
            : null,

          /* ==================================================
             LIGNES
          ================================================== */

          lignes:
            Array.isArray(ordonnance.lignes)
              ? ordonnance.lignes.map(
                  (ligne: any) => ({
                    id: Number(ligne.id),

                    quantite:
                      Number(ligne.quantite) || 0,

                    posologie:
                      ligne.posologie ?? null,

                    dose:
                      ligne.dose ?? null,

                    frequence:
                      ligne.frequence ?? null,

                    duree:
                      ligne.duree ?? null,

                    voie:
                      ligne.voie ?? null,

                    /* ========================================
                       MÉDICAMENT
                    ======================================== */

                    medicament:
                      ligne.medicament
                        ? {
                            id: Number(
                              ligne.medicament.id
                            ),

                            code:
                              ligne.medicament.code ??
                              "",

                            nom:
                              ligne.medicament.nom ??
                              "",

                            forme:
                              ligne.medicament.forme ??
                              null,

                            dosage:
                              ligne.medicament.dosage ??
                              null,
                          }
                        : null,
                  })
                )
              : [],
        }))
      : [];

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <div className="p-6 space-y-6">

      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Dispensation des médicaments
            </h1>

            <p className="mt-1 text-sm text-base-content/60">
              Délivrez les médicaments prescrits aux
              patients et gérez automatiquement les sorties
              de stock.
            </p>
          </div>

          <div className="badge badge-primary badge-lg">
            {dispensations.length} dispensation
            {dispensations.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ====================================================
          NOUVELLE DISPENSATION
      ==================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">

          <div className="mb-4">
            <h2 className="card-title">
              Nouvelle dispensation
            </h2>

            <p className="text-sm text-base-content/60">
              Sélectionnez une ordonnance pour afficher
              automatiquement le patient et les médicaments
              prescrits.
            </p>
          </div>

          <DispensationForm
            ordonnances={ordonnances}
          />

        </div>
      </section>

      {/* ====================================================
          HISTORIQUE
      ==================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">

          <div className="mb-4">
            <h2 className="card-title">
              Historique des dispensations
            </h2>

            <p className="text-sm text-base-content/60">
              Consultez les médicaments déjà délivrés,
              les patients concernés et les ordonnances
              associées.
            </p>
          </div>

          <DispensationTable
            dispensations={dispensations}
          />

        </div>
      </section>

    </div>
  );
}
