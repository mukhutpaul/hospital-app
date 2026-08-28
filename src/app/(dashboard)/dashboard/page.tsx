import Link from "next/link";
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
  ScanLine,
  Wallet,
} from "lucide-react";

import { auth } from "@/lib/auth";

import { getDashboardData } from "@/app/actions/dashboard";
import ActiviteMedicaleChart from "@/components/ActiviteMedicaleChart";

/* =========================================================
   PAGE DASHBOARD
========================================================= */

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getDashboardData();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="alert alert-error">{result.message}</div>
      </div>
    );
  }

  const dashboard = result.data;

  const userName = session.user.name || "Utilisateur";

  const totalActivite =
    dashboard.consultationsAujourdhui +
    dashboard.examensLaboratoire +
    dashboard.examensImagerie;

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>

          <p className="text-base-content/60">Bienvenue, {userName}</p>
        </div>

        <div className="badge badge-primary badge-lg">Aujourd'hui</div>
      </div>

      {/* =====================================================
          STATISTIQUES PRINCIPALES
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* PATIENTS */}

        <DashboardStat
          title="Patients"
          value={dashboard.patients}
          description="Patients enregistrés"
          icon={<Users size={24} />}
          color="primary"
        />

        {/* RENDEZ-VOUS */}

        <DashboardStat
          title="Rendez-vous"
          value={dashboard.rendezVousAujourdhui}
          description="Aujourd'hui"
          icon={<CalendarDays size={24} />}
          color="secondary"
        />

        {/* HOSPITALISATIONS */}

        <DashboardStat
          title="Hospitalisés"
          value={dashboard.hospitalises}
          description="Patients actuellement hospitalisés"
          icon={<Bed size={24} />}
          color="accent"
        />

        {/* FACTURES */}

        <DashboardStat
          title="Factures"
          value={dashboard.facturesImpayees}
          description="Factures impayées ou partielles"
          icon={<Receipt size={24} />}
          color="info"
        />
      </div>

      {/* =====================================================
          ACCÈS RAPIDES
      ===================================================== */}

      <section>
        <h2 className="mb-3 text-lg font-bold">Accès rapides</h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickLink
            href="/patients"
            icon={<UserPlus size={22} />}
            title="Nouveau patient"
            description="Enregistrer un patient"
            color="primary"
          />

          <QuickLink
            href="/rendez-vous"
            icon={<CalendarDays size={22} />}
            title="Rendez-vous"
            description="Planifier un rendez-vous"
            color="secondary"
          />

          <QuickLink
            href="/consultations"
            icon={<Stethoscope size={22} />}
            title="Consultation"
            description="Nouvelle consultation"
            color="accent"
          />

          <QuickLink
            href="/paiements"
            icon={<CreditCard size={22} />}
            title="Paiement"
            description="Enregistrer un paiement"
            color="info"
          />
        </div>
      </section>

      {/* =====================================================
          ACTIVITÉ + FINANCES
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      
        {/* =====================================================
    ACTIVITÉ MÉDICALE
===================================================== */}
        <div className="card border border-base-200 bg-base-100 shadow-sm xl:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title">Activité médicale</h2>

                <p className="text-sm text-base-content/60">
                  Suivi et évolution de l'activité médicale
                </p>
              </div>

              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Activity size={22} />
              </div>
            </div>

            <div className="mt-6">
              <ActiviteMedicaleChart data={dashboard.activiteMedicale} />
            </div>
          </div>
        </div>
        
        {/* ACTIVITÉ FINANCIÈRE */}
        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title">Activité financière</h2>

                <p className="text-sm text-base-content/60">
                  Situation financière
                </p>
              </div>

              <div className="rounded-full bg-info/10 p-3 text-info">
                <Wallet size={22} />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {/* CHIFFRE D'AFFAIRES */}

              <FinanceLine
                label="Chiffre d'affaires"
                value={dashboard.chiffreAffaires}
                icon={<Receipt size={18} />}
              />

              {/* PAIEMENTS */}

              <FinanceLine
                label="Paiements aujourd'hui"
                value={dashboard.paiementsAujourdhui}
                icon={<CreditCard size={18} />}
              />

              {/* IMPAYÉS */}

              <FinanceLine
                label="Impayés"
                value={dashboard.impayes}
                icon={<Wallet size={18} />}
              />
            </div>

            <div className="card-actions mt-6 justify-end">
              <Link href="/facturation" className="btn btn-ghost btn-sm">
                Voir les factures
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Services hospitaliers</h2>

              <p className="text-sm text-base-content/60">
                Activité des services
              </p>
            </div>

            <Stethoscope size={22} className="text-primary" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl bg-base-200 p-4"
              >
                <div>
                  <p className="font-semibold">{service.nom}</p>

                  <p className="text-xs text-base-content/50">
                    {service.consultations} consultations
                  </p>
                </div>

                <span className="badge badge-success">Actif</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "accent" | "info";
}) {
  const styles = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/10",
    },

    secondary: {
      text: "text-secondary",
      bg: "bg-secondary/10",
    },

    accent: {
      text: "text-accent",
      bg: "bg-accent/10",
    },

    info: {
      text: "text-info",
      bg: "bg-info/10",
    },
  };

  const style = styles[color];

  return (
    <div className="stat rounded-xl border border-base-200 bg-base-100 shadow-sm">
      <div className={`stat-figure ${style.text}`}>
        <div className={`rounded-full p-3 ${style.bg}`}>{icon}</div>
      </div>

      <div className="stat-title">{title}</div>

      <div className={`stat-value ${style.text}`}>
        {value.toLocaleString("fr-FR")}
      </div>

      <div className="stat-desc">{description}</div>
    </div>
  );
}

/* =========================================================
   QUICK LINK
========================================================= */

function QuickLink({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent" | "info";
}) {
  const styles = {
    primary: "hover:border-primary",
    secondary: "hover:border-secondary",
    accent: "hover:border-accent",
    info: "hover:border-info",
  };

  const textStyles = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    info: "text-info",
  };

  return (
    <Link
      href={href}
      className={`card border border-base-200 bg-base-100 transition-all hover:shadow-md ${styles[color]}`}
    >
      <div className="card-body p-4">
        <div className={textStyles[color]}>{icon}</div>

        <h3 className="font-semibold">{title}</h3>

        <p className="text-xs text-base-content/60">{description}</p>
      </div>
    </Link>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-base-200 p-3">
      <div className="flex items-center gap-2 text-primary">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

/* =========================================================
   FINANCE LINE
========================================================= */

function FinanceLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-base-200 p-2">{icon}</div>

        <span className="text-sm">{label}</span>
      </div>

      <span className="font-bold">
        $
        {Number(value).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
