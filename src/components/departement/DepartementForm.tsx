"use client";

import { createDepartement, updateDepartement } from "@/app/actions/departement";
import { useRouter } from "next/navigation";
import { useState } from "react";



type DepartementFormData = {
  id?: number;
  code: string;
  nom: string;
  description: string;
  actif: boolean;
};

type Props = {
  mode: "create" | "edit";
  initialData?: DepartementFormData;
};

export default function DepartementForm({
  mode,
  initialData,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState<DepartementFormData>({
    id: initialData?.id,
    code: initialData?.code ?? "",
    nom: initialData?.nom ?? "",
    description: initialData?.description ?? "",
    actif: initialData?.actif ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    field: keyof DepartementFormData,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "create") {
        const result = await createDepartement({
          code: form.code || null,
          nom: form.nom,
          description: form.description || null,
          actif: form.actif,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        router.push("/departements");
        router.refresh();
      } else {
        if (!form.id) {
          setError("Identifiant du département manquant.");
          return;
        }

        const result = await updateDepartement({
          id: form.id,
          code: form.code || null,
          nom: form.nom,
          description: form.description || null,
          actif: form.actif,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        router.push(`/departements/${form.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Code
            </span>
          </label>

          <input
            type="text"
            value={form.code}
            onChange={(e) =>
              handleChange("code", e.target.value)
            }
            placeholder="Ex : CARDIO"
            className="input input-bordered w-full"
          />

          <label className="label">
            <span className="label-text-alt text-base-content/50">
              Le code doit être unique.
            </span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Nom du département *
            </span>
          </label>

          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) =>
              handleChange("nom", e.target.value)
            }
            placeholder="Ex : Médecine interne"
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Description
          </span>
        </label>

        <textarea
          value={form.description}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
          placeholder="Description du département..."
          className="textarea textarea-bordered min-h-32 w-full"
        />
      </div>

      <div className="rounded-lg border border-base-300 p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">
              Département actif
            </div>

            <div className="text-sm text-base-content/60">
              Un département inactif ne devrait plus être
              utilisé pour les nouvelles opérations.
            </div>
          </div>

          <input
            type="checkbox"
            checked={form.actif}
            onChange={(e) =>
              handleChange("actif", e.target.checked)
            }
            className="toggle toggle-primary"
          />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost"
          disabled={loading}
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading
            ? "Enregistrement..."
            : mode === "create"
            ? "Créer le département"
            : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}