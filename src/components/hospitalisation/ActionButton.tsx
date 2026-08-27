"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { deleteChambre } from "@/app/actions/chambres";
import { deleteLit } from "@/app/actions/lits";
import { deleteSoin } from "@/app/actions/soins";
import { deleteSortie } from "@/app/actions/sorties";
import { deleteTransfert } from "@/app/actions/transferts";
import { deleteHospitalisation, terminerHospitalisation } from "@/app/actions/hospitalisations";

type Entity = "chambre" | "lit" | "soin" | "sortie" | "transfert" | "hospitalisation";
type Action = "delete" | "terminer";

type Props = {
  entity: Entity;
  id: number;
  action?: Action;
  label?: string;
  className?: string;
};

export default function ActionButton({ entity, id, action = "delete", label, className = "btn btn-error btn-sm" }: Props) {
  const [loading, setLoading] = useState(false);
  const defaultLabel = action === "terminer" ? "Terminer" : "Supprimer";

  async function execute() {
    if (entity === "chambre") return deleteChambre(id);
    if (entity === "lit") return deleteLit(id);
    if (entity === "soin") return deleteSoin(id);
    if (entity === "sortie") return deleteSortie(id);
    if (entity === "transfert") return deleteTransfert(id);
    if (entity === "hospitalisation") {
      return action === "terminer" ? terminerHospitalisation(id) : deleteHospitalisation(id);
    }
    return { success: false, message: "Action inconnue." };
  }

  async function onClick() {
    const text = label ?? defaultLabel;
    const confirmation = await Swal.fire({
      title: action === "terminer" ? "Terminer l'hospitalisation ?" : "Confirmer la suppression",
      text: `Voulez-vous vraiment ${text.toLowerCase()} cette opération ?`,
      icon: action === "terminer" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: action === "terminer" ? "Oui, terminer" : "Oui, supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary mx-1",
        cancelButton: "btn btn-ghost mx-1",
      },
    });

    if (!confirmation.isConfirmed) return;

    setLoading(true);
    try {
      const result = await execute();
      if (result.success) {
        toast.success(result.message || "Opération effectuée avec succès.");
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(result.message || "L'opération a échoué.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue pendant l'opération.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={loading}>
      {loading ? "..." : label ?? defaultLabel}
    </button>
  );
}
