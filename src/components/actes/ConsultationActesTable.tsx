
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Eye,
  ClipboardList,
  Search,
  Filter,
  RotateCcw,
  X,
  CalendarDays,
  UserRound,
  Stethoscope,
  FileText,
  DollarSign,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Role =
  | "ADMIN"
  | "MEDECIN"
  | "INFIRMIER"
  | "RECEPTIONNISTE"
  | "CAISSIER"
  | "LABORANTIN"
  | "RADIOLOGUE";

type Permission =
  | "PATIENT_READ"
  | "CONSULTATION_READ"
  | "ACTE_READ"
  | "ACTE_CREATE"
  | "FACTURATION_READ"
  | "PAIEMENT_READ"
  | "LABORATOIRE_READ"
  | "IMAGERIE_READ";

/**
 * Structure minimale attendue.
 *
 * Évite `any[]` autant que possible.
 */
type Consultation = {
  idConsultation: number | string;

  dateConsultation: string | Date;

  patient?: {
    nom?: string | null;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  medecin?: {
    nom?: string | null;
    prenom?: string | null;
  } | null;

  actes?: Array<{
    montant?: number | string | null;

    acte?: {
      devise?: string | null;
    } | null;
  }>;

  _count?: {
    actes?: number;
  };
};

type Props = {
  consultations: Consultation[];

  /**
   * Rôle transmis depuis le Server Component.
   *
   * IMPORTANT :
   * ce rôle ne doit jamais être considéré comme
   * une preuve de sécurité côté serveur.
   */
  role: Role;
};

/* =========================================================
   PERMISSIONS
========================================================= */

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "PATIENT_READ",
    "CONSULTATION_READ",
    "ACTE_READ",
    "ACTE_CREATE",
    "FACTURATION_READ",
    "PAIEMENT_READ",
    "LABORATOIRE_READ",
    "IMAGERIE_READ",
  ],

  MEDECIN: [
    "PATIENT_READ",
    "CONSULTATION_READ",
    "ACTE_READ",
    "ACTE_CREATE",
    "LABORATOIRE_READ",
    "IMAGERIE_READ",
  ],

  INFIRMIER: [
    "PATIENT_READ",
    "CONSULTATION_READ",
  ],

  RECEPTIONNISTE: [
    "PATIENT_READ",
  ],

  CAISSIER: [
    "PATIENT_READ",
    "FACTURATION_READ",
    "PAIEMENT_READ",
  ],

  LABORANTIN: [
    "PATIENT_READ",
    "LABORATOIRE_READ",
  ],

  RADIOLOGUE: [
    "PATIENT_READ",
    "IMAGERIE_READ",
  ],
};

/* =========================================================
   UTILITAIRES
========================================================= */

