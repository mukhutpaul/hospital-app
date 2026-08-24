"use client";

import {
  FormEvent,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  FlaskConical,
  Plus,
  Loader2,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import {
  createExamenLaboratoire,
} from "@/app/actions/examens-laboratoire";

type Props = {
  onClose?: () => void;
};

export default function ExamenLaboratoireForm({
  onClose,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [isRefreshing, startTransition] =
    useTransition();

  const isBusy =
    loading || isRefreshing;

  /* ==========================================================
     ENREGISTREMENT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setLoading(true);

    try {
      /* ======================================================
         SERVER ACTION
      ====================================================== */

      const result =
        await createExamenLaboratoire(
          formData,
        );

      /* ======================================================
         ERREUR SERVER ACTION
      ====================================================== */

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Erreur",
          text:
            result.message ||
            "Impossible d'ajouter l'examen.",
          confirmButtonText: "OK",
          confirmButtonColor:
            "#570df8",
        });

        return;
      }

      /* ======================================================
         SUCCÈS
      ====================================================== */

      await Swal.fire({
        icon: "success",
        title: "Examen ajouté",
        text:
          result.message ||
          "L'examen a été ajouté avec succès.",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      /* ======================================================
         RESET DU FORMULAIRE
      ====================================================== */

      form.reset();

      /* ======================================================
         FERMETURE DE LA MODALE
         
         IMPORTANT :
         On ne fait pas router.refresh() exactement au même
         moment que la fermeture de la modale.
      ====================================================== */

      if (onClose) {
        onClose();

        /*
         * On laisse React terminer la suppression de la modale
         * avant de demander le refresh du Server Component.
         */
        setTimeout(() => {
          startTransition(() => {
            router.refresh();
          });
        }, 100);

        return;
      }

      /* ======================================================
         PAGE NORMALE
         
         Petit délai afin de laisser SweetAlert terminer
         complètement son nettoyage du DOM.
      ====================================================== */

      setTimeout(() => {
        startTransition(() => {
          router.refresh();
        });
      }, 100);
    } catch (error) {
      console.error(
        "Erreur ExamenLaboratoireForm :",
        error,
      );

      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text:
          "Une erreur inattendue est survenue.",
        confirmButtonText: "OK",
        confirmButtonColor:
          "#570df8",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     RENDU
  ========================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FlaskConical size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Ajouter un examen de laboratoire
            </h2>

            <p className="text-sm text-base-content/60">
              Ajouter un nouvel examen au catalogue
              du laboratoire.
            </p>
          </div>

        </div>

        {/* =================================================
            FERMER
        ================================================= */}

        {onClose && (
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        )}

      </div>

      {/* =====================================================
          CODE + NOM
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* CODE */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Code *
            </span>
          </label>

          <input
            type="text"
            name="code"
            placeholder="Ex : NFS"
            className="input input-bordered w-full"
            required
            disabled={isBusy}
            autoComplete="off"
          />

        </div>

        {/* NOM */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Nom de l'examen *
            </span>
          </label>

          <input
            type="text"
            name="nom"
            placeholder="Ex : Numération Formule Sanguine"
            className="input input-bordered w-full"
            required
            disabled={isBusy}
            autoComplete="off"
          />

        </div>

      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <div className="form-control">

        <label className="label">
          <span className="label-text font-medium">
            Description
          </span>
        </label>

        <textarea
          name="description"
          placeholder="Description de l'examen..."
          className="textarea textarea-bordered w-full"
          rows={3}
          disabled={isBusy}
        />

      </div>

      {/* =====================================================
          UNITÉ + VALEUR NORMALE
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* UNITÉ */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Unité
            </span>
          </label>

          <input
            type="text"
            name="unite"
            placeholder="Ex : g/dL"
            className="input input-bordered w-full"
            disabled={isBusy}
          />

        </div>

        {/* VALEUR NORMALE */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Valeur normale
            </span>
          </label>

          <input
            type="text"
            name="valeurNormale"
            placeholder="Ex : 12 - 16"
            className="input input-bordered w-full"
            disabled={isBusy}
          />

        </div>

      </div>

      {/* =====================================================
          PRIX + DEVISE
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* PRIX */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Prix *
            </span>
          </label>

          <input
            type="number"
            name="prix"
            min="0"
            step="0.01"
            defaultValue="0"
            placeholder="0"
            className="input input-bordered w-full"
            required
            disabled={isBusy}
          />

        </div>

        {/* DEVISE */}

        <div className="form-control">

          <label className="label">
            <span className="label-text font-medium">
              Devise
            </span>
          </label>

          <select
            name="devise"
            defaultValue="USD"
            className="select select-bordered w-full"
            disabled={isBusy}
          >
            <option value="USD">
              USD
            </option>

            <option value="CDF">
              CDF
            </option>
          </select>

        </div>

      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-base-200">

        {/* ANNULER */}

        {onClose && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isBusy}
          >
            Annuler
          </button>
        )}

        {/* AJOUTER */}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isBusy}
        >
          {isBusy ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Enregistrement...
            </>
          ) : (
            <>
              <Plus size={18} />

              Ajouter l'examen
            </>
          )}
        </button>

      </div>
    </form>
  );
}