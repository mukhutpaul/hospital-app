import Link from "next/link";
import { notFound } from "next/navigation";

import { getPaiementById } from "@/app/actions/paiements";

export default async function PaiementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getPaiementById(
    Number(id)
  );

  if (!result.success || !result.data) {
    notFound();
  }

  const paiement = result.data;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Paiement {paiement.reference}
          </h1>

          <p className="opacity-60">
            Détail de l'encaissement
          </p>
        </div>

        <div className="flex gap-2">

          <Link
            href={`/paiements/${paiement.id}/recu`}
            className="btn btn-primary"
          >
            Reçu
          </Link>

          {paiement.facture && (
            <Link
              href={`/factures/${paiement.facture.id}`}
              className="btn btn-outline"
            >
              Voir facture
            </Link>
          )}

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="card border bg-base-100">
          <div className="card-body">

            <h2 className="card-title">
              Paiement
            </h2>

            <p>
              <strong>Référence :</strong>{" "}
              {paiement.reference}
            </p>

            <p>
              <strong>Montant :</strong>{" "}
              {Number(paiement.montant).toFixed(2)}{" "}
              {paiement.devise}
            </p>

            <p>
              <strong>Mode :</strong>{" "}
              {paiement.modePaiement}
            </p>

            <p>
              <strong>Type :</strong>{" "}
              {paiement.type}
            </p>

            <p>
              <strong>Date :</strong>{" "}
              {new Date(
                paiement.datePaiement
              ).toLocaleString("fr-FR")}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              {paiement.statut}
            </p>

          </div>
        </div>

        <div className="card border bg-base-100">
          <div className="card-body">

            <h2 className="card-title">
              Patient
            </h2>

            <p>
              <strong>Nom :</strong>{" "}
              {paiement.patient.nom}{" "}
              {paiement.patient.postNom || ""}{" "}
              {paiement.patient.prenom || ""}
            </p>

            <p>
              <strong>Dossier :</strong>{" "}
              {paiement.patient.numeroDossier}
            </p>

            {paiement.facture && (
              <>
                <p>
                  <strong>Facture :</strong>{" "}
                  {paiement.facture.numero}
                </p>

                <p>
                  <strong>Total :</strong>{" "}
                  {Number(
                    paiement.facture.montantTotal
                  ).toFixed(2)}{" "}
                  {paiement.facture.devise}
                </p>

                <p>
                  <strong>Payé :</strong>{" "}
                  {Number(
                    paiement.facture.montantPaye
                  ).toFixed(2)}{" "}
                  {paiement.facture.devise}
                </p>

                <p>
                  <strong>Reste :</strong>{" "}
                  {Number(
                    paiement.facture.reste
                  ).toFixed(2)}{" "}
                  {paiement.facture.devise}
                </p>
              </>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}