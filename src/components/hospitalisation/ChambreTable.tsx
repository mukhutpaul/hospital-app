
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Search,
  X,
  Filter,
  BedDouble,
  Building2,
  Layers3,
  Banknote,
  Plus,
  Users,
} from "lucide-react";

import ActionButton from "@/components/hospitalisation/ActionButton";

/* =========================================================
   TYPES
========================================================= */

type Lit = {
  id: number;
  numero: string;
  statut?: string | null;
};

type Chambre = {
  id: number;
  numero: string;

  type?: string | null;
  etage?: string | null;

  prixJournalier?: number | null;
  devise?: string | null;

  service?: {
    id: number;
    code?: string | null;
    nom?: string | null;
  } | null;

  lits?: Lit[] | null;
};

type Props = {
  items?: Chambre[] | null;
};

/* =========================================================
   UTILITAIRES
========================================================= */

function getLits(chambre: Chambre): Lit[] {
  return Array.isArray(chambre.lits)
    ? chambre.lits
    : [];
}

function formatPrix(
  value: number | null | undefined,
  devise?: string | null,
): string {
  return `${Number(value ?? 0).toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )} ${devise || "USD"}`;
}

function getOccupation(chambre: Chambre) {
  const lits = getLits(chambre);

  const total = lits.length;

  const libres = lits.filter(
    (lit) =>
      !lit.statut ||
      lit.statut === "LIBRE",
  ).length;

  const occupes = Math.max(
    0,
    total - libres,
  );

  return {
    total,
    libres,
    occupes,
  };
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function ChambreTable({
  items,
}: Props) {
  /*
   * Protection importante :
   * même si getChambres() retourne undefined/null,
   * le composant travaillera toujours avec [].
   */
  const chambres: Chambre[] = Array.isArray(
    items,
  )
    ? items
    : [];

  /* =======================================================
     FILTRES
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("TOUS");

  const [etageFilter, setEtageFilter] =
    useState("TOUS");

  const [serviceFilter, setServiceFilter] =
    useState("TOUS");

  const [occupationFilter, setOccupationFilter] =
    useState("TOUS");

  /* =======================================================
     TYPES DISPONIBLES
  ======================================================= */

  const types = useMemo(() => {
    return Array.from(
      new Set(
        chambres
          .map((chambre) =>
            chambre.type?.trim(),
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
  }, [chambres]);

  /* =======================================================
     ÉTAGES DISPONIBLES
  ======================================================= */

  const etages = useMemo(() => {
    return Array.from(
      new Set(
        chambres
          .map((chambre) =>
            chambre.etage?.trim(),
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare("fr", {
        numeric: true,
      }),
    );
  }, [chambres]);

  /* =======================================================
     SERVICES DISPONIBLES
  ======================================================= */

  const services = useMemo(() => {
    const map = new Map<
      number,
      string
    >();

    chambres.forEach((chambre) => {
      const service =
        chambre.service;

      if (
        service &&
        Number.isInteger(service.id) &&
        service.nom
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
  }, [chambres]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const statistiques =
    useMemo(() => {
      let totalLits = 0;
      let litsLibres = 0;
      let litsOccupes = 0;

      chambres.forEach(
        (chambre) => {
          const occupation =
            getOccupation(
              chambre,
            );

          totalLits +=
            occupation.total;

          litsLibres +=
            occupation.libres;

          litsOccupes +=
            occupation.occupes;
        },
      );

      return {
        chambres:
          chambres.length,
        lits: totalLits,
        libres: litsLibres,
        occupes: litsOccupes,
      };
    }, [chambres]);

  /* =======================================================
     RECHERCHE + FILTRES
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const terme =
        search
          .trim()
          .toLowerCase();

      return chambres.filter(
        (chambre) => {
          /* -----------------------------------------------
             TYPE
          ----------------------------------------------- */

          if (
            typeFilter !==
              "TOUS" &&
            chambre.type !==
              typeFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             ÉTAGE
          ----------------------------------------------- */

          if (
            etageFilter !==
              "TOUS" &&
            chambre.etage !==
              etageFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             SERVICE
          ----------------------------------------------- */

          if (
            serviceFilter !==
              "TOUS"
          ) {
            if (
              String(
                chambre.service
                  ?.id ?? "",
              ) !==
                serviceFilter
            ) {
              return false;
            }
          }

          /* -----------------------------------------------
             OCCUPATION
          ----------------------------------------------- */

          if (
            occupationFilter !==
            "TOUS"
          ) {
            const {
              total,
              libres,
              occupes,
            } =
              getOccupation(
                chambre,
              );

            if (
              occupationFilter ===
                "DISPONIBLE" &&
              (total === 0 ||
                libres === 0)
            ) {
              return false;
            }

            if (
              occupationFilter ===
                "LIBRE" &&
              libres <= 0
            ) {
              return false;
            }

            if (
              occupationFilter ===
                "COMPLETE" &&
              (total === 0 ||
                occupes !==
                  total)
            ) {
              return false;
            }

            if (
              occupationFilter ===
                "PARTIELLE" &&
              (total === 0 ||
                occupes <= 0 ||
                occupes >= total)
            ) {
              return false;
            }
          }

          /* -----------------------------------------------
             RECHERCHE
          ----------------------------------------------- */

          if (!terme) {
            return true;
          }

          const litsTexte =
            getLits(chambre)
              .map(
                (lit) =>
                  `${lit.numero} ${lit.statut ?? ""}`,
              )
              .join(" ");

          const contenu = [
            chambre.numero,
            chambre.type,
            chambre.etage,
            chambre.service?.nom,
            chambre.service?.code,
            litsTexte,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return contenu.includes(
            terme,
          );
        },
      );
    }, [
      chambres,
      search,
      typeFilter,
      etageFilter,
      serviceFilter,
      occupationFilter,
    ]);

  /* =======================================================
     FILTRES ACTIFS
  ======================================================= */

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "TOUS" ||
    etageFilter !== "TOUS" ||
    serviceFilter !== "TOUS" ||
    occupationFilter !==
      "TOUS";

  function resetFilters() {
    setSearch("");
    setTypeFilter("TOUS");
    setEtageFilter("TOUS");
    setServiceFilter("TOUS");
    setOccupationFilter(
      "TOUS",
    );
  }

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          EN-TÊTE
      =================================================== */}
{/* 
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Chambres
          </h1>

          <p className="mt-1 text-sm text-base-content/60">
            Gestion des chambres,
            lits, services et tarifs
            d'hospitalisation.
          </p>
        </div>

        <Link
          href="/hospitalisation/chambres/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouvelle chambre
        </Link>

      </div> */}

      {/* ===================================================
          STATISTIQUES
      =================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Chambres"
          value={
            statistiques.chambres
          }
          description="Chambres enregistrées"
          icon={
            <BedDouble
              size={21}
            />
          }
          color="primary"
        />

        <StatCard
          title="Lits"
          value={
            statistiques.lits
          }
          description="Capacité totale"
          icon={
            <Building2
              size={21}
            />
          }
          color="info"
        />

        <StatCard
          title="Lits libres"
          value={
            statistiques.libres
          }
          description="Disponibles"
          icon={
            <BedDouble
              size={21}
            />
          }
          color="success"
        />

        <StatCard
          title="Lits occupés"
          value={
            statistiques.occupes
          }
          description="Actuellement occupés"
          icon={
            <Users
              size={21}
            />
          }
          color="warning"
        />

      </div>

      {/* ===================================================
          RECHERCHE / FILTRES
      =================================================== */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter size={18} />
          </div>

          <div>
            <h2 className="font-semibold">
              Recherche et filtres
            </h2>

            <p className="text-xs text-base-content/60">
              Rechercher une chambre,
              un lit, un service ou
              filtrer par occupation.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(250px,1fr)_180px_160px_220px_180px_auto]">

          {/* RECHERCHE */}

          <div className="relative">

            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              className="input input-bordered h-11 w-full pl-10 pr-10"
              placeholder="Chambre, lit, service, étage..."
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error"
                aria-label="Effacer la recherche"
              >
                <X
                  size={17}
                />
              </button>
            )}

          </div>

          {/* TYPE */}

          <select
            value={
              typeFilter
            }
            onChange={(
              event,
            ) =>
              setTypeFilter(
                event.target
                  .value,
              )
            }
            className="select select-bordered h-11 w-full"
          >
            <option value="TOUS">
              Tous les types
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

          {/* ÉTAGE */}

          <select
            value={
              etageFilter
            }
            onChange={(
              event,
            ) =>
              setEtageFilter(
                event.target
                  .value,
              )
            }
            className="select select-bordered h-11 w-full"
          >
            <option value="TOUS">
              Tous les étages
            </option>

            {etages.map(
              (etage) => (
                <option
                  key={etage}
                  value={etage}
                >
                  Étage {etage}
                </option>
              ),
            )}
          </select>

          {/* SERVICE */}

          <select
            value={
              serviceFilter
            }
            onChange={(
              event,
            ) =>
              setServiceFilter(
                event.target
                  .value,
              )
            }
            className="select select-bordered h-11 w-full"
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

          {/* OCCUPATION */}

          <select
            value={
              occupationFilter
            }
            onChange={(
              event,
            ) =>
              setOccupationFilter(
                event.target
                  .value,
              )
            }
            className="select select-bordered h-11 w-full"
          >
            <option value="TOUS">
              Toutes occupations
            </option>

            <option value="DISPONIBLE">
              Disponible
            </option>

            <option value="LIBRE">
              Avec lits libres
            </option>

            <option value="PARTIELLE">
              Partiellement occupée
            </option>

            <option value="COMPLETE">
              Complète
            </option>
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
            Réinitialiser
          </button>

        </div>

        {/* RÉSULTATS */}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-base-200 pt-3">

          <p className="text-sm text-base-content/60">

            <span className="font-bold text-base-content">
              {
                filteredItems.length
              }
            </span>{" "}

            résultat
            {
              filteredItems.length !==
              1
                ? "s"
                : ""
            }

            {" sur "}

            <span className="font-bold text-base-content">
              {
                chambres.length
              }
            </span>

            {" chambre"}

            {
              chambres.length !==
              1
                ? "s"
                : ""
            }

          </p>

          {hasFilters && (
            <span className="badge badge-primary">
              Filtres actifs
            </span>
          )}

        </div>

      </div>

      {/* ===================================================
          AUCUN RÉSULTAT
      =================================================== */}

      {filteredItems.length ===
      0 ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-14 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-base-content/40">
            <Search size={28} />
          </div>

          <h2 className="mt-4 text-xl font-bold">
            {chambres.length ===
            0
              ? "Aucune chambre"
              : "Aucun résultat"}
          </h2>

          <p className="mt-2 text-sm text-base-content/60">
            {chambres.length ===
            0
              ? "Aucune chambre n'est encore enregistrée."
              : "Aucune chambre ne correspond aux critères sélectionnés."}
          </p>

          {chambres.length ===
          0 ? (
            <Link
              href="/hospitalisation/chambres/nouveau"
              className="btn btn-primary mt-6"
            >
              <Plus size={18} />
              Ajouter une chambre
            </Link>
          ) : (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="btn btn-outline mt-6"
            >
              Effacer les filtres
            </button>
          )}

        </div>
      ) : (

        /* =================================================
           TABLEAU
        ================================================= */

        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <table className="table">

            <thead>
              <tr>

                <th>
                  Chambre
                </th>

                <th>
                  Type
                </th>

                <th>
                  Étage
                </th>

                <th>
                  Service
                </th>

                <th>
                  Lits
                </th>

                <th>
                  Prix journalier
                </th>

                <th>
                  Occupation
                </th>

                <th className="text-right">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredItems.map(
                (chambre) => {
                  const {
                    total,
                    libres,
                    occupes,
                  } =
                    getOccupation(
                      chambre,
                    );

                  return (
                    <tr
                      key={
                        chambre.id
                      }
                      className="transition-colors hover:bg-base-200/50"
                    >

                      {/* CHAMBRE */}

                      <td>

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <BedDouble
                              size={
                                19
                              }
                            />
                          </div>

                          <div>

                            <p className="font-bold">
                              {
                                chambre.numero
                              }
                            </p>

                            <p className="text-xs text-base-content/50">
                              ID #
                              {
                                chambre.id
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* TYPE */}

                      <td>

                        <span className="badge badge-outline">
                          {
                            chambre.type ||
                            "Non défini"
                          }
                        </span>

                      </td>

                      {/* ÉTAGE */}

                      <td>

                        <div className="flex items-center gap-2">

                          <Layers3
                            size={
                              16
                            }
                            className="text-info"
                          />

                          <span>
                            {
                              chambre.etage
                                ? `Étage ${chambre.etage}`
                                : "—"
                            }
                          </span>

                        </div>

                      </td>

                      {/* SERVICE */}

                      <td>

                        {chambre.service ? (
                          <div>

                            <p className="font-medium">
                              {
                                chambre.service
                                  .nom
                              }
                            </p>

                            {chambre.service
                              .code && (
                              <p className="text-xs text-base-content/50">
                                {
                                  chambre.service
                                    .code
                                }
                              </p>
                            )}

                          </div>
                        ) : (
                          <span className="text-base-content/40">
                            Aucun service
                          </span>
                        )}

                      </td>

                      {/* LITS */}

                      <td>

                        <div>

                          <span className="badge badge-info">

                            {
                              total
                            }{" "}

                            lit
                            {
                              total !==
                              1
                                ? "s"
                                : ""
                            }

                          </span>

                          {total >
                            0 && (
                            <p className="mt-1 text-xs text-base-content/50">

                              {
                                libres
                              }{" "}
                              libre
                              {
                                libres !==
                                1
                                  ? "s"
                                  : ""
                              }

                              {" • "}

                              {
                                occupes
                              }{" "}
                              occupé
                              {
                                occupes !==
                                1
                                  ? "s"
                                  : ""
                              }

                            </p>
                          )}

                        </div>

                      </td>

                      {/* PRIX */}

                      <td>

                        <div className="flex items-center gap-2">

                          <Banknote
                            size={
                              16
                            }
                            className="text-success"
                          />

                          <span className="font-semibold">
                            {formatPrix(
                              chambre.prixJournalier,
                              chambre.devise,
                            )}
                          </span>

                        </div>

                        <p className="text-xs text-base-content/50">
                          par jour
                        </p>

                      </td>

                      {/* OCCUPATION */}

                      <td>

                        {total ===
                        0 ? (
                          <span className="badge badge-ghost">
                            Aucun lit
                          </span>
                        ) : occupes ===
                          0 ? (
                          <span className="badge badge-success">
                            Disponible
                          </span>
                        ) : occupes ===
                          total ? (
                          <span className="badge badge-error">
                            Complète
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            Partielle
                          </span>
                        )}

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="flex justify-end gap-1">

                          <Link
                            href={`/hospitalisation/chambres/${chambre.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            Voir
                          </Link>

                          <Link
                            href={`/hospitalisation/chambres/${chambre.id}/modifier`}
                            className="btn btn-outline btn-sm"
                          >
                            Modifier
                          </Link>

                          <ActionButton
                            entity="chambre"
                            id={
                              chambre.id
                            }
                          />

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color:
    | "primary"
    | "info"
    | "success"
    | "warning";
}) {
  const styles = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/10",
    },

    info: {
      text: "text-info",
      bg: "bg-info/10",
    },

    success: {
      text: "text-success",
      bg: "bg-success/10",
    },

    warning: {
      text: "text-warning",
      bg: "bg-warning/10",
    },
  };

  const style =
    styles[color];

  return (
    <div className="stat rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      <div
        className={`stat-figure ${style.text}`}
      >
        <div
          className={`rounded-xl p-3 ${style.bg}`}
        >
          {icon}
        </div>
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div
        className={`stat-value ${style.text}`}
      >
        {value.toLocaleString(
          "fr-FR",
        )}
      </div>

      <div className="stat-desc">
        {description}
      </div>

    </div>
  );
}
