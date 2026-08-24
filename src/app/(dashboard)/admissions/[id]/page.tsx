import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import AdmissionDetail from "@/components/admissions/AdmissionDetails";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdmissionDetailPage({
  params,
}: Props) {

  const { id } = await params;

  const admissionId =
    Number(id);

  if (
    !Number.isInteger(admissionId)
  ) {
    notFound();
  }

  const admission =
    await prisma.admission.findUnique({
      where: {
        id: admissionId,
      },

      include: {

        patient: {
          include: {
            allergies: true,
            antecedents: true,
            assurances: {
              include: {
                assurance: true,
              },
            },
          },
        },

        rendezVous: {
          include: {
            medecin: true,
            specialite: true,
            service: true,
          },
        },

        service: true,

        createdBy: true,

        triage: true,

        constantes: {
          orderBy: {
            dateMesure: "desc",
          },
        },

        consultation: {
          include: {
            medecin: true,
            service: true,
            specialite: true,
            constantes: true,
            prescriptions: {
              include: {
                lignes: {
                  include: {
                    medicament: true,
                  },
                },
              },
            },
            demandesLabo: {
              include: {
                lignes: {
                  include: {
                    examen: true,
                  },
                },
              },
            },
            demandesImagerie: {
              include: {
                examen: true,
              },
            },
          },
        },

        hospitalisation: {
          include: {
            service: true,
            medecin: true,
            lit: {
              include: {
                chambre: true,
              },
            },
            transferts: true,
            soins: true,
            sorties: true,
          },
        },
      },
    });

  if (!admission) {
    notFound();
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <Link
          href="/admissions"
          className="btn btn-sm btn-ghost"
        >
          <ArrowLeft size={18} />
          Admissions
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            Détail de l'admission
          </h1>

          <p className="text-sm text-base-content/60">
            Parcours de prise en charge du patient.
          </p>
        </div>

      </div>

      <AdmissionDetail
        admission={admission}
      />

    </div>
  );
}