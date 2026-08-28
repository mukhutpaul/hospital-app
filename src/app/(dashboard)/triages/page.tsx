import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Plus,
  Stethoscope,
} from "lucide-react";

import {
  getTriageStats,
  getTriages,
} from "@/app/actions/triages";

import TriageTable from "@/components/triages/TriageTable";

export default async function TriagesPage() {
  const [
    triagesResult,
    statsResult,
  ] = await Promise.all([
    getTriages(),
    getTriageStats(),
  ]);

  const triages =
    triagesResult.success
      ? triagesResult.data ?? []
      : [];

  const stats =
    statsResult.success
      ? statsResult.data
      : {
          total: 0,
          critiques: 0,
          urgents: 0,
          prioritaires: 0,
          normaux: 0,
          admissionsSansTriage: 0,
        };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Triage des patients
          </h1>

          <p className="mt-1 text-base-content/60">
            Évaluation initiale, niveau
            d'urgence et constantes vitales.
          </p>
        </div>

        <Link
          href="/triages/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouveau triage
        </Link>
      </div>

      {!triagesResult.success && (
        <div className="alert alert-error">
          {triagesResult.message}
        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat
          title="Total triages"
          value={stats.total}
          icon={<Activity size={22} />}
        />

        <Stat
          title="Critiques"
          value={stats.critiques}
          icon={
            <AlertOctagon size={22} />
          }
          color="error"
        />

        <Stat
          title="Urgents"
          value={stats.urgents}
          icon={
            <AlertTriangle size={22} />
          }
          color="warning"
        />

        <Stat
          title="Prioritaires"
          value={stats.prioritaires}
          icon={<Stethoscope size={22} />}
          color="secondary"
        />

        <Stat
          title="En attente de triage"
          value={
            stats.admissionsSansTriage
          }
          icon={<Clock size={22} />}
          color="info"
        />
      </div>

      {/* TABLE */}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Triages enregistrés
            </h2>

            <p className="text-sm text-base-content/60">
              Liste des évaluations réalisées
              à l'admission.
            </p>
          </div>
        </div>

        <TriageTable
          triages={triages as any[]}
        />
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
  color = "primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?:
    | "primary"
    | "error"
    | "warning"
    | "secondary"
    | "info";
}) {
  const colors = {
    primary:
      "text-primary bg-primary/10",
    error: "text-error bg-error/10",
    warning:
      "text-warning bg-warning/10",
    secondary:
      "text-secondary bg-secondary/10",
    info: "text-info bg-info/10",
  };

  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-base-content/60">
          {title}
        </span>

        <div
          className={`rounded-xl p-2.5 ${colors[color]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold">
        {value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}