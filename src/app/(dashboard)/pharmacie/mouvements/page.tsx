import { getMedicaments } from "@/app/actions/medicaments";

import {
  getMouvementsStock,
} from "@/app/actions/mouvements-stock";

import {
  getStocks,
} from "@/app/actions/stocks";

import MouvementStockPageClient from "@/components/pharmacie/MouvementStockPageClient";

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

/* ==========================================================
   PAGE
========================================================== */

export default async function MouvementsStockPage() {

  const [
    mouvementsResult,
    medicamentsResult,
    stocksResult,
  ] = await Promise.all([
    getMouvementsStock(),
    getMedicaments(),
    getStocks(),
  ]);

  /* ========================================================
     MÉDICAMENTS
  ======================================================== */

  const medicaments: Medicament[] =
    medicamentsResult.success &&
    Array.isArray(medicamentsResult.data)
      ? medicamentsResult.data.map(
          (medicament) => ({
            id: medicament.id,
            code: medicament.code,
            nom: medicament.nom,
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
    Array.isArray(stocksResult.data)
      ? stocksResult.data.map(
          (stock) => ({
            id: stock.id,

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
                      stock.medicament.dosage ??
                      null,

                    forme:
                      stock.medicament.forme ??
                      null,
                  }
                : null,
          })
        )
      : [];

  /* ========================================================
     MOUVEMENTS
  ======================================================== */

  const mouvements: Mouvement[] =
    mouvementsResult.success &&
    Array.isArray(mouvementsResult.data)
      ? mouvementsResult.data.map(
          (mouvement) => ({
            id:
              mouvement.id,

            medicamentId:
              mouvement.medicamentId,

            stockId:
              mouvement.stockId ??
              null,

            type:
              mouvement.type,

            quantite:
              mouvement.quantite,

            motif:
              mouvement.motif ??
              null,

            reference:
              mouvement.reference ??
              null,

            utilisateurId:
              mouvement.utilisateurId ??
              null,

            dateMouvement:
              mouvement.dateMouvement,

            medicament:
              mouvement.medicament
                ? {
                    id:
                      mouvement.medicament.id,

                    code:
                      mouvement.medicament.code,

                    nom:
                      mouvement.medicament.nom,

                    dosage:
                      mouvement.medicament.dosage ??
                      null,

                    forme:
                      mouvement.medicament.forme ??
                      null,
                  }
                : null,

            stock:
              mouvement.stock
                ? {
                    id:
                      mouvement.stock.id,

                    lot:
                      mouvement.stock.lot ??
                      null,

                    dateExpiration:
                      mouvement.stock
                        .dateExpiration ??
                      null,

                    quantite:
                      mouvement.stock.quantite,
                  }
                : null,

            utilisateur:
              mouvement.utilisateur
                ? {
                    id:
                      mouvement.utilisateur.id,

                    name:
                      mouvement.utilisateur.name ??
                      null,

                    email:
                      mouvement.utilisateur.email ??
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
          Mouvements de stock
        </h1>

        <p className="text-sm text-base-content/60">
          Suivez les entrées, sorties, retours,
          pertes et ajustements de stock.
        </p>
      </div>

      {/* ====================================================
          CLIENT
      ==================================================== */}

      <MouvementStockPageClient
        medicaments={medicaments}
        stocks={stocks}
        mouvements={mouvements}
      />

    </div>
  );
}