"use client";

import { useState } from "react";
import Select from "react-select";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Save,
} from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

type Medicament = {
  id: number;
  code: string;
  nom: string;
};

type Stock = {
  id: number;
  medicamentId: number;
  lot?: string | null;
  quantite: number;
};

type Props = {
  medicaments: Medicament[];
  stocks: Stock[];

  onSubmit: (data: {
    medicamentId: number;
    stockId?: number;
    type: string;
    quantite: number;
    motif?: string;
    reference?: string;
  }) => Promise<void>;
};

/* ==========================================================
   TYPES REACT SELECT
========================================================== */

type SelectOption = {
  value: number;
  label: string;
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function MouvementStockForm({
  medicaments,
  stocks,
  onSubmit,
}: Props) {
  /* ========================================================
     ETATS
  ======================================================== */

  const [medicamentId, setMedicamentId] =
    useState<number | null>(null);

  const [stockId, setStockId] =
    useState<number | null>(null);

  const [type, setType] =
    useState("ENTREE");

  const [quantite, setQuantite] =
    useState(1);

  const [motif, setMotif] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ========================================================
     MÉDICAMENTS → OPTIONS
  ======================================================== */

  const medicamentOptions: SelectOption[] =
    medicaments.map((medicament) => ({
      value: medicament.id,
      label: `${medicament.code} — ${medicament.nom}`,
    }));

  /* ========================================================
     STOCKS DU MÉDICAMENT SÉLECTIONNÉ
  ======================================================== */

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.medicamentId === medicamentId
  );

  /* ========================================================
     STOCKS → OPTIONS
  ======================================================== */

  const stockOptions: SelectOption[] =
    filteredStocks.map((stock) => ({
      value: stock.id,
      label: `${stock.lot || "Sans lot"} — ${stock.quantite} disponible(s)`,
    }));

  /* ========================================================
     OPTION MÉDICAMENT SÉLECTIONNÉE
  ======================================================== */

  const selectedMedicament =
    medicamentOptions.find(
      (option) =>
        option.value === medicamentId
    ) ?? null;

  /* ========================================================
     OPTION STOCK SÉLECTIONNÉE
  ======================================================== */

  const selectedStock =
    stockOptions.find(
      (option) =>
        option.value === stockId
    ) ?? null;

  /* ========================================================
     TYPES DE MOUVEMENTS SORTANTS
  ======================================================== */

  const mouvementsSortants = [
    "SORTIE",
    "PERTE",
    "PEREMPTION",
  ];

  const mouvementSortant =
    mouvementsSortants.includes(type);

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
        "Sélectionnez un médicament."
      );
      return;
    }

    /* ------------------------------------------------------
       QUANTITÉ
    ------------------------------------------------------ */

    if (
      !Number.isFinite(quantite) ||
      quantite <= 0
    ) {
      alert(
        "La quantité doit être supérieure à zéro."
      );
      return;
    }

    /* ------------------------------------------------------
       STOCK OBLIGATOIRE POUR LES SORTIES
    ------------------------------------------------------ */

    if (
      mouvementSortant &&
      !stockId
    ) {
      alert(
        "Sélectionnez le lot de stock concerné."
      );
      return;
    }

    /* ------------------------------------------------------
       VÉRIFICATION DU STOCK DISPONIBLE
    ------------------------------------------------------ */

    if (
      mouvementSortant &&
      stockId
    ) {
      const stock = stocks.find(
        (item) =>
          item.id === stockId
      );

      if (
        stock &&
        quantite > stock.quantite
      ) {
        alert(
          `Stock insuffisant. Disponible : ${stock.quantite}.`
        );
        return;
      }
    }

    /* ------------------------------------------------------
       ENREGISTREMENT
    ------------------------------------------------------ */

    try {
      setLoading(true);

      await onSubmit({
        medicamentId,

        /* IMPORTANT :
           syntaxe correcte du spread conditionnel
        */
        ...(stockId
          ? { stockId }
          : {}),

        type,

        quantite,

        ...(motif.trim()
          ? {
              motif: motif.trim(),
            }
          : {}),

        ...(reference.trim()
          ? {
              reference:
                reference.trim(),
            }
          : {}),
      });

      /* ----------------------------------------------------
         RESET
      ---------------------------------------------------- */

      setMedicamentId(null);
      setStockId(null);
      setQuantite(1);
      setMotif("");
      setReference("");
      setType("ENTREE");

    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement du mouvement :",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
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
          INFORMATIONS PRINCIPALES
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* ==================================================
            MÉDICAMENT
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Médicament *
            </span>
          </label>

          <Select<SelectOption>
            options={medicamentOptions}
            value={selectedMedicament}
            onChange={(option) => {
              setMedicamentId(
                option?.value ?? null
              );

              // Réinitialiser le stock
              // lorsque le médicament change
              setStockId(null);
            }}
            placeholder="Rechercher un médicament..."
            isSearchable
            isClearable
            isDisabled={loading}
            noOptionsMessage={() =>
              "Aucun médicament trouvé"
            }
            loadingMessage={() =>
              "Chargement..."
            }
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* ==================================================
            LOT / STOCK
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Lot / Stock
            </span>
          </label>

          <Select<SelectOption>
            options={stockOptions}
            value={selectedStock}
            onChange={(option) => {
              setStockId(
                option?.value ?? null
              );
            }}
            placeholder={
              medicamentId
                ? "Rechercher un lot..."
                : "Sélectionnez d'abord un médicament"
            }
            isSearchable
            isClearable
            isDisabled={
              loading ||
              !medicamentId
            }
            noOptionsMessage={() =>
              "Aucun stock disponible"
            }
            className="react-select-container"
            classNamePrefix="react-select"
          />

          {medicamentId &&
            filteredStocks.length === 0 && (
              <p className="mt-1 text-xs text-warning">
                Aucun stock disponible pour ce
                médicament.
              </p>
            )}
        </div>

        {/* ==================================================
            TYPE
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text font-semibold">
              Type *
            </span>
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="select select-bordered w-full"
            required
            disabled={loading}
          >
            <option value="ENTREE">
              Entrée
            </option>

            <option value="SORTIE">
              Sortie
            </option>

            <option value="AJUSTEMENT">
              Ajustement
            </option>

            <option value="RETOUR">
              Retour
            </option>

            <option value="PERTE">
              Perte
            </option>

            <option value="PEREMPTION">
              Péremption
            </option>
          </select>
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
            min="0.01"
            step="0.01"
            value={quantite}
            onChange={(e) =>
              setQuantite(
                Number(e.target.value)
              )
            }
            className="input input-bordered w-full"
            required
            disabled={loading}
          />
        </div>

        {/* ==================================================
            RÉFÉRENCE
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text">
              Référence
            </span>
          </label>

          <input
            type="text"
            value={reference}
            onChange={(e) =>
              setReference(
                e.target.value
              )
            }
            className="input input-bordered w-full"
            placeholder="BL-2026-001"
            disabled={loading}
          />
        </div>

        {/* ==================================================
            MOTIF
        ================================================== */}

        <div>
          <label className="label">
            <span className="label-text">
              Motif
            </span>
          </label>

          <input
            type="text"
            value={motif}
            onChange={(e) =>
              setMotif(e.target.value)
            }
            className="input input-bordered w-full"
            placeholder="Motif du mouvement"
            disabled={loading}
          />
        </div>
      </div>

      {/* ====================================================
          INFORMATION
      ==================================================== */}

      <div className="alert">

        {type === "ENTREE" ||
        type === "RETOUR" ? (
          <ArrowDownToLine
            size={20}
          />
        ) : (
          <ArrowUpFromLine
            size={20}
          />
        )}

        <div>
          <span className="font-medium">
            Mouvement de stock
          </span>

          <p className="text-sm opacity-70">
            Ce mouvement modifiera
            automatiquement la quantité
            disponible du stock.
          </p>
        </div>
      </div>

      {/* ====================================================
          BOUTON
      ==================================================== */}

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                className="animate-spin"
                size={18}
              />

              Traitement...
            </>
          ) : (
            <>
              <Save size={18} />

              Enregistrer le mouvement
            </>
          )}
        </button>
      </div>
    </form>
  );
}