"use client";

import { useMemo, useState } from "react";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  UserRoundPlus,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteMedecin,
  toggleMedecin,
} from "@/app/actions/medecins";

import MedecinForm, {
  type Medecin,
} from "./MedecinForm";

/* ==========================================================
   TYPES
========================================================== */

type Service = {
  id: number;
  nom: string;
};

type Specialite = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

type MedecinWithRelations = Medecin & {
  service: Service | null;
  specialite: Specialite | null;
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  medecins: MedecinWithRelations[];
  services: Service[];
  specialites: Specialite[];
  roles: Role[];
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function MedecinTable({
  medecins,
  services,
  specialites,
  roles,
}: Props) {
  /* ========================================================
     ÉTATS
  ======================================================== */

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "TOUS" | "ACTIFS" | "INACTIFS"
  >("TOUS");

  const [selectedMedecin, setSelectedMedecin] =
    useState<MedecinWithRelations | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  /* ========================================================
     RECHERCHE + FILTRE
  ======================================================== */

  const filteredMedecins = useMemo(() => {
    const value = search.toLowerCase().trim();

    return medecins.filter((medecin) => {
      const matchesSearch =
        !value ||
        medecin.nom.toLowerCase().includes(value) ||
        (medecin.postNom ?? "")
          .toLowerCase()
          .includes(value) ||
        medecin.prenom.toLowerCase().includes(value) ||
        medecin.matricule
          .toLowerCase()
          .includes(value) ||
        (medecin.telephone ?? "")
          .toLowerCase()
          .includes(value) ||
        (medecin.email ?? "")
          .toLowerCase()
          .includes(value) ||
        (medecin.service?.nom ?? "")
          .toLowerCase()
          .includes(value) ||
        (medecin.specialite?.nom ?? "")
          .toLowerCase()
          .includes(value);

      const matchesFilter =
        filter === "TOUS" ||
        (filter === "ACTIFS" && medecin.actif) ||
        (filter === "INACTIFS" && !medecin.actif);

      return matchesSearch && matchesFilter;
    });
  }, [medecins, search, filter]);

  /* ========================================================
     SUPPRESSION
  ======================================================== */

  async function handleDelete(medecin: Medecin) {
    const result = await Swal.fire({
      title: "Supprimer ce médecin ?",

      html: `
        <div style="text-align:center">
          <p>
            Vous êtes sur le point de supprimer :
          </p>

          <strong>
            Dr ${medecin.nom}
            ${medecin.postNom ?? ""}
            ${medecin.prenom}
          </strong>

          <p style="margin-top:8px">
            Matricule :
            <strong>
              ${medecin.matricule}
            </strong>
          </p>

          <p style="margin-top:12px">
            Cette action peut être impossible si
            le médecin possède déjà des consultations.
          </p>
        </div>
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Oui, supprimer",

      cancelButtonText: "Annuler",

      confirmButtonColor: "#d33",

      reverseButtons: true,

      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await deleteMedecin(medecin.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    } catch (error) {
      console.error("DELETE MEDECIN:", error);

      toast.error(
        "Une erreur est survenue lors de la suppression."
      );
    }
  }

  /* ========================================================
     ACTIVER / DÉSACTIVER
  ======================================================== */

  async function handleToggle(medecin: Medecin) {
    const action = medecin.actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title:
        `${action.charAt(0).toUpperCase()}${action.slice(
          1
        )} le médecin ?`,

      text: `Dr ${medecin.nom} ${medecin.prenom}`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText: `Oui, ${action}`,

      cancelButtonText: "Annuler",

      reverseButtons: true,

      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await toggleMedecin(medecin.id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
    } catch (error) {
      console.error("TOGGLE MEDECIN:", error);

      toast.error(
        "Impossible de modifier le statut."
      );
    }
  }

  /* ========================================================
     FERMETURE
  ======================================================== */

  function closeCreate() {
    setShowCreate(false);
  }

  function closeEdit() {
    setSelectedMedecin(null);
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <>
      {/* ====================================================
          CARD PRINCIPALE
      ==================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-0">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="p-5 border-b border-base-200">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold">
                  Liste des médecins
                </h2>

                <p className="text-sm text-base-content/60">
                  {filteredMedecins.length} médecin
                  {filteredMedecins.length > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(true)
                }
                className="btn btn-primary"
              >
                <UserRoundPlus size={18} />

                Nouveau médecin
              </button>

            </div>

            {/* ==================================================
                RECHERCHE + FILTRE
            ================================================== */}

            <div className="flex flex-col md:flex-row gap-3 mt-5">

              <label className="input input-bordered flex items-center gap-2 flex-1">

                <Search
                  size={18}
                  className="opacity-60"
                />

                <input
                  type="text"
                  placeholder="Rechercher par nom, matricule, service..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="grow"
                />

              </label>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value as
                      | "TOUS"
                      | "ACTIFS"
                      | "INACTIFS"
                  )
                }
                className="select select-bordered"
              >
                <option value="TOUS">
                  Tous les médecins
                </option>

                <option value="ACTIFS">
                  Actifs
                </option>

                <option value="INACTIFS">
                  Inactifs
                </option>
              </select>

            </div>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="overflow-x-auto">

            <table className="table">

              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Service</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredMedecins.length === 0 ? (

                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-2 text-base-content/50">

                        <Search size={32} />

                        <span>
                          {search.trim()
                            ? "Aucun médecin ne correspond à votre recherche."
                            : "Aucun médecin enregistré."}
                        </span>

                        {!search.trim() && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm mt-2"
                            onClick={() =>
                              setShowCreate(true)
                            }
                          >
                            <UserRoundPlus
                              size={16}
                            />

                            Ajouter un médecin
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>

                ) : (

                  filteredMedecins.map(
                    (medecin) => (
                      <tr
                        key={medecin.id}
                        className="hover"
                      >

                        {/* MATRICULE */}

                        <td>
                          <span className="font-mono text-sm font-semibold">
                            {medecin.matricule}
                          </span>
                        </td>

                        {/* MÉDECIN */}

                        <td>
                          <div className="font-medium">
                            Dr{" "}
                            {medecin.nom}{" "}
                            {medecin.postNom ?? ""}{" "}
                            {medecin.prenom}
                          </div>

                          {medecin.email && (
                            <div className="text-xs text-base-content/50">
                              {medecin.email}
                            </div>
                          )}
                        </td>

                        {/* SPÉCIALITÉ */}

                        <td>
                          {medecin.specialite ? (
                            <span className="badge badge-outline">
                              {
                                medecin
                                  .specialite
                                  .nom
                              }
                            </span>
                          ) : (
                            <span className="text-base-content/40">
                              Non définie
                            </span>
                          )}
                        </td>

                        {/* SERVICE */}

                        <td>
                          {medecin.service?.nom ?? (
                            <span className="text-base-content/40">
                              Non affecté
                            </span>
                          )}
                        </td>

                        {/* TÉLÉPHONE */}

                        <td>
                          {medecin.telephone ??
                            "—"}
                        </td>

                        {/* STATUT */}

                        <td>
                          {medecin.actif ? (
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

                        <td className="text-right">

                          <div className="dropdown dropdown-end">

                            <button
                              type="button"
                              tabIndex={0}
                              className="btn btn-ghost btn-sm"
                              title="Actions"
                            >
                              <MoreHorizontal
                                size={20}
                              />
                            </button>

                            <ul
                              tabIndex={0}
                              className="
                                dropdown-content
                                menu
                                bg-base-100
                                rounded-box
                                z-50
                                w-52
                                p-2
                                shadow
                                border
                                border-base-200
                              "
                            >

                              {/* MODIFIER */}

                              <li>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMedecin(
                                      medecin
                                    )
                                  }
                                >
                                  <Pencil
                                    size={16}
                                  />

                                  Modifier
                                </button>
                              </li>

                              {/* STATUT */}

                              <li>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggle(
                                      medecin
                                    )
                                  }
                                >
                                  {medecin.actif ? (
                                    <>
                                      <XCircle
                                        size={16}
                                      />

                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2
                                        size={16}
                                      />

                                      Activer
                                    </>
                                  )}
                                </button>
                              </li>

                              {/* SUPPRIMER */}

                              <li>
                                <button
                                  type="button"
                                  className="text-error"
                                  onClick={() =>
                                    handleDelete(
                                      medecin
                                    )
                                  }
                                >
                                  <Trash2
                                    size={16}
                                  />

                                  Supprimer
                                </button>
                              </li>

                            </ul>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>
        </div>
      </div>

      {/* ====================================================
          MODAL CRÉATION
      ==================================================== */}

      {showCreate && (
        <dialog
          open
          className="modal modal-open"
        >

          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="font-bold text-xl">
                  Nouveau médecin
                </h3>

                <p className="text-sm text-base-content/60">
                  Enregistrer un nouveau médecin
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeCreate}
                aria-label="Fermer"
              >
                ✕
              </button>

            </div>

            <MedecinForm
              services={services}
              specialites={specialites}
              roles={roles}
              onClose={closeCreate}
            />

          </div>

          <div
            className="modal-backdrop"
            onClick={closeCreate}
          />

        </dialog>
      )}

      {/* ====================================================
          MODAL MODIFICATION
      ==================================================== */}

      {selectedMedecin && (
        <dialog
          open
          className="modal modal-open"
        >

          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="font-bold text-xl">
                  Modifier le médecin
                </h3>

                <p className="text-sm text-base-content/60">
                  Matricule :{" "}
                  <span className="font-mono font-semibold">
                    {selectedMedecin.matricule}
                  </span>
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeEdit}
                aria-label="Fermer"
              >
                ✕
              </button>

            </div>

            <MedecinForm
              services={services}
              specialites={specialites}
              roles={roles}
              medecin={selectedMedecin}
              onClose={closeEdit}
            />

          </div>

          <div
            className="modal-backdrop"
            onClick={closeEdit}
          />

        </dialog>
      )}
    </>
  );
}