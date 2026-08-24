"use client";

import {
  X,
  ClipboardList,
} from "lucide-react";

import DemandeLaboratoireForm from "./DemandeLaboratoireForm";

type Props = {
  open: boolean;
  onClose: () => void;

  patients?: any[];
  consultations?: any[];
  services?: any[];
  examens?: any[];
};

export default function DemandeLaboratoireModal({
  open,
  onClose,
  patients = [],
  consultations = [],
  services = [],
  examens = [],
}: Props) {
  if (!open) {
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

      <div className="modal-box max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <ClipboardList size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold">
                Nouvelle demande de laboratoire
              </h3>

              <p className="text-sm text-base-content/60">
                Prescrire des examens biologiques
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

        <DemandeLaboratoireForm
          patients={patients}
          consultations={consultations}
          services={services}
          examens={examens}
          onClose={onClose}
        />
      </div>
    </div>
  );
}