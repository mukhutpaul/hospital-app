import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import ConsultationDetails from "@/components/consultations/ConsultationDetails";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConsultationDetailsPage({
  params,
}: Props) {
  /* ========================================================
     PARAMÈTRE
  ======================================================== */

  const { id } = await params;

  const consultationId = Number(id);

  if (!Number.isInteger(consultationId)) {
    notFound();
  }

  /* ========================================================
     CONSULTATION
  ======================================================== */

  const consultation =
    await prisma.consultation.findUnique({
      where: {
        idConsultation: consultationId,
      },

      include: {
        /* ====================================================
           PATIENT
        ==================================================== */

        patient: true,

        /* ====================================================
           MÉDECIN
        ==================================================== */

        medecin: {
          include: {
            specialite: true,
            service: true,
          },
        },

        /* ====================================================
           SERVICE
        ==================================================== */

        service: true,

        /* ====================================================
           SPÉCIALITÉ
        ==================================================== */

        specialite: true,

        /* ====================================================
           ADMISSION
        ==================================================== */

        admission: true,

        /* ====================================================
           CONSTANTES
        ==================================================== */

        constantes: {
          orderBy: {
            dateMesure: "desc",
          },
        },

        /* ====================================================
           PRESCRIPTIONS
        ==================================================== */

        prescriptions: {
          orderBy: {
            datePrescription: "desc",
          },

          include: {
            medecin: true,

            lignes: {
              include: {
                medicament: true,
              },
            },
          },
        },

        /* ====================================================
           DEMANDES LABORATOIRE
        ==================================================== */

        demandesLabo: {
          orderBy: {
            dateDemande: "desc",
          },

          include: {
            service: true,

            /* ----------------------------------------------
               EXAMENS DEMANDÉS
            ---------------------------------------------- */

            lignes: {
              include: {
                examen: true,
              },
            },

            /* ----------------------------------------------
               RÉSULTATS
               
               IMPORTANT :
               ResultatLaboratoire ne possède pas directement
               de relation "examen".
            ---------------------------------------------- */

            resultats: {
              orderBy: {
                dateResultat: "desc",
              },
            },
          },
        },

        /* ====================================================
           DEMANDES IMAGERIE
        ==================================================== */

        demandesImagerie: {
          orderBy: {
            dateDemande: "desc",
          },

          include: {
            examen: true,
            service: true,
          },
        },
      },
    });

  /* ========================================================
     CONSULTATION INTROUVABLE
  ======================================================== */

  if (!consultation) {
    notFound();
  }

  /* ========================================================
     CATALOGUE DES MÉDICAMENTS
  ======================================================== */

  const medicaments =
    await prisma.medicament.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ========================================================
     CATALOGUE DES EXAMENS LABORATOIRE
  ======================================================== */

  const examensLaboratoire =
    await prisma.examenLaboratoire.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ========================================================
     CATALOGUE DES EXAMENS IMAGERIE
  ======================================================== */

  const examensImagerie =
    await prisma.examenImagerie.findMany({
      where: {
        actif: true,
      },

      orderBy: {
        nom: "asc",
      },
    });

  /* ========================================================
     AFFICHAGE
  ======================================================== */

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6">
      <ConsultationDetails
        consultation={consultation}
        medicaments={medicaments}
        examensLaboratoire={examensLaboratoire}
        examensImagerie={examensImagerie}
      />
    </div>
  );
}