import Link from "next/link";

import {
  Plus,
  CalendarDays,
} from "lucide-react";

import {
  getRendezVous,
} from "@/app/actions/rendezVous";
import RendezVousPageClient from "@/components/rende-vous/RendezVousPageClient";



export default async function RendezVousPage() {
  const response =
    await getRendezVous();

  if (!response.success) {
    return (
      <div className="p-6">

        <div className="alert alert-error">
          {response.message}
        </div>

      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">

            <CalendarDays
              size={25}
            />

          </div>

          <div>

            <h1 className="text-2xl font-bold">
              Rendez-vous
            </h1>

            <p className="text-sm text-base-content/60">
              Gestion des rendez-vous des patients
            </p>

          </div>

        </div>

        <Link
          href="/rendez-vous/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />

          Nouveau rendez-vous
        </Link>

      </div>

      <RendezVousPageClient
        rendezVous={
          response.data
        }
      />

    </div>
  );
}