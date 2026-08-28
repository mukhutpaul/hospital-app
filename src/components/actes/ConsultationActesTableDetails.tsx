
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Trash2,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Calculator,
  ClipboardList,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import {
  deleteConsultationActe,
} from "@/app/actions/actes-medicaux";

type Props = {
  actes: any[];
};

export default function ConsultationActesTable({
  actes,
}: Props) {
  const router = useRouter();

  // ==========================================================
  // ÉTATS
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [categorie, setCategorie] =
    useState("TOUTES");

  const [montant, setMontant] =
    useState("TOUS");

  const [quantite, setQuantite] =
    useState("TOUTES");

  const [showFilters, setShowFilters] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  // ==========================================================
  // CATÉGORIES
  // ==========================================================

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        actes
          .map(
            (item) =>
              item.acte?.categorie
          )
          .filter(Boolean)
          .map(String)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "fr")
    );
  }, [actes]);

  // ==========================================================
  // RECHERCHE + FILTRES
  // ==========================================================

  const actesFiltres = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

    return actes.filter((item) => {
      const acte = item.acte;

      const texte = [
        acte?.code,
        acte?.libelle,
        acte?.categorie,
        item.observation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

      // Recherche
      const rechercheOK =
        !query ||
        texte.includes(query);

      // Catégorie
      const categorieOK =
        categorie === "TOUTES" ||
        String(
          acte?.categorie
        ) === categorie;

      // Montant
      const montantValue =
        Number(item.montant ?? 0);

      let montantOK = true;

      switch (montant) {
        case "PETIT":
          montantOK =
            montantValue < 50;
          break;

        case "MOYEN":
          montantOK =
            montantValue >= 50 &&
            montantValue <= 200;
          break;

        case "ELEVE":
          montantOK =
            montantValue > 200;
          break;
      }

      // Quantité
      const quantiteValue =
        Number(item.quantite ?? 0);

      let quantiteOK = true;

      switch (quantite) {
        case "UN":
          quantiteOK =
            quantiteValue === 1;
          break;

        case "PLUSIEURS":
          quantiteOK =
            quantiteValue > 1;
          break;
      }

      return (
        rechercheOK &&
        categorieOK &&
        montantOK &&
        quantiteOK
      );
    });
  }, [
    actes,
    search,
    categorie,
    montant,
    quantite,
  ]);

  // ==========================================================
  // STATISTIQUES FILTRÉES
  // ==========================================================

  const statistiques =
    useMemo(() => {
      const quantiteTotale =
        actesFiltres.reduce(
          (total, item) =>
            total +
            Number(
              item.quantite ?? 0
            ),
          0
        );

      const montantTotal =
        actesFiltres.reduce(
          (total, item) =>
            total +
            Number(
              item.montant ?? 0
            ),
          0
        );

      return {
        nombre: actesFiltres.length,
        quantite: quantiteTotale,
        montant: montantTotal,
      };
    }, [actesFiltres]);

  // ==========================================================
  // FILTRES ACTIFS
  // ==========================================================

  const filtresActifs =
    search !== "" ||
    categorie !== "TOUTES" ||
    montant !== "TOUS" ||
    quantite !== "TOUTES";

  function resetFilters() {
    setSearch("");
    setCategorie("TOUTES");
    setMontant("TOUS");
    setQuantite("TOUTES");
  }

  // ==========================================================
  // SUPPRESSION
  // ==========================================================

  async function handleDelete(
    item: any
  ) {
    const result =
      await Swal.fire({
        icon: "warning",
        title: "Supprimer cet acte ?",
        html: `
          <div style="text-align:center">
            <strong>
              ${item.acte?.libelle ?? "Acte médical"}
            </strong>
            <br />
            <span>
              Cette opération est irréversible.
            </span>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText:
          "Oui, supprimer",
        cancelButtonText:
          "Annuler",
        confirmButtonColor:
          "#dc2626",
      });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(item.id);

      const response =
        await deleteConsultationActe(
          item.id
        );

      if (!response.success) {
        toast.error(
          response.message
        );
        return;
      }

      toast.success(
        response.message
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de supprimer l'acte."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================================
  // FORMAT
  // ==========================================================

  function formatMontant(
    value: number,
    devise?: string
  ) {
    return `${value.toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )} ${devise ?? "USD"}`;
  }

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="space-y-5">

      {/* =====================================================
          BARRE DE RECHERCHE
      ====================================================== */}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Recherche */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Rechercher par code, acte, catégorie ou observation..."
              className="input input-bordered h-12 w-full pl-11 pr-11"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X size={15} />
              </button>
            )}

          </div>

          {/* Bouton filtres */}

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
            className={`btn h-12 ${
              showFilters
                ? "btn-primary"
                : "btn-outline"
            }`}
          >
            <Filter size={17} />

            Filtres avancés

            {filtresActifs && (
              <span className="badge badge-sm">
                Actifs
              </span>
            )}
          </button>

        </div>

        {/* ===================================================
            FILTRES
        ==================================================== */}

        {showFilters && (
          <div className="mt-4 border-t border-base-300 pt-4">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Catégorie */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/50">
                  <Tag size={14} />
                  Catégorie
                </label>

                <select
                  value={categorie}
                  onChange={(e) =>
                    setCategorie(
                      e.target.value
                    )
                  }
                  className="select select-bordered w-full"
                >
                  <option value="TOUTES">
                    Toutes les catégories
                  </option>

                  {categories.map(
                    (cat) => (
                      <option
                        key={cat}
                        value={cat}
                      >
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Montant */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/50">
                  <DollarSign size={14} />
                  Montant
                </label>

                <select
                  value={montant}
                  onChange={(e) =>
                    setMontant(
                      e.target.value
                    )
                  }
                  className="select select-bordered w-full"
                >
                  <option value="TOUS">
                    Tous les montants
                  </option>

                  <option value="PETIT">
                    Moins de 50
                  </option>

                  <option value="MOYEN">
                    De 50 à 200
                  </option>

                  <option value="ELEVE">
                    Plus de 200
                  </option>
                </select>
              </div>

              {/* Quantité */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/50">
                  <Hash size={14} />
                  Quantité
                </label>

                <select
                  value={quantite}
                  onChange={(e) =>
                    setQuantite(
                      e.target.value
                    )
                  }
                  className="select select-bordered w-full"
                >
                  <option value="TOUTES">
                    Toutes les quantités
                  </option>

                  <option value="UN">
                    Quantité = 1
                  </option>

                  <option value="PLUSIEURS">
                    Quantité supérieure à 1
                  </option>
                </select>
              </div>

            </div>

            {filtresActifs && (
              <div className="mt-4 flex justify-end">

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="btn btn-ghost btn-sm"
                >
                  <RotateCcw
                    size={15}
                  />
                  Réinitialiser
                </button>

              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Actes
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistiques.nombre}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList
                size={20}
              />
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Quantité totale
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistiques.quantite.toFixed(
                  2
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Hash size={20} />
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Total filtré
              </p>

              <p className="mt-1 text-2xl font-bold text-primary">
                {formatMontant(
                  statistiques.montant,
                  actesFiltres[0]
                    ?.acte?.devise
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calculator
                size={20}
              />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          TABLEAU
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col gap-2 border-b border-base-300 bg-base-200/30 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ClipboardList
                size={20}
                className="text-primary"
              />
              Actes réalisés
            </h2>

            <p className="mt-1 text-sm text-base-content/50">
              {actesFiltres.length} résultat
              {actesFiltres.length !== 1
                ? "s"
                : ""}
              {filtresActifs
                ? " après filtrage"
                : ""}
            </p>

          </div>

          {filtresActifs && (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="btn btn-ghost btn-sm"
            >
              <RotateCcw
                size={15}
              />
              Effacer les filtres
            </button>
          )}

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="table w-full">

            <thead>
              <tr>
                <th>Acte</th>
                <th>Catégorie</th>
                <th className="text-center">
                  Quantité
                </th>
                <th>Prix unitaire</th>
                <th>Montant</th>
                <th>Observation</th>
                <th className="text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {actesFiltres.map(
                (item: any) => {

                  const acte =
                    item.acte;

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-base-200/40"
                    >

                      {/* ACTE */}

                      <td>

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText
                              size={18}
                            />
                          </div>

                          <div>

                            <p className="font-semibold">
                              {acte?.libelle ??
                                "—"}
                            </p>

                            <p className="font-mono text-xs text-base-content/50">
                              {acte?.code ??
                                "—"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CATÉGORIE */}

                      <td>

                        {acte?.categorie ? (
                          <span className="badge badge-ghost">
                            {acte.categorie}
                          </span>
                        ) : (
                          <span className="text-base-content/30">
                            —
                          </span>
                        )}

                      </td>

                      {/* QUANTITÉ */}

                      <td className="text-center">

                        <span className="badge badge-primary badge-outline font-semibold">
                          {Number(
                            item.quantite ??
                              0
                          ).toFixed(2)}
                        </span>

                      </td>

                      {/* PRIX */}

                      <td>

                        <span className="font-medium">
                          {formatMontant(
                            Number(
                              item.prixUnitaire ??
                                0
                            ),
                            acte?.devise
                          )}
                        </span>

                      </td>

                      {/* MONTANT */}

                      <td>

                        <span className="font-bold text-primary">
                          {formatMontant(
                            Number(
                              item.montant ??
                                0
                            ),
                            acte?.devise
                          )}
                        </span>

                      </td>

                      {/* OBSERVATION */}

                      <td className="max-w-xs">

                        {item.observation ? (
                          <div className="flex items-start gap-2">

                            <FileText
                              size={15}
                              className="mt-0.5 shrink-0 text-base-content/40"
                            />

                            <span className="line-clamp-2 text-sm text-base-content/70">
                              {
                                item.observation
                              }
                            </span>

                          </div>
                        ) : (
                          <span className="text-base-content/30">
                            Aucune observation
                          </span>
                        )}

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="flex justify-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-error btn-outline btn-square"
                            title="Supprimer"
                            disabled={
                              deletingId ===
                              item.id
                            }
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                          >

                            {deletingId ===
                            item.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}

                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

              {/* ÉTAT VIDE */}

              {actesFiltres.length ===
                0 && (
                <tr>

                  <td
                    colSpan={7}
                    className="py-16"
                  >

                    <div className="flex flex-col items-center text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/30">
                        <Search
                          size={28}
                        />
                      </div>

                      <h3 className="mt-4 font-bold">
                        Aucun acte trouvé
                      </h3>

                      <p className="mt-1 max-w-md text-sm text-base-content/50">
                        Aucun acte ne correspond
                        à votre recherche ou
                        à vos filtres.
                      </p>

                      {filtresActifs && (
                        <button
                          type="button"
                          onClick={
                            resetFilters
                          }
                          className="btn btn-primary btn-sm mt-4"
                        >
                          <RotateCcw
                            size={15}
                          />
                          Réinitialiser
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
