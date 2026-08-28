
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  createConsultationActe,
} from "@/app/actions/actes-medicaux";

type Props = {
  consultationId: number;
  actes: any[];
};

export default function ConsultationActeForm({
  consultationId,
  actes,
}: Props) {
  const router = useRouter();

  const [acteId, setActeId] =
    useState("");

  const [quantite, setQuantite] =
    useState("1");

  const [observation, setObservation] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const acteSelectionne = actes.find(
    (acte) =>
      acte.id === Number(acteId),
  );

  const montant =
    acteSelectionne
      ? Number(
          acteSelectionne.montant,
        ) *
        Number(quantite || 0)
      : 0;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!acteId) {
      toast.error(
        "Veuillez sélectionner un acte.",
      );
      return;
    }

    const quantiteNumber =
      Number(quantite);

    if (
      !Number.isFinite(
        quantiteNumber,
      ) ||
      quantiteNumber <= 0
    ) {
      toast.error(
        "La quantité est invalide.",
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await createConsultationActe({
          consultationId,
          acteId: Number(acteId),
          quantite: quantiteNumber,
          observation,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setActeId("");
      setQuantite("1");
      setObservation("");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'ajouter l'acte.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card border border-primary/20 bg-primary/5"
    >
      <div className="card-body">
        <h3 className="card-title text-base">
          Ajouter un acte
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Acte médical *
              </span>
            </label>

            <select
              value={acteId}
              onChange={(e) =>
                setActeId(e.target.value)
              }
              className="select select-bordered bg-base-100"
              disabled={loading}
              required
            >
              <option value="">
                -- Sélectionner un acte --
              </option>

              {actes.map((acte) => (
                <option
                  key={acte.id}
                  value={acte.id}
                >
                  {acte.code} —{" "}
                  {acte.libelle} —{" "}
                  {Number(
                    acte.montant,
                  ).toFixed(2)}{" "}
                  {acte.devise}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Quantité *
              </span>
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={quantite}
              onChange={(e) =>
                setQuantite(
                  e.target.value,
                )
              }
              className="input input-bordered bg-base-100"
              disabled={loading}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Montant
              </span>
            </label>

            <div className="input input-bordered flex items-center bg-base-200">
              {montant.toFixed(2)}{" "}
              {acteSelectionne?.devise ??
                "USD"}
            </div>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Observation
            </span>
          </label>

          <textarea
            value={observation}
            onChange={(e) =>
              setObservation(
                e.target.value,
              )
            }
            className="textarea textarea-bordered bg-base-100"
            placeholder="Observation concernant l'acte..."
            disabled={loading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              !acteId
            }
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />

                Ajout...
              </>
            ) : (
              "Ajouter l'acte"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
