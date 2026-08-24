"use client";

import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
} from "lucide-react";

type RendezVous = {
  statut: string;
};

type Props = {
  rendezVous: RendezVous[];
};

export default function RendezVousStats({
  rendezVous,
}: Props) {
  const total =
    rendezVous.length;

  const planifies =
    rendezVous.filter(
      (rdv) =>
        rdv.statut === "PLANIFIE"
    ).length;

  const confirmes =
    rendezVous.filter(
      (rdv) =>
        rdv.statut === "CONFIRME"
    ).length;

  const annules =
    rendezVous.filter(
      (rdv) =>
        rdv.statut === "ANNULE"
    ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <StatCard
        title="Total"
        value={total}
        icon={
          <CalendarCheck size={22} />
        }
      />

      <StatCard
        title="Planifiés"
        value={planifies}
        icon={
          <CalendarClock size={22} />
        }
      />

      <StatCard
        title="Confirmés"
        value={confirmes}
        icon={
          <CheckCircle2 size={22} />
        }
      />

      <StatCard
        title="Annulés"
        value={annules}
        icon={
          <CalendarX size={22} />
        }
      />

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-base-content/60">
              {title}
            </p>

            <p className="text-3xl font-bold mt-1">
              {value}
            </p>

          </div>

          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>

        </div>

      </div>

    </div>
  );
}