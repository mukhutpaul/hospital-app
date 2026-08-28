import Link from "next/link";
import { getPaiements } from "@/app/actions/finance";
import PaiementTable from "@/components/paiements/PaiementTable";

export default async function PaiementsPage() {
  const result = await getPaiements();

  const paiements = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];

  return (
    <div className="min-h-screen bg-base-200/40 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-col gap-5 p-5 md:p-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="text-2xl">💳</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Paiements
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-base-content/60">
                  Consultez, recherchez et filtrez les encaissements
                  enregistrés dans l'établissement.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/facturation/factures"
                className="btn btn-outline btn-sm md:btn-md"
              >
                📄 Factures
              </Link>

              <Link
                href="/facturation/paiements/nouveau"
                className="btn btn-primary btn-sm md:btn-md"
              >
                ➕ Nouveau paiement
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATISTIQUES
        ====================================================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Nombre */}
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    Nombre de paiements
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {paiements.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  💳
                </div>
              </div>

              <p className="mt-3 text-xs text-base-content/50">
                Total des encaissements
              </p>
            </div>
          </div>

          {/* Total encaissé */}
          <div className="overflow-hidden rounded-2xl border border-success/20 bg-base-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    Total encaissé
                  </p>

                  <p className="mt-2 text-2xl font-bold text-success">
                    {paiements
                      .filter((p: any) => p.statut !== "ANNULE")
                      .reduce(
                        (total: number, p: any) =>
                          total + Number(p.montant || 0),
                        0,
                      )
                      .toFixed(2)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                  ✓
                </div>
              </div>

              <p className="mt-3 text-xs text-base-content/50">
                Paiements valides
              </p>
            </div>
          </div>

          {/* Annulés */}
          <div className="overflow-hidden rounded-2xl border border-error/20 bg-base-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    Paiements annulés
                  </p>

                  <p className="mt-2 text-2xl font-bold text-error">
                    {paiements
                      .filter((p: any) => p.statut === "ANNULE")
                      .reduce(
                        (total: number, p: any) =>
                          total + Number(p.montant || 0),
                        0,
                      )
                      .toFixed(2)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
                  !
                </div>
              </div>

              <p className="mt-3 text-xs text-base-content/50">
                Montant annulé
              </p>
            </div>
          </div>

          {/* Aujourd'hui */}
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    Aujourd'hui
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {paiements.filter((p: any) => {
                      if (!p.datePaiement) return false;

                      const date = new Date(p.datePaiement);
                      const now = new Date();

                      return (
                        date.getDate() === now.getDate() &&
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                  📅
                </div>
              </div>

              <p className="mt-3 text-xs text-base-content/50">
                Paiements enregistrés aujourd'hui
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLEAU + FILTRES
        ====================================================== */}
        <PaiementTable paiements={paiements} />

      </div>
    </div>
  );
}