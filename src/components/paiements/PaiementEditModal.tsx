"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { updatePaiement } from "@/app/actions/paiements";



type Props = {
  paiement: {
    id: number;
    montant: number;
    devise: string;
    modePaiement: string;
    type: string;
    description: string | null;
    statut: string;
  };
};

export default function PaiementEditModal({
  paiement,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [montant, setMontant] =
    useState(
      String(paiement.montant)
    );

  const [modePaiement, setModePaiement] =
    useState(
      paiement.modePaiement
    );

  const [type, setType] =
    useState(paiement.type);

  const [description, setDescription] =
    useState(
      paiement.description || ""
    );

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const montantNumber =
      Number(montant);

    if (
      !Number.isFinite(
        montantNumber
      ) ||
      montantNumber <= 0
    ) {
      toast.error(
        "Montant invalide."
      );
      return;
    }

    const confirmation =
      await Swal.fire({
        icon: "question",
        title:
          "Modifier le paiement ?",
        text:
          "Voulez-vous enregistrer les modifications ?",
        showCancelButton: true,
        confirmButtonText:
          "Oui, modifier",
        cancelButtonText:
          "Annuler",
        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoading(true);

      const result =
        await updatePaiement(
          paiement.id,
          {
            montant:
              montantNumber,
            modePaiement,
            type,
            description:
              description.trim() ||
              null,
          }
        );

      if (!result.success) {
        toast.error(
          result.message
        );
        return;
      }

      toast.success(
        result.message
      );

      setOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Modification réussie",
        text: result.message,
        confirmButtonText: "OK",
      });

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de modifier le paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  if (
    paiement.statut === "ANNULE"
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          setOpen(true)
        }
      >
        ✏️ Modifier
      </button>

      {open && (
        <dialog
          open
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box max-w-xl">
            <h3 className="font-bold text-xl mb-5">
              Modifier le paiement
            </h3>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >
              {/* MONTANT */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Montant
                  </span>
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={montant}
                  onChange={(e) =>
                    setMontant(
                      e.target.value
                    )
                  }
                  className="input input-bordered"
                  disabled={loading}
                />
              </div>

              {/* MODE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Mode de paiement
                  </span>
                </label>

                <select
                  value={
                    modePaiement
                  }
                  onChange={(e) =>
                    setModePaiement(
                      e.target.value
                    )
                  }
                  className="select select-bordered"
                  disabled={loading}
                >
                  <option value="ESPECES">
                    Espèces
                  </option>

                  <option value="MOBILE_MONEY">
                    Mobile Money
                  </option>

                  <option value="CARTE">
                    Carte bancaire
                  </option>

                  <option value="VIREMENT">
                    Virement
                  </option>

                  <option value="CHEQUE">
                    Chèque
                  </option>
                </select>
              </div>

              {/* TYPE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Type
                  </span>
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value
                    )
                  }
                  className="select select-bordered"
                  disabled={loading}
                >
                  <option value="FACTURE">
                    Facture
                  </option>

                  <option value="AVANCE">
                    Avance
                  </option>

                  <option value="ACOMPTE">
                    Acompte
                  </option>
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Description
                  </span>
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  className="textarea textarea-bordered"
                  disabled={loading}
                />
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setOpen(false)
                  }
                  disabled={
                    loading
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Modification...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div
            className="modal-backdrop"
            onClick={() =>
              !loading &&
              setOpen(false)
            }
          />
        </dialog>
      )}
    </>
  );
}