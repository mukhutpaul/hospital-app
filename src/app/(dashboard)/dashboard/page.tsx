import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import {
  Users,
  CalendarDays,
  Bed,
  Receipt,
  UserPlus,
  Stethoscope,
  FlaskConical,
  CreditCard,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // Protection de la page
  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name || "Utilisateur";

  return (
    <div className="space-y-6">

      {/* =========================================
          EN-TÊTE
      ========================================= */}

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Tableau de bord
        </h1>

        <p className="text-base-content/60 mt-1">
          Bienvenue, {userName}
        </p>
      </div>

      {/* =========================================
          STATISTIQUES PRINCIPALES
      ========================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* PATIENTS */}

        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200">

          <div className="stat-figure text-primary">
            <div className="bg-primary/10 rounded-full p-3">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-title">
            Patients
          </div>

          <div className="stat-value text-primary">
            0
          </div>

          <div className="stat-desc">
            Patients enregistrés
          </div>

        </div>

        {/* RENDEZ-VOUS */}

        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200">

          <div className="stat-figure text-secondary">
            <div className="bg-secondary/10 rounded-full p-3">
              <CalendarDays size={24} />
            </div>
          </div>

          <div className="stat-title">
            Rendez-vous
          </div>

          <div className="stat-value text-secondary">
            0
          </div>

          <div className="stat-desc">
            Rendez-vous aujourd'hui
          </div>

        </div>

        {/* HOSPITALISATIONS */}

        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200">

          <div className="stat-figure text-accent">
            <div className="bg-accent/10 rounded-full p-3">
              <Bed size={24} />
            </div>
          </div>

          <div className="stat-title">
            Hospitalisés
          </div>

          <div className="stat-value text-accent">
            0
          </div>

          <div className="stat-desc">
            Patients actuellement hospitalisés
          </div>

        </div>

        {/* FACTURES */}

        <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-200">

          <div className="stat-figure text-info">
            <div className="bg-info/10 rounded-full p-3">
              <Receipt size={24} />
            </div>
          </div>

          <div className="stat-title">
            Factures
          </div>

          <div className="stat-value text-info">
            0
          </div>

          <div className="stat-desc">
            Factures en attente
          </div>

        </div>

      </div>

      {/* =========================================
          ACCÈS RAPIDES
      ========================================= */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h2 className="text-lg font-bold">
            Accès rapides
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* NOUVEAU PATIENT */}

          <a
            href="/patients"
            className="card bg-base-100 border border-base-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="card-body p-4">

              <UserPlus
                size={22}
                className="text-primary"
              />

              <h3 className="font-semibold">
                Nouveau patient
              </h3>

              <p className="text-xs text-base-content/60">
                Enregistrer un patient
              </p>

            </div>
          </a>

          {/* RENDEZ-VOUS */}

          <a
            href="/rendez-vous"
            className="card bg-base-100 border border-base-200 hover:border-secondary hover:shadow-md transition-all"
          >
            <div className="card-body p-4">

              <CalendarDays
                size={22}
                className="text-secondary"
              />

              <h3 className="font-semibold">
                Rendez-vous
              </h3>

              <p className="text-xs text-base-content/60">
                Planifier un rendez-vous
              </p>

            </div>
          </a>

          {/* CONSULTATION */}

          <a
            href="/consultations"
            className="card bg-base-100 border border-base-200 hover:border-accent hover:shadow-md transition-all"
          >
            <div className="card-body p-4">

              <Stethoscope
                size={22}
                className="text-accent"
              />

              <h3 className="font-semibold">
                Consultation
              </h3>

              <p className="text-xs text-base-content/60">
                Nouvelle consultation
              </p>

            </div>
          </a>

          {/* PAIEMENT */}

          <a
            href="/paiements"
            className="card bg-base-100 border border-base-200 hover:border-info hover:shadow-md transition-all"
          >
            <div className="card-body p-4">

              <CreditCard
                size={22}
                className="text-info"
              />

              <h3 className="font-semibold">
                Paiement
              </h3>

              <p className="text-xs text-base-content/60">
                Enregistrer un paiement
              </p>

            </div>
          </a>

        </div>

      </div>

      {/* =========================================
          ACTIVITÉS
      ========================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ACTIVITÉ MÉDICALE */}

        <div className="xl:col-span-2 card bg-base-100 shadow-sm border border-base-200">

          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="card-title">
                  Activité médicale
                </h2>

                <p className="text-sm text-base-content/60">
                  Vue globale de l'activité médicale
                </p>

              </div>

              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Activity size={22} />
              </div>

            </div>

            {/* PLACEHOLDER GRAPHIQUE */}

            <div className="mt-6 h-64 rounded-xl bg-base-200 flex items-center justify-center">

              <div className="text-center">

                <Stethoscope
                  size={40}
                  className="mx-auto text-base-content/30"
                />

                <p className="mt-3 font-medium">
                  Statistiques médicales
                </p>

                <p className="text-sm text-base-content/50">
                  Les données apparaîtront ici
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ACTIVITÉ FINANCIÈRE */}

        <div className="card bg-base-100 shadow-sm border border-base-200">

          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="card-title">
                  Activité financière
                </h2>

                <p className="text-sm text-base-content/60">
                  Situation financière
                </p>

              </div>

              <div className="bg-info/10 text-info rounded-full p-3">
                <Receipt size={22} />
              </div>

            </div>

            {/* FINANCES */}

            <div className="space-y-4 mt-5">

              <div className="flex items-center justify-between">

                <span className="text-sm">
                  Chiffre d'affaires
                </span>

                <span className="font-bold">
                  $0
                </span>

              </div>

              <progress
                className="progress progress-primary w-full"
                value={0}
                max={100}
              />

              <div className="flex items-center justify-between">

                <span className="text-sm">
                  Paiements
                </span>

                <span className="font-bold">
                  $0
                </span>

              </div>

              <progress
                className="progress progress-info w-full"
                value={0}
                max={100}
              />

              <div className="flex items-center justify-between">

                <span className="text-sm">
                  Impayés
                </span>

                <span className="font-bold">
                  $0
                </span>

              </div>

              <progress
                className="progress progress-error w-full"
                value={0}
                max={100}
              />

            </div>

            <div className="card-actions justify-end mt-4">

              <a
                href="/facturation"
                className="btn btn-ghost btn-sm"
              >
                Voir les factures
                <ArrowUpRight size={15} />
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          ÉTAT DES SERVICES
      ========================================= */}

      <div className="card bg-base-100 shadow-sm border border-base-200">

        <div className="card-body">

          <h2 className="card-title">
            État des services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">

            <ServiceStatus
              name="Consultations"
              status="Opérationnel"
              color="success"
            />

            <ServiceStatus
              name="Laboratoire"
              status="Opérationnel"
              color="success"
            />

            <ServiceStatus
              name="Imagerie"
              status="Opérationnel"
              color="success"
            />

            <ServiceStatus
              name="Pharmacie"
              status="Opérationnel"
              color="success"
            />

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================
   SERVICE STATUS
========================================= */

function ServiceStatus({
  name,
  status,
  color,
}: {
  name: string;
  status: string;
  color: "success" | "warning" | "error";
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-base-200">

      <div>

        <p className="font-medium">
          {name}
        </p>

        <p className="text-xs text-base-content/50">
          Service hospitalier
        </p>

      </div>

      <div className="flex items-center gap-2">

        <span
          className={`w-2.5 h-2.5 rounded-full bg-${color}`}
        />

        <span className="text-xs font-medium">
          {status}
        </span>

      </div>

    </div>
  );
}