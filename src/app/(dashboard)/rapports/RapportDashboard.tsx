"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Hospital,
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

export default function RapportDashboard({
  initialRapport,
  services,
  medecins,
}: Props) {

  const [
    rapport,
    setRapport,
  ] = useState(
    initialRapport
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    filters,
    setFilters,
  ] = useState<RapportFilter>({
    periode: "MOIS",
  });

  /* ========================================================
     CHARGER RAPPORT
  ======================================================== */

  async function loadRapport() {

    try {

      setLoading(true);

      const data =
        await getRapportGlobal(
          filters
        );

      setRapport(data);

      toast.success(
        "Rapport actualisé"
      );

    } catch {

      toast.error(
        "Impossible de charger le rapport"
      );

    } finally {

      setLoading(false);

    }
  }

  /* ========================================================
     RESET
  ======================================================== */

  function resetFilters() {

    const newFilters = {
      periode: "MOIS",
    };

    setFilters(
      newFilters
    );

  }

  useEffect(() => {

    loadRapport();

  }, [
    filters.periode,
  ]);

  const resume =
    rapport.resume;

  return (

    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold">

            Rapports hospitaliers

          </h1>

          <p className="text-sm text-base-content/60">

            Analyse financière et activité de l'hôpital

          </p>

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
            className="btn btn-outline"
          >

            <Filter size={18} />

            Filtres

          </button>

          <button
            type="button"
            onClick={
              loadRapport
            }
            disabled={
              loading
            }
            className="btn btn-primary"
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

      {/* ====================================================
          FILTRES RAPIDES
      ===================================================== */}

      <div className="flex flex-wrap gap-2">

        {[
          {
            value:
              "AUJOURDHUI",
            label:
              "Aujourd'hui",
          },

          {
            value:
              "HIER",
            label:
              "Hier",
          },

          {
            value:
              "SEMAINE",
            label:
              "Cette semaine",
          },

          {
            value:
              "MOIS",
            label:
              "Ce mois",
          },

          {
            value:
              "ANNEE",
            label:
              "Cette année",
          },

        ].map(
          (item) => (

            <button
              key={
                item.value
              }

              type="button"

              onClick={() =>
                setFilters({
                  ...filters,

                  periode:
                    item.value,
                })
              }

              className={`btn btn-sm ${
                filters.periode ===
                item.value
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >

              {item.label}

            </button>

          )
        )}

      </div>

      {/* ====================================================
          FILTRES AVANCES
      ===================================================== */}

      {showFilters && (

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <div className="flex justify-between items-center mb-4">

              <h2 className="font-semibold">

                Filtres avancés

              </h2>

              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={
                  resetFilters
                }
              >

                <X size={16} />

                Réinitialiser

              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* DATE DEBUT */}

              <label className="form-control">

                <span className="label-text mb-1">

                  Date début

                </span>

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
                        e.target.value,
                    })
                  }

                  className="input input-bordered"
                />

              </label>

              {/* DATE FIN */}

              <label className="form-control">

                <span className="label-text mb-1">

                  Date fin

                </span>

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
                        e.target.value,
                    })
                  }

                  className="input input-bordered"
                />

              </label>

              {/* SERVICE */}

              <label className="form-control">

                <span className="label-text mb-1">

                  Service

                </span>

                <select
                  className="select select-bordered"

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
                              e.target
                                .value
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
                        key={
                          service.id
                        }

                        value={
                          service.id
                        }
                      >

                        {service.nom}

                      </option>

                    )
                  )}

                </select>

              </label>

              {/* MEDECIN */}

              <label className="form-control">

                <span className="label-text mb-1">

                  Médecin

                </span>

                <select
                  className="select select-bordered"

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
                              e.target
                                .value
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
                        key={
                          medecin.id
                        }

                        value={
                          medecin.id
                        }
                      >

                        Dr.{" "}

                        {medecin.nom}{" "}

                        {
                          medecin.postNom
                        }

                      </option>

                    )
                  )}

                </select>

              </label>

            </div>

            <div className="mt-5 flex justify-end">

              <button
                type="button"

                className="btn btn-primary"

                onClick={
                  loadRapport
                }

                disabled={
                  loading
                }
              >

                <Search
                  size={18}
                />

                Générer le rapport

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ====================================================
          RAPPORT FINANCIER
      ===================================================== */}

      <div>

        <div className="mb-4">

          <h2 className="text-lg font-bold">

            Rapport financier

          </h2>

          <p className="text-sm text-base-content/60">

            Vue globale des revenus et factures

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <StatCard
            title="Facturation"
            value={resume.totalFacture}
            icon={
              <FileText />
            }
            suffix="USD"
          />

          <StatCard
            title="Encaissements"
            value={resume.totalPaiements}
            icon={
              <Wallet />
            }
            suffix="USD"
          />

          <StatCard
            title="Reste à payer"
            value={resume.totalReste}
            icon={
              <CreditCard />
            }
            suffix="USD"
          />

          <StatCard
            title="Proformas"
            value={resume.totalProforma}
            icon={
              <DollarSign />
            }
            suffix="USD"
          />

        </div>

      </div>

      {/* ====================================================
          ACTIVITE HOSPITALIERE
      ===================================================== */}

      <div>

        <div className="mb-4">

          <h2 className="text-lg font-bold">

            Activité hospitalière

          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          <MiniStat
            title="Patients"
            value={
              resume.patients
            }

            icon={
              <Users size={20} />
            }
          />

          <MiniStat
            title="Admissions"
            value={
              resume.admissions
            }

            icon={
              <Hospital size={20} />
            }
          />

          <MiniStat
            title="Consultations"
            value={
              resume.consultations
            }

            icon={
              <Stethoscope size={20} />
            }
          />

          <MiniStat
            title="Hospitalisations"
            value={
              resume.hospitalisations
            }

            icon={
              <Hospital size={20} />
            }
          />

          <MiniStat
            title="Laboratoire"
            value={
              resume.laboratoire
            }

            icon={
              <FileText size={20} />
            }
          />

          <MiniStat
            title="Imagerie"
            value={
              resume.imagerie
            }

            icon={
              <Search size={20} />
            }
          />

        </div>

      </div>

      {/* ====================================================
          TABLEAU PAIEMENTS
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body p-0">

          <div className="p-5 border-b border-base-200">

            <h2 className="font-bold">

              Derniers paiements

            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="table">

              <thead>

                <tr>

                  <th>Référence</th>

                  <th>Patient</th>

                  <th>Montant</th>

                  <th>Mode</th>

                  <th>Date</th>

                </tr>

              </thead>

              <tbody>

                {rapport.paiements
                  .slice(0, 10)
                  .map(
                    (
                      paiement: any
                    ) => (

                      <tr
                        key={
                          paiement.id
                        }
                      >

                        <td className="font-medium">

                          {
                            paiement.reference
                          }

                        </td>

                        <td>

                          {
                            paiement
                              .patient
                              ?.nom
                          }

                        </td>

                        <td className="font-semibold">

                          {new Intl.NumberFormat(
                            "fr-FR",
                            {
                              style:
                                "currency",

                              currency:
                                paiement.devise ||
                                "USD",
                            }
                          ).format(
                            paiement.montant
                          )}

                        </td>

                        <td>

                          <span className="badge badge-outline">

                            {
                              paiement.modePaiement
                            }

                          </span>

                        </td>

                        <td>

                          {new Date(
                            paiement.datePaiement
                          ).toLocaleDateString(
                            "fr-FR"
                          )}

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   STAT CARD
========================================================== */

function StatCard({
  title,
  value,
  icon,
  suffix,
}: {
  title: string;

  value: number;

  icon: React.ReactNode;

  suffix?: string;
}) {

  return (

    <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">

      <div className="card-body">

        <div className="flex justify-between items-start">

          <div>

            <p className="text-sm text-base-content/60">

              {title}

            </p>

            <h3 className="text-2xl font-bold mt-2">

              {value.toLocaleString(
                "fr-FR"
              )}

              {suffix &&
                ` ${suffix}`}

            </h3>

          </div>

          <div className="p-3 rounded-xl bg-primary/10 text-primary">

            {icon}

          </div>

        </div>

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

    <div className="card bg-base-100 border border-base-200">

      <div className="card-body p-5">

        <div className="flex justify-between">

          <div>

            <p className="text-xs text-base-content/60">

              {title}

            </p>

            <p className="text-2xl font-bold mt-1">

              {value}

            </p>

          </div>

          <div className="text-primary">

            {icon}

          </div>

        </div>

      </div>

    </div>
  );
}