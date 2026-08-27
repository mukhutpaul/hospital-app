"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Props = {
  paiement: any;
};

export default function RecuPaiement({
  paiement,
}: Props) {

  function genererPDF() {
    const doc = new jsPDF();

    const patient = paiement.patient;
    const facture = paiement.facture;

    const nomPatient = [
      patient?.nom,
      patient?.postNom,
      patient?.prenom,
    ]
      .filter(Boolean)
      .join(" ");

    /* ======================================================
       ENTÊTE
    ====================================================== */

    doc.setFontSize(18);

    doc.text(
      "HÔPITAL",
      20,
      20
    );

    doc.setFontSize(10);

    doc.text(
      "REÇU DE PAIEMENT",
      20,
      28
    );

    doc.line(
      20,
      33,
      190,
      33
    );

    /* ======================================================
       INFORMATIONS
    ====================================================== */

    doc.setFontSize(11);

    doc.text(
      `Référence : ${paiement.reference}`,
      20,
      45
    );

    doc.text(
      `Date : ${new Date(
        paiement.datePaiement
      ).toLocaleString("fr-FR")}`,
      20,
      52
    );

    doc.text(
      `Patient : ${nomPatient}`,
      20,
      65
    );

    doc.text(
      `N° dossier : ${patient?.numeroDossier || "-"}`,
      20,
      72
    );

    doc.text(
      `Facture : ${facture?.numero || "-"}`,
      20,
      79
    );

    /* ======================================================
       TABLEAU
    ====================================================== */

    autoTable(doc, {
      startY: 90,

      head: [
        [
          "Description",
          "Montant",
        ],
      ],

      body: [
        [
          "Paiement reçu",
          `${Number(
            paiement.montant
          ).toFixed(2)} ${paiement.devise}`,
        ],

        [
          "Mode de paiement",
          paiement.modePaiement,
        ],

        [
          "Type",
          paiement.type,
        ],
      ],

      theme: "grid",
    });

    /* ======================================================
       FACTURE
    ====================================================== */

    const finalY =
      (doc as any).lastAutoTable.finalY + 15;

    if (facture) {

      doc.setFontSize(11);

      doc.text(
        `Total facture : ${Number(
          facture.montantTotal
        ).toFixed(2)} ${facture.devise}`,
        20,
        finalY
      );

      doc.text(
        `Total payé : ${Number(
          facture.montantPaye
        ).toFixed(2)} ${facture.devise}`,
        20,
        finalY + 8
      );

      doc.text(
        `Reste : ${Number(
          facture.reste
        ).toFixed(2)} ${facture.devise}`,
        20,
        finalY + 16
      );
    }

    /* ======================================================
       PIED
    ====================================================== */

    doc.setFontSize(9);

    doc.text(
      "Merci pour votre confiance.",
      20,
      275
    );

    doc.text(
      `Reçu généré le ${new Date().toLocaleString(
        "fr-FR"
      )}`,
      20,
      282
    );

    doc.save(
      `recu-${paiement.reference}.pdf`
    );
  }

  function imprimer() {
    window.print();
  }

  return (
    <div className="p-6">

      <div className="flex gap-3 mb-6 print:hidden">

        <button
          onClick={genererPDF}
          className="btn btn-primary"
        >
          Télécharger le reçu PDF
        </button>

        <button
          onClick={imprimer}
          className="btn btn-outline"
        >
          Imprimer
        </button>

      </div>

      <div
        id="recu"
        className="max-w-3xl mx-auto bg-white text-black p-10 border"
      >

        <div className="text-center border-b pb-5">

          <h1 className="text-2xl font-bold">
            HÔPITAL
          </h1>

          <h2 className="text-xl font-bold mt-2">
            REÇU DE PAIEMENT
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div>
            <strong>Référence</strong>
            <p>{paiement.reference}</p>
          </div>

          <div>
            <strong>Date</strong>
            <p>
              {new Date(
                paiement.datePaiement
              ).toLocaleString("fr-FR")}
            </p>
          </div>

          <div>
            <strong>Patient</strong>
            <p>
              {paiement.patient.nom}{" "}
              {paiement.patient.postNom || ""}{" "}
              {paiement.patient.prenom || ""}
            </p>
          </div>

          <div>
            <strong>Dossier</strong>
            <p>
              {paiement.patient.numeroDossier}
            </p>
          </div>

          <div>
            <strong>Facture</strong>
            <p>
              {paiement.facture?.numero || "-"}
            </p>
          </div>

          <div>
            <strong>Mode</strong>
            <p>
              {paiement.modePaiement}
            </p>
          </div>

        </div>

        <div className="mt-10 text-center">

          <p className="text-sm opacity-60">
            Montant reçu
          </p>

          <p className="text-4xl font-bold">
            {Number(
              paiement.montant
            ).toFixed(2)}{" "}
            {paiement.devise}
          </p>

        </div>

        {paiement.facture && (
          <div className="mt-10 border-t pt-6">

            <div className="flex justify-between">
              <span>
                Total facture
              </span>

              <strong>
                {Number(
                  paiement.facture.montantTotal
                ).toFixed(2)}{" "}
                {paiement.facture.devise}
              </strong>
            </div>

            <div className="flex justify-between mt-2">
              <span>
                Total payé
              </span>

              <strong>
                {Number(
                  paiement.facture.montantPaye
                ).toFixed(2)}{" "}
                {paiement.facture.devise}
              </strong>
            </div>

            <div className="flex justify-between mt-2 text-lg">
              <span>
                Reste à payer
              </span>

              <strong>
                {Number(
                  paiement.facture.reste
                ).toFixed(2)}{" "}
                {paiement.facture.devise}
              </strong>
            </div>

          </div>
        )}

        <div className="mt-16 text-center text-sm">
          Merci pour votre confiance.
        </div>

      </div>

    </div>
  );
}