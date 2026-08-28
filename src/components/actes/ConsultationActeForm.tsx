"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { toast } from "react-toastify";
import {
Activity,
Calculator,
FileText,
Hash,
Minus,
Plus,
Save,
Stethoscope,
} from "lucide-react";

import {
createConsultationActe,
} from "@/app/actions/actes-medicaux";

type Props = {
consultationId: number;
actes: any[];
};

type ActeOption = {
value: number;
label: string;
code: string;
libelle: string;
categorie?: string | null;
montant: number;
devise: string;
};

export default function ConsultationActeForm({
consultationId,
actes,
}: Props) {
const router = useRouter();

const [acteId, setActeId] = useState<number | null>(null);
const [quantite, setQuantite] = useState("1");
const [observation, setObservation] = useState("");
const [loading, setLoading] = useState(false);

/* ==========================================================
OPTIONS REACT SELECT
========================================================== */

const options: ActeOption[] = actes.map((acte) => ({
value: acte.id,
label: `${acte.code} — ${acte.libelle}`,
code: acte.code,
libelle: acte.libelle,
categorie: acte.categorie,
montant: Number(acte.montant),
devise: acte.devise,
}));

const acteSelectionne =
options.find((acte) => acte.value === acteId) ?? null;

/* ==========================================================
CALCUL
========================================================== */

const prixUnitaire =
acteSelectionne?.montant ?? 0;

const quantiteNumber =
Number(quantite) || 0;

const montant =
prixUnitaire * quantiteNumber;

/* ==========================================================
QUANTITÉ
========================================================== */

function diminuerQuantite() {
const valeur = Math.max(
0.01,
Number(quantite || 0) - 1,
);

setQuantite(
  Number.isInteger(valeur)
    ? String(valeur)
    : valeur.toFixed(2),
);


}

function augmenterQuantite() {
const valeur =
Number(quantite || 0) + 1;


setQuantite(
  Number.isInteger(valeur)
    ? String(valeur)
    : valeur.toFixed(2),
);


}

/* ==========================================================
SOUMISSION
========================================================== */

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>,
) {
event.preventDefault();


if (!acteId) {
  toast.error(
    "Veuillez sélectionner un acte médical.",
  );
  return;
}

const quantiteNumber = Number(quantite);

if (
  !Number.isFinite(quantiteNumber) ||
  quantiteNumber <= 0
) {
  toast.error(
    "La quantité doit être supérieure à zéro.",
  );
  return;
}

try {
  setLoading(true);

  const result =
    await createConsultationActe({
      consultationId,
      acteId,
      quantite: quantiteNumber,
      observation: observation.trim(),
    });

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  toast.success(result.message);

  setActeId(null);
  setQuantite("1");
  setObservation("");

  router.refresh();
} catch (error) {
  console.error(error);

  toast.error(
    "Impossible d'ajouter l'acte médical.",
  );
} finally {
  setLoading(false);
}


}

