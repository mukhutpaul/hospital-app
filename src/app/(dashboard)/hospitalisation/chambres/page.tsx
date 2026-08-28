import Link from "next/link";
import { getChambres } from "@/app/actions/chambres";
import ChambreTable from "@/components/hospitalisation/ChambreTable";



export default async function Page() {
  const result = await getChambres();

  const items =
    result.success && Array.isArray(result.data)
      ? result.data
      : [];

  return (
    <main className="space-y-6 p-4 md:p-6">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Chambres
          </h1>

          <p className="mt-1 text-sm text-base-content/60">
            Gestion des chambres, lits, services et tarifs
            d'hospitalisation.
          </p>
        </div>

        <Link
          href="/hospitalisation/chambres/nouveau"
          className="btn btn-primary"
        >
          + Nouvelle chambre
        </Link>
      </div>

      {/* =====================================================
          ERREUR SERVEUR
      ===================================================== */}

      {!result.success && (
        <div className="alert alert-error shadow-sm">
          <span>
            {result.message}
          </span>
        </div>
      )}

      {/* =====================================================
          TABLEAU
      ===================================================== */}

      <ChambreTable items={items} />
    </main>
  );
}