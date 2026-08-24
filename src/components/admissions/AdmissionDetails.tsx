"use client";

import Link from "next/link";

import {
  Activity,
  BedDouble,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Hospital,
  Stethoscope,
  UserRound,
} from "lucide-react";

type Props = {
  admission: any;
};

function statutLabel(
  statut: string
) {
  switch (statut) {
    case "EN_ATTENTE":
      return "En attente";

    case "TRIE":
      return "Trié";

    case "EN_CONSULTATION":
      return "En consultation";

    case "HOSPITALISE":
      return "Hospitalisé";

    case "TERMINEE":
      return "Terminée";

    case "ANNULEE":
      return "Annulée";

    default:
      return statut;
  }
}

function statutClass(
  statut: string
) {
  switch (statut) {
    case "EN_ATTENTE":
      return "badge-warning";

    case "TRIE":
      return "badge-info";

    case "EN_CONSULTATION":
      return "badge-primary";

    case "HOSPITALISE":
      return "badge-secondary";

    case "TERMINEE":
      return "badge-success";

    case "ANNULEE":
      return "badge-error";

    default:
      return "badge-ghost";
  }
}

function typeLabel(
  type: string
) {
  switch (type) {
    case "PROGRAMMEE":
      return "Admission programmée";

    case "URGENCE":
      return "Admission d'urgence";

    case "AMBULATOIRE":
      return "Admission ambulatoire";

    default:
      return type;
  }
}

