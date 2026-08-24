import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
} from "lucide-react";

import ServiceForm from "@/components/services/ServiceForm";

import {
    getDepartementsPourService,
  getServiceById,

} from "@/app/actions/services";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModifierServicePage({
  params,
}: PageProps) {
  const { id } = await params;

  const serviceId = Number(id);

  if (
    !Number.isInteger(serviceId) ||
    serviceId <= 0
  ) {
    notFound();
  }

  const [serviceResult, departementsResult] =
    await Promise.all([
      getServiceById(serviceId),
      getDepartementsPourService(),
    ]);

  if (
    !serviceResult.success ||
    !serviceResult.data
  ) {
    notFound();
  }

  const service = serviceResult.data;

  const departements =
    departementsResult.success
      ? departementsResult.data ?? []
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

          <Link
            href={`/services/${service.id}`}
            className="hover:text-primary transition-colors"
          >
            {service.nom}
          </Link>

          <span>/</span>

          <span>
            Modifier
          </span>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">

              <Building2 size={28} />

              Modifier le service

            </h1>

            <p className="text-sm text-base-content/60 mt-1">

              Modifiez les informations de{" "}
              <span className="font-medium">
                {service.nom}
              </span>
              .

            </p>

          </div>

          <Link
            href={`/services/${service.id}`}
            className="btn btn-outline"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

        </div>

      </div>

      {/* FORMULAIRE */}

      <ServiceForm
        service={service}
        departements={departements}
      />

    </div>
  );
}