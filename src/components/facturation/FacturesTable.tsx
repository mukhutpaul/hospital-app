"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
CalendarDays,
ChevronDown,
CircleX,
Eye,
FileText,
RotateCcw,
Search,
SlidersHorizontal,
UserRound,
Wallet,
} from "lucide-react";

type Props = {
factures: any[];
};

export default function FactureTable({
factures,
}: Props) {
const [search, setSearch] = useState("");
const [statut, setStatut] = useState("TOUS");
const [devise, setDevise] = useState("TOUTES");
const [dateDebut, setDateDebut] = useState("");
const [dateFin, setDateFin] = useState("");
const [showFilters, setShowFilters] = useState(true);

const money = (value: any) =>
Number(value || 0).toLocaleString("fr-FR", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
});

/* ========================================================
STATUT
======================================================== */

const statusConfig = (value: string) => {
switch (value) {
case "PAYEE":
return {
label: "Payée",
className: "badge-success",
};


  case "PARTIELLEMENT_PAYEE":
    return {
      label: "Partiellement payée",
      className: "badge-warning",
    };

  case "ANNULEE":
    return {
      label: "Annulée",
      className: "badge-error",
    };

  case "IMPAYEE":
    return {
      label: "Impayée",
      className: "badge-error",
    };

  default:
    return {
      label: value || "Inconnue",
      className: "badge-ghost",
    };
}


};

/* ========================================================
DEVISES DISPONIBLES
======================================================== */

const devises = useMemo(() => {
return Array.from(
new Set(
factures
.map((facture) => facture.devise)
.filter(Boolean),
),
);
}, [factures]);

/* ========================================================
FILTRAGE
======================================================== */

