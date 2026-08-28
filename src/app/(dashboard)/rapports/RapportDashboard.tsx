"use client";

import {
useEffect,
useMemo,
useState,
} from "react";

import {
Activity,
Calendar,
ChevronDown,
CreditCard,
DollarSign,
FileText,
Filter,
FlaskConical,
Hospital,
Image,
RefreshCw,
Search,
Stethoscope,
Users,
Wallet,
X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
getRapportGlobal,
type RapportFilter,
} from "@/app/actions/rapport";

/* ==========================================================
TYPES
========================================================== */

type Props = {
initialRapport: any;

services: {
id: number;
nom: string;
}[];

medecins: {
id: number;
nom: string;
postNom: string | null;
prenom: string | null;
}[];
};

/* ==========================================================
PERIODES
========================================================== */

const periodes = [
{
value: "AUJOURDHUI",
label: "Aujourd'hui",
},
{
value: "HIER",
label: "Hier",
},
{
value: "SEMAINE",
label: "Cette semaine",
},
{
value: "MOIS",
label: "Ce mois",
},
{
value: "ANNEE",
label: "Cette année",
},
];

/* ==========================================================
COMPONENT
========================================================== */

export default function RapportDashboard({
initialRapport,
services,
medecins,
}: Props) {

const [rapport, setRapport] =
useState(initialRapport);

const [loading, setLoading] =
useState(false);

const [showFilters, setShowFilters] =
useState(false);

const [filters, setFilters] =
useState<RapportFilter>({
periode: "MOIS",
});

/* ========================================================
LOAD RAPPORT
======================================================== */

async function loadRapport() {


try {

  setLoading(true);

  const data =
    await getRapportGlobal(filters);

  setRapport(data);

  toast.success(
    "Rapport actualisé avec succès"
  );

} catch (error) {

  console.error(error);

  toast.error(
    "Impossible de charger le rapport"
  );

} finally {

  setLoading(false);

}


}

/* ========================================================
RESET FILTERS
======================================================== */

function resetFilters() {


setFilters({
  periode: "MOIS",
  dateDebut: undefined,
  dateFin: undefined,
  serviceId: undefined,
  medecinId: undefined,
});


}

/* ========================================================
AUTO LOAD PERIODE
======================================================== */

useEffect(() => {


loadRapport();


}, [
filters.periode,
]);

/* ========================================================
RESUME
======================================================== */

const resume =
rapport?.resume || {};

const activeFiltersCount =
[
filters.dateDebut,
filters.dateFin,
filters.serviceId,
filters.medecinId,
].filter(Boolean).length;

const periodeLabel =
useMemo(() => {


  const found =
    periodes.find(
      (item) =>
        item.value ===
        filters.periode
    );

  if (found) {
    return found.label;
  }

  if (
    filters.dateDebut &&
    filters.dateFin
  ) {
    return `${filters.dateDebut} → ${filters.dateFin}`;
  }

  return "Période personnalisée";

}, [filters]);


/* ========================================================
RENDER
======================================================== */

return (

<div className="space-y-8 pb-10">

  {/* ====================================================
      HEADER
  ===================================================== */}

  <div className="relative overflow-hidden rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm lg:p-8">

    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">

            <Activity size={24} />

          </div>

          <div>

            <h1 className="text-2xl font-bold lg:text-3xl">

              Rapports hospitaliers

            </h1>

            <p className="text-sm text-base-content/60">

              Analyse financière et performance hospitalière

            </p>

          </div>

        </div>

        <div className="mt-5 flex items-center gap-2">

          <span className="badge badge-primary badge-outline gap-2">

            <Calendar size={14} />

            {periodeLabel}

          </span>

        </div>

      </div>

      <div className="flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() =>
            setShowFilters(
              !showFilters
            )
          }
          className="btn btn-outline gap-2"
        >

          <Filter size={18} />

          Filtres

          {activeFiltersCount > 0 && (

            <span className="badge badge-primary badge-sm">

              {activeFiltersCount}

            </span>

          )}

          <ChevronDown
            size={16}
            className={
              showFilters
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />

        </button>

        <button
          type="button"
          onClick={loadRapport}
          disabled={loading}
          className="btn btn-primary gap-2 shadow-md"
        >

          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Actualiser

        </button>

      </div>

    </div>

  </div>

  {/* ====================================================
      PERIODES RAPIDES
  ===================================================== */}

  <div className="card border border-base-200 bg-base-100 shadow-sm">

    <div className="card-body gap-4 p-5">

      <div className="flex items-center gap-2">

        <Calendar
          size={18}
          className="text-primary"
        />

        <h2 className="font-semibold">

          Période du rapport

        </h2>

      </div>

      <div className="flex flex-wrap gap-2">

        {periodes.map(
          (item) => (

            <button
              key={item.value}
              type="button"
              onClick={() =>
                setFilters({
                  ...filters,
                  periode: item.value,
                  dateDebut: undefined,
                  dateFin: undefined,
                })
              }
              className={`btn btn-sm ${
                filters.periode === item.value
                  ? "btn-primary shadow-sm"
                  : "btn-ghost border border-base-300"
              }`}
            >

              {item.label}

            </button>

          )
        )}

      </div>

    </div>

  </div>

  {/* ====================================================
      FILTRES AVANCES
  ===================================================== */}

  {showFilters && (

    <div className="card border border-primary/20 bg-base-100 shadow-md">

      <div className="card-body">

        <div className="mb-6 flex flex-col gap-4 border-b border-base-200 pb-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Filter
                size={20}
                className="text-primary"
              />

              <h2 className="text-lg font-bold">

                Filtres avancés

              </h2>

            </div>

            <p className="mt-1 text-sm text-base-content/60">

              Personnalisez précisément votre rapport

            </p>

          </div>

          <button
            type="button"
            className="btn btn-sm btn-ghost text-error"
            onClick={resetFilters}
          >

            <X size={16} />

            Réinitialiser

          </button>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* DATE DEBUT */}

          <label className="form-control">

            <div className="label">

              <span className="label-text font-medium">

                Date de début

              </span>

            </div>

            <input
              type="date"
              value={
                filters.dateDebut ||
                ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  periode: "",
                  dateDebut:
                    e.target.value ||
                    undefined,
                })
              }
              className="input input-bordered w-full focus:input-primary"
            />

          </label>

          {/* DATE FIN */}

          <label className="form-control">

            <div className="label">

              <span className="label-text font-medium">

                Date de fin

              </span>

            </div>

            <input
              type="date"
              value={
                filters.dateFin ||
                ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  periode: "",
                  dateFin:
                    e.target.value ||
                    undefined,
                })
              }
              className="input input-bordered w-full focus:input-primary"
            />

          </label>

          {/* SERVICE */}

          <label className="form-control">

            <div className="label">

              <span className="label-text font-medium">

                Service

              </span>

            </div>

            <select
              className="select select-bordered w-full focus:select-primary"
              value={
                filters.serviceId ||
                ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  serviceId:
                    e.target.value
                      ? Number(
                          e.target.value
                        )
                      : undefined,
                })
              }
            >

              <option value="">

                Tous les services

              </option>

              {services.map(
                (service) => (

                  <option
                    key={service.id}
                    value={service.id}
                  >

                    {service.nom}

                  </option>

                )
              )}

            </select>

          </label>

          {/* MEDECIN */}

          <label className="form-control">

            <div className="label">

              <span className="label-text font-medium">

                Médecin

              </span>

            </div>

            <select
              className="select select-bordered w-full focus:select-primary"
              value={
                filters.medecinId ||
                ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  medecinId:
                    e.target.value
                      ? Number(
                          e.target.value
                        )
                      : undefined,
                })
              }
            >

              <option value="">

                Tous les médecins

              </option>

              {medecins.map(
                (medecin) => (

                  <option
                    key={medecin.id}
                    value={medecin.id}
                  >

                    Dr.{" "}

                    {medecin.nom}{" "}

                    {medecin.postNom || ""}{" "}

                    {medecin.prenom || ""}

                  </option>

                )
              )}

            </select>

          </label>

        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-base-200 pt-5">

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              setShowFilters(false)
            }
          >

            Fermer

          </button>

          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={loadRapport}
            disabled={loading}
          >

            {loading ? (

              <RefreshCw
                size={18}
                className="animate-spin"
              />

            ) : (

              <Search size={18} />

            )}

            Générer le rapport

          </button>

        </div>

      </div>

    </div>

  )}

  {/* ====================================================
      FINANCIER
  ===================================================== */}

  <section>

    <div className="mb-5">

      <div className="flex items-center gap-2">

        <Wallet
          className="text-primary"
          size={22}
        />

        <h2 className="text-xl font-bold">

          Performance financière

        </h2>

      </div>

      <p className="mt-1 text-sm text-base-content/60">

        Situation financière sur la période sélectionnée

      </p>

    </div>

    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

      <FinancialCard
        title="Facturation"
        value={
          resume.totalFacture || 0
        }
        icon={<FileText size={23} />}
        description="Montant total facturé"
      />

      <FinancialCard
        title="Encaissements"
        value={
          resume.totalPaiements || 0
        }
        icon={<Wallet size={23} />}
        description="Paiements reçus"
      />

      <FinancialCard
        title="Reste à payer"
        value={
          resume.totalReste || 0
        }
        icon={<CreditCard size={23} />}
        description="Créances restantes"
      />

      <FinancialCard
        title="Proformas"
        value={
          resume.totalProforma || 0
        }
        icon={<DollarSign size={23} />}
        description="Montant des proformas"
      />

    </div>

  </section>

  {/* ====================================================
      ACTIVITE
  ===================================================== */}

  <section>

    <div className="mb-5 flex items-center gap-2">

      <Activity
        size={22}
        className="text-primary"
      />

      <div>

        <h2 className="text-xl font-bold">

          Activité hospitalière

        </h2>

        <p className="text-sm text-base-content/60">

          Indicateurs de performance médicale

        </p>

      </div>

    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

      <MiniStat
        title="Patients"
        value={
          resume.patients || 0
        }
        icon={<Users size={21} />}
      />

      <MiniStat
        title="Admissions"
        value={
          resume.admissions || 0
        }
        icon={<Hospital size={21} />}
      />

      <MiniStat
        title="Consultations"
        value={
          resume.consultations || 0
        }
        icon={<Stethoscope size={21} />}
      />

      <MiniStat
        title="Hospitalisations"
        value={
          resume.hospitalisations || 0
        }
        icon={<Hospital size={21} />}
      />

      <MiniStat
        title="Laboratoire"
        value={
          resume.laboratoire || 0
        }
        icon={<FlaskConical size={21} />}
      />

      <MiniStat
        title="Imagerie"
        value={
          resume.imagerie || 0
        }
        icon={<Image size={21} />}
      />

    </div>

  </section>

  {/* ====================================================
      DERNIERS PAIEMENTS
  ===================================================== */}

  <section className="card overflow-hidden border border-base-200 bg-base-100 shadow-sm">

    <div className="flex flex-col gap-3 border-b border-base-200 p-6 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h2 className="text-lg font-bold">

          Derniers paiements

        </h2>

        <p className="text-sm text-base-content/60">

          Les 10 derniers encaissements enregistrés

        </p>

      </div>

      <div className="badge badge-primary badge-outline">

        {rapport?.paiements?.length || 0} paiement(s)

      </div>

    </div>

    <div className="overflow-x-auto">

      <table className="table">

        <thead className="bg-base-200/50">

          <tr>

            <th>Référence</th>

            <th>Patient</th>

            <th>Montant</th>

            <th>Mode</th>

            <th>Date</th>

          </tr>

        </thead>

        <tbody>

          {rapport?.paiements?.length ? (

            rapport.paiements
              .slice(0, 10)
              .map(
                (paiement: any) => (

                  <tr
                    key={paiement.id}
                    className="hover"
                  >

                    <td>

                      <span className="font-semibold">

                        {paiement.reference}

                      </span>

                    </td>

                    <td>

                      <div className="font-medium">

                        {paiement.patient?.nom || "—"}

                      </div>

                      <div className="text-xs text-base-content/50">

                        {paiement.patient?.numeroDossier || ""}

                      </div>

                    </td>

                    <td>

                      <span className="font-semibold text-success">

                        {formatCurrency(
                          paiement.montant,
                          paiement.devise
                        )}

                      </span>

                    </td>

                    <td>

                      <span className="badge badge-outline">

                        {paiement.modePaiement}

                      </span>

                    </td>

                    <td className="text-sm text-base-content/70">

                      {new Date(
                        paiement.datePaiement
                      ).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}

                    </td>

                  </tr>

                )
              )

          ) : (

            <tr>

              <td
                colSpan={5}
                className="py-12 text-center text-base-content/50"
              >

                Aucun paiement trouvé pour cette période.

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  </section>

</div>


);

}

