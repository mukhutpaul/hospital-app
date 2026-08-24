"use client";

import { useState } from "react";
import { ImageIcon, Plus, X } from "lucide-react";
import Swal from "sweetalert2";

import {
  createExamenImagerie,
} from "@/app/actions/imagerie";

export default function AjouterExamenImagerieModal() {
  const [ouvert, setOuvert] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    nom: "",
    type: "",
    description: "",
    prix: "",
    devise: "USD",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fermer = () => {
    if (loading) return;

    setOuvert(false);

    setForm({
      code: "",
      nom: "",
      type: "",
      description: "",
      prix: "",
      devise: "USD",
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const result = await createExamenImagerie({
        code: form.code,
        nom: form.nom,
        type: form.type,
        description: form.description,
        prix: form.prix
          ? Number(form.prix)
          : 0,
        devise: form.devise,
      });

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Erreur",
          text: result.message,
          confirmButtonText: "OK",
        });

        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Examen ajouté",
        text: result.message,
        timer: 1800,
        showConfirmButton: false,
      });

      fermer();
    } catch (error) {
      console.error(error);

      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          BOUTON
      ===================================================== */}

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOuvert(true)}
      >
        <Plus size={18} />
        Ajouter un examen
      </button>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {ouvert && (
        <dialog
          open
          className="modal modal-open"
        >
          <div
            className="modal-box max-w-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ImageIcon size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Ajouter un examen d'imagerie
                  </h3>

                  <p className="text-sm text-base-content/60">
                    Créer un nouvel examen avec sa
                    catégorie.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={fermer}
                disabled={loading}
              >
                <X size={18} />
              </button>
            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* CODE + NOM */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ex: RADIO-001"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

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
                    placeholder="Ex: Radiographie thorax"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              {/* CATEGORIE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Catégorie *
                  </span>
                </label>

                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="Ex: Radiologie, Scanner, IRM, Échographie..."
                  className="input input-bordered w-full"
                  required
                />

                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Cette valeur correspond au champ
                    <strong> type </strong>
                    de ton modèle ExamenImagerie.
                  </span>
                </label>
              </div>

              {/* DESCRIPTION */}

              <div className="form-control">
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
                  className="textarea textarea-bordered w-full h-24"
                />
              </div>

              {/* PRIX + DEVISE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                  />
                </div>

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
                      USD
                    </option>

                    <option value="CDF">
                      CDF
                    </option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="divider" />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={fermer}
                  disabled={loading}
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
                  ) : (
                    <>
                      <Plus size={18} />
                      Ajouter l'examen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
}