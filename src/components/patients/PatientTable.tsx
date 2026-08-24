
"use client";

import {
  deletePatient,
  togglePatient,
} from "@/app/actions/patient";

import Link from "next/link";
import { useMemo, useState } from "react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  Search,
  Users,
  UserRound,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileText,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| TYPE PATIENT
|--------------------------------------------------------------------------
*/

type Patient = {
  id: number;

  numeroDossier: string;

  nom: string;
  postNom: string | null;
  prenom: string | null;

  sexe: string;

  dateNaissance: Date | null;

  telephone: string | null;
  email: string | null;

  adresse: string | null;

  actif: boolean;

  createdAt: Date;
  updatedAt: Date;

  _count: {
    rendezVous: number;
    admissions: number;
    consultations: number;
    prescriptions: number;
    demandesLabo: number;
    demandesImagerie: number;
    hospitalisations: number;
    factures: number;
    paiements: number;
  };
};

type Props = {
  patients: Patient[];
};

const ELEMENTS_PAR_PAGE = 10;

/*
|--------------------------------------------------------------------------
| COMPOSANT
|--------------------------------------------------------------------------
*/

export default function PatientTable({
  patients,
}: Props) {
  const [search, setSearch] = useState("");

  const [statut, setStatut] = useState<
    "TOUS" | "ACTIF" | "INACTIF"
  >("TOUS");

  const [page, setPage] = useState(1);

  const [loadingId, setLoadingId] = useState<
    number | null
  >(null);

  /*
  |--------------------------------------------------------------------------
  | NOM COMPLET
  |--------------------------------------------------------------------------
  */

  function getNomComplet(patient: Patient) {
    return [
      patient.nom,
      patient.postNom,
      patient.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  }

  /*
  |--------------------------------------------------------------------------
  | FILTRAGE
  |--------------------------------------------------------------------------
  */

  const patientsFiltres = useMemo(() => {
    const terme = search
      .trim()
      .toLowerCase();

    return patients.filter((patient) => {
      const nomComplet = getNomComplet(
        patient
      ).toLowerCase();

      const correspondRecherche =
        !terme ||
        nomComplet.includes(terme) ||
        patient.numeroDossier
          .toLowerCase()
          .includes(terme) ||
        patient.telephone
          ?.toLowerCase()
          .includes(terme);

      const correspondStatut =
        statut === "TOUS" ||
        (statut === "ACTIF" &&
          patient.actif) ||
        (statut === "INACTIF" &&
          !patient.actif);

      return (
        correspondRecherche &&
        correspondStatut
      );
    });
  }, [patients, search, statut]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      patientsFiltres.length /
        ELEMENTS_PAR_PAGE
    )
  );

  const pageActuelle = Math.min(
    page,
    totalPages
  );

  const patientsPage =
    patientsFiltres.slice(
      (pageActuelle - 1) *
        ELEMENTS_PAR_PAGE,
      pageActuelle *
        ELEMENTS_PAR_PAGE
    );

  /*
  |--------------------------------------------------------------------------
  | STATISTIQUES
  |--------------------------------------------------------------------------
  */

  const totalActifs = patients.filter(
    (patient) => patient.actif
  ).length;

  const totalInactifs =
    patients.length - totalActifs;

  /*
  |--------------------------------------------------------------------------
  | ACTIVER / DÉSACTIVER
  |--------------------------------------------------------------------------
  */

  async function handleToggle(
    patient: Patient
  ) {
    const action = patient.actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title:
        action === "activer"
          ? "Activer le patient ?"
          : "Désactiver le patient ?",

      text: `Voulez-vous vraiment ${action} « ${getNomComplet(
        patient
      )} » ?`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText:
        action === "activer"
          ? "Oui, activer"
          : "Oui, désactiver",

      cancelButtonText: "Annuler",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoadingId(patient.id);

    try {
      const response =
        await togglePatient(
          patient.id
        );

      if (!response.success) {
        toast.error(
          response.message
        );
        return;
      }

      toast.success(
        response.message
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue lors de la modification du statut."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SUPPRIMER
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    patient: Patient
  ) {
    const result = await Swal.fire({
      title: "Supprimer le patient ?",

      html: `
        <div class="text-sm">
          Vous êtes sur le point de supprimer
          <strong>${getNomComplet(
            patient
          )}</strong>.
          <br />
          Cette action est irréversible.
        </div>
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Oui, supprimer",

      cancelButtonText:
        "Annuler",

      confirmButtonColor: "#d33",

      cancelButtonColor: "#6b7280",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoadingId(patient.id);

    try {
      const response =
        await deletePatient(
          patient.id
        );

      if (!response.success) {
        toast.error(
          response.message
        );
        return;
      }

      toast.success(
        response.message
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue lors de la suppression."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ÉTAT VIDE
  |--------------------------------------------------------------------------
  */

  if (patients.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Users size={32} />
          </div>
        </div>

        <h3 className="font-semibold text-lg">
          Aucun patient
        </h3>

        <p className="text-base-content/60 mt-1">
          Aucun patient n&apos;a encore été
          enregistré.
        </p>

        <Link
          href="/patients/nouveau"
          className="btn btn-primary mt-5"
        >
          Nouveau patient
        </Link>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TABLEAU
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-4">

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* TOTAL */}

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">
          <div className="stat-figure text-primary">
            <Users size={28} />
          </div>

          <div className="stat-title">
            Total patients
          </div>

          <div className="stat-value text-primary">
            {patients.length}
          </div>
        </div>

        {/* ACTIFS */}

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">
          <div className="stat-figure text-success">
            <CheckCircle2 size={28} />
          </div>

          <div className="stat-title">
            Actifs
          </div>

          <div className="stat-value text-success">
            {totalActifs}
          </div>
        </div>

        {/* INACTIFS */}

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">
          <div className="stat-figure text-error">
            <XCircle size={28} />
          </div>

          <div className="stat-title">
            Inactifs
          </div>

          <div className="stat-value text-error">
            {totalInactifs}
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTRES
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col lg:flex-row gap-3 justify-between">

            {/* RECHERCHE */}

            <label className="input input-bordered flex items-center gap-2 w-full lg:max-w-xl">

              <Search
                size={18}
                className="text-base-content/50"
              />

              <input
                type="text"
                placeholder="Rechercher par nom, dossier ou téléphone..."
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                className="grow"
              />

            </label>

            {/* STATUT */}

            <select
              className="select select-bordered"
              value={statut}
              onChange={(event) => {
                setStatut(
                  event.target.value as
                    | "TOUS"
                    | "ACTIF"
                    | "INACTIF"
                );

                setPage(1);
              }}
            >

              <option value="TOUS">
                Tous les statuts
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

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body p-0">

          <div className="overflow-x-auto">

            <table className="table table-zebra">

              <thead>

                <tr>
                  <th>Patient</th>
                  <th>Dossier</th>
                  <th>Sexe</th>
                  <th>Téléphone</th>
                  <th>Activité médicale</th>
                  <th>Statut</th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {patientsPage.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-12"
                    >

                      <div className="flex flex-col items-center gap-2 text-base-content/50">

                        <Search size={40} />

                        <p className="font-medium">
                          Aucun patient trouvé
                        </p>

                        <p className="text-sm">
                          Aucun patient ne
                          correspond aux
                          critères de recherche.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  patientsPage.map(
                    (patient) => {

                      const loading =
                        loadingId ===
                        patient.id;

                      return (

                        <tr
                          key={patient.id}
                        >

                          {/* PATIENT */}

                          <td>

                            <div className="flex items-center gap-3">

                              <div className="avatar placeholder">

                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">

                                  <UserRound
                                    size={19}
                                  />

                                </div>

                              </div>

                              <div>

                                <div className="font-semibold">

                                  {getNomComplet(
                                    patient
                                  )}

                                </div>

                                <div className="text-xs text-base-content/50">

                                  ID :{" "}
                                  {patient.id}

                                </div>

                              </div>

                            </div>

                          </td>

                          {/* DOSSIER */}

                          <td>

                            <div className="flex items-center gap-2">

                              <FileText
                                size={16}
                                className="text-base-content/50"
                              />

                              <span className="font-medium">
                                {
                                  patient.numeroDossier
                                }
                              </span>

                            </div>

                          </td>

                          {/* SEXE */}

                          <td>

                            <span className="badge badge-outline">

                              {patient.sexe}

                            </span>

                          </td>

                          {/* TELEPHONE */}

                          <td>

                            {patient.telephone ? (

                              <div className="flex items-center gap-2">

                                <Phone
                                  size={15}
                                  className="text-base-content/50"
                                />

                                <span>
                                  {
                                    patient.telephone
                                  }
                                </span>

                              </div>

                            ) : (

                              <span className="text-base-content/40">
                                —
                              </span>

                            )}

                          </td>

                          {/* ACTIVITÉ MÉDICALE */}

                          <td>

                            <div className="flex flex-wrap gap-1">

                              <span
                                className="badge badge-info badge-outline"
                                title="Rendez-vous"
                              >
                                RDV{" "}
                                {
                                  patient
                                    ._count
                                    .rendezVous
                                }
                              </span>

                              <span
                                className="badge badge-primary badge-outline"
                                title="Consultations"
                              >
                                Consult.{" "}
                                {
                                  patient
                                    ._count
                                    .consultations
                                }
                              </span>

                              <span
                                className="badge badge-secondary badge-outline"
                                title="Hospitalisations"
                              >
                                Hosp.{" "}
                                {
                                  patient
                                    ._count
                                    .hospitalisations
                                }
                              </span>

                            </div>

                          </td>

                          {/* STATUT */}

                          <td>

                            {patient.actif ? (

                              <span className="badge badge-success gap-1">

                                <CheckCircle2
                                  size={13}
                                />

                                Actif

                              </span>

                            ) : (

                              <span className="badge badge-error gap-1">

                                <XCircle
                                  size={13}
                                />

                                Inactif

                              </span>

                            )}

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="flex justify-end gap-1">

                              {/* VOIR */}

                              <Link
                                href={`/patients/${patient.id}`}
                                className="btn btn-sm btn-ghost tooltip"
                                data-tip="Voir le patient"
                              >

                                <Eye
                                  size={16}
                                />

                              </Link>

                              {/* MODIFIER */}

                              <Link
                                href={`/patients/${patient.id}/modifier`}
                                className="btn btn-sm btn-outline tooltip"
                                data-tip="Modifier"
                              >

                                <Pencil
                                  size={16}
                                />

                              </Link>

                              {/* ACTIVER / DÉSACTIVER */}

                              <button
                                type="button"
                                disabled={
                                  loading
                                }
                                onClick={() =>
                                  handleToggle(
                                    patient
                                  )
                                }
                                className={`btn btn-sm tooltip ${
                                  patient.actif
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                                data-tip={
                                  patient.actif
                                    ? "Désactiver"
                                    : "Activer"
                                }
                              >

                                {loading ? (

                                  <span className="loading loading-spinner loading-xs" />

                                ) : (

                                  <Power
                                    size={16}
                                  />

                                )}

                              </button>

                              {/* SUPPRIMER */}

                              <button
                                type="button"
                                disabled={
                                  loading
                                }
                                onClick={() =>
                                  handleDelete(
                                    patient
                                  )
                                }
                                className="btn btn-sm btn-error btn-outline tooltip"
                                data-tip="Supprimer"
                              >

                                {loading ? (

                                  <span className="loading loading-spinner loading-xs" />

                                ) : (

                                  <Trash2
                                    size={16}
                                  />

                                )}

                              </button>

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

          {/* =================================================
              PAGINATION
          ================================================= */}

          {patientsFiltres.length > 0 && (

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-base-200">

              <p className="text-sm text-base-content/60">

                {patientsFiltres.length}{" "}

                patient
                {patientsFiltres.length >
                1
                  ? "s"
                  : ""}

              </p>

              <div className="join">

                <button
                  type="button"
                  className="join-item btn btn-sm"
                  disabled={
                    pageActuelle === 1
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.max(
                          1,
                          previous - 1
                        )
                    )
                  }
                >

                  <ChevronLeft
                    size={17}
                  />

                </button>

                <button
                  type="button"
                  className="join-item btn btn-sm pointer-events-none"
                >

                  Page{" "}
                  {pageActuelle} /{" "}
                  {totalPages}

                </button>

                <button
                  type="button"
                  className="join-item btn btn-sm"
                  disabled={
                    pageActuelle ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.min(
                          totalPages,
                          previous + 1
                        )
                    )
                  }
                >

                  <ChevronRight
                    size={17}
                  />

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
