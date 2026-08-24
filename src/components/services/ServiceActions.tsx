"use client";

import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Pencil, Eye, Power, Trash2 } from "lucide-react";
import { deleteService, toggleService } from "@/app/actions/services";



type Props = {
  id: number;
  actif: boolean;
};

export default function ServiceActions({
  id,
  actif,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = actif ? "désactiver" : "activer";

    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} le service ?`,
      text: actif
        ? "Le service ne sera plus disponible comme service actif."
        : "Le service sera de nouveau actif.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const response = await toggleService(id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(
        response.message || "Statut du service modifié."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue lors de la modification."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Supprimer ce service ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const response = await deleteService(id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      await Swal.fire({
        title: "Supprimé !",
        text:
          response.message ||
          "Le service a été supprimé avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue lors de la suppression."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {/* VOIR */}

      <Link
        href={`/services/${id}`}
        className="btn btn-sm btn-ghost"
        title="Voir le service"
      >
        <Eye size={16} />
        <span className="hidden xl:inline">
          Voir
        </span>
      </Link>

      {/* MODIFIER */}

      <Link
        href={`/services/${id}/modifier`}
        className="btn btn-sm btn-outline"
        title="Modifier le service"
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
        onClick={handleToggle}
        className={`btn btn-sm ${
          actif
            ? "btn-warning"
            : "btn-success"
        }`}
        title={
          actif
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
          {actif
            ? "Désactiver"
            : "Activer"}
        </span>
      </button>

      {/* SUPPRIMER */}

      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="btn btn-sm btn-error btn-outline"
        title="Supprimer le service"
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
  );
}