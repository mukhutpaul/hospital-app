
import { notFound } from "next/navigation";

import {
  getActeMedicalById,
} from "@/app/actions/actes-medicaux";
import ActeMedicalForm from "@/components/actes/ActeMedicalForm";



export default async function ModifierActeMedicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result =
    await getActeMedicalById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Modifier l'acte médical
        </h1>

        <p className="text-sm opacity-60">
          Modifier les informations et le tarif.
        </p>
      </div>

      <ActeMedicalForm
        acte={result.data as any}
      />
    </div>
  );
}
