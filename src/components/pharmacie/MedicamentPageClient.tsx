"use client";

import {
  createMedicament,
  updateMedicament,
  deleteMedicament,
  toggleMedicament,
} from "@/app/actions/medicaments";

import MedicamentForm from "@/components/pharmacie/MedicamentForm";
import MedicamentTable from "@/components/pharmacie/MedicamentTable";

type Medicament = {
  id: number;
  code: string;
  nom: string;

  denomination?: string | null;
  forme?: string | null;
  dosage?: string | null;
  laboratoire?: string | null;
  categorie?: string | null;
  unite?: string | null;

  prixVente: number;
  prixAchat: number;
  devise: string;
  seuilAlerte: number;
  actif: boolean;
};

type Props = {
  medicaments: Medicament[];
};

export default function MedicamentPageClient({
  medicaments,
}: Props) {
  return (
    <div className="space-y-6">

      {/* =====================================================
          FORMULAIRE
      ===================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Ajouter un médicament
          </h2>

          <MedicamentForm
            onSubmit={async (data) => {
              const result = await createMedicament({
                code: data.code,
                nom: data.nom,

                denomination:
                  data.denomination ?? undefined,

                forme:
                  data.forme ?? undefined,

                dosage:
                  data.dosage ?? undefined,

                laboratoire:
                  data.laboratoire ?? undefined,

                categorie:
                  data.categorie ?? undefined,

                unite:
                  data.unite ?? undefined,

                prixVente:
                  data.prixVente,

                prixAchat:
                  data.prixAchat,

                devise:
                  data.devise,

                seuilAlerte:
                  data.seuilAlerte,

                actif:
                  data.actif,
              });

              return result;
            }}
          />

        </div>
      </div>

      {/* =====================================================
          TABLEAU
      ===================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Liste des médicaments
          </h2>

          <MedicamentTable
            medicaments={medicaments}

            onEdit={async (medicament) => {
              return await updateMedicament(
                medicament.id,
                {
                  code: medicament.code,
                  nom: medicament.nom,

                  denomination:
                    medicament.denomination ??
                    undefined,

                  forme:
                    medicament.forme ??
                    undefined,

                  dosage:
                    medicament.dosage ??
                    undefined,

                  laboratoire:
                    medicament.laboratoire ??
                    undefined,

                  categorie:
                    medicament.categorie ??
                    undefined,

                  unite:
                    medicament.unite ??
                    undefined,

                  prixVente:
                    medicament.prixVente,

                  prixAchat:
                    medicament.prixAchat,

                  devise:
                    medicament.devise,

                  seuilAlerte:
                    medicament.seuilAlerte,

                  actif:
                    medicament.actif,
                }
              );
            }}

            onDelete={async (id) => {
              return await deleteMedicament(id);
            }}

            onToggle={async (id) => {
              return await toggleMedicament(id);
            }}
          />

        </div>
      </div>

    </div>
  );
}