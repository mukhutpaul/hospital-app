import PharmacieSidebar from "@/components/pharmacie/PharmacieSidebar";
import { getPharmacieStats } from "@/app/actions/pharmacie";

export default async function PharmaciePage() {
  /* ==========================================================
     STATISTIQUES
  ========================================================== */

  const statsResult =
    await getPharmacieStats();

  const stats =
    statsResult.success && statsResult.data
      ? statsResult.data
      : {
          totalMedicaments: 0,
          stockDisponible: 0,
          totalOrdonnances: 0,
          alertesStock: 0,
        };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-base-200">

      {/* =====================================================
          MENU PHARMACIE
      ===================================================== */}

      <PharmacieSidebar />

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <main className="flex-1 p-6">

        {/* ===================================================
            EN-TÊTE
        =================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Pharmacie
          </h1>

          <p className="text-sm text-base-content/60">
            Gestion des médicaments, stocks,
            ordonnances et dispensations.
          </p>
        </div>

        {/* ===================================================
            STATISTIQUES
        =================================================== */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* =================================================
              MÉDICAMENTS
          ================================================= */}

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">

              <p className="text-sm text-base-content/60">
                Médicaments
              </p>

              <h2 className="text-3xl font-bold">
                {stats.totalMedicaments}
              </h2>

              <p className="text-xs text-base-content/50">
                Médicaments actifs
              </p>

            </div>
          </div>

          {/* =================================================
              STOCK
          ================================================= */}

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">

              <p className="text-sm text-base-content/60">
                Stock disponible
              </p>

              <h2 className="text-3xl font-bold">
                {stats.stockDisponible}
              </h2>

              <p className="text-xs text-base-content/50">
                Quantité totale disponible
              </p>

            </div>
          </div>

          {/* =================================================
              ORDONNANCES
          ================================================= */}

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">

              <p className="text-sm text-base-content/60">
                Ordonnances
              </p>

              <h2 className="text-3xl font-bold">
                {stats.totalOrdonnances}
              </h2>

              <p className="text-xs text-base-content/50">
                Ordonnances enregistrées
              </p>

            </div>
          </div>

          {/* =================================================
              ALERTES
          ================================================= */}

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">

              <p className="text-sm text-base-content/60">
                Alertes stock
              </p>

              <h2
                className={`text-3xl font-bold ${
                  stats.alertesStock > 0
                    ? "text-error"
                    : "text-success"
                }`}
              >
                {stats.alertesStock}
              </h2>

              <p className="text-xs text-base-content/50">
                Médicaments sous le seuil
              </p>

            </div>
          </div>

        </div>

        {/* ===================================================
            MESSAGE SI ERREUR
        =================================================== */}

        {!statsResult.success && (
          <div className="alert alert-error mt-6">
            <span>
              {statsResult.message}
            </span>
          </div>
        )}

      </main>
    </div>
  );
}