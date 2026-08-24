import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  UserRound,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import PatientForm from "@/components/patients/PatientForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModifierPatientPage({
  params,
}: Props) {
  const { id } = await params;

  const patientId = Number(id);

  if (!Number.isInteger(patientId) || patientId <= 0) {
    notFound();
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
            <Edit size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Modifier le patient
            </h1>

            <p className="text-sm text-base-content/60">
              Dossier : {patient.numeroDossier}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <Link
            href={`/patients/${patient.id}`}
            className="btn btn-ghost gap-2"
          >
            <UserRound size={18} />
            Voir le dossier
          </Link>

          <Link
            href="/patients"
            className="btn btn-outline gap-2"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

        </div>

      </div>

      {/* =====================================================
          FORMULAIRE
      ===================================================== */}

      <div className="max-w-5xl">

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <PatientForm
              patient={patient}
              mode="edit"
            />

          </div>

        </div>

      </div>

    </main>
  );
}