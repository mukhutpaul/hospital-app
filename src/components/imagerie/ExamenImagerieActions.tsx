"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteExamenImagerie,
  updateExamenImagerie,
} from "@/app/actions/imagerie";

import EditExamenImagerie from "./EditExamenImagerie";

type Examen = {
  id: number;
  code: string;
  nom: string;
  type: string;
  description?: string | null;
  prix?: number | null;
  devise?: string | null;
  actif: boolean;
};

type Props = {
  examen: Examen;
};

export default function ExamenImagerieActions({
  examen,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     ACTIVER / DÉSACTIVER
  ========================================================= */

  const handleToggleActif = async () => {
    if (loading) return;

    const nouveauStatut = !examen.actif;

    const confirmation = await Swal.fire({
      title: nouveauStatut
        ? "Activer cet examen ?"
        : "Désactiver cet examen ?",

      text: nouveauStatut
        ? "Cet examen pourra de nouveau être utilisé dans les demandes."
        : "Cet examen ne pourra plus être sélectionné pour de nouvelles demandes.",

      icon: "question",

      showCancelButton: true,

      confirmButtonText: nouveauStatut
        ? "Oui, activer"
        : "Oui, désactiver",

      cancelButtonText: "Annuler",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const result =
        await updateExamenImagerie(
          examen.id,
          {
            code: examen.code,
            nom: examen.nom,
            type: examen.type,
            description:
              examen.description ?? "",
            prix: Number(examen.prix ?? 0),
            devise:
              examen.devise ?? "USD",
            actif: nouveauStatut,
          }
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        nouveauStatut
          ? "Examen activé avec succès."
          : "Examen désactivé avec succès."
      );

      router.refresh();

    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de modifier le statut."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUPPRIMER / DÉSACTIVER
  ========================================================= */

  const handleDelete = async () => {
    if (loading) return;

    const confirmation = await Swal.fire({
      title: "Désactiver cet examen ?",

      text:
        "L'examen ne sera pas supprimé physiquement afin de préserver les anciennes demandes.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Oui, désactiver",

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
      const result =
        await deleteExamenImagerie(
          examen.id
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message ||
          "Examen désactivé."
      );

      router.refresh();

    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de désactiver l'examen."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VOIR
  ========================================================= */

  const handleView = () => {
    router.push(
      `/imagerie/examens/${examen.id}`
    );
  };

  return (
    <>
      <div className="dropdown dropdown-end">

        <button
          type="button"
          tabIndex={0}
          className="btn btn-sm btn-ghost"
          disabled={loading}
        >
          <MoreHorizontal size={18} />
        </button>

        <ul
          tabIndex={0}
          className="dropdown-content z-[100] mt-1 w-52 rounded-xl border border-base-200 bg-base-100 p-2 shadow-xl"
        >

          {/* VOIR */}

          <li>
            <button
              type="button"
              onClick={handleView}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-base-200"
            >
              <Eye
                size={17}
                className="text-info"
              />

              <span>
                Voir
              </span>
            </button>
          </li>

          {/* MODIFIER */}

          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-base-200"
            >
              <Pencil
                size={17}
                className="text-warning"
              />

              <span>
                Modifier
              </span>
            </button>
          </li>

          {/* ACTIVER / DÉSACTIVER */}

          <li>
            <button
              type="button"
              onClick={handleToggleActif}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-base-200"
            >
              <Power
                size={17}
                className={
                  examen.actif
                    ? "text-error"
                    : "text-success"
                }
              />

              <span>
                {examen.actif
                  ? "Désactiver"
                  : "Activer"}
              </span>
            </button>
          </li>

          <div className="my-1 border-t border-base-200" />

          {/* SUPPRIMER */}

          <li>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-error hover:bg-error/10"
            >
              <Trash2 size={17} />

              <span>
                Supprimer
              </span>
            </button>
          </li>

        </ul>

      </div>

      {/* =====================================================
          POPUP MODIFICATION
      ===================================================== */}

      {open && (
        <EditExamenImagerie
          examen={examen}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}