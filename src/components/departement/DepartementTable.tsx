"use client";

import {
  deleteDepartement,
  toggleDepartement,
} from "@/app/actions/departement";

import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  Eye,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

type Departement = {
  id: number;
  code: string | null;
  nom: string;
  description: string | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    services: number;
  };
};

type Props = {
  departements: Departement[];
};

export default function DepartementTable({
  departements,
}: Props) {
  const [loadingId, setLoadingId] = useState<number | null>(
    null
  );

  /*
  |--------------------------------------------------------------------------
  | ACTIVER / DÉSACTIVER
  |--------------------------------------------------------------------------
  */

  async function handleToggle(departement: Departement) {
    const action = departement.actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title: `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } le département ?`,
      text: `Voulez-vous vraiment ${action} le département « ${departement.nom} » ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoadingId(departement.id);

    try {
      const response = await toggleDepartement(
        departement.id
      );

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
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

  async function handleDelete(departement: Departement) {
    const result = await Swal.fire({
      title: "Supprimer le département ?",
      html: `
        <div class="text-sm">
          Vous êtes sur le point de supprimer
          <strong>${departement.nom}</strong>.
          <br />
          Cette action est irréversible.
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoadingId(departement.id);

    try {
      const response = await deleteDepartement(
        departement.id
      );

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
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

  if (departements.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center">
        <div className="text-4xl mb-3">
          🏥
        </div>

        <h3 className="font-semibold text-lg">
          Aucun département
        </h3>

        <p className="text-base-content/60 mt-1">
          Aucun département n&apos;a encore été enregistré.
        </p>

        <Link
          href="/departements/nouveau"
          className="btn btn-primary mt-5"
        >
          Nouveau département
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
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Département</th>
            <th>Description</th>
            <th>Services</th>
            <th>Statut</th>
            <th className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {departements.map((departement) => {
            const loading =
              loadingId === departement.id;

            return (
              <tr key={departement.id}>
                {/* CODE */}

                <td>
                  <span className="badge badge-outline">
                    {departement.code || "—"}
                  </span>
                </td>

                {/* DÉPARTEMENT */}

                <td>
                  <div className="font-semibold">
                    {departement.nom}
                  </div>

                  <div className="text-xs text-base-content/50">
                    ID : {departement.id}
                  </div>
                </td>

                {/* DESCRIPTION */}

                <td>
                  <span className="text-sm text-base-content/70">
                    {departement.description ||
                      "Aucune description"}
                  </span>
                </td>

                {/* SERVICES */}

                <td>
                  <span className="badge badge-info badge-outline">
                    {departement._count.services}
                  </span>
                </td>

                {/* STATUT */}

                <td>
                  {departement.actif ? (
                    <span className="badge badge-success">
                      Actif
                    </span>
                  ) : (
                    <span className="badge badge-error">
                      Inactif
                    </span>
                  )}
                </td>

                {/* ACTIONS */}

                <td>
                  <div className="flex justify-end gap-2">

                    {/* VOIR */}

                    <Link
                      href={`/departements/${departement.id}`}
                      className="btn btn-sm btn-ghost"
                      title="Voir le département"
                    >
                      <Eye size={16} />

                      <span className="hidden xl:inline">
                        Voir
                      </span>
                    </Link>

                    {/* MODIFIER */}

                    <Link
                      href={`/departements/${departement.id}/modifier`}
                      className="btn btn-sm btn-outline"
                      title="Modifier le département"
                    >
                      <Pencil size={16} />

                      <span className="hidden xl:inline">
                        Modifier
                      </span>
                    </Link>

                    {/* ACTIVER / DÉSACTIVER */}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleToggle(departement)
                      }
                      className={`btn btn-sm ${
                        departement.actif
                          ? "btn-warning"
                          : "btn-success"
                      }`}
                      title={
                        departement.actif
                          ? "Désactiver"
                          : "Activer"
                      }
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Power size={16} />
                      )}

                      <span className="hidden xl:inline">
                        {departement.actif
                          ? "Désactiver"
                          : "Activer"}
                      </span>
                    </button>

                    {/* SUPPRIMER */}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleDelete(departement)
                      }
                      className="btn btn-sm btn-error btn-outline"
                      title="Supprimer le département"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      <span className="hidden xl:inline">
                        Supprimer
                      </span>
                    </button>

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}