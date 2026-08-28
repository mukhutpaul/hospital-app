import { getAdmissionsPourTriage } from "@/app/actions/triages";
import TriageForm from "@/components/triages/TriageForm";

export default async function NouveauTriagePage() {
  const result =
    await getAdmissionsPourTriage();

  const admissions =
    result.success
      ? result.data ?? []
      : [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Nouveau triage
        </h1>

        <p className="mt-1 text-base-content/60">
          Évaluez l'état initial du patient
          avant sa prise en charge médicale.
        </p>
      </div>

      {!result.success && (
        <div className="alert alert-error">
          {result.message}
        </div>
      )}

      {admissions.length === 0 ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6">
          <h2 className="text-lg font-bold">
            Aucune admission disponible
          </h2>

          <p className="mt-1 text-sm opacity-70">
            Toutes les admissions actives
            possèdent déjà un triage.
          </p>
        </div>
      ) : (
        <TriageForm
          admissions={admissions as any[]}
        />
      )}
    </div>
  );
}