import { getDepartementById } from "@/app/actions/departement";
import Link from "next/link";
import { notFound } from "next/navigation";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DepartementDetailsPage({
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

  const services = departement.services;

  const totalEmployes = services.reduce(
    (total, service) =>
      total + service._count.employes,
    0
  );

  const totalMedecins = services.reduce(
    (total, service) =>
      total + service._count.medecins,
    0
  );

  const totalChambres = services.reduce(
    (total, service) =>
      total + service._count.chambres,
    0
  );

  const totalConsultations = services.reduce(
    (total, service) =>
      total + service._count.consultations,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/departements"
              className="btn btn-sm btn-ghost"
            >
              ← Départements
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {departement.nom}
            </h1>

            {departement.actif ? (
              <span className="badge badge-success">
                Actif
              </span>
            ) : (
              <span className="badge badge-error">
                Inactif
              </span>
            )}
          </div>

          <p className="text-base-content/60 mt-1">
            {departement.description ||
              "Aucune description"}
          </p>
        </div>

        <Link
          href={`/departements/${departement.id}/modifier`}
          className="btn btn-primary"
        >
          Modifier
        </Link>
      </div>

      {/* INFORMATIONS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-base-300 bg-base-100 p-5">
          <div className="text-sm text-base-content/50">
            Code
          </div>

          <div className="font-semibold text-lg mt-1">
            {departement.code || "—"}
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-5">
          <div className="text-sm text-base-content/50">
            Nombre de services
          </div>

          <div className="font-semibold text-lg mt-1">
            {departement._count.services}
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}

      <div>
        <h2 className="text-lg font-bold mb-4">
          Statistiques
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">
              Services
            </div>

            <div className="stat-value text-info">
              {services.length}
            </div>
          </div>

          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">
              Médecins
            </div>

            <div className="stat-value text-primary">
              {totalMedecins}
            </div>
          </div>

          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">
              Employés
            </div>

            <div className="stat-value">
              {totalEmployes}
            </div>
          </div>

          <div className="stat rounded-xl border border-base-300 bg-base-100">
            <div className="stat-title">
              Chambres
            </div>

            <div className="stat-value text-secondary">
              {totalChambres}
            </div>
          </div>
        </div>
      </div>

      {/* CONSULTATIONS */}

      <div className="rounded-xl border border-base-300 bg-base-100 p-5">
        <div className="text-sm text-base-content/60">
          Consultations enregistrées
        </div>

        <div className="text-3xl font-bold mt-1">
          {totalConsultations}
        </div>
      </div>

      {/* SERVICES */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">
              Services du département
            </h2>

            <p className="text-sm text-base-content/60">
              Services rattachés à ce département.
            </p>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
            <h3 className="font-semibold">
              Aucun service
            </h3>

            <p className="text-sm text-base-content/60 mt-1">
              Aucun service n'est encore rattaché à ce
              département.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Service</th>
                  <th>Médecins</th>
                  <th>Employés</th>
                  <th>Chambres</th>
                  <th>Consultations</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="badge badge-outline">
                        {service.code}
                      </span>
                    </td>

                    <td>
                      <div className="font-semibold">
                        {service.nom}
                      </div>

                      {service.description && (
                        <div className="text-xs text-base-content/50">
                          {service.description}
                        </div>
                      )}
                    </td>

                    <td>
                      {service._count.medecins}
                    </td>

                    <td>
                      {service._count.employes}
                    </td>

                    <td>
                      {service._count.chambres}
                    </td>

                    <td>
                      {service._count.consultations}
                    </td>

                    <td>
                      {service.actif ? (
                        <span className="badge badge-success">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          Inactif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}