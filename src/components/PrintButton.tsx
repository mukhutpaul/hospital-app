"use client";

type Props = {
  targetId: string;
};

export default function PrintButton({
  targetId,
}: Props) {
  const handlePrint = () => {
    const element = document.getElementById(targetId);

    if (!element) {
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=650"
    );

    if (!printWindow) {
      alert(
        "Impossible d'ouvrir la fenêtre d'impression."
      );

      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>Proforma</title>

          <style>
            * {
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 15mm;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              width: 100%;
            }

            #print-proforma {
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              background: white;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }

            th {
              text-align: left;
            }

            .text-center {
              text-align: center;
            }

            .text-right {
              text-align: right;
            }

            .font-bold {
              font-weight: bold;
            }

            .text-xl {
              font-size: 20px;
            }

            .mt-6 {
              margin-top: 24px;
            }

            .mt-10 {
              margin-top: 40px;
            }

            .my-6 {
              margin-top: 24px;
              margin-bottom: 24px;
            }

            .py-4 {
              padding-top: 16px;
              padding-bottom: 16px;
            }

            .border-y {
              border-top: 1px solid #ddd;
              border-bottom: 1px solid #ddd;
            }
          </style>
        </head>

        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();

      printWindow.close();
    }, 500);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="btn btn-primary"
    >
      Imprimer la proforma
    </button>
  );
}