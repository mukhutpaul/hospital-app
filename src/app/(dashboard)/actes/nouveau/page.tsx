import ActeMedicalForm from "@/components/actes/ActeMedicalForm";



export default function NouveauActeMedicalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Nouvel acte médical
        </h1>

        <p className="text-sm opacity-60">
          Ajouter un nouvel acte au catalogue
          tarifaire.
        </p>
      </div>

      <ActeMedicalForm />
    </div>
  );
}
