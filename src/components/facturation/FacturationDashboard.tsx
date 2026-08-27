"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="p-6">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          Impossible de charger le tableau de bord.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Facturation
        </h1>

        <p className="text-base-content/60">
          Gestion financière des prestations hospitalières.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Total factures
          </div>

          <div className="stat-value text-primary">
            {data.totalFactures}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Factures payées
          </div>

          <div className="stat-value text-success">
            {data.facturesPayees}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Impayées
          </div>

          <div className="stat-value text-error">
            {data.facturesImpayees}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">
            Proformas
          </div>

          <div className="stat-value">
            {data.totalProformas}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              Montant facturé
            </h2>

            <p className="text-3xl font-bold">
              {data.totalFacture.toFixed(2)} USD
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              Montant encaissé
            </h2>

            <p className="text-3xl font-bold text-success">
              {data.totalPaye.toFixed(2)} USD
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              Reste à payer
            </h2>

            <p className="text-3xl font-bold text-error">
              {data.totalReste.toFixed(2)} USD
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/facturation/proformas"
          className="btn btn-outline"
        >
          Proformas
        </Link>

        <Link
          href="/facturation/factures"
          className="btn btn-primary"
        >
          Factures
        </Link>

        <Link
          href="/facturation/paiements"
          className="btn btn-success"
        >
          Paiements
        </Link>

        <Link
          href="/facturation/actes"
          className="btn btn-secondary"
        >
          Tarification
        </Link>
      </div>
    </div>
  );
}