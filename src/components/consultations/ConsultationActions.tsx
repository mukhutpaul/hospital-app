"use client";

import Link from "next/link";

import {
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteConsultation,
} from "@/app/actions/consultations";

type Props = {
  consultationId: number;
};

export default function ConsultationActions({
  consultationId,
}: Props) {
  async function handleDelete() {
    const confirmation =
      await Swal.fire({
        title: "Supprimer la consultation ?",
        text:
          "Cette opération est irréversible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText:
          "Oui, supprimer",
        cancelButtonText:
          "Annuler",
        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    const result =
      await deleteConsultation(
        consultationId,
      );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    window.location.reload();
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-sm btn-ghost btn-square"
        type="button"
      >
        <MoreHorizontal
          size={18}
        />
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content z-[20] menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200"
      >
        <li>
          <Link
            href={`/dashboard/consultations/${consultationId}`}
          >
            <Eye size={16} />
            Voir la consultation
          </Link>
        </li>

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