"use client";

import Link from "next/link";

import {
  CalendarDays,
  Eye,
  Pencil,
  Stethoscope,
  UserRound,
} from "lucide-react";

type RendezVous = {
  id: number;
  numero: string;

  patient: {
    id: number;
    numeroDossier: string;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    telephone: string | null;
  };

  medecin: {
    id: number;
    matricule: string;
    nom: string;
    postNom: string | null;
    prenom: string;
  } | null;

  specialite: {
    id: number;
    code: string;
    nom: string;
  } | null;

  service: {
    id: number;
    code: string;
    nom: string;
  } | null;

  dateHeure: Date | string;

  motif: string | null;

  statut: string;

  observation: string | null;

  admission?: {
    id: number;
    numero: string;
    statut: string;
  } | null;
};

type Props = {
  rendezVous: RendezVous[];
};

function formatDate(
  value: Date | string
) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getPatientName(
  patient: RendezVous["patient"]
) {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function getDoctorName(
  medecin: RendezVous["medecin"]
) {
  if (!medecin) {
    return "Non affecté";
  }

  return [
    medecin.nom,
    medecin.postNom,
    medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function statusClass(
  statut: string
) {
  switch (statut) {
    case "CONFIRME":
      return "badge-success";

    case "ANNULE":
      return "badge-error";

    case "TERMINE":
      return "badge-info";

    case "ABSENT":
      return "badge-warning";

    default:
      return "badge-primary";
  }
}

function statusLabel(
  statut: string
) {
  switch (statut) {
    case "PLANIFIE":
      return "Planifié";

    case "CONFIRME":
      return "Confirmé";

    case "ANNULE":
      return "Annulé";

    case "TERMINE":
      return "Terminé";

    case "ABSENT":
      return "Absent";

    default:
      return statut;
  }
}

export default function RendezVousTable({
  rendezVous,
}: Props) {
  if (!rendezVous.length) {
    return (
      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body items-center text-center py-16">

          <CalendarDays
            size={48}
            className="text-base-content/30"
          />

          <h3 className="font-semibold text-lg">
            Aucun rendez-vous
          </h3>

          <p className="text-sm text-base-content/60">
            Aucun rendez-vous n'a encore été enregistré.
          </p>

          <Link
            href="/rendez-vous/nouveau"
            className="btn btn-primary mt-3"
          >
            Nouveau rendez-vous
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body p-0">

        <div className="overflow-x-auto">

          <table className="table table-zebra">

            <thead>

              <tr>

                <th>Numéro</th>

                <th>Patient</th>

                <th>Date / heure</th>

                <th>Médecin</th>

                <th>Service</th>

                <th>Statut</th>

                <th className="text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {rendezVous.map(
                (rdv) => (
                  <tr key={rdv.id}>

                    <td>
                      <span className="font-semibold">
                        {rdv.numero}
                      </span>
                    </td>

                    <td>

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">

                          <UserRound
                            size={18}
                          />

                        </div>

                        <div>

                          <p className="font-medium">
                            {getPatientName(
                              rdv.patient
                            )}
                          </p>

                          <p className="text-xs text-base-content/50">
                            {rdv.patient.numeroDossier}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={16}
                          className="text-base-content/50"
                        />

                        <span>
                          {formatDate(
                            rdv.dateHeure
                          )}
                        </span>

                      </div>

                    </td>

                    <td>

                      {rdv.medecin ? (
                        <div className="flex items-center gap-2">

                          <Stethoscope
                            size={16}
                            className="text-base-content/50"
                          />

                          <span>
                            Dr{" "}
                            {getDoctorName(
                              rdv.medecin
                            )}
                          </span>

                        </div>
                      ) : (
                        <span className="text-base-content/40">
                          Non affecté
                        </span>
                      )}

                    </td>

                    <td>

                      <div>

                        <p>
                          {rdv.service?.nom ||
                            "—"}
                        </p>

                        {rdv.specialite && (
                          <p className="text-xs text-base-content/50">
                            {rdv.specialite.nom}
                          </p>
                        )}

                      </div>

                    </td>

                    <td>

                      <span
                        className={`badge ${statusClass(
                          rdv.statut
                        )}`}
                      >
                        {statusLabel(
                          rdv.statut
                        )}
                      </span>

                    </td>

                    <td>

                      <div className="flex justify-end gap-1">

                        <Link
                          href={`/rendez-vous/${rdv.id}`}
                          className="btn btn-sm btn-ghost"
                          title="Voir"
                        >
                          <Eye size={17} />
                        </Link>

                        <Link
                          href={`/rendez-vous/${rdv.id}/modifier`}
                          className="btn btn-sm btn-ghost"
                          title="Modifier"
                        >
                          <Pencil size={17} />
                        </Link>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}