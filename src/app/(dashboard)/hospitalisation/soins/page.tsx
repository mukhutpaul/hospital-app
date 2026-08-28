import Link from "next/link";
import { getSoins } from "@/app/actions/soins";
import SoinsTable from "@/components/hospitalisation/SoinsTable";


export default async function Page() {
  const r = await getSoins();

  const items = (r.data ?? []) as any[];

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            EN-TÊTE
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="breadcrumbs mb-1 text-sm">
              <ul>
                <li>
                  <span className="text-base-content/50">
                    Hospitalisation
                  </span>
                </li>

                <li>
                  <span className="font-medium">
                    Soins
                  </span>
                </li>
              </ul>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Soins hospitaliers
            </h1>

            <p className="mt-1 text-sm text-base-content/60">
              Consultez et gérez les soins administrés aux patients hospitalisés.
            </p>
          </div>

          <Link
            className="btn btn-primary"
            href="/hospitalisation/soins/nouveau"
          >
            <span className="text-lg">+</span>
            Nouveau soin
          </Link>

        </div>

        {/* =====================================================
            TABLE + FILTRES
        ====================================================== */}

        <SoinsTable items={items} />

      </div>
    </main>
  );
}