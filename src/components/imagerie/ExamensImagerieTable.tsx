
"use client";

import {
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

import ExamenImagerieActions from "@/components/imagerie/ExamenImagerieActions";

/* =========================================================
   TYPES
========================================================= */

type ExamenImagerie = {
  id: number;

  code: string;
  nom: string;
  type: string;
  description: string | null;

  prix: number;
  devise: string;
  actif: boolean;

  createdAt: string | Date;

  _count?: {
    demandes?: number;
  };

  demandes?: unknown[];
};

type Props = {
  examens: ExamenImagerie[];
};

/* =========================================================
   COMPOSANT
========================================================= */

export default function ExamensImagerieTable({
  examens,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("TOUS");

  const [deviseFilter, setDeviseFilter] =
    useState("TOUS");

  const [statutFilter, setStatutFilter] =
    useState("TOUS");

  /* =======================================================
     TYPES
  ======================================================= */

  const types = useMemo(() => {
    const values = new Set<string>();

    examens.forEach((examen) => {
      if (examen.type) {
        values.add(examen.type);
      }
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(b, "fr"),
    );
  }, [examens]);

  /* =======================================================
     DEVISES
  ======================================================= */

  const devises = useMemo(() => {
    const values = new Set<string>();

    examens.forEach((examen) => {
      if (examen.devise) {
        values.add(examen.devise);
      }
    });

    return Array.from(values).sort();
  }, [examens]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const examensFiltres =
    useMemo(() => {
      const terme =
        search.trim().toLowerCase();

      return examens.filter(
        (examen) => {
          /* -----------------------------------------------
             RECHERCHE
          ------------------------------------------------ */

          if (terme) {
            const texte = [
              examen.code,
              examen.nom,
              examen.type,
              examen.description,
              examen.devise,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !texte.includes(
                terme,
              )
            ) {
              return false;
            }
          }

          /* -----------------------------------------------
             TYPE
          ------------------------------------------------ */

          if (
            typeFilter !==
              "TOUS" &&
            examen.type !==
              typeFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             DEVISE
          ------------------------------------------------ */

          if (
            deviseFilter !==
              "TOUS" &&
            examen.devise !==
              deviseFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             STATUT
          ------------------------------------------------ */

          if (
            statutFilter ===
              "ACTIF" &&
            !examen.actif
          ) {
            return false;
          }

          if (
            statutFilter ===
              "INACTIF" &&
            examen.actif
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      examens,
      search,
      typeFilter,
      deviseFilter,
      statutFilter,
    ]);

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setTypeFilter("TOUS");
    setDeviseFilter("TOUS");
    setStatutFilter("TOUS");
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
                placeholder="Code, nom, type, description..."
                className="input input-bordered join-item w-full"
              />

            </div>

          </div>

          {/* FILTRES */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* TYPE */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Type
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

            </div>

            {/* DEVISE */}

            <div className="form-control">

              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Devise
                </span>
              </label>

              <select
                value={
                  deviseFilter
                }
                onChange={(event) =>
                  setDeviseFilter(
                    event.target.value,
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Toutes
                </option>

                {devises.map(
                  (devise) => (
                    <option
                      key={devise}
                      value={devise}
                    >
                      {devise}
                    </option>
                  ),
                )}
              </select>

            </div>

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

                <option value="ACTIF">
                  Actifs
                </option>

                <option value="INACTIF">
                  Inactifs
                </option>
              </select>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-sm text-base-content/60">

              <Filter size={16} />

              <span>
                {examensFiltres.length}
                {" "}
                résultat
                {examensFiltres.length >
                1
                  ? "s"
                  : ""}
                {" sur "}
                {examens.length}
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
                size={15}
              />

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
              <th>#</th>
              <th>Code</th>
              <th>Examen</th>
              <th>Type</th>
              <th>Description</th>
              <th>Prix</th>
              <th>Demandes</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th className="text-right">
                Actions
              </th>
            </tr>

          </thead>

          <tbody>

            {examensFiltres.map(
              (
                examen,
                index,
              ) => {
                const demandes =
                  examen._count
                    ?.demandes ??
                  examen.demandes
                    ?.length ??
                  0;

                return (
                  <tr
                    key={examen.id}
                    className="hover:bg-base-200/50"
                  >

                    {/* # */}

                    <td>
                      {index + 1}
                    </td>

                    {/* CODE */}

                    <td>
                      <span className="font-mono text-sm font-semibold">
                        {examen.code}
                      </span>
                    </td>

                    {/* EXAMEN */}

                    <td>
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          🩻
                        </div>

                        <p className="font-semibold">
                          {examen.nom}
                        </p>

                      </div>
                    </td>

                    {/* TYPE */}

                    <td>
                      <span className="badge badge-outline">
                        {examen.type ||
                          "—"}
                      </span>
                    </td>

                    {/* DESCRIPTION */}

                    <td>

                      <div className="max-w-xs">

                        <p
                          className="truncate text-sm text-base-content/70"
                          title={
                            examen.description ??
                            ""
                          }
                        >
                          {examen.description ||
                            "Aucune description"}
                        </p>

                      </div>

                    </td>

                    {/* PRIX */}

                    <td>

                      <span className="font-semibold">
                        {Number(
                          examen.prix ??
                            0,
                        ).toLocaleString(
                          "fr-FR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}{" "}
                        {examen.devise ??
                          "USD"}
                      </span>

                    </td>

                    {/* DEMANDES */}

                    <td>

                      <span className="badge badge-primary">
                        {demandes}
                        {" "}
                        demande
                        {demandes !==
                        1
                          ? "s"
                          : ""}
                      </span>

                    </td>

                    {/* STATUT */}

                    <td>

                      {examen.actif ? (
                        <span className="badge badge-success">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          Inactif
                        </span>
                      )}

                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap">

                      {new Date(
                        examen.createdAt,
                      ).toLocaleDateString(
                        "fr-FR",
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td>
                      <ExamenImagerieActions
                        examen={
                          examen
                        }
                      />
                    </td>

                  </tr>
                );
              },
            )}

            {examensFiltres.length ===
              0 && (
              <tr>

                <td
                  colSpan={10}
                  className="py-12 text-center"
                >

                  <div className="flex flex-col items-center gap-2">

                    <Search
                      size={36}
                      className="opacity-20"
                    />

                    <p className="font-medium">
                      Aucun examen trouvé
                    </p>

                    <p className="text-sm opacity-50">
                      Modifiez les
                      critères de
                      recherche.
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
