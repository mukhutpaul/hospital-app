
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SortieForm from "@/components/hospitalisation/SortieForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    hospitalisationId?: string;
  }>;
}) {
  const q = await searchParams;

  const hospitalisations =
    await prisma.hospitalisation.findMany({
      where: {
        statut: "EN_COURS",
      },
      include: {
        patient: true,
      },
      orderBy: {
        dateEntree: "desc",
      },
    });

  const hospitalisationSelectionnee =
    q.hospitalisationId
      ? hospitalisations.find(
          (h) =>
            h.id ===
            Number(q.hospitalisationId)
        )
      : undefined;

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
                Nouvelle sortie
              </span>
            </li>
          </ul>
        </div>

        {/* =====================================================
            EN-TÊTE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="p-5 sm:p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  🚪
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Nouvelle sortie hospitalière
                  </h1>

                  <p className="mt-1 text-sm text-base-content/60">
                    Enregistrez la sortie définitive d'un patient
                    hospitalisé.
                  </p>
                </div>

              </div>

              <Link
                href="/hospitalisation/sorties"
                className="btn btn-ghost"
              >
                ← Retour
              </Link>

            </div>

          </div>

          {/* ===================================================
              ÉTAPES
          ==================================================== */}

          <div className="border-t border-base-200 bg-base-200/30 px-5 py-4 sm:px-7">

            <ul className="steps steps-horizontal w-full">

              <li className="step step-primary">
                Patient
              </li>

              <li className="step step-primary">
                Sortie
              </li>

              <li className="step">
                Validation
              </li>

            </ul>

          </div>

        </section>

        {/* =====================================================
            HOSPITALISATION SÉLECTIONNÉE
        ====================================================== */}

        {hospitalisationSelectionnee && (
          <section className="rounded-2xl border border-success/20 bg-success/5 shadow-sm">

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-success">
                    Hospitalisation sélectionnée
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {hospitalisationSelectionnee
                      .patient
                      ? [
                          hospitalisationSelectionnee.patient.nom,
                          hospitalisationSelectionnee.patient.postNom,
                          hospitalisationSelectionnee.patient.prenom,
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : "Patient non identifié"}
                  </p>

                  <p className="text-sm text-base-content/60">
                    {hospitalisationSelectionnee.numero
                      ? `Hospitalisation ${hospitalisationSelectionnee.numero}`
                      : `Hospitalisation #${hospitalisationSelectionnee.id}`}
                  </p>
                </div>

              </div>

              <span className="badge badge-success badge-outline">
                EN COURS
              </span>

            </div>

          </section>
        )}

        {/* =====================================================
            FORMULAIRE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="border-b border-base-200 px-5 py-4 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                📋
              </div>

              <div>
                <h2 className="font-bold">
                  Informations de sortie
                </h2>

                <p className="text-sm text-base-content/60">
                  Complétez les informations nécessaires à la sortie
                  du patient.
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-7">

            <SortieForm
              hospitalisations={hospitalisations}
              initial={
                q.hospitalisationId
                  ? {
                      hospitalisationId:
                        Number(
                          q.hospitalisationId
                        ),
                    }
                  : undefined
              }
            />

          </div>

        </section>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <div className="alert border-info/20 bg-info/5">

          <div className="flex items-start gap-3">

            <div className="text-lg">
              ℹ️
            </div>

            <div>

              <h3 className="font-semibold">
                Information importante
              </h3>

              <p className="mt-1 text-sm text-base-content/70">
                L'enregistrement d'une sortie clôture
                l'hospitalisation du patient. Vérifiez
                attentivement les informations avant de valider.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
