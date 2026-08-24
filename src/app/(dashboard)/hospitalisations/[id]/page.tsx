import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HospitalisationDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const hospitalisationId = Number(id);

  if (!Number.isInteger(hospitalisationId)) {
    notFound();
  }

  const hospitalisation =
    await prisma.hospitalisation.findUnique({
      where: {
        id: hospitalisationId,
      },
      include: {
        patient: true,
        service: true,
        medecin: true,
        admission: true,
      },
    });

  if (!hospitalisation) {
    notFound();
  }

  return (
    <main className="p-4 md:p-6 space-y-6">

      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Hospitalisation
        </h1>

        <p className="text-sm text-base-content/60 mt-1">
          Détails de l'hospitalisation
        </p>
      </div>

      {/* ==================================================
          INFORMATIONS
      ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PATIENT */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              Patient
            </h2>

            <div className="space-y-2">

              <p>
                <span className="font-medium">
                  Nom :
                </span>{" "}
                {hospitalisation.patient?.nom}{" "}
                {hospitalisation.patient?.postNom ?? ""}{" "}
                {hospitalisation.patient?.prenom ?? ""}
              </p>

              <p>
                <span className="font-medium">
                  Dossier :
                </span>{" "}
                {hospitalisation.patient?.numeroDossier}
              </p>

            </div>

          </div>
        </div>

        {/* HOSPITALISATION */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              Informations
            </h2>

            <div className="space-y-2">

              <p>
                <span className="font-medium">
                  ID :
                </span>{" "}
                {hospitalisation.id}
              </p>

              <p>
                <span className="font-medium">
                  Statut :
                </span>{" "}
                <span className="badge badge-primary">
                  {hospitalisation.statut}
                </span>
              </p>

              {hospitalisation.dateAdmission && (
                <p>
                  <span className="font-medium">
                    Date d'admission :
                  </span>{" "}
                  {new Date(
                    hospitalisation.dateAdmission,
                  ).toLocaleString("fr-FR")}
                </p>
              )}

            </div>

          </div>
        </div>

        {/* SERVICE */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              Service
            </h2>

            <p>
              {hospitalisation.service?.nom ??
                "Aucun service"}
            </p>

          </div>
        </div>

        {/* MÉDECIN */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">

            <h2 className="card-title">
              Médecin responsable
            </h2>

            <p>
              Dr{" "}
              {hospitalisation.medecin?.nom ?? ""}{" "}
              {hospitalisation.medecin?.postNom ?? ""}{" "}
              {hospitalisation.medecin?.prenom ?? ""}
            </p>

          </div>
        </div>

      </div>

    </main>
  );
}