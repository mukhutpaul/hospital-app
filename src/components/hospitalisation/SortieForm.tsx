"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createSortie, updateSortie } from "@/app/actions/sorties";

type SortieFormProps = {
  initial?: any;
  hospitalisations?: any[];
};

export default function SortieForm({
  initial,
  hospitalisations = [],
}: SortieFormProps) {
  /*
  ==========================================================
  ID DE LA SORTIE
  ==========================================================
  */

  const sortieId = initial?.id ? Number(initial.id) : null;

  /*
  ==========================================================
  FORMULAIRE
  ==========================================================
  */

  const [f, setF] = useState({
    hospitalisationId:
      initial?.hospitalisationId ??
      initial?.hospitalisation?.id ??
      hospitalisations[0]?.id ??
      "",

    type: initial?.type ?? "RETOUR_DOMICILE",

    motif: initial?.motif ?? "",

    diagnosticFinal: initial?.diagnosticFinal ?? "",

    recommandation: initial?.recommandation ?? "",

    traitement: initial?.traitement ?? "",

    dateSortie: initial?.dateSortie
      ? new Date(initial.dateSortie).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  const [loading, setLoading] = useState(false);

  /*
  ==========================================================
  MODIFICATION CHAMP
  ==========================================================
  */

  function setField(key: string, value: string) {
    setF((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  /*
  ==========================================================
  SOUMISSION
  ==========================================================
  */

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      /*
      ========================================================
      MODIFICATION
      ========================================================
      */

      if (sortieId !== null) {
        const result = await updateSortie(sortieId, {
          type: f.type,
          motif: f.motif,
          diagnosticFinal: f.diagnosticFinal,
          recommandation: f.recommandation,
          traitement: f.traitement,
          dateSortie: f.dateSortie,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);

        setTimeout(() => {
          window.location.href = "/hospitalisation/sorties";
        }, 700);

        return;
      }

      /*
      ========================================================
      NOUVELLE SORTIE
      ========================================================
      */

      const hospitalisationId = Number(f.hospitalisationId);

      if (!hospitalisationId || Number.isNaN(hospitalisationId)) {
        toast.error("Veuillez sélectionner une hospitalisation.");
        return;
      }

      const result = await createSortie({
        hospitalisationId,

        type: f.type,

        motif: f.motif || null,

        diagnosticFinal: f.diagnosticFinal || null,

        recommandation: f.recommandation || null,

        traitement: f.traitement || null,

        dateSortie: f.dateSortie,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        window.location.href = "/hospitalisation/sorties";
      }, 700);
    } catch (error) {
      console.error("Erreur SortieForm :", error);

      toast.error(
        "Une erreur est survenue lors de l'enregistrement de la sortie."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ==========================================================
  RENDU
  ==========================================================
  */

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"
    >
      {/* ==================================================
          TITRE
      ================================================== */}

      <div>
        <h2 className="text-xl font-bold">
          {sortieId !== null
            ? "Modifier la sortie"
            : "Nouvelle sortie"}
        </h2>

        <p className="mt-1 text-sm text-base-content/60">
          {sortieId !== null
            ? "Modifiez les informations de la sortie du patient."
            : "Enregistrez la sortie d'un patient hospitalisé."}
        </p>
      </div>

      {/* ==================================================
          HOSPITALISATION
      ================================================== */}

      {sortieId === null && (
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Hospitalisation
            </span>
          </label>

          <select
            required
            className="select select-bordered w-full"
            value={f.hospitalisationId}
            onChange={(e) =>
              setField("hospitalisationId", e.target.value)
            }
          >
            <option value="">
              Sélectionner une hospitalisation
            </option>

            {hospitalisations.map((h) => (
              <option key={h.id} value={h.id}>
                {h.numero} —{" "}
                {[
                  h.patient?.nom,
                  h.patient?.postNom,
                  h.patient?.prenom,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ==================================================
          TYPE DE SORTIE
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Type de sortie
          </span>
        </label>

        <select
          required
          className="select select-bordered w-full"
          value={f.type}
          onChange={(e) => setField("type", e.target.value)}
        >
          <option value="RETOUR_DOMICILE">
            Retour à domicile
          </option>

          <option value="TRANSFERT">
            Transfert
          </option>

          <option value="DECES">
            Décès
          </option>

          <option value="AUTRE">
            Autre
          </option>
        </select>
      </div>

      {/* ==================================================
          DATE DE SORTIE
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Date et heure de sortie
          </span>
        </label>

        <input
          type="datetime-local"
          required
          className="input input-bordered w-full"
          value={f.dateSortie}
          onChange={(e) =>
            setField("dateSortie", e.target.value)
          }
        />
      </div>

      {/* ==================================================
          MOTIF
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Motif de sortie
          </span>
        </label>

        <textarea
          className="textarea textarea-bordered min-h-24 w-full"
          placeholder="Ex. État de santé satisfaisant..."
          value={f.motif}
          onChange={(e) =>
            setField("motif", e.target.value)
          }
        />
      </div>

      {/* ==================================================
          DIAGNOSTIC FINAL
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Diagnostic final
          </span>
        </label>

        <textarea
          className="textarea textarea-bordered min-h-24 w-full"
          placeholder="Diagnostic final du patient..."
          value={f.diagnosticFinal}
          onChange={(e) =>
            setField("diagnosticFinal", e.target.value)
          }
        />
      </div>

      {/* ==================================================
          RECOMMANDATIONS
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Recommandations
          </span>
        </label>

        <textarea
          className="textarea textarea-bordered min-h-24 w-full"
          placeholder="Recommandations après la sortie..."
          value={f.recommandation}
          onChange={(e) =>
            setField("recommandation", e.target.value)
          }
        />
      </div>

      {/* ==================================================
          TRAITEMENT
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">
            Traitement
          </span>
        </label>

        <textarea
          className="textarea textarea-bordered min-h-24 w-full"
          placeholder="Traitement à poursuivre..."
          value={f.traitement}
          onChange={(e) =>
            setField("traitement", e.target.value)
          }
        />
      </div>

      {/* ==================================================
          BOUTONS
      ================================================== */}

      <div className="flex justify-end gap-3 border-t border-base-300 pt-5">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={loading}
          onClick={() => {
            window.location.href =
              "/hospitalisation/sorties";
          }}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Enregistrement...
            </>
          ) : sortieId !== null ? (
            "Modifier la sortie"
          ) : (
            "Enregistrer la sortie"
          )}
        </button>
      </div>
    </form>
  );
}