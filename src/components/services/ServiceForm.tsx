"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Hash,
  Save,
  X,
  Loader2,
  FileText,
  Power,
} from "lucide-react";

import {
  createService,
  updateService,
  type CreateServiceData,
  type UpdateServiceData,
} from "@/app/actions/services";

type Departement = {
  id: number;
  code: string | null;
  nom: string;
};

type ServiceData = {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  actif: boolean;
  departementId: number | null;
};

type Props = {
  departements?: Departement[];
  service?: ServiceData;
};

export default function ServiceForm({
  departements = [],
  service,
}: Props) {
  const router = useRouter();

  const modification = Boolean(service);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: service?.code ?? "",
    nom: service?.nom ?? "",
    description: service?.description ?? "",
    departementId: service?.departementId
      ? String(service.departementId)
      : "",
    actif: service?.actif ?? true,
  });

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const target = event.target;

    const name = target.name;

    const value =
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
        ? target.checked
        : target.value;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const code = formData.code.trim().toUpperCase();
    const nom = formData.nom.trim();
    const description =
      formData.description.trim() || null;

    const departementId = formData.departementId
      ? Number(formData.departementId)
      : null;

    if (!code) {
      setError("Le code du service est obligatoire.");
      return;
    }

    if (!nom) {
      setError("Le nom du service est obligatoire.");
      return;
    }

    if (
      departementId !== null &&
      !Number.isInteger(departementId)
    ) {
      setError("Le département sélectionné est invalide.");
      return;
    }

    try {
      setLoading(true);

      let result;

      if (modification && service) {
        const data: UpdateServiceData = {
          id: service.id,
          code,
          nom,
          description,
          departementId,
          actif: formData.actif,
        };

        result = await updateService(data);
      } else {
        const data: CreateServiceData = {
          code,
          nom,
          description,
          departementId,
          actif: formData.actif,
        };

        result = await createService(data);
      }

      if (!result.success) {
        setError(
          result.message ||
            "Une erreur est survenue."
        );
        return;
      }

      setSuccess(
        result.message ||
          (modification
            ? "Service modifié avec succès."
            : "Service créé avec succès.")
      );

      router.refresh();

      setTimeout(() => {
        router.push(
          modification && service
            ? `/services/${service.id}`
            : "/services"
        );
      }, 700);
    } catch (error) {
      console.error(
        "SERVICE_FORM_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;

    if (modification && service) {
      router.push(`/services/${service.id}`);
    } else {
      router.push("/services");
    }
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body">

        {/* HEADER */}

        <div className="flex items-center gap-3 pb-5 border-b border-base-300">

          <div className="avatar placeholder">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <Building2 size={24} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {modification
                ? "Modifier le service"
                : "Nouveau service"}
            </h2>

            <p className="text-sm text-base-content/60">
              {modification
                ? "Modifiez les informations du service."
                : "Créer un nouveau service hospitalier."}
            </p>
          </div>

        </div>

        {/* ERREUR */}

        {error && (
          <div className="alert alert-error mt-5">
            <span>{error}</span>
          </div>
        )}

        {/* SUCCÈS */}

        {success && (
          <div className="alert alert-success mt-5">
            <span>{success}</span>
          </div>
        )}

        {/* FORMULAIRE */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 mt-5"
        >

          {/* INFORMATIONS */}

          <section>

            <h3 className="text-lg font-semibold mb-4">
              Informations du service
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* CODE */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Code
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <Hash
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Ex : MED-GEN"
                    className="grow uppercase"
                    disabled={loading}
                  />

                </label>

                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Code unique du service
                  </span>
                </label>

              </div>

              {/* NOM */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Nom du service
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <Building2
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Ex : Médecine générale"
                    className="grow"
                    disabled={loading}
                  />

                </label>

              </div>

              {/* DEPARTEMENT */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Département
                  </span>
                </label>

                <select
                  name="departementId"
                  value={formData.departementId}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  disabled={loading}
                >
                  <option value="">
                    Aucun département
                  </option>

                  {departements.map((departement) => (
                    <option
                      key={departement.id}
                      value={departement.id}
                    >
                      {departement.code
                        ? `${departement.code} — `
                        : ""}
                      {departement.nom}
                    </option>
                  ))}
                </select>

                {departements.length === 0 && (
                  <label className="label">
                    <span className="label-text-alt text-warning">
                      Aucun département disponible.
                    </span>
                  </label>
                )}

              </div>

              {/* STATUT */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Statut
                  </span>
                </label>

                <label className="label cursor-pointer justify-start gap-4 border border-base-300 rounded-lg px-4 py-3">

                  <input
                    type="checkbox"
                    name="actif"
                    className="toggle toggle-success"
                    checked={formData.actif}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <div>
                    <p className="font-medium">
                      Service actif
                    </p>

                    <p className="text-xs text-base-content/60">
                      Le service est disponible dans
                      le système.
                    </p>
                  </div>

                </label>

              </div>

            </div>

          </section>

          {/* DESCRIPTION */}

          <section>

            <h3 className="text-lg font-semibold mb-4">
              Description
            </h3>

            <div className="form-control">

              <label className="label">
                <span className="label-text font-medium">
                  Description
                </span>
              </label>

              <label className="textarea textarea-bordered flex gap-2">

                <FileText
                  size={18}
                  className="text-base-content/50 mt-1"
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez le service..."
                  className="grow resize-none"
                  rows={5}
                  disabled={loading}
                />

              </label>

            </div>

          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-base-300">

            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              <X size={18} />
              Annuler
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  {modification
                    ? "Modification..."
                    : "Création..."}
                </>
              ) : (
                <>
                  <Save size={18} />

                  {modification
                    ? "Enregistrer les modifications"
                    : "Créer le service"}
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}