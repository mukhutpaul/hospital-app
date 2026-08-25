import { getStocks } from "@/app/actions/stocks";
import InventairePageClient from "@/components/pharmacie/InventairePageClient";

/* ==========================================================
   TYPES
========================================================== */

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
    denomination?: string | null;
    forme?: string | null;
    dosage?: string | null;
    laboratoire?: string | null;
    categorie?: string | null;
    prixVente: number;
    prixAchat: number;
    devise: string;
    seuilAlerte: number;
    actif: boolean;
  } | null;
};

/* ==========================================================
   PAGE
========================================================== */

export default async function InventairePage() {
  const stocksResult = await getStocks();

  const stocks: Stock[] =
    stocksResult.success &&
    Array.isArray(stocksResult.data)
      ? stocksResult.data.map((stock) => ({
          id: stock.id,

          medicamentId:
            stock.medicamentId,

          lot:
            stock.lot ?? null,

          dateExpiration:
            stock.dateExpiration ?? null,

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

                  denomination:
                    stock.medicament.denomination ??
                    null,

                  forme:
                    stock.medicament.forme ??
                    null,

                  dosage:
                    stock.medicament.dosage ??
                    null,

                  laboratoire:
                    stock.medicament.laboratoire ??
                    null,

                  categorie:
                    stock.medicament.categorie ??
                    null,

                  prixVente:
                    stock.medicament.prixVente,

                  prixAchat:
                    stock.medicament.prixAchat,

                  devise:
                    stock.medicament.devise,

                  seuilAlerte:
                    stock.medicament.seuilAlerte,

                  actif:
                    stock.medicament.actif,
                }
              : null,
        }))
      : [];

  return (
    <div className="space-y-6">

      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Inventaire pharmacie
        </h1>

        <p className="text-sm text-base-content/60">
          Consultez l'état des stocks, les lots,
          les quantités disponibles et les produits
          arrivant à expiration.
        </p>
      </div>

      {/* ====================================================
          CONTENU
      ==================================================== */}

      <InventairePageClient
        stocks={stocks}
      />

    </div>
  );
}