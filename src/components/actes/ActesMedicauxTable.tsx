
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Eye,
  Power,
  Trash2,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteActeMedical,
  toggleActeMedical,
} from "@/app/actions/actes-medicaux";

type Props = {
  actes: any[];
};

export default function ActesMedicauxTable({
  actes,
}: Props) {
  const router = useRouter();

  async function handleToggle(acte: any) {
    const result = await Swal.fire({
      icon: "question",
      title: acte.actif
        ? "Désactiver l'acte ?"
        : "Activer l'acte ?",
      text: acte.actif
        ? "Cet acte ne pourra plus être utilisé dans une nouvelle consultation."
        : "Cet acte pourra de nouveau être utilisé.",
      showCancelButton: true,
      confirmButtonText: acte.actif
        ? "Désactiver"
        : "Activer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) {
      return;
    }

    const response =
      await toggleActeMedical(acte.id);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.refresh();
  }

  async function handleDelete(acte: any) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer cet acte ?",
      text: `Acte : ${acte.libelle}`,
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      return;
    }

    const response =
      await deleteActeMedical(acte.id);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/actes/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />

          Nouvel acte
        </Link>
      </div>

      <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Utilisations</th>
              <th>Statut</th>
              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {actes.map((acte) => (
              <tr key={acte.id}>
                <td className="font-mono font-semibold">
                  {acte.code}
                </td>

                <td>
                  <div className="font-semibold">
                    {acte.libelle}
                  </div>
                </td>

                <td>
                  {acte.categorie || "-"}
                </td>

                <td className="font-semibold">
                  {Number(
                    acte.montant,
                  ).toFixed(2)}{" "}
                  {acte.devise}
                </td>

                <td>
                  <span className="badge badge-ghost">
                    {acte._count?.consultations ??
                      0}
                  </span>
                </td>

                <td>
                  {acte.actif ? (
                    <span className="badge badge-success">
                      Actif
                    </span>
                  ) : (
                    <span className="badge">
                      Inactif
                    </span>
                  )}
                </td>

                <td>
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/actes/${acte.id}`}
                      className="btn btn-sm btn-ghost btn-square"
                      title="Voir"
                    >
                      <Eye size={17} />
                    </Link>

                    <Link
                      href={`/actes/${acte.id}/modifier`}
                      className="btn btn-sm btn-ghost btn-square"
                      title="Modifier"
                    >
                      <Edit size={17} />
                    </Link>

                    <button
                      type="button"
                      className="btn btn-sm btn-ghost btn-square"
                      onClick={() =>
                        handleToggle(acte)
                      }
                      title={
                        acte.actif
                          ? "Désactiver"
                          : "Activer"
                      }
                    >
                      <Power
                        size={17}
                        className={
                          acte.actif
                            ? "text-success"
                            : "text-base-content/40"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-error btn-outline btn-square"
                      onClick={() =>
                        handleDelete(acte)
                      }
                      title="Supprimer"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {actes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center"
                >
                  Aucun acte médical.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}