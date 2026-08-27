import { notFound } from "next/navigation";

import ProformaActions from "@/components/facturation/ProformaActions";
import ProformaPrint from "@/components/facturation/ProformaPrint";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProformaDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const proformaId = Number(id);

  if (!Number.isInteger(proformaId)) {
    notFound();
  }

  const proforma = await prisma.proforma.findUnique({
    where: {
      id: proformaId,
    },

    include: {
      patient: true,

      consultation: {
        include: {
          medecin: true,
          service: true,
          specialite: true,
        },
      },

      admission: {
        include: {
          service: true,
        },
      },

      hospitalisation: {
        include: {
          service: true,
          lit: {
            include: {
              chambre: true,
            },
          },
        },
      },

      lignes: {
        orderBy: {
          id: "asc",
        },

        include: {
          acte: true,
          service: true,
        },
      },

      facture: true,
    },
  });

  if (!proforma) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <a href="/facturation">
                  Facturation
                </a>
              </li>

              <li>
                <a href="/facturation/proformas">
                  Proformas
                </a>
              </li>

              <li>
                {proforma.numero}
              </li>
            </ul>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            Proforma {proforma.numero}
          </h1>

          <p className="text-base-content/60 mt-1">
            Détail du devis/proforma patient
          </p>
        </div>

        {/* IMPORTANT :
            les boutons avec onClick sont dans un Client Component
        */}

        <ProformaActions
          proformaId={proforma.id}
        />
      </div>

      {/* =====================================================
          INFORMATIONS GÉNÉRALES
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PATIENT */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">
              Patient
            </h2>

            <div className="space-y-2 mt-2">
              <div>
                <span className="text-sm text-base-content/60">
                  Dossier
                </span>

                <p className="font-semibold">
                  {proforma.patient.numeroDossier}
                </p>
              </div>

              <div>
                <span className="text-sm text-base-content/60">
                  Nom complet
                </span>

                <p className="font-semibold">
                  {proforma.patient.nom}{" "}
                  {proforma.patient.postNom || ""}{" "}
                  {proforma.patient.prenom || ""}
                </p>
              </div>

              {proforma.patient.telephone && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Téléphone
                  </span>

                  <p>
                    {proforma.patient.telephone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROFORMA */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">
              Proforma
            </h2>

            <div className="space-y-2 mt-2">
              <div className="flex justify-between gap-4">
                <span className="text-base-content/60">
                  Numéro
                </span>

                <strong>
                  {proforma.numero}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-base-content/60">
                  Date
                </span>

                <span>
                  {new Date(
                    proforma.dateEmission
                  ).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-base-content/60">
                  Devise
                </span>

                <strong>
                  {proforma.devise}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-base-content/60">
                  Statut
                </span>

                <span
                  className={`badge ${
                    proforma.statut ===
                    "FACTUREE"
                      ? "badge-success"
                      : proforma.statut ===
                        "ANNULEE"
                      ? "badge-error"
                      : "badge-warning"
                  }`}
                >
                  {proforma.statut}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SOURCE */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">
              Origine
            </h2>

            <div className="space-y-2 mt-2">
              {proforma.consultation && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Consultation
                  </span>

                  <p className="font-semibold">
                    #{proforma.consultation.idConsultation}
                  </p>

                  {proforma.consultation.service && (
                    <p className="text-sm">
                      Service :{" "}
                      {
                        proforma.consultation
                          .service.nom
                      }
                    </p>
                  )}

                  {proforma.consultation.medecin && (
                    <p className="text-sm">
                      Médecin : Dr.{" "}
                      {
                        proforma.consultation
                          .medecin.nom
                      }{" "}
                      {
                        proforma.consultation
                          .medecin.postNom || ""
                      }
                    </p>
                  )}
                </div>
              )}

              {proforma.admission && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Admission
                  </span>

                  <p className="font-semibold">
                    {proforma.admission.numero}
                  </p>

                  {proforma.admission.service && (
                    <p className="text-sm">
                      {
                        proforma.admission.service
                          .nom
                      }
                    </p>
                  )}
                </div>
              )}

              {proforma.hospitalisation && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Hospitalisation
                  </span>

                  <p className="font-semibold">
                    {proforma.hospitalisation.numero}
                  </p>

                  {proforma.hospitalisation.service && (
                    <p className="text-sm">
                      {
                        proforma.hospitalisation
                          .service.nom
                      }
                    </p>
                  )}

                  {proforma.hospitalisation.lit && (
                    <p className="text-sm">
                      Chambre :{" "}
                      {
                        proforma.hospitalisation
                          .lit.chambre.numero
                      }{" "}
                      — Lit{" "}
                      {
                        proforma.hospitalisation
                          .lit.numero
                      }
                    </p>
                  )}
                </div>
              )}

              {!proforma.consultation &&
                !proforma.admission &&
                !proforma.hospitalisation && (
                  <p className="text-base-content/60">
                    Aucune source médicale renseignée.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LIGNES DU PROFORMA
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="card-title">
                Détail des prestations
              </h2>

              <p className="text-sm text-base-content/60">
                Prestations regroupées par service
              </p>
            </div>

            <span className="badge badge-neutral">
              {proforma.lignes.length} ligne
              {proforma.lignes.length > 1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Désignation</th>
                  <th className="text-right">
                    Qté
                  </th>
                  <th className="text-right">
                    Prix unitaire
                  </th>
                  <th className="text-right">
                    Montant
                  </th>
                </tr>
              </thead>

              <tbody>
                {proforma.lignes.map(
                  (ligne, index) => (
                    <tr key={ligne.id}>
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {ligne.service ? (
                          <div>
                            <div className="font-medium">
                              {
                                ligne.service
                                  .nom
                              }
                            </div>

                            <div className="text-xs text-base-content/50">
                              {
                                ligne.service
                                  .code
                              }
                            </div>
                          </div>
                        ) : (
                          <span className="text-base-content/40">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="font-medium">
                          {ligne.designation}
                        </div>

                        {ligne.acte && (
                          <div className="text-xs text-base-content/50">
                            Acte :{" "}
                            {
                              ligne.acte.code
                            }
                          </div>
                        )}
                      </td>

                      <td className="text-right">
                        {ligne.quantite}
                      </td>

                      <td className="text-right">
                        {Number(
                          ligne.prixUnitaire
                        ).toFixed(2)}{" "}
                        {proforma.devise}
                      </td>

                      <td className="text-right font-semibold">
                        {Number(
                          ligne.montant
                        ).toFixed(2)}{" "}
                        {proforma.devise}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================
          TOTAUX
      ===================================================== */}

      <div className="flex justify-end">
        <div className="card bg-base-100 border border-base-300 shadow-sm w-full md:w-96">
          <div className="card-body">
            <div className="flex justify-between">
              <span>
                Montant brut
              </span>

              <strong>
                {Number(
                  proforma.montantBrut
                ).toFixed(2)}{" "}
                {proforma.devise}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>
                Réduction
                {proforma.typeReduction ===
                  "POURCENTAGE" &&
                  " (%)"}
              </span>

              <strong>
                -{" "}
                {Number(
                  proforma.reduction
                ).toFixed(2)}{" "}
                {proforma.devise}
              </strong>
            </div>

            <div className="divider my-1" />

            <div className="flex justify-between text-xl">
              <span className="font-bold">
                Total
              </span>

              <strong className="text-primary">
                {Number(
                  proforma.montantTotal
                ).toFixed(2)}{" "}
                {proforma.devise}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          IMPRESSION
      ===================================================== */}

      <div className="print-only">
        <ProformaPrint
          proforma={proforma}
        />
      </div>

      {/* =====================================================
          FACTURE ASSOCIÉE
      ===================================================== */}

      {proforma.facture && (
        <div className="alert alert-success">
          <div>
            <h3 className="font-bold">
              Ce proforma a été facturé.
            </h3>

            <p>
              Facture :{" "}
              <strong>
                {proforma.facture.numero}
              </strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}