"use client";

import { useState } from "react";

import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteRendezVous, updateRendezVousStatut } from "@/app/actions/rendezVous";



type Props = {
  id: number;
  statut: string;
};

export default function RendezVousActions({
  id,
  statut,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function changeStatut(
    newStatut: string
  ) {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await updateRendezVousStatut(
          id,
          newStatut
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
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) {
      return;
    }

    const confirmation =
      await Swal.fire({
        title:
          "Supprimer le rendez-vous ?",

        text:
          "Cette opération est irréversible.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        confirmButtonColor:
          "#d33",
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await deleteRendezVous(
          id
        );

      if (!response.success) {
        toast.error(
          response.message
        );

        return;
      }

      await Swal.fire({
        title:
          "Supprimé",

        text:
          response.message,

        icon: "success",

        confirmButtonText:
          "OK",
      });

      window.location.href =
        "/rendez-vous";
    } catch {
      toast.error(
        "Impossible de supprimer le rendez-vous."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dropdown dropdown-end">

      <button
        type="button"
        tabIndex={0}
        disabled={loading}
        className="btn btn-sm btn-ghost"
      >
        <MoreHorizontal size={18} />
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-50 w-56 p-2 shadow border border-base-200"
      >

        {statut !== "CONFIRME" && (
          <li>
            <button
              type="button"
              onClick={() =>
                changeStatut(
                  "CONFIRME"
                )
              }
            >
              <CheckCircle2
                size={16}
              />

              Confirmer
            </button>
          </li>
        )}

        {statut !== "TERMINE" && (
          <li>
            <button
              type="button"
              onClick={() =>
                changeStatut(
                  "TERMINE"
                )
              }
            >
              <ClipboardCheck
                size={16}
              />

              Marquer terminé
            </button>
          </li>
        )}

        {statut !== "ANNULE" && (
          <li>
            <button
              type="button"
              onClick={() =>
                changeStatut(
                  "ANNULE"
                )
              }
            >
              <XCircle
                size={16}
              />

              Annuler
            </button>
          </li>
        )}

        <li>
          <button
            type="button"
            onClick={handleDelete}
            className="text-error"
          >
            <Trash2 size={16} />

            Supprimer
          </button>
        </li>

      </ul>

    </div>
  );
}