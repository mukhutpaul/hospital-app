import ConsultationTable from "@/components/consultations/ConsultationTable";
import ConsultationModal from "@/components/consultations/ConsultationModal";

import {
getConsultations,
getPatientsPourConsultation,
getServicesPourConsultation,
getSpecialitesPourConsultation,
getAdmissionsPourConsultation,
getMedecinConnecte,
} from "@/app/actions/consultations";

import {
Activity,
ClipboardCheck,
FileText,
FlaskConical,
Stethoscope,
} from "lucide-react";

export default async function ConsultationsPage() {
const [
consultationsResult,
patientsResult,
servicesResult,
specialitesResult,
admissionsResult,
medecinResult,
] = await Promise.all([
getConsultations(),
getPatientsPourConsultation(),
getServicesPourConsultation(),
getSpecialitesPourConsultation(),
getAdmissionsPourConsultation(),
getMedecinConnecte(),
]);

/* ========================================================
DONNÉES
======================================================== */

const consultations = consultationsResult.success
? consultationsResult.data ?? []
: [];

const patients = patientsResult.success
? patientsResult.data ?? []
: [];

const services = servicesResult.success
? servicesResult.data ?? []
: [];

const specialites = specialitesResult.success
? specialitesResult.data ?? []
: [];

const admissions = admissionsResult.success
? admissionsResult.data ?? []
: [];

const medecinConnecte = medecinResult.success
? medecinResult.data
: null;

/* ========================================================
STATISTIQUES
======================================================== */

const totalConsultations = consultations.length;

const avecDiagnostic = consultations.filter(
(c: any) => c.diagnostic?.trim(),
).length;

const avecPrescription = consultations.filter(
(c: any) => c.prescriptions?.length > 0,
).length;

const avecLaboratoire = consultations.filter(
(c: any) => c.demandesLabo?.length > 0,
).length;

return ( <main className="min-h-full space-y-6 p-4 md:p-6">

```
  {/* ==================================================
      EN-TÊTE
  ================================================== */}

  <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

    <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Stethoscope size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Consultations
          </h1>

          <p className="mt-1 text-sm text-base-content/60">
            Gestion des consultations médicales.
          </p>
        </div>

      </div>

      <div>
        {medecinConnecte ? (
          <ConsultationModal
            patients={patients}
            medecinConnecte={medecinConnecte}
            services={services}
            specialites={specialites}
            admissions={admissions}
          />
        ) : (
          <div className="alert alert-error">
            <Activity size={18} />

            <span>
              {medecinResult.message ||
                "Médecin connecté introuvable."}
            </span>
          </div>
        )}
      </div>

    </div>

  </section>

  {/* ==================================================
      STATISTIQUES
  ================================================== */}

  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

    {/* TOTAL */}

    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      <div className="flex items-center justify-between p-5">

        <div>
          <p className="text-sm text-base-content/60">
            Total consultations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalConsultations}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardCheck size={22} />
        </div>

      </div>

    </div>

    {/* DIAGNOSTIC */}

    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      <div className="flex items-center justify-between p-5">

        <div>
          <p className="text-sm text-base-content/60">
            Avec diagnostic
          </p>

          <p className="mt-2 text-3xl font-bold">
            {avecDiagnostic}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
          <FileText size={22} />
        </div>

      </div>

    </div>

    {/* PRESCRIPTION */}

    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      <div className="flex items-center justify-between p-5">

        <div>
          <p className="text-sm text-base-content/60">
            Avec prescription
          </p>

          <p className="mt-2 text-3xl font-bold">
            {avecPrescription}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <FileText size={22} />
        </div>

      </div>

    </div>

    {/* LABORATOIRE */}

    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

      <div className="flex items-center justify-between p-5">

        <div>
          <p className="text-sm text-base-content/60">
            Avec laboratoire
          </p>

          <p className="mt-2 text-3xl font-bold">
            {avecLaboratoire}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
          <FlaskConical size={22} />
        </div>

      </div>

    </div>

  </section>

  {/* ==================================================
      TABLEAU
  ================================================== */}

  <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

    {/* HEADER */}

    <div className="border-b border-base-300 bg-base-200/30 p-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Liste des consultations
            </h2>

            <p className="text-sm text-base-content/60">
              Consultez les consultations enregistrées.
            </p>
          </div>

        </div>

        <span className="badge badge-primary badge-outline px-3 py-3">
          {totalConsultations} consultation
          {totalConsultations !== 1 ? "s" : ""}
        </span>

      </div>

    </div>

    {/* TABLEAU */}

    <div className="w-full">

      <ConsultationTable
        consultations={consultations}
      />

    </div>

  </section>

</main>


);
}
