
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  createActeMedical,
  updateActeMedical,
} from "@/app/actions/actes-medicaux";

type Acte = {
  id?: number;
  code: string;
  libelle: string;
  categorie?: string | null;
  montant: number;
  devise: string;
  actif: boolean;
};

type Props = {
  acte?: Acte;
};

export default function ActeMedicalForm({ acte }: Props) {
  const router = useRouter();

  const [code, setCode] = useState(acte?.code ?? "");
  const [libelle, setLibelle] = useState(acte?.libelle ?? "");
  const [categorie, setCategorie] = useState(acte?.categorie ?? "");
  const [montant, setMontant] = useState(
    acte?.montant?.toString() ?? "",
  );
  const [devise, setDevise] = useState(acte?.devise ?? "USD");
  const [actif, setActif] = useState(acte?.actif ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!code.trim()) {
      toast.error("Le code est obligatoire.");
      return;
    }

    if (!libelle.trim()) {
      toast.error("Le libellé est obligatoire.");
      return;
    }

    const montantNumber = Number(montant);

    if (!Number.isFinite(montantNumber) || montantNumber < 0) {
      toast.error("Montant invalide.");
      return;
    }

    try {
      setLoading(true);

      const result = acte?.id
        ? await updateActeMedical(acte.id, {
            code: code.trim(),
            libelle: libelle.trim(),
            categorie: categorie.trim() || null,
            montant: montantNumber,
            devise,
            actif,
          })
        : await createActeMedical({
            code: code.trim(),
            libelle: libelle.trim(),
            categorie: categorie.trim() || null,
            montant: montantNumber,
            devise,
            actif,
          });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.push(
        acte?.id
          ? `/actes/${acte.id}`
          : "/actes",
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-base-300 bg-base-200/40 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold">
                {acte
                  ? "Modifier l'acte médical"
                  : "Nouvel acte médical"}
              </h1>

              <p className="text-sm text-base-content/60">
                Gestion du référentiel et de la tarification des actes.
              </p>
            </div>

          </div>

          <div
            className={`badge badge-lg gap-2 ${
              actif
                ? "badge-success"
                : "badge-ghost"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {actif ? "Actif" : "Inactif"}
          </div>

        </div>

        {/* FORMULAIRE */}

        <div className="p-6">

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

            {/* CODE */}

            <div className="lg:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Code <span className="text-error">*</span>
                </span>
              </label>

              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase())
                }
                className="input input-bordered w-full font-mono"
                placeholder="ACT-001"
                disabled={loading}
                required
              />
            </div>

            {/* LIBELLE */}

            <div className="lg:col-span-4">
              <label className="label">
                <span className="label-text font-semibold">
                  Libellé <span className="text-error">*</span>
                </span>
              </label>

              <input
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Consultation générale"
                disabled={loading}
                required
              />
            </div>

            {/* CATEGORIE */}

            <div className="lg:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Catégorie
                </span>
              </label>

              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="select select-bordered w-full"
                disabled={loading}
              >
                <option value="">Catégorie</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="DIAGNOSTIC">Diagnostic</option>
                <option value="LABORATOIRE">Laboratoire</option>
                <option value="IMAGERIE">Imagerie</option>
                <option value="CHIRURGIE">Chirurgie</option>
                <option value="SOINS">Soins</option>
                <option value="HOSPITALISATION">
                  Hospitalisation
                </option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            {/* MONTANT */}

            <div className="lg:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Tarif <span className="text-error">*</span>
                </span>
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="input input-bordered w-full font-semibold"
                placeholder="0.00"
                disabled={loading}
                required
              />
            </div>

            {/* DEVISE */}

            <div className="lg:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Devise
                </span>
              </label>

              <select
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                className="select select-bordered w-full"
                disabled={loading}
              >
                <option value="USD">USD</option>
                <option value="CDF">CDF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

          </div>

          {/* STATUT */}

          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-base-300 bg-base-200/30 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="font-semibold">
                Disponibilité de l'acte
              </p>

              <p className="text-sm text-base-content/60">
                Un acte inactif ne peut pas être ajouté à une nouvelle consultation.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-sm font-medium">
                {actif ? "Acte actif" : "Acte inactif"}
              </span>

              <input
                type="checkbox"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
                className="toggle toggle-success"
                disabled={loading}
              />
            </label>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-200/30 px-6 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            className="btn btn-ghost"
            disabled={loading}
            onClick={() =>
              router.push(
                "/actes",
              )
            }
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn-primary min-w-44"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Enregistrement...
              </>
            ) : acte ? (
              "Enregistrer les modifications"
            ) : (
              "Créer l'acte"
            )}
          </button>

        </div>

      </div>
    </form>
  );
}
