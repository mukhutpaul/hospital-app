import Link from "next/link";
import {
  Plus,
  Users,
  UserPlus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import PatientTable from "@/components/patients/PatientTable";
import PatientStats from "@/components/patients/PatientStats";

export default async function PatientsPage() {
  /*
  |--------------------------------------------------------------------------
  | RÉCUPÉRATION DES PATIENTS
  |--------------------------------------------------------------------------
  */

  const patients = await prisma.patient.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          rendezVous: true,
          admissions: true,
          consultations: true,
          prescriptions: true,
          hospitalisations: true,
          factures: true,
          paiements: true,
          demandesLabo: true,
          demandesImagerie: true,
          documents: true,
          assurances: true,
          constantes: true,
          allergies: true,
          antecedents: true,
          sorties: true,
        },
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | STATISTIQUES
  |--------------------------------------------------------------------------
  */

  const [
    total,
    actifs,
    inactifs,
    hommes,
    femmes,
  ] = await Promise.all([
    prisma.patient.count(),

    prisma.patient.count({
      where: {
        actif: true,
      },
    }),

    prisma.patient.count({
      where: {
        actif: false,
      },
    }),

    prisma.patient.count({
      where: {
        sexe: "M",
      },
    }),

    prisma.patient.count({
      where: {
        sexe: "F",
      },
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Patients
              </h1>

              <p className="text-sm text-base-content/60">
                Gestion des dossiers et informations des patients
              </p>
            </div>

          </div>
        </div>

        <Link
          href="/patients/nouveau"
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />

          Nouveau patient
        </Link>

      </div>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <PatientStats
        total={total}
        actifs={actifs}
        inactifs={inactifs}
        hommes={hommes}
        femmes={femmes}
      />

      {/* =====================================================
          TABLEAU DES PATIENTS
      ===================================================== */}

      <div className="space-y-3">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold">
              Liste des patients
            </h2>

            <p className="text-sm text-base-content/60">
              Consultez et gérez les dossiers patients.
            </p>
          </div>

          <div className="badge badge-primary badge-outline gap-1">
            <UserPlus size={14} />

            {total} patient{total > 1 ? "s" : ""}
          </div>

        </div>

        <PatientTable
          patients={patients}
        />

      </div>

    </main>
  );
}