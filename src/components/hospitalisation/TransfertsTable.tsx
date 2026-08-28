
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ActionButton from "@/components/hospitalisation/ActionButton";

type Props = {
  items: any[];
};

export default function TransfertsTable({
  items,
}: Props) {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("TOUTES");
  const [serviceDestination, setServiceDestination] =
    useState("TOUS");

  // ==========================================================
  // SERVICES DE DESTINATION
  // ==========================================================

  const servicesDestination = useMemo(() => {
    const map = new Map<string, string>();

    items.forEach((transfert) => {
      const id =
        transfert.nouveauService?.id ??
        transfert.nouveauServiceId;

      const nom =
        transfert.nouveauService?.nom;

      if (id && nom) {
        map.set(String(id), nom);
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

  const today = new Date();

  const transfertsAujourdhui = items.filter(
    (transfert) => {
      if (!transfert.dateTransfert) return false;

      const date = new Date(
        transfert.dateTransfert
      );

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }
  ).length;

  const patients = new Set(
    items
      .map(
        (t) =>
          t.hospitalisation?.patient?.id
      )
      .filter(Boolean)
  ).size;

  const destinations = new Set(
    items
      .map(
        (t) =>
          t.nouveauService?.id ??
          t.nouveauServiceId
      )
      .filter(Boolean)
  ).size;

  // ==========================================================
  // FILTRE
  // ==========================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const now = new Date();

    return items.filter((transfert) => {
      const patient =
        transfert.hospitalisation?.patient;

      const patientName = [
        patient?.nom,
        patient?.postnom,
        patient?.prenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const ancienService =
        transfert.ancienService?.nom ??
        `Service ${transfert.ancienServiceId ?? ""}`;

      const nouveauService =
        transfert.nouveauService?.nom ??
        `Service ${transfert.nouveauServiceId ?? ""}`;

      const searchableText = [
        patientName,
        transfert.hospitalisation?.numero,
        ancienService,
        nouveauService,
        transfert.motif,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Recherche
      const matchesSearch =
        !query ||
        searchableText.includes(query);

      // Destination
      const destinationId = String(
        transfert.nouveauService?.id ??
          transfert.nouveauServiceId ??
          ""
      );

      const matchesDestination =
        serviceDestination === "TOUS" ||
        destinationId === serviceDestination;

      // Période
      let matchesPeriode = true;

      if (
        transfert.dateTransfert &&
        periode !== "TOUTES"
      ) {
        const date = new Date(
          transfert.dateTransfert
        );

        if (periode === "AUJOURDHUI") {
          matchesPeriode =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
        }

        if (periode === "7JOURS") {
          const limite = new Date();

          limite.setDate(
            limite.getDate() - 7
          );

          matchesPeriode = date >= limite;
        }

        if (periode === "30JOURS") {
          const limite = new Date();

          limite.setDate(
            limite.getDate() - 30
          );

          matchesPeriode = date >= limite;
        }
      }

      return (
        matchesSearch &&
        matchesDestination &&
        matchesPeriode
      );
    });
  }, [
    items,
    search,
    periode,
    serviceDestination,
  ]);

  // ==========================================================
  // RESET
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setPeriode("TOUTES");
    setServiceDestination("TOUS");
  }

  const hasFilters =
    search ||
    periode !== "TOUTES" ||
    serviceDestination !== "TOUS";

  // ==========================================================
  // DATE
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
  // PATIENT
  // ==========================================================

  function getPatientName(transfert: any) {
    const patient =
      transfert.hospitalisation?.patient;

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
                Total transferts
              </p>

              <p className="mt-1 text-3xl font-bold">
                {total}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
              ⇄
            </div>

          </div>

        </div>

        {/* Aujourd'hui */}
        <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Aujourd'hui
              </p>

              <p className="mt-1 text-3xl font-bold text-success">
                {transfertsAujourdhui}
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

        {/* Destinations */}
        <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Services de destination
              </p>

              <p className="mt-1 text-3xl font-bold text-warning">
                {destinations}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
              🏥
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          REGISTRE
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="border-b border-base-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Registre des transferts
              </h2>

              <p className="text-sm text-base-content/60">
                {filteredItems.length} transfert
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
                placeholder="Patient, service, motif..."
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

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            {/* Destination */}
            <select
              className="select select-bordered w-full"
              value={serviceDestination}
              onChange={(e) =>
                setServiceDestination(
                  e.target.value
                )
              }
            >
              <option value="TOUS">
                Tous les services de destination
              </option>

              {servicesDestination.map(
                ([id, nom]) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {nom}
                  </option>
                )
              )}
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
                <th>Parcours</th>
                <th>Motif</th>
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
                        ⇄
                      </div>

                      <h3 className="font-semibold">
                        Aucun transfert trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        Aucun transfert ne correspond
                        aux critères sélectionnés.
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

                filteredItems.map((t) => {

                  const patientName =
                    getPatientName(t);

                  const patientInitial =
                    patientName
                      ?.charAt(0)
                      ?.toUpperCase() || "?";

                  const ancienService =
                    t.ancienService?.nom ??
                    (t.ancienServiceId
                      ? `Service #${t.ancienServiceId}`
                      : "—");

                  const nouveauService =
                    t.nouveauService?.nom ??
                    (t.nouveauServiceId
                      ? `Service #${t.nouveauServiceId}`
                      : "—");

                  return (
                    <tr
                      key={t.id}
                      className="hover"
                    >

                      {/* Date */}
                      <td>
                        <div>
                          <p className="font-medium">
                            {t.dateTransfert
                              ? formatDate(
                                  t.dateTransfert
                                )
                              : "—"}
                          </p>

                          <p className="text-xs text-base-content/50">
                            Transfert #{t.id}
                          </p>
                        </div>
                      </td>

                      {/* Patient */}
                      <td>

                        {patientName ? (
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {patientInitial}
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

                        {t.hospitalisation ? (
                          <Link
                            href={`/hospitalisation/${t.hospitalisation.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {t.hospitalisation.numero ||
                              `#${t.hospitalisation.id}`}
                          </Link>
                        ) : (
                          "—"
                        )}

                      </td>

                      {/* Parcours */}
                      <td>

                        <div className="min-w-[280px]">

                          <div className="flex items-center gap-2">

                            <span className="max-w-[120px] truncate rounded-lg bg-base-200 px-3 py-1.5 text-xs font-medium">
                              {ancienService}
                            </span>

                            <span className="text-primary">
                              →
                            </span>

                            <span className="max-w-[120px] truncate rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                              {nouveauService}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* Motif */}
                      <td>

                        {t.motif ? (
                          <div
                            className="max-w-xs truncate text-sm"
                            title={t.motif}
                          >
                            {t.motif}
                          </div>
                        ) : (
                          <span className="text-base-content/40">
                            —
                          </span>
                        )}

                      </td>

                      {/* Actions */}
                      <td>

                        <div className="flex justify-end gap-1">

                          <Link
                            href={`/hospitalisation/transferts/${t.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            Voir
                          </Link>

                          <ActionButton
                            entity="transfert"
                            id={t.id}
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
                transfert(s)
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
