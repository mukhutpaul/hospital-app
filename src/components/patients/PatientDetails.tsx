
"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Pencil,
  UserRound,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  BriefcaseBusiness,
  HeartPulse,
  ShieldCheck,
  FileText,
  Stethoscope,
  Bed,
  CalendarCheck,
  Receipt,
  CreditCard,
  FlaskConical,
  ScanLine,
  Pill,
  UserRoundCheck,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| TYPE
|--------------------------------------------------------------------------
*/

type Patient = {
  id: number;

  numeroDossier: string;

  nom: string;
  postNom: string | null;
  prenom: string | null;

  sexe: string;

  dateNaissance: Date | null;
  lieuNaissance: string | null;

  telephone: string | null;
  email: string | null;
  adresse: string | null;

  profession: string | null;
  nationalite: string | null;
  etatCivil: string | null;

  groupeSanguin: string | null;
  rhesus: string | null;

  personneContact: string | null;
  contactTelephone: string | null;
  contactLien: string | null;

  photo: string | null;

  actif: boolean;

  createdAt: Date;
  updatedAt: Date;

  _count: {
    rendezVous: number;
    admissions: number;
    consultations: number;
    prescriptions: number;
    demandesLabo: number;
    demandesImagerie: number;
    hospitalisations: number;
    factures: number;
    paiements: number;
    documents: number;
    constantes: number;
    allergies: number;
    antecedents: number;
  };
};

