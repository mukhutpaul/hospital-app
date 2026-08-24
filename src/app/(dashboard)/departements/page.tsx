import { getDepartements } from "@/app/actions/departement";
import DepartementTable from "@/components/departement/DepartementTable";
import Link from "next/link";



export default async function DepartementsPage() {
  const result = await getDepartements();

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          {result.message}
        </div>
      </div>
    );
  }

  const departements = result.data;

  const total = departements.length;

  const actifs = departements.filter(
    (departement) => departement.actif
  ).length;

  const inactifs = total - actifs;

  const totalServices = departements.reduce(
    (total, departement) =>
      total + departement._count.services,
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Départements
          </h1>

          <p className="text-base-content/60">
            Gestion des départements de l'hôpital
          </p>
        </div>

        <Link
          href="/departements/nouveau"
          className="btn btn-primary"
        >
          + Nouveau département
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat rounded-xl border border-base-300 bg-base-100">
          <div className="stat-title">
            Total départements
          </div>
          <div className="stat-value">
            {total}
          </div>
        </div>

        <div className="stat rounded-xl border border-base-300 bg-base-100">
          <div className="stat-title">
            Départements actifs
          </div>
          <div className="stat-value text-success">
            {actifs}
          </div>
        </div>

        <div className="stat rounded-xl border border-base-300 bg-base-100">
          <div className="stat-title">
            Départements inactifs
          </div>
          <div className="stat-value text-error">
            {inactifs}
          </div>
        </div>

        <div className="stat rounded-xl border border-base-300 bg-base-100">
          <div className="stat-title">
            Services
          </div>
          <div className="stat-value text-info">
            {totalServices}
          </div>
        </div>
      </div>

      <DepartementTable
        departements={departements}
      />
    </div>
  );
}