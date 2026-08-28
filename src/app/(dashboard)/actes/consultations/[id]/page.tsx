
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  User,
  Stethoscope,
  CalendarDays,
  FileText,
  Wallet,
} from "lucide-react";

import {
  getActesConsultation,
  getActesMedicauxActifs,
} from "@/app/actions/actes-medicaux";

import ConsultationActeForm from "@/components/actes/ConsultationActeForm";
import ConsultationActesTable from "@/components/actes/ConsultationActesTableDetails";


function nomPatient(patient: any) {
  return [
    patient?.nom,
    patient?.postNom,
    patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function nomMedecin(medecin: any) {
  return [
    medecin?.nom,
    medecin?.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function ConsultationActesDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const consultationId = Number(id);

  if (!Number.isFinite(consultationId)) {
    notFound();
  }

  const [
    consultationResult,
    actesResult,
  ] = await Promise.all([
    getActesConsultation(consultationId),
    getActesMedicauxActifs(),
  ]);

  if (
    !consultationResult.success ||
    !consultationResult.data
  ) {
    notFound();
  }

  const consultation = consultationResult.data as any;

  const actes = actesResult.success
    ? actesResult.data ?? []
    : [];

  const total = consultation.actes.reduce(
    (somme: number, item: any) =>
      somme + Number(item.montant || 0),
    0,
  );

  const devise =
    consultation.actes[0]?.acte?.devise ??
    "USD";

  return (
    <main className="w-full space-y-6 pb-10">

      {/* =====================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-3">

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList size={25} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Consultation CONS-
                {consultation.idConsultation}
              </h1>

              <span className="badge badge-primary badge-outline">
                {consultation.actes.length} acte
                {consultation.actes.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <p className="mt-1 text-sm text-base-content/60">
              Gestion des actes médicaux réalisés
              pendant cette consultation.
            </p>
          </div>

        </div>

        <Link
          href="/facturation/actes-medicaux/consultations"
          className="btn btn-outline gap-2"
        >
          <ArrowLeft size={18} />
          Retour aux consultations
        </Link>

      </div>


      {/* =====================================================
          INFORMATIONS CONSULTATION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* PATIENT */}

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Patient
                </p>

                <h2 className="font-bold">
                  {nomPatient(
                    consultation.patient,
                  ) || "—"}
                </h2>
              </div>

            </div>

            <div className="mt-3 rounded-xl bg-base-200/60 p-3">
              <p className="text-xs text-base-content/50">
                Numéro de dossier
              </p>

              <p className="font-mono font-semibold">
                {consultation.patient
                  ?.numeroDossier || "—"}
              </p>
            </div>

          </div>
        </div>


        {/* MÉDECIN */}

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
                <Stethoscope size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Médecin
                </p>

                <h2 className="font-bold">
                  {nomMedecin(
                    consultation.medecin,
                  ) || "—"}
                </h2>
              </div>

            </div>

            <div className="mt-3 rounded-xl bg-base-200/60 p-3">
              <p className="text-xs text-base-content/50">
                Professionnel responsable
              </p>

              <p className="font-medium">
                Médecin
              </p>
            </div>

          </div>
        </div>


        {/* DATE */}

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center gap-3">

              <div className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Date de consultation
                </p>

                <h2 className="font-bold">
                  {new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                      dateStyle: "medium",
                    },
                  ).format(
                    new Date(
                      consultation.dateConsultation,
                    ),
                  )}
                </h2>
              </div>

            </div>

            <div className="mt-3 rounded-xl bg-base-200/60 p-3">
              <p className="text-xs text-base-content/50">
                Heure
              </p>

              <p className="font-semibold">
                {new Intl.DateTimeFormat(
                  "fr-FR",
                  {
                    timeStyle: "short",
                  },
                ).format(
                  new Date(
                    consultation.dateConsultation,
                  ),
                )}
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* =====================================================
          FORMULAIRE AJOUT ACTE
      ====================================================== */}

      <ConsultationActeForm
        consultationId={
          consultation.idConsultation
        }
        actes={actes as any[]}
      />


      {/* =====================================================
          RÉSUMÉ FINANCIER
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Nombre d'actes
              </p>

              <p className="mt-1 text-2xl font-bold">
                {consultation.actes.length}
              </p>
            </div>

            <ClipboardList
              className="text-primary"
              size={26}
            />

          </div>

        </div>


        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Devise
              </p>

              <p className="mt-1 text-2xl font-bold">
                {devise}
              </p>
            </div>

            <Wallet
              className="text-info"
              size={26}
            />

          </div>

        </div>


        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-base-content/60">
                Total consultation
              </p>

              <p className="mt-1 text-2xl font-bold text-primary">
                {total.toLocaleString(
                  "fr-FR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}{" "}
                {devise}
              </p>
            </div>

            <FileText
              className="text-primary"
              size={26}
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          TABLEAU DES ACTES
      ====================================================== */}

      <ConsultationActesTable
        actes={
          consultation.actes as any[]
        }
      />

    </main>
  );
}
