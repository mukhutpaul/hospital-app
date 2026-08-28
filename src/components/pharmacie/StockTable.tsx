
"use client";

import {
  AlertTriangle,
  CalendarDays,
  Package,
  Search,
  X,
  Trash2,
} from "lucide-react";

import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Medicament = {
  id: number;
  code: string;
  nom: string;
  dosage?: string | null;
  forme?: string | null;
};

type Stock = {
  id: number;
  medicamentId: number;
  lot?: string | null;
  dateExpiration?: Date | string | null;
  quantite: number;

  medicament?: Medicament | null;
};

type Props = {
  stocks: Stock[];
  onDelete?: (id: number) => Promise<void>;
};

/* =========================================================
   COMPOSANT
========================================================= */

export default function StockTable({
  stocks,
  onDelete,
}: Props) {
  /* =======================================================
     RECHERCHE
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    date?: Date | string | null,
  ) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "fr-FR",
    );
  };

  /* =======================================================
     DATE EXPIRATION
  ======================================================= */

  const isExpired = (
    date?: Date | string | null,
  ) => {
    if (!date) {
      return false;
    }

    const expiration =
      new Date(date);

    if (
      Number.isNaN(
        expiration.getTime(),
      )
    ) {
      return false;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    expiration.setHours(
      0,
      0,
      0,
      0,
    );

    return expiration < today;
  };

  /* =======================================================
     STOCK VIDE
  ======================================================= */

  const isEmpty = (
    quantite: number,
  ) => {
    return quantite <= 0;
  };

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const filteredStocks = useMemo(() => {
    const term =
      search
        .trim()
        .toLowerCase();

    if (!term) {
      return stocks;
    }

    return stocks.filter(
      (stock) => {
        const nom =
          stock.medicament?.nom ??
          "";

        const code =
          stock.medicament?.code ??
          "";

        const dosage =
          stock.medicament?.dosage ??
          "";

        const forme =
          stock.medicament?.forme ??
          "";

        const lot =
          stock.lot ??
          "";

        return [
          nom,
          code,
          dosage,
          forme,
          lot,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      },
    );
  }, [
    stocks,
    search,
  ]);

  /* =======================================================
     SUPPRESSION
  ======================================================= */

  const handleDelete = async (
    id: number,
  ) => {
    if (!onDelete) {
      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce stock ?",
      );

    if (!confirmation) {
      return;
    }

    try {
      await onDelete(id);
    } catch (error) {
      console.error(
        "Erreur suppression stock :",
        error,
      );
    }
  };

  /* =======================================================
     TABLEAU VIDE
  ======================================================= */

  if (
    !stocks ||
    stocks.length === 0
  ) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <Package
          size={42}
          className="mx-auto mb-3 opacity-40"
        />

        <h3 className="font-semibold">
          Aucun stock disponible
        </h3>

        <p className="mt-1 text-sm opacity-60">
          Les médicaments ajoutés au stock
          apparaîtront ici.
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* =====================================================
          BARRE DE RECHERCHE
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-md">

          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Rechercher un médicament, code ou lot..."
            className="input input-bordered h-11 w-full pl-10 pr-10"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-error"
              title="Effacer"
            >
              <X size={17} />
            </button>
          )}

        </div>

        <div className="text-sm text-base-content/60">
          {filteredStocks.length} résultat
          {filteredStocks.length !== 1
            ? "s"
            : ""}
        </div>

      </div>

      {/* =====================================================
          AUCUN RÉSULTAT
      ===================================================== */}

      {filteredStocks.length === 0 ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center">

          <Search
            size={40}
            className="mx-auto mb-3 opacity-30"
          />

          <h3 className="font-semibold">
            Aucun résultat
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Aucun stock ne correspond à votre recherche.
          </p>

          <button
            type="button"
            className="btn btn-sm btn-ghost mt-4"
            onClick={() =>
              setSearch("")
            }
          >
            Réinitialiser la recherche
          </button>

        </div>
      ) : (

        /* ===================================================
           TABLEAU
        =================================================== */

        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">

          <table className="table">

            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <thead>
              <tr>
                <th>Médicament</th>
                <th>Lot</th>
                <th>Date d'expiration</th>
                <th>Quantité</th>
                <th>État</th>

                {onDelete && (
                  <th className="text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* =================================================
                CORPS
            ================================================= */}

            <tbody>

              {filteredStocks.map(
                (stock) => {
                  const expired =
                    isExpired(
                      stock.dateExpiration,
                    );

                  const empty =
                    isEmpty(
                      stock.quantite,
                    );

                  return (
                    <tr
                      key={
                        stock.id
                      }
                      className={
                        expired
                          ? "bg-error/5"
                          : ""
                      }
                    >

                      {/* =====================================
                          MÉDICAMENT
                      ===================================== */}

                      <td>
                        {stock.medicament ? (
                          <div>

                            <div className="font-semibold">
                              {
                                stock
                                  .medicament
                                  .nom
                              }
                            </div>

                            <div className="text-xs opacity-60">

                              {
                                stock
                                  .medicament
                                  .code
                              }

                              {stock.medicament
                                .dosage && (
                                <>
                                  {" • "}
                                  {
                                    stock
                                      .medicament
                                      .dosage
                                  }
                                </>
                              )}

                              {stock.medicament
                                .forme && (
                                <>
                                  {" • "}
                                  {
                                    stock
                                      .medicament
                                      .forme
                                  }
                                </>
                              )}

                            </div>

                          </div>
                        ) : (
                          <span className="text-error">
                            Médicament introuvable
                          </span>
                        )}
                      </td>

                      {/* =====================================
                          LOT
                      ===================================== */}

                      <td>
                        {stock.lot ? (
                          <span className="badge badge-outline">
                            {stock.lot}
                          </span>
                        ) : (
                          <span className="opacity-50">
                            —
                          </span>
                        )}
                      </td>

                      {/* =====================================
                          EXPIRATION
                      ===================================== */}

                      <td>

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={16}
                            className="opacity-60"
                          />

                          <span
                            className={
                              expired
                                ? "font-semibold text-error"
                                : ""
                            }
                          >
                            {formatDate(
                              stock.dateExpiration,
                            )}
                          </span>

                        </div>

                        {expired && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-error">

                            <AlertTriangle
                              size={13}
                            />

                            Expiré

                          </div>
                        )}

                      </td>

                      {/* =====================================
                          QUANTITÉ
                      ===================================== */}

                      <td>

                        <span
                          className={
                            empty
                              ? "font-bold text-error"
                              : "font-bold"
                          }
                        >
                          {stock.quantite}
                        </span>

                      </td>

                      {/* =====================================
                          ÉTAT
                      ===================================== */}

                      <td>

                        {expired ? (
                          <span className="badge badge-error">
                            Expiré
                          </span>
                        ) : empty ? (
                          <span className="badge badge-error">
                            Épuisé
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            Disponible
                          </span>
                        )}

                      </td>

                      {/* =====================================
                          ACTIONS
                      ===================================== */}

                      {onDelete && (
                        <td>

                          <div className="flex justify-end">

                            <button
                              type="button"
                              className="btn btn-sm btn-ghost text-error"
                              title="Supprimer"
                              onClick={() =>
                                handleDelete(
                                  stock.id,
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>
                      )}

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}
