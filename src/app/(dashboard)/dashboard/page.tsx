
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
  Calculator,
  FileText,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getDashboardData } from "@/app/actions/dashboard";
import ActiviteMedicaleChart from "@/components/ActiviteMedicaleChart";

/* =========================================================
   TYPES
========================================================= */

type Role =
  | "ADMIN"
  | "MEDECIN"
  | "INFIRMIER"
  | "RECEPTIONNISTE"
  | "CAISSIER"
  | "COMPTABLE"
  | "LABORANTIN"
  | "RADIOLOGUE";

type Permission =
  | "PATIENTS_READ"
  | "PATIENTS_CREATE"
  | "PATIENTS_UPDATE"
  | "PATIENTS_DELETE"
  | "RENDEZ_VOUS"
  | "CONSULTATIONS"
  | "HOSPITALISATIONS"
  | "LABORATOIRE"
  | "IMAGERIE"
  | "FACTURATION"
  | "PAIEMENTS"
  | "DASHBOARD_FINANCE"
  | "DASHBOARD_MEDICAL"
  | "SERVICES";

/* =========================================================
   PERMISSIONS PAR RÔLE
========================================================= */

/**
 * Cette matrice contrôle l'affichage du dashboard.
 *
 * IMPORTANT :
 * Elle ne constitue PAS à elle seule une sécurité.
 *
 * Les mêmes permissions doivent être vérifiées
 * dans les Server Actions et les pages protégées.
 */

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  /* =======================================================
     ADMIN
  ======================================================= */

  ADMIN: [
    "PATIENTS_READ",
    "PATIENTS_CREATE",
    "PATIENTS_UPDATE",
    "PATIENTS_DELETE",

    "RENDEZ_VOUS",
    "CONSULTATIONS",
    "HOSPITALISATIONS",
    "LABORATOIRE",
    "IMAGERIE",

    "FACTURATION",
    "PAIEMENTS",

    "DASHBOARD_FINANCE",
    "DASHBOARD_MEDICAL",

    "SERVICES",
  ],

  /* =======================================================
     MEDECIN
  ======================================================= */

  MEDECIN: [
    "PATIENTS_READ",

    "RENDEZ_VOUS",
    "CONSULTATIONS",
    "HOSPITALISATIONS",

    "LABORATOIRE",
    "IMAGERIE",

    "DASHBOARD_MEDICAL",

    "SERVICES",
  ],

  /* =======================================================
     INFIRMIER
  ======================================================= */

  INFIRMIER: [
    "PATIENTS_READ",

    "RENDEZ_VOUS",
    "HOSPITALISATIONS",

    "DASHBOARD_MEDICAL",
  ],

  /* =======================================================
     RECEPTIONNISTE
  ======================================================= */

  RECEPTIONNISTE: [
    "PATIENTS_READ",
    "PATIENTS_CREATE",
    "PATIENTS_UPDATE",

    "RENDEZ_VOUS",
  ],

  /* =======================================================
     CAISSIER
  ======================================================= */

  /**
   * Le caissier peut :
   *
   * - consulter les patients
   * - consulter/gérer la facturation
   * - enregistrer les paiements
   * - consulter le dashboard financier
   */

  CAISSIER: [
    "PATIENTS_READ",

    "FACTURATION",
    "PAIEMENTS",

    "DASHBOARD_FINANCE",
  ],

  /* =======================================================
     COMPTABLE
  ======================================================= */

  /**
   * Le comptable est orienté vers le suivi financier.
   *
   * Il peut :
   *
   * - consulter les patients
   * - consulter les factures
   * - suivre les paiements
   * - consulter le chiffre d'affaires
   * - suivre les impayés
   * - consulter le dashboard financier
   *
   * Il ne peut PAS enregistrer directement un paiement.
   */

  COMPTABLE: [
    "PATIENTS_READ",

    "FACTURATION",

    "DASHBOARD_FINANCE",
  ],

  /* =======================================================
     LABORANTIN
  ======================================================= */

  LABORANTIN: [
    "PATIENTS_READ",

    "LABORATOIRE",

    "DASHBOARD_MEDICAL",
  ],

  /* =======================================================
     RADIOLOGUE
  ======================================================= */

  RADIOLOGUE: [
    "PATIENTS_READ",

    "IMAGERIE",

    "DASHBOARD_MEDICAL",
  ],
};

