
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ActiviteJour = {
  date: string;
  consultations: number;
  actes: number;
  laboratoire: number;
  imagerie: number;
};

type Props = {
  data: ActiviteJour[];
};

export default function ActiviteMedicaleChart({ data }: Props) {
  /*
   * On prépare les données pour le graphique.
   * Le total permet également de comprendre
   * rapidement l'activité globale de chaque jour.
   */
  const chartData = data.map((jour) => ({
    date: jour.date,
    Consultations: jour.consultations,
    Actes: jour.actes,
    Laboratoire: jour.laboratoire,
    Imagerie: jour.imagerie,

    Total:
      jour.consultations +
      jour.actes +
      jour.laboratoire +
      jour.imagerie,
  }));

  /*
   * Calcul de l'activité totale
   */
  const totalActivite = chartData.reduce(
    (total, jour) => total + jour.Total,
    0,
  );

  /*
   * Recherche du jour le plus actif
   */
  const jourLePlusActif = chartData.reduce(
    (max, jour) =>
      jour.Total > max.Total ? jour : max,
    chartData[0] || {
      date: "-",
      Total: 0,
      Consultations: 0,
      Actes: 0,
      Laboratoire: 0,
      Imagerie: 0,
    },
  );

  return (
    <div className="space-y-6">

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <div className="rounded-xl bg-base-200/60 p-4">

        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <span className="text-lg">📊</span>
          </div>

          <div>

            <h3 className="font-semibold">
              Comment lire cette activité ?
            </h3>

            <p className="mt-1 text-sm text-base-content/60">
              Ce graphique présente l'évolution de l'activité
              médicale au cours des 7 derniers jours.
              Il permet de comparer les consultations, les actes,
              les examens de laboratoire et les examens d'imagerie.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          INDICATEURS RAPIDES
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-xl border border-base-200 bg-base-100 p-4">

          <p className="text-xs text-base-content/50">
            Activité totale
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalActivite.toLocaleString("fr-FR")}
          </p>

          <p className="mt-1 text-xs text-base-content/50">
            Toutes activités confondues
          </p>

        </div>


        <div className="rounded-xl border border-base-200 bg-base-100 p-4">

          <p className="text-xs text-base-content/50">
            Jour le plus actif
          </p>

          <p className="mt-1 text-xl font-bold">
            {jourLePlusActif.date}
          </p>

          <p className="mt-1 text-xs text-base-content/50">
            {jourLePlusActif.Total} activités réalisées
          </p>

        </div>


        <div className="rounded-xl border border-base-200 bg-base-100 p-4">

          <p className="text-xs text-base-content/50">
            Moyenne quotidienne
          </p>

          <p className="mt-1 text-2xl font-bold">
            {data.length > 0
              ? Math.round(
                  totalActivite / data.length,
                ).toLocaleString("fr-FR")
              : 0}
          </p>

          <p className="mt-1 text-xs text-base-content/50">
            Activités par jour
          </p>

        </div>

      </div>


      {/* =====================================================
          GRAPHIQUE
      ===================================================== */}

      <div>

        <div className="mb-4">

          <h3 className="font-semibold">
            Évolution de l'activité
          </h3>

          <p className="text-sm text-base-content/50">
            Nombre d'activités médicales réalisées chaque jour
          </p>

        </div>


        <div className="h-[320px] w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.2}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={{ opacity: 0.1 }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--b2))",
                }}
              />

              <Legend />

              <Bar
                dataKey="Consultations"
                name="Consultations"
                fill="hsl(var(--p))"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Actes"
                name="Actes médicaux"
                fill="hsl(var(--s))"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Laboratoire"
                name="Laboratoire"
                fill="hsl(var(--a))"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Imagerie"
                name="Imagerie"
                fill="hsl(var(--in))"
                radius={[4, 4, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* =====================================================
          EXPLICATION DES INDICATEURS
      ===================================================== */}

      <div>

        <h3 className="mb-3 font-semibold">
          Signification des indicateurs
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <ActivityExplanation
            icon="🩺"
            title="Consultations"
            description="Nombre de consultations médicales effectuées."
          />

          <ActivityExplanation
            icon="⚕️"
            title="Actes médicaux"
            description="Actes ou soins médicaux réalisés pendant la période."
          />

          <ActivityExplanation
            icon="🧪"
            title="Laboratoire"
            description="Examens biologiques réalisés par le laboratoire."
          />

          <ActivityExplanation
            icon="🩻"
            title="Imagerie"
            description="Examens d'imagerie médicale réalisés."
          />

        </div>

      </div>


      {/* =====================================================
          INTERPRÉTATION
      ===================================================== */}

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">

        <div className="flex items-start gap-3">

          <div className="text-xl">
            💡
          </div>

          <div>

            <h3 className="font-semibold">
              Lecture rapide
            </h3>

            <p className="mt-1 text-sm text-base-content/70">

              Sur les 7 derniers jours, l'établissement
              a enregistré{" "}
              <strong>
                {totalActivite.toLocaleString("fr-FR")}
              </strong>{" "}
              activités médicales au total.

              {jourLePlusActif.Total > 0 && (
                <>
                  {" "}La journée la plus active est{" "}
                  <strong>
                    {jourLePlusActif.date}
                  </strong>
                  , avec{" "}
                  <strong>
                    {jourLePlusActif.Total}
                  </strong>{" "}
                  activités.
                </>
              )}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EXPLICATION ACTIVITÉ
========================================================= */

function ActivityExplanation({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-base-200 p-3">

      <div className="text-xl">
        {icon}
      </div>

      <div>

        <p className="font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-base-content/50">
          {description}
        </p>

      </div>

    </div>
  );
}