function nomPatient(patient?: Consultation["patient"]) {
  if (!patient) return "";

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function nomMedecin(medecin?: Consultation["medecin"]) {
  if (!medecin) return "";

  return [
    medecin.nom,
    medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function normaliser(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function calculerTotal(consultation: Consultation) {
  return (
    consultation.actes?.reduce(
      (somme, acte) =>
        somme + Number(acte.montant ?? 0),
      0
    ) ?? 0
  );
}

function nombreActes(consultation: Consultation) {
  return (
    consultation._count?.actes ??
    consultation.actes?.length ??
    0
  );
}

function formaterMontant(
  montant: number,
  devise: string
) {
  return `${montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${devise}`;
}

function formatDate(
  date: string | Date | null | undefined
) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function ConsultationActesTable({
  consultations,
  role,
}: Props) {
  const [search, setSearch] = useState("");

  const [dateDebut, setDateDebut] = useState("");

  const [dateFin, setDateFin] = useState("");

  const [filtreNombreActes, setFiltreNombreActes] =
    useState("TOUS");

  const [filtreMontant, setFiltreMontant] =
    useState("TOUS");

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const permissions =
    ROLE_PERMISSIONS[role] ?? [];

  const can = (permission: Permission) =>
    permissions.includes(permission);

  /*
   * Cette page concerne les actes.
   *
   * Les rôles qui ne disposent pas de ACTE_READ
   * ne doivent pas pouvoir utiliser ce composant.
   *
   * ATTENTION :
   * cette vérification UI ne remplace PAS
   * la vérification côté serveur.
   */
  if (!can("ACTE_READ")) {
    return (
      <div className="alert alert-error">
        <span>
          Vous n'avez pas l'autorisation de consulter
          les actes de consultation.
        </span>
      </div>
    );
  }

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const statistiques = useMemo(() => {
    let totalActes = 0;
    let montantTotal = 0;

    consultations.forEach((consultation) => {
      totalActes += nombreActes(consultation);

      montantTotal += calculerTotal(
        consultation
      );
    });

    return {
      consultations: consultations.length,
      totalActes,
      montantTotal,
    };
  }, [consultations]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const consultationsFiltrees = useMemo(() => {
    const q = normaliser(search);

    return consultations.filter(
      (consultation) => {
        const patient = nomPatient(
          consultation.patient
        );

        const medecin = nomMedecin(
          consultation.medecin
        );

        const numeroDossier =
          consultation.patient?.numeroDossier ?? "";

        const id =
          consultation.idConsultation;

        const actes = nombreActes(
          consultation
        );

        const total =
          calculerTotal(consultation);

        /* -----------------------------------------------
           RECHERCHE
        ------------------------------------------------ */

        const texteRecherche = normaliser(
          [
            `CONS-${id}`,
            id,
            patient,
            medecin,
            numeroDossier,
          ].join(" ")
        );

        const rechercheOK =
          !q ||
          texteRecherche.includes(q);

        /* -----------------------------------------------
           DATE
        ------------------------------------------------ */

        const dateConsultation =
          new Date(
            consultation.dateConsultation
          );

        let dateOK = true;

        if (dateDebut) {
          const debut = new Date(
            `${dateDebut}T00:00:00`
          );

          dateOK =
            dateConsultation >= debut;
        }

        if (dateOK && dateFin) {
          const fin = new Date(
            `${dateFin}T23:59:59`
          );

          dateOK =
            dateConsultation <= fin;
        }

        /* -----------------------------------------------
           NOMBRE ACTES
        ------------------------------------------------ */

        let actesOK = true;

        switch (filtreNombreActes) {
          case "AUCUN":
            actesOK = actes === 0;
            break;

          case "UN":
            actesOK = actes === 1;
            break;

          case "PLUSIEURS":
            actesOK = actes > 1;
            break;

          case "TROIS_PLUS":
            actesOK = actes >= 3;
            break;
        }

        /* -----------------------------------------------
           MONTANT
        ------------------------------------------------ */

        let montantOK = true;

        switch (filtreMontant) {
          case "ZERO":
            montantOK = total === 0;
            break;

          case "PETIT":
            montantOK =
              total > 0 &&
              total < 50;
            break;

          case "MOYEN":
            montantOK =
              total >= 50 &&
              total <= 200;
            break;

          case "ELEVE":
            montantOK =
              total > 200;
            break;
        }

        return (
          rechercheOK &&
          dateOK &&
          actesOK &&
          montantOK
        );
      }
    );
  }, [
    consultations,
    search,
    dateDebut,
    dateFin,
    filtreNombreActes,
    filtreMontant,
  ]);

  /* =======================================================
     FILTRES ACTIFS
  ======================================================= */

  const filtresActifs =
    search !== "" ||
    dateDebut !== "" ||
    dateFin !== "" ||
    filtreNombreActes !== "TOUS" ||
    filtreMontant !== "TOUS";

  function resetFilters() {
    setSearch("");
    setDateDebut("");
    setDateFin("");
    setFiltreNombreActes("TOUS");
    setFiltreMontant("TOUS");
  }

  /* =======================================================
     DEVISE
  ======================================================= */

  const devise =
    consultations.find(
      (consultation) =>
        consultation.actes?.some(
          (acte) =>
            acte.acte?.devise
        )
    )?.actes?.find(
      (acte) =>
        acte.acte?.devise
    )?.acte?.devise ?? "USD";

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <section className="space-y-5">

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* CONSULTATIONS */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Consultations
              </p>

              <p className="mt-1 text-3xl font-bold">
                {statistiques.consultations}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList size={22} />
            </div>

          </div>

        </div>

        {/* ACTES */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Actes réalisés
              </p>

              <p className="mt-1 text-3xl font-bold">
                {statistiques.totalActes}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
              <FileText size={22} />
            </div>

          </div>

        </div>

        {/* MONTANT */}

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Montant total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formaterMontant(
                  statistiques.montantTotal,
                  devise
                )}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <DollarSign size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          TABLEAU
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* HEADER */}

        <div className="border-b border-base-300 p-5 sm:p-6">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-xl font-bold">
                Actes de consultation
              </h2>

              <span className="badge badge-primary badge-outline">
                {consultationsFiltrees.length}
              </span>

            </div>

            <p className="mt-1 text-sm text-base-content/60">
              Consultez les actes liés aux consultations.
            </p>

          </div>

          {/* RECHERCHE */}

          <div className="mt-5">

            <label className="input input-bordered flex h-12 w-full items-center gap-3">

              <Search
                size={19}
                className="text-base-content/40"
              />

              <input
                type="search"
                className="grow"
                placeholder="Patient, dossier, médecin ou consultation..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() =>
                    setSearch("")
                  }
                  title="Effacer"
                >
                  <X size={15} />
                </button>
              )}

            </label>

          </div>

          {/* FILTRES */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <button
              type="button"
              className={`btn btn-sm ${
                showAdvanced
                  ? "btn-primary"
                  : "btn-outline"
              }`}
              onClick={() =>
                setShowAdvanced(
                  !showAdvanced
                )
              }
            >
              <Filter size={16} />

              Filtres avancés

              <ChevronDown
                size={15}
                className={`transition-transform ${
                  showAdvanced
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {filtresActifs && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
              >
                <RotateCcw size={15} />
                Réinitialiser
              </button>
            )}

          </div>

          {/* FILTRES AVANCÉS */}

          {showAdvanced && (
            <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/50 p-4">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                <div>

                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                    <CalendarDays size={14} />
                    Date de début
                  </label>

                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-100"
                    value={dateDebut}
                    onChange={(e) =>
                      setDateDebut(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                    <CalendarDays size={14} />
                    Date de fin
                  </label>

                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-100"
                    value={dateFin}
                    onChange={(e) =>
                      setDateFin(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                    <ClipboardList size={14} />
                    Nombre d'actes
                  </label>

                  <select
                    className="select select-bordered w-full bg-base-100"
                    value={filtreNombreActes}
                    onChange={(e) =>
                      setFiltreNombreActes(
                        e.target.value
                      )
                    }
                  >

                    <option value="TOUS">
                      Tous
                    </option>

                    <option value="AUCUN">
                      Aucun acte
                    </option>

                    <option value="UN">
                      1 acte
                    </option>

                    <option value="PLUSIEURS">
                      Plusieurs actes
                    </option>

                    <option value="TROIS_PLUS">
                      3 actes ou plus
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                    <DollarSign size={14} />
                    Montant
                  </label>

                  <select
                    className="select select-bordered w-full bg-base-100"
                    value={filtreMontant}
                    onChange={(e) =>
                      setFiltreMontant(
                        e.target.value
                      )
                    }
                  >

                    <option value="TOUS">
                      Tous les montants
                    </option>

                    <option value="ZERO">
                      0
                    </option>

                    <option value="PETIT">
                      Moins de 50
                    </option>

                    <option value="MOYEN">
                      50 – 200
                    </option>

                    <option value="ELEVE">
                      Plus de 200
                    </option>

                  </select>

                </div>

              </div>

            </div>
          )}

          {/* RÉSUMÉ */}

          <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">

            <p className="text-base-content/60">

              <strong className="text-base-content">
                {consultationsFiltrees.length}
              </strong>{" "}

              consultation
              {consultationsFiltrees.length !== 1
                ? "s"
                : ""}{" "}

              affichée
              {consultationsFiltrees.length !== 1
                ? "s"
                : ""}

              {consultationsFiltrees.length !==
                consultations.length && (
                <>
                  {" "}sur{" "}
                  <strong className="text-base-content">
                    {consultations.length}
                  </strong>
                </>
              )}

            </p>

            {filtresActifs && (
              <span className="badge badge-primary badge-outline">
                Filtres actifs
              </span>
            )}

          </div>

        </div>

        {/* TABLE */}

        <div className="w-full overflow-x-auto">

          <table className="table w-full">

            <thead>

              <tr>

                <th>Consultation</th>

                <th>Patient</th>

                <th>Médecin</th>

                <th>Date</th>

                <th>Actes</th>

                <th>Total</th>

                <th className="text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {consultationsFiltrees.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="py-16"
                  >

                    <div className="flex flex-col items-center text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200">

                        <Search
                          size={28}
                          className="text-base-content/30"
                        />

                      </div>

                      <h3 className="mt-4 font-bold">
                        Aucune consultation trouvée
                      </h3>

                      <p className="mt-1 max-w-md text-sm text-base-content/50">
                        Aucune consultation ne correspond
                        aux critères sélectionnés.
                      </p>

                      {filtresActifs && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="btn btn-primary btn-sm mt-4"
                        >
                          <RotateCcw size={15} />
                          Réinitialiser les filtres
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ) : (

                consultationsFiltrees.map(
                  (consultation) => {

                    const total =
                      calculerTotal(
                        consultation
                      );

                    const devise =
                      consultation
                        .actes?.[0]
                        ?.acte?.devise ??
                      "USD";

                    const actes =
                      nombreActes(
                        consultation
                      );

                    const patient =
                      nomPatient(
                        consultation.patient
                      );

                    const medecin =
                      nomMedecin(
                        consultation.medecin
                      );

                    return (
                      <tr
                        key={
                          consultation.idConsultation
                        }
                        className="hover"
                      >

                        {/* CONSULTATION */}

                        <td>

                          <div className="flex min-w-[145px] items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <ClipboardList
                                size={18}
                              />
                            </div>

                            <div>

                              <Link
                                href={`/actes/consultations/${consultation.idConsultation}`}
                                className="font-mono font-semibold hover:text-primary hover:underline"
                              >
                                CONS-
                                {
                                  consultation.idConsultation
                                }
                              </Link>

                              <div className="text-xs text-base-content/50">
                                Consultation
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* PATIENT */}

                        <td>

                          <div className="flex min-w-[190px] items-center gap-2">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60">

                              <UserRound
                                size={16}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold">
                                {patient ||
                                  "Patient inconnu"}
                              </p>

                              <p className="truncate text-xs text-base-content/50">

                                Dossier :{" "}

                                {consultation
                                  .patient
                                  ?.numeroDossier ||
                                  "—"}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* MÉDECIN */}

                        <td>

                          <div className="flex min-w-[150px] items-center gap-2">

                            <Stethoscope
                              size={17}
                              className="text-info"
                            />

                            <span className="font-medium">
                              {medecin || "—"}
                            </span>

                          </div>

                        </td>

                        {/* DATE */}

                        <td>

                          <div className="min-w-[150px]">

                            <p className="font-medium">
                              {formatDate(
                                consultation.dateConsultation
                              )}
                            </p>

                          </div>

                        </td>

                        {/* ACTES */}

                        <td>

                          <span
                            className={`badge ${
                              actes > 0
                                ? "badge-primary"
                                : "badge-ghost"
                            }`}
                          >

                            {actes} acte
                            {actes !== 1
                              ? "s"
                              : ""}

                          </span>

                        </td>

                        {/* TOTAL */}

                        <td>

                          <div className="min-w-[120px]">

                            <span className="font-bold">

                              {formaterMontant(
                                total,
                                devise
                              )}

                            </span>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td>

                          <div className="flex justify-end">

                            <Link
                              href={`/actes/consultations/${consultation.idConsultation}`}
                              className="btn btn-sm btn-primary btn-outline gap-1"
                              title="Voir les actes"
                            >

                              <Eye size={16} />

                              <span className="hidden lg:inline">
                                Détails
                              </span>

                            </Link>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        {consultationsFiltrees.length > 0 && (

          <div className="flex flex-col gap-2 border-t border-base-300 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">

            <p className="text-base-content/60">

              Affichage de{" "}

              <strong className="text-base-content">
                {consultationsFiltrees.length}
              </strong>{" "}

              consultation
              {consultationsFiltrees.length !== 1
                ? "s"
                : ""}

            </p>

            {filtresActifs && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
              >
                <RotateCcw size={15} />
                Effacer les filtres
              </button>
            )}

          </div>

        )}

      </div>

    </section>
  );
}
