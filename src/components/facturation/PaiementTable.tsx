"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
Search,
SlidersHorizontal,
X,
Eye,
Receipt,
CalendarDays,
CreditCard,
UserRound,
RotateCcw,
ChevronDown,
FileText,
Wallet,
Ban,
CheckCircle2,
ArrowDownUp,
} from "lucide-react";

type PaiementTableProps = {
paiements: any[];
};

export default function PaiementTable({
paiements,
}: PaiementTableProps) {
/* =========================================================
ÉTATS
========================================================= */

const [search, setSearch] = useState("");
const [showAdvanced, setShowAdvanced] = useState(false);

const [statut, setStatut] = useState("TOUS");
const [modePaiement, setModePaiement] = useState("TOUS");
const [typePaiement, setTypePaiement] = useState("TOUS");

const [dateDebut, setDateDebut] = useState("");
const [dateFin, setDateFin] = useState("");

const [montantMin, setMontantMin] = useState("");
const [montantMax, setMontantMax] = useState("");

/* =========================================================
OPTIONS DYNAMIQUES
========================================================= */

const modesPaiement = useMemo(() => {
return Array.from(
new Set(
paiements
.map((p) => p.modePaiement)
.filter(Boolean),
),
).sort();
}, [paiements]);

const typesPaiement = useMemo(() => {
return Array.from(
new Set(
paiements
.map((p) => p.type)
.filter(Boolean),
),
).sort();
}, [paiements]);

/* =========================================================
RECHERCHE + FILTRES
========================================================= */

const paiementsFiltres = useMemo(() => {
const recherche = search.trim().toLowerCase();


return paiements.filter((p) => {
  const patient = p.patient;
  const facture = p.facture;
  const consultation = facture?.consultation;

  const nomPatient = [
    patient?.nom,
    patient?.postNom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const numeroDossier = String(
    patient?.numeroDossier || "",
  ).toLowerCase();

  const reference = String(
    p.reference || "",
  ).toLowerCase();

  const numeroFacture = String(
    facture?.numero || "",
  ).toLowerCase();

  const consultationNumero = consultation
    ? `cons-${consultation.idConsultation}`.toLowerCase()
    : "";

  const mode = getModePaiementLabel(
    p.modePaiement,
  ).toLowerCase();

  const type = String(
    p.type || "",
  ).toLowerCase();

  /* -----------------------------------------------------
     RECHERCHE GLOBALE
  ----------------------------------------------------- */

  const correspondRecherche =
    !recherche ||
    reference.includes(recherche) ||
    nomPatient.includes(recherche) ||
    numeroDossier.includes(recherche) ||
    numeroFacture.includes(recherche) ||
    consultationNumero.includes(recherche) ||
    mode.includes(recherche) ||
    type.includes(recherche);

  if (!correspondRecherche) {
    return false;
  }

  /* -----------------------------------------------------
     STATUT
  ----------------------------------------------------- */

  if (
    statut !== "TOUS" &&
    p.statut !== statut
  ) {
    return false;
  }

  /* -----------------------------------------------------
     MODE
  ----------------------------------------------------- */

  if (
    modePaiement !== "TOUS" &&
    p.modePaiement !== modePaiement
  ) {
    return false;
  }

  /* -----------------------------------------------------
     TYPE
  ----------------------------------------------------- */

  if (
    typePaiement !== "TOUS" &&
    p.type !== typePaiement
  ) {
    return false;
  }

  /* -----------------------------------------------------
     DATE
  ----------------------------------------------------- */

  if (p.datePaiement) {
    const datePaiement = new Date(
      p.datePaiement,
    );

    if (
      Number.isNaN(
        datePaiement.getTime(),
      )
    ) {
      return false;
    }

    if (dateDebut) {
      const debut = new Date(
        `${dateDebut}T00:00:00`,
      );

      if (datePaiement < debut) {
        return false;
      }
    }

    if (dateFin) {
      const fin = new Date(
        `${dateFin}T23:59:59.999`,
      );

      if (datePaiement > fin) {
        return false;
      }
    }
  }

  /* -----------------------------------------------------
     MONTANT MINIMUM
  ----------------------------------------------------- */

  if (montantMin !== "") {
    const min = Number(montantMin);

    if (
      Number.isFinite(min) &&
      Number(p.montant || 0) < min
    ) {
      return false;
    }
  }

  /* -----------------------------------------------------
     MONTANT MAXIMUM
  ----------------------------------------------------- */

  if (montantMax !== "") {
    const max = Number(montantMax);

    if (
      Number.isFinite(max) &&
      Number(p.montant || 0) > max
    ) {
      return false;
    }
  }

  return true;
});


}, [
paiements,
search,
statut,
modePaiement,
typePaiement,
dateDebut,
dateFin,
montantMin,
montantMax,
]);

/* =========================================================
STATISTIQUES FILTRÉES
========================================================= */

const statistiques = useMemo(() => {
const total = paiementsFiltres.length;


const payes = paiementsFiltres.filter(
  (p) => p.statut === "PAYE",
);

const annules = paiementsFiltres.filter(
  (p) => p.statut === "ANNULE",
);

const rembourses = paiementsFiltres.filter(
  (p) => p.statut === "REMBOURSE",
);

const montantPaye = payes.reduce(
  (total, p) =>
    total + Number(p.montant || 0),
  0,
);

const montantAnnule = annules.reduce(
  (total, p) =>
    total + Number(p.montant || 0),
  0,
);

const montantRembourse =
  rembourses.reduce(
    (total, p) =>
      total + Number(p.montant || 0),
    0,
  );

return {
  total,
  payes: payes.length,
  annules: annules.length,
  rembourses: rembourses.length,
  montantPaye,
  montantAnnule,
  montantRembourse,
};


}, [paiementsFiltres]);

/* =========================================================
FILTRES ACTIFS
========================================================= */

const nombreFiltresActifs = [
statut !== "TOUS",
modePaiement !== "TOUS",
typePaiement !== "TOUS",
dateDebut !== "",
dateFin !== "",
montantMin !== "",
montantMax !== "",
].filter(Boolean).length;

const hasFilters =
search !== "" ||
nombreFiltresActifs > 0;

/* =========================================================
RESET
========================================================= */

function resetFilters() {
setSearch("");
setStatut("TOUS");
setModePaiement("TOUS");
setTypePaiement("TOUS");
setDateDebut("");
setDateFin("");
setMontantMin("");
setMontantMax("");
}

/* =========================================================
FORMAT DATE
========================================================= */

function formatDate(
date: Date | string | null | undefined,
) {
if (!date) return "—";


const parsed = new Date(date);

if (
  Number.isNaN(
    parsed.getTime(),
  )
) {
  return "—";
}

return parsed.toLocaleString(
  "fr-FR",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
);


}

/* =========================================================
MODE PAIEMENT
========================================================= */

function getModePaiementLabel(
mode: string | null | undefined,
) {
const modes: Record<
string,
string
> = {
ESPECES: "Espèces",
MOBILE_MONEY: "Mobile Money",
CARTE: "Carte bancaire",
VIREMENT: "Virement bancaire",
CHEQUE: "Chèque",
};


if (!mode) return "—";

return modes[mode] || mode;


}

/* =========================================================
STATUT
========================================================= */

function getStatutLabel(
statut: string | null | undefined,
) {
const statuts: Record<
string,
string
> = {
PAYE: "Payé",
ANNULE: "Annulé",
REMBOURSE: "Remboursé",
};


if (!statut) return "—";

return statuts[statut] || statut;


}

function getStatutClass(
statut: string | null | undefined,
) {
switch (statut) {
case "PAYE":
return "badge badge-success gap-1";


  case "ANNULE":
    return "badge badge-error gap-1";

  case "REMBOURSE":
    return "badge badge-warning gap-1";

  default:
    return "badge badge-ghost";
}


}

/* =========================================================
DEVISE
========================================================= */

const devise =
paiementsFiltres[0]?.devise ||
paiements[0]?.devise ||
"USD";

/* =========================================================
RENDU
========================================================= */

return ( <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg">


  {/* =====================================================
      BARRE DE RECHERCHE
  ===================================================== */}

  <div className="border-b border-base-300 bg-base-100 p-4 md:p-5">

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

      {/* RECHERCHE */}

      <div className="relative flex-1">

        <Search
          size={20}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Rechercher référence, patient, dossier, facture..."
          className="input input-bordered h-12 w-full pl-11 pr-11 focus:border-primary"
        />

        {search && (
          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-base-content/40 hover:bg-base-200 hover:text-base-content"
          >
            <X size={17} />
          </button>
        )}

      </div>

      {/* FILTRE */}

      <button
        type="button"
        onClick={() =>
          setShowAdvanced(
            !showAdvanced,
          )
        }
        className={`btn h-12 ${
          showAdvanced
            ? "btn-primary"
            : "btn-outline"
        }`}
      >

        <SlidersHorizontal
          size={18}
        />

        Filtres avancés

        {nombreFiltresActifs > 0 && (
          <span className="badge badge-secondary badge-sm">
            {nombreFiltresActifs}
          </span>
        )}

        <ChevronDown
          size={16}
          className={`transition-transform ${
            showAdvanced
              ? "rotate-180"
              : ""
          }`}
        />

      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="btn btn-ghost h-12"
        >
          <RotateCcw
            size={17}
          />

          Réinitialiser
        </button>
      )}

    </div>

    {/* ===================================================
        FILTRES AVANCÉS
    ==================================================== */}

    {showAdvanced && (
      <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/40 p-4 md:p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="font-semibold">
              Recherche avancée
            </h3>

            <p className="text-xs text-base-content/50">
              Affinez la liste des paiements
            </p>
          </div>

          {nombreFiltresActifs > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-xs btn-ghost"
            >
              Effacer
            </button>
          )}

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* STATUT */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-content/60">
              Statut
            </label>

            <select
              value={statut}
              onChange={(e) =>
                setStatut(
                  e.target.value,
                )
              }
              className="select select-bordered w-full"
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="PAYE">
                Payé
              </option>

              <option value="ANNULE">
                Annulé
              </option>

              <option value="REMBOURSE">
                Remboursé
              </option>
            </select>
          </div>

          {/* MODE */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-content/60">
              Mode de paiement
            </label>

            <select
              value={modePaiement}
              onChange={(e) =>
                setModePaiement(
                  e.target.value,
                )
              }
              className="select select-bordered w-full"
            >
              <option value="TOUS">
                Tous les modes
              </option>

              {modesPaiement.map(
                (mode) => (
                  <option
                    key={mode}
                    value={mode}
                  >
                    {getModePaiementLabel(
                      mode,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* TYPE */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-content/60">
              Type de paiement
            </label>

            <select
              value={typePaiement}
              onChange={(e) =>
                setTypePaiement(
                  e.target.value,
                )
              }
              className="select select-bordered w-full"
            >
              <option value="TOUS">
                Tous les types
              </option>

              {typesPaiement.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* DATE DÉBUT */}

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-base-content/60">
              <CalendarDays
                size={14}
              />
              Date début
            </label>

            <input
              type="date"
              value={dateDebut}
              onChange={(e) =>
                setDateDebut(
                  e.target.value,
                )
              }
              className="input input-bordered w-full"
            />
          </div>

          {/* DATE FIN */}

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-base-content/60">
              <CalendarDays
                size={14}
              />
              Date fin
            </label>

            <input
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(e) =>
                setDateFin(
                  e.target.value,
                )
              }
              className="input input-bordered w-full"
            />
          </div>

          {/* MONTANT MIN */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-content/60">
              Montant minimum
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={montantMin}
              onChange={(e) =>
                setMontantMin(
                  e.target.value,
                )
              }
              placeholder="0.00"
              className="input input-bordered w-full"
            />
          </div>

          {/* MONTANT MAX */}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-content/60">
              Montant maximum
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={montantMax}
              min={montantMin || undefined}
              onChange={(e) =>
                setMontantMax(
                  e.target.value,
                )
              }
              placeholder="0.00"
              className="input input-bordered w-full"
            />
          </div>

        </div>

        {/* RÉSUMÉ */}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-base-300 pt-4">

          <span className="text-sm text-base-content/50">
            Résultats :
          </span>

          <span className="badge badge-primary">
            {statistiques.total} paiement(s)
          </span>

          <span className="badge badge-success">
            {statistiques.montantPaye.toFixed(2)}
            {" "}
            {devise}
          </span>

        </div>

      </div>
    )}

  </div>

  {/* =====================================================
      STATISTIQUES
  ====================================================== */}

  <div className="grid grid-cols-2 gap-px border-b border-base-300 bg-base-300 md:grid-cols-4">

    {/* TOTAL */}

    <div className="bg-base-100 p-4 md:p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase text-base-content/50">
            Paiements
          </p>

          <p className="mt-1 text-2xl font-bold">
            {statistiques.total}
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Wallet size={20} />
        </div>

      </div>

    </div>

    {/* PAYÉS */}

    <div className="bg-base-100 p-4 md:p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase text-base-content/50">
            Encaissé
          </p>

          <p className="mt-1 text-xl font-bold text-success">
            {statistiques.montantPaye.toFixed(2)}
          </p>

          <p className="text-xs text-base-content/40">
            {statistiques.payes} paiement(s)
          </p>
        </div>

        <div className="rounded-xl bg-success/10 p-3 text-success">
          <CheckCircle2 size={20} />
        </div>

      </div>

    </div>

    {/* ANNULÉS */}

    <div className="bg-base-100 p-4 md:p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase text-base-content/50">
            Annulé
          </p>

          <p className="mt-1 text-xl font-bold text-error">
            {statistiques.montantAnnule.toFixed(2)}
          </p>

          <p className="text-xs text-base-content/40">
            {statistiques.annules} paiement(s)
          </p>
        </div>

        <div className="rounded-xl bg-error/10 p-3 text-error">
          <Ban size={20} />
        </div>

      </div>

    </div>

    {/* REMBOURSÉS */}

    <div className="bg-base-100 p-4 md:p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs font-medium uppercase text-base-content/50">
            Remboursé
          </p>

          <p className="mt-1 text-xl font-bold text-warning">
            {statistiques.montantRembourse.toFixed(2)}
          </p>

          <p className="text-xs text-base-content/40">
            {statistiques.rembourses} paiement(s)
          </p>
        </div>

        <div className="rounded-xl bg-warning/10 p-3 text-warning">
          <ArrowDownUp size={20} />
        </div>

      </div>

    </div>

  </div>

  {/* =====================================================
      EN-TÊTE TABLE
  ====================================================== */}

  <div className="flex flex-col gap-2 border-b border-base-300 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">

    <div>
      <h2 className="font-bold">
        Liste des paiements
      </h2>

      <p className="text-xs text-base-content/50">
        {paiementsFiltres.length} résultat(s)
        {" "}sur{" "}
        {paiements.length}
      </p>
    </div>

    {hasFilters && (
      <div className="flex items-center gap-2">

        <span className="badge badge-outline">
          Filtres actifs
        </span>

        <button
          type="button"
          onClick={resetFilters}
          className="btn btn-xs btn-ghost"
        >
          Effacer
        </button>

      </div>
    )}

  </div>

  {/* =====================================================
      TABLE
  ====================================================== */}

  <div className="overflow-x-auto">

    <table className="table table-zebra">

      <thead className="bg-base-200/70">

        <tr>

          <th>Référence</th>

          <th>Patient</th>

          <th>Facture</th>

          <th>Consultation</th>

          <th>Mode</th>

          <th>Montant</th>

          <th>Date</th>

          <th>Statut</th>

          <th className="text-right">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {paiementsFiltres.length === 0 ? (

          <tr>

            <td
              colSpan={9}
              className="py-20 text-center"
            >

              <div className="mx-auto flex max-w-sm flex-col items-center">

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/40">
                  <Search size={28} />
                </div>

                <h3 className="font-bold">
                  Aucun résultat
                </h3>

                <p className="mt-1 text-sm text-base-content/50">
                  Aucun paiement ne correspond
                  aux critères sélectionnés.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    Réinitialiser
                  </button>
                )}

              </div>

            </td>

          </tr>

        ) : (

          paiementsFiltres.map((p) => {

            const patient =
              p.patient;

            const facture =
              p.facture;

            const consultation =
              facture?.consultation;

            return (
              <tr
                key={p.id}
                className="hover"
              >

                {/* RÉFÉRENCE */}

                <td>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CreditCard
                        size={16}
                      />
                    </div>

                    <div>

                      <div className="font-bold">
                        {p.reference ||
                          "—"}
                      </div>

                      <div className="text-xs text-base-content/40">
                        Paiement #{p.id}
                      </div>

                    </div>

                  </div>

                </td>

                {/* PATIENT */}

                <td>

                  {patient ? (

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound
                          size={16}
                        />
                      </div>

                      <div className="min-w-0">

                        <div className="whitespace-nowrap font-semibold">
                          {patient.nom}{" "}
                          {patient.postNom || ""}{" "}
                          {patient.prenom || ""}
                        </div>

                        <div className="text-xs text-base-content/50">
                          {patient.numeroDossier ||
                            "Dossier —"}
                        </div>

                      </div>

                    </div>

                  ) : (

                    <span className="text-base-content/40">
                      Patient inconnu
                    </span>

                  )}

                </td>

                {/* FACTURE */}

                <td>

                  {facture ? (

                    <Link
                      href={`/facturation/factures/${facture.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >

                      <FileText
                        size={14}
                      />

                      {facture.numero}

                    </Link>

                  ) : (

                    <span className="text-base-content/40">
                      —
                    </span>

                  )}

                </td>

                {/* CONSULTATION */}

                <td>

                  {consultation ? (

                    <span className="badge badge-ghost whitespace-nowrap">
                      CONS-
                      {
                        consultation.idConsultation
                      }
                    </span>

                  ) : (

                    <span className="text-base-content/40">
                      —
                    </span>

                  )}

                </td>

                {/* MODE */}

                <td>

                  <span className="badge badge-outline gap-1 whitespace-nowrap">

                    <CreditCard
                      size={12}
                    />

                    {getModePaiementLabel(
                      p.modePaiement,
                    )}

                  </span>

                </td>

                {/* MONTANT */}

                <td>

                  <div className="whitespace-nowrap">

                    <span className="font-bold">
                      {Number(
                        p.montant || 0,
                      ).toFixed(2)}
                    </span>

                    <span className="ml-1 text-xs text-base-content/50">
                      {p.devise ||
                        "USD"}
                    </span>

                  </div>

                </td>

                {/* DATE */}

                <td>

                  <div className="flex items-center gap-2 whitespace-nowrap text-sm">

                    <CalendarDays
                      size={14}
                      className="text-base-content/40"
                    />

                    {formatDate(
                      p.datePaiement,
                    )}

                  </div>

                </td>

                {/* STATUT */}

                <td>

                  <span
                    className={getStatutClass(
                      p.statut,
                    )}
                  >

                    {p.statut ===
                      "PAYE" && (
                      <CheckCircle2
                        size={13}
                      />
                    )}

                    {p.statut ===
                      "ANNULE" && (
                      <Ban
                        size={13}
                      />
                    )}

                    {p.statut ===
                      "REMBOURSE" && (
                      <ArrowDownUp
                        size={13}
                      />
                    )}

                    {getStatutLabel(
                      p.statut,
                    )}

                  </span>

                </td>

                {/* ACTIONS */}

                <td>

                  <div className="flex justify-end gap-1">

                    <Link
                      href={`/facturation/paiements/${p.id}`}
                      className="btn btn-sm btn-ghost"
                      title="Voir le paiement"
                    >
                      <Eye
                        size={17}
                      />
                    </Link>

                    <Link
                      href={`/paiements/${p.id}/print`}
                      className="btn btn-sm btn-outline"
                      title="Imprimer le reçu"
                    >
                      <Receipt
                        size={17}
                      />
                    </Link>

                  </div>

                </td>

              </tr>
            );
          })
        )}

      </tbody>

    </table>

  </div>

  {/* =====================================================
      FOOTER
  ====================================================== */}

  {paiementsFiltres.length > 0 && (

    <div className="flex flex-col gap-2 border-t border-base-300 bg-base-200/30 px-4 py-4 text-sm md:flex-row md:items-center md:justify-between md:px-5">

      <div className="text-base-content/60">

        Affichage de{" "}
        <strong className="text-base-content">
          {paiementsFiltres.length}
        </strong>{" "}
        paiement(s)

      </div>

      <div className="font-semibold">

        Total encaissé :{" "}

        <span className="text-success">
          {statistiques.montantPaye.toFixed(2)}
          {" "}
          {devise}
        </span>

      </div>

    </div>

  )}

</div>


);
}