const facturesFiltrees = useMemo(() => {
const terme = search.trim().toLowerCase();


return factures.filter((facture) => {
  const patient = facture.patient;

  const nomPatient = [
    patient?.nom,
    patient?.postNom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const numeroDossier =
    String(
      patient?.numeroDossier || "",
    ).toLowerCase();

  const numeroFacture =
    String(
      facture.numero || "",
    ).toLowerCase();

  const dateFacture = facture.dateFacture
    ? new Date(facture.dateFacture)
    : null;

  /* -------------------------------
     RECHERCHE
  -------------------------------- */

  const correspondRecherche =
    !terme ||
    numeroFacture.includes(terme) ||
    nomPatient.includes(terme) ||
    numeroDossier.includes(terme);

  /* -------------------------------
     STATUT
  -------------------------------- */

  const correspondStatut =
    statut === "TOUS" ||
    facture.statut === statut;

  /* -------------------------------
     DEVISE
  -------------------------------- */

  const correspondDevise =
    devise === "TOUTES" ||
    facture.devise === devise;

  /* -------------------------------
     DATE DÉBUT
  -------------------------------- */

  let correspondDateDebut = true;

  if (dateDebut && dateFacture) {
    const debut = new Date(
      `${dateDebut}T00:00:00`,
    );

    correspondDateDebut =
      dateFacture >= debut;
  }

  /* -------------------------------
     DATE FIN
  -------------------------------- */

  let correspondDateFin = true;

  if (dateFin && dateFacture) {
    const fin = new Date(
      `${dateFin}T23:59:59`,
    );

    correspondDateFin =
      dateFacture <= fin;
  }

  return (
    correspondRecherche &&
    correspondStatut &&
    correspondDevise &&
    correspondDateDebut &&
    correspondDateFin
  );
});


}, [
factures,
search,
statut,
devise,
dateDebut,
dateFin,
]);

/* ========================================================
RÉINITIALISATION
======================================================== */

function resetFilters() {
setSearch("");
setStatut("TOUS");
setDevise("TOUTES");
setDateDebut("");
setDateFin("");
}

const hasFilters =
search !== "" ||
statut !== "TOUS" ||
devise !== "TOUTES" ||
dateDebut !== "" ||
dateFin !== "";

/* ========================================================
STATISTIQUES FILTRÉES
======================================================== */

const totalFacture = facturesFiltrees.reduce(
(total, facture) =>
total + Number(facture.montantTotal || 0),
0,
);

const totalPaye = facturesFiltrees.reduce(
(total, facture) =>
total + Number(facture.montantPaye || 0),
0,
);

const totalReste = facturesFiltrees.reduce(
(total, facture) =>
total + Number(facture.reste || 0),
0,
);

return ( <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">


  {/* ==================================================
      EN-TÊTE
  ================================================== */}

  <div className="border-b border-base-300 bg-base-100 p-5 sm:p-6">

    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Liste des factures
          </h2>

          <p className="text-sm text-base-content/60">
            {facturesFiltrees.length} facture
            {facturesFiltrees.length > 1
              ? "s"
              : ""}{" "}
            affichée
            {facturesFiltrees.length > 1
              ? "s"
              : ""}
            {hasFilters &&
              ` sur ${factures.length}`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setShowFilters(!showFilters)
        }
        className={`btn btn-sm ${
          showFilters
            ? "btn-primary"
            : "btn-outline"
        }`}
      >
        <SlidersHorizontal size={16} />

        Filtres avancés

        <ChevronDown
          size={16}
          className={`transition-transform ${
            showFilters
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

    </div>

    {/* ==================================================
        RECHERCHE
    ================================================== */}

    <div className="relative mt-5">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
      />

      <input
        type="search"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Rechercher par numéro de facture, patient ou numéro de dossier..."
        className="input input-bordered h-12 w-full pl-11 pr-10 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
          title="Effacer la recherche"
        >
          <CircleX size={17} />
        </button>
      )}
    </div>

    {/* ==================================================
        FILTRES AVANCÉS
    ================================================== */}

    {showFilters && (
      <div className="mt-4 rounded-xl border border-base-300 bg-base-200/30 p-4">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* STATUT */}

          <div className="form-control">
            <label className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Statut
            </label>

            <select
              value={statut}
              onChange={(event) =>
                setStatut(
                  event.target.value,
                )
              }
              className="select select-bordered w-full bg-base-100"
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="PAYEE">
                Payées
              </option>

              <option value="PARTIELLEMENT_PAYEE">
                Partiellement payées
              </option>

              <option value="IMPAYEE">
                Impayées
              </option>

              <option value="ANNULEE">
                Annulées
              </option>
            </select>
          </div>

          {/* DEVISE */}

          <div className="form-control">
            <label className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Devise
            </label>

            <select
              value={devise}
              onChange={(event) =>
                setDevise(
                  event.target.value,
                )
              }
              className="select select-bordered w-full bg-base-100"
            >
              <option value="TOUTES">
                Toutes les devises
              </option>

              {devises.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* DATE DÉBUT */}

          <div className="form-control">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
              <CalendarDays size={13} />
              Date début
            </label>

            <input
              type="date"
              value={dateDebut}
              onChange={(event) =>
                setDateDebut(
                  event.target.value,
                )
              }
              className="input input-bordered w-full bg-base-100"
            />
          </div>

          {/* DATE FIN */}

          <div className="form-control">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-base-content/60">
              <CalendarDays size={13} />
              Date fin
            </label>

            <input
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(event) =>
                setDateFin(
                  event.target.value,
                )
              }
              className="input input-bordered w-full bg-base-100"
            />
          </div>

        </div>

        {/* FILTRES ACTIFS */}

        <div className="mt-4 flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs font-semibold text-base-content/50">
              Filtres actifs :
            </span>

            {statut !== "TOUS" && (
              <span className="badge badge-primary gap-1">
                Statut :{" "}
                {statusConfig(statut).label}
              </span>
            )}

            {devise !== "TOUTES" && (
              <span className="badge badge-info">
                Devise : {devise}
              </span>
            )}

            {dateDebut && (
              <span className="badge badge-outline">
                Depuis : {dateDebut}
              </span>
            )}

            {dateFin && (
              <span className="badge badge-outline">
                Jusqu'au : {dateFin}
              </span>
            )}

            {search && (
              <span className="badge badge-secondary">
                Recherche : {search}
              </span>
            )}

            {!hasFilters && (
              <span className="text-xs text-base-content/40">
                Aucun filtre appliqué
              </span>
            )}

          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-ghost btn-sm"
            >
              <RotateCcw size={15} />
              Réinitialiser
            </button>
          )}

        </div>

      </div>
    )}
  </div>

  {/* ==================================================
      SYNTHÈSE
  ================================================== */}

  <div className="grid grid-cols-1 border-b border-base-300 sm:grid-cols-3">

    <div className="flex items-center gap-3 border-b border-base-300 p-4 sm:border-b-0 sm:border-r">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <FileText size={18} />
      </div>

      <div>
        <p className="text-xs text-base-content/50">
          Factures
        </p>

        <p className="font-bold">
          {facturesFiltrees.length}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 border-b border-base-300 p-4 sm:border-b-0 sm:border-r">
      <div className="rounded-lg bg-success/10 p-2.5 text-success">
        <Wallet size={18} />
      </div>

      <div>
        <p className="text-xs text-base-content/50">
          Total encaissé
        </p>

        <p className="font-bold text-success">
          {money(totalPaye)} USD
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 p-4">
      <div className="rounded-lg bg-error/10 p-2.5 text-error">
        <Wallet size={18} />
      </div>

      <div>
        <p className="text-xs text-base-content/50">
          Reste à payer
        </p>

        <p className="font-bold text-error">
          {money(totalReste)} USD
        </p>
      </div>
    </div>

  </div>

  {/* ==================================================
      TABLEAU
  ================================================== */}

  <div className="overflow-x-auto">
    <table className="table table-zebra">

      <thead>
        <tr className="bg-base-200/60 text-xs uppercase tracking-wide">
          <th className="whitespace-nowrap">
            Facture
          </th>

          <th className="whitespace-nowrap">
            Patient
          </th>

          <th className="whitespace-nowrap">
            Date
          </th>

          <th className="whitespace-nowrap text-right">
            Total
          </th>

          <th className="whitespace-nowrap text-right">
            Payé
          </th>

          <th className="whitespace-nowrap text-right">
            Reste
          </th>

          <th className="whitespace-nowrap">
            Statut
          </th>

          <th className="text-right">
            Action
          </th>
        </tr>
      </thead>

      <tbody>

        {facturesFiltrees.map((facture) => {
          const status =
            statusConfig(
              facture.statut,
            );

          return (
            <tr
              key={facture.id}
              className="transition-colors hover:bg-base-200/40"
            >

              {/* FACTURE */}

              <td>
                <div className="flex items-center gap-3">

                  <div className="hidden rounded-lg bg-primary/10 p-2 text-primary sm:flex">
                    <FileText size={16} />
                  </div>

                  <div>
                    <div className="font-mono font-semibold">
                      {facture.numero}
                    </div>

                    <div className="text-xs text-base-content/40">
                      ID #{facture.id}
                    </div>
                  </div>

                </div>
              </td>

              {/* PATIENT */}

              <td>
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/50">
                    <UserRound size={17} />
                  </div>

                  <div className="min-w-0">
                    <div className="whitespace-nowrap font-medium">
                      {facture.patient?.nom}{" "}
                      {facture.patient?.postNom ||
                        ""}{" "}
                      {facture.patient?.prenom ||
                        ""}
                    </div>

                    <div className="text-xs text-base-content/50">
                      {facture.patient
                        ?.numeroDossier ||
                        "Dossier non renseigné"}
                    </div>
                  </div>

                </div>
              </td>

              {/* DATE */}

              <td>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <CalendarDays
                    size={15}
                    className="text-base-content/40"
                  />

                  <span>
                    {new Date(
                      facture.dateFacture,
                    ).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </td>

              {/* TOTAL */}

              <td className="text-right">
                <div className="font-bold">
                  {money(
                    facture.montantTotal,
                  )}
                </div>

                <div className="text-xs text-base-content/40">
                  {facture.devise}
                </div>
              </td>

              {/* PAYÉ */}

              <td className="text-right">
                <div className="font-semibold text-success">
                  {money(
                    facture.montantPaye,
                  )}
                </div>

                <div className="text-xs text-base-content/40">
                  {facture.devise}
                </div>
              </td>

              {/* RESTE */}

              <td className="text-right">
                <div
                  className={`font-semibold ${
                    Number(
                      facture.reste || 0,
                    ) > 0
                      ? "text-error"
                      : "text-success"
                  }`}
                >
                  {money(
                    facture.reste,
                  )}
                </div>

                <div className="text-xs text-base-content/40">
                  {facture.devise}
                </div>
              </td>

              {/* STATUT */}

              <td>
                <span
                  className={`badge ${status.className} whitespace-nowrap`}
                >
                  {status.label}
                </span>
              </td>

              {/* ACTION */}

              <td>
                <div className="flex justify-end">

                  <Link
                    href={`/facturation/factures/${facture.id}`}
                    className="btn btn-sm btn-primary gap-2"
                    title="Voir la facture"
                  >
                    <Eye size={16} />

                    <span className="hidden sm:inline">
                      Voir
                    </span>
                  </Link>

                </div>
              </td>

            </tr>
          );
        })}

        {/* ==================================================
            AUCUN RÉSULTAT
        ================================================== */}

        {facturesFiltrees.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="py-16"
            >
              <div className="flex flex-col items-center justify-center text-center">

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/30">
                  <Search size={28} />
                </div>

                <h3 className="font-semibold">
                  Aucune facture trouvée
                </h3>

                <p className="mt-1 max-w-md text-sm text-base-content/50">
                  Aucune facture ne correspond
                  aux critères de recherche
                  ou aux filtres sélectionnés.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline mt-4"
                  >
                    <RotateCcw size={15} />
                    Réinitialiser les filtres
                  </button>
                )}

              </div>
            </td>
          </tr>
        )}

      </tbody>
    </table>
  </div>

  {/* ==================================================
      FOOTER
  ================================================== */}

  {facturesFiltrees.length > 0 && (
    <div className="flex flex-col gap-2 border-t border-base-300 bg-base-200/20 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">

      <p className="text-base-content/50">
        Affichage de{" "}
        <span className="font-semibold text-base-content">
          {facturesFiltrees.length}
        </span>{" "}
        facture
        {facturesFiltrees.length > 1
          ? "s"
          : ""}
      </p>

      <div className="flex flex-wrap gap-4">

        <span>
          <span className="text-base-content/50">
            Total :
          </span>{" "}
          <strong>
            {money(totalFacture)} USD
          </strong>
        </span>

        <span className="text-success">
          <span className="text-base-content/50">
            Payé :
          </span>{" "}
          <strong>
            {money(totalPaye)} USD
          </strong>
        </span>

        <span className="text-error">
          <span className="text-base-content/50">
            Reste :
          </span>{" "}
          <strong>
            {money(totalReste)} USD
          </strong>
        </span>

      </div>
    </div>
  )}

</div>


);
}
