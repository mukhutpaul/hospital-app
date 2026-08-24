"use client";

import {
  X,
  FileCheck2,
} from "lucide-react";

import ResultatLaboratoireForm from "./ResultatLaboratoireForm";

type Props = {
  open: boolean;
  onClose: () => void;

  demande: any;

  examen?: any;
  resultat?: any;
};

export default function ResultatLaboratoireModal({
  open,
  onClose,
  demande,
  examen = null,
  resultat = null,
}: Props) {
  if (!open || !demande) {
    return null;
  }

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

      <div className="modal-box max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success text-success-content flex items-center justify-center">
              <FileCheck2 size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {resultat
                  ? "Modifier le résultat"
                  : "Saisir le résultat"}
              </h3>

              <p className="text-sm text-base-content/60">
                Résultat d'analyse de laboratoire
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

        <ResultatLaboratoireForm
          demande={demande}
          examen={examen}
          resultat={resultat}
          onClose={onClose}
        />
      </div>
    </div>
  );
}