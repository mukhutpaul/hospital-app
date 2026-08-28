"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import LignesFacture from "./LignesFacture";

type Props = {
  facture: any;
};

export default function FacturePrint({ facture }: Props) {
  const factureRef = useRef<HTMLDivElement>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const patient = facture?.patient;

  /**
   * ==========================================================
   * TÉLÉCHARGER PDF
   * ==========================================================
   *
   * IMPORTANT :
   * La capture est faite uniquement sur factureRef.current.
   */
  const handleDownloadPDF = async () => {
    if (loadingPdf) return;

    const element = factureRef.current;

    if (!element) {
      await Swal.fire({
        icon: "error",
        title: "Facture introuvable",
        text: "La zone de facture n'a pas été trouvée.",
        confirmButtonText: "OK",
      });

      return;
    }

    const confirmation = await Swal.fire({
      icon: "question",
      title: "Télécharger la facture ?",
      text: `Facture ${facture?.numero || ""}`,
      showCancelButton: true,
      confirmButtonText: "Télécharger",
      cancelButtonText: "Annuler",
      reverseButtons: true,
      confirmButtonColor: "#570df8",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoadingPdf(true);

    const toastId = toast.loading(
      "Préparation de la facture..."
    );

    try {
      /**
       * ========================================================
       * 1. VÉRIFICATION DE LA DIV
       * ========================================================
       */

      console.log(
        "FACTURE ELEMENT :",
        element
      );

      console.log(
        "FACTURE WIDTH :",
        element.offsetWidth
      );

      console.log(
        "FACTURE HEIGHT :",
        element.offsetHeight
      );

      if (
        element.offsetWidth === 0 ||
        element.offsetHeight === 0
      ) {
        throw new Error(
          "La div de facture possède une largeur ou une hauteur nulle."
        );
      }

      /**
       * ========================================================
       * 2. CAPTURE UNIQUEMENT DE LA DIV FACTURE
       * ========================================================
       */

      toast.update(toastId, {
        render: "Capture de la facture...",
        isLoading: true,
      });

      const canvas = await html2canvas(element, {
        scale: 2,

        backgroundColor: "#ffffff",

        useCORS: true,

        logging: true,

        removeContainer: true,
      });

      console.log(
        "CANVAS :",
        canvas
      );

      console.log(
        "CANVAS WIDTH :",
        canvas.width
      );

      console.log(
        "CANVAS HEIGHT :",
        canvas.height
      );

      if (
        canvas.width === 0 ||
        canvas.height === 0
      ) {
        throw new Error(
          "html2canvas a produit une image vide."
        );
      }

      /**
       * ========================================================
       * 3. CONVERSION IMAGE
       * ========================================================
       */

      toast.update(toastId, {
        render: "Création du document PDF...",
        isLoading: true,
      });

      const imgData =
        canvas.toDataURL("image/jpeg", 0.95);

      if (!imgData) {
        throw new Error(
          "Impossible de convertir la capture en image."
        );
      }

      /**
       * ========================================================
       * 4. CRÉATION PDF
       * ========================================================
       */

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth =
        pageWidth - margin * 2;

      const availableHeight =
        pageHeight - margin * 2;

      /**
       * Hauteur de l'image en conservant
       * ses proportions.
       */
      const imageHeight =
        (canvas.height * availableWidth) /
        canvas.width;

      /**
       * ========================================================
       * 5. FACTURE SUR UNE PAGE
       * ========================================================
       */

      if (imageHeight <= availableHeight) {
        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          margin,
          availableWidth,
          imageHeight
        );
      } else {
        /**
         * ======================================================
         * 6. FACTURE SUR PLUSIEURS PAGES
         * ======================================================
         */

        let remainingHeight =
          imageHeight;

        let position = margin;

        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          position,
          availableWidth,
          imageHeight
        );

        remainingHeight -=
          availableHeight;

        while (remainingHeight > 0) {
          pdf.addPage();

          position =
            margin -
            (imageHeight -
              remainingHeight);

          pdf.addImage(
            imgData,
            "JPEG",
            margin,
            position,
            availableWidth,
            imageHeight
          );

          remainingHeight -=
            availableHeight;
        }
      }

      /**
       * ========================================================
       * 7. NOM DU FICHIER
       * ========================================================
       */

      const numero =
        facture?.numero ||
        `facture-${facture?.id || "document"}`;

      const fileName =
        String(numero)
          .replace(/[<>:"/\\|?*]/g, "-")
          .trim();

      /**
       * ========================================================
       * 8. TÉLÉCHARGEMENT
       * ========================================================
       */

      pdf.save(
        `${fileName}.pdf`
      );

      /**
       * ========================================================
       * 9. SUCCÈS
       * ========================================================
       */

      toast.update(toastId, {
        render:
          "Facture téléchargée avec succès.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      await Swal.fire({
        icon: "success",
        title: "PDF généré",
        text:
          "La facture a été téléchargée avec succès.",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      /**
       * ========================================================
       * ERREUR
       * ========================================================
       */

      console.error(
        "================================"
      );

      console.error(
        "ERREUR PDF FACTURE"
      );

      console.error(
        "================================"
      );

      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "MESSAGE :",
        message
      );

      toast.update(toastId, {
        render:
          "Erreur lors de la génération du PDF.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });

      await Swal.fire({
        icon: "error",
        title: "Erreur PDF",
        html: `
          <div style="text-align:left">
            <p>
              Impossible de générer le PDF.
            </p>

            <hr />

            <small>
              ${message}
            </small>
          </div>
        `,
        confirmButtonText: "Fermer",
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  /**
   * ==========================================================
   * IMPRESSION
   * ==========================================================
   *
   * Ici aussi, on imprime uniquement la facture.
   */
  const handlePrint = async () => {
    const element = factureRef.current;

    if (!element) {
      await Swal.fire({
        icon: "error",
        title: "Facture introuvable",
        text:
          "Impossible de trouver la facture à imprimer.",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      const printWindow =
        window.open(
          "",
          "_blank",
          "width=900,height=700"
        );

      if (!printWindow) {
        await Swal.fire({
          icon: "warning",
          title: "Fenêtre bloquée",
          text:
            "Autorisez les fenêtres pop-up dans votre navigateur.",
          confirmButtonText: "OK",
        });

        return;
      }

      /**
       * On récupère les styles de la page
       * pour conserver l'apparence de la facture.
       */
      const styles =
        Array.from(
          document.querySelectorAll(
            'style, link[rel="stylesheet"]'
          )
        )
          .map(
            (style) =>
              style.outerHTML
          )
          .join("\n");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">

            <title>
              ${facture?.numero || "Facture"}
            </title>

            ${styles}

            <style>
              @page {
                size: A4;
                margin: 10mm;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                background: white;
              }

              body {
                color: black;
              }

              .facture-print {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }

              .print-hidden {
                display: none !important;
              }
            </style>
          </head>

          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 500);
    } catch (error) {
      console.error(
        "Erreur impression :",
        error
      );

      toast.error(
        "Impossible d'imprimer la facture."
      );

      await Swal.fire({
        icon: "error",
        title: "Erreur d'impression",
        text:
          "Impossible d'imprimer la facture.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="space-y-4">

      {/* =====================================================
          BOUTONS
      ====================================================== */}

      <div className="flex flex-wrap justify-end gap-2 print:hidden">

        <button
          type="button"
          onClick={handlePrint}
          disabled={loadingPdf}
          className="btn btn-outline"
        >
          🖨️ Imprimer
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={loadingPdf}
          className="btn btn-primary"
        >
          {loadingPdf ? (
            <>
              <span className="loading loading-spinner loading-sm" />

              Génération...
            </>
          ) : (
            <>
              📄 Télécharger PDF
            </>
          )}
        </button>

      </div>

      {/* =====================================================
          FACTURE
          ======================================================

          C'EST CETTE DIV UNIQUEMENT QUI EST CAPTURÉE.
      ====================================================== */}

      <div
        ref={factureRef}
        className="
          facture-print
          bg-white
          text-black
          shadow
          rounded-box
          p-8
          max-w-5xl
          mx-auto
        "
      >

        {/* ===================================================
            EN-TÊTE
        ==================================================== */}

        <div className="text-center border-b pb-6">

          <h1 className="text-3xl font-bold">
            FACTURE
          </h1>

          <p className="font-semibold">
            {facture?.numero || "-"}
          </p>

          <p>
            Date :{" "}
            {facture?.dateFacture
              ? new Date(
                  facture.dateFacture
                ).toLocaleDateString(
                  "fr-FR"
                )
              : "-"}
          </p>

        </div>

        {/* ===================================================
            PATIENT
        ==================================================== */}

        <div className="grid md:grid-cols-2 gap-6 my-6">

          <div>

            <h2 className="font-bold">
              Patient
            </h2>

            <p>
              {patient?.nom || ""}{" "}
              {patient?.postNom || ""}{" "}
              {patient?.prenom || ""}
            </p>

            <p>
              Dossier :{" "}
              {patient?.numeroDossier || "-"}
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
              Devise :{" "}
              {facture?.devise || "-"}
            </p>

            <p>
              Statut :{" "}
              {facture?.statut || "-"}
            </p>

          </div>

        </div>

        {/* ===================================================
            LIGNES
        ==================================================== */}

        <LignesFacture
          lignes={
            facture?.lignes || []
          }
        />

        {/* ===================================================
            TOTAUX
        ==================================================== */}

        <div className="flex justify-end mt-8">

          <div className="w-full md:w-96 space-y-3">

            <div className="flex justify-between">

              <span>
                Montant brut
              </span>

              <strong>
                {Number(
                  facture?.montantBrut || 0
                ).toFixed(2)}{" "}
                {facture?.devise || ""}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Réduction
              </span>

              <strong>
                {Number(
                  facture?.reduction || 0
                ).toFixed(2)}{" "}
                {facture?.devise || ""}
              </strong>

            </div>

            <div className="flex justify-between text-xl border-t pt-3">

              <span>
                Total
              </span>

              <strong>
                {Number(
                  facture?.montantTotal || 0
                ).toFixed(2)}{" "}
                {facture?.devise || ""}
              </strong>

            </div>

            <div className="flex justify-between text-success">

              <span>
                Payé
              </span>

              <strong>
                {Number(
                  facture?.montantPaye || 0
                ).toFixed(2)}{" "}
                {facture?.devise || ""}
              </strong>

            </div>

            <div className="flex justify-between text-error text-xl">

              <span>
                Reste
              </span>

              <strong>
                {Number(
                  facture?.reste || 0
                ).toFixed(2)}{" "}
                {facture?.devise || ""}
              </strong>

            </div>

          </div>

        </div>

        {/* ===================================================
            PIED
        ==================================================== */}

        <div className="mt-16 pt-6 border-t text-center text-sm opacity-60">

          Merci pour votre confiance.

        </div>

      </div>
    </div>
  );
}