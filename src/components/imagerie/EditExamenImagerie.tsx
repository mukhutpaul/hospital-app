"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  X,
  Save,
  ImageIcon,
  Power,
} from "lucide-react";

import {
  updateExamenImagerie,
} from "@/app/actions/imagerie";

import { toast } from "react-toastify";

type ExamenImagerie = {
  id: number;
  code: string;
  nom: string;
  type: string;
  description?: string | null;
  prix?: number | null;
  devise?: string | null;
  actif: boolean;
};

type Props = {
  examen: ExamenImagerie;
  onClose: () => void;
};

export default function EditExamenImagerie({
  examen,
  onClose,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: examen.code ?? "",
    nom: examen.nom ?? "",
    type: examen.type ?? "",
    description: examen.description ?? "",
    prix:
      examen.prix !== null &&
      examen.prix !== undefined
        ? String(examen.prix)
        : "",
    devise: examen.devise ?? "USD",
    actif: examen.actif,
  });

  /* =========================================================
     MODIFICATION DU FORMULAIRE
  ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     ACTIF / INACTIF
  ========================================================= */

  const handleActifChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      actif: e.target.checked,
    }));
  };

  /* =========================================================
     ENREGISTREMENT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    /* -------------------------------------------------------
       VALIDATIONS
    ------------------------------------------------------- */

    if (!form.code.trim()) {
      toast.error(
        "Le code de l'examen est obligatoire."
      );
      return;
    }

    if (!form.nom.trim()) {
      toast.error(
        "Le nom de l'examen est obligatoire."
      );
      return;
    }

    if (!form.type.trim()) {
      toast.error(
        "La catégorie de l'examen est obligatoire."
      );
      return;
    }

    const prix = form.prix
      ? Number(form.prix)
      : 0;

    if (
      Number.isNaN(prix) ||
      prix < 0
    ) {
      toast.error(
        "Le prix doit être un nombre positif."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await updateExamenImagerie(
          examen.id,
          {
            code: form.code
              .trim()
              .toUpperCase(),

            nom: form.nom.trim(),

            type: form.type.trim(),

            description:
              form.description.trim(),

            prix,

            devise:
              form.devise
                .trim()
                .toUpperCase(),

            actif: form.actif,
          }
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message ||
          "Examen modifié avec succès."
      );

      onClose();

      router.refresh();

    } catch (error) {
      console.error(
        "Erreur modification examen imagerie :",
        error
      );

      toast.error(
        "Une erreur est survenue lors de la modification."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-base-100 shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-base-200 px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ImageIcon size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Modifier l'examen d'imagerie
              </h2>

              <p className="text-sm text-base-content/60">
                Modifier les informations de cet examen.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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
                value={form.code}
                onChange={handleChange}
                className="input input-bordered w-full uppercase"
                required
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
                value={form.nom}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />

            </div>

            {/* TYPE */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-medium">
                  Catégorie *
                </span>
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >

                <option value="">
                  Sélectionner une catégorie
                </option>

                <option value="RADIOGRAPHIE">
                  Radiographie
                </option>

                <option value="ECHOGRAPHIE">
                  Échographie
                </option>

                <option value="SCANNER">
                  Scanner
                </option>

                <option value="IRM">
                  IRM
                </option>

                <option value="MAMMOGRAPHIE">
                  Mammographie
                </option>

                <option value="AUTRE">
                  Autre
                </option>

              </select>

            </div>

            {/* PRIX */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-medium">
                  Prix
                </span>
              </label>

              <input
                type="number"
                name="prix"
                value={form.prix}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input input-bordered w-full"
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
                value={form.devise}
                onChange={handleChange}
                className="select select-bordered w-full"
              >

                <option value="USD">
                  USD — Dollar américain
                </option>

                <option value="CDF">
                  CDF — Franc congolais
                </option>

              </select>

            </div>

            {/* STATUT */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-medium">
                  Statut
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 p-3">

                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={handleActifChange}
                  className="toggle toggle-primary"
                />

                <Power
                  size={18}
                  className={
                    form.actif
                      ? "text-success"
                      : "text-base-content/40"
                  }
                />

                <div>

                  <p className="font-medium">
                    {form.actif
                      ? "Examen actif"
                      : "Examen inactif"}
                  </p>

                  <p className="text-xs text-base-content/50">
                    {form.actif
                      ? "Disponible pour les demandes."
                      : "Non disponible pour les demandes."}
                  </p>

                </div>

              </label>

            </div>

            {/* DESCRIPTION */}

            <div className="form-control md:col-span-2">

              <label className="label">
                <span className="label-text font-medium">
                  Description
                </span>
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description de l'examen..."
                className="textarea textarea-bordered min-h-28 w-full"
              />

            </div>

          </div>

          {/* =================================================
              APERÇU
          ================================================= */}

          <div className="mt-5 rounded-xl bg-base-200/60 p-4">

            <div className="flex items-center gap-3">

              <ImageIcon
                size={18}
                className="text-primary"
              />

              <div>

                <p className="text-sm font-semibold">
                  Aperçu
                </p>

                <p className="text-xs text-base-content/60">
                  {form.code || "CODE"} •{" "}
                  {form.nom || "Nom de l'examen"} •{" "}
                  {form.type || "Catégorie"} •{" "}
                  {form.prix || "0"}{" "}
                  {form.devise}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-6 flex justify-end gap-3 border-t border-base-200 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >

              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Modification...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}