import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Pencil,
  Stethoscope,
  UserRound,
  Building2,
  FileText,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import RendezVousActions from "@/components/rende-vous/RendezVousActions";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "full",
      timeStyle: "short",
    }
  ).format(date);
}

function patientName(
  patient: {
    nom: string;
    postNom: string | null;
    prenom: string | null;
  }
) {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function doctorName(
  medecin: {
    nom: string;
    postNom: string | null;
    prenom: string;
  } | null
) {
  if (!medecin) {
    return "Non affecté";
  }

  return [
    medecin.nom,
    medecin.postNom,
    medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function RendezVousDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const rendezVousId =
    Number(id);

  if (
    !Number.isInteger(
      rendezVousId
    ) ||
    rendezVousId <= 0
  ) {
    notFound();
  }

  const rendezVous =
    await prisma.rendezVous.findUnique({
      where: {
        id: rendezVousId,
      },

      include: {
        patient: true,

        medecin: true,

        specialite: true,

        service: true,

        admission: true,
      },
    });

  if (!rendezVous) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <Link
            href="/rendez-vous"
            className="btn btn-sm btn-ghost"
          >
            <ArrowLeft size={18} />

            Retour
          </Link>

          <div>

            <p className="text-sm text-base-content/50">
              Rendez-vous
            </p>

            <h1 className="text-2xl font-bold">
              {rendezVous.numero}
            </h1>

          </div>

        </div>

        <div className="flex gap-2">

          <Link
            href={`/rendez-vous/${rendezVous.id}/modifier`}
            className="btn btn-outline"
          >
            <Pencil size={17} />

            Modifier
          </Link>

          <RendezVousActions
            id={rendezVous.id}
            statut={
              rendezVous.statut
            }
          />

        </div>

      </div>

      {/* PATIENT */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <h2 className="font-semibold text-lg flex items-center gap-2">
            <UserRound
              size={20}
              className="text-primary"
            />

            Patient
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <Info
              label="Nom complet"
              value={patientName(
                rendezVous.patient
              )}
            />

            <Info
              label="Numéro dossier"
              value={
                rendezVous.patient
                  .numeroDossier
              }
            />

            <Info
              label="Téléphone"
              value={
                rendezVous.patient
                  .telephone ||
                "Non renseigné"
              }
            />

          </div>

        </div>

      </div>

      {/* RENDEZ-VOUS */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CalendarDays
              size={20}
              className="text-primary"
            />

            Informations du rendez-vous
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

            <Info
              label="Date et heure"
              value={formatDate(
                rendezVous.dateHeure
              )}
              icon={
                <Clock size={16} />
              }
            />

            <Info
              label="Médecin"
              value={
                rendezVous.medecin
                  ? `Dr ${doctorName(
                      rendezVous.medecin
                    )}`
                  : "Non affecté"
              }
              icon={
                <Stethoscope
                  size={16}
                />
              }
            />

            <Info
              label="Service"
              value={
                rendezVous.service
                  ?.nom ||
                "Non renseigné"
              }
              icon={
                <Building2
                  size={16}
                />
              }
            />

            <Info
              label="Spécialité"
              value={
                rendezVous
                  .specialite
                  ?.nom ||
                "Non renseignée"
              }
            />

            <Info
              label="Statut"
              value={
                rendezVous.statut
              }
            />

            <Info
              label="Admission"
              value={
                rendezVous.admission
                  ?.numero ||
                "Pas encore admis"
              }
            />

          </div>

        </div>

      </div>

      {/* MOTIF */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <h2 className="font-semibold text-lg flex items-center gap-2">

            <FileText
              size={20}
              className="text-primary"
            />

            Motif et observations

          </h2>

          <div className="space-y-4 mt-4">

            <InfoBlock
              label="Motif"
              value={
                rendezVous.motif ||
                "Aucun motif renseigné."
              }
            />

            <InfoBlock
              label="Observation"
              value={
                rendezVous.observation ||
                "Aucune observation."
              }
            />

          </div>

        </div>

      </div>

      {/* ADMISSION */}

      {rendezVous.admission && (
        <div className="alert alert-info">

          <div>

            <p className="font-semibold">
              Ce rendez-vous est lié à une admission.
            </p>

            <p className="text-sm">
              Admission :{" "}
              {rendezVous.admission.numero}
            </p>

          </div>

          <Link
            href={`/admissions/${rendezVous.admission.id}`}
            className="btn btn-sm"
          >
            Voir l'admission
          </Link>

        </div>
      )}

    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>

      <p className="text-sm text-base-content/50">
        {label}
      </p>

      <div className="flex items-center gap-2 mt-1">

        {icon && (
          <span className="text-primary">
            {icon}
          </span>
        )}

        <p className="font-medium">
          {value}
        </p>

      </div>

    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-base-content/50">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap">
        {value}
      </p>

    </div>
  );
}