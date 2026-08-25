import { getOrdonnances } from "@/app/actions/dispensations";
import OrdonnanceTable from "@/components/pharmacie/OrdonnanceTable";

export default async function OrdonnancesPage() {
  const result = await getOrdonnances();

  const ordonnances =
    result.success && Array.isArray(result.data)
      ? result.data
      : [];

  return (
    <div className="p-6 space-y-6">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Ordonnances
        </h1>

        <p className="text-sm text-base-content/60">
          Consultez les ordonnances prescrites par les
          médecins et préparez leur dispensation.
        </p>
      </div>

      {/* =====================================================
          TABLEAU
      ===================================================== */}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">
            Ordonnances médicales
          </h2>

          <OrdonnanceTable
            ordonnances={ordonnances}
          />
        </div>
      </div>
    </div>
  );
}