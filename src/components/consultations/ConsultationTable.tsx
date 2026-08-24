"use client";

import Link from "next/link";

import {
  Eye,
  Stethoscope,
  UserRound,
  CalendarDays,
  FlaskConical,
  Pill,
} from "lucide-react";

import ConsultationActions from "./ConsultationActions";

type Props = {
  consultations: any[];
};

export default function ConsultationTable({
  consultations,
}: Props) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-0">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="p-5 border-b border-base-200">
          <h2 className="font-semibold text-lg">
            Liste des consultations
          </h2>

          <p className="text-sm text-base-content/60">
            {consultations.length} consultation(s)
          </p>
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="overflow-x-auto">
          <table className="table table-zebra">

            <thead>
              <tr>
                <th>Consultation</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Service</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Associations</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {consultations.length === 0 ? (

                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2 text-base-content/50">

                      <Stethoscope size={40} />

                      <p>
                        Aucune consultation enregistrée.
                      </p>

                    </div>
                  </td>
                </tr>

              ) : (

                consultations.map((consultation) => {

                  const patient =
                    consultation.patient;

                  const medecin =
                    consultation.medecin;

                  return (
                    <tr
                      key={
                        consultation.idConsultation
                      }
                    >

                      {/* ==================================================
                          CONSULTATION
                      ================================================== */}

                      <td>
                        <div className="font-semibold">
                          CONSULT-
                          {consultation.idConsultation}
                        </div>

                        <div className="text-xs text-base-content/50">
                          ID #
                          {consultation.idConsultation}
                        </div>
                      </td>

                      {/* ==================================================
                          PATIENT
                      ================================================== */}

                      <td>
                        <div className="flex items-center gap-3">

                          {/* AVATAR */}

                          <div className="avatar shrink-0">
                            <div
                              className="
                                w-10
                                h-10
                                rounded-full
                                bg-primary/10
                                text-primary
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <UserRound size={18} />
                            </div>
                          </div>

                          {/* INFORMATIONS PATIENT */}

                          <div className="min-w-0">

                            <div className="font-medium whitespace-nowrap">
                              {patient?.nom}{" "}
                              {patient?.postNom ?? ""}{" "}
                              {patient?.prenom ?? ""}
                            </div>

                            <div className="text-xs text-base-content/50">
                              {patient?.numeroDossier}
                            </div>

                          </div>

                        </div>
                      </td>

                      {/* ==================================================
                          MÉDECIN
                      ================================================== */}

                      <td>
                        <div className="font-medium whitespace-nowrap">
                          Dr{" "}
                          {medecin?.nom}{" "}
                          {medecin?.postNom ?? ""}{" "}
                          {medecin?.prenom ?? ""}
                        </div>

                        <div className="text-xs text-base-content/50">
                          {medecin?.matricule}
                        </div>
                      </td>

                      {/* ==================================================
                          SERVICE
                      ================================================== */}

                      <td>

                        {consultation.service?.nom ? (

                          <>
                            <div className="font-medium">
                              {consultation.service.nom}
                            </div>

                            <div className="text-xs text-base-content/50">
                              {consultation.service.code}
                            </div>
                          </>

                        ) : (

                          <span className="text-base-content/40">
                            —
                          </span>

                        )}

                      </td>

                      {/* ==================================================
                          DATE
                      ================================================== */}

                      <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">

                          <CalendarDays
                            size={15}
                            className="text-base-content/50"
                          />

                          {new Date(
                            consultation.dateConsultation,
                          ).toLocaleString(
                            "fr-FR",
                          )}

                        </div>
                      </td>

                      {/* ==================================================
                          MOTIF
                      ================================================== */}

                      <td>

                        <div className="max-w-48 truncate">
                          {consultation.motif ||
                            "—"}
                        </div>

                      </td>

                      {/* ==================================================
                          ASSOCIATIONS
                      ================================================== */}

                      <td>

                        <div className="flex gap-2 flex-wrap">

                          {consultation.prescriptions
                            ?.length > 0 && (

                            <span className="badge badge-secondary gap-1">

                              <Pill size={12} />

                              {
                                consultation
                                  .prescriptions
                                  .length
                              }

                            </span>
                          )}

                          {consultation.demandesLabo
                            ?.length > 0 && (

                            <span className="badge badge-info gap-1">

                              <FlaskConical size={12} />

                              {
                                consultation
                                  .demandesLabo
                                  .length
                              }

                            </span>
                          )}

                        </div>

                      </td>

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <td>

                        <div className="flex justify-end items-center gap-2">

                          <Link
                            href={`/consultations/${consultation.idConsultation}`}
                            className="btn btn-sm btn-ghost"
                            title="Voir la consultation"
                          >
                            <Eye size={17} />
                          </Link>

                          <ConsultationActions
                            consultationId={
                              consultation.idConsultation
                            }
                          />

                        </div>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}