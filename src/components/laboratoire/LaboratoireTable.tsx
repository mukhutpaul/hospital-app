"use client";

import { useState } from "react";

import {
  MoreHorizontal,
  Eye,
  Play,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  updateStatutDemandeLaboratoire,
} from "@/app/actions/laboratoire";

/*
==========================================================
TYPES
==========================================================
*/

type ResultatLaboratoire = {
  id: number;
  valeur?: string | null;
  unite?: string | null;
  commentaire?: string | null;
  normal?: boolean | null;
  valide?: boolean;
};

type LigneLaboratoire = {
  id: number;

  examen: {
    id: number;
    code: string;
    nom: string;
    unite?: string | null;
    valeurNormale?: string | null;
  };

  resultat?: ResultatLaboratoire | null;
};

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom: string;
  prenom: string;
};

type DemandeLaboratoire = {
  id: number;
  numero?: string | null;
  dateDemande: Date | string;
  statut: string;
  urgence: boolean;
  observation?: string | null;

  patient: Patient;

  lignes: LigneLaboratoire[];

  service?: {
    id: number;
    code: string;
    nom: string;
  } | null;
};

/*
==========================================================
PROPS
==========================================================
*/

type Props = {
  demandes: DemandeLaboratoire[];
};

/*
==========================================================
COMPOSANT
==========================================================
*/

