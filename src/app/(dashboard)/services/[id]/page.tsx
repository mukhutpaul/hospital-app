import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit,
  Hash,
  Stethoscope,
  Users,
  UserRound,
  XCircle,
  FileText,
  Hospital,
  ClipboardList,
  BedDouble,
} from "lucide-react";

import { getServiceById } from "@/app/actions/services";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServicePage({
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

  const result =
    await getServiceById(serviceId);

  if (!result.success || !result.data) {
    notFound();
  }

  const service = result.data;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

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
              Profil
            </span>

          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            {service.nom}
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Consultez les informations détaillées du service.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <Link
            href="/services"
            className="btn btn-outline"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <Link
            href={`/services/${service.id}/modifier`}
            className="btn btn-primary"
          >
            <Edit size={18} />
            Modifier
          </Link>

        </div>

      </div>

      {/* =====================================================
          CARTE PRINCIPALE
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* IDENTITÉ */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body items-center text-center">

            <div className="avatar placeholder mb-3">

              <div className="w-24 h-24 rounded-2xl bg-primary text-primary-content flex items-center justify-center">

                <Building2 size={42} />

              </div>

            </div>

            <h2 className="text-xl font-bold">
              {service.nom}
            </h2>

            <p className="text-sm text-base-content/50">
              {service.code}
            </p>

            <div className="mt-3">

              {service.actif ? (
                <span className="badge badge-success gap-1">
                  <CheckCircle2 size={14} />
                  Actif
                </span>
              ) : (
                <span className="badge badge-error gap-1">
                  <XCircle size={14} />
                  Inactif
                </span>
              )}

            </div>

          </div>

        </div>

        {/* INFORMATIONS */}

        <div className="xl:col-span-2 card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <h2 className="card-title mb-4">
              <Building2 size={21} />
              Informations du service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InfoItem
                icon={<Hash size={18} />}
                label="Code"
                value={service.code}
              />

              <InfoItem
                icon={<Building2 size={18} />}
                label="Nom"
                value={service.nom}
              />

              <InfoItem
                icon={<Hospital size={18} />}
                label="Département"
                value={
                  service.departement?.nom ||
                  "Aucun département"
                }
              />

              <InfoItem
                icon={
                  service.actif ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )
                }
                label="Statut"
                value={
                  service.actif
                    ? "Actif"
                    : "Inactif"
                }
              />

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <h2 className="card-title mb-4">
            <FileText size={21} />
            Description
          </h2>

          <div className="p-4 rounded-box bg-base-200">

            {service.description ? (
              <p className="whitespace-pre-line">
                {service.description}
              </p>
            ) : (
              <p className="text-base-content/50">
                Aucune description renseignée.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div>

        <h2 className="text-xl font-bold mb-4">
          Activité du service
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            icon={<Users size={24} />}
            label="Employés"
            value={service._count.employes}
          />

          <StatCard
            icon={<Stethoscope size={24} />}
            label="Médecins"
            value={service._count.medecins}
          />

          <StatCard
            icon={<ClipboardList size={24} />}
            label="Consultations"
            value={
              service._count.consultations
            }
          />

          <StatCard
            icon={<Hospital size={24} />}
            label="Hospitalisations"
            value={
              service._count.hospitalisations
            }
          />

          <StatCard
            icon={<CalendarDays size={24} />}
            label="Rendez-vous"
            value={
              service._count.rendezVous
            }
          />

          <StatCard
            icon={<Hospital size={24} />}
            label="Admissions"
            value={
              service._count.admissions
            }
          />

          <StatCard
            icon={<BedDouble size={24} />}
            label="Chambres"
            value={
              service._count.chambres
            }
          />

          <StatCard
            icon={<FileText size={24} />}
            label="Examens laboratoire"
            value={
              service._count.demandesLabo
            }
          />

        </div>

      </div>

      {/* =====================================================
          INFORMATIONS SYSTÈME
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <h2 className="card-title mb-4">
            Informations système
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <InfoItem
              icon={<Hash size={18} />}
              label="Identifiant"
              value={String(service.id)}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Créé le"
              value={new Date(
                service.createdAt
              ).toLocaleDateString(
                "fr-FR"
              )}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Dernière modification"
              value={new Date(
                service.updatedAt
              ).toLocaleDateString(
                "fr-FR"
              )}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-box bg-base-200">

      <div className="text-primary mt-0.5">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-base-content/50">
          {label}
        </p>

        <p className="font-medium break-words mt-1">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body">

        <div className="flex items-center justify-between">

          <div className="text-primary">
            {icon}
          </div>

          <span className="text-2xl font-bold">
            {value}
          </span>

        </div>

        <p className="text-sm text-base-content/60">
          {label}
        </p>

      </div>

    </div>
  );
}