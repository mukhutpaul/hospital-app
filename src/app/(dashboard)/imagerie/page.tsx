import Link from "next/link";
import { Eye, ImageIcon } from "lucide-react";

import {
  getDemandesImagerie,
} from "@/app/actions/imagerie";

export default async function ImageriePage() {
  const result =
    await getDemandesImagerie();

  const demandes =
    result.success && Array.isArray(result.data)
      ? result.data
      : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Imagerie médicale
        </h1>

        <p className="text-base-content/60">
          Gestion des examens et comptes rendus
          d'imagerie
        </p>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Patient</th>
                  <th>Examen</th>
                  <th>Date demande</th>
                  <th>Urgence</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {demandes.map(
                  (demande: any) => (
                    <tr
                      key={demande.id}
                    >
                      <td className="font-bold">
                        {demande.numero}
                      </td>

                      <td>
                        {demande.patient.nom}{" "}
                        {
                          demande.patient
                            .postNom
                        }{" "}
                        {
                          demande.patient
                            .prenom
                        }
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <ImageIcon
                            size={17}
                          />

                          {
                            demande.examen
                              .nom
                          }
                        </div>
                      </td>

                      <td>
                        {new Date(
                          demande.dateDemande,
                        ).toLocaleString(
                          "fr-FR",
                        )}
                      </td>

                      <td>
                        {demande.urgence ? (
                          <span className="badge badge-error">
                            URGENT
                          </span>
                        ) : (
                          <span className="badge">
                            Normal
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            demande.statut ===
                            "TERMINE"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {
                            demande.statut
                          }
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/imagerie/${demande.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          <Eye
                            size={16}
                          />
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  ),
                )}

                {demandes.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12"
                    >
                      Aucune demande
                      d'imagerie.
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