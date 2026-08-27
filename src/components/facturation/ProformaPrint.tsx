"use client";

import LignesProforma from "./LignesProforma";

type Props = {
  proforma: any;
};

export default function ProformaPrint({
  proforma,
}: Props) {
  const patient = proforma.patient;

  return (
    <div className="print-area bg-base-100 shadow rounded-box p-8 max-w-5xl mx-auto">
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold">
          PROFORMA
        </h1>

        <p className="font-semibold">
          {proforma.numero}
        </p>

        <p>
          Date :{" "}
          {new Date(
            proforma.dateEmission
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
            Devise : {proforma.devise}
          </p>

          <p>
            Statut : {proforma.statut}
          </p>
        </div>
      </div>

      <LignesProforma
        lignes={proforma.lignes || []}
      />

      <div className="flex justify-end mt-8">
        <div className="w-full md:w-96 space-y-3">
          <div className="flex justify-between">
            <span>Montant brut</span>

            <strong>
              {Number(
                proforma.montantBrut
              ).toFixed(2)}{" "}
              {proforma.devise}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Réduction</span>

            <strong>
              {Number(
                proforma.reduction
              ).toFixed(2)}{" "}
              {proforma.devise}
            </strong>
          </div>

          <div className="flex justify-between text-xl border-t pt-3">
            <span>Total</span>

            <strong>
              {Number(
                proforma.montantTotal
              ).toFixed(2)}{" "}
              {proforma.devise}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t text-center text-sm opacity-60">
        Document estimatif — ne constitue pas encore une facture.
      </div>
    </div>
  );
}