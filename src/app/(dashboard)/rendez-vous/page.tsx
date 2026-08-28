import Link from "next/link";

import {
  Plus,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import {
  getRendezVous,
} from "@/app/actions/rendezVous";

import RendezVousPageClient from "@/components/rende-vous/RendezVousPageClient";

export default async function RendezVousPage() {
  const response = await getRendezVous();

  if (!response.success) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="alert alert-error shadow-sm rounded-2xl">
          <CalendarDays size={22} />

          <div>
            <h3 className="font-bold">
              Impossible de charger les rendez-vous
            </h3>

            <p className="text-sm">
              {response.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRendezVous =
    Array.isArray(response.data)
      ? response.data.length
      : 0;

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm">

        {/* Décoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />

        <div className="relative p-5 md:p-7">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* TITRE */}

            <div className="flex items-start gap-4">

              <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20 flex items-center justify-center">

                <CalendarDays
                  size={30}
                />

              </div>

              <div className="space-y-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Rendez-vous
                  </h1>

                  <span className="badge badge-primary badge-outline">
                    {totalRendezVous} total
                  </span>

                </div>

                <p className="max-w-xl text-sm md:text-base text-base-content/60">

                  Planifiez, consultez et gérez efficacement
                  les rendez-vous de vos patients.

                </p>

              </div>

            </div>


            {/* ACTION */}

            <Link
              href="/rendez-vous/nouveau"
              className="btn btn-primary rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            >

              <Plus size={20} />

              Nouveau rendez-vous

              <ArrowRight
                size={17}
                className="hidden sm:block"
              />

            </Link>

          </div>

        </div>

      </div>


      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="rounded-3xl border border-base-200 bg-base-100 shadow-sm overflow-hidden">

        {/* Barre supérieure */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-4 border-b border-base-200">

          <div>

            <h2 className="font-semibold text-lg">
              Liste des rendez-vous
            </h2>

            <p className="text-sm text-base-content/50">
              Retrouvez et gérez tous les rendez-vous enregistrés.
            </p>

          </div>

          <div className="badge badge-ghost gap-2 py-3">

            <CalendarDays size={15} />

            {totalRendezVous} rendez-vous

          </div>

        </div>


        {/* TABLE / CLIENT */}

        <div className="p-4 md:p-6">

          <RendezVousPageClient
            rendezVous={response.data}
          />

        </div>

      </div>

    </div>
  );
}