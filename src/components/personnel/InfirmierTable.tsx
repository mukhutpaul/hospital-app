"use client";

import { useState } from "react";

import {
  Pencil,
  Trash2,
  Power,
  Search,
  UserRound,
  Plus,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteInfirmier,
  toggleInfirmier,
} from "@/app/actions/infirmiers";

import type { Infirmier } from "./InfirmierForm";
import InfirmierModal from "./InfirmierModal";

/* ==========================================================
   TYPES
========================================================== */

type Service = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  infirmiers?: Infirmier[];
  services?: Service[];
  roles?: Role[];
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function InfirmierTable({
  infirmiers = [],
  services = [],
  roles = [],
}: Props) {
  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<Infirmier | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  /* ========================================================
     RECHERCHE
  ======================================================== */

  const filtered = infirmiers.filter((infirmier) => {
    const value = `
      ${infirmier.matricule ?? ""}
      ${infirmier.nom ?? ""}
      ${infirmier.postNom ?? ""}
      ${infirmier.prenom ?? ""}
      ${infirmier.sexe ?? ""}
      ${infirmier.telephone ?? ""}
      ${infirmier.email ?? ""}
      ${infirmier.fonction ?? ""}
      ${infirmier.numeroOrdre ?? ""}
      ${infirmier.grade ?? ""}
      ${infirmier.niveau ?? ""}
    `
      .toLowerCase()
      .trim();

    return value.includes(
      search.toLowerCase().trim()
    );
  });

  /* ========================================================
     CRÉER
  ======================================================== */

  function handleCreate() {
    setSelected(null);
    setShowModal(true);
  }

  /* ========================================================
     MODIFIER
  ======================================================== */

  function handleEdit(infirmier: Infirmier) {
    setSelected(infirmier);
    setShowModal(true);
  }

  /* ========================================================
     SUPPRIMER
  ======================================================== */

  async function handleDelete(
    infirmier: Infirmier
  ) {
    const result = await Swal.fire({
      title: "Supprimer l'infirmier ?",

      html: `
        <div style="text-align:center">
          <p>Voulez-vous vraiment supprimer :</p>

          <strong>
            ${infirmier.nom ?? ""}
            ${infirmier.postNom ?? ""}
            ${infirmier.prenom ?? ""}
          </strong>

          <p style="margin-top:8px">
            Matricule :
            <strong>${infirmier.matricule}</strong>
          </p>

          <p style="margin-top:12px">
            Cette action est irréversible.
          </p>
        </div>
      `,

      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setLoadingId(infirmier.id);

    try {
      const response =
        await deleteInfirmier(infirmier.id);

      if (!response.success) {
        await Swal.fire({
          title: "Erreur",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });

        return;
      }

      await Swal.fire({
        title: "Supprimé !",
        text: response.message,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "DELETE INFIRMIER:",
        error
      );

      await Swal.fire({
        title: "Erreur",
        text:
          "Une erreur est survenue lors de la suppression.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoadingId(null);
    }
  }

  /* ========================================================
     ACTIVER / DÉSACTIVER
  ======================================================== */

  async function handleToggle(
    infirmier: Infirmier
  ) {
    const action = infirmier.actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title: infirmier.actif
        ? "Désactiver l'infirmier ?"
        : "Activer l'infirmier ?",

      html: `
        <div style="text-align:center">
          <p>Voulez-vous ${action} :</p>

          <strong>
            ${infirmier.nom ?? ""}
            ${infirmier.postNom ?? ""}
            ${infirmier.prenom ?? ""}
          </strong>

          <p style="margin-top:8px">
            Matricule :
            <strong>${infirmier.matricule}</strong>
          </p>
        </div>
      `,

      icon: "question",
      showCancelButton: true,

      confirmButtonText: infirmier.actif
        ? "Oui, désactiver"
        : "Oui, activer",

      cancelButtonText: "Annuler",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setLoadingId(infirmier.id);

    try {
      const response =
        await toggleInfirmier(infirmier.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    } catch (error) {
      console.error(
        "TOGGLE INFIRMIER:",
        error
      );

      toast.error(
        "Impossible de modifier le statut."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* ========================================================
     SERVICE
  ======================================================== */

  function getServiceName(
    serviceId: number | null
  ) {
    if (!serviceId) {
      return "Non affecté";
    }

    return (
      services.find(
        (service) =>
          service.id === serviceId
      )?.nom ?? "Service inconnu"
    );
  }

  /* ========================================================
     FERMER MODAL
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
      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
          />

          <input
            type="text"
            placeholder="Rechercher un infirmier..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="input input-bordered w-full pl-10"
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <Plus size={18} />
          Nouvel infirmier
        </button>
      </div>

      {/* ====================================================
          TABLE
      ==================================================== */}

      <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300">
        <table className="table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Infirmier</th>
              <th>Sexe</th>
              <th>Téléphone</th>
              <th>Fonction</th>
              <th>Service</th>
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
                    <UserRound size={40} />

                    <span>
                      {search.trim()
                        ? "Aucun infirmier ne correspond à votre recherche."
                        : "Aucun infirmier enregistré."}
                    </span>

                    {!search.trim() && (
                      <button
                        type="button"
                        onClick={handleCreate}
                        className="btn btn-primary btn-sm mt-2"
                      >
                        <Plus size={16} />
                        Ajouter le premier infirmier
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((infirmier) => {
                const isLoading =
                  loadingId === infirmier.id;

                return (
                  <tr
                    key={infirmier.id}
                    className="hover"
                  >
                    <td>
                      <span className="font-mono font-semibold">
                        {infirmier.matricule ?? "-"}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div className="font-semibold">
                          {infirmier.nom ?? "-"}{" "}
                          {infirmier.postNom ?? ""}
                        </div>

                        <div className="text-sm text-base-content/60">
                          {infirmier.prenom ?? "-"}
                        </div>
                      </div>
                    </td>

                    <td>
                      {infirmier.sexe === "M"
                        ? "Masculin"
                        : infirmier.sexe === "F"
                        ? "Féminin"
                        : "-"}
                    </td>

                    <td>
                      {infirmier.telephone ?? "-"}
                    </td>

                    <td>
                      {infirmier.fonction ?? "-"}
                    </td>

                    <td>
                      {getServiceName(
                        infirmier.serviceId
                      )}
                    </td>

                    <td>
                      {infirmier.actif ? (
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
                      <div className="flex justify-end gap-1">

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Modifier"
                          onClick={() =>
                            handleEdit(
                              infirmier
                            )
                          }
                          disabled={isLoading}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className={`btn btn-ghost btn-sm ${
                            infirmier.actif
                              ? "text-warning"
                              : "text-success"
                          }`}
                          title={
                            infirmier.actif
                              ? "Désactiver"
                              : "Activer"
                          }
                          onClick={() =>
                            handleToggle(
                              infirmier
                            )
                          }
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(
                              infirmier
                            )
                          }
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>

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
          MODAL
      ==================================================== */}

      <InfirmierModal
        open={showModal}
        onClose={handleCloseModal}
        services={services}
        roles={roles}
        infirmier={selected}
      />
    </>
  );
}