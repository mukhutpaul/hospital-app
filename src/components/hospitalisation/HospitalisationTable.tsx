
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  X,
  Filter,
  User,
  Building2,
  BedDouble,
  CalendarDays,
} from "lucide-react";

import ActionButton from "./ActionButton";

/* =========================================================
   TYPES
========================================================= */

type Hospitalisation = {
  id: number;
  numero: string;

  statut: string;

  dateEntree: string | Date;

  patient?: {
    id?: number;
    nom?: string | null;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  service?: {
    id?: number;
    code?: string | null;
    nom?: string | null;
  } | null;

  lit?: {
    id?: number;
    numero?: string | null;

    chambre?: {
      id?: number;
      numero?: string | null;
      type?: string | null;
    } | null;
  } | null;
};

/* =========================================================
   PROPS
========================================================= */

type Props = {
  items: Hospitalisation[];
};

/* =========================================================
   UTILITAIRES
========================================================= */

function getPatientName(
  patient?: Hospitalisation["patient"],
): string {
  if (!patient) {
    return "Patient inconnu";
  }

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim()),
    )
    .join(" ");
}

function formatDate(
  value: string | Date,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function HospitalisationTable({
  items,
}: Props) {
  /* =======================================================
     FILTRES
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [statutFilter, setStatutFilter] =
    useState("TOUS");

  const [serviceFilter, setServiceFilter] =
    useState("TOUS");

  /* =======================================================
     SERVICES DISPONIBLES
  ======================================================= */

  const services = useMemo(() => {
    const map = new Map<
      number,
      string
    >();

    items.forEach((item) => {
      const service = item.service;

      if (
        service?.id &&
        service?.nom
      ) {
        map.set(
          service.id,
          service.nom,
        );
      }
    });

    return Array.from(
      map.entries(),
    ).sort((a, b) =>
      a[1].localeCompare(
        b[1],
        "fr",
      ),
    );
  }, [items]);

  /* =======================================================
     STATUTS DISPONIBLES
  ======================================================= */

  const statuts = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map(
            (item) =>
              item.statut,
          )
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(
        b,
        "fr",
      ),
    );
  }, [items]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          /* -----------------------------------------------
             STATUT
          ------------------------------------------------ */

          if (
            statutFilter !==
              "TOUS" &&
            item.statut !==
              statutFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             SERVICE
          ------------------------------------------------ */

          if (
            serviceFilter !==
              "TOUS" &&
            String(
              item.service?.id ??
                "",
            ) !==
              serviceFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             RECHERCHE GLOBALE
          ------------------------------------------------ */

          if (!term) {
            return true;
          }

          const patientName =
            getPatientName(
              item.patient,
            );

          const chambre =
            item.lit
              ?.chambre?.numero ??
            "";

          const lit =
            item.lit?.numero ??
            "";

          const texte =
            [
              item.numero,
              item.statut,
              item.service?.nom,
              item.service?.code,
              patientName,
              item.patient
                ?.numeroDossier,
              chambre,
              lit,
              item.lit?.chambre
                ?.type,
              formatDate(
                item.dateEntree,
              ),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return texte.includes(
            term,
          );
        },
      );
    }, [
      items,
      search,
      statutFilter,
      serviceFilter,
    ]);

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setStatutFilter("TOUS");
    setServiceFilter("TOUS");
  }

  const hasFilters =
    search.trim() !== "" ||
    statutFilter !==
      "TOUS" ||
    serviceFilter !==
      "TOUS";

  /* =======================================================
     AUCUNE DONNÉE
  ======================================================= */

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
        <BedDouble
          size={42}
          className="mx-auto mb-3 opacity-30"
        />

        <h3 className="font-semibold">
          Aucune hospitalisation
        </h3>

        <p className="mt-1 text-sm text-base-content/60">
          Les hospitalisations
          enregistrées apparaîtront
          ici.
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4">
      {/* ====================================================
          FILTRES
      ==================================================== */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* RECHERCHE */}

          <div className="relative w-full xl:flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher par N°, patient, dossier, service, chambre, lit..."
              className="input input-bordered h-11 w-full pl-10 pr-10"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-error"
                title="Effacer"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* STATUT */}

          <select
            value={statutFilter}
            onChange={(event) =>
              setStatutFilter(
                event.target.value,
              )
            }
            className="select select-bordered h-11 w-full xl:w-52"
          >
            <option value="TOUS">
              Tous les statuts
            </option>

            {statuts.map(
              (statut) => (
                <option
                  key={statut}
                  value={statut}
                >
                  {statut}
                </option>
              ),
            )}
          </select>

          {/* SERVICE */}

          <select
            value={
              serviceFilter
            }
            onChange={(event) =>
              setServiceFilter(
                event.target.value,
              )
            }
            className="select select-bordered h-11 w-full xl:w-60"
          >
            <option value="TOUS">
              Tous les services
            </option>

            {services.map(
              ([id, nom]) => (
                <option
                  key={id}
                  value={id}
                >
                  {nom}
                </option>
              ),
            )}
          </select>

          {/* RESET */}

          <button
            type="button"
            onClick={
              resetFilters
            }
            disabled={
              !hasFilters
            }
            className="btn btn-outline h-11"
          >
            <Filter
              size={16}
            />

            Réinitialiser
          </button>
        </div>

        {/* RÉSULTAT */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-base-content/60">
            {filteredItems.length}{" "}
            hospitalisation
            {filteredItems.length !==
            1
              ? "s"
              : ""}{" "}
            affichée
            {filteredItems.length !==
            1
              ? "s"
              : ""}
          </span>

          {hasFilters && (
            <span className="badge badge-primary badge-sm">
              Filtres actifs
            </span>
          )}
        </div>
      </div>

      {/* ====================================================
          AUCUN RÉSULTAT
      ==================================================== */}

      {filteredItems.length ===
      0 ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
          <Search
            size={38}
            className="mx-auto mb-3 opacity-30"
          />

          <h3 className="font-semibold">
            Aucun résultat
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Aucune hospitalisation
            ne correspond aux
            critères sélectionnés.
          </p>

          <button
            type="button"
            className="btn btn-sm btn-ghost mt-4"
            onClick={
              resetFilters
            }
          >
            Réinitialiser
          </button>
        </div>
      ) : (
        /* ==================================================
           TABLEAU
        ================================================== */

        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Chambre / Lit</th>
                <th>Entrée</th>
                <th>Statut</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map(
                (h) => (
                  <tr
                    key={h.id}
                  >
                    {/* NUMÉRO */}

                    <td>
                      <span className="font-semibold">
                        {
                          h.numero
                        }
                      </span>
                    </td>

                    {/* PATIENT */}

                    <td>
                      <div className="flex items-start gap-2">
                        <User
                          size={16}
                          className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                          <p className="font-medium">
                            {getPatientName(
                              h.patient,
                            )}
                          </p>

                          {h
                            .patient
                            ?.numeroDossier && (
                            <p className="text-xs text-base-content/50">
                              Dossier :{" "}
                              {
                                h
                                  .patient
                                  .numeroDossier
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td>
                      <div className="flex items-center gap-2">
                        <Building2
                          size={16}
                          className="text-info"
                        />

                        <span>
                          {h
                            .service
                            ?.nom ??
                            "—"}
                        </span>
                      </div>
                    </td>

                    {/* CHAMBRE / LIT */}

                    <td>
                      {h.lit ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <BedDouble
                              size={
                                16
                              }
                              className="text-accent"
                            />

                            <span className="font-medium">
                              Chambre{" "}
                              {
                                h
                                  .lit
                                  .chambre
                                  ?.numero ??
                                "—"
                              }
                            </span>
                          </div>

                          <p className="ml-6 text-xs text-base-content/50">
                            Lit{" "}
                            {
                              h
                                .lit
                                .numero
                            }
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* DATE */}

                    <td>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays
                          size={
                            15
                          }
                          className="opacity-50"
                        />

                        {
                          formatDate(
                            h.dateEntree,
                          )
                        }
                      </div>
                    </td>

                    {/* STATUT */}

                    <td>
                      <span
                        className={`badge ${
                          h.statut ===
                          "EN_COURS"
                            ? "badge-success"
                            : h.statut ===
                                "TERMINEE" ||
                              h.statut ===
                                "TERMINE"
                              ? "badge-info"
                              : "badge-ghost"
                        }`}
                      >
                        {
                          h.statut
                        }
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-end gap-1">
                        <Link
                          className="btn btn-ghost btn-sm"
                          href={`/hospitalisation/hospitalisations/${h.id}`}
                        >
                          Voir
                        </Link>

                        <Link
                          className="btn btn-outline btn-sm"
                          href={`/hospitalisation/hospitalisations/${h.id}/modifier`}
                        >
                          Modifier
                        </Link>

                        {h.statut ===
                          "EN_COURS" && (
                          <ActionButton
                            entity="hospitalisation"
                            id={h.id}
                            action="terminer"
                            label="Terminer"
                            className="btn btn-warning btn-sm"
                          />
                        )}

                        {h.statut !==
                          "EN_COURS" && (
                          <ActionButton
                            entity="hospitalisation"
                            id={h.id}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
