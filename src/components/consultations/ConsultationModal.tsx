"use client";

import { useState } from "react";

import {
  X,
  Plus,
} from "lucide-react";

import ConsultationForm from "./ConsultationForm";

type Props = {
  patients: any[];
  medecinConnecte: any;
  services: any[];
  specialites: any[];
  admissions: any[];
};

export default function ConsultationModal({
  patients,
  medecinConnecte,
  services,
  specialites,
  admissions,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      {/* ==================================================
          BOUTON
      ================================================== */}

      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          setOpen(true)
        }
      >
        <Plus size={18} />

        Nouvelle consultation
      </button>

      {/* ==================================================
          MODAL
      ================================================== */}

      {open && (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Nouvelle consultation
                </h2>

                <p className="text-sm text-base-content/60">
                  Enregistrer une nouvelle
                  consultation médicale.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            {/* FORMULAIRE */}

            <ConsultationForm
              patients={patients}
              medecinConnecte={
                medecinConnecte
              }
              services={services}
              specialites={specialites}
              admissions={admissions}
              onSuccess={() =>
                setOpen(false)
              }
            />

          </div>

          {/* OVERLAY */}

          <div
            className="modal-backdrop"
            onClick={() =>
              setOpen(false)
            }
          />
        </div>
      )}
    </>
  );
}