import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

import {
  getDemandeLaboratoire,
} from "@/app/actions/laboratoire";

import ResultatLaboratoireForm from "@/components/laboratoire/ResultatLaboratoireForm";

export default async function LaboratoireDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const demandeId = Number(id);

  const result =
    await getDemandeLaboratoire(
      demandeId,
    );

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          {result.message}
        </div>
      </div>
    );
  }

  const demande: any = result.data;

  return (
    <div className="p-6 space-y-6">
      {/* RETOUR */}

      <Link
        href="/laboratoire"
        className="btn btn-ghost btn-sm"
      >
        <ArrowLeft size={18} />
        Retour au laboratoire
      </Link>

      {/* HEADER */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FlaskConical />
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    {demande.numero}
                  </h1>

                  <p className="text-base-content/60">
                    Demande de laboratoire
                  </p>
                </div>
              </div>
            </div>

            <span className="badge badge-lg">
              {demande.statut}
            </span>
          </div>
        </div>
      </div>

      {/* PATIENT */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="font-bold text-lg">
              Patient
            </h2>

            <div className="space-y-2 mt-3">
              <p>
                <span className="font-medium">
                  Dossier :
                </span>{" "}
                {
                  demande.patient
                    .numeroDossier
                }
              </p>

              <p>
                <span className="font-medium">
                  Nom :
                </span>{" "}
                {demande.patient.nom}{" "}
                {demande.patient.postNom ?? ""}{" "}
                {demande.patient.prenom ?? ""}
              </p>

              <p>
                <span className="font-medium">
                  Téléphone :
                </span>{" "}
                {demande.patient.telephone ??
                  "-"}
              </p>
            </div>
          </div>
        </div>

        {/* CONSULTATION */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="font-bold text-lg">
              Consultation
            </h2>

            {demande.consultation ? (
              <div className="space-y-2 mt-3">
                <p>
                  Consultation #
                  {
                    demande.consultation
                      .idConsultation
                  }
                </p>

                <p>
                  Médecin : Dr{" "}
                  {
                    demande.consultation
                      .medecin.nom
                  }{" "}
                  {
                    demande.consultation
                      .medecin.prenom
                  }
                </p>

                {demande.consultation
                  .specialite && (
                  <p>
                    Spécialité :{" "}
                    {
                      demande.consultation
                        .specialite.nom
                    }
                  </p>
                )}

                <Link
                  href={`/consultations/${demande.consultation.idConsultation}`}
                  className="btn btn-sm btn-outline mt-3"
                >
                  Voir la consultation
                </Link>
              </div>
            ) : (
              <p className="text-base-content/60">
                Aucune consultation liée.
              </p>
            )}
          </div>
        </div>

        {/* DEMANDE */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="font-bold text-lg">
              Demande
            </h2>

            <div className="space-y-2 mt-3">
              <p>
                Date :{" "}
                {new Date(
                  demande.dateDemande,
                ).toLocaleString("fr-FR")}
              </p>

              <p>
                Urgence :{" "}
                {demande.urgence
                  ? "Oui"
                  : "Non"}
              </p>

              {demande.observation && (
                <p>
                  Observation :{" "}
                  {demande.observation}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EXAMENS */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="text-xl font-bold mb-4">
            Examens demandés
          </h2>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Examen</th>
                  <th>Code</th>
                  <th>Prix</th>
                  <th>Résultat</th>
                  <th>Validation</th>
                </tr>
              </thead>

              <tbody>
                {demande.lignes.map(
                  (ligne: any) => {
                    const resultat =
                      demande.resultats.find(
                        (r: any) =>
                          r.examenId ===
                          ligne.examenId,
                      );

                    return (
                      <tr
                        key={ligne.id}
                      >
                        <td>
                          <div className="font-medium">
                            {
                              ligne.examen
                                .nom
                            }
                          </div>

                          {ligne.examen
                            .description && (
                            <div className="text-xs text-base-content/60">
                              {
                                ligne
                                  .examen
                                  .description
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {
                            ligne.examen
                              .code
                          }
                        </td>

                        <td>
                          {ligne.prix}{" "}
                          {
                            demande
                              .lignes[0]
                              ?.examen
                              ? "USD"
                              : ""
                          }
                        </td>

                        <td>
                          {resultat ? (
                            <div>
                              <div className="font-semibold">
                                {
                                  resultat.valeur
                                }{" "}
                                {
                                  resultat
                                    .unite
                                }
                              </div>

                              {resultat
                                .commentaire && (
                                <div className="text-xs">
                                  {
                                    resultat.commentaire
                                  }
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-base-content/50">
                              Non saisi
                            </span>
                          )}
                        </td>

                        <td>
                          {resultat?.valide ? (
                            <span className="badge badge-success">
                              Validé
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SAISIE RESULTATS */}

      <ResultatLaboratoireForm
        demandeId={demande.id}
        lignes={demande.lignes}
        resultats={demande.resultats}
      />
    </div>
  );
}