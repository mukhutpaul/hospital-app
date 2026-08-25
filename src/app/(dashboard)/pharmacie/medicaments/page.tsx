import {
  getMedicaments,
} from "@/app/actions/medicaments";

import MedicamentPageClient from "@/components/pharmacie/MedicamentPageClient";

/* ==========================================================
   TYPES
========================================================== */

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

/* ==========================================================
   PAGE
========================================================== */

export default async function MedicamentsPage() {
  const result = await getMedicaments();

  const medicaments: Medicament[] =
    result.success &&
    Array.isArray(result.data)
      ? result.data.map((medicament) => ({
          id: medicament.id,

          code: medicament.code,

          nom: medicament.nom,

          denomination:
            medicament.denomination ??
            null,

          forme:
            medicament.forme ??
            null,

          dosage:
            medicament.dosage ??
            null,

          laboratoire:
            medicament.laboratoire ??
            null,

          categorie:
            medicament.categorie ??
            null,

          unite:
            medicament.unite ??
            null,

          prixVente:
            Number(
              medicament.prixVente ?? 0
            ),

          prixAchat:
            Number(
              medicament.prixAchat ?? 0
            ),

          devise:
            medicament.devise ??
            "CDF",

          seuilAlerte:
            Number(
              medicament.seuilAlerte ?? 0
            ),

          actif:
            medicament.actif ??
            true,
        }))
      : [];

  return (
    <div className="p-6 space-y-6">

      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Médicaments
        </h1>

        <p className="text-sm text-base-content/60">
          Gérez les médicaments disponibles
          dans la pharmacie.
        </p>
      </div>

      {/* ====================================================
          PARTIE CLIENT
      ==================================================== */}

      <MedicamentPageClient
        medicaments={medicaments}
      />

    </div>
  );
}