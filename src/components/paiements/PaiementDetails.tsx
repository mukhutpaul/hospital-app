"use client";

import Link from "next/link";

/* ==========================================================
   TYPES
========================================================== */

type Patient = {
  id: number;
  nom: string;
  postNom: string | null;
  prenom: string | null;
  numeroDossier: string;
  telephone: string | null;
};

type Facture = {
  id: number;
  numero: string;
  montantTotal: number;
  montantPaye: number;
  reste: number;
  statut: string;
};

type Caissier = {
  id: number;
  name: string | null;
  email: string | null;
};

type Paiement = {
  id: number;
  reference: string;
  montant: number;
  devise: string;
  modePaiement: string;
  type: string;
  statut: string;
  datePaiement: Date | string;
  description: string | null;

  patient?: Patient | null;
  facture?: Facture | null;
  caissier?: Caissier | null;
};

type Props = {
  paiement: Paiement;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(
  montant: number | null | undefined,
  devise: string | null | undefined
) {
  const value = Number(montant ?? 0);

  return `${value.toFixed(2)} ${devise || ""}`.trim();
}

function patientName(
  patient: Paiement["patient"]
) {
  if (!patient) {
    return "-";
  }

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

/* ==========================================================
   MODE DE PAIEMENT
========================================================== */

function modeLabel(mode: string | null | undefined) {
  const modes: Record<string, string> = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    CARTE_BANCAIRE: "Carte bancaire",
    VIREMENT: "Virement bancaire",
    CHEQUE: "Chèque",
  };

  if (!mode) {
    return "-";
  }

  return modes[mode] || mode;
}

/* ==========================================================
   TYPE DE PAIEMENT
========================================================== */

function typeLabel(type: string | null | undefined) {
  const types: Record<string, string> = {
    FACTURE: "Paiement de facture",
    ACOMPTE: "Acompte",
    AVANCE: "Avance",
    REMBOURSEMENT: "Remboursement",
    AUTRE: "Autre",
  };

  if (!type) {
    return "-";
  }

  return types[type] || type;
}

/* ==========================================================
   STATUT
========================================================== */

function statutClass(
  statut: string | null | undefined
) {
  switch (statut) {
    case "PAYE":
      return "badge badge-success";

    case "ANNULE":
      return "badge badge-error";

    case "REMBOURSE":
      return "badge badge-warning";

    case "EN_ATTENTE":
      return "badge badge-info";

    case "PARTIEL":
      return "badge badge-warning";

    default:
      return "badge badge-ghost";
  }
}

function statutLabel(
  statut: string | null | undefined
) {
  const statuts: Record<string, string> = {
    PAYE: "Payé",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
    EN_ATTENTE: "En attente",
    PARTIEL: "Partiel",
  };

  if (!statut) {
    return "-";
  }

  return statuts[statut] || statut;
}

/* ==========================================================
   COMPOSANT PRINCIPAL
========================================================== */

export default function PaiementDetails({
  paiement,
}: Props) {
  const patient = paiement?.patient;
  const facture = paiement?.facture;
  const caissier = paiement?.caissier;

  return (
    <div className="space-y-6">

      {/* =====================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-wrap justify-between items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold">
            Détails du paiement
          </h1>

          <p className="text-sm opacity-60">
            Référence : {paiement.reference}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {facture && (
            <Link
              href={`/facturation/factures/${facture.id}`}
              className="btn btn-outline"
            >
              📄 Voir la facture
            </Link>
          )}

          <Link
            href="/facturation/paiements"
            className="btn btn-ghost"
          >
            ← Retour
          </Link>

        </div>

      </div>

      {/* =====================================================
          STATUT
      ====================================================== */}

      <div className="card bg-base-100 shadow">

        <div className="card-body">

          <div className="flex justify-between items-center gap-4">

            <div>
              <h2 className="font-semibold">
                Statut du paiement
              </h2>

              <p className="text-sm opacity-60">
                État actuel de la transaction
              </p>
            </div>

            <span
              className={statutClass(
                paiement.statut
              )}
            >
              {statutLabel(
                paiement.statut
              )}
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          INFORMATIONS PRINCIPALES
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===================================================
            PAIEMENT
        ==================================================== */}

        <div className="card bg-base-100 shadow">

          <div className="card-body">

            <h2 className="card-title">
              Informations du paiement
            </h2>

            <div className="divider my-1" />

            <div className="space-y-4">

              <Info
                label="Référence"
                value={
                  paiement.reference || "-"
                }
              />

              <Info
                label="Montant"
                value={formatMoney(
                  paiement.montant,
                  paiement.devise
                )}
              />

              <Info
                label="Mode de paiement"
                value={modeLabel(
                  paiement.modePaiement
                )}
              />

              <Info
                label="Type"
                value={typeLabel(
                  paiement.type
                )}
              />

              <Info
                label="Date du paiement"
                value={formatDate(
                  paiement.datePaiement
                )}
              />

              <Info
                label="Description"
                value={
                  paiement.description ||
                  "-"
                }
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            PATIENT
        ==================================================== */}

        <div className="card bg-base-100 shadow">

          <div className="card-body">

            <h2 className="card-title">
              Patient
            </h2>

            <div className="divider my-1" />

            {patient ? (
              <div className="space-y-4">

                <Info
                  label="Nom complet"
                  value={patientName(patient)}
                />

                <Info
                  label="N° dossier"
                  value={
                    patient.numeroDossier ||
                    "-"
                  }
                />

                <Info
                  label="Téléphone"
                  value={
                    patient.telephone ||
                    "-"
                  }
                />

              </div>
            ) : (
              <div className="alert alert-warning">
                <span>
                  Aucun patient associé à ce paiement.
                </span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          FACTURE ASSOCIÉE
      ====================================================== */}

      {facture && (
        <div className="card bg-base-100 shadow">

          <div className="card-body">

            <div className="flex flex-wrap justify-between items-center gap-3">

              <div>
                <h2 className="card-title">
                  Facture associée
                </h2>

                <p className="text-sm opacity-60">
                  Informations financières de la facture
                </p>
              </div>

              <Link
                href={`/facturation/factures/${facture.id}`}
                className="btn btn-sm btn-primary"
              >
                Voir la facture
              </Link>

            </div>

            <div className="divider my-1" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* FACTURE */}

              <Stat
                label="N° Facture"
                value={
                  facture.numero || "-"
                }
              />

              {/* TOTAL */}

              <Stat
                label="Total"
                value={formatMoney(
                  facture.montantTotal,
                  paiement.devise
                )}
              />

              {/* PAYÉ */}

              <Stat
                label="Total payé"
                value={formatMoney(
                  facture.montantPaye,
                  paiement.devise
                )}
              />

              {/* RESTE */}

              <Stat
                label="Reste à payer"
                value={formatMoney(
                  facture.reste,
                  paiement.devise
                )}
              />

            </div>

            {/* =================================================
                STATUT FACTURE
            ================================================== */}

            <div className="mt-5 flex flex-wrap justify-between items-center gap-3">

              <span className="font-semibold">
                Statut de la facture
              </span>

              <span
                className={statutClass(
                  facture.statut
                )}
              >
                {statutLabel(
                  facture.statut
                )}
              </span>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CAISSIER
      ====================================================== */}

      {caissier && (
        <div className="card bg-base-100 shadow">

          <div className="card-body">

            <h2 className="card-title">
              Caissier
            </h2>

            <div className="divider my-1" />

            <div className="space-y-4">

              <Info
                label="Nom"
                value={
                  caissier.name ||
                  "-"
                }
              />

              <Info
                label="Email"
                value={
                  caissier.email ||
                  "-"
                }
              />

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RÉSUMÉ FINANCIER
      ====================================================== */}

      <div className="card bg-base-100 shadow">

        <div className="card-body">

          <h2 className="card-title">
            Résumé
          </h2>

          <div className="divider my-1" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="stat bg-base-200 rounded-box">

              <div className="stat-title">
                Montant du paiement
              </div>

              <div className="stat-value text-lg">
                {formatMoney(
                  paiement.montant,
                  paiement.devise
                )}
              </div>

            </div>

            {facture && (
              <>
                <div className="stat bg-base-200 rounded-box">

                  <div className="stat-title">
                    Montant total facture
                  </div>

                  <div className="stat-value text-lg">
                    {formatMoney(
                      facture.montantTotal,
                      paiement.devise
                    )}
                  </div>

                </div>

                <div className="stat bg-base-200 rounded-box">

                  <div className="stat-title">
                    Reste facture
                  </div>

                  <div className="stat-value text-lg">
                    {formatMoney(
                      facture.reste,
                      paiement.devise
                    )}
                  </div>

                </div>
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   COMPOSANTS UI
========================================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-base-200 pb-2">

      <span className="font-semibold">
        {label}
      </span>

      <span className="opacity-80 sm:text-right break-words">
        {value}
      </span>

    </div>
  );
}

/* ==========================================================
   STAT
========================================================== */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="stat bg-base-200 rounded-box">

      <div className="stat-title">
        {label}
      </div>

      <div className="stat-value text-lg break-words">
        {value}
      </div>

    </div>
  );
}