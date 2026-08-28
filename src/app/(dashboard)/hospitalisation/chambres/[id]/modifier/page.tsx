import { prisma } from "@/lib/prisma";
import { getChambreById } from "@/app/actions/chambres";
import { notFound } from "next/navigation";
import ChambreForm from "@/components/hospitalisation/ChambreForm";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chambreId = Number(id);

  if (Number.isNaN(chambreId)) {
    return notFound();
  }

  const [r, services] = await Promise.all([
    getChambreById(chambreId),

    prisma.service.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        nom: "asc",
      },
      select: {
        id: true,
        nom: true,
        description: true,
        actif: true,
      },
    }),
  ]);

  if (!r.success || !r.data) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb / Retour */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
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
                  Modifier
                </li>
              </ul>
            </div>

            <div className="mt-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Modifier la chambre
              </h1>

              <p className="mt-1 text-sm text-base-content/60">
                Modifiez les informations et le service associé à cette chambre.
              </p>
            </div>
          </div>

          <Link
            href="/hospitalisation/chambres"
            className="btn btn-outline btn-sm"
          >
            ← Retour
          </Link>
        </div>

        {/* Formulaire */}
        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="border-b border-base-200 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                🏥
              </div>

              <div>
                <h2 className="font-semibold">
                  Informations de la chambre
                </h2>

                <p className="text-xs text-base-content/60">
                  Les champs obligatoires doivent être correctement renseignés.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <ChambreForm
              initial={r.data}
              services={services}
            />
          </div>
        </section>

      </div>
    </main>
  );
}