
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Edit,
  Eye,
  Power,
  Trash2,
  Plus,
  Search,
  RotateCcw,
  Filter,
  X,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteActeMedical,
  toggleActeMedical,
} from "@/app/actions/actes-medicaux";

type Props = {
  actes: any[];
};

export default function ActesMedicauxTable({
  actes,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [categorie, setCategorie] =
    useState("TOUTES");
  const [statut, setStatut] =
    useState("TOUS");
  const [utilisation, setUtilisation] =
    useState("TOUTES");

  // ==========================================================
  // CATÉGORIES
  // ==========================================================

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        actes
          .map((acte) => acte.categorie)
          .filter(Boolean)
          .map(String)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "fr")
    );
  }, [actes]);

  // ==========================================================
  // FILTRES
  // ==========================================================

  const actesFiltres = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase();

    return actes.filter((acte) => {
      const texte = [
        acte.code,
        acte.libelle,
        acte.categorie,
        acte.montant,
        acte.devise,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const rechercheOK =
        !q || texte.includes(q);

      const categorieOK =
        categorie === "TOUTES" ||
        String(acte.categorie) ===
          categorie;

      const statutOK =
        statut === "TOUS" ||
        (statut === "ACTIFS" &&
          acte.actif) ||
        (statut === "INACTIFS" &&
          !acte.actif);

      const nombreUtilisations =
        Number(
          acte._count?.consultations ?? 0
        );

      const utilisationOK =
        utilisation === "TOUTES" ||
        (utilisation === "UTILISES" &&
          nombreUtilisations > 0) ||
        (utilisation === "NON_UTILISES" &&
          nombreUtilisations === 0);

      return (
        rechercheOK &&
        categorieOK &&
        statutOK &&
        utilisationOK
      );
    });
  }, [
    actes,
    search,
    categorie,
    statut,
    utilisation,
  ]);

  // ==========================================================
  // FILTRES ACTIFS
  // ==========================================================

  const filtresActifs =
    search !== "" ||
    categorie !== "TOUTES" ||
    statut !== "TOUS" ||
    utilisation !== "TOUTES";

  function resetFilters() {
    setSearch("");
    setCategorie("TOUTES");
    setStatut("TOUS");
    setUtilisation("TOUTES");
  }

  // ==========================================================
  // TOGGLE
  // ==========================================================

  async function handleToggle(acte: any) {
    const result = await Swal.fire({
      icon: "question",
      title: acte.actif
        ? "Désactiver l'acte ?"
        : "Activer l'acte ?",
      text: acte.actif
        ? "Cet acte ne pourra plus être utilisé dans une nouvelle consultation."
        : "Cet acte pourra de nouveau être utilisé.",
      showCancelButton: true,
      confirmButtonText: acte.actif
        ? "Désactiver"
        : "Activer",
      cancelButtonText: "Annuler",
      confirmButtonColor: acte.actif
        ? "#f59e0b"
        : undefined,
    });

    if (!result.isConfirmed) {
      return;
    }

    const response =
      await toggleActeMedical(acte.id);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.refresh();
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function handleDelete(acte: any) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer cet acte ?",
      html: `
        <div style="margin-top:8px">
          <strong>${acte.code ?? ""}</strong>
          <br />
          ${acte.libelle ?? ""}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      return;
    }

    const response =
      await deleteActeMedical(acte.id);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.refresh();
  }

  // ==========================================================
  // MONTANT
  // ==========================================================

  function formatMontant(
    montant: any,
    devise?: string
  ) {
    const value = Number(montant);

    if (Number.isNaN(value)) {
      return "—";
    }

    return `${value.toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )} ${devise ?? ""}`;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-base-300 p-5 sm:p-6">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <div className="flex items-center gap-2">

              <h2 className="text-xl font-bold">
                Catalogue des actes
              </h2>

              <span className="badge badge-primary badge-outline">
                {actesFiltres.length}
              </span>

            </div>

            <p className="mt-1 text-sm text-base-content/60">
              Recherchez et filtrez les actes médicaux
              disponibles.
            </p>
          </div>

          <Link
            href="/actes/nouveau"
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            Ajouter un acte
          </Link>

        </div>

        {/* ==================================================
            RECHERCHE
        =================================================== */}

        <div className="mt-5">

          <label className="input input-bordered flex h-12 w-full items-center gap-3">

            <Search
              size={19}
              className="text-base-content/40"
            />

            <input
              type="search"
              className="grow"
              placeholder="Rechercher par code, libellé, catégorie ou montant..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() =>
                  setSearch("")
                }
                title="Effacer"
              >
                <X size={15} />
              </button>
            )}

          </label>

        </div>

        {/* ==================================================
            FILTRES
        =================================================== */}

        <div className="mt-4 rounded-xl bg-base-200/60 p-4">

          <div className="mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Filter
                size={16}
                className="text-primary"
              />

              <span className="text-sm font-semibold">
                Filtres
              </span>

            </div>

            {filtresActifs && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-xs"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>
            )}

          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            {/* CATÉGORIE */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-base-content/60">
                Catégorie
              </label>

              <select
                className="select select-bordered w-full bg-base-100"
                value={categorie}
                onChange={(e) =>
                  setCategorie(
                    e.target.value
                  )
                }
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

            {/* STATUT */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-base-content/60">
                Statut
              </label>

              <select
                className="select select-bordered w-full bg-base-100"
                value={statut}
                onChange={(e) =>
                  setStatut(
                    e.target.value
                  )
                }
              >

                <option value="TOUS">
                  Tous les statuts
                </option>

                <option value="ACTIFS">
                  Actes actifs
                </option>

                <option value="INACTIFS">
                  Actes inactifs
                </option>

              </select>

            </div>

            {/* UTILISATION */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-base-content/60">
                Utilisation
              </label>

              <select
                className="select select-bordered w-full bg-base-100"
                value={utilisation}
                onChange={(e) =>
                  setUtilisation(
                    e.target.value
                  )
                }
              >

                <option value="TOUTES">
                  Toutes les utilisations
                </option>

                <option value="UTILISES">
                  Déjà utilisés
                </option>

                <option value="NON_UTILISES">
                  Jamais utilisés
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ==================================================
            RÉSUMÉ
        =================================================== */}

        <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">

          <p className="text-base-content/60">

            <strong className="text-base-content">
              {actesFiltres.length}
            </strong>{" "}
            résultat
            {actesFiltres.length !== 1
              ? "s"
              : ""}{" "}
            sur{" "}
            <strong className="text-base-content">
              {actes.length}
            </strong>

          </p>

          {filtresActifs && (
            <span className="badge badge-primary badge-outline">
              Recherche / filtres actifs
            </span>
          )}

        </div>

      </div>

      {/* ====================================================
          TABLEAU
      ===================================================== */}

      <div className="w-full overflow-x-auto">

        <table className="table w-full">

          <thead>

            <tr>

              <th>Acte</th>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Utilisation</th>
              <th>Statut</th>
              <th className="text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {actesFiltres.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="py-16"
                >

                  <div className="flex flex-col items-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200">
                      <Search
                        size={28}
                        className="text-base-content/30"
                      />
                    </div>

                    <h3 className="mt-4 font-bold">
                      Aucun acte trouvé
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-base-content/50">
                      Aucun acte médical ne correspond
                      aux critères de recherche ou de
                      filtrage sélectionnés.
                    </p>

                    {filtresActifs && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="btn btn-primary btn-sm mt-4"
                      >
                        <RotateCcw size={15} />
                        Réinitialiser les filtres
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ) : (

              actesFiltres.map(
                (acte) => {

                  const nombreUtilisations =
                    Number(
                      acte._count
                        ?.consultations ?? 0
                    );

                  return (
                    <tr
                      key={acte.id}
                      className="hover"
                    >

                      {/* ACTE */}

                      <td>

                        <div className="flex min-w-[230px] items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                            {acte.libelle
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "A"}
                          </div>

                          <div className="min-w-0">

                            <Link
                              href={`/actes/${acte.id}`}
                              className="block truncate font-semibold hover:text-primary hover:underline"
                            >
                              {acte.libelle}
                            </Link>

                            <span className="font-mono text-xs text-base-content/50">
                              {acte.code ||
                                "Sans code"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* CATÉGORIE */}

                      <td>

                        {acte.categorie ? (
                          <span className="badge badge-ghost">
                            {acte.categorie}
                          </span>
                        ) : (
                          <span className="text-base-content/40">
                            —
                          </span>
                        )}

                      </td>

                      {/* MONTANT */}

                      <td>

                        <div className="whitespace-nowrap">

                          <span className="font-semibold">
                            {formatMontant(
                              acte.montant,
                              acte.devise
                            )}
                          </span>

                        </div>

                      </td>

                      {/* UTILISATION */}

                      <td>

                        <span
                          className={`badge ${
                            nombreUtilisations >
                            0
                              ? "badge-info badge-outline"
                              : "badge-ghost"
                          }`}
                        >
                          {nombreUtilisations} fois
                        </span>

                      </td>

                      {/* STATUT */}

                      <td>

                        {acte.actif ? (
                          <span className="badge badge-success gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Actif
                          </span>
                        ) : (
                          <span className="badge badge-ghost gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Inactif
                          </span>
                        )}

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="flex justify-end gap-1">

                          <Link
                            href={`/actes/${acte.id}`}
                            className="btn btn-sm btn-ghost btn-square"
                            title="Voir"
                          >
                            <Eye size={17} />
                          </Link>

                          <Link
                            href={`/actes/${acte.id}/modifier`}
                            className="btn btn-sm btn-ghost btn-square"
                            title="Modifier"
                          >
                            <Edit size={17} />
                          </Link>

                          <button
                            type="button"
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={() =>
                              handleToggle(
                                acte
                              )
                            }
                            title={
                              acte.actif
                                ? "Désactiver"
                                : "Activer"
                            }
                          >
                            <Power
                              size={17}
                              className={
                                acte.actif
                                  ? "text-success"
                                  : "text-base-content/40"
                              }
                            />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-error btn-outline btn-square"
                            onClick={() =>
                              handleDelete(
                                acte
                              )
                            }
                            title="Supprimer"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

      {/* ====================================================
          FOOTER
      ===================================================== */}

      {actesFiltres.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-base-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">

          <p className="text-base-content/60">
            Affichage de{" "}
            <strong className="text-base-content">
              {actesFiltres.length}
            </strong>{" "}
            acte
            {actesFiltres.length !== 1
              ? "s"
              : ""}
          </p>

          {filtresActifs && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-ghost btn-sm"
            >
              <RotateCcw size={15} />
              Effacer les filtres
            </button>
          )}

        </div>
      )}

    </section>
  );
}
