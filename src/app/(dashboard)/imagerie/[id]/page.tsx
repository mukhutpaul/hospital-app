import Link from "next/link";

import {
  ArrowLeft,
  ImageIcon,
} from "lucide-react";

import {
  getDemandeImagerie,
} from "@/app/actions/imagerie";

import CompteRenduImagerieForm from "@/components/imagerie/CompteRenduImagerieForm";

export default async function ImagerieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result =
    await getDemandeImagerie(
      Number(id),
    );

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          {result.message}
        </div>
      </div>
    );
  }

  const demande: any =
    result.data;

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/imagerie"
        className="btn btn-ghost btn-sm"
      >
        <ArrowLeft size={18} />
        Retour à l'imagerie
      </Link>

      {/* HEADER */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <ImageIcon />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {demande.numero}
                </h1>

                <p className="text-base-content/60">
                  {demande.examen.nom}
                </p>
              </div>
            </div>

            <span className="badge badge-lg">
              {demande.statut}
            </span>
          </div>
        </div>
      </div>

      {/* INFORMATIONS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <h2 className="font-bold">
              Patient
            </h2>

            <p>
              {
                demande.patient
                  .numeroDossier
              }
            </p>

            <p className="font-medium">
              {demande.patient.nom}{" "}
              {
                demande.patient
                  .postNom
              }{" "}
              {
                demande.patient
                  .prenom
              }
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <h2 className="font-bold">
              Examen
            </h2>

            <p>
              {demande.examen.nom}
            </p>

            <p className="text-sm text-base-content/60">
              Code :{" "}
              {demande.examen.code}
            </p>

            <p className="text-sm">
              Prix :{" "}
              {demande.examen.prix}{" "}
              {
                demande.examen
                  .devise
              }
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <h2 className="font-bold">
              Consultation
            </h2>

            {demande.consultation ? (
              <>
                <p>
                  Consultation #
                  {
                    demande
                      .consultation
                      .idConsultation
                  }
                </p>

                <p>
                  Dr{" "}
                  {
                    demande
                      .consultation
                      .medecin.nom
                  }{" "}
                  {
                    demande
                      .consultation
                      .medecin
                      .prenom
                  }
                </p>

                <Link
                  href={`/consultations/${demande.consultation.idConsultation}`}
                  className="btn btn-sm btn-outline mt-2"
                >
                  Voir consultation
                </Link>
              </>
            ) : (
              <p>
                Aucune consultation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORMULAIRE */}

      <CompteRenduImagerieForm
        demande={demande}
      />
    </div>
  );
}