"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Save,
  ShieldCheck,
  Loader2,
  Search,
  RotateCcw,
} from "lucide-react";
import { syncRolePermissions } from "@/app/actions/role";



type Permission = {
  id: number;
  code: string;
  description: string | null;
};

type Props = {
  roleId: number;
  roleNom: string;
  permissions: Permission[];
  permissionsAttribuees: number[];
};

export default function RolePermissions({
  roleId,
  roleNom,
  permissions,
  permissionsAttribuees,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    permissionsAttribuees
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =====================================================
     PERMISSIONS FILTRÉES
  ===================================================== */

  const permissionsFiltrees = useMemo(() => {
    const terme = search.trim().toLowerCase();

    if (!terme) {
      return permissions;
    }

    return permissions.filter((permission) => {
      return (
        permission.code
          .toLowerCase()
          .includes(terme) ||
        permission.description
          ?.toLowerCase()
          .includes(terme)
      );
    });
  }, [permissions, search]);

  /* =====================================================
     TOGGLE PERMISSION
  ===================================================== */

  function togglePermission(permissionId: number) {
    setSelectedIds((previous) => {
      if (previous.includes(permissionId)) {
        return previous.filter(
          (id) => id !== permissionId
        );
      }

      return [...previous, permissionId];
    });

    setMessage("");
    setError("");
  }

  /* =====================================================
     TOUT SÉLECTIONNER
  ===================================================== */

  function selectAll() {
    setSelectedIds(
      permissions.map((permission) => permission.id)
    );

    setMessage("");
    setError("");
  }

  /* =====================================================
     TOUT DÉSÉLECTIONNER
  ===================================================== */

  function deselectAll() {
    setSelectedIds([]);

    setMessage("");
    setError("");
  }

  /* =====================================================
     RÉINITIALISER
  ===================================================== */

  function reset() {
    setSelectedIds(permissionsAttribuees);

    setMessage("");
    setError("");
  }

  /* =====================================================
     SAUVEGARDER
  ===================================================== */

  async function handleSave() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await syncRolePermissions(
        roleId,
        selectedIds
      );

      if (!result.success) {
        setError(
          result.message ||
            "Impossible de mettre à jour les permissions."
        );

        return;
      }

      setMessage(
        result.message ||
          "Permissions mises à jour avec succès."
      );
    } catch (error) {
      console.error(
        "SYNC_PERMISSIONS_ERROR:",
        error
      );

      setError(
        "Une erreur est survenue lors de la sauvegarde."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">

      <div className="card-body">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="card-title">
              <ShieldCheck size={21} />
              Permissions
            </h2>

            <p className="text-sm text-base-content/60 mt-1">
              Sélectionnez les permissions accordées au rôle{" "}
              <span className="font-semibold">
                {roleNom}
              </span>
              .
            </p>
          </div>

          <div className="stats shadow-sm">

            <div className="stat py-3 px-5">

              <div className="stat-title text-xs">
                Permissions
              </div>

              <div className="stat-value text-primary text-2xl">
                {selectedIds.length}
              </div>

              <div className="stat-desc">
                sur {permissions.length}
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="alert alert-error mt-5">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success mt-5">
            <span>{message}</span>
          </div>
        )}

        {/* =================================================
            RECHERCHE
        ================================================= */}

        <div className="flex flex-col md:flex-row gap-3 mt-5">

          <label className="input input-bordered flex items-center gap-2 flex-1">

            <Search
              size={18}
              className="text-base-content/50"
            />

            <input
              type="text"
              placeholder="Rechercher une permission..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="grow"
              disabled={loading}
            />

          </label>

          <div className="flex gap-2">

            <button
              type="button"
              className="btn btn-outline"
              onClick={selectAll}
              disabled={loading || permissions.length === 0}
            >
              Tout sélectionner
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={deselectAll}
              disabled={loading}
            >
              Tout retirer
            </button>

          </div>

        </div>

        {/* =================================================
            LISTE
        ================================================= */}

        {permissionsFiltrees.length === 0 ? (
          <div className="text-center py-12 text-base-content/50">
            Aucune permission trouvée.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">

            {permissionsFiltrees.map((permission) => {

              const selected =
                selectedIds.includes(permission.id);

              return (
                <button
                  key={permission.id}
                  type="button"
                  onClick={() =>
                    togglePermission(permission.id)
                  }
                  disabled={loading}
                  className={`
                    text-left
                    p-4
                    rounded-xl
                    border
                    transition-all
                    ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-base-300 bg-base-100 hover:border-primary/50"
                    }
                  `}
                >

                  <div className="flex items-start gap-3">

                    {/* CHECK */}

                    <div
                      className={`
                        w-6
                        h-6
                        rounded-md
                        border
                        flex
                        items-center
                        justify-center
                        shrink-0
                        mt-0.5
                        ${
                          selected
                            ? "bg-primary border-primary text-primary-content"
                            : "border-base-300"
                        }
                      `}
                    >
                      {selected && (
                        <Check size={15} />
                      )}
                    </div>

                    {/* CONTENU */}

                    <div className="min-w-0">

                      <p className="font-semibold break-words">
                        {permission.code}
                      </p>

                      <p className="text-xs text-base-content/60 mt-1">
                        {permission.description ||
                          "Aucune description"}
                      </p>

                    </div>

                  </div>

                </button>
              );
            })}

          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-base-300">

          <button
            type="button"
            className="btn btn-ghost"
            onClick={reset}
            disabled={loading}
          >
            <RotateCcw size={18} />
            Réinitialiser
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />

                Enregistrer les permissions
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
}