export default function AdmissionDetail({
  admission,
}: Props) {

  const patient =
    admission.patient;

  const triage =
    admission.triage;

  const consultation =
    admission.consultation;

  const hospitalisation =
    admission.hospitalisation;

  const derniereConstante =
    admission.constantes?.[0];

  return (
    <div className="space-y-6">

      {/* =====================================================
          IDENTIFICATION
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">

                <ClipboardList
                  size={28}
                />

              </div>

              <div>

                <div className="flex items-center gap-2 flex-wrap">

                  <h2 className="text-xl font-bold">

                    {admission.numero}

                  </h2>

                  <span
                    className={`badge ${statutClass(
                      admission.statut
                    )}`}
                  >
                    {statutLabel(
                      admission.statut
                    )}
                  </span>

                </div>

                <p className="text-sm text-base-content/60">

                  Admission du{" "}

                  {new Date(
                    admission.dateAdmission
                  ).toLocaleString(
                    "fr-FR"
                  )}

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PATIENT + ADMISSION
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PATIENT */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <SectionTitle
              icon={
                <UserRound
                  size={20}
                />
              }
              title="Patient"
            />

            <div className="mt-5 space-y-4">

              <div>

                <div className="text-xl font-bold">

                  {patient.nom}{" "}

                  {patient.postNom || ""}{" "}

                  {patient.prenom || ""}

                </div>

                <div className="text-sm text-base-content/60">

                  Dossier :{" "}

                  {patient.numeroDossier}

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <InfoItem
                  label="Sexe"
                  value={
                    patient.sexe
                  }
                />

                <InfoItem
                  label="Téléphone"
                  value={
                    patient.telephone
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    patient.email
                  }
                />

                <InfoItem
                  label="Nationalité"
                  value={
                    patient.nationalite
                  }
                />

              </div>

            </div>

          </div>

        </div>

        {/* ADMISSION */}

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <SectionTitle
              icon={
                <Hospital
                  size={20}
                />
              }
              title="Admission"
            />

            <div className="mt-5 grid grid-cols-2 gap-4">

              <InfoItem
                label="Type"
                value={typeLabel(
                  admission.type
                )}
              />

              <InfoItem
                label="Service"
                value={
                  admission.service
                    ?.nom
                }
              />

              <InfoItem
                label="Date admission"
                value={new Date(
                  admission.dateAdmission
                ).toLocaleString(
                  "fr-FR"
                )}
              />

              <InfoItem
                label="Créée par"
                value={
                  admission
                    .createdBy
                    ?.name
                }
              />

              <div className="col-span-2">

                <InfoItem
                  label="Motif"
                  value={
                    admission.motif
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PARCOURS
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <SectionTitle
            icon={
              <Activity
                size={20}
              />
            }
            title="Parcours de prise en charge"
          />

          <div className="mt-6">

            <ul className="steps steps-vertical lg:steps-horizontal w-full">

              <li className="step step-primary">
                Admission
              </li>

              <li
                className={
                  triage
                    ? "step step-primary"
                    : "step"
                }
              >
                Triage
              </li>

              <li
                className={
                  consultation
                    ? "step step-primary"
                    : "step"
                }
              >
                Consultation
              </li>

              <li
                className={
                  hospitalisation
                    ? "step step-primary"
                    : "step"
                }
              >
                Hospitalisation
              </li>

              <li
                className={
                  admission.statut ===
                  "TERMINEE"
                    ? "step step-primary"
                    : "step"
                }
              >
                Sortie
              </li>

            </ul>

          </div>

        </div>

      </div>

      {/* =====================================================
          TRIAGE
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <SectionTitle
            icon={
              <HeartPulse
                size={20}
              />
            }
            title="Triage"
          />

          {!triage ? (

            <EmptySection
              text="Le triage n'a pas encore été effectué."
            />

          ) : (

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

              <InfoItem
                label="Niveau d'urgence"
                value={
                  triage.niveauUrgence
                }
              />

              <InfoItem
                label="Motif"
                value={
                  triage.motif
                }
              />

              <InfoItem
                label="Date triage"
                value={
                  new Date(
                    triage.dateTriage
                  ).toLocaleString(
                    "fr-FR"
                  )
                }
              />

              <div className="md:col-span-3">

                <InfoItem
                  label="Observation"
                  value={
                    triage.observation
                  }
                />

              </div>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          CONSTANTES
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <SectionTitle
            icon={
              <Activity
                size={20}
              />
            }
            title="Constantes"
          />

          {!derniereConstante ? (

            <EmptySection
              text="Aucune constante enregistrée."
            />

          ) : (

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">

              <Metric
                label="Température"
                value={
                  derniereConstante.temperature
                    ? `${derniereConstante.temperature} °C`
                    : "—"
                }
              />

              <Metric
                label="Tension"
                value={
                  derniereConstante.tensionSystolique &&
                  derniereConstante.tensionDiastolique
                    ? `${derniereConstante.tensionSystolique}/${derniereConstante.tensionDiastolique}`
                    : "—"
                }
              />

              <Metric
                label="Pouls"
                value={
                  derniereConstante.pouls
                    ? `${derniereConstante.pouls} bpm`
                    : "—"
                }
              />

              <Metric
                label="SpO₂"
                value={
                  derniereConstante.saturation
                    ? `${derniereConstante.saturation}%`
                    : "—"
                }
              />

              <Metric
                label="Poids"
                value={
                  derniereConstante.poids
                    ? `${derniereConstante.poids} kg`
                    : "—"
                }
              />

              <Metric
                label="Taille"
                value={
                  derniereConstante.taille
                    ? `${derniereConstante.taille} cm`
                    : "—"
                }
              />

              <Metric
                label="Glycémie"
                value={
                  derniereConstante.glycemie ??
                  "—"
                }
              />

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          CONSULTATION
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <SectionTitle
            icon={
              <Stethoscope
                size={20}
              />
            }
            title="Consultation"
          />

          {!consultation ? (

            <EmptySection
              text="Aucune consultation associée à cette admission."
            />

          ) : (

            <div className="mt-5 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <InfoItem
                  label="Médecin"
                  value={
                    consultation
                      .medecin
                      ? `Dr ${consultation.medecin.nom} ${consultation.medecin.postNom || ""} ${consultation.medecin.prenom}`
                      : null
                  }
                />

                <InfoItem
                  label="Service"
                  value={
                    consultation
                      .service
                      ?.nom
                  }
                />

                <InfoItem
                  label="Spécialité"
                  value={
                    consultation
                      .specialite
                      ?.nom
                  }
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <InfoItem
                  label="Motif"
                  value={
                    consultation.motif
                  }
                />

                <InfoItem
                  label="Diagnostic"
                  value={
                    consultation.diagnostic
                  }
                />

                <InfoItem
                  label="Observation"
                  value={
                    consultation.observation
                  }
                />

                <InfoItem
                  label="Conclusion"
                  value={
                    consultation.conclusion
                  }
                />

              </div>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          HOSPITALISATION
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <SectionTitle
            icon={
              <BedDouble
                size={20}
              />
            }
            title="Hospitalisation"
          />

          {!hospitalisation ? (

            <EmptySection
              text="Le patient n'est pas hospitalisé dans le cadre de cette admission."
            />

          ) : (

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

              <InfoItem
                label="Numéro"
                value={
                  hospitalisation.numero
                }
              />

              <InfoItem
                label="Service"
                value={
                  hospitalisation
                    .service
                    ?.nom
                }
              />

              <InfoItem
                label="Médecin"
                value={
                  hospitalisation
                    .medecin
                    ? `Dr ${hospitalisation.medecin.nom} ${hospitalisation.medecin.prenom}`
                    : null
                }
              />

              <InfoItem
                label="Chambre"
                value={
                  hospitalisation
                    .lit
                    ?.chambre
                    ?.numero
                }
              />

              <InfoItem
                label="Lit"
                value={
                  hospitalisation
                    .lit
                    ?.numero
                }
              />

              <InfoItem
                label="Date entrée"
                value={
                  new Date(
                    hospitalisation.dateEntree
                  ).toLocaleString(
                    "fr-FR"
                  )
                }
              />

              <InfoItem
                label="Statut"
                value={
                  hospitalisation.statut
                }
              />

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          RENDEZ-VOUS
      ===================================================== */}

      {admission.rendezVous && (

        <div className="card bg-base-100 border border-base-200 shadow-sm">

          <div className="card-body">

            <SectionTitle
              icon={
                <CalendarDays
                  size={20}
                />
              }
              title="Rendez-vous d'origine"
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">

              <InfoItem
                label="Numéro"
                value={
                  admission
                    .rendezVous
                    .numero
                }
              />

              <InfoItem
                label="Médecin"
                value={
                  admission
                    .rendezVous
                    .medecin
                    ? `Dr ${admission.rendezVous.medecin.nom} ${admission.rendezVous.medecin.prenom}`
                    : null
                }
              />

              <InfoItem
                label="Spécialité"
                value={
                  admission
                    .rendezVous
                    .specialite
                    ?.nom
                }
              />

              <InfoItem
                label="Service"
                value={
                  admission
                    .rendezVous
                    .service
                    ?.nom
                }
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTS
|--------------------------------------------------------------------------
*/

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>

      <h2 className="font-semibold text-lg">
        {title}
      </h2>

    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>

      <div className="text-xs uppercase tracking-wide text-base-content/50 mb-1">
        {label}
      </div>

      <div className="font-medium">
        {value || "—"}
      </div>

    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-base-200 bg-base-200/40 p-3">

      <div className="text-xs text-base-content/50">
        {label}
      </div>

      <div className="font-bold mt-1">
        {value}
      </div>

    </div>
  );
}

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-base-300 p-6 text-center text-sm text-base-content/50">
      {text}
    </div>
  );
}