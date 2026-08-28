"use client";

import { useState } from "react";

import PaiementForm from "./PaiementForm";

type Props = {
  patientId: number;
  factureId?: number | null;
  caissierId?: number | null;
  devise?: string;
  reste?: number;
};

export default function PaiementModal({
  patientId,
  factureId,
  caissierId,
  devise = "USD",
  reste = 0,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          setOpen(true)
        }
      >
        💰 Nouveau paiement
      </button>

      {open && (
        <dialog
          open
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-xl">
                  Nouveau paiement
                </h3>

                <p className="text-sm opacity-70">
                  Enregistrer un paiement
                  patient
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                ✕
              </button>
            </div>

            <PaiementForm
              patientId={patientId}
              factureId={factureId}
              caissierId={caissierId}
              devise={devise}
              reste={reste}
              onSuccess={() =>
                setOpen(false)
              }
            />

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                Fermer
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={() =>
              setOpen(false)
            }
          />
        </dialog>
      )}
    </>
  );
}