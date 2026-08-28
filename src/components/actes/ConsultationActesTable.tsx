
"use client";

import Link from "next/link";
import {
  Eye,
  ClipboardList,
} from "lucide-react";

type Props = {
  consultations: any[];
};

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

export default function ConsultationActesTable({
  consultations,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
      <table className="table">
        <thead>
          <tr>
            <th>Consultation</th>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Date</th>
            <th>Actes</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {consultations.map(
            (consultation) => {
              const total =
                consultation.actes.reduce(
                  (
                    somme: number,
                    acte: any,
                  ) =>
                    somme +
                    Number(
                      acte.montant,
                    ),
                  0,
                );

              const devise =
                consultation.actes[0]
                  ?.acte?.devise ??
                "USD";

              return (
                <tr
                  key={
                    consultation.idConsultation
                  }
                >
                  <td>
                    <span className="font-mono font-semibold">
                      CONS-
                      {
                        consultation.idConsultation
                      }
                    </span>
                  </td>

                  <td>
                    <div className="font-semibold">
                      {nomPatient(
                        consultation.patient,
                      )}
                    </div>

                    <div className="text-xs opacity-60">
                      {
                        consultation.patient
                          .numeroDossier
                      }
                    </div>
                  </td>

                  <td>
                    {nomMedecin(
                      consultation.medecin,
                    )}
                  </td>

                  <td>
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
                  </td>

                  <td>
                    <span className="badge badge-primary">
                      {
                        consultation._count
                          ?.actes ?? 0
                      }
                    </span>
                  </td>

                  <td className="font-bold">
                    {total.toFixed(2)}{" "}
                    {devise}
                  </td>

                  <td>
                    <div className="flex justify-end">
                      <Link
                        href={`/actes/consultations/${consultation.idConsultation}`}
                        className="btn btn-sm btn-ghost btn-square"
                        title="Voir les actes"
                      >
                        <Eye size={17} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            },
          )}

          {consultations.length ===
            0 && (
            <tr>
              <td
                colSpan={7}
                className="py-12 text-center"
              >
                <ClipboardList
                  className="mx-auto mb-2 opacity-40"
                  size={35}
                />

                Aucune consultation trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
