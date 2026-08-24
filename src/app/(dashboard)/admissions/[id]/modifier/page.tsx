import { notFound } from "next/navigation";

import AdmissionForm from "@/components/admissions/AdmissionForm";

import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModifierAdmissionPage({
  params,
}: Props) {
  const { id } = await params;

  const admissionId =
    Number(id);

  if (
    !Number.isInteger(
      admissionId
    )
  ) {
    notFound();
  }

  const [
    admission,
    patients,
    services,
    rendezVous,
  ] = await Promise.all([
    prisma.admission.findUnique({
      where: {
        id: admissionId,
      },

      select: {
        id: true,
        numero: true,

        patientId: true,

        rendezVousId: true,

        serviceId: true,

        type: true,

        motif: true,

        statut: true,

        dateAdmission: true,
      },
    }),

    prisma.patient.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },

      select: {
        id: true,
        numeroDossier: true,
        nom: true,
        postNom: true,
        prenom: true,
        telephone: true,
      },
    }),

    prisma.service.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },

      select: {
        id: true,
        code: true,
        nom: true,
      },
    }),

    prisma.rendezVous.findMany({
      orderBy: {
        dateHeure: "desc",
      },

      select: {
        id: true,
        numero: true,
        patientId: true,
        dateHeure: true,
        motif: true,
        statut: true,
      },
    }),
  ]);

  if (!admission) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <AdmissionForm
        patients={patients}
        services={services}
        rendezVous={rendezVous}
        admission={admission}
        mode="edit"
      />
    </div>
  );
}