
"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Search,
  X,
  Filter,
} from "lucide-react";

import { useMemo, useState } from "react";

/* ==========================================================
   TYPES
========================================================== */

type Mouvement = {
  id: number;
  medicamentId: number;
  stockId?: number | null;

  type: string;
  quantite: number;

  motif?: string | null;
  reference?: string | null;

  utilisateurId?: number | null;

  dateMouvement: Date | string;

  medicament: {
    id: number;
    code: string;
    nom: string;
    dosage?: string | null;
    forme?: string | null;
  } | null;

  stock?: {
    id: number;
    lot?: string | null;
    dateExpiration?: Date | string | null;
    quantite: number;
  } | null;

  utilisateur?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  mouvements: Mouvement[];
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function MouvementStockTable({
  mouvements,
}: Props) {
  /* ========================================================
     ÉTATS RECHERCHE / FILTRES
  ======================================================== */

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("TOUS");

  const [userFilter, setUserFilter] =
    useState("TOUS");

  const [lotFilter, setLotFilter] =
    useState("TOUS");

  /* ========================================================
     UTILITAIRES
  ======================================================== */

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ENTREE":
        return "Entrée";

      case "SORTIE":
        return "Sortie";

      case "RETOUR":
        return "Retour";

      case "AJUSTEMENT":
        return "Ajustement";

      case "PERTE":
        return "Perte";

      case "PEREMPTION":
        return "Péremption";

      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ENTREE":
        return (
          <ArrowDownToLine
            size={16}
            className="text-success"
          />
        );

      case "RETOUR":
        return (
          <RotateCcw
            size={16}
            className="text-info"
          />
        );

      case "SORTIE":
        return (
          <ArrowUpFromLine
            size={16}
            className="text-warning"
          />
        );

      case "PERTE":
      case "PEREMPTION":
        return (
          <AlertTriangle
            size={16}
            className="text-error"
          />
        );

      case "AJUSTEMENT":
        return (
          <Trash2
            size={16}
            className="text-secondary"
          />
        );

      default:
        return null;
    }
  };

  const getTypeBadgeClass = (
    type: string,
  ) => {
    switch (type) {
      case "ENTREE":
        return "badge-success";

      case "SORTIE":
        return "badge-warning";

      case "RETOUR":
        return "badge-info";

      case "AJUSTEMENT":
        return "badge-secondary";

      case "PERTE":
      case "PEREMPTION":
        return "badge-error";

      default:
        return "badge-ghost";
    }
  };

  const formatDate = (
    value: Date | string,
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  /* ========================================================
     OPTIONS UTILISATEURS
  ======================================================== */

  const userOptions = useMemo(() => {
    const map = new Map<
      number,
      string
    >();

    mouvements.forEach((mouvement) => {
      if (
        mouvement.utilisateur?.id
      ) {
        const label =
          mouvement.utilisateur.name ||
          mouvement.utilisateur.email ||
          `Utilisateur #${mouvement.utilisateur.id}`;

        map.set(
          mouvement.utilisateur.id,
          label,
        );
      }
    });

    return Array.from(
      map.entries(),
    ).sort((a, b) =>
      a[1].localeCompare(
        b[1],
        "fr",
      ),
    );
  }, [mouvements]);

  /* ========================================================
     OPTIONS LOTS
  ======================================================== */

  const lotOptions = useMemo(() => {
    const lots = new Set<string>();

    mouvements.forEach((mouvement) => {
      if (mouvement.stock?.lot) {
        lots.add(
          mouvement.stock.lot,
        );
      }
    });

    return Array.from(lots).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "fr",
          {
            numeric: true,
          },
        ),
    );
  }, [mouvements]);

  /* ========================================================
     FILTRAGE
  ======================================================== */

  const mouvementsFiltres =
    useMemo(() => {
      const terme =
        search.trim().toLowerCase();

      return mouvements.filter(
        (mouvement) => {
          /* -------------------------------
             FILTRE TYPE
          -------------------------------- */

          if (
            typeFilter !== "TOUS" &&
            mouvement.type !==
              typeFilter
          ) {
            return false;
          }

          /* -------------------------------
             FILTRE UTILISATEUR
          -------------------------------- */

          if (
            userFilter !== "TOUS" &&
            String(
              mouvement.utilisateur?.id ??
                "",
            ) !== userFilter
          ) {
            return false;
          }

          /* -------------------------------
             FILTRE LOT
          -------------------------------- */

          if (
            lotFilter !== "TOUS" &&
            (mouvement.stock?.lot ??
              "") !== lotFilter
          ) {
            return false;
          }

          /* -------------------------------
             RECHERCHE LIBRE
          -------------------------------- */

          if (!terme) {
            return true;
          }

          const texteRecherche =
            [
              mouvement.type,
              getTypeLabel(
                mouvement.type,
              ),

              mouvement.medicament
                ?.nom,

              mouvement.medicament
                ?.code,

              mouvement.medicament
                ?.dosage,

              mouvement.medicament
                ?.forme,

              mouvement.stock?.lot,

              mouvement.reference,

              mouvement.motif,

              mouvement.utilisateur
                ?.name,

              mouvement.utilisateur
                ?.email,

              formatDate(
                mouvement.dateMouvement,
              ),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return texteRecherche.includes(
            terme,
          );
        },
      );
    }, [
      mouvements,
      search,
      typeFilter,
      userFilter,
      lotFilter,
    ]);

  /* ========================================================
     RESET FILTRES
  ======================================================== */

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("TOUS");
    setUserFilter("TOUS");
    setLotFilter("TOUS");
  };

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "TOUS" ||
    userFilter !== "TOUS" ||
    lotFilter !== "TOUS";

  /* ========================================================
     TABLEAU VIDE
  ======================================================== */

  if (
    !mouvements ||
    mouvements.length === 0
  ) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">

        <PackageEmpty />

        <h3 className="font-semibold">
          Aucun mouvement de stock
        </h3>

        <p className="mt-1 text-sm opacity-60">
          Les mouvements de stock
          apparaîtront ici.
        </p>

      </div>
    );
  }

  /* ========================================================
     AFFICHAGE
  ======================================================== */

  return (
    <div className="space-y-4">

      {/* ====================================================
          BARRE DE RECHERCHE
      ==================================================== */}

      <div className="rounded-xl border border-base-300 bg-base-100 p-4">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* RECHERCHE */}

          <div className="relative w-full lg:flex-1">

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
              placeholder="Rechercher médicament, code, lot, référence, motif, utilisateur..."
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

          {/* TYPE */}

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value,
              )
            }
            className="select select-bordered h-11 w-full lg:w-44"
          >
            <option value="TOUS">
              Tous les mouvements
            </option>

            <option value="ENTREE">
              Entrées
            </option>

            <option value="SORTIE">
              Sorties
            </option>

            <option value="RETOUR">
              Retours
            </option>

            <option value="AJUSTEMENT">
              Ajustements
            </option>

            <option value="PERTE">
              Pertes
            </option>

            <option value="PEREMPTION">
              Péremptions
            </option>
          </select>

        </div>

        {/* ==================================================
            FILTRES AVANCÉS
        ================================================== */}

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* UTILISATEUR */}

          <select
            value={userFilter}
            onChange={(event) =>
              setUserFilter(
                event.target.value,
              )
            }
            className="select select-bordered h-11 w-full"
          >
            <option value="TOUS">
              Tous les utilisateurs
            </option>

            {userOptions.map(
              ([id, label]) => (
                <option
                  key={id}
                  value={id}
                >
                  {label}
                </option>
              ),
            )}
          </select>

          {/* LOT */}

          <select
            value={lotFilter}
            onChange={(event) =>
              setLotFilter(
                event.target.value,
              )
            }
            className="select select-bordered h-11 w-full"
          >
            <option value="TOUS">
              Tous les lots
            </option>

            {lotOptions.map((lot) => (
              <option
                key={lot}
                value={lot}
              >
                Lot : {lot}
              </option>
            ))}
          </select>

          {/* RESET */}

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="btn btn-outline h-11"
          >
            <Filter size={16} />

            Réinitialiser
          </button>

        </div>

        {/* ==================================================
            RÉSULTATS
        ================================================== */}

        <div className="mt-3 flex items-center justify-between text-sm">

          <span className="text-base-content/60">
            {mouvementsFiltres.length}{" "}
            mouvement
            {mouvementsFiltres.length !==
            1
              ? "s"
              : ""}{" "}
            trouvé
            {mouvementsFiltres.length !==
            1
              ? "s"
              : ""}
          </span>

          {hasFilters && (
            <span className="badge badge-primary badge-sm">
              Filtres actifs
            </span>
          )}

        </div>

      </div>

      {/* ====================================================
          AUCUN RÉSULTAT
      ==================================================== */}

      {mouvementsFiltres.length ===
      0 ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center">

          <Search
            size={38}
            className="mx-auto mb-3 opacity-30"
          />

          <h3 className="font-semibold">
            Aucun résultat
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Aucun mouvement ne
            correspond aux critères
            sélectionnés.
          </p>

          <button
            type="button"
            className="btn btn-sm btn-ghost mt-4"
            onClick={
              resetFilters
            }
          >
            Réinitialiser les filtres
          </button>

        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">

          <table className="table table-zebra">

            {/* ==================================================
                EN-TÊTE
            ================================================== */}

            <thead>
              <tr>
                <th>Date</th>
                <th>Médicament</th>
                <th>Lot</th>
                <th>Type</th>
                <th>Quantité</th>
                <th>Référence</th>
                <th>Motif</th>
                <th>Utilisateur</th>
              </tr>
            </thead>

            {/* ==================================================
                CORPS
            ================================================== */}

            <tbody>

              {mouvementsFiltres.map(
                (mouvement) => (
                  <tr
                    key={
                      mouvement.id
                    }
                  >

                    {/* DATE */}

                    <td className="whitespace-nowrap">
                      {formatDate(
                        mouvement.dateMouvement,
                      )}
                    </td>

                    {/* MÉDICAMENT */}

                    <td>
                      {mouvement.medicament ? (
                        <div>

                          <div className="font-semibold">
                            {
                              mouvement
                                .medicament
                                .nom
                            }
                          </div>

                          <div className="text-xs opacity-60">

                            {
                              mouvement
                                .medicament
                                .code
                            }

                            {mouvement
                              .medicament
                              .dosage
                              ? ` — ${mouvement.medicament.dosage}`
                              : ""}

                            {mouvement
                              .medicament
                              .forme
                              ? ` — ${mouvement.medicament.forme}`
                              : ""}

                          </div>

                        </div>
                      ) : (
                        <span className="text-error">
                          Médicament supprimé
                        </span>
                      )}
                    </td>

                    {/* LOT */}

                    <td>
                      {mouvement
                        .stock
                        ?.lot ? (
                        <span className="badge badge-outline">
                          {
                            mouvement
                              .stock
                              .lot
                          }
                        </span>
                      ) : (
                        <span className="opacity-50">
                          Sans lot
                        </span>
                      )}
                    </td>

                    {/* TYPE */}

                    <td>

                      <div className="flex items-center gap-2">

                        {getTypeIcon(
                          mouvement.type,
                        )}

                        <span
                          className={`badge badge-sm ${getTypeBadgeClass(
                            mouvement.type,
                          )}`}
                        >
                          {getTypeLabel(
                            mouvement.type,
                          )}
                        </span>

                      </div>

                    </td>

                    {/* QUANTITÉ */}

                    <td className="font-semibold">
                      {Number(
                        mouvement.quantite,
                      ).toLocaleString(
                        "fr-FR",
                      )}
                    </td>

                    {/* RÉFÉRENCE */}

                    <td>
                      {mouvement.reference ||
                        "—"}
                    </td>

                    {/* MOTIF */}

                    <td>
                      <span
                        className="block max-w-xs truncate"
                        title={
                          mouvement.motif ??
                          ""
                        }
                      >
                        {mouvement.motif ||
                          "—"}
                      </span>
                    </td>

                    {/* UTILISATEUR */}

                    <td>
                      {mouvement
                        .utilisateur
                        ?.name ||
                        mouvement
                          .utilisateur
                          ?.email ||
                        "—"}
                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

/* ==========================================================
   ÉTAT VIDE
========================================================== */

function PackageEmpty() {
  return (
    <div className="mb-3 flex justify-center">
      <div className="rounded-full bg-base-200 p-4">
        <Trash2
          size={28}
          className="opacity-40"
        />
      </div>
    </div>
  );
}
