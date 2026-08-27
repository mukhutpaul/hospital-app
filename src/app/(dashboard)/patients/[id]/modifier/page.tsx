import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
import PatientForm from "@/components/patients/PatientForm";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getPatient(Number(id));
  if (!r.success) notFound();
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Modifier le patient</h1>
        <p className="text-base-content/60">
          Mise à jour du dossier administratif.
        </p>
      </div>
      <PatientForm initial={r.data} />
    </main>
  );
}
