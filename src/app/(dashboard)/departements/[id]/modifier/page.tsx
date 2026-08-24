import { getDepartementById } from "@/app/actions/departement";
import DepartementForm from "@/components/departement/DepartementForm";
import Link from "next/link";
import { notFound } from "next/navigation";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ModifierDepartementPage({
  params,
}: Props) {
  const { id } = await params;

  const departementId = Number(id);

  if (Number.isNaN(departementId)) {
    notFound();
  }

  const result = await getDepartementById(
    departementId
  );

  if (!result.success) {
    notFound();
  }

  const departement = result.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-2">
        <Link
          href={`/departements/${departement.id}`}
          className="btn btn-ghost btn-sm"
        >
          ← Retour
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Modifier le département
          </h1>

          <p className="text-base-content/60">
            Modifier les informations de{" "}
            <strong>{departement.nom}</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-6">
          <DepartementForm
            mode="edit"
            initialData={{
              id: departement.id,
              code: departement.code ?? "",
              nom: departement.nom,
              description:
                departement.description ?? "",
              actif: departement.actif,
            }}
          />
        </div>
      </div>
    </div>
  );
}