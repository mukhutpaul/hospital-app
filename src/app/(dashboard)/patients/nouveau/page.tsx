import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import PatientForm from "@/components/patients/PatientForm";

export default function NouveauPatientPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
            <UserPlus size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Nouveau patient
            </h1>

            <p className="text-sm text-base-content/60">
              Enregistrer un nouveau patient dans le système
            </p>
          </div>

        </div>

        <Link
          href="/patients"
          className="btn btn-ghost gap-2"
        >
          <ArrowLeft size={18} />

          Retour aux patients
        </Link>

      </div>

      {/* =====================================================
          FORMULAIRE
      ===================================================== */}

      <div className="max-w-5xl">

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <PatientForm />

          </div>

        </div>

      </div>

    </main>
  );
}