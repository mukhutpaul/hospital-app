import HospitalisationTable from "@/components/hospitalisations/HospitalisationTable";

import {
  getHospitalisations,
} from "@/app/actions/hospitalisations";

import { prisma } from "@/lib/prisma";

export default async function HospitalisationsPage() {
  /* ==========================================================
     HOSPITALISATIONS
  ========================================================== */

  const hospitalisationsResult =
    await getHospitalisations();

  const hospitalisations =
    hospitalisationsResult.success &&
    Array.isArray(
      hospitalisationsResult.data
    )
      ? hospitalisationsResult.data
      : [];

  /* ==========================================================
     PATIENTS
  ========================================================== */

  const patients =
    await prisma.patient.findMany({
      where: {
        actif: true,
      },

      select: {
        id: true,
        numeroDossier: true,
        nom: true,
        postNom: true,
        prenom: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ==========================================================
     ADMISSIONS
  ========================================================== */

  const admissions =
    await prisma.admission.findMany({
      where: {
        statut: {
          not: "TERMINEE",
        },
      },

      select: {
        id: true,
        numero: true,
        patientId: true,
        type: true,
        statut: true,
      },

      orderBy: {
        dateAdmission: "desc",
      },
    });

  /* ==========================================================
     MÉDECINS
  ========================================================== */

  const medecins =
    await prisma.medecin.findMany({
      where: {
        actif: true,
      },

      select: {
        id: true,
        matricule: true,
        nom: true,
        postNom: true,
        prenom: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ==========================================================
     SERVICES
  ========================================================== */

  const services =
    await prisma.service.findMany({
      where: {
        actif: true,
      },

      select: {
        id: true,
        nom: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ==========================================================
     LITS
  ========================================================== */

  const lits =
    await prisma.lit.findMany({
      where: {
        OR: [
          {
            statut: "LIBRE",
          },
          {
            hospitalisations: {
              some: {
                statut: "EN_COURS",
              },
            },
          },
        ],
      },

      include: {
        chambre: {
          select: {
            id: true,
            numero: true,
            type: true,
          },
        },
      },

      orderBy: [
        {
          chambre: {
            numero: "asc",
          },
        },
        {
          numero: "asc",
        },
      ],
    });

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">
          Hospitalisations
        </h1>

        <p className="text-base-content/60">
          Gestion des séjours hospitaliers
          des patients
        </p>
      </div>

      {/* TABLE */}

      <HospitalisationTable
        hospitalisations={
          hospitalisations
        }
        patients={patients}
        admissions={admissions}
        medecins={medecins}
        services={services}
        lits={lits}
      />

    </div>
  );
}