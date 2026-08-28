
import Link from "next/link";
import {
  Activity,
  ClipboardList,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

import {
  getActesMedicaux,
  getConsultationsAvecActes,
} from "@/app/actions/actes-medicaux";

import ActesMedicauxTable from "@/components/actes/ActesMedicauxTable";

export default async function ActesMedicauxPage() {
  const [actesResult, consultationsResult] =
    await Promise.all([
      getActesMedicaux(),
      getConsultationsAvecActes(),
    ]);

  const actes = actesResult.success
    ? actesResult.data ?? []
    : [];

  const consultations =
    consultationsResult.success
      ? consultationsResult.data ?? []
      : [];

  const actesActifs = actes.filter(
    (acte: any) => acte.actif
  ).length;

  const actesInactifs =
    actes.length - actesActifs;

  const actesUtilises = actes.filter(
    (acte: any) =>
      (acte._count?.consultations ?? 0) > 0
  ).length;

  const totalUtilisations = actes.reduce(
    (total: number, acte: any) =>
      total +
      Number(acte._count?.consultations ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            EN-TÊTE
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Actes médicaux
                  </h1>

                  <span className="badge badge-primary badge-outline">
                    {actes.length} acte
                    {actes.length !== 1 ? "s" : ""}
                  </span>

                </div>

                <p className="mt-1 max-w-2xl text-sm text-base-content/60 sm:text-base">
                  Gérez le catalogue tarifaire et suivez
                  les actes médicaux réalisés en consultation.
                </p>
              </div>

            </div>

            <Link
              href="/actes/nouveau"
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              Nouvel acte médical
            </Link>

          </div>

        </section>

        {/* =====================================================
            ERREUR
        ====================================================== */}

        {!actesResult.success && (
          <div className="alert alert-error shadow-sm">
            <Activity size={20} />
            <span>
              {actesResult.message}
            </span>
          </div>
        )}

        {/* =====================================================
            STATISTIQUES
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Total des actes
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {actes.length}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Actes enregistrés
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={21} />
              </div>

            </div>

          </div>

          {/* ACTIFS */}

          <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Actes actifs
                </p>

                <p className="mt-2 text-3xl font-bold text-success">
                  {actesActifs}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Disponibles à l'utilisation
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                <span className="text-lg">✓</span>
              </div>

            </div>

          </div>

          {/* INACTIFS */}

          <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Actes inactifs
                </p>

                <p className="mt-2 text-3xl font-bold text-warning">
                  {actesInactifs}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Non disponibles
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <span className="text-lg">!</span>
              </div>

            </div>

          </div>

          {/* UTILISATIONS */}

          <div className="rounded-2xl border border-info/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Utilisations
                </p>

                <p className="mt-2 text-3xl font-bold text-info">
                  {totalUtilisations}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  {actesUtilises} acte
                  {actesUtilises !== 1
                    ? "s"
                    : ""} utilisé
                  {actesUtilises !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <ClipboardList size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            ACCÈS RAPIDES
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Link
            href="/actes"
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={22} />
              </div>

              <ArrowRight
                size={18}
                className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-primary"
              />

            </div>

            <h2 className="mt-4 font-bold">
              Catalogue des actes
            </h2>

            <p className="mt-1 text-sm leading-6 text-base-content/60">
              Créer, modifier, activer, désactiver et
              consulter les tarifs des actes médicaux.
            </p>

          </Link>

          <Link
            href="/actes/consultations"
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-info/30 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <ClipboardList size={22} />
              </div>

              <ArrowRight
                size={18}
                className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-info"
              />

            </div>

            <h2 className="mt-4 font-bold">
              Actes de consultation
            </h2>

            <p className="mt-1 text-sm leading-6 text-base-content/60">
              Consultez les actes réellement associés
              aux consultations des patients.
            </p>

          </Link>

        </div>

        {/* =====================================================
            TABLEAU + RECHERCHE + FILTRES
        ====================================================== */}

        <ActesMedicauxTable
          actes={actes as any[]}
        />

      </div>
    </main>
  );
}
