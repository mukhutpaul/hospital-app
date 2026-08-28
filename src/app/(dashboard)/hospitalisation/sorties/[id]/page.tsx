
import Link from "next/link";
import { getSortieById } from "@/app/actions/sorties";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const r = await getSortieById(Number(id));

  if (!r.success || !r.data) {
    return notFound();
  }

  const s = r.data as any;

  // ==========================================================
  // PATIENT
  // ==========================================================

  const patientName = [
    s.patient?.nom,
    s.patient?.postNom,
    s.patient?.postnom,
    s.patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ");

  const patientInitial =
    patientName?.charAt(0)?.toUpperCase() || "?";

  // ==========================================================
  // DATE
  // ==========================================================

  const formattedDate = s.dateSortie
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(s.dateSortie))
    : "—";

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link
                href="/hospitalisation"
                className="text-base-content/50 hover:text-primary"
              >
                Hospitalisation
              </Link>
            </li>

            <li>
              <Link
                href="/hospitalisation/sorties"
                className="text-base-content/50 hover:text-primary"
              >
                Sorties
              </Link>
            </li>

            <li>
              <span className="font-medium">
                Sortie #{s.id}
              </span>
            </li>
          </ul>
        </div>

        {/* =====================================================
            EN-TÊTE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-3xl">
                🚪
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Sortie #{s.id}
                  </h1>

                  {s.type && (
                    <span className="badge badge-success">
                      {s.type}
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-base-content/60">
                  Fiche de sortie hospitalière
                </p>

              </div>

            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-2">

              <Link
                href="/hospitalisation/sorties"
                className="btn btn-ghost"
              >
                ← Retour
              </Link>

              <Link
                href={`/hospitalisation/sorties/${s.id}/modifier`}
                className="btn btn-primary"
              >
                ✎ Modifier
              </Link>

            </div>

          </div>

          {/* Bandeau de confirmation */}

          <div className="flex items-center gap-3 border-t border-success/20 bg-success/5 px-5 py-3 text-sm sm:px-7">

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
              ✓
            </span>

            <span className="font-medium text-success">
              Sortie enregistrée
            </span>

            <span className="text-base-content/50">
              •
            </span>

            <span className="text-base-content/60">
              {formattedDate}
            </span>

          </div>

        </section>

        {/* =====================================================
            PATIENT
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <h2 className="font-bold">
              Patient
            </h2>

            <p className="text-sm text-base-content/60">
              Informations du patient concerné
            </p>

          </div>

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {patientInitial}
                </div>

                <div>

                  <p className="text-lg font-bold">
                    {patientName || "Patient non identifié"}
                  </p>

                  {s.patient?.id && (
                    <p className="text-sm text-base-content/50">
                      Patient #{s.patient.id}
                    </p>
                  )}

                </div>

              </div>

              {s.hospitalisation && (
                <div className="rounded-xl bg-base-200 px-4 py-3">

                  <p className="text-xs text-base-content/50">
                    Hospitalisation
                  </p>

                  <p className="font-semibold">
                    {s.hospitalisation.numero ||
                      `#${s.hospitalisation.id}`}
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            INFORMATIONS DE SORTIE
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                📋
              </div>

              <div>

                <h2 className="font-bold">
                  Informations de sortie
                </h2>

                <p className="text-sm text-base-content/60">
                  Informations générales concernant la sortie
                </p>

              </div>

            </div>

          </div>

          <div className="grid sm:grid-cols-2">

            {/* Type */}

            <div className="border-b border-base-200 p-5 sm:border-r">

              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Type de sortie
              </p>

              <div className="mt-2">

                {s.type ? (
                  <span className="badge badge-success badge-outline">
                    {s.type}
                  </span>
                ) : (
                  <span className="text-base-content/40">
                    —
                  </span>
                )}

              </div>

            </div>

            {/* Date */}

            <div className="border-b border-base-200 p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Date et heure
              </p>

              <p className="mt-2 font-semibold capitalize">
                {formattedDate}
              </p>

            </div>

            {/* Hospitalisation */}

            <div className="p-5 sm:border-r">

              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Numéro d'hospitalisation
              </p>

              {s.hospitalisation?.id ? (
                <Link
                  href={`/hospitalisation/${s.hospitalisation.id}`}
                  className="mt-2 inline-block font-semibold text-primary hover:underline"
                >
                  {s.hospitalisation.numero ||
                    `#${s.hospitalisation.id}`}
                </Link>
              ) : (
                <p className="mt-2 font-semibold">
                  —
                </p>
              )}

            </div>

            {/* Identifiant sortie */}

            <div className="p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Référence
              </p>

              <p className="mt-2 font-semibold">
                SORTIE-{String(s.id).padStart(5, "0")}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            DIAGNOSTIC FINAL
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error">
                🩺
              </div>

              <div>

                <h2 className="font-bold">
                  Diagnostic final
                </h2>

                <p className="text-sm text-base-content/60">
                  Diagnostic retenu au moment de la sortie
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {s.diagnosticFinal ? (
              <div className="rounded-xl border border-error/10 bg-error/5 p-5 leading-7">
                <p className="font-medium">
                  {s.diagnosticFinal}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm italic text-base-content/50">
                Aucun diagnostic final n'a été enregistré.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            TRAITEMENT
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                💊
              </div>

              <div>

                <h2 className="font-bold">
                  Traitement
                </h2>

                <p className="text-sm text-base-content/60">
                  Traitement prescrit ou recommandé à la sortie
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {s.traitement ? (
              <div className="whitespace-pre-line rounded-xl bg-base-200/60 p-5 leading-7">
                {s.traitement}
              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm italic text-base-content/50">
                Aucun traitement n'a été enregistré.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            RECOMMANDATIONS
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                📝
              </div>

              <div>

                <h2 className="font-bold">
                  Recommandations
                </h2>

                <p className="text-sm text-base-content/60">
                  Conseils et recommandations donnés au patient
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {s.recommandation ? (
              <div className="whitespace-pre-line rounded-xl border border-warning/20 bg-warning/5 p-5 leading-7">
                {s.recommandation}
              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm italic text-base-content/50">
                Aucune recommandation n'a été enregistrée.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            ACTIONS FINALES
        ====================================================== */}

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-base-300 pt-5 sm:flex-row">

          <Link
            href="/hospitalisation/sorties"
            className="btn btn-ghost"
          >
            ← Retour aux sorties
          </Link>

          <Link
            href={`/hospitalisation/sorties/${s.id}/modifier`}
            className="btn btn-primary"
          >
            ✎ Modifier la sortie
          </Link>

        </div>

      </div>
    </main>
  );
}