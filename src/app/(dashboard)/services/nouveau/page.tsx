import Link from "next/link";
import {
  ArrowLeft,
  Building2,
} from "lucide-react";

import ServiceForm from "@/components/services/ServiceForm";
import { getDepartementsPourService } from "@/app/actions/services";


export default async function NouveauServicePage() {
  const result = await getDepartementsPourService();

  const departements =
    result.success
      ? result.data ?? []
      : [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">

          <Link
            href="/services"
            className="hover:text-primary transition-colors"
          >
            Services
          </Link>

          <span>/</span>

          <span>
            Nouveau
          </span>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Building2 size={28} />
              Nouveau service
            </h1>

            <p className="text-sm text-base-content/60 mt-1">
              Ajoutez un nouveau service hospitalier.
            </p>
          </div>

          <Link
            href="/services"
            className="btn btn-outline"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

        </div>

      </div>

      {/* FORMULAIRE */}

      <ServiceForm
        departements={departements}
      />

    </div>
  );
}