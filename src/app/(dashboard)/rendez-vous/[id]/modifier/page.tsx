import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import RendezVousForm from "@/components/rende-vous/RendezVousForm";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModifierRendezVousPage({
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

  const [
    rendezVous,
    patients,
    medecins,
    specialites,
    services,
  ] = await Promise.all([
    prisma.rendezVous.findUnique({
      where: {
        id: rendezVousId,
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

    prisma.medecin.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        nom: "asc",
      },
      select: {
        id: true,
        matricule: true,
        nom: true,
        postNom: true,
        prenom: true,
        serviceId: true,
        specialiteId: true,
      },
    }),

    prisma.specialite.findMany({
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
        serviceId: true,
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
  ]);

  if (!rendezVous) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">

      <RendezVousForm
        rendezVous={
          rendezVous
        }

        patients={
          patients
        }

        medecins={
          medecins
        }

        specialites={
          specialites
        }

        services={
          services
        }

        mode="edit"
      />

    </div>
  );
}