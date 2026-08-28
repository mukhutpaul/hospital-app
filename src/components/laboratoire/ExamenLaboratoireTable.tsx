
"use client";

import {
  MoreHorizontal,
  Pencil,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useMemo, useState } from "react";

import {
  deleteExamenLaboratoire,
  toggleExamenLaboratoire,
} from "@/app/actions/examens-laboratoire";

type Props = {
  examens: any[];
};

export default function ExamenLaboratoireTable({
  examens,
}: Props) {
  /* =========================================================
     RECHERCHE
  ========================================================= */

  const [search, setSearch] = useState("");

  /* =========================================================
     FILTRAGE
  ========================================================= */

  const examensFiltres = useMemo(() => {
    const terme = search.trim().toLowerCase();

    if (!terme) {
      return examens;
    }

    return examens.filter((examen) => {
      const code =
        String(examen.code ?? "");

      const nom =
        String(examen.nom ?? "");

      const unite =
        String(examen.unite ?? "");

      const valeurNormale =
        String(
          examen.valeurNormale ?? "",
        );

      const description =
        String(
          examen.description ?? "",
        );

      const prix =
        String(examen.prix ?? "");

      return [
        code,
        nom,
        unite,
        valeurNormale,
        description,
        prix,
      ]
        .join(" ")
        .toLowerCase()
        .includes(terme);
    });
  }, [
    examens,
    search,
  ]);

  /* =========================================================
     ACTIVER / DÉSACTIVER
  ========================================================= */

  async function handleToggle(
    examen: any,
  ) {
    try {
      const result =
        await toggleExamenLaboratoire(
          examen.id,
        );

      if (!result.success) {
        toast.error(
          result.message,
        );
        return;
      }

      toast.success(
        result.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Erreur toggle examen :",
        error,
      );

      toast.error(
        "Une erreur est survenue.",
      );
    }
  }

  /* =========================================================
     SUPPRIMER
  ========================================================= */

  async function handleDelete(
    examen: any,
  ) {
    const confirmation =
      await Swal.fire({
        title:
          "Supprimer l'examen ?",

        text: `Voulez-vous supprimer "${examen.nom}" ?`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        reverseButtons: true,
      });

    if (
      !confirmation.isConfirmed
    ) {
      return;
    }

    try {
      const result =
        await deleteExamenLaboratoire(
          examen.id,
        );

      if (!result.success) {
        toast.error(
          result.message,
        );
        return;
      }

      toast.success(
        result.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Erreur suppression examen :",
        error,
      );

      toast.error(
        "Une erreur est survenue.",
      );
    }
  }

  /* =========================================================
     AUCUN EXAMEN
  ========================================================= */

  if (!examens.length) {
    return (
      <div className="py-12 text-center">

        <div className="mb-3 flex justify-center">

          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <MoreHorizontal
              size={28}
            />
          </div>

        </div>

        <h3 className="font-semibold">
          Aucun examen
        </h3>

        <p className="text-sm text-base-content/60">
          Aucun examen de laboratoire
          n'est encore enregistré.
        </p>

      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-4">

      {/* =====================================================
          BARRE DE RECHERCHE
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-lg">

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
            placeholder="Rechercher par code, examen, unité, valeur normale..."
            className="input input-bordered h-11 w-full pl-10 pr-10"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 transition hover:text-error"
              title="Effacer la recherche"
            >
              <X size={17} />
            </button>
          )}

        </div>

        <div className="text-sm text-base-content/60">
          {examensFiltres.length} examen
          {examensFiltres.length !== 1
            ? "s"
            : ""}
        </div>

      </div>

      {/* =====================================================
          AUCUN RÉSULTAT
      ===================================================== */}

      {examensFiltres.length === 0 ? (
        <div className="rounded-xl border border-base-300 bg-base-100 px-6 py-12 text-center">

          <Search
            size={38}
            className="mx-auto mb-3 opacity-30"
          />

          <h3 className="font-semibold">
            Aucun résultat
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Aucun examen ne correspond
            à votre recherche.
          </p>

          <button
            type="button"
            className="btn btn-sm btn-ghost mt-4"
            onClick={() =>
              setSearch("")
            }
          >
            Réinitialiser
          </button>

        </div>
      ) : (

        /* ===================================================
           TABLEAU
        =================================================== */

        <div className="overflow-x-auto">

          <table className="table">

            <thead>
              <tr>
                <th>Code</th>
                <th>Examen</th>
                <th>Unité</th>
                <th>Valeur normale</th>
                <th>Prix</th>
                <th>Statut</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {examensFiltres.map(
                (examen) => (
                  <tr
                    key={examen.id}
                  >

                    {/* =====================================
                        CODE
                    ===================================== */}

                    <td>
                      <span className="font-mono font-semibold">
                        {examen.code}
                      </span>
                    </td>

                    {/* =====================================
                        EXAMEN
                    ===================================== */}

                    <td>
                      <div className="font-medium">
                        {examen.nom}
                      </div>

                      {examen.description && (
                        <div className="max-w-md truncate text-xs text-base-content/50">
                          {examen.description}
                        </div>
                      )}
                    </td>

                    {/* =====================================
                        UNITÉ
                    ===================================== */}

                    <td>
                      {examen.unite ||
                        "—"}
                    </td>

                    {/* =====================================
                        VALEUR NORMALE
                    ===================================== */}

                    <td>
                      {examen.valeurNormale ||
                        "—"}
                    </td>

                    {/* =====================================
                        PRIX
                    ===================================== */}

                    <td>
                      <span className="font-semibold">
                        {Number(
                          examen.prix ??
                            0,
                        ).toLocaleString(
                          "fr-FR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>

                      <span className="ml-1 text-xs text-base-content/50">
                        {examen.devise ||
                          "USD"}
                      </span>
                    </td>

                    {/* =====================================
                        STATUT
                    ===================================== */}

                    <td>
                      {examen.actif ? (
                        <span className="badge badge-success badge-sm">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-error badge-sm">
                          Inactif
                        </span>
                      )}
                    </td>

                    {/* =====================================
                        ACTIONS
                    ===================================== */}

                    <td>

                      <div className="flex justify-end gap-2">

                        {/* TOGGLE */}

                        <button
                          type="button"
                          className={`btn btn-sm btn-ghost ${
                            examen.actif
                              ? "text-warning"
                              : "text-success"
                          }`}
                          title={
                            examen.actif
                              ? "Désactiver"
                              : "Activer"
                          }
                          onClick={() =>
                            handleToggle(
                              examen,
                            )
                          }
                        >
                          <Power
                            size={16}
                          />
                        </button>

                        {/* MODIFIER */}

                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          title="Modifier"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        {/* SUPPRIMER */}

                        <button
                          type="button"
                          className="btn btn-sm btn-ghost text-error"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(
                              examen,
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

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
