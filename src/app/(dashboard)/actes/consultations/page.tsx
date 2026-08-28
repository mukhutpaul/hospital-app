
import {
  getConsultationsAvecActes,
} from "@/app/actions/actes-medicaux";
import ConsultationActesTable from "@/components/actes/ConsultationActesTable";



export default async function ConsultationsActesPage() {
  const result =
    await getConsultationsAvecActes();

  const consultations =
    result.success
      ? result.data ?? []
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Actes de consultation
        </h1>

        <p className="text-sm opacity-60">
          Liste des actes médicaux réalisés dans les
          consultations.
        </p>
      </div>

      {!result.success && (
        <div className="alert alert-error">
          {result.message}
        </div>
      )}

      <ConsultationActesTable
        consultations={
          consultations as any[]
        }
      />
    </div>
  );
}
