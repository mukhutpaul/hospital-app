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
  deleteEmploye,
  toggleEmploye,
} from "@/app/actions/employes";

import type { Employe } from "./EmployeForm";
import EmployeModal from "./EmployeModal";

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

type Props = {
  employes?: Employe[] | null;
  services?: Service[] | null;
  roles?: Role[] | null;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function EmployeTable({
  employes = [],
  services = [],
  roles = [],
}: Props) {
  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<Employe | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  /* ========================================================
     SÉCURISATION DES DONNÉES
  ======================================================== */

  const safeEmployes = Array.isArray(employes)
    ? employes
    : [];

  const safeServices = Array.isArray(services)
    ? services
    : [];

  const safeRoles = Array.isArray(roles)
    ? roles
    : [];

  /* ========================================================
     RECHERCHE
  ======================================================== */

  const searchValue = search
    .toLowerCase()
    .trim();

  const filtered = safeEmployes.filter(
    (employe) => {
      const value = `
        ${employe.matricule || ""}
        ${employe.nom || ""}
        ${employe.postNom || ""}
        ${employe.prenom || ""}
        ${employe.sexe || ""}
        ${employe.telephone || ""}
        ${employe.email || ""}
        ${employe.adresse || ""}
        ${employe.fonction || ""}
        ${employe.service?.nom || ""}
        ${employe.user?.name || ""}
        ${employe.user?.email || ""}
      `
        .toLowerCase()
        .trim();

      return value.includes(searchValue);
    }
  );

  /* ========================================================
     NOUVEL EMPLOYÉ
  ======================================================== */

  function handleCreate() {
    setSelected(null);
    setShowModal(true);
  }

  /* ========================================================
     MODIFIER
  ======================================================== */

  function handleEdit(employe: Employe) {
    setSelected(employe);
    setShowModal(true);
  }

  /* ========================================================
     SUPPRIMER
  ======================================================== */

  async function handleDelete(
    employe: Employe
  ) {
    const result = await Swal.fire({
      title: "Supprimer l'employé ?",

      text: `Voulez-vous vraiment supprimer ${employe.nom} ${
        employe.postNom || ""
      } ${employe.prenom || ""} ?`,

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

    setLoadingId(employe.id);

    try {
      const response =
        await deleteEmploye(
          employe.id
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
    } catch (error) {
      console.error(
        "DELETE EMPLOYE:",
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
    employe: Employe
  ) {
    const isActive = employe.actif;

    const result = await Swal.fire({
      title: isActive
        ? "Désactiver l'employé ?"
        : "Activer l'employé ?",

      text: `Voulez-vous vraiment ${
        isActive
          ? "désactiver"
          : "activer"
      } ${employe.nom} ${
        employe.prenom || ""
      } ?`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText: isActive
        ? "Oui, désactiver"
        : "Oui, activer",

      cancelButtonText:
        "Annuler",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoadingId(employe.id);

    try {
      const response =
        await toggleEmploye(
          employe.id
        );

      if (!response.success) {
        await Swal.fire({
          title: "Erreur",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });

        return;
      }

      toast.success(
        response.message
      );
    } catch (error) {
      console.error(
        "TOGGLE EMPLOYE:",
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
    employe: Employe
  ) {
    if (employe.service?.nom) {
      return employe.service.nom;
    }

    if (employe.serviceId == null) {
      return "Non affecté";
    }

    return (
      safeServices.find(
        (service) =>
          service.id ===
          employe.serviceId
      )?.nom ||
      "Service inconnu"
    );
  }

  /* ========================================================
     COMPTE UTILISATEUR
  ======================================================== */

  function getAccountLabel(
    employe: Employe
  ) {
    if (!employe.user) {
      return "Aucun compte";
    }

    return (
      employe.user.email ||
      employe.user.name ||
      "Compte utilisateur"
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
      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        {/* RECHERCHE */}

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-base-content/50
            "
          />

          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              input
              input-bordered
              w-full
              pl-10
            "
          />
        </div>

        {/* NOUVEL EMPLOYÉ */}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <Plus size={18} />

          Nouvel employé
        </button>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div
        className="
          overflow-x-auto
          bg-base-100
          rounded-xl
          border
          border-base-300
        "
      >
        <table className="table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Employé</th>
              <th>Sexe</th>
              <th>Téléphone</th>
              <th>Fonction</th>
              <th>Service</th>
              <th>Compte</th>
              <th>Statut</th>
              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ==================================================
                AUCUN RÉSULTAT
            ================================================== */}

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center"
                >
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      gap-2
                      text-base-content/50
                    "
                  >
                    <UserRound size={40} />

                    <span>
                      {searchValue
                        ? "Aucun employé ne correspond à votre recherche."
                        : "Aucun employé enregistré."}
                    </span>

                    {!searchValue && (
                      <button
                        type="button"
                        onClick={
                          handleCreate
                        }
                        className="
                          btn
                          btn-primary
                          btn-sm
                          mt-2
                        "
                      >
                        <Plus size={16} />

                        Ajouter le premier
                        employé
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              /* ==================================================
                 EMPLOYÉS
              ================================================== */

              filtered.map(
                (employe) => {
                  const isLoading =
                    loadingId ===
                    employe.id;

                  return (
                    <tr
                      key={employe.id}
                      className="hover"
                    >
                      {/* MATRICULE */}

                      <td>
                        <span
                          className="
                            font-mono
                            font-semibold
                          "
                        >
                          {
                            employe.matricule
                          }
                        </span>
                      </td>

                      {/* EMPLOYÉ */}

                      <td>
                        <div>
                          <div className="font-semibold">
                            {
                              employe.nom
                            }{" "}
                            {
                              employe.postNom ||
                              ""
                            }
                          </div>

                          <div
                            className="
                              text-sm
                              text-base-content/60
                            "
                          >
                            {
                              employe.prenom ||
                              "-"
                            }
                          </div>
                        </div>
                      </td>

                      {/* SEXE */}

                      <td>
                        {employe.sexe ===
                        "M"
                          ? "Masculin"
                          : employe.sexe ===
                            "F"
                          ? "Féminin"
                          : "-"}
                      </td>

                      {/* TÉLÉPHONE */}

                      <td>
                        {
                          employe.telephone ||
                          "-"
                        }
                      </td>

                      {/* FONCTION */}

                      <td>
                        {
                          employe.fonction ||
                          "-"
                        }
                      </td>

                      {/* SERVICE */}

                      <td>
                        {getServiceName(
                          employe
                        )}
                      </td>

                      {/* COMPTE */}

                      <td>
                        {employe.user ? (
                          <div className="flex flex-col gap-1">
                            <span
                              className="
                                badge
                                badge-success
                                badge-sm
                                w-fit
                              "
                            >
                              Créé
                            </span>

                            <span
                              className="
                                text-xs
                                text-base-content/60
                                max-w-[180px]
                                truncate
                              "
                              title={getAccountLabel(
                                employe
                              )}
                            >
                              {getAccountLabel(
                                employe
                              )}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="
                              badge
                              badge-ghost
                              badge-sm
                            "
                          >
                            Aucun compte
                          </span>
                        )}
                      </td>

                      {/* STATUT */}

                      <td>
                        {employe.actif ? (
                          <span
                            className="
                              badge
                              badge-success
                              badge-sm
                            "
                          >
                            Actif
                          </span>
                        ) : (
                          <span
                            className="
                              badge
                              badge-error
                              badge-sm
                            "
                          >
                            Inactif
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div
                          className="
                            flex
                            justify-end
                            gap-1
                          "
                        >
                          {/* MODIFIER */}

                          <button
                            type="button"
                            className="
                              btn
                              btn-ghost
                              btn-sm
                            "
                            title="Modifier"
                            onClick={() =>
                              handleEdit(
                                employe
                              )
                            }
                            disabled={
                              isLoading
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          {/* ACTIVER / DÉSACTIVER */}

                          <button
                            type="button"
                            className={`
                              btn
                              btn-ghost
                              btn-sm
                              ${
                                employe.actif
                                  ? "text-warning"
                                  : "text-success"
                              }
                            `}
                            title={
                              employe.actif
                                ? "Désactiver"
                                : "Activer"
                            }
                            onClick={() =>
                              handleToggle(
                                employe
                              )
                            }
                            disabled={
                              isLoading
                            }
                          >
                            {isLoading ? (
                              <span
                                className="
                                  loading
                                  loading-spinner
                                  loading-xs
                                "
                              />
                            ) : (
                              <Power
                                size={16}
                              />
                            )}
                          </button>

                          {/* SUPPRIMER */}

                          <button
                            type="button"
                            className="
                              btn
                              btn-ghost
                              btn-sm
                              text-error
                            "
                            title="Supprimer"
                            onClick={() =>
                              handleDelete(
                                employe
                              )
                            }
                            disabled={
                              isLoading
                            }
                          >
                            <Trash2
                              size={16}
                            />
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

      {/* ==================================================
          MODAL
      ================================================== */}

      <EmployeModal
        open={showModal}
        onClose={handleCloseModal}
        services={safeServices}
        roles={safeRoles}
        employe={selected}
      />
    </>
  );
}