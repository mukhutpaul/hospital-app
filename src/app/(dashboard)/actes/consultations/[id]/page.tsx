
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Edit,
} from "lucide-react";

import {
  getActesConsultation,
  getActesMedicauxActifs,
  deleteConsultationActe,
} from "@/app/actions/actes-medicaux";
import ConsultationActeForm from "@/components/actes/ConsultationActeForm";



function nomPatient(patient: any) {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function nomMedecin(medecin: any) {
  return [
    medecin.nom,
    medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function ConsultationActesDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const consultationId =
    Number(id);

  const [
    consultationResult,
    actesResult,
  ] = await Promise.all([
    getActesConsultation(
      consultationId,
    ),
    getActesMedicauxActifs(),
  ]);

  if (
    !consultationResult.success ||
    !consultationResult.data
  ) {
    notFound();
  }

  const consultation =
    consultationResult.data as any;

  const actes =
    actesResult.success
      ? actesResult.data ?? []
      : [];

  const total =
    consultation.actes.reduce(
      (
        somme: number,
        item: any,
      ) =>
        somme +
        Number(item.montant),
      0,
    );

  const devise =
    consultation.actes[0]?.acte
      ?.devise ?? "USD";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Consultation CONS-
            {consultation.idConsultation}
          </h1>

          <p className="text-sm opacity-60">
            Gestion des actes médicaux réalisés.
          </p>
        </div>

        <Link
          href="/facturation/actes-medicaux/consultations"
          className="btn btn-ghost"
        >
          <ArrowLeft size={18} />

          Retour
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              Patient
            </h2>

            <p className="text-lg font-bold">
              {nomPatient(
                consultation.patient,
              )}
            </p>

            <p className="text-sm opacity-60">
              Dossier :{" "}
              {
                consultation.patient
                  .numeroDossier
              }
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              Consultation
            </h2>

            <p>
              <strong>Médecin :</strong>{" "}
              {nomMedecin(
                consultation.medecin,
              )}
            </p>

            <p>
              <strong>Date :</strong>{" "}
              {new Intl.DateTimeFormat(
                "fr-FR",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                },
              ).format(
                new Date(
                  consultation.dateConsultation,
                ),
              )}
            </p>
          </div>
        </div>
      </div>

      <ConsultationActeForm
        consultationId={
          consultation.idConsultation
        }
        actes={actes as any[]}
      />

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">
                Actes réalisés
              </h2>

              <p className="text-sm opacity-60">
                {consultation.actes.length} acte(s)
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-60">
                Total
              </p>

              <p className="text-2xl font-bold text-primary">
                {total.toFixed(2)}{" "}
                {devise}
              </p>
            </div>
          </div>

          <div className="divider" />

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Acte</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Montant</th>
                  <th>Observation</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {consultation.actes.map(
                  (item: any) => (
                    <tr key={item.id}>
                      <td className="font-mono">
                        {item.acte.code}
                      </td>

                      <td className="font-semibold">
                        {item.acte.libelle}
                      </td>

                      <td>
                        {Number(
                          item.quantite,
                        ).toFixed(2)}
                      </td>

                      <td>
                        {Number(
                          item.prixUnitaire,
                        ).toFixed(2)}{" "}
                        {item.acte.devise}
                      </td>

                      <td className="font-bold">
                        {Number(
                          item.montant,
                        ).toFixed(2)}{" "}
                        {item.acte.devise}
                      </td>

                      <td>
                        {item.observation ||
                          "-"}
                      </td>

                      <td>
                        <form
                          action={async () => {
                            "use server";

                            await deleteConsultationActe(
                              item.id,
                            );
                          }}
                        >
                          <button
                            type="submit"
                            className="btn btn-sm btn-error btn-outline btn-square"
                            title="Supprimer"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ),
                )}

                {consultation.actes
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center opacity-60"
                    >
                      Aucun acte ajouté à cette
                      consultation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
