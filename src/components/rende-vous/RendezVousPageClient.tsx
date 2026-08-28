"use client";

import { useMemo, useState } from "react";

import {
  Filter,
  Search,
  SlidersHorizontal,
  RotateCcw,
  CalendarDays,
  Users,
} from "lucide-react";

import RendezVousStats from "./RendezVousStats";
import RendezVousTable from "./RendezVousTable";

type RendezVous = {
  id: number;
  numero: string;

  patient: {
    id: number;
    numeroDossier: string;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    telephone: string | null;
  };

  medecin: {
    id: number;
    matricule: string;
    nom: string;
    postNom: string | null;
    prenom: string;
  } | null;

  specialite: {
    id: number;
    code: string;
    nom: string;
  } | null;

  service: {
    id: number;
    code: string;
    nom: string;
  } | null;

  dateHeure: Date | string;

  motif: string | null;

  statut: string;

  observation: string | null;

  admission: {
    id: number;
    numero: string;
    statut: string;
  } | null;
};

type Props = {
  rendezVous: RendezVous[];
};

function getFullName(
  personne: {
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
  } | null,
) {
  if (!personne) return "";

  return [
    personne.nom,
    personne.postNom,
    personne.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function getDateInputValue(
  value: Date | string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

export default function RendezVousPageClient({
  rendezVous,
}: Props) {
  /* ==========================================================
     STATES
  ========================================================== */

  const [search, setSearch] =
    useState("");

  const [statut, setStatut] =
    useState("ALL");

  const [service, setService] =
    useState("ALL");

  const [specialite, setSpecialite] =
    useState("ALL");

  const [medecin, setMedecin] =
    useState("ALL");

  const [date, setDate] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  /* ==========================================================
     OPTIONS
  ========================================================== */

  const services = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        nom: string;
      }
    >();

    rendezVous.forEach((rdv) => {
      if (rdv.service) {
        map.set(
          rdv.service.id,
          {
            id: rdv.service.id,
            nom: rdv.service.nom,
          },
        );
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        a.nom.localeCompare(b.nom),
    );
  }, [rendezVous]);

  const specialites = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        nom: string;
      }
    >();

    rendezVous.forEach((rdv) => {
      if (rdv.specialite) {
        map.set(
          rdv.specialite.id,
          {
            id: rdv.specialite.id,
            nom: rdv.specialite.nom,
          },
        );
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        a.nom.localeCompare(b.nom),
    );
  }, [rendezVous]);

  const medecins = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        nom: string;
      }
    >();

    rendezVous.forEach((rdv) => {
      if (rdv.medecin) {
        map.set(
          rdv.medecin.id,
          {
            id: rdv.medecin.id,
            nom: getFullName(
              rdv.medecin,
            ),
          },
        );
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        a.nom.localeCompare(b.nom),
    );
  }, [rendezVous]);

  const statuts = useMemo(() => {
    return Array.from(
      new Set(
        rendezVous.map(
          (rdv) => rdv.statut,
        ),
      ),
    ).sort();
  }, [rendezVous]);

  /* ==========================================================
     FILTERED DATA
  ========================================================== */

  const filtered = useMemo(() => {
    const term =
      search
        .trim()
        .toLowerCase();

    return rendezVous.filter((rdv) => {
      const patientName =
        getFullName(rdv.patient)
          .toLowerCase();

      const medecinName =
        getFullName(rdv.medecin)
          .toLowerCase();

      const matchesSearch =
        !term ||

        rdv.numero
          .toLowerCase()
          .includes(term) ||

        rdv.patient.numeroDossier
          .toLowerCase()
          .includes(term) ||

        patientName.includes(term) ||

        medecinName.includes(term) ||

        (rdv.service?.nom || "")
          .toLowerCase()
          .includes(term) ||

        (rdv.specialite?.nom || "")
          .toLowerCase()
          .includes(term) ||

        (rdv.motif || "")
          .toLowerCase()
          .includes(term);

      const matchesStatut =
        statut === "ALL" ||
        rdv.statut === statut;

      const matchesService =
        service === "ALL" ||
        String(rdv.service?.id) === service;

      const matchesSpecialite =
        specialite === "ALL" ||
        String(rdv.specialite?.id) === specialite;

      const matchesMedecin =
        medecin === "ALL" ||
        String(rdv.medecin?.id) === medecin;

      const matchesDate =
        !date ||
        getDateInputValue(
          rdv.dateHeure,
        ) === date;

      return (
        matchesSearch &&
        matchesStatut &&
        matchesService &&
        matchesSpecialite &&
        matchesMedecin &&
        matchesDate
      );
    });
  }, [
    rendezVous,
    search,
    statut,
    service,
    specialite,
    medecin,
    date,
  ]);

  /* ==========================================================
     ACTIVE FILTERS
  ========================================================== */

  const activeFilters =
    [
      statut !== "ALL",
      service !== "ALL",
      specialite !== "ALL",
      medecin !== "ALL",
      Boolean(date),
    ].filter(Boolean).length;

  const hasFilters =
    Boolean(search) ||
    activeFilters > 0;

  /* ==========================================================
     RESET
  ========================================================== */

  function resetFilters() {
    setSearch("");
    setStatut("ALL");
    setService("ALL");
    setSpecialite("ALL");
    setMedecin("ALL");
    setDate("");
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================
          STATISTIQUES
      ====================================================== */}

      <RendezVousStats
        rendezVous={rendezVous}
      />

      {/* ======================================================
          RECHERCHE + ACTIONS
      ====================================================== */}

      <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">

        <div className="p-4 md:p-5">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* RECHERCHE */}

            <label className="input input-bordered flex items-center gap-3 w-full lg:flex-1">

              <Search
                size={20}
                className="text-base-content/50"
              />

              <input
                type="text"
                className="grow"
                placeholder="Rechercher un patient, médecin, numéro..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />

            </label>

            {/* BOUTON FILTRES */}

            <button
              type="button"
              className={`btn ${
                showFilters
                  ? "btn-primary"
                  : "btn-outline"
              }`}
              onClick={() =>
                setShowFilters(
                  (value) => !value,
                )
              }
            >

              <SlidersHorizontal
                size={18}
              />

              Filtres

              {activeFilters > 0 && (
                <span className="badge badge-sm badge-neutral">
                  {activeFilters}
                </span>
              )}

            </button>

            {/* RESET */}

            {hasFilters && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetFilters}
              >

                <RotateCcw
                  size={18}
                />

                Réinitialiser

              </button>
            )}

          </div>

        </div>

        {/* ====================================================
            PANNEAU FILTRES
        ==================================================== */}

        {showFilters && (

          <div className="border-t border-base-200 bg-base-200/40 p-4 md:p-5">

            <div className="flex items-center gap-2 mb-4">

              <Filter
                size={18}
                className="text-primary"
              />

              <h3 className="font-semibold">
                Filtres avancés
              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

              {/* STATUT */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text">
                    Statut
                  </span>
                </label>

                <select
                  className="select select-bordered w-full"
                  value={statut}
                  onChange={(event) =>
                    setStatut(
                      event.target.value,
                    )
                  }
                >

                  <option value="ALL">
                    Tous les statuts
                  </option>

                  {statuts.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* SERVICE */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text">
                    Service
                  </span>
                </label>

                <select
                  className="select select-bordered w-full"
                  value={service}
                  onChange={(event) =>
                    setService(
                      event.target.value,
                    )
                  }
                >

                  <option value="ALL">
                    Tous les services
                  </option>

                  {services.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nom}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* SPÉCIALITÉ */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text">
                    Spécialité
                  </span>
                </label>

                <select
                  className="select select-bordered w-full"
                  value={specialite}
                  onChange={(event) =>
                    setSpecialite(
                      event.target.value,
                    )
                  }
                >

                  <option value="ALL">
                    Toutes les spécialités
                  </option>

                  {specialites.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nom}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* MÉDECIN */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text">
                    Médecin
                  </span>
                </label>

                <select
                  className="select select-bordered w-full"
                  value={medecin}
                  onChange={(event) =>
                    setMedecin(
                      event.target.value,
                    )
                  }
                >

                  <option value="ALL">
                    Tous les médecins
                  </option>

                  {medecins.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nom}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* DATE */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text">
                    Date du rendez-vous
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <CalendarDays
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="date"
                    className="grow"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value,
                      )
                    }
                  />

                </label>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* ======================================================
          INFORMATIONS RESULTATS
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">

            <Users size={19} />

          </div>

          <div>

            <p className="font-semibold">

              {filtered.length} rendez-vous trouvé
              {filtered.length !== 1
                ? "s"
                : ""}

            </p>

            <p className="text-xs text-base-content/50">

              sur {rendezVous.length} rendez-vous enregistrés

            </p>

          </div>

        </div>

        {hasFilters && (

          <span className="badge badge-outline badge-primary gap-2">

            <Filter size={14} />

            {activeFilters}
            {" "}
            filtre
            {activeFilters > 1
              ? "s"
              : ""}
            {" "}
            actif
            {activeFilters > 1
              ? "s"
              : ""}

          </span>

        )}

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      {filtered.length > 0 ? (

        <RendezVousTable
          rendezVous={filtered}
        />

      ) : (

        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 py-16 text-center">

          <div className="mx-auto mb-4 flex w-16 h-16 items-center justify-center rounded-2xl bg-base-200">

            <CalendarDays
              size={30}
              className="text-base-content/40"
            />

          </div>

          <h3 className="font-semibold text-lg">
            Aucun rendez-vous trouvé
          </h3>

          <p className="text-sm text-base-content/60 mt-2">

            Essayez de modifier vos critères
            de recherche ou vos filtres.

          </p>

          {hasFilters && (

            <button
              type="button"
              className="btn btn-primary btn-sm mt-5"
              onClick={resetFilters}
            >

              <RotateCcw size={16} />

              Réinitialiser les filtres

            </button>

          )}

        </div>

      )}

    </div>
  );
}