export default function LaboratoireTable({
  demandes,
}: Props) {
  const [selectedDemande, setSelectedDemande] =
    useState<DemandeLaboratoire | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  /*
  ========================================================
  CHANGER LE STATUT
  ========================================================
  */

  async function handleStatut(
    demande: DemandeLaboratoire,
    statut: string,
  ) {
    let titre = "";

    let message = "";

    let icon:
      | "question"
      | "warning"
      | "success"
      | "info" = "question";

    if (statut === "EN_COURS") {
      titre = "Démarrer cette demande ?";
      message =
        "La demande passera au statut « En cours ».";
      icon = "info";
    }

    if (statut === "TERMINE") {
      titre = "Terminer cette demande ?";
      message =
        "Assurez-vous que les analyses sont terminées.";
      icon = "question";
    }

    if (statut === "VALIDE") {
      titre = "Valider cette demande ?";
      message =
        "Les résultats seront considérés comme validés.";
      icon = "success";
    }

    if (statut === "ANNULEE") {
      titre = "Annuler cette demande ?";
      message =
        "Cette action doit être utilisée uniquement si la demande est réellement annulée.";
      icon = "warning";
    }

    const confirmation =
      await Swal.fire({
        title: titre,

        text: message,

        icon,

        showCancelButton: true,

        confirmButtonText:
          statut === "ANNULEE"
            ? "Oui, annuler"
            : "Oui, continuer",

        cancelButtonText: "Retour",

        confirmButtonColor:
          statut === "ANNULEE"
            ? "#d33"
            : undefined,

        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await updateStatutDemandeLaboratoire(
          demande.id,
          statut,
        );

      if (!response.success) {
        toast.error(
          response.message,
        );

        return;
      }

      toast.success(
        response.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================================
  BADGE STATUT
  ========================================================
  */

  function getStatutBadge(
    statut: string,
  ) {
    switch (statut) {
      case "DEMANDE":
        return (
          <span className="badge badge-warning gap-1">
            <Clock3 size={13} />
            En attente
          </span>
        );

      case "EN_COURS":
        return (
          <span className="badge badge-info gap-1">
            <FlaskConical size={13} />
            En cours
          </span>
        );

      case "TERMINE":
        return (
          <span className="badge badge-success gap-1">
            <CheckCircle2 size={13} />
            Terminé
          </span>
        );

      case "VALIDE":
        return (
          <span className="badge badge-success gap-1">
            <CheckCircle2 size={13} />
            Validé
          </span>
        );

      case "ANNULEE":
        return (
          <span className="badge badge-error gap-1">
            <XCircle size={13} />
            Annulée
          </span>
        );

      default:
        return (
          <span className="badge badge-ghost">
            {statut}
          </span>
        );
    }
  }

  /*
  ========================================================
  CALCULER LE NOMBRE DE RÉSULTATS
  ========================================================
  */

  function getResultatsCount(
    demande: DemandeLaboratoire,
  ) {
    return demande.lignes.filter(
      (ligne) =>
        ligne.resultat &&
        ligne.resultat.valeur !== null &&
        ligne.resultat.valeur !==
          undefined &&
        ligne.resultat.valeur !== "",
    ).length;
  }

  /*
  ========================================================
  DEMANDE VIDE
  ========================================================
  */

  if (demandes.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body items-center text-center py-14">
          <FlaskConical
            size={46}
            className="text-base-content/30"
          />

          <h3 className="font-semibold text-lg">
            Aucune demande
          </h3>

          <p className="text-sm text-base-content/60">
            Aucune demande de laboratoire
            n'est enregistrée.
          </p>
        </div>
      </div>
    );
  }

  /*
  ========================================================
  TABLEAU
  ========================================================
  */

  return (
    <>
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>N° Demande</th>

                <th>Patient</th>

                <th>Examens</th>

                <th>Résultats</th>

                <th>Service</th>

                <th>Date</th>

                <th>Statut</th>

                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {demandes.map(
                (demande) => {
                  const resultats =
                    getResultatsCount(
                      demande,
                    );

                  return (
                    <tr
                      key={
                        demande.id
                      }
                    >
                      {/* ==================================
                          NUMÉRO
                      ================================== */}

                      <td>
                        <div className="flex items-center gap-2">
                          {demande.urgence && (
                            <span
                              className="tooltip"
                              data-tip="Demande urgente"
                            >
                              <AlertTriangle
                                size={
                                  17
                                }
                                className="text-error"
                              />
                            </span>
                          )}

                          <span className="font-mono font-semibold">
                            {demande.numero ||
                              `LAB-${String(
                                demande.id,
                              ).padStart(
                                5,
                                "0",
                              )}`}
                          </span>
                        </div>
                      </td>

                      {/* ==================================
                          PATIENT
                      ================================== */}

                      <td>
                        <div className="min-w-[190px]">
                          <p className="font-semibold">
                            {
                              demande
                                .patient
                                .nom
                            }{" "}
                            {
                              demande
                                .patient
                                .postNom
                            }
                          </p>

                          <p className="text-sm">
                            {
                              demande
                                .patient
                                .prenom
                            }
                          </p>

                          <p className="text-xs text-base-content/60">
                            Dossier :{" "}
                            {
                              demande
                                .patient
                                .numeroDossier
                            }
                          </p>
                        </div>
                      </td>

                      {/* ==================================
                          EXAMENS
                      ================================== */}

                      <td>
                        <div className="min-w-[180px] space-y-1">
                          {demande.lignes
                            .slice(0, 3)
                            .map(
                              (
                                ligne,
                              ) => (
                                <div
                                  key={
                                    ligne.id
                                  }
                                  className="text-sm"
                                >
                                  <span className="font-medium">
                                    {
                                      ligne
                                        .examen
                                        .code
                                    }
                                  </span>{" "}
                                  —{" "}
                                  {
                                    ligne
                                      .examen
                                      .nom
                                  }
                                </div>
                              ),
                            )}

                          {demande.lignes
                            .length >
                            3 && (
                            <span className="text-xs text-base-content/60">
                              +
                              {demande.lignes.length -
                                3}{" "}
                              autre
                              {demande.lignes.length -
                                3 >
                              1
                                ? "s"
                                : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ==================================
                          RÉSULTATS
                      ================================== */}

                      <td>
                        <div className="min-w-[100px]">
                          <span
                            className={`badge ${
                              resultats ===
                              demande
                                .lignes
                                .length &&
                              demande
                                .lignes
                                .length >
                                0
                                ? "badge-success"
                                : "badge-ghost"
                            }`}
                          >
                            {resultats}/
                            {
                              demande
                                .lignes
                                .length
                            }
                          </span>
                        </div>
                      </td>

                      {/* ==================================
                          SERVICE
                      ================================== */}

                      <td>
                        {demande.service ? (
                          <div>
                            <p className="font-medium">
                              {
                                demande
                                  .service
                                  .nom
                              }
                            </p>

                            <p className="text-xs text-base-content/60">
                              {
                                demande
                                  .service
                                  .code
                              }
                            </p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* ==================================
                          DATE
                      ================================== */}

                      <td>
                        <span className="text-sm">
                          {new Date(
                            demande.dateDemande,
                          ).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </span>

                        <span className="block text-xs text-base-content/50">
                          {new Date(
                            demande.dateDemande,
                          ).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </td>

                      {/* ==================================
                          STATUT
                      ================================== */}

                      <td>
                        {getStatutBadge(
                          demande.statut,
                        )}
                      </td>

                      {/* ==================================
                          ACTIONS
                      ================================== */}

                      <td>
                        <div className="flex justify-end">
                          <div className="dropdown dropdown-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost btn-circle"
                              disabled={
                                loading
                              }
                            >
                              <MoreHorizontal
                                size={
                                  18
                                }
                              />
                            </button>

                            <ul className="dropdown-content menu bg-base-100 rounded-box z-[50] w-60 p-2 shadow-lg border border-base-200">

                              {/* VOIR */}

                              <li>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDemande(
                                      demande,
                                    )
                                  }
                                >
                                  <Eye
                                    size={
                                      16
                                    }
                                  />

                                  Voir les détails
                                </button>
                              </li>

                              {/* DÉMARRER */}

                              {demande.statut ===
                                "DEMANDE" && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatut(
                                        demande,
                                        "EN_COURS",
                                      )
                                    }
                                  >
                                    <Play
                                      size={
                                        16
                                      }
                                    />

                                    Démarrer
                                  </button>
                                </li>
                              )}

                              {/* TERMINER */}

                              {demande.statut ===
                                "EN_COURS" && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatut(
                                        demande,
                                        "TERMINE",
                                      )
                                    }
                                  >
                                    <CheckCircle2
                                      size={
                                        16
                                      }
                                    />

                                    Terminer
                                  </button>
                                </li>
                              )}

                              {/* VALIDER */}

                              {demande.statut ===
                                "TERMINE" && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatut(
                                        demande,
                                        "VALIDE",
                                      )
                                    }
                                  >
                                    <CheckCircle2
                                      size={
                                        16
                                      }
                                    />

                                    Valider les résultats
                                  </button>
                                </li>
                              )}

                              {/* ANNULER */}

                              {[
                                "DEMANDE",
                                "EN_COURS",
                              ].includes(
                                demande.statut,
                              ) && (
                                <li>
                                  <button
                                    type="button"
                                    className="text-error"
                                    onClick={() =>
                                      handleStatut(
                                        demande,
                                        "ANNULEE",
                                      )
                                    }
                                  >
                                    <XCircle
                                      size={
                                        16
                                      }
                                    />

                                    Annuler
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          MODAL DÉTAILS
      ================================================== */}

      {selectedDemande && (
        <dialog
          open
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box max-w-4xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">
                  Détails de la demande
                </h3>

                <p className="text-sm text-base-content/60">
                  {selectedDemande.numero ||
                    `LAB-${String(
                      selectedDemande.id,
                    ).padStart(
                      5,
                      "0",
                    )}`}
                </p>
              </div>

              {getStatutBadge(
                selectedDemande.statut,
              )}
            </div>

            <div className="divider" />

            {/* PATIENT */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>
                <p className="text-xs text-base-content/50">
                  Patient
                </p>

                <p className="font-semibold">
                  {
                    selectedDemande
                      .patient
                      .nom
                  }{" "}
                  {
                    selectedDemande
                      .patient
                      .postNom
                  }{" "}
                  {
                    selectedDemande
                      .patient
                      .prenom
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-base-content/50">
                  N° dossier
                </p>

                <p className="font-semibold">
                  {
                    selectedDemande
                      .patient
                      .numeroDossier
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-base-content/50">
                  Service
                </p>

                <p className="font-semibold">
                  {
                    selectedDemande
                      .service
                      ?.nom ||
                    "—"
                  }
                </p>
              </div>
            </div>

            {/* URGENCE */}

            {selectedDemande.urgence && (
              <div className="alert alert-error mt-5">
                <AlertTriangle
                  size={20}
                />

                <span>
                  Cette demande est
                  marquée comme urgente.
                </span>
              </div>
            )}

            {/* EXAMENS */}

            <div className="mt-6">
              <h4 className="font-semibold mb-3">
                Examens demandés
              </h4>

              <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>

                      <th>Examen</th>

                      <th>Valeur normale</th>

                      <th>Résultat</th>

                      <th>Statut</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedDemande.lignes.map(
                      (ligne) => {
                        const resultat =
                          ligne.resultat;

                        return (
                          <tr
                            key={
                              ligne.id
                            }
                          >
                            <td>
                              <span className="font-mono">
                                {
                                  ligne
                                    .examen
                                    .code
                                }
                              </span>
                            </td>

                            <td>
                              {
                                ligne
                                  .examen
                                  .nom
                              }
                            </td>

                            <td>
                              {
                                ligne
                                  .examen
                                  .valeurNormale ||
                                "—"
                              }
                            </td>

                            <td>
                              {resultat?.valeur ||
                                "Non saisi"}

                              {resultat?.unite && (
                                <span className="ml-1 text-xs text-base-content/50">
                                  {
                                    resultat.unite
                                  }
                                </span>
                              )}
                            </td>

                            <td>
                              {resultat?.valide ? (
                                <span className="badge badge-success">
                                  Validé
                                </span>
                              ) : resultat ? (
                                <span className="badge badge-warning">
                                  À valider
                                </span>
                              ) : (
                                <span className="badge badge-ghost">
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

            {/* OBSERVATION */}

            {selectedDemande.observation && (
              <div className="mt-5">
                <p className="text-xs text-base-content/50">
                  Observation
                </p>

                <p className="mt-1 rounded-lg bg-base-200 p-3 text-sm">
                  {
                    selectedDemande.observation
                  }
                </p>
              </div>
            )}

            {/* ACTION */}

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setSelectedDemande(
                    null,
                  )
                }
              >
                Fermer
              </button>
            </div>

          </div>

          <div
            className="modal-backdrop"
            onClick={() =>
              setSelectedDemande(
                null,
              )
            }
          />
        </dialog>
      )}
    </>
  );
}