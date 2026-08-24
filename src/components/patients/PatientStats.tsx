"use client";

import {
  Users,
  UserCheck,
  UserX,
  UserRound,
} from "lucide-react";

type PatientStatsProps = {
  total: number;
  actifs: number;
  inactifs: number;
  hommes: number;
  femmes: number;
};

export default function PatientStats({
  total,
  actifs,
  inactifs,
  hommes,
  femmes,
}: PatientStatsProps) {
  const stats = [
    {
      title: "Total patients",
      value: total,
      description: "Patients enregistrés",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Patients actifs",
      value: actifs,
      description: "Dossiers actifs",
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Patients inactifs",
      value: inactifs,
      description: "Dossiers désactivés",
      icon: UserX,
      color: "text-error",
      bg: "bg-error/10",
    },
    {
      title: "Hommes",
      value: hommes,
      description: "Patients masculins",
      icon: UserRound,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Femmes",
      value: femmes,
      description: "Patients féminins",
      icon: UserRound,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              stat
              bg-base-100
              border
              border-base-200
              rounded-xl
              shadow-sm
              hover:shadow-md
              transition-shadow
            "
          >
            <div
              className={`
                stat-figure
                ${stat.bg}
                ${stat.color}
                rounded-xl
                p-3
              `}
            >
              <Icon size={24} />
            </div>

            <div className="stat-title">
              {stat.title}
            </div>

            <div
              className={`
                stat-value
                text-2xl
                ${stat.color}
              `}
            >
              {stat.value.toLocaleString("fr-FR")}
            </div>

            <div className="stat-desc">
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}