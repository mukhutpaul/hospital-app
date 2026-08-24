import AdmissionForm from "@/components/admissions/AdmissionForm";
import { prisma } from "@/lib/prisma";

export default async function NouvelleAdmissionPage() {
  const [
    patients,
    services,
    rendezVous,
  ] = await Promise.all([
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
      where: {
        statut: {
          in: [
            "PLANIFIE",
            "CONFIRME",
          ],
        },
      },

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

  return (
    <div className="p-4 md:p-6">
      <AdmissionForm
        patients={patients}
        services={services}
        rendezVous={rendezVous}
      />
    </div>
  );
}