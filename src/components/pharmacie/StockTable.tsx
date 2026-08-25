"use client";

import {
  AlertTriangle,
  CalendarDays,
  Package,
  Trash2,
} from "lucide-react";

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

export default function StockTable({
  stocks,
  onDelete,
}: Props) {
  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (
    date?: Date | string | null
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "fr-FR"
    );
  };

  /* ==========================================================
     DATE EXPIRATION
  ========================================================== */

  const isExpired = (
    date?: Date | string | null
  ) => {
    if (!date) {
      return false;
    }

    const expiration =
      new Date(date);

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return expiration < today;
  };

  /* ==========================================================
     STOCK VIDE
  ========================================================== */

  const isEmpty = (
    quantite: number
  ) => {
    return quantite <= 0;
  };

  /* ==========================================================
     TABLEAU VIDE
  ========================================================== */

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

  /* ==========================================================
     SUPPRESSION
  ========================================================== */

  const handleDelete = async (
    id: number
  ) => {
    if (!onDelete) {
      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce stock ?"
      );

    if (!confirmation) {
      return;
    }

    await onDelete(id);
  };

  /* ==========================================================
     AFFICHAGE
  ========================================================== */

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">

      <table className="table">

        {/* ====================================================
            EN-TÊTE
        ==================================================== */}

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

        {/* ====================================================
            CORPS
        ==================================================== */}

        <tbody>

          {stocks.map((stock) => {
            const expired =
              isExpired(
                stock.dateExpiration
              );

            const empty =
              isEmpty(
                stock.quantite
              );

            return (
              <tr
                key={stock.id}
                className={
                  expired
                    ? "bg-error/5"
                    : ""
                }
              >

                {/* ==========================================
                    MÉDICAMENT
                ========================================== */}

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

                {/* ==========================================
                    LOT
                ========================================== */}

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

                {/* ==========================================
                    EXPIRATION
                ========================================== */}

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
                        stock.dateExpiration
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

                {/* ==========================================
                    QUANTITÉ
                ========================================== */}

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

                {/* ==========================================
                    ÉTAT
                ========================================== */}

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

                {/* ==========================================
                    ACTIONS
                ========================================== */}

                {onDelete && (
                  <td>

                    <div className="flex justify-end">

                      <button
                        type="button"
                        className="btn btn-sm btn-ghost text-error"
                        title="Supprimer"
                        onClick={() =>
                          handleDelete(
                            stock.id
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
          })}

        </tbody>

      </table>

    </div>
  );
}