return ( <form
   onSubmit={handleSubmit}
   className="
     overflow-hidden
     rounded-2xl
     border
     border-primary/30
     bg-base-200
     shadow-lg
   "
 >
{/* =====================================================
EN-TÊTE
====================================================== */}

```
  <div
    className="
      border-b
      border-base-300
      bg-gradient-to-r
      from-primary/20
      via-primary/10
      to-base-200
      px-5
      py-5
      sm:px-6
    "
  >
    <div className="flex items-start gap-3">
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-primary
          text-primary-content
          shadow-md
        "
      >
        <Stethoscope size={23} />
      </div>

      <div>
        <h2 className="text-lg font-bold sm:text-xl">
          Ajouter un acte médical
        </h2>

        <p className="mt-1 text-sm text-base-content/60">
          Associez un acte médical à cette
          consultation et renseignez les informations
          nécessaires.
        </p>
      </div>
    </div>
  </div>

  {/* =====================================================
      CONTENU
  ====================================================== */}

  <div className="space-y-6 p-5 sm:p-6">

    {/* =================================================
        ACTE MÉDICAL
    ================================================== */}

    <div className="form-control">
      <label
        htmlFor="acte-medical"
        className="
          mb-2
          flex
          items-center
          gap-2
          text-sm
          font-semibold
        "
      >
        <Activity
          size={16}
          className="text-primary"
        />

        Acte médical

        <span className="text-error">*</span>
      </label>

      <Select<ActeOption, false>
        instanceId="acte-medical"
        inputId="acte-medical"
        options={options}
        value={acteSelectionne}
        onChange={(option) =>
          setActeId(option?.value ?? null)
        }
        isDisabled={loading}
        isSearchable
        isClearable
        placeholder="Rechercher un acte médical..."
        noOptionsMessage={() =>
          "Aucun acte médical trouvé"
        }
        loadingMessage={() =>
          "Chargement..."
        }
        getOptionLabel={(option) =>
          `${option.code} — ${option.libelle}`
        }
        getOptionValue={(option) =>
          String(option.value)
        }
        filterOption={(candidate, input) => {
          const search =
            input.toLowerCase().trim();

          const data = candidate.data;

          return (
            data.code
              .toLowerCase()
              .includes(search) ||
            data.libelle
              .toLowerCase()
              .includes(search) ||
            data.categorie
              ?.toLowerCase()
              .includes(search) ||
            false
          );
        }}
        formatOptionLabel={(option) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="
                    rounded-md
                    bg-primary/10
                    px-2
                    py-0.5
                    font-mono
                    text-xs
                    font-bold
                    text-primary
                  "
                >
                  {option.code}
                </span>

                {option.categorie && (
                  <span className="text-xs text-base-content/40">
                    {option.categorie}
                  </span>
                )}
              </div>

              <p className="mt-1 truncate font-medium">
                {option.libelle}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-primary">
                {option.montant.toFixed(2)}
              </p>

              <p className="text-xs text-base-content/50">
                {option.devise}
              </p>
            </div>
          </div>
        )}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "0.75rem",
            borderColor: state.isFocused
              ? "oklch(var(--p))"
              : "oklch(var(--bc) / 0.2)",
            backgroundColor:
              "oklch(var(--b1))",
            boxShadow: state.isFocused
              ? "0 0 0 2px oklch(var(--p) / 0.15)"
              : "none",
            cursor: loading
              ? "not-allowed"
              : "default",
          }),

          menu: (base) => ({
            ...base,
            zIndex: 50,
            borderRadius: "0.75rem",
            overflow: "hidden",
          }),

          menuList: (base) => ({
            ...base,
            padding: "6px",
            maxHeight: "280px",
          }),

          option: (
            base,
            state,
          ) => ({
            ...base,
            borderRadius: "0.5rem",
            padding: "10px 12px",
            backgroundColor:
              state.isSelected
                ? "oklch(var(--p))"
                : state.isFocused
                  ? "oklch(var(--b2))"
                  : "transparent",
            color:
              state.isSelected
                ? "oklch(var(--pc))"
                : "oklch(var(--bc))",
            cursor: "pointer",
          }),

          singleValue: (base) => ({
            ...base,
            color:
              "oklch(var(--bc))",
          }),

          input: (base) => ({
            ...base,
            color:
              "oklch(var(--bc))",
          }),

          placeholder: (base) => ({
            ...base,
            color:
              "oklch(var(--bc) / 0.45)",
          }),

          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
        menuPortalTarget={
          typeof document !== "undefined"
            ? document.body
            : undefined
        }
      />

      {!actes.length && (
        <div className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          Aucun acte médical actif disponible.
        </div>
      )}

      {actes.length > 0 && (
        <p className="mt-1.5 text-xs text-base-content/45">
          Recherchez par code, libellé ou catégorie.
        </p>
      )}
    </div>

    {/* =================================================
        INFORMATIONS ACTE
    ================================================== */}

    {acteSelectionne && (
      <div
        className="
          rounded-xl
          border
          border-primary/30
          bg-primary/10
          p-4
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="badge badge-primary font-mono">
                {acteSelectionne.code}
              </span>

              {acteSelectionne.categorie && (
                <span className="badge badge-ghost">
                  {acteSelectionne.categorie}
                </span>
              )}
            </div>

            <p className="font-semibold">
              {acteSelectionne.libelle}
            </p>
          </div>

          <div
            className="
              shrink-0
              rounded-xl
              border
              border-base-300
              bg-base-100
              px-5
              py-3
              text-right
              shadow-sm
            "
          >
            <p className="text-xs text-base-content/50">
              Prix unitaire
            </p>

            <p className="text-xl font-bold text-primary">
              {prixUnitaire.toFixed(2)}{" "}
              {acteSelectionne.devise}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* =================================================
        QUANTITÉ + MONTANT
    ================================================== */}

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* QUANTITÉ */}

      <div className="form-control">
        <label
          htmlFor="quantite"
          className="
            mb-2
            flex
            items-center
            gap-2
            text-sm
            font-semibold
          "
        >
          <Hash
            size={16}
            className="text-primary"
          />

          Quantité

          <span className="text-error">*</span>
        </label>

        <div
          className="
            flex
            h-12
            overflow-hidden
            rounded-xl
            border
            border-base-300
            bg-base-100
            shadow-sm
            focus-within:border-primary
            focus-within:ring-2
            focus-within:ring-primary/20
          "
        >
          <button
            type="button"
            onClick={diminuerQuantite}
            disabled={
              loading ||
              quantiteNumber <= 0.01
            }
            className="
              flex
              w-12
              items-center
              justify-center
              border-r
              border-base-300
              transition
              hover:bg-base-200
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            title="Diminuer"
          >
            <Minus size={17} />
          </button>

          <input
            id="quantite"
            type="number"
            min="0.01"
            step="0.01"
            value={quantite}
            onChange={(e) =>
              setQuantite(e.target.value)
            }
            className="
              min-w-0
              flex-1
              bg-transparent
              text-center
              font-semibold
              outline-none
            "
            disabled={loading}
            required
          />

          <button
            type="button"
            onClick={augmenterQuantite}
            disabled={loading}
            className="
              flex
              w-12
              items-center
              justify-center
              border-l
              border-base-300
              transition
              hover:bg-base-200
              disabled:opacity-40
            "
            title="Augmenter"
          >
            <Plus size={17} />
          </button>
        </div>

        <p className="mt-1.5 text-xs text-base-content/45">
          Les quantités décimales sont autorisées.
        </p>
      </div>

      {/* MONTANT */}

      <div>
        <div
          className="
            mb-2
            flex
            items-center
            gap-2
            text-sm
            font-semibold
          "
        >
          <Calculator
            size={16}
            className="text-primary"
          />

          Montant total
        </div>

        <div
          className="
            flex
            min-h-12
            items-center
            justify-between
            rounded-xl
            border
            border-primary/30
            bg-primary/10
            px-4
            shadow-sm
          "
        >
          <div>
            <p className="text-xs text-base-content/50">
              {acteSelectionne
                ? `${prixUnitaire.toFixed(2)} × ${quantiteNumber}`
                : "Sélectionnez un acte"}
            </p>
          </div>

          <p className="text-xl font-bold text-primary">
            {montant.toFixed(2)}{" "}
            {acteSelectionne?.devise ?? "USD"}
          </p>
        </div>
      </div>
    </div>

    {/* =================================================
        OBSERVATION
    ================================================== */}

    <div className="form-control">
      <label
        htmlFor="observation"
        className="
          mb-2
          flex
          items-center
          gap-2
          text-sm
          font-semibold
        "
      >
        <FileText
          size={16}
          className="text-primary"
        />

        Observation

        <span className="text-xs font-normal text-base-content/40">
          (facultatif)
        </span>
      </label>

      <textarea
        id="observation"
        value={observation}
        onChange={(e) =>
          setObservation(e.target.value)
        }
        className="
          textarea
          textarea-bordered
          min-h-28
          w-full
          resize-y
          rounded-xl
          bg-base-100
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/20
        "
        placeholder="Ajoutez une observation concernant la réalisation de cet acte..."
        disabled={loading}
        maxLength={1000}
      />

      <div className="mt-1 flex justify-end text-xs text-base-content/40">
        {observation.length} / 1000
      </div>
    </div>
  </div>

  {/* =====================================================
      FOOTER
  ====================================================== */}

  <div
    className="
      flex
      flex-col-reverse
      gap-3
      border-t
      border-base-300
      bg-base-300/40
      px-5
      py-4
      sm:flex-row
      sm:items-center
      sm:justify-between
      sm:px-6
    "
  >
    <div className="text-xs text-base-content/50">
      <span className="text-error">*</span>{" "}
      Champs obligatoires
    </div>

    <button
      type="submit"
      className="
        btn
        btn-primary
        min-w-44
        shadow-md
      "
      disabled={
        loading ||
        !acteId ||
        quantiteNumber <= 0
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
          Ajouter l'acte
        </>
      )}
    </button>
  </div>
</form>

);
}
