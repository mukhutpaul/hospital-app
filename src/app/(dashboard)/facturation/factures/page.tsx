import Link from "next/link";
import { getFactures } from "@/app/actions/facturation";
import FactureTable from "@/components/facturation/FacturesTable";


export default async function FacturesPage() {
  const result = await getFactures();

  const factures = result.success ? result.data ?? [] : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Factures</h1>
          <p className="text-base-content/60">
            Gestion des factures patients.
          </p>
        </div>

        <Link
          href="/facturation/factures/nouveau"
          className="btn btn-primary"
        >
          + Nouvelle facture
        </Link>
      </div>

      {!result.success && (
        <div className="alert alert-error">
          {result.message}
        </div>
      )}

      <FactureTable factures={factures as any[]} />
    </div>
  );
}