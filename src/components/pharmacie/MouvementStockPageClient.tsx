"use client";

import {
  createMouvementStock,
} from "@/app/actions/mouvements-stock";

import MouvementStockForm from "@/components/pharmacie/MouvementStockForm";
import MouvementStockTable from "@/components/pharmacie/MouvementStockTable";

/* ==========================================================
   TYPES
========================================================== */

type Medicament = {
  id: number;
  code: string;
  nom: string;
  dosage?: string | null;
  forme?: string | null;
};

type Stock = {
  id: number;
  medicamentId: number;
  lot?: string | null;
  dateExpiration?: Date | string | null;
  quantite: number;

  medicament?: {
    id: number;
    code: string;
    nom: string;
    dosage?: string | null;
    forme?: string | null;
  } | null;
};

type Mouvement = {
  id: number;
  medicamentId: number;
  stockId?: number | null;
  type: string;
  quantite: number;
  motif?: string | null;
  reference?: string | null;
  utilisateurId?: number | null;
  dateMouvement: Date | string;

  medicament: {
    id: number;
    code: string;
    nom: string;
    dosage?: string | null;
    forme?: string | null;
  } | null;

  stock?: {
    id: number;
    lot?: string | null;
    dateExpiration?: Date | string | null;
    quantite: number;
  } | null;

  utilisateur?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  medicaments: Medicament[];
  stocks: Stock[];
  mouvements: Mouvement[];
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function MouvementStockPageClient({
  medicaments,
  stocks,
  mouvements,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ====================================================
          FORMULAIRE
      ==================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Nouveau mouvement
          </h2>

          <MouvementStockForm
            medicaments={medicaments}
            stocks={stocks}
            onSubmit={async (data) => {
              return await createMouvementStock({
                medicamentId: data.medicamentId,

                stockId:
                  data.stockId ??
                  undefined,

                type:
                  data.type,

                quantite:
                  data.quantite,

                motif:
                  data.motif ??
                  undefined,

                reference:
                  data.reference ??
                  undefined,
              });
            }}
          />

        </div>
      </div>

      {/* ====================================================
          TABLEAU
      ==================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Historique des mouvements
          </h2>

          <MouvementStockTable
            mouvements={mouvements}
          />

        </div>
      </div>

    </div>
  );
}