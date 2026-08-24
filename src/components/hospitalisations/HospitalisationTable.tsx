"use client";

import { useState } from "react";

import {
  Eye,
  Pencil,
  Trash2,
  Power,
  Search,
  Bed,
  Plus,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteHospitalisation,
  updateHospitalisationStatut,
} from "@/app/actions/hospitalisations";

import type {
  Hospitalisation,
} from "./HospitalisationForm";

import HospitalisationModal from "./HospitalisationModal";

/* ==========================================================
   TYPES
========================================================== */

type Props = {
  hospitalisations?:
    | Hospitalisation[]
    | null;

  patients?: any[] | null;
  admissions?: any[] | null;
  medecins?: any[] | null;
  services?: any[] | null;
  lits?: any[] | null;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function HospitalisationTable({
  hospitalisations = [],
  patients = [],
  admissions = [],
  medecins = [],
  services = [],
  lits = [],
}: Props) {
  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState<Hospitalisation | null>(
      null
    );

  const [showModal, setShowModal] =
    useState(false);

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  const safeHospitalisations =
    Array.isArray(hospitalisations)
      ? hospitalisations
      : [];

  /* ========================================================
     RECHERCHE
  ======================================================== */

  const filtered =
    safeHospitalisations.filter(
      (hospitalisation: any) => {
        const patient =
          hospitalisation.patient;

        const service =
          hospitalisation.service;

        const medecin =
          hospitalisation.medecin;

        const lit =
          hospitalisation.lit;

        const value = `
          ${hospitalisation.numero}
          ${patient?.numeroDossier || ""}
          ${patient?.nom || ""}
          ${patient?.postNom || ""}
          ${patient?.prenom || ""}
          ${service?.nom || ""}
          ${medecin?.nom || ""}
          ${medecin?.prenom || ""}
          ${lit?.numero || ""}
          ${lit?.chambre?.numero || ""}
          ${hospitalisation.statut}
        `
          .toLowerCase()
          .trim();

        return value.includes(
          search
            .toLowerCase()
            .trim()
        );
      }
    );

  /* ========================================================
     CREATE
  ======================================================== */

  function handleCreate() {
    setSelected(null);
    setShowModal(true);
  }

  /* ========================================================
     EDIT
  ======================================================== */

  function handleEdit(
    hospitalisation: Hospitalisation
  ) {
    setSelected(hospitalisation);
    setShowModal(true);
  }

  /* ========================================================
     DELETE
  ======================================================== */

  async function handleDelete(
    hospitalisation: Hospitalisation
  ) {
    const result =
      await Swal.fire({
        title:
          "Supprimer l'hospitalisation ?",

        text: `Voulez-vous supprimer ${hospitalisation.numero} ?`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        reverseButtons: true,
      });

    if (!result.isConfirmed) {
      return;
    }

    setLoadingId(
      hospitalisation.id
    );

    try {
      const response =
        await deleteHospitalisation(
          hospitalisation.id
        );

      if (!response.success) {
        await Swal.fire({
          title: "Suppression impossible",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });

        return;
      }

      toast.success(
        response.message
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "DELETE HOSPITALISATION:",
        error
      );

      toast.error(
        "Erreur lors de la suppression."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* ========================================================
     STATUT
  ======================================================== */

  async function handleToggle(
    hospitalisation: Hospitalisation
  ) {
    if (
      hospitalisation.statut ===
      "EN_COURS"
    ) {
      const result =
        await Swal.fire({
          title:
            "Terminer l'hospitalisation ?",

          text:
            "Le patient sera considéré comme sorti de l'hospitalisation.",

          icon: "question",

          showCancelButton: true,

          confirmButtonText:
            "Oui, terminer",

          cancelButtonText:
            "Annuler",

          reverseButtons: true,
        });

      if (!result.isConfirmed) {
        return;
      }

      setLoadingId(
        hospitalisation.id
      );

      try {
        const response =
          await updateHospitalisationStatut(
            hospitalisation.id,
            "TERMINEE"
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

        window.location.reload();
      } catch {
        toast.error(
          "Impossible de modifier le statut."
        );
      } finally {
        setLoadingId(null);
      }
    }
  }

  /* ========================================================
     CLOSE
  ======================================================== */

  function handleCloseModal() {
    setShowModal(false);
    setSelected(null);
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <>
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">

        {/* SEARCH */}

        <div className="relative w-full md:max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
          />

          <input
            type="text"
            placeholder="Rechercher une hospitalisation..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="input input-bordered w-full pl-10"
          />

        </div>

        {/* CREATE */}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <Plus size={18} />

          Nouvelle hospitalisation
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">

        <table className="table">

          <thead>
            <tr>
              <th>Numéro</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Médecin</th>
              <th>Chambre / Lit</th>
              <th>Entrée</th>
              <th>Statut</th>
              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-base-content/50">

                    <Bed size={40} />

                    <span>
                      {search.trim()
                        ? "Aucune hospitalisation ne correspond à votre recherche."
                        : "Aucune hospitalisation enregistrée."}
                    </span>

                    {!search.trim() && (
                      <button
                        type="button"
                        onClick={
                          handleCreate
                        }
                        className="btn btn-primary btn-sm mt-2"
                      >
                        <Plus size={16} />

                        Nouvelle hospitalisation
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(
                (hospitalisation: any) => (
                  <tr
                    key={
                      hospitalisation.id
                    }
                    className="hover"
                  >

                    {/* NUMERO */}

                    <td>
                      <span className="font-mono font-semibold">
                        {
                          hospitalisation.numero
                        }
                      </span>
                    </td>

                    {/* PATIENT */}

                    <td>
                      <div>
                        <div className="font-semibold">
                          {
                            hospitalisation
                              .patient
                              ?.nom
                          }{" "}
                          {
                            hospitalisation
                              .patient
                              ?.postNom
                          }
                        </div>

                        <div className="text-sm text-base-content/60">
                          {
                            hospitalisation
                              .patient
                              ?.prenom ||
                            "-"
                          }
                        </div>

                        <div className="text-xs text-base-content/50">
                          Dossier :{" "}
                          {
                            hospitalisation
                              .patient
                              ?.numeroDossier
                          }
                        </div>
                      </div>
                    </td>

                    {/* SERVICE */}

                    <td>
                      {
                        hospitalisation
                          .service
                          ?.nom ||
                        "-"
                      }
                    </td>

                    {/* MEDECIN */}

                    <td>
                      {hospitalisation
                        .medecin ? (
                        <>
                          Dr.{" "}
                          {
                            hospitalisation
                              .medecin
                              .nom
                          }{" "}
                          {
                            hospitalisation
                              .medecin
                              .prenom
                          }
                        </>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* LIT */}

                    <td>
                      {hospitalisation.lit ? (
                        <div>
                          <div className="font-medium">
                            Chambre{" "}
                            {
                              hospitalisation
                                .lit
                                .chambre
                                ?.numero
                            }
                          </div>

                          <div className="text-sm text-base-content/60">
                            Lit{" "}
                            {
                              hospitalisation
                                .lit
                                .numero
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-base-content/50">
                          Non affecté
                        </span>
                      )}
                    </td>

                    {/* DATE */}

                    <td>
                      {new Date(
                        hospitalisation.dateEntree
                      ).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>

                    {/* STATUT */}

                    <td>
                      {hospitalisation
                        .statut ===
                      "EN_COURS" ? (
                        <span className="badge badge-success badge-sm">
                          En cours
                        </span>
                      ) : hospitalisation
                          .statut ===
                        "TERMINEE" ? (
                        <span className="badge badge-neutral badge-sm">
                          Terminée
                        </span>
                      ) : (
                        <span className="badge badge-error badge-sm">
                          Annulée
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-end gap-1">

                        {/* VOIR */}

                        <a
                          href={`/hospitalisations/${hospitalisation.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Voir le dossier"
                        >
                          <Eye size={16} />
                        </a>

                        {/* MODIFIER */}

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Modifier"
                          onClick={() =>
                            handleEdit(
                              hospitalisation
                            )
                          }
                          disabled={
                            loadingId ===
                            hospitalisation.id
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        {/* TERMINER */}

                        {hospitalisation
                          .statut ===
                          "EN_COURS" && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-warning"
                            title="Terminer"
                            onClick={() =>
                              handleToggle(
                                hospitalisation
                              )
                            }
                            disabled={
                              loadingId ===
                              hospitalisation.id
                            }
                          >
                            {loadingId ===
                            hospitalisation.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>
                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(
                              hospitalisation
                            )
                          }
                          disabled={
                            loadingId ===
                            hospitalisation.id
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <HospitalisationModal
        open={showModal}
        onClose={
          handleCloseModal
        }
        patients={
          Array.isArray(patients)
            ? patients
            : []
        }
        admissions={
          Array.isArray(admissions)
            ? admissions
            : []
        }
        medecins={
          Array.isArray(medecins)
            ? medecins
            : []
        }
        services={
          Array.isArray(services)
            ? services
            : []
        }
        lits={
          Array.isArray(lits)
            ? lits
            : []
        }
        hospitalisation={
          selected
        }
      />
    </>
  );
}