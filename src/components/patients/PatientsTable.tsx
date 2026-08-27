"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function PatientsTable({
  patients,
  onDelete,
}: {
  patients: any[];
  onDelete?: (id: number) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return patients;

    return patients.filter((patient) => {
      const fullName = [
        patient.nom,
        patient.postNom,
        patient.prenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const numeroDossier =
        patient.numeroDossier?.toLowerCase() ?? "";

      const telephone =
        patient.telephone?.toLowerCase() ?? "";

      const email =
        patient.email?.toLowerCase() ?? "";

      return (
        fullName.includes(value) ||
        numeroDossier.includes(value) ||
        telephone.includes(value) ||
        email.includes(value)
      );
    });
  }, [patients, search]);

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "Supprimer ce patient ?",
      text: "Cette opération peut avoir des conséquences sur son dossier.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (!result.isConfirmed || !onDelete) return;

    try {
      setLoadingDelete(id);

      await onDelete(id);

      toast.success("Patient supprimé avec succès");
    } catch {
      toast.error("Impossible de supprimer le patient");
    } finally {
      setLoadingDelete(null);
    }
  }

  return (
    <div className="space-y-5">

      {/* =====================================================
          RECHERCHE AUTOMATIQUE
      ====================================================== */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="relative">

          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-base-content/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un patient : nom, prénom, dossier, téléphone..."
            className="input input-bordered w-full pl-12 pr-12"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="btn btn-circle btn-ghost btn-sm absolute right-2 top-1/2 -translate-y-1/2"
              title="Effacer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-base-content/60">
          <span>
            {filteredPatients.length} patient
            {filteredPatients.length > 1 ? "s" : ""}
          </span>

          {search && (
            <span>
              Recherche : <strong>{search}</strong>
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLEAU
      ====================================================== */}
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>N° dossier</th>
                <th>Sexe</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 rounded-full bg-base-200 p-5">
                        <svg
                          className="h-10 w-10 text-base-content/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>

                      <h3 className="font-semibold">
                        Aucun patient trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        Aucun patient ne correspond à votre recherche.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className="transition-colors hover:bg-base-200/50"
                  >
                    <td>{index + 1}</td>

                    <td>
                      <div className="flex items-center gap-3">

                        <div className="avatar">
                          <div className="h-11 w-11 rounded-full bg-primary text-primary-content">
                            {patient.photo ? (
                              <img
                                src={patient.photo}
                                alt={`${patient.nom}`}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center font-bold">
                                {patient.nom
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold">
                            {patient.nom}{" "}
                            {patient.postNom ?? ""}{" "}
                            {patient.prenom ?? ""}
                          </div>

                          {patient.email && (
                            <div className="text-xs text-base-content/50">
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-outline">
                        {patient.numeroDossier}
                      </span>
                    </td>

                    <td>{patient.sexe}</td>

                    <td>{patient.telephone || "—"}</td>

                    <td>
                      {patient.actif ? (
                        <span className="badge badge-success badge-sm">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-error badge-sm">
                          Inactif
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex justify-center gap-2">

                        <Link
                          href={`/patients/${patient.id}`}
                          className="btn btn-sm btn-info btn-outline"
                        >
                          Détails
                        </Link>

                        <Link
                          href={`/patients/${patient.id}/modifier`}
                          className="btn btn-sm btn-warning btn-outline"
                        >
                          Modifier
                        </Link>

                        <button
                          type="button"
                          disabled={loadingDelete === patient.id}
                          onClick={() =>
                            handleDelete(patient.id)
                          }
                          className="btn btn-sm btn-error btn-outline"
                        >
                          {loadingDelete === patient.id
                            ? "..."
                            : "Supprimer"}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}