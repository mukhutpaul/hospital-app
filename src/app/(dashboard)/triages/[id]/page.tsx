import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  HeartPulse,
  User,
} from "lucide-react";

import { getTriageById } from "@/app/actions/triages";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function patientName(patient: any) {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function niveauClass(
  niveau: string | null,
) {
  switch (niveau) {
    case "CRITIQUE":
      return "badge-error";

    case "URGENT":
      return "badge-warning";

    case "PRIORITAIRE":
      return "badge-secondary";

    default:
      return "badge-success";
  }
}

export default async function TriageDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const result = await getTriageById(
    Number(id),
  );

  if (!result.success || !result.data) {
    notFound();
  }

  const triage = result.data as any;
  const patient =
    triage.admission.patient;

  const constantes =
    triage.admission.constantes?.[0];

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/triages"
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">
              Triage #{triage.id}
            </h1>

            <p className="text-sm text-base-content/60">
              Admission{" "}
              {triage.admission.numero}
            </p>
          </div>
        </div>

        <Link
          href={`/triages/${triage.id}/modifier`}
          className="btn btn-primary"
        >
          <Edit size={17} />
          Modifier
        </Link>
      </div>

      {/* PATIENT */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <User size={22} />
            </div>

            <div>
              <p className="text-sm text-base-content/60">
                Patient
              </p>

              <h2 className="text-xl font-bold">
                {patientName(patient)}
              </h2>

              <p className="text-sm">
                Dossier :{" "}
                <strong>
                  {patient.numeroDossier}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRIAGE */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">
              Évaluation du triage
            </h2>

            <span
              className={`badge ${niveauClass(
                triage.niveauUrgence,
              )} badge-lg`}
            >
              {triage.niveauUrgence ||
                "NORMAL"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoBox
              title="Motif"
              value={
                triage.motif ||
                "Non renseigné"
              }
            />

            <InfoBox
              title="Observation"
              value={
                triage.observation ||
                "Aucune observation"
              }
            />

            <InfoBox
              title="Service"
              value={
                triage.admission
                  .service?.nom ||
                "Non renseigné"
              }
            />

            <InfoBox
              title="Date du triage"
              value={new Date(
                triage.dateTriage,
              ).toLocaleString(
                "fr-FR",
              )}
            />
          </div>
        </div>
      </section>

      {/* CONSTANTES */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-info/10 p-3 text-info">
              <HeartPulse size={22} />
            </div>

            <div>
              <h2 className="card-title">
                Constantes vitales
              </h2>

              <p className="text-sm opacity-60">
                Dernières constantes liées
                à cette admission.
              </p>
            </div>
          </div>

          {constantes ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Vital
                label="Température"
                value={
                  constantes.temperature
                    ? `${constantes.temperature} °C`
                    : "-"
                }
              />

              <Vital
                label="Tension"
                value={
                  constantes.tensionSystolique &&
                  constantes.tensionDiastolique
                    ? `${constantes.tensionSystolique}/${constantes.tensionDiastolique} mmHg`
                    : "-"
                }
              />

              <Vital
                label="Pouls"
                value={
                  constantes.pouls
                    ? `${constantes.pouls} bpm`
                    : "-"
                }
              />

              <Vital
                label="Saturation"
                value={
                  constantes.saturation
                    ? `${constantes.saturation} %`
                    : "-"
                }
              />

              <Vital
                label="Poids"
                value={
                  constantes.poids
                    ? `${constantes.poids} kg`
                    : "-"
                }
              />

              <Vital
                label="Taille"
                value={
                  constantes.taille
                    ? `${constantes.taille} cm`
                    : "-"
                }
              />

              <Vital
                label="FR"
                value={
                  constantes.frequenceRespiratoire
                    ? `${constantes.frequenceRespiratoire} c/min`
                    : "-"
                }
              />

              <Vital
                label="Glycémie"
                value={
                  constantes.glycemie
                    ? `${constantes.glycemie} g/L`
                    : "-"
                }
              />

              <Vital
                label="Mesurée le"
                value={new Date(
                  constantes.dateMesure,
                ).toLocaleString(
                  "fr-FR",
                )}
              />
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-base-200 p-5 text-center text-sm opacity-60">
              Aucune constante enregistrée.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-base-200 p-4">
      <p className="text-xs text-base-content/50">
        {title}
      </p>

      <p className="mt-1 whitespace-pre-wrap font-medium">
        {value}
      </p>
    </div>
  );
}

function Vital({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <p className="text-xs text-base-content/50">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}