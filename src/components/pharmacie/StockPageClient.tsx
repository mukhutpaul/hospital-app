"use client";

import {
  createStock,
} from "@/app/actions/stocks";

import StockForm from "@/components/pharmacie/StockForm";
import StockTable from "@/components/pharmacie/StockTable";

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

type Props = {
  medicaments: Medicament[];
  stocks: Stock[];
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function StockPageClient({
  medicaments,
  stocks,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ====================================================
          FORMULAIRE
      ==================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">

          <h2 className="card-title">
            Ajouter au stock
          </h2>

          <StockForm
            medicaments={medicaments}
            onSubmit={async (data) => {
              return await createStock({
                medicamentId:
                  data.medicamentId,

                lot:
                  data.lot,

                dateExpiration:
                  data.dateExpiration,

                quantite:
                  data.quantite,
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
            État du stock
          </h2>

          <StockTable
            stocks={stocks}
          />

        </div>
      </div>

    </div>
  );
}