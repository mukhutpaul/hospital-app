import Link from "next/link";

import { getPaiements } from "@/app/actions/paiements";
import PaiementTable from "@/components/facturation/PaiementTable";

export default async function PaiementsPage() {
  const result = await getPaiements();

  const paiements = Array.isArray(result.data)
    ? result.data
    : [];

  return (
    <div className="p-6 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Paiements
          </h1>

          <p className="text-base-content/60">
            Historique des encaissements rattachés aux factures.
          </p>
        </div>

        <Link
          href="/paiements/nouveau"
          className="btn btn-primary"
        >
          + Nouveau paiement
        </Link>

      </div>

      {/* =====================================================
          ERREUR
      ===================================================== */}

      {!result.success && (
        <div className="alert alert-error">
          <span>{result.message}</span>
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      {result.success ? (
        <PaiementTable
          paiements={paiements}
        />
      ) : (
        <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
          <p className="text-base-content/60">
            Impossible de charger les paiements.
          </p>
        </div>
      )}

    </div>
  );
}