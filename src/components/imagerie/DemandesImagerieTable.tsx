
"use client";

import Link from "next/link";
import {
  Eye,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type DemandeImagerie = {
  id: number;
  numero: string | null;

  patient?: {
    id: number;
    numeroDossier?: string | null;
    nom?: string | null;
    postNom?: string | null;
    prenom?: string | null;
  } | null;

  examen?: {
    id: number;
    code?: string | null;
    nom?: string | null;
    type?: string | null;
  } | null;

  consultation?: {
    idConsultation?: number | null;

    medecin?: {
      nom?: string | null;
      postNom?: string | null;
      prenom?: string | null;
    } | null;

    service?: {
      id: number;
      code?: string | null;
      nom?: string | null;
    } | null;
  } | null;

  service?: {
    id: number;
    code?: string | null;
    nom?: string | null;
  } | null;

  dateDemande: string | Date | null;
  urgence: boolean;
  statut: string | null;
};

type Props = {
  demandes: DemandeImagerie[];
};

/* =========================================================
   UTILITAIRES
========================================================= */

function getPatientName(
  patient: DemandeImagerie["patient"],
): string {
  if (!patient) {
    return "Patient inconnu";
  }

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function getMedecinName(
  consultation: DemandeImagerie["consultation"],
): string {
  if (!consultation?.medecin) {
    return "";
  }

  return [
    consultation.medecin.nom,
    consultation.medecin.postNom,
    consultation.medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(
  value: string | Date | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function DemandesImagerieTable({
  demandes,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [statutFilter, setStatutFilter] =
    useState("TOUS");

  const [urgenceFilter, setUrgenceFilter] =
    useState("TOUS");

  const [typeFilter, setTypeFilter] =
    useState("TOUS");

  const [serviceFilter, setServiceFilter] =
    useState("TOUS");

  const [dateDebut, setDateDebut] =
    useState("");

  const [dateFin, setDateFin] =
    useState("");

  /* =======================================================
     TYPES D'EXAMENS
  ======================================================= */

  const types = useMemo(() => {
    const values = new Set<string>();

    demandes.forEach((demande) => {
      if (demande.examen?.type) {
        values.add(demande.examen.type);
      }
    });

    return Array.from(values).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
  }, [demandes]);

  /* =======================================================
     SERVICES
  ======================================================= */

  const services = useMemo(() => {
    const map =
      new Map<
        number,
        {
          id: number;
          code?: string | null;
          nom?: string | null;
        }
      >();

    demandes.forEach((demande) => {
      const service =
        demande.service ??
        demande.consultation?.service ??
        null;

      if (
        service &&
        !map.has(service.id)
      ) {
        map.set(service.id, service);
      }
    });

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      (a.nom ?? "").localeCompare(
        b.nom ?? "",
        "fr",
      ),
    );
  }, [demandes]);

  /* =======================================================
     STATUTS
  ======================================================= */

  const statuts = useMemo(() => {
    const values = new Set<string>();

    demandes.forEach((demande) => {
      if (demande.statut) {
        values.add(demande.statut);
      }
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(b, "fr"),
    );
  }, [demandes]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const demandesFiltrees = useMemo(() => {
    const terme =
      search.trim().toLowerCase();

    return demandes.filter(
      (demande) => {
        /* -----------------------------------------------
           RECHERCHE AVANCÉE
        ------------------------------------------------ */

        if (terme) {
          const texte = [
            demande.numero,

            getPatientName(
              demande.patient,
            ),

            demande.patient
              ?.numeroDossier,

            demande.examen?.nom,

            demande.examen?.code,

            demande.examen?.type,

            demande.service?.nom,

            demande.service?.code,

            demande.consultation
              ?.service?.nom,

            demande.consultation
              ?.service?.code,

            getMedecinName(
              demande.consultation,
            ),

            demande.statut,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            !texte.includes(terme)
          ) {
            return false;
          }
        }

        /* -----------------------------------------------
           STATUT
        ------------------------------------------------ */

        if (
          statutFilter !==
            "TOUS" &&
          demande.statut !==
            statutFilter
        ) {
          return false;
        }

        /* -----------------------------------------------
           URGENCE
        ------------------------------------------------ */

        if (
          urgenceFilter !==
            "TOUS"
        ) {
          if (
            urgenceFilter ===
              "URGENT" &&
            !demande.urgence
          ) {
            return false;
          }

          if (
            urgenceFilter ===
              "NORMAL" &&
            demande.urgence
          ) {
            return false;
          }
        }

        /* -----------------------------------------------
           TYPE EXAMEN
        ------------------------------------------------ */

        if (
          typeFilter !== "TOUS" &&
          demande.examen?.type !==
            typeFilter
        ) {
          return false;
        }

        /* -----------------------------------------------
           SERVICE
        ------------------------------------------------ */

        if (
          serviceFilter !==
            "TOUS"
        ) {
          const serviceId =
            demande.service?.id ??
            demande.consultation
              ?.service?.id;

          if (
            String(
              serviceId ?? "",
            ) !== serviceFilter
          ) {
            return false;
          }
        }

        /* -----------------------------------------------
           DATE DÉBUT
        ------------------------------------------------ */

        if (dateDebut) {
          const debut =
            new Date(
              `${dateDebut}T00:00:00`,
            );

          const dateDemande =
            new Date(
              demande.dateDemande ??
                "",
            );

          if (
            dateDemande < debut
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

          const dateDemande =
            new Date(
              demande.dateDemande ??
                "",
            );

          if (
            dateDemande > fin
          ) {
            return false;
          }
        }

        return true;
      },
    );
  }, [
    demandes,
    search,
    statutFilter,
    urgenceFilter,
    typeFilter,
    serviceFilter,
    dateDebut,
    dateFin,
  ]);

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setStatutFilter("TOUS");
    setUrgenceFilter("TOUS");
    setTypeFilter("TOUS");
    setServiceFilter("TOUS");
    setDateDebut("");
    setDateFin("");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* ===================================================
          FILTRES
      =================================================== */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4">

        <div className="space-y-4">

          {/* RECHERCHE */}

          <div className="form-control">

            <label className="label py-1">
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
                    event.target.value,
                  )
                }
                placeholder="N° demande, patient, dossier, examen, médecin, service..."
                className="input input-bordered join-item w-full"
              />

            </div>

          </div>

          {/* FILTRES */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">

            {/* STATUT */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Statut
                </span>
              </label>

              <select
                value={
                  statutFilter
                }
                onChange={(event) =>
                  setStatutFilter(
                    event.target.value,
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Tous
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

            </div>

            {/* URGENCE */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Urgence
                </span>
              </label>

              <select
                value={
                  urgenceFilter
                }
                onChange={(event) =>
                  setUrgenceFilter(
                    event.target.value,
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Tous
                </option>

                <option value="URGENT">
                  Urgent
                </option>

                <option value="NORMAL">
                  Normal
                </option>
              </select>

            </div>

            {/* TYPE */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Type d'examen
                </span>
              </label>

              <select
                value={
                  typeFilter
                }
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Tous
                </option>

                {types.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>

            </div>

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
                    event.target.value,
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Tous
                </option>

                {services.map(
                  (service) => (
                    <option
                      key={service.id}
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

            {/* DATE DÉBUT */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Du
                </span>
              </label>

              <input
                type="date"
                value={dateDebut}
                onChange={(event) =>
                  setDateDebut(
                    event.target.value,
                  )
                }
                className="input input-bordered"
              />

            </div>

            {/* DATE FIN */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Au
                </span>
              </label>

              <input
                type="date"
                value={dateFin}
                onChange={(event) =>
                  setDateFin(
                    event.target.value,
                  )
                }
                className="input input-bordered"
              />

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <Filter size={16} />

              <span>
                {demandesFiltrees.length}
                {" "}
                résultat
                {demandesFiltrees.length >
                1
                  ? "s"
                  : ""}
                {" sur "}
                {demandes.length}
              </span>
            </div>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="btn btn-sm btn-outline"
            >
              <RotateCcw size={15} />
              Réinitialiser
            </button>

          </div>

        </div>

      </div>

      {/* ===================================================
          TABLEAU
      =================================================== */}

      <div className="overflow-x-auto">

        <table className="table">

          <thead>

            <tr>
              <th>Numéro</th>
              <th>Patient</th>
              <th>Examen</th>
              <th>Type</th>
              <th>Date demande</th>
              <th>Urgence</th>
              <th>Statut</th>
              <th className="text-right">
                Action
              </th>
            </tr>

          </thead>

          <tbody>

            {demandesFiltrees.map(
              (demande) => (
                <tr
                  key={demande.id}
                  className="hover:bg-base-200/50"
                >

                  <td className="font-bold">
                    {demande.numero ??
                      "—"}
                  </td>

                  <td>

                    <div>

                      <p className="font-medium">
                        {getPatientName(
                          demande.patient,
                        )}
                      </p>

                      <p className="text-xs opacity-60">
                        {demande.patient
                          ?.numeroDossier ??
                          "Sans dossier"}
                      </p>

                    </div>

                  </td>

                  <td>

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        🩻
                      </div>

                      <span>
                        {demande.examen
                          ?.nom ??
                          "Examen"}
                      </span>

                    </div>

                  </td>

                  <td>
                    <span className="badge badge-outline">
                      {demande.examen
                        ?.type ??
                        "—"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap text-sm">
                    {formatDate(
                      demande.dateDemande,
                    )}
                  </td>

                  <td>
                    {demande.urgence ? (
                      <span className="badge badge-error">
                        Urgent
                      </span>
                    ) : (
                      <span className="badge">
                        Normal
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        demande.statut ===
                        "TERMINE"
                          ? "badge-success"
                          : demande.statut ===
                              "EN_COURS"
                            ? "badge-info"
                            : "badge-warning"
                      }`}
                    >
                      {demande.statut ??
                        "DEMANDE"}
                    </span>
                  </td>

                  <td>

                    <div className="flex justify-end">

                      <Link
                        href={`/imagerie/${demande.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <Eye size={16} />
                        Ouvrir
                      </Link>

                    </div>

                  </td>

                </tr>
              ),
            )}

            {demandesFiltrees.length ===
              0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">

                    <Search
                      size={36}
                      className="opacity-20"
                    />

                    <p className="font-medium">
                      Aucune demande trouvée
                    </p>

                    <p className="text-sm opacity-50">
                      Modifiez les critères
                      de recherche.
                    </p>

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
