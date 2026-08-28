"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
Eye,
Stethoscope,
UserRound,
CalendarDays,
FlaskConical,
Pill,
Search,
SlidersHorizontal,
RotateCcw,
X,
ClipboardList,
UserCog,
Building2,
FileText,
ChevronDown,
} from "lucide-react";

import ConsultationActions from "./ConsultationActions";

type Props = {
consultations: any[];
};

export default function ConsultationTable({
consultations,
}: Props) {
/* =========================================================
ÉTATS DES FILTRES
========================================================= */

const [search, setSearch] = useState("");
const [patientSearch, setPatientSearch] = useState("");
const [medecinFilter, setMedecinFilter] = useState("");
const [serviceFilter, setServiceFilter] = useState("");
const [dateFilter, setDateFilter] = useState("");
const [associationFilter, setAssociationFilter] = useState("all");

const [showFilters, setShowFilters] = useState(false);

/* =========================================================
LISTES UNIQUES POUR LES FILTRES
========================================================= */

const medecins = useMemo(() => {
const map = new Map<string, any>();


consultations.forEach((consultation) => {
  const medecin = consultation.medecin;

  if (medecin) {
    const id =
      medecin.id ??
      medecin.idMedecin ??
      medecin.matricule ??
      `${medecin.nom}-${medecin.prenom}`;

    if (!map.has(String(id))) {
      map.set(String(id), medecin);
    }
  }
});

return Array.from(map.values()).sort((a, b) =>
  `${a.nom ?? ""} ${a.prenom ?? ""}`.localeCompare(
    `${b.nom ?? ""} ${b.prenom ?? ""}`,
    "fr",
  ),
);


}, [consultations]);

const services = useMemo(() => {
const map = new Map<string, any>();


consultations.forEach((consultation) => {
  const service = consultation.service;

  if (service) {
    const id =
      service.id ??
      service.idService ??
      service.code ??
      service.nom;

    if (!map.has(String(id))) {
      map.set(String(id), service);
    }
  }
});

return Array.from(map.values()).sort((a, b) =>
  `${a.nom ?? ""}`.localeCompare(
    `${b.nom ?? ""}`,
    "fr",
  ),
);


}, [consultations]);

/* =========================================================
FILTRAGE
========================================================= */

const consultationsFiltrees = useMemo(() => {
const recherche = search.trim().toLowerCase();
const recherchePatient =
patientSearch.trim().toLowerCase();


return consultations.filter((consultation) => {
  const patient = consultation.patient;
  const medecin = consultation.medecin;
  const service = consultation.service;

  const nomPatient = [
    patient?.nom,
    patient?.postNom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const nomMedecin = [
    medecin?.nom,
    medecin?.postNom,
    medecin?.prenom,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const nomService =
    service?.nom?.toLowerCase() ?? "";

  const numeroDossier =
    patient?.numeroDossier
      ?.toString()
      .toLowerCase() ?? "";

  const matricule =
    medecin?.matricule
      ?.toString()
      .toLowerCase() ?? "";

  const motif =
    consultation.motif
      ?.toString()
      .toLowerCase() ?? "";

  const diagnostic =
    consultation.diagnostic
      ?.toString()
      .toLowerCase() ?? "";

  /* ---------------------------------------------
     RECHERCHE GLOBALE
  --------------------------------------------- */

  const correspondRecherche =
    !recherche ||
    nomPatient.includes(recherche) ||
    nomMedecin.includes(recherche) ||
    nomService.includes(recherche) ||
    numeroDossier.includes(recherche) ||
    matricule.includes(recherche) ||
    motif.includes(recherche) ||
    diagnostic.includes(recherche) ||
    String(
      consultation.idConsultation,
    ).includes(recherche);

  if (!correspondRecherche) {
    return false;
  }

  /* ---------------------------------------------
     RECHERCHE PATIENT
  --------------------------------------------- */

  const correspondPatient =
    !recherchePatient ||
    nomPatient.includes(recherchePatient) ||
    numeroDossier.includes(recherchePatient);

  if (!correspondPatient) {
    return false;
  }

  /* ---------------------------------------------
     FILTRE MÉDECIN
  --------------------------------------------- */

  if (medecinFilter) {
    const medecinId = String(
      medecin?.id ??
        medecin?.idMedecin ??
        medecin?.matricule ??
        `${medecin?.nom}-${medecin?.prenom}`,
    );

    if (medecinId !== medecinFilter) {
      return false;
    }
  }

  /* ---------------------------------------------
     FILTRE SERVICE
  --------------------------------------------- */

  if (serviceFilter) {
    const serviceId = String(
      service?.id ??
        service?.idService ??
        service?.code ??
        service?.nom,
    );

    if (serviceId !== serviceFilter) {
      return false;
    }
  }

  /* ---------------------------------------------
     FILTRE DATE
  --------------------------------------------- */

  if (dateFilter) {
    const dateConsultation =
      new Date(
        consultation.dateConsultation,
      );

    const dateLocale =
      `${dateConsultation.getFullYear()}-${String(
        dateConsultation.getMonth() + 1,
      ).padStart(2, "0")}-${String(
        dateConsultation.getDate(),
      ).padStart(2, "0")}`;

    if (dateLocale !== dateFilter) {
      return false;
    }
  }

  /* ---------------------------------------------
     FILTRE ASSOCIATIONS
  --------------------------------------------- */

  const hasPrescription =
    (consultation.prescriptions?.length ?? 0) >
    0;

  const hasLaboratoire =
    (consultation.demandesLabo?.length ?? 0) >
    0;

  const hasDiagnostic =
    Boolean(
      consultation.diagnostic?.trim(),
    );

  if (
    associationFilter === "prescription" &&
    !hasPrescription
  ) {
    return false;
  }

  if (
    associationFilter === "laboratoire" &&
    !hasLaboratoire
  ) {
    return false;
  }

  if (
    associationFilter === "diagnostic" &&
    !hasDiagnostic
  ) {
    return false;
  }

  if (
    associationFilter === "aucune" &&
    (hasPrescription ||
      hasLaboratoire ||
      hasDiagnostic)
  ) {
    return false;
  }

  return true;
});


}, [
consultations,
search,
patientSearch,
medecinFilter,
serviceFilter,
dateFilter,
associationFilter,
]);

/* =========================================================
RÉINITIALISATION
========================================================= */

function resetFilters() {
setSearch("");
setPatientSearch("");
setMedecinFilter("");
setServiceFilter("");
setDateFilter("");
setAssociationFilter("all");
}

const hasFilters =
search ||
patientSearch ||
medecinFilter ||
serviceFilter ||
dateFilter ||
associationFilter !== "all";

/* =========================================================
FORMAT NOM
========================================================= */

function getPatientName(patient: any) {
return [
patient?.nom,
patient?.postNom,
patient?.prenom,
]
.filter(Boolean)
.join(" ");
}

function getMedecinName(medecin: any) {
return [
medecin?.nom,
medecin?.postNom,
medecin?.prenom,
]
.filter(Boolean)
.join(" ");
}

return ( <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md">

  {/* =====================================================
      EN-TÊTE
  ===================================================== */}

  <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-5 sm:p-6">

    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content shadow-sm">
          <Stethoscope size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold sm:text-xl">
            Liste des consultations
          </h2>

          <p className="text-sm text-base-content/60">
            {consultationsFiltrees.length} résultat
            {consultationsFiltrees.length !== 1
              ? "s"
              : ""}{" "}
            sur {consultations.length}
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2">

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-sm btn-ghost gap-2"
          >
            <RotateCcw size={15} />
            Réinitialiser
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            setShowFilters((value) => !value)
          }
          className={`btn btn-sm gap-2 ${
            showFilters
              ? "btn-primary"
              : "btn-outline"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtres
          {hasFilters && (
            <span className="badge badge-sm badge-secondary">
              actifs
            </span>
          )}
          <ChevronDown
            size={15}
            className={`transition-transform ${
              showFilters
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

      </div>

    </div>

    {/* ===================================================
        RECHERCHE PRINCIPALE
    ==================================================== */}

    <div className="mt-5">

      <label
        htmlFor="consultation-search"
        className="mb-2 block text-sm font-semibold"
      >
        Rechercher une consultation
      </label>

      <div className="relative">

        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
        />

        <input
          id="consultation-search"
          type="search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Patient, médecin, dossier, matricule, service, motif, diagnostic ou N° consultation..."
          className="input input-bordered h-12 w-full bg-base-100 pl-11 pr-11 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2"
            title="Effacer"
          >
            <X size={16} />
          </button>
        )}

      </div>

    </div>

    {/* ===================================================
        FILTRES AVANCÉS
    ==================================================== */}

    {showFilters && (
      <div className="mt-5 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="font-semibold">
              Recherche avancée
            </h3>

            <p className="text-xs text-base-content/50">
              Affinez les résultats selon plusieurs
              critères.
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-xs btn-ghost text-error"
            >
              <RotateCcw size={13} />
              Effacer
            </button>
          )}

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* PATIENT */}

          <div className="form-control">

            <label
              htmlFor="patient-search"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <UserRound
                size={15}
                className="text-primary"
              />
              Patient
            </label>

            <input
              id="patient-search"
              type="text"
              value={patientSearch}
              onChange={(e) =>
                setPatientSearch(
                  e.target.value,
                )
              }
              placeholder="Nom ou N° dossier"
              className="input input-bordered bg-base-100"
            />

          </div>

          {/* MÉDECIN */}

          <div className="form-control">

            <label
              htmlFor="medecin-filter"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <UserCog
                size={15}
                className="text-primary"
              />
              Médecin
            </label>

            <select
              id="medecin-filter"
              value={medecinFilter}
              onChange={(e) =>
                setMedecinFilter(
                  e.target.value,
                )
              }
              className="select select-bordered bg-base-100"
            >
              <option value="">
                Tous les médecins
              </option>

              {medecins.map((medecin) => {
                const id = String(
                  medecin.id ??
                    medecin.idMedecin ??
                    medecin.matricule ??
                    `${medecin.nom}-${medecin.prenom}`,
                );

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    Dr{" "}
                    {getMedecinName(
                      medecin,
                    )}
                  </option>
                );
              })}
            </select>

          </div>

          {/* SERVICE */}

          <div className="form-control">

            <label
              htmlFor="service-filter"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <Building2
                size={15}
                className="text-primary"
              />
              Service
            </label>

            <select
              id="service-filter"
              value={serviceFilter}
              onChange={(e) =>
                setServiceFilter(
                  e.target.value,
                )
              }
              className="select select-bordered bg-base-100"
            >
              <option value="">
                Tous les services
              </option>

              {services.map((service) => {
                const id = String(
                  service.id ??
                    service.idService ??
                    service.code ??
                    service.nom,
                );

                return (
                  <option
                    key={id}
                    value={id}
                  >
                    {service.nom}
                    {service.code
                      ? ` (${service.code})`
                      : ""}
                  </option>
                );
              })}
            </select>

          </div>

          {/* DATE */}

          <div className="form-control">

            <label
              htmlFor="date-filter"
              className="mb-2 flex items-center gap-2 text-sm font-medium"
            >
              <CalendarDays
                size={15}
                className="text-primary"
              />
              Date
            </label>

            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value,
                )
              }
              className="input input-bordered bg-base-100"
            />

          </div>

          {/* ASSOCIATIONS */}

          <div className="form-control md:col-span-2 xl:col-span-2">

            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ClipboardList
                size={15}
                className="text-primary"
              />
              Éléments associés
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">

              <button
                type="button"
                onClick={() =>
                  setAssociationFilter(
                    "all",
                  )
                }
                className={`btn btn-sm ${
                  associationFilter ===
                  "all"
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                Tous
              </button>

              <button
                type="button"
                onClick={() =>
                  setAssociationFilter(
                    "diagnostic",
                  )
                }
                className={`btn btn-sm ${
                  associationFilter ===
                  "diagnostic"
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                <FileText size={14} />
                Diagnostic
              </button>

              <button
                type="button"
                onClick={() =>
                  setAssociationFilter(
                    "prescription",
                  )
                }
                className={`btn btn-sm ${
                  associationFilter ===
                  "prescription"
                    ? "btn-secondary"
                    : "btn-outline"
                }`}
              >
                <Pill size={14} />
                Prescription
              </button>

              <button
                type="button"
                onClick={() =>
                  setAssociationFilter(
                    "laboratoire",
                  )
                }
                className={`btn btn-sm ${
                  associationFilter ===
                  "laboratoire"
                    ? "btn-info"
                    : "btn-outline"
                }`}
              >
                <FlaskConical size={14} />
                Laboratoire
              </button>

              <button
                type="button"
                onClick={() =>
                  setAssociationFilter(
                    "aucune",
                  )
                }
                className={`btn btn-sm ${
                  associationFilter ===
                  "aucune"
                    ? "btn-warning"
                    : "btn-outline"
                }`}
              >
                Aucune
              </button>

            </div>

          </div>

        </div>

      </div>
    )}

  </div>

  {/* =====================================================
      BARRE RÉSULTATS
  ===================================================== */}

  {hasFilters && (
    <div className="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-200/30 px-5 py-3 text-sm">

      <span className="font-medium">
        Résultats :
      </span>

      <span className="badge badge-primary">
        {consultationsFiltrees.length}
      </span>

      <span className="text-base-content/50">
        consultation
        {consultationsFiltrees.length !== 1
          ? "s"
          : ""}{" "}
        trouvée
        {consultationsFiltrees.length !== 1
          ? "s"
          : ""}
      </span>

    </div>
  )}

  {/* =====================================================
      TABLEAU
  ===================================================== */}

  <div className="overflow-x-auto">

    <table className="table table-zebra">

      <thead className="bg-base-200/60">

        <tr>

          <th className="whitespace-nowrap">
            Consultation
          </th>

          <th className="whitespace-nowrap">
            Patient
          </th>

          <th className="whitespace-nowrap">
            Médecin
          </th>

          <th className="whitespace-nowrap">
            Service
          </th>

          <th className="whitespace-nowrap">
            Date
          </th>

          <th className="whitespace-nowrap">
            Motif
          </th>

          <th className="whitespace-nowrap">
            Associations
          </th>

          <th className="text-right whitespace-nowrap">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {consultationsFiltrees.length === 0 ? (

          <tr>

            <td
              colSpan={8}
              className="py-16"
            >

              <div className="flex flex-col items-center justify-center gap-3 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/30">
                  <Search size={30} />
                </div>

                <div>

                  <p className="font-semibold">
                    {consultations.length ===
                    0
                      ? "Aucune consultation enregistrée"
                      : "Aucun résultat trouvé"}
                  </p>

                  <p className="mt-1 text-sm text-base-content/50">
                    {consultations.length ===
                    0
                      ? "Les consultations apparaîtront ici."
                      : "Modifiez vos critères de recherche ou réinitialisez les filtres."}
                  </p>

                </div>

                {consultations.length >
                  0 &&
                  hasFilters && (
                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="btn btn-sm btn-outline mt-2"
                    >
                      <RotateCcw
                        size={15}
                      />
                      Réinitialiser les filtres
                    </button>
                  )}

              </div>

            </td>

          </tr>

        ) : (

          consultationsFiltrees.map(
            (consultation) => {

              const patient =
                consultation.patient;

              const medecin =
                consultation.medecin;

              const hasPrescription =
                (consultation
                  .prescriptions
                  ?.length ?? 0) > 0;

              const hasLaboratoire =
                (consultation
                  .demandesLabo
                  ?.length ?? 0) > 0;

              return (

                <tr
                  key={
                    consultation.idConsultation
                  }
                  className="hover:bg-base-200/40"
                >

                  {/* CONSULTATION */}

                  <td>

                    <div className="flex items-center gap-3">

                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                        <Stethoscope
                          size={17}
                        />
                      </div>

                      <div>

                        <div className="font-semibold whitespace-nowrap">
                          CONSULT-
                          {
                            consultation.idConsultation
                          }
                        </div>

                        <div className="text-xs text-base-content/40">
                          ID #
                          {
                            consultation.idConsultation
                          }
                        </div>

                      </div>

                    </div>

                  </td>

                  {/* PATIENT */}

                  <td>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">

                        <div className="font-semibold whitespace-nowrap">
                          {getPatientName(
                            patient,
                          )}
                        </div>

                        <div className="text-xs text-base-content/50">
                          {patient?.numeroDossier ??
                            "—"}
                        </div>

                      </div>

                    </div>

                  </td>

                  {/* MÉDECIN */}

                  <td>

                    <div className="font-medium whitespace-nowrap">
                      Dr{" "}
                      {getMedecinName(
                        medecin,
                      )}
                    </div>

                    <div className="text-xs text-base-content/50">
                      {medecin?.matricule ??
                        "—"}
                    </div>

                  </td>

                  {/* SERVICE */}

                  <td>

                    {consultation.service
                      ?.nom ? (

                      <div>

                        <div className="font-medium whitespace-nowrap">
                          {
                            consultation
                              .service
                              .nom
                          }
                        </div>

                        <div className="text-xs text-base-content/50">
                          {
                            consultation
                              .service
                              .code
                          }
                        </div>

                      </div>

                    ) : (

                      <span className="text-base-content/40">
                        —
                      </span>

                    )}

                  </td>

                  {/* DATE */}

                  <td>

                    <div className="flex items-center gap-2 whitespace-nowrap">

                      <CalendarDays
                        size={15}
                        className="text-base-content/40"
                      />

                      <span>
                        {new Date(
                          consultation.dateConsultation,
                        ).toLocaleString(
                          "fr-FR",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          },
                        )}
                      </span>

                    </div>

                  </td>

                  {/* MOTIF */}

                  <td>

                    <div
                      className="max-w-52 truncate"
                      title={
                        consultation.motif ||
                        ""
                      }
                    >
                      {consultation.motif ||
                        "—"}
                    </div>

                  </td>

                  {/* ASSOCIATIONS */}

                  <td>

                    <div className="flex flex-wrap gap-1.5">

                      {consultation
                        .diagnostic
                        ?.trim() && (
                        <span
                          className="badge badge-primary badge-outline gap-1"
                          title="Diagnostic"
                        >
                          <FileText
                            size={11}
                          />
                          Diagnostic
                        </span>
                      )}

                      {hasPrescription && (
                        <span
                          className="badge badge-secondary gap-1"
                          title="Prescriptions"
                        >
                          <Pill
                            size={12}
                          />
                          {
                            consultation
                              .prescriptions
                              .length
                          }
                        </span>
                      )}

                      {hasLaboratoire && (
                        <span
                          className="badge badge-info gap-1"
                          title="Demandes laboratoire"
                        >
                          <FlaskConical
                            size={12}
                          />
                          {
                            consultation
                              .demandesLabo
                              .length
                          }
                        </span>
                      )}

                      {!consultation
                        .diagnostic
                        ?.trim() &&
                        !hasPrescription &&
                        !hasLaboratoire && (
                          <span className="text-xs text-base-content/30">
                            Aucune
                          </span>
                        )}

                    </div>

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="flex items-center justify-end gap-1">

                      <Link
                        href={`/consultations/${consultation.idConsultation}`}
                        className="btn btn-sm btn-ghost btn-square tooltip"
                        data-tip="Voir la consultation"
                      >
                        <Eye size={17} />
                      </Link>

                      <ConsultationActions
                        consultationId={
                          consultation.idConsultation
                        }
                      />

                    </div>

                  </td>

                </tr>

              );
            },
          )

        )}

      </tbody>

    </table>

  </div>

  {/* =====================================================
      FOOTER
  ===================================================== */}

  {consultationsFiltrees.length > 0 && (
    <div className="flex flex-col gap-2 border-t border-base-300 bg-base-200/20 px-5 py-3 text-xs text-base-content/50 sm:flex-row sm:items-center sm:justify-between">

      <span>
        Affichage de{" "}
        <strong className="text-base-content">
          {consultationsFiltrees.length}
        </strong>{" "}
        consultation
        {consultationsFiltrees.length !== 1
          ? "s"
          : ""}
      </span>

      {hasFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="link link-hover text-primary"
        >
          Effacer tous les filtres
        </button>
      )}

    </div>
  )}

</div>


);
}
