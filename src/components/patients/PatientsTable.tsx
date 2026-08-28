"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  Filter,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  FileText,
  UserRound,
  X,
} from "lucide-react";

type Patient = {
  id: number;

  numeroDossier: string;

  nom: string;
  postNom?: string | null;
  prenom?: string | null;

  sexe?: string | null;

  telephone?: string | null;
  email?: string | null;

  photo?: string | null;

  actif?: boolean;

  createdAt?: Date | string;
};

const ELEMENTS_PAR_PAGE = 10;

export default function PatientsTable({
  patients,
  onDelete,
}: {
  patients: Patient[];
  onDelete?: (id: number) => Promise<void>;
}) {
  /* ==========================================================
     STATES
  ========================================================== */

  const [search, setSearch] = useState("");

  const [statut, setStatut] = useState("TOUS");

  const [sexe, setSexe] = useState("TOUS");

  const [page, setPage] = useState(1);

  const [loadingDelete, setLoadingDelete] =
    useState<number | null>(null);

  /* ==========================================================
     NOM COMPLET
  ========================================================== */

  function getFullName(patient: Patient) {
    return [
      patient.nom,
      patient.postNom,
      patient.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  }

  /* ==========================================================
     STATISTIQUES
  ========================================================== */

  const totalPatients = patients.length;

  const patientsActifs = patients.filter(
    (patient) => patient.actif
  ).length;

  const patientsInactifs =
    totalPatients - patientsActifs;

  /* ==========================================================
     FILTRAGE
  ========================================================== */

  const filteredPatients = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return patients.filter((patient) => {
      const fullName =
        getFullName(patient).toLowerCase();

      const numeroDossier =
        patient.numeroDossier
          ?.toLowerCase() ?? "";

      const telephone =
        patient.telephone
          ?.toLowerCase() ?? "";

      const email =
        patient.email
          ?.toLowerCase() ?? "";

      /* ------------------------------------------------------
         RECHERCHE
      ------------------------------------------------------ */

      const matchSearch =
        !value ||
        fullName.includes(value) ||
        numeroDossier.includes(value) ||
        telephone.includes(value) ||
        email.includes(value);

      /* ------------------------------------------------------
         STATUT
      ------------------------------------------------------ */

      const matchStatut =
        statut === "TOUS" ||
        (statut === "ACTIF" &&
          patient.actif === true) ||
        (statut === "INACTIF" &&
          patient.actif === false);

      /* ------------------------------------------------------
         SEXE
      ------------------------------------------------------ */

      const matchSexe =
        sexe === "TOUS" ||
        patient.sexe === sexe;

      return (
        matchSearch &&
        matchStatut &&
        matchSexe
      );
    });
  }, [
    patients,
    search,
    statut,
    sexe,
  ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPatients.length /
        ELEMENTS_PAR_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedPatients =
    filteredPatients.slice(
      (currentPage - 1) *
        ELEMENTS_PAR_PAGE,
      currentPage *
        ELEMENTS_PAR_PAGE
    );

  /* ==========================================================
     RESET FILTRES
  ========================================================== */

  function resetFilters() {
    setSearch("");
    setStatut("TOUS");
    setSexe("TOUS");
    setPage(1);
  }

  const hasFilters =
    search ||
    statut !== "TOUS" ||
    sexe !== "TOUS";

  /* ==========================================================
     SUPPRESSION
  ========================================================== */

  async function handleDelete(
    patient: Patient
  ) {
    if (!onDelete) {
      toast.error(
        "La suppression n'est pas configurée."
      );

      return;
    }

    const result = await Swal.fire({
      title: "Supprimer ce patient ?",

      html: `
        <div class="text-sm">
          Vous êtes sur le point de supprimer
          <br/>
          <strong>${getFullName(
            patient
          )}</strong>
          <br/><br/>
          Cette opération peut avoir des conséquences
          sur les données médicales liées à ce patient.
        </div>
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Oui, supprimer",

      cancelButtonText:
        "Annuler",

      confirmButtonColor: "#dc2626",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingDelete(patient.id);

      await onDelete(patient.id);

      toast.success(
        "Patient supprimé avec succès."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de supprimer le patient."
      );
    } finally {
      setLoadingDelete(null);
    }
  }

  /* ==========================================================
     EMPTY GLOBAL
  ========================================================== */

  if (patients.length === 0) {
    return (
      <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center shadow-sm">

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">

          <Users size={38} />

        </div>

        <h3 className="text-xl font-bold">
          Aucun patient enregistré
        </h3>

        <p className="mx-auto mt-2 max-w-md text-base-content/60">
          Aucun patient n&apos;a encore été
          enregistré dans le système.
        </p>

        <Link
          href="/patients/nouveau"
          className="btn btn-primary mt-6"
        >
          Ajouter un patient
        </Link>

      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================
          STATISTIQUES
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Total patients
              </p>

              <p className="mt-1 text-3xl font-black">
                {totalPatients}
              </p>

            </div>

            <div className="rounded-2xl bg-primary/10 p-4 text-primary">

              <Users size={28} />

            </div>

          </div>

        </div>

        {/* ACTIFS */}

        <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Patients actifs
              </p>

              <p className="mt-1 text-3xl font-black text-success">
                {patientsActifs}
              </p>

            </div>

            <div className="rounded-2xl bg-success/10 p-4 text-success">

              <UserCheck size={28} />

            </div>

          </div>

        </div>

        {/* INACTIFS */}

        <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-base-content/60">
                Patients inactifs
              </p>

              <p className="mt-1 text-3xl font-black text-error">
                {patientsInactifs}
              </p>

            </div>

            <div className="rounded-2xl bg-error/10 p-4 text-error">

              <UserX size={28} />

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          FILTRES
      ======================================================= */}

      <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="rounded-lg bg-primary/10 p-2 text-primary">

              <Filter size={18} />

            </div>

            <div>

              <h2 className="font-bold">
                Recherche et filtres
              </h2>

              <p className="text-xs text-base-content/50">
                Trouvez rapidement un patient
              </p>

            </div>

          </div>

          {hasFilters && (

            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-sm btn-ghost"
            >

              <RotateCcw size={16} />

              Réinitialiser

            </button>

          )}

        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">

          {/* RECHERCHE */}

          <label className="input input-bordered flex items-center gap-2 lg:col-span-6">

            <Search
              size={18}
              className="text-base-content/50"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );

                setPage(1);
              }}
              placeholder="Nom, prénom, dossier, téléphone ou email..."
              className="grow"
            />

            {search && (

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="text-base-content/50 hover:text-error"
              >

                <X size={18} />

              </button>

            )}

          </label>

          {/* STATUT */}

          <select
            className="select select-bordered w-full lg:col-span-3"
            value={statut}
            onChange={(event) => {
              setStatut(
                event.target.value
              );

              setPage(1);
            }}
          >

            <option value="TOUS">
              Tous les statuts
            </option>

            <option value="ACTIF">
              Patients actifs
            </option>

            <option value="INACTIF">
              Patients inactifs
            </option>

          </select>

          {/* SEXE */}

          <select
            className="select select-bordered w-full lg:col-span-3"
            value={sexe}
            onChange={(event) => {
              setSexe(
                event.target.value
              );

              setPage(1);
            }}
          >

            <option value="TOUS">
              Tous les sexes
            </option>

            <option value="MASCULIN">
              Masculin
            </option>

            <option value="FEMININ">
              Féminin
            </option>

          </select>

        </div>

        <div className="mt-4 flex items-center justify-between border-t border-base-200 pt-4">

          <p className="text-sm text-base-content/60">

            <span className="font-bold text-base-content">
              {filteredPatients.length}
            </span>

            {" "}patient
            {filteredPatients.length > 1
              ? "s"
              : ""} trouvé
            {filteredPatients.length > 1
              ? "s"
              : ""}

          </p>

          {hasFilters && (

            <span className="badge badge-primary badge-outline">
              Filtres actifs
            </span>

          )}

        </div>

      </div>

      {/* ======================================================
          TABLEAU
      ======================================================= */}

      <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">

        <div className="border-b border-base-200 p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-bold">
                Liste des patients
              </h2>

              <p className="text-sm text-base-content/60">
                Gestion des dossiers patients
              </p>

            </div>

            <div className="badge badge-neutral">
              {filteredPatients.length}
            </div>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="table table-zebra">

            <thead>

              <tr>

                <th>#</th>

                <th>Patient</th>

                <th>Dossier</th>

                <th>Sexe</th>

                <th>Contact</th>

                <th>Statut</th>

                <th className="text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedPatients.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="py-16"
                  >

                    <div className="flex flex-col items-center text-center">

                      <Search
                        size={42}
                        className="text-base-content/30"
                      />

                      <h3 className="mt-4 font-bold">
                        Aucun patient trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        Modifiez vos critères de recherche.
                      </p>

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="btn btn-sm btn-primary mt-4"
                      >

                        Réinitialiser les filtres

                      </button>

                    </div>

                  </td>

                </tr>

              ) : (

                paginatedPatients.map(
                  (patient, index) => {

                    const loading =
                      loadingDelete === patient.id;

                    return (

                      <tr
                        key={patient.id}
                        className="hover:bg-base-200/50"
                      >

                        <td className="text-base-content/50">

                          {(currentPage - 1) *
                            ELEMENTS_PAR_PAGE +
                            index +
                            1}

                        </td>

                        {/* PATIENT */}

                        <td>

                          <div className="flex items-center gap-3">

                            <div className="avatar placeholder">

                              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary">

                                {patient.photo ? (

                                  <img
                                    src={patient.photo}
                                    alt={getFullName(patient)}
                                  />

                                ) : (

                                  <UserRound size={20} />

                                )}

                              </div>

                            </div>

                            <div>

                              <div className="font-semibold">

                                {getFullName(patient)}

                              </div>

                              {patient.email && (

                                <div className="flex items-center gap-1 text-xs text-base-content/50">

                                  <Mail size={12} />

                                  {patient.email}

                                </div>

                              )}

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

                            <span className="badge badge-outline">

                              {patient.numeroDossier}

                            </span>

                          </div>

                        </td>

                        {/* SEXE */}

                        <td>

                          <span className="badge badge-ghost">

                            {patient.sexe || "—"}

                          </span>

                        </td>

                        {/* CONTACT */}

                        <td>

                          {patient.telephone ? (

                            <div className="flex items-center gap-2">

                              <Phone
                                size={15}
                                className="text-base-content/50"
                              />

                              {patient.telephone}

                            </div>

                          ) : (

                            <span className="text-base-content/40">
                              —
                            </span>

                          )}

                        </td>

                        {/* STATUT */}

                        <td>

                          {patient.actif ? (

                            <span className="badge badge-success gap-1">

                              <UserCheck size={13} />

                              Actif

                            </span>

                          ) : (

                            <span className="badge badge-error gap-1">

                              <UserX size={13} />

                              Inactif

                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="flex justify-end gap-1">

                            <Link
                              href={`/patients/${patient.id}`}
                              className="btn btn-sm btn-ghost tooltip"
                              data-tip="Voir"
                            >

                              <Eye size={17} />

                            </Link>

                            <Link
                              href={`/patients/${patient.id}/modifier`}
                              className="btn btn-sm btn-warning btn-outline tooltip"
                              data-tip="Modifier"
                            >

                              <Pencil size={16} />

                            </Link>

                            {onDelete && (

                              <button
                                type="button"
                                disabled={loading}
                                onClick={() =>
                                  handleDelete(patient)
                                }
                                className="btn btn-sm btn-error btn-outline tooltip"
                                data-tip="Supprimer"
                              >

                                {loading ? (

                                  <span className="loading loading-spinner loading-xs" />

                                ) : (

                                  <Trash2 size={16} />

                                )}

                              </button>

                            )}

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

        {/* ====================================================
            PAGINATION
        ===================================================== */}

        {filteredPatients.length > 0 && (

          <div className="flex flex-col gap-4 border-t border-base-200 p-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-base-content/60">

              Affichage de{" "}

              <strong>
                {(currentPage - 1) *
                  ELEMENTS_PAR_PAGE +
                  1}
              </strong>

              {" "}à{" "}

              <strong>

                {Math.min(
                  currentPage *
                    ELEMENTS_PAR_PAGE,
                  filteredPatients.length
                )}

              </strong>

              {" "}sur{" "}

              <strong>
                {filteredPatients.length}
              </strong>

              {" "}patients

            </p>

            <div className="join">

              <button
                type="button"
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(
                    Math.max(
                      1,
                      currentPage - 1
                    )
                  )
                }
              >

                <ChevronLeft size={17} />

              </button>

              <button
                type="button"
                className="join-item btn btn-sm pointer-events-none"
              >

                Page {currentPage} / {totalPages}

              </button>

              <button
                type="button"
                className="join-item btn btn-sm"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(
                    Math.min(
                      totalPages,
                      currentPage + 1
                    )
                  )
                }
              >

                <ChevronRight size={17} />

              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}