/* =========================================================
   PAGE DASHBOARD
========================================================= */

export default async function DashboardPage() {
  /* =======================================================
     AUTHENTIFICATION
  ======================================================= */

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /* =======================================================
     RÉCUPÉRATION DU RÔLE
  ======================================================= */

  const role = session.user.role as Role;

  /**
   * Si le rôle n'est pas reconnu,
   * on refuse l'accès.
   */

  if (!ROLE_PERMISSIONS[role]) {
    redirect("/acces-refuse");
  }

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const permissions = ROLE_PERMISSIONS[role];

  const can = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  /* =======================================================
     DONNÉES DU DASHBOARD
  ======================================================= */

  const result = await getDashboardData();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <Activity size={20} />

          <span>
            {result.message}
          </span>
        </div>
      </div>
    );
  }

  const dashboard = result.data;

  /* =======================================================
     INFORMATIONS UTILISATEUR
  ======================================================= */

  const userName =
    session.user.name || "Utilisateur";

  /* =======================================================
     ACTIVITÉ
  ======================================================= */

  const totalActivite =
    dashboard.consultationsAujourdhui +
    dashboard.examensLaboratoire +
    dashboard.examensImagerie;

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold md:text-3xl">
            Tableau de bord
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2">

            <p className="text-base-content/60">
              Bienvenue, {userName}
            </p>

            <span className="badge badge-primary badge-outline">
              {role}
            </span>

          </div>

        </div>

        <div className="badge badge-primary badge-lg">
          Aujourd&apos;hui
        </div>

      </div>

      {/* ===================================================
          STATISTIQUES PRINCIPALES
      =================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* PATIENTS */}

        {can("PATIENTS_READ") && (
          <DashboardStat
            title="Patients"
            value={dashboard.patients}
            description="Patients enregistrés"
            icon={<Users size={24} />}
            color="primary"
          />
        )}

        {/* RENDEZ-VOUS */}

        {can("RENDEZ_VOUS") && (
          <DashboardStat
            title="Rendez-vous"
            value={dashboard.rendezVousAujourdhui}
            description="Aujourd'hui"
            icon={<CalendarDays size={24} />}
            color="secondary"
          />
        )}

        {/* HOSPITALISATIONS */}

        {can("HOSPITALISATIONS") && (
          <DashboardStat
            title="Hospitalisés"
            value={dashboard.hospitalises}
            description="Patients actuellement hospitalisés"
            icon={<Bed size={24} />}
            color="accent"
          />
        )}

        {/* FACTURES */}

        {can("FACTURATION") && (
          <DashboardStat
            title="Factures"
            value={dashboard.facturesImpayees}
            description="Impayées ou partielles"
            icon={<Receipt size={24} />}
            color="info"
          />
        )}

      </div>

      {/* ===================================================
          ACCÈS RAPIDES
      =================================================== */}

      <section>

        <h2 className="mb-3 text-lg font-bold">
          Accès rapides
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

          {/* NOUVEAU PATIENT */}

          {can("PATIENTS_CREATE") && (
            <QuickLink
              href="/patients/nouveau"
              icon={<UserPlus size={22} />}
              title="Nouveau patient"
              description="Enregistrer un patient"
              color="primary"
            />
          )}

          {/* RENDEZ-VOUS */}

          {can("RENDEZ_VOUS") && (
            <QuickLink
              href="/rendez-vous"
              icon={<CalendarDays size={22} />}
              title="Rendez-vous"
              description="Planifier un rendez-vous"
              color="secondary"
            />
          )}

          {/* CONSULTATION */}

          {can("CONSULTATIONS") && (
            <QuickLink
              href="/consultations"
              icon={<Stethoscope size={22} />}
              title="Consultation"
              description="Nouvelle consultation"
              color="accent"
            />
          )}

          {/* PAIEMENT */}

          {can("PAIEMENTS") && (
            <QuickLink
              href="/paiements"
              icon={<CreditCard size={22} />}
              title="Paiement"
              description="Enregistrer un paiement"
              color="info"
            />
          )}

          {/* FACTURATION */}

          {can("FACTURATION") && (
            <QuickLink
              href="/facturation"
              icon={<Receipt size={22} />}
              title="Facturation"
              description="Consulter les factures"
              color="primary"
            />
          )}

          {/* COMPTABILITÉ */}

          {role === "COMPTABLE" && (
            <QuickLink
              href="/comptabilite"
              icon={<Calculator size={22} />}
              title="Comptabilité"
              description="Suivi financier"
              color="secondary"
            />
          )}

        </div>

      </section>

      {/* ===================================================
          ACTIVITÉ + FINANCES
      =================================================== */}

      <div
        className={`grid grid-cols-1 gap-6 ${
          can("DASHBOARD_FINANCE")
            ? "xl:grid-cols-3"
            : "xl:grid-cols-1"
        }`}
      >

        {/* =================================================
            ACTIVITÉ MÉDICALE
        ================================================= */}

        {can("DASHBOARD_MEDICAL") && (
          <div
            className={
              can("DASHBOARD_FINANCE")
                ? "card border border-base-200 bg-base-100 shadow-sm xl:col-span-2"
                : "card border border-base-200 bg-base-100 shadow-sm"
            }
          >

            <div className="card-body">

              {/* HEADER */}

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="card-title">
                    Activité médicale
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Suivi et évolution de l&apos;activité médicale
                  </p>

                </div>

                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Activity size={22} />
                </div>

              </div>

              {/* MINI STATISTIQUES */}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <MiniStat
                  icon={<Stethoscope size={16} />}
                  label="Consultations"
                  value={dashboard.consultationsAujourdhui}
                />

                <MiniStat
                  icon={<FlaskConical size={16} />}
                  label="Laboratoire"
                  value={dashboard.examensLaboratoire}
                />

                <MiniStat
                  icon={<ScanLine size={16} />}
                  label="Imagerie"
                  value={dashboard.examensImagerie}
                />

              </div>

              {/* TOTAL */}

              <div className="mt-3 rounded-xl border border-base-200 p-3">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-base-content/60">
                    Activité totale aujourd&apos;hui
                  </span>

                  <span className="font-bold">
                    {totalActivite.toLocaleString("fr-FR")}
                  </span>

                </div>

              </div>

              {/* GRAPHIQUE */}

              <div className="mt-6">

                <ActiviteMedicaleChart
                  data={dashboard.activiteMedicale}
                />

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            ACTIVITÉ FINANCIÈRE
        ================================================= */}

        {can("DASHBOARD_FINANCE") && (
          <div
            className="card border border-base-200 bg-base-100 shadow-sm"
          >

            <div className="card-body">

              {/* HEADER */}

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="card-title">
                    Activité financière
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Situation financière
                  </p>

                </div>

                <div className="rounded-full bg-info/10 p-3 text-info">
                  {role === "COMPTABLE" ? (
                    <Calculator size={22} />
                  ) : (
                    <Wallet size={22} />
                  )}
                </div>

              </div>

              {/* INFORMATIONS POUR COMPTABLE */}

              {role === "COMPTABLE" && (
                <div className="mt-4 alert alert-info">

                  <Calculator size={18} />

                  <div>

                    <h3 className="font-semibold">
                      Vue comptable
                    </h3>

                    <p className="text-xs">
                      Consultez la situation financière
                      de l&apos;établissement.
                    </p>

                  </div>

                </div>
              )}

              {/* FINANCES */}

              <div className="mt-6 space-y-5">

                <FinanceLine
                  label="Chiffre d'affaires"
                  value={dashboard.chiffreAffaires}
                  icon={<Receipt size={18} />}
                />

                <FinanceLine
                  label="Paiements aujourd'hui"
                  value={dashboard.paiementsAujourdhui}
                  icon={<CreditCard size={18} />}
                />

                <FinanceLine
                  label="Impayés"
                  value={dashboard.impayes}
                  icon={<Wallet size={18} />}
                />

              </div>

              {/* ACTIONS FINANCIÈRES */}

              <div className="mt-6 flex flex-wrap justify-end gap-2">

                {/* FACTURES */}

                {can("FACTURATION") && (
                  <Link
                    href="/facturation"
                    className="btn btn-ghost btn-sm"
                  >
                    <FileText size={15} />
                    Voir les factures
                    <ArrowUpRight size={15} />
                  </Link>
                )}

                {/* PAIEMENTS UNIQUEMENT POUR CAISSIER / ADMIN */}

                {can("PAIEMENTS") && (
                  <Link
                    href="/paiements"
                    className="btn btn-info btn-outline btn-sm"
                  >
                    <CreditCard size={15} />
                    Paiements
                    <ArrowUpRight size={15} />
                  </Link>
                )}

                {/* COMPTABILITÉ */}

                {role === "COMPTABLE" && (
                  <Link
                    href="/comptabilite"
                    className="btn btn-primary btn-sm"
                  >
                    <Calculator size={15} />
                    Comptabilité
                    <ArrowUpRight size={15} />
                  </Link>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ===================================================
          SERVICES HOSPITALIERS
      =================================================== */}

      {can("SERVICES") && (
        <div className="card border border-base-200 bg-base-100 shadow-sm">

          <div className="card-body">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="card-title">
                  Services hospitaliers
                </h2>

                <p className="text-sm text-base-content/60">
                  Activité des services
                </p>

              </div>

              <Stethoscope
                size={22}
                className="text-primary"
              />

            </div>

            {/* SERVICES */}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {dashboard.services.map((service) => (

                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-xl bg-base-200 p-4"
                >

                  <div>

                    <p className="font-semibold">
                      {service.nom}
                    </p>

                    <p className="text-xs text-base-content/50">
                      {service.consultations} consultations
                    </p>

                  </div>

                  <span className="badge badge-success">
                    Actif
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          MESSAGE SI ACTIVITÉ LIMITÉE
      =================================================== */}

      {!can("DASHBOARD_MEDICAL") &&
        !can("DASHBOARD_FINANCE") && (

          <div className="alert alert-info">

            <Activity size={20} />

            <div>

              <h3 className="font-semibold">
                Tableau de bord personnalisé
              </h3>

              <p className="text-sm">
                Votre rôle ne dispose pas d&apos;accès aux
                statistiques médicales ou financières.
              </p>

            </div>

          </div>
        )}

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
  color:
    | "primary"
    | "secondary"
    | "accent"
    | "info";
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

        <div
          className={`rounded-full p-3 ${style.bg}`}
        >
          {icon}
        </div>

      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className={`stat-value ${style.text}`}>
        {Number(value).toLocaleString("fr-FR")}
      </div>

      <div className="stat-desc">
        {description}
      </div>

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
  color:
    | "primary"
    | "secondary"
    | "accent"
    | "info";
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
      className={`
        card
        border
        border-base-200
        bg-base-100
        transition-all
        hover:-translate-y-0.5
        hover:shadow-md
        ${styles[color]}
      `}
    >

      <div className="card-body p-4">

        <div className={textStyles[color]}>
          {icon}
        </div>

        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-xs text-base-content/60">
          {description}
        </p>

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

        <span className="text-xs">
          {label}
        </span>

      </div>

      <p className="mt-1 text-xl font-bold">
        {Number(value).toLocaleString("fr-FR")}
      </p>

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
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-base-200 p-2">
          {icon}
        </div>

        <span className="text-sm">
          {label}
        </span>

      </div>

      <span className="text-right font-bold whitespace-nowrap">

        $
        {Number(value).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}

      </span>

    </div>
  );
}