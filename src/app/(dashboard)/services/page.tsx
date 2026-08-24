import Link from "next/link";
import { Plus, Building2 } from "lucide-react";

import ServiceTable from "@/components/services/ServiceTable";
import { getServices } from "@/app/actions/services";

export default async function ServicesPage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="alert alert-error">
          <span>
            {result.message ||
              "Impossible de récupérer les services."}
          </span>
        </div>
      </div>
    );
  }

  const services = result.data ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">
            <Building2 size={16} />

            <span>
              Administration
            </span>

            <span>/</span>

            <span>
              Services
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            Services hospitaliers
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Gérez les différents services de l'hôpital.
          </p>
        </div>

        <Link
          href="/services/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouveau service
        </Link>

      </div>

      {/* TABLE */}

      <ServiceTable
        services={services}
      />

    </div>
  );
}