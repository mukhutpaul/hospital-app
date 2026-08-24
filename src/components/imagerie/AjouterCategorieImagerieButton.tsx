"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Plus,
  X,
  ImageIcon,
  Save,
  Power,
} from "lucide-react";

import { createExamenImagerie } from "@/app/actions/imagerie";

import Swal from "sweetalert2";

export default function AjouterCategorieImagerieButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     FORMULAIRE
  ========================================================= */

  const [form, setForm] = useState({
    code: "",
    nom: "",
    type: "",
    description: "",
    prix: "",
    devise: "USD",
    actif: true,
  });

  /* =========================================================
     MODIFICATION DES CHAMPS
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
     RESET
  ========================================================= */

  const resetForm = () => {
    setForm({
      code: "",
      nom: "",
      type: "",
      description: "",
      prix: "",
      devise: "USD",
      actif: true,
    });
  };

  /* =========================================================
     FERMER
  ========================================================= */

  const handleClose = () => {
    if (loading) return;

    setOpen(false);
    resetForm();
  };

  /* =========================================================
     SOUMISSION
  ========================================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    const code = form.code.trim().toUpperCase();
    const nom = form.nom.trim();
    const type = form.type.trim();
    const description = form.description.trim();

    /* =======================================================
       VALIDATIONS
    ======================================================= */

    if (!code) {
      await Swal.fire({
        icon: "warning",
        title: "Code obligatoire",
        text: "Veuillez saisir le code de l'examen.",
        confirmButtonText: "OK",
      });

      return;
    }

    if (!nom) {
      await Swal.fire({
        icon: "warning",
        title: "Nom obligatoire",
        text: "Veuillez saisir le nom de l'examen.",
        confirmButtonText: "OK",
      });

      return;
    }

    if (!type) {
      await Swal.fire({
        icon: "warning",
        title: "Catégorie obligatoire",
        text: "Veuillez sélectionner une catégorie.",
        confirmButtonText: "OK",
      });

      return;
    }

    const prix = form.prix
      ? Number(form.prix)
      : 0;

    if (Number.isNaN(prix) || prix < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Prix invalide",
        text: "Veuillez saisir un prix valide.",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      setLoading(true);

      /* =====================================================
         CRÉATION DE L'EXAMEN
      ===================================================== */

      const result = await createExamenImagerie({
        code,
        nom,
        type,
        description: description || null,
        prix,
        devise: form.devise,
        actif: form.actif,
      });

      /* =====================================================
         ERREUR
      ===================================================== */

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Erreur",
          text: result.message,
          confirmButtonText: "OK",
        });

        return;
      }

      /* =====================================================
         SUCCÈS
      ===================================================== */

      await Swal.fire({
        icon: "success",
        title: "Examen ajouté",
        text: `L'examen "${nom}" a été ajouté avec succès.`,
        confirmButtonText: "OK",
      });

      setOpen(false);
      resetForm();

      router.refresh();

    } catch (error) {
      console.error(
        "Erreur création examen imagerie :",
        error
      );

      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text:
          "Une erreur est survenue lors de la création de l'examen.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* =====================================================
          BOUTON
      ===================================================== */}

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />

        Ajouter un examen
      </button>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

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

                  <h3 className="text-lg font-bold">
                    Ajouter un examen d'imagerie
                  </h3>

                  <p className="text-sm text-base-content/60">
                    Enregistrer un nouvel examen d'imagerie
                    médicale.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleClose}
                className="btn btn-sm btn-circle btn-ghost"
                disabled={loading}
              >
                <X size={18} />
              </button>

            </div>

            {/* =================================================
                FORMULAIRE
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* =================================================
                  CODE + NOM
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* CODE */}

                <div className="form-control">

                  <label className="label">
                    <span className="label-text font-semibold">
                      Code *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Ex : RADIO-001"
                    className="input input-bordered w-full uppercase"
                    disabled={loading}
                    required
                  />

                </div>

                {/* NOM */}

                <div className="form-control">

                  <label className="label">
                    <span className="label-text font-semibold">
                      Nom de l'examen *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Ex : Radiographie thoracique"
                    className="input input-bordered w-full"
                    disabled={loading}
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  CATÉGORIE
              ================================================= */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-semibold">
                    Catégorie *
                  </span>
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  disabled={loading}
                  required
                >

                  <option value="">
                    Sélectionner une catégorie
                  </option>

                  <option value="Radiologie">
                    Radiologie
                  </option>

                  <option value="Radiographie">
                    Radiographie
                  </option>

                  <option value="Échographie">
                    Échographie
                  </option>

                  <option value="Scanner">
                    Scanner
                  </option>

                  <option value="IRM">
                    IRM
                  </option>

                  <option value="Mammographie">
                    Mammographie
                  </option>

                  <option value="Autre">
                    Autre
                  </option>

                </select>

              </div>

              {/* =================================================
                  PRIX + DEVISE
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* PRIX */}

                <div className="form-control">

                  <label className="label">

                    <span className="label-text font-semibold">
                      Prix *
                    </span>

                    <span className="label-text-alt text-base-content/50">
                      Montant
                    </span>

                  </label>

                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    disabled={loading}
                    required
                  />

                </div>

                {/* DEVISE */}

                <div className="form-control">

                  <label className="label">
                    <span className="label-text font-semibold">
                      Devise *
                    </span>
                  </label>

                  <select
                    name="devise"
                    value={form.devise}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    disabled={loading}
                    required
                  >

                    <option value="USD">
                      USD — Dollar américain
                    </option>

                    <option value="CDF">
                      CDF — Franc congolais
                    </option>

                  </select>

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Description
                  </span>

                  <span className="label-text-alt text-base-content/50">
                    Facultatif
                  </span>

                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description de l'examen..."
                  className="textarea textarea-bordered min-h-28 w-full"
                  disabled={loading}
                />

              </div>

              {/* =================================================
                  STATUT
              ================================================= */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Statut
                  </span>

                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-base-300 p-4">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        form.actif
                          ? "bg-success/10 text-success"
                          : "bg-base-200 text-base-content/40"
                      }`}
                    >
                      <Power size={19} />
                    </div>

                    <div>

                      <p className="font-medium">
                        {form.actif
                          ? "Examen actif"
                          : "Examen inactif"}
                      </p>

                      <p className="text-xs text-base-content/50">
                        {form.actif
                          ? "Disponible pour les demandes d'imagerie."
                          : "Non disponible actuellement."}
                      </p>

                    </div>

                  </div>

                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        actif: e.target.checked,
                      }))
                    }
                    className="toggle toggle-primary"
                    disabled={loading}
                  />

                </label>

              </div>

              {/* =================================================
                  APERÇU
              ================================================= */}

              {form.nom.trim() && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <ImageIcon
                        size={18}
                        className="text-primary"
                      />

                      <div>

                        <p className="text-xs text-base-content/50">
                          Aperçu
                        </p>

                        <p className="font-semibold">
                          {form.nom.trim()}
                        </p>

                        <p className="text-xs text-base-content/60">
                          {form.type || "Catégorie non définie"}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="font-bold">
                        {Number(form.prix || 0).toFixed(2)}{" "}
                        {form.devise}
                      </p>

                      <p className="text-xs text-base-content/50">
                        {form.code || "CODE"}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="flex justify-end gap-3 border-t border-base-200 pt-5">

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    !form.code.trim() ||
                    !form.nom.trim() ||
                    !form.type.trim()
                  }
                >

                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer l'examen
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}