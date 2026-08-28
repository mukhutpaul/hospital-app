import Link from "next/link";
import { notFound } from "next/navigation";

import { getPaiementById } from "@/app/actions/paiements";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaiementDetailPage({
  params,
}: Props) {
  /* ==========================================================
     PARAMÈTRE ID
  ========================================================== */

  const { id } = await params;

  const paiementId = Number(id);

  if (
    !Number.isInteger(paiementId) ||
    paiementId <= 0
  ) {
    notFound();
  }

  /* ==========================================================
     RÉCUPÉRER LE PAIEMENT
  ========================================================== */

  const paiement =
    await getPaiementById(paiementId);

  if (!paiement) {
    notFound();
  }

  /* ==========================================================
     DONNÉES
  ========================================================== */

  const patient = paiement.patient;
  const facture = paiement.facture;
  const caissier = paiement.caissier;

  const nomPatient = [
    patient?.nom,
    patient?.postNom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ");

  const devise =
    paiement.devise ||
    facture?.devise ||
    "USD";

  const montantPaiement =
    Number(paiement.montant);

  const montantTotal = facture
    ? Number(facture.montantTotal)
    : 0;

  const montantPaye = facture
    ? Number(facture.montantPaye)
    : 0;

  const reste = facture
    ? Number(facture.reste)
    : 0;

  const datePaiement =
    paiement.datePaiement
      ? new Date(
          paiement.datePaiement,
        ).toLocaleString("fr-FR")
      : "—";

  /* ==========================================================
     RENDU
  ========================================================== */

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              💰
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Paiement{" "}
                {paiement.reference}
              </h1>

              <p className="mt-1 text-sm opacity-60">
                Détail de l'encaissement
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/facturation/paiements"
            className="btn btn-outline"
          >
            ← Retour
          </Link>

          <Link
            href={`/facturation/paiements/${paiement.id}/recu`}
            className="btn btn-primary"
          >
            🧾 Reçu
          </Link>

          {facture && (
            <Link
              href={`/facturation/factures/${facture.id}`}
              className="btn btn-outline"
            >
              🧾 Voir facture
            </Link>
          )}

        </div>

      </div>

      {/* ======================================================
          RÉSUMÉ
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-xs uppercase opacity-50">
            Référence
          </p>

          <p className="mt-1 font-bold">
            {paiement.reference}
          </p>
        </div>

        <div className="rounded-xl border border-success/20 bg-success/10 p-5">
          <p className="text-xs uppercase opacity-50">
            Montant payé
          </p>

          <p className="mt-1 text-xl font-bold text-success">
            {montantPaiement.toFixed(2)}{" "}
            {devise}
          </p>
        </div>

        <div className="rounded-xl border border-info/20 bg-info/10 p-5">
          <p className="text-xs uppercase opacity-50">
            Mode de paiement
          </p>

          <p className="mt-1 font-bold">
            {paiement.modePaiement}
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
          <p className="text-xs uppercase opacity-50">
            Statut
          </p>

          <div className="mt-2">
            <span className="badge badge-success">
              {paiement.statut}
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================
          INFORMATIONS PRINCIPALES
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ====================================================
            PAIEMENT
        ==================================================== */}

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              💳 Informations du paiement
            </h2>

            <div className="divider my-1" />

            <div className="space-y-4">

              <div>
                <p className="text-xs opacity-50">
                  Référence
                </p>

                <p className="font-semibold">
                  {paiement.reference}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Montant
                </p>

                <p className="text-xl font-bold text-success">
                  {montantPaiement.toFixed(2)}{" "}
                  {devise}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Devise
                </p>

                <p className="font-semibold">
                  {devise}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Mode de paiement
                </p>

                <p className="font-semibold">
                  {paiement.modePaiement}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Type de paiement
                </p>

                <p className="font-semibold">
                  {paiement.type}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Date du paiement
                </p>

                <p className="font-semibold">
                  {datePaiement}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Statut
                </p>

                <span className="badge badge-success">
                  {paiement.statut}
                </span>
              </div>

              {paiement.description && (
                <div>
                  <p className="text-xs opacity-50">
                    Description
                  </p>

                  <div className="mt-1 rounded-lg border border-base-300 bg-base-200 p-3">
                    {paiement.description}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* ====================================================
            PATIENT
        ==================================================== */}

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              👤 Patient
            </h2>

            <div className="divider my-1" />

            <div className="space-y-4">

              <div>
                <p className="text-xs opacity-50">
                  Nom complet
                </p>

                <p className="text-lg font-bold">
                  {nomPatient || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs opacity-50">
                  Numéro de dossier
                </p>

                <p className="font-semibold">
                  {patient?.numeroDossier ??
                    "—"}
                </p>
              </div>

              {patient?.telephone && (
                <div>
                  <p className="text-xs opacity-50">
                    Téléphone
                  </p>

                  <p className="font-semibold">
                    {patient.telephone}
                  </p>
                </div>
              )}

              {patient?.email && (
                <div>
                  <p className="text-xs opacity-50">
                    Email
                  </p>

                  <p className="font-semibold">
                    {patient.email}
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* ======================================================
          FACTURE
      ====================================================== */}

      {facture && (
        <div className="card border border-primary/20 bg-base-100 shadow-sm">

          <div className="card-body">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <h2 className="card-title">
                🧾 Facture associée
              </h2>

              <Link
                href={`/facturation/factures/${facture.id}`}
                className="btn btn-sm btn-outline"
              >
                Voir la facture
              </Link>

            </div>

            <div className="divider my-1" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-base-200 p-4">
                <p className="text-xs opacity-50">
                  Numéro facture
                </p>

                <p className="mt-1 font-bold">
                  {facture.numero}
                </p>
              </div>

              <div className="rounded-xl bg-base-200 p-4">
                <p className="text-xs opacity-50">
                  Montant total
                </p>

                <p className="mt-1 font-bold">
                  {montantTotal.toFixed(2)}{" "}
                  {devise}
                </p>
              </div>

              <div className="rounded-xl bg-success/10 p-4">
                <p className="text-xs opacity-50">
                  Montant payé
                </p>

                <p className="mt-1 font-bold text-success">
                  {montantPaye.toFixed(2)}{" "}
                  {devise}
                </p>
              </div>

              <div className="rounded-xl bg-error/10 p-4">
                <p className="text-xs opacity-50">
                  Reste à payer
                </p>

                <p className="mt-1 text-lg font-bold text-error">
                  {reste.toFixed(2)}{" "}
                  {devise}
                </p>
              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-3">

              <div>
                <span className="text-xs opacity-50">
                  Statut facture
                </span>

                <div className="mt-1">
                  <span className="badge badge-warning">
                    {facture.statut}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          CAISSIER
      ====================================================== */}

      {caissier && (
        <div className="card border border-base-300 bg-base-100 shadow-sm">

          <div className="card-body">

            <h2 className="card-title">
              👨‍💼 Caissier
            </h2>

            <div className="divider my-1" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs opacity-50">
                  Nom
                </p>

                <p className="font-semibold">
                  {[
                    caissier.nom,
                    caissier.postNom,
                    caissier.prenom,
                  ]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
              </div>

              {caissier.email && (
                <div>
                  <p className="text-xs opacity-50">
                    Email
                  </p>

                  <p className="font-semibold">
                    {caissier.email}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-wrap justify-end gap-3">

        <Link
          href="/facturation/paiements"
          className="btn btn-outline"
        >
          ← Retour aux paiements
        </Link>

        <Link
          href={`/facturation/paiements/${paiement.id}/recu`}
          className="btn btn-primary"
        >
          🖨️ Imprimer le reçu
        </Link>

        {facture && (
          <Link
            href={`/facturation/factures/${facture.id}`}
            className="btn btn-secondary"
          >
            🧾 Voir la facture
          </Link>
        )}

      </div>

    </div>
  );
}