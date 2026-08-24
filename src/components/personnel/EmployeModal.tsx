"use client";

import { X, UserRoundPlus } from "lucide-react";

import EmployeForm from "./EmployeForm";
import type { Employe } from "./EmployeForm";

/* ==========================================================
   TYPES
========================================================== */

type Service = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

type Props = {
  open: boolean;
  onClose: () => void;

  services?: Service[];
  roles?: Role[];

  employe?: Employe | null;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function EmployeModal({
  open,
  onClose,
  services = [],
  roles = [],
  employe = null,
}: Props) {
  if (!open) {
    return null;
  }

  const isEdit = employe !== null;

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employe-modal-title"
    >
      {/* ====================================================
          BACKDROP
      ==================================================== */}

      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ====================================================
          MODAL
      ==================================================== */}

      <div className="modal-box relative max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Icône */}

            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-primary text-primary-content">
              <UserRoundPlus size={20} />
            </div>

            {/* Titre */}

            <div>
              <h3
                id="employe-modal-title"
                className="text-lg font-bold"
              >
                {isEdit
                  ? "Modifier l'employé"
                  : "Nouvel employé"}
              </h3>

              <p className="text-sm text-base-content/60">
                {isEdit
                  ? employe?.matricule
                    ? `Matricule : ${employe.matricule}`
                    : "Modification des informations de l'employé"
                  : "Enregistrer un nouveau membre du personnel"}
              </p>
            </div>
          </div>

          {/* Bouton fermer */}

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost shrink-0"
            aria-label="Fermer"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ==================================================
            FORMULAIRE
        ================================================== */}

        <EmployeForm
          services={services}
          roles={roles}
          employe={employe}
          onClose={onClose}
        />
      </div>
    </div>
  );
}