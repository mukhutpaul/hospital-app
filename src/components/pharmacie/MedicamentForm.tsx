"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

type Medicament = {
  id?: number;
  code: string;
  nom: string;
  denomination?: string | null;
  forme?: string | null;
  dosage?: string | null;
  laboratoire?: string | null;
  categorie?: string | null;
  prixVente: number;
  prixAchat: number;
  devise: string;
  seuilAlerte: number;
  actif: boolean;
};

type MedicamentFormProps = {
  medicament?: Medicament | null;
  onSubmit: (data: Omit<Medicament, "id">) => Promise<void>;
  onCancel?: () => void;
};

const initialForm: Omit<Medicament, "id"> = {
  code: "",
  nom: "",
  denomination: "",
  forme: "",
  dosage: "",
  laboratoire: "",
  categorie: "",
  prixVente: 0,
  prixAchat: 0,
  devise: "USD",
  seuilAlerte: 0,
  actif: true,
};

export default function MedicamentForm({
  medicament,
  onSubmit,
  onCancel,
}: MedicamentFormProps) {
  const [form, setForm] =
    useState<Omit<Medicament, "id">>(initialForm);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicament) {
      setForm({
        code: medicament.code ?? "",
        nom: medicament.nom ?? "",
        denomination: medicament.denomination ?? "",
        forme: medicament.forme ?? "",
        dosage: medicament.dosage ?? "",
        laboratoire: medicament.laboratoire ?? "",
        categorie: medicament.categorie ?? "",
        prixVente: medicament.prixVente ?? 0,
        prixAchat: medicament.prixAchat ?? 0,
        devise: medicament.devise ?? "USD",
        seuilAlerte: medicament.seuilAlerte ?? 0,
        actif: medicament.actif ?? true,
      });
    } else {
      setForm(initialForm);
    }
  }, [medicament]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Le code du médicament est obligatoire.");
      return;
    }

    if (!form.nom.trim()) {
      alert("Le nom du médicament est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Code *
            </span>
          </label>

          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="MED-001"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Nom *
            </span>
          </label>

          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Paracétamol"
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Dénomination
            </span>
          </label>

          <input
            name="denomination"
            value={form.denomination ?? ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Paracetamol"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Forme
            </span>
          </label>

          <select
            name="forme"
            value={form.forme ?? ""}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="">Sélectionner</option>
            <option value="COMPRIME">Comprimé</option>
            <option value="GELULE">Gélule</option>
            <option value="SIROP">Sirop</option>
            <option value="INJECTION">Injection</option>
            <option value="POMMADE">Pommade</option>
            <option value="CREME">Crème</option>
            <option value="GOUTTES">Gouttes</option>
            <option value="SUPPOSITOIRE">
              Suppositoire
            </option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Dosage
            </span>
          </label>

          <input
            name="dosage"
            value={form.dosage ?? ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="500 mg"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Laboratoire
            </span>
          </label>

          <input
            name="laboratoire"
            value={form.laboratoire ?? ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Laboratoire..."
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Catégorie
            </span>
          </label>

          <input
            name="categorie"
            value={form.categorie ?? ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Antalgique"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Prix d'achat
            </span>
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            name="prixAchat"
            value={form.prixAchat}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Prix de vente
            </span>
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            name="prixVente"
            value={form.prixVente}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Devise
            </span>
          </label>

          <select
            name="devise"
            value={form.devise}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="USD">USD</option>
            <option value="CDF">CDF</option>
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">
              Seuil d'alerte
            </span>
          </label>

          <input
            type="number"
            min="0"
            step="1"
            name="seuilAlerte"
            value={form.seuilAlerte}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="actif"
          checked={form.actif}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              actif: e.target.checked,
            }))
          }
          className="checkbox checkbox-primary"
        />

        <span>
          Médicament actif
        </span>
      </label>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={loading}
          >
            <X size={18} />
            Annuler
          </button>
        )}

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
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={18} />
              {medicament
                ? "Modifier"
                : "Enregistrer"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}