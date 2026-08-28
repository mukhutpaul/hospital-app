
import { getChambreById } from "@/app/actions/chambres";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const r = await getChambreById(Number(id));

  if (!r.success || !r.data) {
    return notFound();
  }

  const c = r.data as any;

  const lits = c.lits ?? [];

  // ============================
  // STATISTIQUES
  // ============================

  const totalLits = lits.length;

  const litsDisponibles = lits.filter(
    (l: any) =>
      l.statut?.toUpperCase() === "DISPONIBLE"
  ).length;

  const litsOccupes = lits.filter(
    (l: any) =>
      l.statut?.toUpperCase() === "OCCUPE" ||
      l.statut?.toUpperCase() === "OCCUPEE"
  ).length;

  const litsIndisponibles = totalLits - litsDisponibles - litsOccupes;

  // ============================
  // STATUT LIT
  // ============================

  function getStatutStyle(statut: string) {
    const value = statut?.toUpperCase();

    switch (value) {
      case "DISPONIBLE":
        return {
          badge: "badge-success",
          bg: "bg-success/10",
          border: "border-success/20",
          text: "text-success",
          icon: "✓",
        };

      case "OCCUPE":
      case "OCCUPEE":
        return {
          badge: "badge-error",
          bg: "bg-error/10",
          border: "border-error/20",
          text: "text-error",
          icon: "●",
        };

      case "MAINTENANCE":
      case "INDISPONIBLE":
        return {
          badge: "badge-warning",
          bg: "bg-warning/10",
          border: "border-warning/20",
          text: "text-warning",
          icon: "⚠",
        };

      default:
        return {
          badge: "badge-ghost",
          bg: "bg-base-200",
          border: "border-base-300",
          text: "text-base-content/60",
          icon: "•",
        };
    }
  }

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link
                href="/hospitalisation/chambres"
                className="text-base-content/60 hover:text-primary"
              >
                Chambres
              </Link>
            </li>

            <li className="font-medium">
              Chambre {c.numero}
            </li>
          </ul>
        </div>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              {/* Icône */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                🏥
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Chambre {c.numero}
                  </h1>

                  {c.actif !== false && (
                    <span className="badge badge-success badge-sm">
                      Active
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-base-content/60">
                  Informations et disponibilité des lits
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">

              <Link
                href="/hospitalisation/chambres"
                className="btn btn-ghost"
              >
                ← Retour
              </Link>

              <Link
                href={`/hospitalisation/chambres/${c.id}/modifier`}
                className="btn btn-primary"
              >
                ✎ Modifier
              </Link>

            </div>
          </div>

          {/* =================================================
              INFORMATIONS
          ================================================== */}

          <div className="grid border-t border-base-200 sm:grid-cols-2 lg:grid-cols-4">

            {/* Service */}
            <div className="border-b border-base-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Service
              </p>

              <p className="mt-1 font-semibold">
                {c.service?.nom || "—"}
              </p>
            </div>

            {/* Type */}
            <div className="border-b border-base-200 p-5 lg:border-r lg:border-b-0">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Type
              </p>

              <p className="mt-1 font-semibold">
                {c.type || "—"}
              </p>
            </div>

            {/* Étage */}
            <div className="border-b border-base-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Étage
              </p>

              <p className="mt-1 font-semibold">
                {c.etage || "—"}
              </p>
            </div>

            {/* Capacité */}
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Capacité
              </p>

              <p className="mt-1 font-semibold">
                {totalLits} lit{totalLits > 1 ? "s" : ""}
              </p>
            </div>

          </div>
        </div>

        {/* =====================================================
            STATISTIQUES
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">
                  Total des lits
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {totalLits}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200 text-xl">
                🛏️
              </div>
            </div>
          </div>

          {/* Disponibles */}
          <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">
                  Disponibles
                </p>

                <p className="mt-1 text-3xl font-bold text-success">
                  {litsDisponibles}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-xl text-success">
                ✓
              </div>
            </div>
          </div>

          {/* Occupés */}
          <div className="rounded-2xl border border-error/20 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">
                  Occupés
                </p>

                <p className="mt-1 text-3xl font-bold text-error">
                  {litsOccupes}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-xl text-error">
                ●
              </div>
            </div>
          </div>

          {/* Indisponibles */}
          <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">
                  Indisponibles
                </p>

                <p className="mt-1 text-3xl font-bold text-warning">
                  {litsIndisponibles}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-xl text-warning">
                ⚠
              </div>
            </div>
          </div>

        </div>

        {/* =====================================================
            LITS
        ====================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-base-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>
              <h2 className="text-lg font-bold">
                Lits de la chambre
              </h2>

              <p className="mt-1 text-sm text-base-content/60">
                État actuel des lits associés à cette chambre.
              </p>
            </div>

            <div className="badge badge-outline">
              {totalLits} lit{totalLits > 1 ? "s" : ""}
            </div>

          </div>

          {/* Contenu */}
          {lits.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-3xl">
                🛏️
              </div>

              <h3 className="font-semibold">
                Aucun lit enregistré
              </h3>

              <p className="mt-1 max-w-md text-sm text-base-content/60">
                Cette chambre ne possède actuellement aucun lit associé.
              </p>

            </div>
          ) : (

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {lits.map((l: any) => {

                const style = getStatutStyle(l.statut);

                return (
                  <div
                    key={l.id}
                    className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${style.border} ${style.bg}`}
                  >

                    {/* Numéro */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-base-100 text-xl font-bold shadow-sm">
                        🛏️
                      </div>

                      <span
                        className={`badge ${style.badge}`}
                      >
                        {style.icon} {l.statut}
                      </span>

                    </div>

                    {/* Informations */}
                    <div className="mt-5">

                      <p className="text-xs uppercase tracking-wide text-base-content/50">
                        Numéro du lit
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        {l.numero}
                      </h3>

                    </div>

                    {/* Action éventuelle */}
                    <div className="mt-5 border-t border-base-content/10 pt-4">

                      <Link
                        href={`/hospitalisation/lits/${l.id}`}
                        className="btn btn-ghost btn-sm w-full"
                      >
                        Voir le lit →
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
