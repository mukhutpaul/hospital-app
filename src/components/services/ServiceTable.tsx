"use client";

import { useMemo, useState } from "react";

import {
  Search,
  Building2,
  Users,
  Stethoscope,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ServiceActions from "./ServiceActions";

type Service = {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  actif: boolean;
  departementId: number | null;

  departement: {
    id: number;
    code: string | null;
    nom: string;
  } | null;

  _count: {
    employes: number;
    medecins: number;
    rendezVous: number;
    admissions: number;
    consultations: number;
    hospitalisations: number;
    chambres: number;
    demandesLabo: number;
    demandesImagerie: number;
  };
};

type Props = {
  services: Service[];
};

const ELEMENTS_PAR_PAGE = 10;

export default function ServiceTable({
  services,
}: Props) {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<
    "TOUS" | "ACTIF" | "INACTIF"
  >("TOUS");

  const [page, setPage] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | FILTRAGE
  |--------------------------------------------------------------------------
  */

  const servicesFiltres = useMemo(() => {
    const terme = search
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const correspondRecherche =
        !terme ||
        service.code
          .toLowerCase()
          .includes(terme) ||
        service.nom
          .toLowerCase()
          .includes(terme) ||
        service.departement?.nom
          .toLowerCase()
          .includes(terme);

      const correspondStatut =
        statut === "TOUS" ||
        (statut === "ACTIF" && service.actif) ||
        (statut === "INACTIF" && !service.actif);

      return (
        correspondRecherche &&
        correspondStatut
      );
    });
  }, [services, search, statut]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      servicesFiltres.length /
        ELEMENTS_PAR_PAGE
    )
  );

  const pageActuelle = Math.min(
    page,
    totalPages
  );

  const servicesPage = servicesFiltres.slice(
    (pageActuelle - 1) *
      ELEMENTS_PAR_PAGE,
    pageActuelle *
      ELEMENTS_PAR_PAGE
  );

  /*
  |--------------------------------------------------------------------------
  | STATISTIQUES
  |--------------------------------------------------------------------------
  */

  const totalActifs = services.filter(
    (service) => service.actif
  ).length;

  const totalInactifs =
    services.length - totalActifs;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-4">

      {/* STATISTIQUES */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">

          <div className="stat-figure text-primary">
            <Building2 size={28} />
          </div>

          <div className="stat-title">
            Total services
          </div>

          <div className="stat-value text-primary">
            {services.length}
          </div>

        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">

          <div className="stat-figure text-success">
            <CheckCircle2 size={28} />
          </div>

          <div className="stat-title">
            Actifs
          </div>

          <div className="stat-value text-success">
            {totalActifs}
          </div>

        </div>

        <div className="stat bg-base-100 border border-base-200 rounded-box shadow-sm">

          <div className="stat-figure text-error">
            <XCircle size={28} />
          </div>

          <div className="stat-title">
            Inactifs
          </div>

          <div className="stat-value text-error">
            {totalInactifs}
          </div>

        </div>

      </div>

      {/* FILTRES */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col lg:flex-row gap-3 justify-between">

            {/* RECHERCHE */}

            <label className="input input-bordered flex items-center gap-2 w-full lg:max-w-md">

              <Search
                size={18}
                className="text-base-content/50"
              />

              <input
                type="text"
                placeholder="Rechercher un service..."
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setPage(1);
                }}
                className="grow"
              />

            </label>

            {/* STATUT */}

            <select
              className="select select-bordered"
              value={statut}
              onChange={(event) => {
                setStatut(
                  event.target.value as
                    | "TOUS"
                    | "ACTIF"
                    | "INACTIF"
                );
                setPage(1);
              }}
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="ACTIF">
                Actifs
              </option>

              <option value="INACTIF">
                Inactifs
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* TABLE */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body p-0">

          <div className="overflow-x-auto">

            <table className="table table-zebra">

              <thead>
                <tr>

                  <th>Service</th>

                  <th>Département</th>

                  <th>Personnel</th>

                  <th>Médecins</th>

                  <th>Statut</th>

                  <th className="text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {servicesPage.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-2 text-base-content/50">

                        <Building2
                          size={40}
                        />

                        <p className="font-medium">
                          Aucun service trouvé
                        </p>

                        <p className="text-sm">
                          Aucun service ne
                          correspond aux
                          critères de recherche.
                        </p>

                      </div>
                    </td>
                  </tr>
                ) : (
                  servicesPage.map(
                    (service) => (
                      <tr
                        key={service.id}
                      >

                        {/* SERVICE */}

                        <td>

                          <div className="flex items-center gap-3">

                            <div className="avatar placeholder">

                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">

                                <Building2
                                  size={19}
                                />

                              </div>

                            </div>

                            <div>

                              <div className="font-semibold">
                                {service.nom}
                              </div>

                              <div className="text-xs text-base-content/50">
                                {service.code}
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* DEPARTEMENT */}

                        <td>

                          {service.departement ? (
                            <div>

                              <div className="font-medium">
                                {
                                  service
                                    .departement
                                    .nom
                                }
                              </div>

                              {service
                                .departement
                                .code && (
                                <div className="text-xs text-base-content/50">
                                  {
                                    service
                                      .departement
                                      .code
                                  }
                                </div>
                              )}

                            </div>
                          ) : (
                            <span className="text-base-content/40">
                              Aucun département
                            </span>
                          )}

                        </td>

                        {/* PERSONNEL */}

                        <td>

                          <div className="flex items-center gap-2">

                            <Users
                              size={16}
                              className="text-base-content/50"
                            />

                            <span>
                              {
                                service
                                  ._count
                                  .employes
                              }
                            </span>

                          </div>

                        </td>

                        {/* MÉDECINS */}

                        <td>

                          <div className="flex items-center gap-2">

                            <Stethoscope
                              size={16}
                              className="text-base-content/50"
                            />

                            <span>
                              {
                                service
                                  ._count
                                  .medecins
                              }
                            </span>

                          </div>

                        </td>

                        {/* STATUT */}

                        <td>

                          {service.actif ? (
                            <span className="badge badge-success gap-1">
                              <CheckCircle2
                                size={13}
                              />
                              Actif
                            </span>
                          ) : (
                            <span className="badge badge-error gap-1">
                              <XCircle
                                size={13}
                              />
                              Inactif
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td>
                          <ServiceActions
                            id={service.id}
                            actif={
                              service.actif
                            }
                          />
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          {servicesFiltres.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-base-200">

              <p className="text-sm text-base-content/60">

                {servicesFiltres.length}{" "}
                service
                {servicesFiltres.length >
                1
                  ? "s"
                  : ""}

              </p>

              <div className="join">

                <button
                  className="join-item btn btn-sm"
                  disabled={
                    pageActuelle === 1
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.max(
                          1,
                          previous - 1
                        )
                    )
                  }
                >
                  <ChevronLeft
                    size={17}
                  />
                </button>

                <button className="join-item btn btn-sm pointer-events-none">
                  Page {pageActuelle} /{" "}
                  {totalPages}
                </button>

                <button
                  className="join-item btn btn-sm"
                  disabled={
                    pageActuelle ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        Math.min(
                          totalPages,
                          previous + 1
                        )
                    )
                  }
                >
                  <ChevronRight
                    size={17}
                  />
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}