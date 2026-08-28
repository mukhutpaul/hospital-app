"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ActionButton from "@/components/hospitalisation/ActionButton";

type Props = {
  items: any[];
};

export default function LitsTable({ items }: Props) {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("TOUS");
  const [service, setService] = useState("TOUS");
  const [chambre, setChambre] = useState("TOUTES");

  // ==========================================================
  // SERVICES UNIQUES
  // ==========================================================

  const services = useMemo(() => {
    const map = new Map<string, string>();

    items.forEach((lit) => {
      const id = lit.chambre?.service?.id;
      const nom = lit.chambre?.service?.nom;

      if (id && nom) {
        map.set(String(id), nom);
      }
    });

    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [items]);

  // ==========================================================
  // CHAMBRES UNIQUES
  // ==========================================================

  const chambres = useMemo(() => {
    const map = new Map<string, string>();

    items.forEach((lit) => {
      const id = lit.chambre?.id;
      const numero = lit.chambre?.numero;

      if (id && numero) {
        map.set(String(id), numero);
      }
    });

    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [items]);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const total = items.length;

  const libres = items.filter(
    (l) => l.statut === "LIBRE"
  ).length;

  const occupes = items.filter(
    (l) =>
      l.statut === "OCCUPE" ||
      l.statut === "OCCUPEE"
  ).length;

  const indisponibles = items.filter(
    (l) =>
      l.statut !== "LIBRE" &&
      l.statut !== "OCCUPE" &&
      l.statut !== "OCCUPEE"
  ).length;

  // ==========================================================
  // RECHERCHE + FILTRES
  // ==========================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((lit) => {
      const patient = lit.hospitalisations?.[0]?.patient;

      const patientName = [
        patient?.nom,
        patient?.postnom,
        patient?.prenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchableText = [
        lit.numero,
        lit.chambre?.numero,
        lit.chambre?.service?.nom,
        patientName,
        lit.statut,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatut =
        statut === "TOUS" ||
        lit.statut === statut;

      const matchesService =
        service === "TOUS" ||
        String(lit.chambre?.service?.id) === service;

      const matchesChambre =
        chambre === "TOUTES" ||
        String(lit.chambre?.id) === chambre;

      return (
        matchesSearch &&
        matchesStatut &&
        matchesService &&
        matchesChambre
      );
    });
  }, [
    items,
    search,
    statut,
    service,
    chambre,
  ]);

  // ==========================================================
  // STATUT
  // ==========================================================

  function getStatusStyle(value: string) {
    switch (value) {
      case "LIBRE":
        return {
          badge: "badge-success",
          bg: "bg-success/10",
          text: "text-success",
          icon: "✓",
        };

      case "OCCUPE":
      case "OCCUPEE":
        return {
          badge: "badge-error",
          bg: "bg-error/10",
          text: "text-error",
          icon: "●",
        };

      case "MAINTENANCE":
        return {
          badge: "badge-warning",
          bg: "bg-warning/10",
          text: "text-warning",
          icon: "⚠",
        };

      default:
        return {
          badge: "badge-ghost",
          bg: "bg-base-200",
          text: "text-base-content/60",
          icon: "•",
        };
    }
  }

  // ==========================================================
  // RESET
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setStatut("TOUS");
    setService("TOUS");
    setChambre("TOUTES");
  }

  const hasFilters =
    search ||
    statut !== "TOUS" ||
    service !== "TOUS" ||
    chambre !== "TOUTES";

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
                Total des lits
              </p>

              <p className="mt-1 text-3xl font-bold">
                {total}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200 text-xl">
              🛏️
            </div>
          </div>
        </div>

        {/* Libres */}
        <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60">
                Lits libres
              </p>

              <p className="mt-1 text-3xl font-bold text-success">
                {libres}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              ✓
            </div>
          </div>
        </div>

        {/* Occupés */}
        <div className="rounded-2xl border border-error/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60">
                Lits occupés
              </p>

              <p className="mt-1 text-3xl font-bold text-error">
                {occupes}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
              ●
            </div>
          </div>
        </div>

        {/* Indisponibles */}
        <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60">
                Indisponibles
              </p>

              <p className="mt-1 text-3xl font-bold text-warning">
                {indisponibles}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
              ⚠
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================
          TABLE + FILTRES
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* Header */}
        <div className="border-b border-base-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Liste des lits
              </h2>

              <p className="text-sm text-base-content/60">
                {filteredItems.length} résultat
                {filteredItems.length !== 1 ? "s" : ""}
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
                placeholder="Rechercher un lit, patient..."
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

          {/* Filtres */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Statut */}
            <select
              className="select select-bordered w-full"
              value={statut}
              onChange={(e) =>
                setStatut(e.target.value)
              }
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="LIBRE">
                Libres
              </option>

              <option value="OCCUPE">
                Occupés
              </option>

              <option value="MAINTENANCE">
                Maintenance
              </option>
            </select>

            {/* Service */}
            <select
              className="select select-bordered w-full"
              value={service}
              onChange={(e) =>
                setService(e.target.value)
              }
            >
              <option value="TOUS">
                Tous les services
              </option>

              {services.map(([id, nom]) => (
                <option key={id} value={id}>
                  {nom}
                </option>
              ))}
            </select>

            {/* Chambre */}
            <select
              className="select select-bordered w-full"
              value={chambre}
              onChange={(e) =>
                setChambre(e.target.value)
              }
            >
              <option value="TOUTES">
                Toutes les chambres
              </option>

              {chambres.map(([id, numero]) => (
                <option key={id} value={id}>
                  Chambre {numero}
                </option>
              ))}
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
            TABLE
        ===================================================== */}

        <div className="overflow-x-auto">

          <table className="table">

            <thead>
              <tr>
                <th>Lit</th>
                <th>Chambre</th>
                <th>Service</th>
                <th>Statut</th>
                <th>Patient actuel</th>
                <th className="text-right">Actions</th>
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
                        Aucun lit trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        Aucun résultat ne correspond aux
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

                filteredItems.map((l) => {

                  const style = getStatusStyle(
                    l.statut
                  );

                  const patient =
                    l.hospitalisations?.[0]?.patient;

                  const patientName = [
                    patient?.nom,
                    patient?.postnom,
                    patient?.prenom,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={l.id}
                      className="hover"
                    >

                      {/* Lit */}
                      <td>
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200">
                            🛏️
                          </div>

                          <div>
                            <p className="font-bold">
                              {l.numero}
                            </p>

                            <p className="text-xs text-base-content/50">
                              ID #{l.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Chambre */}
                      <td>
                        {l.chambre ? (
                          <Link
                            href={`/hospitalisation/chambres/${l.chambre.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            Chambre {l.chambre.numero}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Service */}
                      <td>
                        <span className="text-sm">
                          {l.chambre?.service?.nom ||
                            "—"}
                        </span>
                      </td>

                      {/* Statut */}
                      <td>
                        <span
                          className={`badge ${style.badge} gap-1`}
                        >
                          {style.icon}
                          {l.statut}
                        </span>
                      </td>

                      {/* Patient */}
                      <td>
                        {patientName ? (
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {patientName
                                .charAt(0)
                                .toUpperCase()}
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
                          <span className="text-sm text-base-content/40">
                            Aucun patient
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex justify-end gap-1">

                          <Link
                            className="btn btn-ghost btn-sm"
                            href={`/hospitalisation/lits/${l.id}`}
                          >
                            Voir
                          </Link>

                          <Link
                            className="btn btn-ghost btn-sm"
                            href={`/hospitalisation/lits/${l.id}/modifier`}
                          >
                            Modifier
                          </Link>

                          <ActionButton
                            entity="lit"
                            id={l.id}
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

        {/* Footer */}
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
                lit(s)
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