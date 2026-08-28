"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ActionButton from "@/components/hospitalisation/ActionButton";

type Props = {
  items: any[];
};

export default function SoinsTable({ items }: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("TOUS");
  const [periode, setPeriode] = useState("TOUTES");

  // ==========================================================
  // TYPES DE SOINS
  // ==========================================================

  const types = useMemo(() => {
    const values = new Set<string>();

    items.forEach((soin) => {
      if (soin.type) {
        values.add(String(soin.type));
      }
    });

    return Array.from(values).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [items]);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const total = items.length;

  const today = new Date();

  const soinsAujourdhui = items.filter((soin) => {
    if (!soin.dateSoin) return false;

    const date = new Date(soin.dateSoin);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  const patients = new Set(
    items
      .map(
        (s) => s.hospitalisation?.patient?.id
      )
      .filter(Boolean)
  ).size;

  const typesUtilises = new Set(
    items
      .map((s) => s.type)
      .filter(Boolean)
  ).size;

  // ==========================================================
  // FILTRAGE
  // ==========================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const now = new Date();

    return items.filter((soin) => {
      const patient =
        soin.hospitalisation?.patient;

      const patientName = [
        patient?.nom,
        patient?.postnom,
        patient?.prenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchableText = [
        soin.type,
        soin.description,
        soin.hospitalisation?.numero,
        patientName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Recherche
      const matchesSearch =
        !query ||
        searchableText.includes(query);

      // Type
      const matchesType =
        type === "TOUS" ||
        soin.type === type;

      // Période
      let matchesPeriode = true;

      if (soin.dateSoin && periode !== "TOUTES") {
        const date = new Date(soin.dateSoin);

        if (periode === "AUJOURDHUI") {
          matchesPeriode =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        }

        if (periode === "7JOURS") {
          const limite = new Date();
          limite.setDate(limite.getDate() - 7);

          matchesPeriode = date >= limite;
        }

        if (periode === "30JOURS") {
          const limite = new Date();
          limite.setDate(limite.getDate() - 30);

          matchesPeriode = date >= limite;
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesPeriode
      );
    });
  }, [
    items,
    search,
    type,
    periode,
  ]);

  // ==========================================================
  // RESET
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setType("TOUS");
    setPeriode("TOUTES");
  }

  const hasFilters =
    search ||
    type !== "TOUS" ||
    periode !== "TOUTES";

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  }

  // ==========================================================
  // NOM PATIENT
  // ==========================================================

  function getPatientName(soin: any) {
    const patient =
      soin.hospitalisation?.patient;

    return [
      patient?.nom,
      patient?.postnom,
      patient?.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="space-y-5">

      {/* ======================================================
          STATISTIQUES
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Total des soins
              </p>

              <p className="mt-1 text-3xl font-bold">
                {total}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
              🩺
            </div>

          </div>
        </div>

        {/* Aujourd'hui */}
        <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Soins aujourd'hui
              </p>

              <p className="mt-1 text-3xl font-bold text-success">
                {soinsAujourdhui}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              ✓
            </div>

          </div>
        </div>

        {/* Patients */}
        <div className="rounded-2xl border border-info/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Patients concernés
              </p>

              <p className="mt-1 text-3xl font-bold text-info">
                {patients}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
              👤
            </div>

          </div>
        </div>

        {/* Types */}
        <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Types de soins
              </p>

              <p className="mt-1 text-3xl font-bold text-warning">
                {typesUtilises}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
              📋
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* ====================================================
            HEADER + RECHERCHE
        ===================================================== */}

        <div className="border-b border-base-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Registre des soins
              </h2>

              <p className="text-sm text-base-content/60">
                {filteredItems.length} soin
                {filteredItems.length !== 1
                  ? "s"
                  : ""}{" "}
                trouvé
                {filteredItems.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {/* Recherche */}
            <label className="input input-bordered flex w-full items-center gap-2 lg:max-w-md">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-5 w-5 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                type="search"
                placeholder="Patient, hospitalisation, type..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              )}

            </label>

          </div>

          {/* ==================================================
              FILTRES
          =================================================== */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Type */}
            <select
              className="select select-bordered w-full"
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
            >
              <option value="TOUS">
                Tous les types
              </option>

              {types.map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ))}
            </select>

            {/* Période */}
            <select
              className="select select-bordered w-full"
              value={periode}
              onChange={(e) =>
                setPeriode(e.target.value)
              }
            >
              <option value="TOUTES">
                Toutes les périodes
              </option>

              <option value="AUJOURDHUI">
                Aujourd'hui
              </option>

              <option value="7JOURS">
                7 derniers jours
              </option>

              <option value="30JOURS">
                30 derniers jours
              </option>
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="btn btn-outline"
            >
              ↻ Réinitialiser
            </button>

          </div>

        </div>

        {/* ====================================================
            TABLEAU
        ===================================================== */}

        <div className="overflow-x-auto">

          <table className="table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Hospitalisation</th>
                <th>Type</th>
                <th>Description</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-3xl">
                        🔍
                      </div>

                      <h3 className="font-semibold">
                        Aucun soin trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        Aucun soin ne correspond aux
                        critères sélectionnés.
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="btn btn-primary btn-sm mt-4"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}

                    </div>
                  </td>
                </tr>

              ) : (

                filteredItems.map((s) => {

                  const patientName =
                    getPatientName(s);

                  const initial =
                    patientName
                      ?.charAt(0)
                      ?.toUpperCase() || "?";

                  return (
                    <tr
                      key={s.id}
                      className="hover"
                    >

                      {/* Date */}
                      <td>
                        <div>
                          <p className="font-medium">
                            {s.dateSoin
                              ? formatDate(
                                  s.dateSoin
                                )
                              : "—"}
                          </p>

                          <p className="text-xs text-base-content/50">
                            Soin #{s.id}
                          </p>
                        </div>
                      </td>

                      {/* Patient */}
                      <td>

                        {patientName ? (
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {initial}
                            </div>

                            <div>
                              <p className="font-medium">
                                {patientName}
                              </p>

                              <p className="text-xs text-base-content/50">
                                Patient hospitalisé
                              </p>
                            </div>

                          </div>
                        ) : (
                          <span className="text-base-content/40">
                            —
                          </span>
                        )}

                      </td>

                      {/* Hospitalisation */}
                      <td>

                        {s.hospitalisation ? (
                          <Link
                            href={`/hospitalisation/${s.hospitalisation.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {s.hospitalisation.numero ||
                              `#${s.hospitalisation.id}`}
                          </Link>
                        ) : (
                          "—"
                        )}

                      </td>

                      {/* Type */}
                      <td>
                        <span className="badge badge-primary badge-outline">
                          {s.type || "—"}
                        </span>
                      </td>

                      {/* Description */}
                      <td>
                        <div
                          className="max-w-xs truncate text-sm"
                          title={s.description || ""}
                        >
                          {s.description || "—"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex justify-end gap-1">

                          <Link
                            href={`/hospitalisation/soins/${s.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            Voir
                          </Link>

                          <Link
                            className="btn btn-ghost btn-sm"
                            href={`/hospitalisation/soins/${s.id}/modifier`}
                          >
                            Modifier
                          </Link>

                          <ActionButton
                            entity="soin"
                            id={s.id}
                          />

                        </div>
                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        {filteredItems.length > 0 && (
          <div className="border-t border-base-200 px-5 py-4">

            <div className="flex flex-col gap-2 text-sm text-base-content/60 sm:flex-row sm:items-center sm:justify-between">

              <span>
                Affichage de{" "}
                <strong className="text-base-content">
                  {filteredItems.length}
                </strong>{" "}
                sur{" "}
                <strong className="text-base-content">
                  {total}
                </strong>{" "}
                soin(s)
              </span>

              {hasFilters && (
                <span className="badge badge-outline">
                  Filtres actifs
                </span>
              )}

            </div>

          </div>
        )}

      </section>
    </div>
  );
}