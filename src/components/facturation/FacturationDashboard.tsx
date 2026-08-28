"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
ArrowRight,
Banknote,
CircleAlert,
FileCheck2,
FileText,
Receipt,
Wallet,
} from "lucide-react";

import { getFacturationDashboard } from "@/app/actions/facturation";

type DashboardData = {
totalFactures: number;
facturesImpayees: number;
facturesPartielles: number;
facturesPayees: number;
totalFacture: number;
totalPaye: number;
totalReste: number;
totalProformas: number;
};

export default function FacturationDashboard() {
const [data, setData] = useState<DashboardData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
getFacturationDashboard()
.then((result) => {
if (result.success) {
setData(result.data as DashboardData);
}
})
.finally(() => setLoading(false));
}, []);

/* ========================================================
CHARGEMENT
======================================================== */

if (loading) {
return ( <main className="min-h-screen bg-base-200/40 p-4 md:p-6"> <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center"> <div className="flex flex-col items-center gap-4"> <span className="loading loading-spinner loading-lg text-primary" /> <p className="text-sm text-base-content/60">
Chargement du tableau de bord... </p> </div> </div> </main>
);
}

/* ========================================================
ERREUR
======================================================== */

if (!data) {
return ( <main className="min-h-screen bg-base-200/40 p-4 md:p-6"> <div className="mx-auto max-w-7xl"> <div className="alert alert-error rounded-xl shadow-sm"> <CircleAlert size={20} /> <span>
Impossible de charger le tableau de bord de facturation. </span> </div> </div> </main>
);
}

const tauxEncaissement =
data.totalFacture > 0
? Math.min(
100,
(data.totalPaye / data.totalFacture) * 100,
)
: 0;

return ( <main className="min-h-screen bg-base-200/40"> <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">

    {/* ==================================================
        EN-TÊTE
    ================================================== */}

    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="h-1.5 bg-primary" />

      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Receipt size={28} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Facturation
              </h1>

              <span className="badge badge-primary badge-outline">
                Gestion financière
              </span>
            </div>

            <p className="mt-1 text-sm text-base-content/60">
              Suivi des factures, paiements et créances
              de l'établissement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-base-200/70 px-4 py-3">
          <Wallet
            size={19}
            className="text-primary"
          />

          <div>
            <p className="text-xs text-base-content/50">
              Taux d'encaissement
            </p>

            <p className="font-bold">
              {tauxEncaissement.toFixed(1)} %
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ==================================================
        STATISTIQUES FACTURES
    ================================================== */}

    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold">
          Situation des factures
        </h2>

        <p className="text-sm text-base-content/60">
          Vue globale de l'état des factures.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Total factures
              </p>

              <p className="mt-2 text-3xl font-bold">
                {data.totalFactures}
              </p>

              <p className="mt-1 text-xs text-base-content/50">
                Toutes les factures
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* PAYÉES */}

        <div className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Factures payées
              </p>

              <p className="mt-2 text-3xl font-bold text-success">
                {data.facturesPayees}
              </p>

              <p className="mt-1 text-xs text-base-content/50">
                Paiement complet
              </p>
            </div>

            <div className="rounded-xl bg-success/10 p-3 text-success">
              <FileCheck2 size={22} />
            </div>
          </div>
        </div>

        {/* IMPAYÉES */}

        <div className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Factures impayées
              </p>

              <p className="mt-2 text-3xl font-bold text-error">
                {data.facturesImpayees}
              </p>

              <p className="mt-1 text-xs text-base-content/50">
                Aucun paiement reçu
              </p>
            </div>

            <div className="rounded-xl bg-error/10 p-3 text-error">
              <CircleAlert size={22} />
            </div>
          </div>
        </div>

        {/* PROFORMAS */}

        <div className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-base-content/60">
                Proformas
              </p>

              <p className="mt-2 text-3xl font-bold">
                {data.totalProformas}
              </p>

              <p className="mt-1 text-xs text-base-content/50">
                Documents prévisionnels
              </p>
            </div>

            <div className="rounded-xl bg-info/10 p-3 text-info">
              <FileText size={22} />
            </div>
          </div>
        </div>

      </div>
    </section>

    {/* ==================================================
        SYNTHÈSE FINANCIÈRE
    ================================================== */}

    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold">
          Synthèse financière
        </h2>

        <p className="text-sm text-base-content/60">
          Montants facturés, encaissés et restant à percevoir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* FACTURÉ */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Receipt size={22} />
            </div>

            <div>
              <p className="text-sm text-base-content/60">
                Montant facturé
              </p>

              <p className="text-2xl font-bold">
                {data.totalFacture.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* ENCAISSÉ */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-success/10 p-3 text-success">
              <Banknote size={22} />
            </div>

            <div>
              <p className="text-sm text-base-content/60">
                Montant encaissé
              </p>

              <p className="text-2xl font-bold text-success">
                {data.totalPaye.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* RESTE */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-error/10 p-3 text-error">
              <CircleAlert size={22} />
            </div>

            <div>
              <p className="text-sm text-base-content/60">
                Reste à payer
              </p>

              <p className="text-2xl font-bold text-error">
                {data.totalReste.toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    {/* ==================================================
        BARRE D'ENCAISSEMENT
    ================================================== */}

    <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold">
            Progression des encaissements
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            {data.totalPaye.toFixed(2)} USD encaissés
            sur {data.totalFacture.toFixed(2)} USD facturés.
          </p>
        </div>

        <span className="text-lg font-bold text-primary">
          {tauxEncaissement.toFixed(1)} %
        </span>
      </div>

      <progress
        className="progress progress-primary mt-4 w-full"
        value={tauxEncaissement}
        max="100"
      />

      <div className="mt-2 flex justify-between text-xs text-base-content/50">
        <span>Encaissé</span>
        <span>Reste : {data.totalReste.toFixed(2)} USD</span>
      </div>
    </section>

    {/* ==================================================
        ACCÈS RAPIDES
    ================================================== */}

    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold">
          Accès rapides
        </h2>

        <p className="text-sm text-base-content/60">
          Accédez rapidement aux principales opérations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Link
          href="/facturation/proformas"
          className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-info/10 p-3 text-info">
                <FileText size={22} />
              </div>

              <div>
                <p className="font-bold">
                  Proformas
                </p>

                <p className="text-xs text-base-content/50">
                  Gérer les proformas
                </p>
              </div>
            </div>

            <ArrowRight
              size={18}
              className="text-base-content/40 transition group-hover:translate-x-1 group-hover:text-primary"
            />
          </div>
        </Link>

        <Link
          href="/facturation/factures"
          className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Receipt size={22} />
              </div>

              <div>
                <p className="font-bold">
                  Factures
                </p>

                <p className="text-xs text-base-content/50">
                  Consulter les factures
                </p>
              </div>
            </div>

            <ArrowRight
              size={18}
              className="text-base-content/40 transition group-hover:translate-x-1 group-hover:text-primary"
            />
          </div>
        </Link>

        <Link
          href="/paiements"
          className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-success/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success/10 p-3 text-success">
                <Banknote size={22} />
              </div>

              <div>
                <p className="font-bold">
                  Paiements
                </p>

                <p className="text-xs text-base-content/50">
                  Suivre les encaissements
                </p>
              </div>
            </div>

            <ArrowRight
              size={18}
              className="text-base-content/40 transition group-hover:translate-x-1 group-hover:text-success"
            />
          </div>
        </Link>

      </div>
    </section>

  </div>
</main>


);
}