type Props = {
  patient: Patient;
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDate(
  date: Date | null
) {
  if (!date) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(new Date(date));
}

function getNomComplet(
  patient: Patient
) {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

/*
|--------------------------------------------------------------------------
| COMPOSANT
|--------------------------------------------------------------------------
*/

export default function PatientDetails({
  patient,
}: Props) {
  const nomComplet =
    getNomComplet(patient);

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <Link
            href="/patients"
            className="btn btn-sm btn-ghost"
          >
            <ArrowLeft size={18} />

            Retour
          </Link>

          <div>
            <h1 className="text-2xl font-bold">
              Dossier patient
            </h1>

            <p className="text-sm text-base-content/60">
              Consultation des informations
              du patient
            </p>
          </div>

        </div>

        <Link
          href={`/patients/${patient.id}/modifier`}
          className="btn btn-primary"
        >
          <Pencil size={17} />

          Modifier
        </Link>

      </div>

      {/* =====================================================
          IDENTITÉ
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col md:flex-row gap-6">

            {/* PHOTO */}

            <div className="shrink-0">

              {patient.photo ? (

                <div className="avatar">

                  <div className="w-28 h-28 rounded-2xl">

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={patient.photo}
                      alt={nomComplet}
                      className="object-cover"
                    />

                  </div>

                </div>

              ) : (

                <div className="w-28 h-28 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">

                  <UserRound
                    size={48}
                  />

                </div>

              )}

            </div>

            {/* INFORMATIONS */}

            <div className="flex-1">

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                <div>

                  <h2 className="text-2xl font-bold">
                    {nomComplet}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mt-2">

                    <span className="badge badge-primary badge-outline">
                      <FileText
                        size={13}
                      />

                      {patient.numeroDossier}
                    </span>

                    {patient.actif ? (

                      <span className="badge badge-success">
                        Actif
                      </span>

                    ) : (

                      <span className="badge badge-error">
                        Inactif
                      </span>

                    )}

                  </div>

                </div>

                <div className="text-sm text-base-content/50">
                  ID : {patient.id}
                </div>

              </div>

              {/* INFOS RAPIDES */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                <InfoItem
                  icon={<UserRound size={17} />}
                  label="Sexe"
                  value={
                    patient.sexe ||
                    "Non renseigné"
                  }
                />

                <InfoItem
                  icon={
                    <CalendarDays
                      size={17}
                    />
                  }
                  label="Date de naissance"
                  value={formatDate(
                    patient.dateNaissance
                  )}
                />

                <InfoItem
                  icon={
                    <HeartPulse
                      size={17}
                    />
                  }
                  label="Groupe sanguin"
                  value={
                    patient.groupeSanguin
                      ? `${patient.groupeSanguin}${
                          patient.rhesus
                            ? ` ${patient.rhesus}`
                            : ""
                        }`
                      : "Non renseigné"
                  }
                />

                <InfoItem
                  icon={
                    <Phone size={17} />
                  }
                  label="Téléphone"
                  value={
                    patient.telephone ||
                    "Non renseigné"
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

        <StatCard
          icon={
            <CalendarCheck size={20} />
          }
          label="Rendez-vous"
          value={
            patient._count.rendezVous
          }
        />

        <StatCard
          icon={
            <Stethoscope size={20} />
          }
          label="Consultations"
          value={
            patient._count.consultations
          }
        />

        <StatCard
          icon={<Bed size={20} />}
          label="Hospitalisations"
          value={
            patient._count
              .hospitalisations
          }
        />

        <StatCard
          icon={
            <Pill size={20} />
          }
          label="Prescriptions"
          value={
            patient._count
              .prescriptions
          }
        />

        <StatCard
          icon={
            <FlaskConical
              size={20}
            />
          }
          label="Laboratoire"
          value={
            patient._count
              .demandesLabo
          }
        />

        <StatCard
          icon={
            <Receipt size={20} />
          }
          label="Factures"
          value={
            patient._count.factures
          }
        />

      </div>

      {/* =====================================================
          INFORMATIONS PERSONNELLES
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* INFORMATIONS PERSONNELLES */}

        <SectionCard
          title="Informations personnelles"
          icon={
            <UserRound
              size={20}
            />
          }
        >

          <InfoRow
            label="Nom"
            value={patient.nom}
          />

          <InfoRow
            label="Post-nom"
            value={
              patient.postNom
            }
          />

          <InfoRow
            label="Prénom"
            value={
              patient.prenom
            }
          />

          <InfoRow
            label="Sexe"
            value={
              patient.sexe
            }
          />

          <InfoRow
            label="Date de naissance"
            value={formatDate(
              patient.dateNaissance
            )}
          />

          <InfoRow
            label="Lieu de naissance"
            value={
              patient.lieuNaissance
            }
          />

          <InfoRow
            label="Nationalité"
            value={
              patient.nationalite
            }
          />

          <InfoRow
            label="État civil"
            value={
              patient.etatCivil
            }
          />

          <InfoRow
            label="Profession"
            value={
              patient.profession
            }
          />

        </SectionCard>

        {/* CONTACT */}

        <SectionCard
          title="Coordonnées"
          icon={
            <Phone size={20} />
          }
        >

          <InfoRow
            label="Téléphone"
            value={
              patient.telephone
            }
          />

          <InfoRow
            label="Email"
            value={
              patient.email
            }
          />

          <InfoRow
            label="Adresse"
            value={
              patient.adresse
            }
          />

          <InfoRow
            label="Personne à contacter"
            value={
              patient.personneContact
            }
          />

          <InfoRow
            label="Téléphone contact"
            value={
              patient.contactTelephone
            }
          />

          <InfoRow
            label="Lien"
            value={
              patient.contactLien
            }
          />

        </SectionCard>

      </div>

      {/* =====================================================
          INFORMATIONS MÉDICALES
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GROUPE SANGUIN */}

        <SectionCard
          title="Informations médicales"
          icon={
            <HeartPulse
              size={20}
            />
          }
        >

          <InfoRow
            label="Groupe sanguin"
            value={
              patient.groupeSanguin
            }
          />

          <InfoRow
            label="Rhésus"
            value={
              patient.rhesus
            }
          />

          <InfoRow
            label="Allergies enregistrées"
            value={
              String(
                patient._count
                  .allergies
              )
            }
          />

          <InfoRow
            label="Antécédents"
            value={
              String(
                patient._count
                  .antecedents
              )
            }
          />

          <InfoRow
            label="Constantes"
            value={
              String(
                patient._count
                  .constantes
              )
            }
          />

        </SectionCard>

        {/* DOSSIER */}

        <SectionCard
          title="Dossier administratif"
          icon={
            <FileText size={20} />
          }
        >

          <InfoRow
            label="Numéro de dossier"
            value={
              patient.numeroDossier
            }
          />

          <InfoRow
            label="Documents"
            value={
              String(
                patient._count
                  .documents
              )
            }
          />

          <InfoRow
            label="Paiements"
            value={
              String(
                patient._count
                  .paiements
              )
            }
          />

          <InfoRow
            label="Créé le"
            value={formatDate(
              patient.createdAt
            )}
          />

          <InfoRow
            label="Dernière modification"
            value={formatDate(
              patient.updatedAt
            )}
          />

        </SectionCard>

      </div>

      {/* =====================================================
          RACCOURCIS DOSSIER MÉDICAL
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">

        <div className="card-body">

          <div className="flex items-center gap-2 mb-4">

            <Stethoscope
              size={20}
              className="text-primary"
            />

            <h3 className="font-semibold">
              Dossier médical
            </h3>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

            <QuickLink
              href={`/patients/${patient.id}/rendez-vous`}
              icon={
                <CalendarCheck
                  size={20}
                />
              }
              label="Rendez-vous"
              count={
                patient._count
                  .rendezVous
              }
            />

            <QuickLink
              href={`/patients/${patient.id}/consultations`}
              icon={
                <Stethoscope
                  size={20}
                />
              }
              label="Consultations"
              count={
                patient._count
                  .consultations
              }
            />

            <QuickLink
              href={`/patients/${patient.id}/hospitalisations`}
              icon={
                <Bed size={20} />
              }
              label="Hospitalisations"
              count={
                patient._count
                  .hospitalisations
              }
            />

            <QuickLink
              href={`/patients/${patient.id}/laboratoire`}
              icon={
                <FlaskConical
                  size={20}
                />
              }
              label="Laboratoire"
              count={
                patient._count
                  .demandesLabo
              }
            />

            <QuickLink
              href={`/patients/${patient.id}/imagerie`}
              icon={
                <ScanLine
                  size={20}
                />
              }
              label="Imagerie"
              count={
                patient._count
                  .demandesImagerie
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-base-content/50">
          {label}
        </p>

        <p className="font-medium truncate">
          {value}
        </p>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body p-4">

        <div className="flex items-center justify-between">

          <div className="text-primary">
            {icon}
          </div>

          <span className="text-xl font-bold">
            {value}
          </span>

        </div>

        <p className="text-xs text-base-content/60">
          {label}
        </p>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION CARD
|--------------------------------------------------------------------------
*/

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">

      <div className="card-body">

        <div className="flex items-center gap-2 pb-3 border-b border-base-200">

          <div className="text-primary">
            {icon}
          </div>

          <h3 className="font-semibold">
            {title}
          </h3>

        </div>

        <div className="divide-y divide-base-200">
          {children}
        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ROW
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">

      <span className="text-sm text-base-content/60">
        {label}
      </span>

      <span className="text-sm font-medium text-right">
        {value || "Non renseigné"}
      </span>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| QUICK LINK
|--------------------------------------------------------------------------
*/

function QuickLink({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-xl
        border
        border-base-200
        p-4
        hover:border-primary/40
        hover:bg-primary/5
        transition
      "
    >

      <div className="flex items-center justify-between">

        <div className="text-primary">
          {icon}
        </div>

        <span className="badge badge-primary badge-outline">
          {count}
        </span>

      </div>

      <p className="text-sm font-medium mt-3 group-hover:text-primary transition">
        {label}
      </p>

    </Link>
  );
}
