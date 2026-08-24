import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, UserRound } from "lucide-react";

import { prisma } from "@/lib/prisma";
import PatientDetails from "@/components/patients/PatientDetails";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientDetailsPage({ params }: Props) {
  const { id } = await params;

  const patientId = Number(id);

  if (!Number.isInteger(patientId) || patientId <= 0) {
    notFound();
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },

    include: {
      _count: {
        select: {
          allergies: true,
          antecedents: true,
          rendezVous: true,
          admissions: true,
          consultations: true,
          prescriptions: true,
          demandesLabo: true,
          demandesImagerie: true,
          hospitalisations: true,
          factures: true,
          paiements: true,
          documents: true,
          assurances: true,
          constantes: true,
          sorties: true,
        },
      },

      allergies: {
        orderBy: {
          createdAt: "desc",
        },
      },

      antecedents: {
        orderBy: {
          createdAt: "desc",
        },
      },

      rendezVous: {
        orderBy: {
          dateHeure: "desc",
        },
        include: {
          medecin: true,
          specialite: true,
          service: true,
        },
      },

      admissions: {
        orderBy: {
          dateAdmission: "desc",
        },
        include: {
          service: true,
        },
      },

      consultations: {
        orderBy: {
          dateConsultation: "desc",
        },
        include: {
          medecin: true,
          service: true,
          specialite: true,
        },
      },

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

      demandesLabo: {
        orderBy: {
          dateDemande: "desc",
        },
        include: {
          consultation: true,
          lignes: {
            include: {
              examen: true,
            },
          },
        },
      },

      demandesImagerie: {
        orderBy: {
          dateDemande: "desc",
        },
        include: {
          consultation: true,
          examen: true,
        },
      },

      hospitalisations: {
        orderBy: {
          dateEntree: "desc",
        },
        include: {
          service: true,
          medecin: true,
          lit: {
            include: {
              chambre: true,
            },
          },
        },
      },

      factures: {
        orderBy: {
          dateFacture: "desc",
        },
        include: {
          lignes: true,
          paiements: true,
        },
      },

      paiements: {
        orderBy: {
          datePaiement: "desc",
        },
      },

      assurances: {
        include: {
          assurance: true,
        },
      },

      documents: {
        orderBy: {
          dateDocument: "desc",
        },
      },

      constantes: {
        orderBy: {
          dateMesure: "desc",
        },
      },

      sorties: {
        orderBy: {
          dateSortie: "desc",
        },
        include: {
          hospitalisation: true,
        },
      },
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
            <UserRound size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Dossier patient</h1>

            <p className="text-sm text-base-content/60">
              {patient.numeroDossier}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/patients" className="btn btn-ghost gap-2">
            <ArrowLeft size={18} />
            Retour
          </Link>

          <Link
            href={`/patients/${patient.id}/modifier`}
            className="btn btn-primary gap-2"
          >
            <Edit size={18} />
            Modifier
          </Link>
        </div>
      </div>

      {/* =====================================================
          DÉTAILS
      ===================================================== */}

      <PatientDetails patient={patient} />
    </main>
  );
}
