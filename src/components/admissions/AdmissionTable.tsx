"use client";

import Link from "next/link";

import {
  Eye,
  MoreHorizontal,
  Stethoscope,
  Trash2,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteAdmission,
  updateAdmissionStatut,
} from "@/app/actions/admission";

type Admission = {
  id: number;
  numero: string;

  type: string;
  motif: string | null;
  statut: string;

  dateAdmission: Date;

  patient: {
    id: number;
    numeroDossier: string;
    nom: string;
    postNom: string | null;
    prenom: string | null;
  };

  service: {
    id: number;
    nom: string;
  } | null;

  rendezVous: {
    id: number;
    numero: string;
  } | null;

  triage: unknown;
  consultation: unknown;
  hospitalisation: unknown;
};

type Props = {
  admissions: Admission[];
};

function getStatutClass(
  statut: string
) {
  switch (statut) {
    case "EN_ATTENTE":
      return "badge-warning";

    case "TRIE":
      return "badge-info";

    case "EN_CONSULTATION":
      return "badge-primary";

    case "HOSPITALISE":
      return "badge-secondary";

    case "TERMINEE":
      return "badge-success";

    case "ANNULEE":
      return "badge-error";

    default:
      return "badge-ghost";
  }
}

function getStatutLabel(
  statut: string
) {
  switch (statut) {
    case "EN_ATTENTE":
      return "En attente";

    case "TRIE":
      return "Trié";

    case "EN_CONSULTATION":
      return "En consultation";

    case "HOSPITALISE":
      return "Hospitalisé";

    case "TERMINEE":
      return "Terminée";

    case "ANNULEE":
      return "Annulée";

    default:
      return statut;
  }
}

function getTypeLabel(
  type: string
) {
  switch (type) {
    case "PROGRAMMEE":
      return "Programmée";

    case "URGENCE":
      return "Urgence";

    case "AMBULATOIRE":
      return "Ambulatoire";

    default:
      return type;
  }
}

export default function AdmissionTable({
  admissions,
}: Props) {

  async function handleDelete(
    admission: Admission
  ) {
    const result =
      await Swal.fire({
        title:
          "Supprimer cette admission ?",

        text:
          `${admission.numero} sera supprimée.`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        confirmButtonColor:
          "#d33",
      });

    if (!result.isConfirmed) {
      return;
    }

    const response =
      await deleteAdmission(
        admission.id
      );

    if (response.success) {
      toast.success(
        response.message
      );

      window.location.reload();
    } else {
      toast.error(
        response.message
      );
    }
  }

  async function handleStatut(
    admission: Admission,
    statut: string
  ) {
    const response =
      await updateAdmissionStatut(
        admission.id,
        statut
      );

    if (response.success) {
      toast.success(
        response.message
      );

      window.location.reload();
    } else {
      toast.error(
        response.message
      );
    }
  }

  if (!admissions.length) {
    return (
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body text-center py-16">

          <ClipboardEmpty />

          <h3 className="font-semibold text-lg">
            Aucune admission
          </h3>

          <p className="text-sm text-base-content/60">
            Aucune admission n'a encore été enregistrée.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body p-0">

        <div className="overflow-x-auto">

          <table className="table">

            <thead>

              <tr>

                <th>Admission</th>

                <th>Patient</th>

                <th>Type</th>

                <th>Service</th>

                <th>Date</th>

                <th>Statut</th>

                <th className="text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {admissions.map(
                (admission) => (

                  <tr key={admission.id}>

                    <td>

                      <div className="font-semibold">
                        {admission.numero}
                      </div>

                      {admission.rendezVous && (
                        <div className="text-xs text-base-content/50">
                          RDV :{" "}
                          {admission.rendezVous.numero}
                        </div>
                      )}

                    </td>

                    <td>

                      <div className="font-medium">

                        {admission.patient.nom}{" "}

                        {admission.patient.postNom || ""}{" "}

                        {admission.patient.prenom || ""}

                      </div>

                      <div className="text-xs text-base-content/50">

                        {admission.patient.numeroDossier}

                      </div>

                    </td>

                    <td>

                      <span className="badge badge-outline">

                        {getTypeLabel(
                          admission.type
                        )}

                      </span>

                    </td>

                    <td>

                      {admission.service?.nom ||
                        "—"}

                    </td>

                    <td>

                      {new Date(
                        admission.dateAdmission
                      ).toLocaleString(
                        "fr-FR"
                      )}

                    </td>

                    <td>

                      <span
                        className={`badge ${getStatutClass(
                          admission.statut
                        )}`}
                      >
                        {getStatutLabel(
                          admission.statut
                        )}
                      </span>

                    </td>

                    <td>

                      <div className="flex justify-end">

                        <div className="dropdown dropdown-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                          >
                            <MoreHorizontal
                              size={18}
                            />
                          </button>

                          <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow border border-base-200">

                            <li>

                              <Link
                                href={`/admissions/${admission.id}`}
                              >
                                <Eye size={16} />
                                Voir le détail
                              </Link>

                            </li>

                            {admission.statut ===
                              "EN_ATTENTE" && (

                              <li>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatut(
                                      admission,
                                      "TRIE"
                                    )
                                  }
                                >
                                  <Stethoscope
                                    size={16}
                                  />
                                  Marquer comme trié
                                </button>

                              </li>

                            )}

                            {!admission.triage &&
                              !admission.consultation &&
                              !admission.hospitalisation && (

                              <li>

                                <button
                                  type="button"
                                  className="text-error"
                                  onClick={() =>
                                    handleDelete(
                                      admission
                                    )
                                  }
                                >
                                  <Trash2
                                    size={16}
                                  />
                                  Supprimer
                                </button>

                              </li>

                            )}

                          </ul>

                        </div>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function ClipboardEmpty() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-base-content/50">
      <Stethoscope size={25} />
    </div>
  );
}