/* ==========================================================
FORMAT CURRENCY
========================================================== */

function formatCurrency(
value: number,
devise = "USD"
) {

return new Intl.NumberFormat(
"fr-FR",
{
style: "currency",
currency: devise,
maximumFractionDigits: 2,
}
).format(
value || 0
);

}

/* ==========================================================
FINANCIAL CARD
========================================================== */

function FinancialCard({
title,
value,
icon,
description,
}: {
title: string;
value: number;
icon: React.ReactNode;
description: string;
}) {

return (


<div className="group relative overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

  <div className="relative">

    <div className="flex items-start justify-between">

      <div>

        <p className="text-sm font-medium text-base-content/60">

          {title}

        </p>

        <p className="mt-3 text-2xl font-bold lg:text-3xl">

          {formatCurrency(value)}

        </p>

      </div>

      <div className="rounded-2xl bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:scale-110">

        {icon}

      </div>

    </div>

    <p className="mt-4 text-xs text-base-content/50">

      {description}

    </p>

  </div>

</div>


);

}

/* ==========================================================
MINI STAT
========================================================== */

function MiniStat({
title,
value,
icon,
}: {
title: string;
value: number;
icon: React.ReactNode;
}) {

return (


<div className="group rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">

  <div className="flex items-start justify-between">

    <div>

      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">

        {title}

      </p>

      <p className="mt-3 text-3xl font-bold">

        {Number(
          value || 0
        ).toLocaleString(
          "fr-FR"
        )}

      </p>

    </div>

    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

      {icon}

    </div>

  </div>

</div>


);

}
