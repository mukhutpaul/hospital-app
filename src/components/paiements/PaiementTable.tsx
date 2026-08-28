"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { annulerPaiement, deletePaiement } from "@/app/actions/paiements";



/* ==========================================================
   TYPES
========================================================== */

type Paiement = {
  id: number;
  reference: string;
  montant: number | string;
  devise: string;
  modePaiement: string;
  type: string;
  statut: string;
  datePaiement: Date | string;
  description: string | null;

  patient?: {
    id: number;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    numeroDossier: string;
    telephone?: string | null;
  } | null;

  facture?: {
    id: number;
    numero: string;
  } | null;

  caissier?: {
    id: number;
    name: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  paiements?: Paiement[] | null;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPatient(
  patient: Paiement["patient"]
) {
  if (!patient) {
    return "-";
  }

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatMontant(
  montant: number | string,
  devise: string
) {
  const valeur = Number(montant);

  if (Number.isNaN(valeur)) {
    return `0.00 ${devise}`;
  }

  return `${valeur.toFixed(2)} ${devise}`;
}

/* ==========================================================
   MODE DE PAIEMENT
========================================================== */

function getModeLabel(mode: string) {
  const modes: Record<string, string> = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    VIREMENT: "Virement bancaire",
    CHEQUE: "Chèque",
  };

  return modes[mode] || mode || "-";
}

/* ==========================================================
   TYPE DE PAIEMENT
========================================================== */

function getTypeLabel(type: string) {
  const types: Record<string, string> = {
    PAIEMENT: "Paiement",
    AVANCE: "Avance",
    SOLDE: "Solde",
    ACOMPTE: "Acompte",
    REMBOURSEMENT: "Remboursement",
  };

  return types[type] || type || "-";
}

/* ==========================================================
   STATUT
========================================================== */

function getStatutLabel(statut: string) {
  const statuts: Record<string, string> = {
    PAYE: "Payé",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
  };

  return statuts[statut] || statut || "-";
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "PAYE":
      return "badge badge-success";

    case "ANNULE":
      return "badge badge-error";

    case "REMBOURSE":
      return "badge badge-warning";

    default:
      return "badge badge-ghost";
  }
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function PaiementTable({
  paiements,
}: Props) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  /*
   * Sécurité :
   * même si le parent transmet null ou undefined,
   * on travaille toujours avec un tableau.
   */
  const listePaiements = Array.isArray(paiements)
    ? paiements
    : [];

  /* ========================================================
     ANNULER
  ======================================================== */

  const handleAnnuler = async (
    paiement: Paiement
  ) => {
    if (loadingId !== null) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",

      title: "Annuler le paiement ?",

      html: `
        <div style="text-align:left">
          <p style="margin-bottom:8px">
            <strong>Référence :</strong>
            ${paiement.reference}
          </p>

          <p style="margin-bottom:8px">
            <strong>Montant :</strong>
            ${formatMontant(
              paiement.montant,
              paiement.devise
            )}
          </p>

          <p>
            Cette opération annulera ce paiement.
          </p>
        </div>
      `,

      showCancelButton: true,

      confirmButtonText: "Oui, annuler",

      cancelButtonText: "Conserver",

      reverseButtons: true,

      confirmButtonColor: "#d33",

      cancelButtonColor: "#6b7280",

      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoadingId(paiement.id);

      const result =
        await annulerPaiement(paiement.id);

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible d'annuler le paiement."
        );

        return;
      }

      toast.success(
        result.message ||
          "Paiement annulé avec succès."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur annulation paiement :",
        error
      );

      toast.error(
        "Une erreur est survenue lors de l'annulation du paiement."
      );
    } finally {
      setLoadingId(null);
    }
  };

  /* ========================================================
     SUPPRIMER
  ======================================================== */

  const handleDelete = async (
    paiement: Paiement
  ) => {
    if (loadingId !== null) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",

      title: "Supprimer le paiement ?",

      html: `
        <div style="text-align:left">
          <p style="margin-bottom:8px">
            <strong>Référence :</strong>
            ${paiement.reference}
          </p>

          <p style="margin-bottom:8px">
            <strong>Montant :</strong>
            ${formatMontant(
              paiement.montant,
              paiement.devise
            )}
          </p>

          <p>
            <strong>Attention :</strong>
            cette opération supprimera définitivement
            le paiement.
          </p>
        </div>
      `,

      showCancelButton: true,

      confirmButtonText: "Oui, supprimer",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: "#d33",

      cancelButtonColor: "#6b7280",

      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoadingId(paiement.id);

      const result =
        await deletePaiement(paiement.id);

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible de supprimer le paiement."
        );

        return;
      }

      toast.success(
        result.message ||
          "Paiement supprimé avec succès."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur suppression paiement :",
        error
      );

      toast.error(
        "Une erreur est survenue lors de la suppression du paiement."
      );
    } finally {
      setLoadingId(null);
    }
  };

  /* ========================================================
     AUCUN PAIEMENT
  ======================================================== */

  if (listePaiements.length === 0) {
    return (
      <div className="alert bg-base-100 shadow">
        <span>
          Aucun paiement enregistré.
        </span>
      </div>
    );
  }

  /* ========================================================
     TABLEAU
  ======================================================== */

  return (
    <div className="overflow-x-auto bg-base-100 rounded-box shadow">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Patient</th>
            <th>Facture</th>
            <th>Montant</th>
            <th>Mode</th>
            <th>Type</th>
            <th>Date</th>
            <th>Statut</th>
            <th className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {listePaiements.map(
            (paiement) => {
              const isLoading =
                loadingId === paiement.id;

              const isAnnule =
                paiement.statut === "ANNULE";

              return (
                <tr
                  key={paiement.id}
                >
                  {/* ======================================
                      REFERENCE
                  ======================================= */}

                  <td>
                    <div className="font-semibold">
                      {paiement.reference}
                    </div>
                  </td>

                  {/* ======================================
                      PATIENT
                  ======================================= */}

                  <td>
                    <div className="font-medium">
                      {formatPatient(
                        paiement.patient
                      )}
                    </div>

                    {paiement.patient
                      ?.numeroDossier && (
                      <div className="text-xs opacity-60">
                        Dossier :{" "}
                        {
                          paiement.patient
                            .numeroDossier
                        }
                      </div>
                    )}
                  </td>

                  {/* ======================================
                      FACTURE
                  ======================================= */}

                  <td>
                    {paiement.facture ? (
                      <Link
                        href={`/facturation/factures/${paiement.facture.id}`}
                        className="link link-primary font-medium"
                      >
                        {
                          paiement.facture
                            .numero
                        }
                      </Link>
                    ) : (
                      <span className="opacity-60">
                        Sans facture
                      </span>
                    )}
                  </td>

                  {/* ======================================
                      MONTANT
                  ======================================= */}

                  <td>
                    <strong>
                      {formatMontant(
                        paiement.montant,
                        paiement.devise
                      )}
                    </strong>
                  </td>

                  {/* ======================================
                      MODE
                  ======================================= */}

                  <td>
                    {getModeLabel(
                      paiement.modePaiement
                    )}
                  </td>

                  {/* ======================================
                      TYPE
                  ======================================= */}

                  <td>
                    {getTypeLabel(
                      paiement.type
                    )}
                  </td>

                  {/* ======================================
                      DATE
                  ======================================= */}

                  <td>
                    {formatDate(
                      paiement.datePaiement
                    )}
                  </td>

                  {/* ======================================
                      STATUT
                  ======================================= */}

                  <td>
                    <span
                      className={getStatutClass(
                        paiement.statut
                      )}
                    >
                      {getStatutLabel(
                        paiement.statut
                      )}
                    </span>
                  </td>

                  {/* ======================================
                      ACTIONS
                  ======================================= */}

                  <td>
                    <div className="flex justify-end gap-1">

                      {/* VOIR */}

                      <Link
                        href={`/facturation/paiements/${paiement.id}`}
                        className="btn btn-sm btn-ghost"
                        title="Voir le paiement"
                      >
                        👁️
                      </Link>

                      {/* ANNULER */}

                      {!isAnnule && (
                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          disabled={
                            loadingId !== null
                          }
                          onClick={() =>
                            handleAnnuler(
                              paiement
                            )
                          }
                          title="Annuler le paiement"
                        >
                          {isLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "↩️"
                          )}
                        </button>
                      )}

                      {/* SUPPRIMER */}

                      <button
                        type="button"
                        className="btn btn-sm btn-error btn-outline"
                        disabled={
                          loadingId !== null
                        }
                        onClick={() =>
                          handleDelete(
                            paiement
                          )
                        }
                        title="Supprimer le paiement"
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "🗑️"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}