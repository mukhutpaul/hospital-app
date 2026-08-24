import DepartementForm from "@/components/departement/DepartementForm";
import Link from "next/link";


export default function NouveauDepartementPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/departements"
          className="btn btn-ghost btn-sm"
        >
          ← Retour aux départements
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Nouveau département
          </h1>

          <p className="text-base-content/60">
            Ajouter un nouveau département à l'hôpital.
          </p>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-6">
          <DepartementForm mode="create" />
        </div>
      </div>
    </div>
  );
}