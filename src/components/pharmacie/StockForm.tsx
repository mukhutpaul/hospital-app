"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

import {
  Loader2,
  Save,
  X,
} from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

type Medicament = {
  id: number;
  code: string;
  nom: string;
  dosage?: string | null;
  forme?: string | null;
};

type Stock = {
  id?: number;
  medicamentId: number;
  lot?: string | null;
  dateExpiration?: string | Date | null;
  quantite: number;
};

type Props = {
  medicaments: Medicament[];
  stock?: Stock | null;

  onSubmit: (
    data: Omit<Stock, "id">
  ) => Promise<void>;

  onCancel?: () => void;
};

type MedicamentOption = {
  value: number;
  label: string;
  medicament: Medicament;
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function StockForm({
  medicaments = [],
  stock = null,
  onSubmit,
  onCancel,
}: Props) {
  /* ========================================================
     ETATS
  ======================================================== */

  const [medicamentId, setMedicamentId] =
    useState<number | null>(null);

  const [lot, setLot] = useState("");

  const [dateExpiration, setDateExpiration] =
    useState("");

  const [quantite, setQuantite] =
    useState<number>(0);

  const [loading, setLoading] =
    useState(false);

  /* ========================================================
     OPTIONS REACT SELECT
  ======================================================== */

  const medicamentOptions: MedicamentOption[] =
    medicaments.map((medicament) => ({
      value: medicament.id,

      label: [
        medicament.code,
        medicament.nom,
        medicament.dosage,
        medicament.forme
          ? `(${medicament.forme})`
          : null,
      ]
        .filter(Boolean)
        .join(" — "),

      medicament,
    }));

  /* ========================================================
     MÉDICAMENT SÉLECTIONNÉ
  ======================================================== */

  const selectedMedicament =
    medicamentOptions.find(
      (option) =>
        option.value === medicamentId
    ) ?? null;

  /* ========================================================
     INITIALISATION
  ======================================================== */

  useEffect(() => {
    if (stock) {
      setMedicamentId(
        Number(stock.medicamentId)
      );

      setLot(
        stock.lot ?? ""
      );

      /* ----------------------------------------------------
         DATE
      ---------------------------------------------------- */

      if (stock.dateExpiration) {
        const date =
          new Date(
            stock.dateExpiration
          );

        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {
          const year =
            date.getFullYear();

          const month =
            String(
              date.getMonth() + 1
            ).padStart(2, "0");

          const day =
            String(
              date.getDate()
            ).padStart(2, "0");

          setDateExpiration(
            `${year}-${month}-${day}`
          );
        } else {
          setDateExpiration("");
        }
      } else {
        setDateExpiration("");
      }

      setQuantite(
        Number(stock.quantite) || 0
      );
    } else {
      setMedicamentId(null);
      setLot("");
      setDateExpiration("");
      setQuantite(0);
    }
  }, [stock]);

  /* ========================================================
     SOUMISSION
  ======================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    /* ------------------------------------------------------
       MÉDICAMENT
    ------------------------------------------------------ */

    if (!medicamentId) {
      alert(
        "Veuillez sélectionner un médicament."
      );
      return;
    }

    /* ------------------------------------------------------
       QUANTITÉ
    ------------------------------------------------------ */

    if (
      !Number.isFinite(quantite) ||
      quantite < 0
    ) {
      alert(
        "La quantité doit être supérieure ou égale à zéro."
      );
      return;
    }

    /* ------------------------------------------------------
       DATE EXPIRATION
    ------------------------------------------------------ */

    let expiration: Date | null = null;

    if (dateExpiration) {
      const date =
        new Date(
          `${dateExpiration}T00:00:00`
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        alert(
          "La date d'expiration est invalide."
        );
        return;
      }

      expiration = date;
    }

    /* ------------------------------------------------------
       ENREGISTREMENT
    ------------------------------------------------------ */

    try {
      setLoading(true);

      await onSubmit({
        medicamentId,

        lot:
          lot.trim() || null,

        dateExpiration:
          expiration,

        quantite:
          Number(quantite),
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement du stock :",
        error
      );

      alert(
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
     ANNULATION
  ======================================================== */

  const handleCancel = () => {
    if (loading) return;

    onCancel?.();
  };

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* ====================================================
          MÉDICAMENT
      ==================================================== */}

      <div>
        <label className="label">
          <span className="label-text font-semibold">
            Médicament *
          </span>
        </label>

        <Select<MedicamentOption>
          options={
            medicamentOptions
          }

          value={
            selectedMedicament
          }

          onChange={(option) => {
            setMedicamentId(
              option?.value ?? null
            );
          }}

          isDisabled={
            loading ||
            medicaments.length === 0
          }

          isClearable

          isSearchable

          placeholder="Rechercher un médicament..."

          noOptionsMessage={() =>
            "Aucun médicament trouvé"
          }

          loadingMessage={() =>
            "Chargement..."
          }

          getOptionLabel={(option) =>
            option.label
          }

          getOptionValue={(option) =>
            String(option.value)
          }

          filterOption={(
            option,
            inputValue
          ) => {
            const search =
              inputValue
                .toLowerCase()
                .trim();

            const medicament =
              option.data.medicament;

            return [
              medicament.code,
              medicament.nom,
              medicament.dosage,
              medicament.forme,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(search)
              );
          }}

          formatOptionLabel={(
            option
          ) => (
            <div className="flex flex-col">
              <span className="font-medium">
                {option.medicament.nom}
              </span>

              <span className="text-xs text-base-content/60">
                {option.medicament.code}

                {option.medicament.dosage
                  ? ` • ${option.medicament.dosage}`
                  : ""}

                {option.medicament.forme
                  ? ` • ${option.medicament.forme}`
                  : ""}
              </span>
            </div>
          )}

          styles={{
            control: (
              base,
              state
            ) => ({
              ...base,

              minHeight:
                "3rem",

              borderRadius:
                "0.5rem",

              borderColor:
                state.isFocused
                  ? "hsl(var(--p))"
                  : "hsl(var(--bc) / 0.2)",

              boxShadow:
                state.isFocused
                  ? "0 0 0 1px hsl(var(--p))"
                  : "none",

              backgroundColor:
                "hsl(var(--b1))",
            }),

            menu: (base) => ({
              ...base,

              zIndex: 50,

              backgroundColor:
                "hsl(var(--b1))",
            }),

            option: (
              base,
              state
            ) => ({
              ...base,

              backgroundColor:
                state.isSelected
                  ? "hsl(var(--p))"
                  : state.isFocused
                    ? "hsl(var(--b2))"
                    : "hsl(var(--b1))",

              color:
                state.isSelected
                  ? "hsl(var(--pc))"
                  : "hsl(var(--bc))",

              cursor:
                "pointer",
            }),

            singleValue: (
              base
            ) => ({
              ...base,

              color:
                "hsl(var(--bc))",
            }),

            input: (base) => ({
              ...base,

              color:
                "hsl(var(--bc))",
            }),

            placeholder: (
              base
            ) => ({
              ...base,

              color:
                "hsl(var(--bc) / 0.5)",
            }),

            indicatorSeparator: (
              base
            ) => ({
              ...base,

              backgroundColor:
                "hsl(var(--bc) / 0.2)",
            }),
          }}
        />

        {medicaments.length === 0 && (
          <p className="mt-1 text-sm text-warning">
            Aucun médicament actif disponible.
          </p>
        )}
      </div>

      {/* ====================================================
          LOT / EXPIRATION / QUANTITÉ
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* ==================================================
            LOT
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text">
              Numéro de lot
            </span>
          </label>

          <input
            type="text"
            value={lot}
            onChange={(e) =>
              setLot(
                e.target.value
              )
            }
            className="input input-bordered w-full"
            placeholder="LOT-2026-001"
            disabled={loading}
          />
        </div>

        {/* ==================================================
            DATE EXPIRATION
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text">
              Date d'expiration
            </span>
          </label>

          <input
            type="date"
            value={
              dateExpiration
            }
            onChange={(e) =>
              setDateExpiration(
                e.target.value
              )
            }
            className="input input-bordered w-full"
            disabled={loading}
          />
        </div>

        {/* ==================================================
            QUANTITÉ
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Quantité *
            </span>
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={quantite}
            onChange={(e) => {
              const value =
                Number(
                  e.target.value
                );

              setQuantite(
                Number.isFinite(
                  value
                )
                  ? value
                  : 0
              );
            }}
            className="input input-bordered w-full"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="flex justify-end gap-3">

        {onCancel && (
          <button
            type="button"
            onClick={
              handleCancel
            }
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
          disabled={
            loading ||
            !medicamentId ||
            medicaments.length === 0
          }
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

              {stock
                ? "Modifier le stock"
                : "Enregistrer"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}