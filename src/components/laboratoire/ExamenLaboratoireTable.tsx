"use client";

import {
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteExamenLaboratoire,
  toggleExamenLaboratoire,
} from "@/app/actions/examens-laboratoire";

type Props = {
  examens: any[];
};

export default function ExamenLaboratoireTable({
  examens,
}: Props) {
  async function handleToggle(
    examen: any,
  ) {
    const result =
      await toggleExamenLaboratoire(
        examen.id,
      );

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  }

  async function handleDelete(
    examen: any,
  ) {
    const confirmation =
      await Swal.fire({
        title: "Supprimer l'examen ?",
        text: `Voulez-vous supprimer "${examen.nom}" ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    const result =
      await deleteExamenLaboratoire(
        examen.id,
      );

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  }

  if (!examens.length) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-3">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <MoreHorizontal size={28} />
          </div>
        </div>

        <h3 className="font-semibold">
          Aucun examen
        </h3>

        <p className="text-sm text-base-content/60">
          Aucun examen de laboratoire n'est encore enregistré.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">

        <thead>
          <tr>
            <th>Code</th>
            <th>Examen</th>
            <th>Unité</th>
            <th>Valeur normale</th>
            <th>Prix</th>
            <th>Statut</th>
            <th className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {examens.map((examen) => (
            <tr key={examen.id}>

              <td>
                <span className="font-mono font-semibold">
                  {examen.code}
                </span>
              </td>

              <td>
                <div className="font-medium">
                  {examen.nom}
                </div>

                {examen.description && (
                  <div className="text-xs text-base-content/50">
                    {examen.description}
                  </div>
                )}
              </td>

              <td>
                {examen.unite || "—"}
              </td>

              <td>
                {examen.valeurNormale || "—"}
              </td>

              <td>
                <span className="font-semibold">
                  {examen.prix.toFixed(2)}
                </span>{" "}
                <span className="text-xs text-base-content/50">
                  {examen.devise}
                </span>
              </td>

              <td>
                {examen.actif ? (
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
                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    title={
                      examen.actif
                        ? "Désactiver"
                        : "Activer"
                    }
                    onClick={() =>
                      handleToggle(examen)
                    }
                  >
                    <Power size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-error"
                    title="Supprimer"
                    onClick={() =>
                      handleDelete(examen)
                    }
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}