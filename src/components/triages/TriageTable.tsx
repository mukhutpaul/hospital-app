
"use client";

import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { deleteTriage } from "@/app/actions/triages";

/* =========================================================
   TYPES
========================================================= */

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom: string | null;
  prenom: string | null;
};

type Service = {
  id: number;
  code: string;
  nom: string;
};

type Admission = {
  id: number;
  numero: string;

  patient: Patient;

  service: Service | null;

  statut?: string | null;
};

type Triage = {
  id: number;

  niveauUrgence: string | null;

  motif: string | null;

  observation: string | null;

  dateTriage: string | Date;

  admission: Admission;
};

type Props = {
  triages: Triage[];
};

/* =========================================================
   UTILITAIRES
========================================================= */

function patientName(
  patient: Patient,
): string {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function dateFr(
  value: string | Date,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function niveauClass(
  niveau: string | null,
): string {
  switch (niveau) {
    case "CRITIQUE":
      return "badge-error";

    case "URGENT":
      return "badge-warning";

    case "PRIORITAIRE":
      return "badge-secondary";

    case "NORMAL":
      return "badge-success";

    default:
      return "badge-success";
  }
}

function niveauLabel(
  niveau: string | null,
): string {
  switch (niveau) {
    case "CRITIQUE":
      return "Critique";

    case "URGENT":
      return "Urgent";

    case "PRIORITAIRE":
      return "Prioritaire";

    case "NORMAL":
      return "Normal";

    default:
      return "Normal";
  }
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function TriageTable({
  triages,
}: Props) {
  const router = useRouter();

  /* =======================================================
     FILTRES
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [serviceFilter, setServiceFilter] =
    useState("TOUS");

  const [niveauFilter, setNiveauFilter] =
    useState("TOUS");

  const [statutFilter, setStatutFilter] =
    useState("TOUS");

  const [dateDebut, setDateDebut] =
    useState("");

  const [dateFin, setDateFin] =
    useState("");

  /* =======================================================
     LISTE SERVICES
  ======================================================= */

  const services = useMemo(() => {
    const map =
      new Map<
        number,
        Service
      >();

    triages.forEach((triage) => {
      const service =
        triage.admission.service;

      if (
        service &&
        !map.has(service.id)
      ) {
        map.set(
          service.id,
          service,
        );
      }
    });

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      a.nom.localeCompare(
        b.nom,
        "fr",
      ),
    );
  }, [triages]);

  /* =======================================================
     STATUTS ADMISSION
  ======================================================= */

  const statuts = useMemo(() => {
    const values =
      new Set<string>();

    triages.forEach((triage) => {
      const statut =
        triage.admission.statut;

      if (statut) {
        values.add(statut);
      }
    });

    return Array.from(
      values,
    ).sort((a, b) =>
      a.localeCompare(
        b,
        "fr",
      ),
    );
  }, [triages]);

  /* =======================================================
     FILTRAGE AVANCÉ
  ======================================================= */

  const filteredTriages =
    useMemo(() => {
      const terme =
        search
          .trim()
          .toLowerCase();

      return triages.filter(
        (triage) => {
          /* -----------------------------------------------
             RECHERCHE GLOBALE
          ------------------------------------------------ */

          if (terme) {
            const texteRecherche =
              [
                triage.admission
                  .numero,

                triage.admission
                  .patient
                  .numeroDossier,

                patientName(
                  triage.admission
                    .patient,
                ),

                triage.admission
                  .patient
                  .nom,

                triage.admission
                  .patient
                  .postNom,

                triage.admission
                  .patient
                  .prenom,

                triage.admission
                  .service
                  ?.nom,

                triage.admission
                  .service
                  ?.code,

                triage.motif,

                triage.observation,

                triage.niveauUrgence,

                triage.admission
                  .statut,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (
              !texteRecherche.includes(
                terme,
              )
            ) {
              return false;
            }
          }

          /* -----------------------------------------------
             SERVICE
          ------------------------------------------------ */

          if (
            serviceFilter !==
              "TOUS" &&
            String(
              triage.admission
                .service?.id ??
                "",
            ) !==
              serviceFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             NIVEAU
          ------------------------------------------------ */

          if (
            niveauFilter !==
              "TOUS" &&
            triage.niveauUrgence !==
              niveauFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             STATUT ADMISSION
          ------------------------------------------------ */

          if (
            statutFilter !==
              "TOUS" &&
            triage.admission
              .statut !==
              statutFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             DATE DÉBUT
          ------------------------------------------------ */

          if (dateDebut) {
            const debut =
              new Date(
                `${dateDebut}T00:00:00`,
              );

            const dateTriage =
              new Date(
                triage.dateTriage,
              );

            if (
              dateTriage <
              debut
            ) {
              return false;
            }
          }

          /* -----------------------------------------------
             DATE FIN
          ------------------------------------------------ */

          if (dateFin) {
            const fin =
              new Date(
                `${dateFin}T23:59:59.999`,
              );

            const dateTriage =
              new Date(
                triage.dateTriage,
              );

            if (
              dateTriage >
              fin
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      triages,
      search,
      serviceFilter,
      niveauFilter,
      statutFilter,
      dateDebut,
      dateFin,
    ]);

  /* =======================================================
     RESET FILTRES
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setServiceFilter("TOUS");
    setNiveauFilter("TOUS");
    setStatutFilter("TOUS");
    setDateDebut("");
    setDateFin("");
  }

  /* =======================================================
     SUPPRESSION
  ======================================================= */

  async function handleDelete(
    id: number,
  ) {
    const confirmation =
      await Swal.fire({
        icon: "warning",

        title:
          "Supprimer le triage ?",

        text:
          "Cette opération est irréversible.",

        showCancelButton:
          true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        reverseButtons:
          true,
      });

    if (
      !confirmation.isConfirmed
    ) {
      return;
    }

    try {
      const result =
        await deleteTriage(id);

      if (
        !result.success
      ) {
        toast.error(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "❌ Suppression triage :",
        error,
      );

      toast.error(
        "Impossible de supprimer le triage.",
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* ===================================================
          BARRE DE RECHERCHE
      =================================================== */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">

        <div className="flex flex-col gap-4">

          {/* RECHERCHE */}

          <div className="form-control">

            <label className="label">
              <span className="label-text font-semibold">
                Recherche avancée
              </span>
            </label>

            <div className="join w-full">

              <div className="join-item flex items-center border border-base-300 bg-base-200 px-3">
                <Search
                  size={18}
                  className="opacity-60"
                />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Nom, dossier, admission, service, motif, observation..."
                className="input input-bordered join-item w-full"
              />

            </div>

          </div>

          {/* FILTRES */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

            {/* SERVICE */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Service
                </span>
              </label>

              <select
                value={
                  serviceFilter
                }
                onChange={(event) =>
                  setServiceFilter(
                    event.target
                      .value,
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="TOUS">
                  Tous les services
                </option>

                {services.map(
                  (service) => (
                    <option
                      key={
                        service.id
                      }
                      value={String(
                        service.id,
                      )}
                    >
                      {service.nom}
                    </option>
                  ),
                )}
              </select>

            </div>

            {/* NIVEAU */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Niveau d'urgence
                </span>
              </label>

              <select
                value={
                  niveauFilter
                }
                onChange={(event) =>
                  setNiveauFilter(
                    event.target
                      .value,
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="TOUS">
                  Tous les niveaux
                </option>

                <option value="CRITIQUE">
                  Critique
                </option>

                <option value="URGENT">
                  Urgent
                </option>

                <option value="PRIORITAIRE">
                  Prioritaire
                </option>

                <option value="NORMAL">
                  Normal
                </option>
              </select>

            </div>

            {/* STATUT */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Statut admission
                </span>
              </label>

              <select
                value={
                  statutFilter
                }
                onChange={(event) =>
                  setStatutFilter(
                    event.target
                      .value,
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="TOUS">
                  Tous les statuts
                </option>

                {statuts.map(
                  (statut) => (
                    <option
                      key={
                        statut
                      }
                      value={
                        statut
                      }
                    >
                      {statut}
                    </option>
                  ),
                )}
              </select>

            </div>

            {/* DATE DÉBUT */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Date début
                </span>
              </label>

              <input
                type="date"
                value={
                  dateDebut
                }
                onChange={(event) =>
                  setDateDebut(
                    event.target
                      .value,
                  )
                }
                className="input input-bordered w-full"
              />

            </div>

            {/* DATE FIN */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Date fin
                </span>
              </label>

              <input
                type="date"
                value={
                  dateFin
                }
                onChange={(event) =>
                  setDateFin(
                    event.target
                      .value,
                  )
                }
                className="input input-bordered w-full"
              />

            </div>

          </div>

          {/* BAS FILTRES */}

          <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-sm text-base-content/60">

              <Filter size={16} />

              <span>
                {filteredTriages.length}
                {" "}
                résultat
                {filteredTriages.length >
                1
                  ? "s"
                  : ""}
                {" "}
                sur{" "}
                {triages.length}
              </span>

            </div>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="btn btn-sm btn-outline"
            >
              <RotateCcw
                size={16}
              />

              Réinitialiser
            </button>

          </div>

        </div>

      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        <table className="table">

          <thead>

            <tr>

              <th>
                Patient
              </th>

              <th>
                Admission
              </th>

              <th>
                Niveau
              </th>

              <th>
                Service
              </th>

              <th>
                Motif
              </th>

              <th>
                Date
              </th>

              <th className="text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredTriages.map(
              (triage) => (
                <tr
                  key={
                    triage.id
                  }
                  className="hover:bg-base-200/50"
                >

                  {/* PATIENT */}

                  <td>

                    <div>

                      <p className="font-semibold">
                        {patientName(
                          triage
                            .admission
                            .patient,
                        )}
                      </p>

                      <p className="text-xs opacity-60">
                        {
                          triage
                            .admission
                            .patient
                            .numeroDossier
                        }
                      </p>

                    </div>

                  </td>

                  {/* ADMISSION */}

                  <td>

                    <div>

                      <p className="font-medium">
                        {
                          triage
                            .admission
                            .numero
                        }
                      </p>

                      {triage
                        .admission
                        .statut && (
                        <span className="text-xs opacity-50">
                          {
                            triage
                              .admission
                              .statut
                          }
                        </span>
                      )}

                    </div>

                  </td>

                  {/* NIVEAU */}

                  <td>

                    <span
                      className={`badge ${niveauClass(
                        triage.niveauUrgence,
                      )}`}
                    >
                      {niveauLabel(
                        triage
                          .niveauUrgence,
                      )}
                    </span>

                  </td>

                  {/* SERVICE */}

                  <td>

                    <div>

                      <p className="font-medium">
                        {triage
                          .admission
                          .service
                          ?.nom ??
                          "-"}
                      </p>

                      {triage
                        .admission
                        .service
                        ?.code && (
                        <p className="text-xs opacity-50">
                          {
                            triage
                              .admission
                              .service
                              .code
                          }
                        </p>
                      )}

                    </div>

                  </td>

                  {/* MOTIF */}

                  <td>

                    <div className="max-w-xs">

                      <p className="truncate">
                        {triage.motif ||
                          "-"}
                      </p>

                      {triage
                        .observation && (
                        <p className="truncate text-xs opacity-50">
                          {
                            triage
                              .observation
                          }
                        </p>
                      )}

                    </div>

                  </td>

                  {/* DATE */}

                  <td className="whitespace-nowrap text-sm">

                    {dateFr(
                      triage.dateTriage,
                    )}

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="flex justify-end gap-2">

                      <Link
                        href={`/triages/${triage.id}`}
                        className="btn btn-sm btn-ghost"
                        title="Voir"
                      >
                        <Eye
                          size={16}
                        />
                      </Link>

                      <Link
                        href={`/triages/${triage.id}/modifier`}
                        className="btn btn-sm btn-ghost"
                        title="Modifier"
                      >
                        <Pencil
                          size={16}
                        />
                      </Link>

                      <button
                        type="button"
                        className="btn btn-sm btn-ghost text-error"
                        title="Supprimer"
                        onClick={() =>
                          handleDelete(
                            triage.id,
                          )
                        }
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  </td>

                </tr>
              ),
            )}

            {/* VIDE */}

            {filteredTriages.length ===
              0 && (
              <tr>

                <td
                  colSpan={7}
                  className="py-14 text-center"
                >

                  <div className="flex flex-col items-center gap-3">

                    <Search
                      size={40}
                      className="opacity-20"
                    />

                    <div>

                      <p className="font-semibold">
                        Aucun triage trouvé
                      </p>

                      <p className="mt-1 text-sm opacity-60">
                        Aucun triage ne
                        correspond aux
                        critères sélectionnés.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="btn btn-sm btn-outline"
                    >
                      Réinitialiser les filtres
                    </button>

                  </div>

                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
