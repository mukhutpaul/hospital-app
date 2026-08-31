import { prisma } from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const p = await prisma.proforma.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      patient: true,

      consultation: {
        include: {
          medecin: true,
          service: true,
        },
      },

      lignes: true,
    },
  });

  if (!p) {
    return <div>Introuvable</div>;
  }

  return (
    <>
      {/* ============================================
          ZONE À IMPRIMER UNIQUEMENT
      ============================================ */}
      <div
        id="print-proforma"
        className="mx-auto max-w-3xl bg-white p-8 print:p-0"
      >
        {/* EN-TÊTE */}

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            NOM DE L'HÔPITAL
          </h1>

          <p>
            Adresse — Téléphone
          </p>

          <h2 className="mt-6 text-2xl font-bold">
            PROFORMA
          </h2>

          <p>
            {p.numero} —{" "}
            {new Date(
              p.dateEmission
            ).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* INFORMATIONS */}

        <div className="my-6 border-y py-4">
          <div>
            <b>Patient :</b>{" "}
            {p.patient.nom}{" "}
            {p.patient.postNom || ""}{" "}
            {p.patient.prenom || ""}
          </div>

          <div>
            <b>N° Dossier :</b>{" "}
            {p.patient.numeroDossier}
          </div>

          <br />

          <div>
            <b>Consultation :</b>{" "}
            {p.consultation
              ? `CONS-${p.consultation.idConsultation}`
              : "—"}
          </div>

          <div>
            <b>Service :</b>{" "}
            {p.consultation?.service?.nom ||
              "—"}
          </div>

          <div>
            <b>Médecin :</b>{" "}
            Dr{" "}
            {p.consultation?.medecin?.nom ||
              "—"}
          </div>
        </div>

        {/* TABLEAU */}

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">
                Origine
              </th>

              <th className="py-2">
                Désignation
              </th>

              <th className="py-2 text-center">
                Qté
              </th>

              <th className="py-2 text-right">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {p.lignes.map((l: any) => (
              <tr
                className="border-b"
                key={l.id}
              >
                <td className="py-2">
                  {l.typeOrigine}
                </td>

                <td className="py-2">
                  {l.designation}
                </td>

                <td className="py-2 text-center">
                  {l.quantite}
                </td>

                <td className="py-2 text-right">
                  {Number(l.montant).toFixed(2)}{" "}
                  {p.devise}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAUX */}

        <div className="mt-6 ml-auto max-w-xs space-y-2 text-right">
          <div>
            Brut :{" "}
            {Number(p.montantBrut).toFixed(2)}{" "}
            {p.devise}
          </div>

          <div>
            Réduction :{" "}
            {Number(p.reduction).toFixed(2)}{" "}
            {p.devise}
          </div>

          <div className="border-t pt-2 text-xl font-bold">
            Net à payer :{" "}
            {Number(p.montantTotal).toFixed(2)}{" "}
            {p.devise}
          </div>
        </div>

        {/* PIED DE PAGE */}

        <p className="mt-10 text-center text-sm font-medium">
          DOCUMENT PROFORMA — NON CONSTITUTIF
          D'UN REÇU
        </p>
      </div>

      {/* ============================================
          STYLE D'IMPRESSION
      ============================================ */}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #print-proforma,
          #print-proforma * {
            visibility: visible;
          }

          #print-proforma {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 20px;
            background: white;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* ============================================
          IMPRESSION AUTOMATIQUE
      ============================================ */}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener("load", function () {
              setTimeout(function () {
                window.print();
              }, 500);
            });
          `,
        }}
      />
    </>
  );
}