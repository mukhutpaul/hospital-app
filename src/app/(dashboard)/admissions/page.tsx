import Link from "next/link";
import {
  Plus,
  ClipboardList,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import AdmissionTable from "@/components/admissions/AdmissionTable";


export default async function AdmissionsPage() {
  const admissions =
    await prisma.admission.findMany({
      orderBy: {
        dateAdmission: "desc",
      },

      include: {
        patient: true,
        service: true,
        rendezVous: true,
        triage: true,
        consultation: true,
        hospitalisation: true,
      },
    });

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ClipboardList size={23} />
          </div>

          <div>

            <h1 className="text-2xl font-bold">
              Admissions
            </h1>

            <p className="text-sm text-base-content/60">
              Gestion des admissions des patients.
            </p>

          </div>

        </div>

        <Link
          href="/admissions/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouvelle admission
        </Link>

      </div>

      {/* TABLE */}

      <AdmissionTable
        admissions={admissions}
      />

    </div>
  );
}