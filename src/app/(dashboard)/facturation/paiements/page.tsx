import Link from "next/link";

import { getPaiements } from "@/app/actions/paiements";
import PaiementTable from "@/components/paiements/PaiementTable";

/* ==========================================================
   PAGE PAIEMENTS
========================================================== */

export default async function PaiementsPage() {
  const result = await getPaiements();

  /*
   * ========================================================
   * NORMALISATION DES DONNÉES
   * ========================================================
   */

  let paiements: any[] = [];

  if (Array.isArray(result)) {
    paiements = result;
  } else if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    Array.isArray(result.data)
  ) {
    paiements = result.data;
  }

  /*
   * ========================================================
   * STATISTIQUES
   * ========================================================
   */

  const totalPaiements = paiements.length;

  const totalEncaisse = paiements
    .filter(
      (paiement) =>
        paiement.statut === "PAYE"
    )
    .reduce(
      (total, paiement) =>
        total +
        Number(paiement.montant || 0),
      0
    );

  const totalAnnule = paiements
    .filter(
      (paiement) =>
        paiement.statut === "ANNULE"
    )
    .reduce(
      (total, paiement) =>
        total +
        Number(paiement.montant || 0),
      0
    );

  /*
   * ========================================================
   * RENDU
   * ========================================================
   */

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Paiements
          </h1>

          <p className="text-sm opacity-70">
            Gestion des paiements des
            patients et des factures.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/facturation/factures"
            className="btn btn-outline"
          >
            📄 Voir les factures
          </Link>

          <Link
            href="/facturation/paiements/nouveau"
            className="btn btn-primary"
          >
            ➕ Nouveau paiement
          </Link>

        </div>

      </div>

      {/* ==================================================
          STATISTIQUES
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* NOMBRE DE PAIEMENTS */}

        <div className="stat rounded-box bg-base-100 shadow">

          <div className="stat-title">
            Nombre de paiements
          </div>

          <div className="stat-value">
            {totalPaiements}
          </div>

          <div className="stat-desc">
            Tous les paiements
          </div>

        </div>

        {/* TOTAL ENCAISSÉ */}

        <div className="stat rounded-box bg-base-100 shadow">

          <div className="stat-title">
            Total encaissé
          </div>

          <div className="stat-value text-success">
            {totalEncaisse.toFixed(2)}
          </div>

          <div className="stat-desc">
            Paiements validés
          </div>

        </div>

        {/* TOTAL ANNULÉ */}

        <div className="stat rounded-box bg-base-100 shadow">

          <div className="stat-title">
            Paiements annulés
          </div>

          <div className="stat-value text-error">
            {totalAnnule.toFixed(2)}
          </div>

          <div className="stat-desc">
            Montant annulé
          </div>

        </div>

      </div>

      {/* ==================================================
          TABLEAU
      ================================================== */}

      <PaiementTable
        paiements={paiements.map(
          (paiement) => ({
            ...paiement,

            montant: Number(
              paiement.montant || 0
            ),

            datePaiement:
              paiement.datePaiement,
          })
        )}
      />

    </div>
  );
}