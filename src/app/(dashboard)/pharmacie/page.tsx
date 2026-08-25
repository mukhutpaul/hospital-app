import PharmacieSidebar from "@/components/pharmacie/PharmacieSidebar";

export default function PharmaciePage() {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Pharmacie
          </h1>

          <p className="text-sm text-base-content/60">
            Gestion des médicaments,
            stocks et ordonnances.
          </p>
        </div>

        {/* ===================================================
            CARTES
        =================================================== */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-sm text-base-content/60">
                Médicaments
              </p>

              <h2 className="text-3xl font-bold">
                -
              </h2>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-sm text-base-content/60">
                Stock disponible
              </p>

              <h2 className="text-3xl font-bold">
                -
              </h2>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-sm text-base-content/60">
                Ordonnances
              </p>

              <h2 className="text-3xl font-bold">
                -
              </h2>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-sm text-base-content/60">
                Alertes stock
              </p>

              <h2 className="text-3xl font-bold">
                -
              </h2>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}