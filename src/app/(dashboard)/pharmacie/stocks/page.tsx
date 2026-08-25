import { getMedicaments } from "@/app/actions/medicaments";
import { getStocks } from "@/app/actions/stocks";

import StockPageClient from "@/components/pharmacie/StockPageClient";

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

/* ==========================================================
   PAGE
========================================================== */

export default async function StocksPage() {
  const [
    stocksResult,
    medicamentsResult,
  ] = await Promise.all([
    getStocks(),
    getMedicaments(),
  ]);

  /* ========================================================
     MÉDICAMENTS
  ======================================================== */

  const medicaments: Medicament[] =
    medicamentsResult.success &&
    Array.isArray(
      medicamentsResult.data
    )
      ? medicamentsResult.data.map(
          (medicament) => ({
            id: medicament.id,

            code:
              medicament.code,

            nom:
              medicament.nom,

            dosage:
              medicament.dosage ??
              null,

            forme:
              medicament.forme ??
              null,
          })
        )
      : [];

  /* ========================================================
     STOCKS
  ======================================================== */

  const stocks: Stock[] =
    stocksResult.success &&
    Array.isArray(
      stocksResult.data
    )
      ? stocksResult.data.map(
          (stock) => ({
            id:
              stock.id,

            medicamentId:
              stock.medicamentId,

            lot:
              stock.lot ??
              null,

            dateExpiration:
              stock.dateExpiration ??
              null,

            quantite:
              stock.quantite,

            medicament:
              stock.medicament
                ? {
                    id:
                      stock.medicament.id,

                    code:
                      stock.medicament.code,

                    nom:
                      stock.medicament.nom,

                    dosage:
                      stock.medicament
                        .dosage ??
                      null,

                    forme:
                      stock.medicament
                        .forme ??
                      null,
                  }
                : null,
          })
        )
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
        <h1 className="text-2xl font-bold">
          Gestion des stocks
        </h1>

        <p className="text-sm text-base-content/60">
          Gérez les quantités, lots et
          dates d'expiration des médicaments.
        </p>
      </div>

      {/* ====================================================
          PARTIE CLIENT
      ==================================================== */}

      <StockPageClient
        medicaments={medicaments}
        stocks={stocks}
      />

    </div>
  );
}