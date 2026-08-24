"use client";

import {
  X,
  FlaskConical,
} from "lucide-react";

import ExamenLaboratoireForm, {
  type ExamenLaboratoire,
} from "./ExamenLaboratoireForm";

type Props = {
  open: boolean;
  onClose: () => void;
  examen?: ExamenLaboratoire | null;
};

export default function ExamenLaboratoireModal({
  open,
  onClose,
  examen = null,
}: Props) {
  if (!open) {
    return null;
  }

  const isEdit = examen !== null;

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-backdrop"
        onClick={onClose}
      />

      <div className="modal-box relative max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <FlaskConical size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {isEdit
                  ? "Modifier l'examen"
                  : "Nouvel examen"}
              </h3>

              <p className="text-sm text-base-content/60">
                {isEdit
                  ? examen.code
                  : "Configurer un examen de laboratoire"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <ExamenLaboratoireForm
          examen={examen}
          onClose={onClose}
        />
      </div>
    </div>
  );
}