
import Link from "next/link";
import { getSoinById } from "@/app/actions/soins";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const r = await getSoinById(Number(id));

  if (!r.success || !r.data) {
    return notFound();
  }

  const s = r.data as any;

  const patient = s.hospitalisation?.patient;

  const patientName = [
    patient?.nom,
    patient?.postnom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ");

  const patientInitial =
    patientName?.charAt(0)?.toUpperCase() || "?";

  const formattedDate = s.dateSoin
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(s.dateSoin))
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
                href="/hospitalisation/soins"
                className="text-base-content/60 hover:text-primary"
              >
                Soins hospitaliers
              </Link>
            </li>

            <li>
              <span className="font-medium">
                Soin #{s.id}
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

              {/* Icône */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                🩺
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Soin #{s.id}
                  </h1>

                  {s.type && (
                    <span className="badge badge-primary">
                      {s.type}
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-base-content/60">
                  Fiche détaillée du soin hospitalier
                </p>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">

              <Link
                href="/hospitalisation/soins"
                className="btn btn-ghost"
              >
                ← Retour
              </Link>

              <Link
                href={`/hospitalisation/soins/${s.id}/modifier`}
                className="btn btn-primary"
              >
                ✎ Modifier
              </Link>

            </div>

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
              Patient concerné par ce soin
            </p>

          </div>

          <div className="p-5 sm:p-6">

            {patientName ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {patientInitial}
                  </div>

                  <div>
                    <p className="text-lg font-bold">
                      {patientName}
                    </p>

                    {patient?.id && (
                      <p className="text-sm text-base-content/50">
                        Patient #{patient.id}
                      </p>
                    )}
                  </div>

                </div>

                {s.hospitalisation?.numero && (
                  <div className="rounded-xl bg-base-200 px-4 py-3">

                    <p className="text-xs text-base-content/50">
                      Hospitalisation
                    </p>

                    <p className="font-semibold">
                      {s.hospitalisation.numero}
                    </p>

                  </div>
                )}

              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm text-base-content/60">
                Aucun patient associé à ce soin.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            INFORMATIONS DU SOIN
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <h2 className="font-bold">
              Informations du soin
            </h2>

            <p className="text-sm text-base-content/60">
              Informations générales enregistrées
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3">

            {/* Type */}
            <div className="border-b border-base-200 p-5 sm:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Type de soin
              </p>

              <p className="mt-2 font-semibold">
                {s.type || "—"}
              </p>
            </div>

            {/* Date */}
            <div className="border-b border-base-200 p-5 lg:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Date du soin
              </p>

              <p className="mt-2 font-semibold capitalize">
                {formattedDate}
              </p>
            </div>

            {/* Hospitalisation */}
            <div className="border-b border-base-200 p-5 sm:border-r lg:border-r-0">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Hospitalisation
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

          </div>

        </section>

        {/* =====================================================
            DESCRIPTION
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                📋
              </div>

              <div>
                <h2 className="font-bold">
                  Description du soin
                </h2>

                <p className="text-sm text-base-content/60">
                  Détails de l'acte ou du soin réalisé
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {s.description ? (
              <div className="rounded-xl bg-base-200/60 p-5 leading-7">
                {s.description}
              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm italic text-base-content/50">
                Aucune description n'a été enregistrée.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            OBSERVATION
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                📝
              </div>

              <div>
                <h2 className="font-bold">
                  Observation
                </h2>

                <p className="text-sm text-base-content/60">
                  Observations complémentaires du personnel soignant
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {s.observation ? (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 leading-7">
                {s.observation}
              </div>
            ) : (
              <div className="rounded-xl bg-base-200 p-5 text-sm italic text-base-content/50">
                Aucune observation enregistrée.
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            PIED DE PAGE
        ====================================================== */}

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-base-300 pt-5 sm:flex-row">

          <Link
            href="/hospitalisation/soins"
            className="btn btn-ghost"
          >
            ← Retour aux soins
          </Link>

          <Link
            href={`/hospitalisation/soins/${s.id}/modifier`}
            className="btn btn-primary"
          >
            ✎ Modifier ce soin
          </Link>

        </div>

      </div>
    </main>
  );
}
