
"use client";

import {
  deletePatient,
  togglePatient,
} from "@/app/actions/patient";

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

type Props = {
  id: number;
  nom: string;
  actif: boolean;
};

export default function PatientActions({
  id,
  nom,
  actif,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ACTIVER / DÉSACTIVER
  |--------------------------------------------------------------------------
  */

  async function handleToggle() {
    const action = actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title:
        actif
          ? "Désactiver le patient ?"
          : "Activer le patient ?",

      text: `Voulez-vous vraiment ${action} « ${nom} » ?`,

      icon: "question",

      showCancelButton: true,

      confirmButtonText:
        actif
          ? "Oui, désactiver"
          : "Oui, activer",

      cancelButtonText:
        "Annuler",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await togglePatient(id);

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
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SUPPRIMER
  |--------------------------------------------------------------------------
  */

  async function handleDelete() {
    const result = await Swal.fire({
      title:
        "Supprimer le patient ?",

      html: `
        <div class="text-sm">
          Vous êtes sur le point de supprimer
          <strong>${nom}</strong>.
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

      confirmButtonColor:
        "#d33",

      cancelButtonColor:
        "#6b7280",

      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await deletePatient(id);

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
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex justify-end gap-1">

      {/* VOIR */}

      <Link
        href={`/patients/${id}`}
        className="btn btn-sm btn-ghost tooltip"
        data-tip="Voir le patient"
      >
        <Eye size={16} />
      </Link>

      {/* MODIFIER */}

      <Link
        href={`/patients/${id}/modifier`}
        className="btn btn-sm btn-outline tooltip"
        data-tip="Modifier le patient"
      >
        <Pencil size={16} />
      </Link>

      {/* ACTIVER / DÉSACTIVER */}

      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`btn btn-sm tooltip ${
          actif
            ? "btn-warning"
            : "btn-success"
        }`}
        data-tip={
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
      </button>

      {/* SUPPRIMER */}

      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        className="btn btn-sm btn-error btn-outline tooltip"
        data-tip="Supprimer le patient"
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>

    </div>
  );
}
