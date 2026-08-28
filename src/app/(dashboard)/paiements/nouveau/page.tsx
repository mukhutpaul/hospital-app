import Link from "next/link";

import PaiementNouveauClient from "./PaiementNouveauClient";

export default function NouveauPaiementPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* =====================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Nouveau paiement
          </h1>

          <p className="text-sm opacity-70 mt-1">
            Enregistrer un paiement effectué par
            un patient et, lorsque disponible,
            le rattacher à une facture.
          </p>
        </div>

        <Link
          href="/facturation/paiements"
          className="btn btn-ghost"
        >
          ← Retour aux paiements
        </Link>
      </div>

      {/* =====================================================
          FORMULAIRE
      ====================================================== */}

      <PaiementNouveauClient />
    </div>
  );
}