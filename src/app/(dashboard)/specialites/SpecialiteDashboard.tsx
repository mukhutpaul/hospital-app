"use client";

import {
useMemo,
useState,
} from "react";

import {
Activity,
Filter,
Plus,
Search,
Stethoscope,
Users,
X,
} from "lucide-react";
import SpecialiteModal from "./SpecialiteModal";
import SpecialiteTable from "./SpecialiteTable";



type Specialite = any;

type Props = {
specialites: Specialite[];

services: {
id: number;
code: string;
nom: string;
}[];
};

export default function SpecialiteDashboard({
specialites,
services,
}: Props) {

const [
search,
setSearch,
] = useState("");

const [
serviceFilter,
setServiceFilter,
] = useState("");

const [
statusFilter,
setStatusFilter,
] = useState<
"TOUS" | "ACTIF" | "INACTIF"

> ("TOUS");

const [
showFilters,
setShowFilters,
] = useState(false);

const [
modalOpen,
setModalOpen,
] = useState(false);

const [
selected,
setSelected,
] = useState<Specialite | null>(
null
);

const filtered =
useMemo(() => {


  return specialites.filter(
    (specialite) => {

      const searchValue =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !searchValue ||
        specialite.nom
          .toLowerCase()
          .includes(searchValue) ||
        specialite.code
          .toLowerCase()
          .includes(searchValue) ||
        specialite.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesService =
        !serviceFilter ||
        String(
          specialite.serviceId
        ) === serviceFilter;

      const matchesStatus =
        statusFilter === "TOUS" ||
        (
          statusFilter === "ACTIF" &&
          specialite.actif
        ) ||
        (
          statusFilter === "INACTIF" &&
          !specialite.actif
        );

      return (
        matchesSearch &&
        matchesService &&
        matchesStatus
      );

    }
  );

}, [
  specialites,
  search,
  serviceFilter,
  statusFilter,
]);


const total =
specialites.length;

const actifs =
specialites.filter(
(item) =>
item.actif
).length;

const inactifs =
total - actifs;

const medecins =
specialites.reduce(
(
total: number,
item: any
) =>
total +
(
item._count
?.medecins || 0
),
0
);

function openCreate() {


setSelected(null);

setModalOpen(true);


}

function openEdit(
specialite: Specialite
) {


setSelected(
  specialite
);

setModalOpen(true);


}

return (


<div className="space-y-7 pb-10">

  {/* HEADER */}

  <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm lg:p-8">

    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">

          <Stethoscope
            size={28}
          />

        </div>

        <div>

          <h1 className="text-2xl font-bold lg:text-3xl">

            Spécialités médicales

          </h1>

          <p className="mt-1 text-sm text-base-content/60">

            Gérez les spécialités médicales disponibles dans l'hôpital.

          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={openCreate}
        className="btn btn-primary gap-2"
      >

        <Plus size={19} />

        Nouvelle spécialité

      </button>

    </div>

  </div>

  {/* STATISTIQUES */}

  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

    <Stat
      title="Total"
      value={total}
      icon={
        <Stethoscope
          size={20}
        />
      }
    />

    <Stat
      title="Actives"
      value={actifs}
      icon={
        <Activity
          size={20}
        />
      }
    />

    <Stat
      title="Inactives"
      value={inactifs}
      icon={
        <X size={20} />
      }
    />

    <Stat
      title="Médecins affectés"
      value={medecins}
      icon={
        <Users size={20} />
      }
    />

  </div>

  {/* RECHERCHE */}

  <div className="card border border-base-200 bg-base-100 shadow-sm">

    <div className="card-body p-4">

      <div className="flex flex-col gap-3 lg:flex-row">

        <label className="input input-bordered flex flex-1 items-center gap-3">

          <Search
            size={19}
            className="text-base-content/40"
          />

          <input
            type="text"
            placeholder="Rechercher par code, nom ou description..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="grow"
          />

          {search && (

            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="btn btn-circle btn-ghost btn-xs"
            >

              <X size={15} />

            </button>

          )}

        </label>

        <button
          type="button"
          onClick={() =>
            setShowFilters(
              !showFilters
            )
          }
          className={`btn gap-2 ${
            showFilters
              ? "btn-primary"
              : "btn-outline"
          }`}
        >

          <Filter size={18} />

          Filtres

        </button>

      </div>

      {showFilters && (

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-base-200 pt-4 md:grid-cols-2">

          <label className="form-control">

            <span className="label-text mb-2 text-sm font-medium">

              Service

            </span>

            <select
              className="select select-bordered"
              value={
                serviceFilter
              }
              onChange={(e) =>
                setServiceFilter(
                  e.target.value
                )
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

          <label className="form-control">

            <span className="label-text mb-2 text-sm font-medium">

              Statut

            </span>

            <select
              className="select select-bordered"
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "TOUS"
                    | "ACTIF"
                    | "INACTIF"
                )
              }
            >

              <option value="TOUS">

                Toutes

              </option>

              <option value="ACTIF">

                Actives uniquement

              </option>

              <option value="INACTIF">

                Inactives uniquement

              </option>

            </select>

          </label>

        </div>

      )}

    </div>

  </div>

  {/* RESULTATS */}

  <div className="flex items-center justify-between">

    <div>

      <h2 className="font-bold">

        Liste des spécialités

      </h2>

      <p className="text-sm text-base-content/60">

        {filtered.length} résultat(s)

      </p>

    </div>

    {(search ||
      serviceFilter ||
      statusFilter !== "TOUS") && (

      <button
        type="button"
        onClick={() => {

          setSearch("");

          setServiceFilter("");

          setStatusFilter(
            "TOUS"
          );

        }}
        className="btn btn-sm btn-ghost text-error"
      >

        <X size={15} />

        Effacer les filtres

      </button>

    )}

  </div>

  <SpecialiteTable
    specialites={filtered}
    onEdit={openEdit}
  />

  {/* MODAL */}

  <SpecialiteModal
    open={modalOpen}
    specialite={selected}
    services={services}
    onClose={() =>
      setModalOpen(false)
    }
  />

</div>


);

}

/* ==========================================================
STAT
========================================================== */

function Stat({
title,
value,
icon,
}: {
title: string;
value: number;
icon: React.ReactNode;
}) {

return (

<div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">

  <div className="flex items-center justify-between">

    <div>

      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">

        {title}

      </p>

      <p className="mt-2 text-2xl font-bold">

        {value.toLocaleString(
          "fr-FR"
        )}

      </p>

    </div>

    <div className="rounded-xl bg-primary/10 p-3 text-primary">

      {icon}

    </div>

  </div>

</div>


);

}
