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

  const consultations =
    consultationsResult.success
      ? consultationsResult.data ?? []
      : [];

  const patients =
    patientsResult.success
      ? patientsResult.data ?? []
      : [];

  const services =
    servicesResult.success
      ? servicesResult.data ?? []
      : [];

  const specialites =
    specialitesResult.success
      ? specialitesResult.data ?? []
      : [];

  const admissions =
    admissionsResult.success
      ? admissionsResult.data ?? []
      : [];

  const medecinConnecte =
    medecinResult.success
      ? medecinResult.data
      : null;

  return (
    <main className="p-4 md:p-6 space-y-6">

      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Consultations
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Gestion des consultations
            médicales.
          </p>
        </div>

        {medecinConnecte ? (
          <ConsultationModal
            patients={patients}
            medecinConnecte={
              medecinConnecte
            }
            services={services}
            specialites={specialites}
            admissions={admissions}
          />
        ) : (
          <div className="alert alert-error max-w-md">
            <span>
              {medecinResult.message ||
                "Médecin connecté introuvable."}
            </span>
          </div>
        )}
      </div>

      {/* ==================================================
          STATISTIQUES
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <p className="text-sm text-base-content/60">
              Total consultations
            </p>

            <p className="text-3xl font-bold">
              {consultations.length}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <p className="text-sm text-base-content/60">
              Avec diagnostic
            </p>

            <p className="text-3xl font-bold">
              {
                consultations.filter(
                  (c: any) =>
                    c.diagnostic?.trim(),
                ).length
              }
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <p className="text-sm text-base-content/60">
              Avec prescription
            </p>

            <p className="text-3xl font-bold">
              {
                consultations.filter(
                  (c: any) =>
                    c.prescriptions
                      ?.length > 0,
                ).length
              }
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <p className="text-sm text-base-content/60">
              Avec laboratoire
            </p>

            <p className="text-3xl font-bold">
              {
                consultations.filter(
                  (c: any) =>
                    c.demandesLabo
                      ?.length > 0,
                ).length
              }
            </p>
          </div>
        </div>

      </div>

      {/* ==================================================
          TABLEAU
      ================================================== */}

      <ConsultationTable
        consultations={
          consultations
        }
      />

    </main>
  );
}