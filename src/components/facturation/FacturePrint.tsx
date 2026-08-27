"use client";

import LignesFacture from "./LignesFacture";

type Props = {
  facture: any;
};

export default function FacturePrint({
  facture,
}: Props) {
  const patient = facture.patient;

  return (
    <div className="print-area bg-base-100 shadow rounded-box p-8 max-w-5xl mx-auto">
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold">
          FACTURE
        </h1>

        <p className="font-semibold">
          {facture.numero}
        </p>

        <p>
          Date :{" "}
          {new Date(
            facture.dateFacture
          ).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 my-6">
        <div>
          <h2 className="font-bold">
            Patient
          </h2>

          <p>
            {patient?.nom}{" "}
            {patient?.postNom || ""}{" "}
            {patient?.prenom || ""}
          </p>

          <p>
            Dossier :{" "}
            {patient?.numeroDossier}
          </p>

          <p>
            Téléphone :{" "}
            {patient?.telephone || "-"}
          </p>
        </div>

        <div>
          <h2 className="font-bold">
            Informations
          </h2>

          <p>
            Devise : {facture.devise}
          </p>

          <p>
            Statut : {facture.statut}
          </p>
        </div>
      </div>

      <LignesFacture
        lignes={facture.lignes || []}
      />

      <div className="flex justify-end mt-8">
        <div className="w-full md:w-96 space-y-3">
          <div className="flex justify-between">
            <span>Montant brut</span>
            <strong>
              {Number(
                facture.montantBrut
              ).toFixed(2)}{" "}
              {facture.devise}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Réduction</span>
            <strong>
              {Number(
                facture.reduction
              ).toFixed(2)}{" "}
              {facture.devise}
            </strong>
          </div>

          <div className="flex justify-between text-xl border-t pt-3">
            <span>Total</span>
            <strong>
              {Number(
                facture.montantTotal
              ).toFixed(2)}{" "}
              {facture.devise}
            </strong>
          </div>

          <div className="flex justify-between text-success">
            <span>Payé</span>
            <strong>
              {Number(
                facture.montantPaye
              ).toFixed(2)}{" "}
              {facture.devise}
            </strong>
          </div>

          <div className="flex justify-between text-error text-xl">
            <span>Reste</span>
            <strong>
              {Number(
                facture.reste
              ).toFixed(2)}{" "}
              {facture.devise}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t text-center text-sm opacity-60">
        Merci pour votre confiance.
      </div>
    </div>
  );
}