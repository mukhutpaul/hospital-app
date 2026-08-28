
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Banknote,
  CalendarDays,
  CreditCard,
  Eye,
  FileText,
  Printer,
  Receipt,
  UserRound,
  Wallet,
} from "lucide-react";

import { getPaiementById } from "@/app/actions/paiements";
import PaiementReceiptA8 from "@/components/recu/PaiementReceiptA8";

import PrintReceiptButton from "@/components/recu/PrintReceiptButton";

/* ==========================================================
   TYPES
========================================================== */

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

function formatPatient(
  patient:
    | {
        nom: string;
        postNom?: string | null;
        prenom?: string | null;
      }
    | null
    | undefined,
) {
  if (!patient) {
    return "Patient inconnu";
  }

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value &&
            value.trim(),
        ),
    )
    .join(" ");
}

function getModeLabel(
  mode: string,
) {
  const modes: Record<
    string,
    string
  > = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    VIREMENT: "Virement bancaire",
    CHEQUE: "Chèque",
  };

  return (
    modes[mode] ||
    mode ||
    "-"
  );
}

function getTypeLabel(
  type: string,
) {
  const types: Record<
    string,
    string
  > = {
    PAIEMENT: "Paiement",
    AVANCE: "Avance",
    SOLDE: "Solde",
    ACOMPTE: "Acompte",
    REMBOURSEMENT:
      "Remboursement",
  };

  return (
    types[type] ||
    type ||
    "-"
  );
}

function getStatutLabel(
  statut: string,
) {
  const statuts: Record<
    string,
    string
  > = {
    PAYE: "Payé",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
  };

  return (
    statuts[statut] ||
    statut ||
    "-"
  );
}

function formatDate(
  value:
    | Date
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(
    value,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

/* ==========================================================
   PAGE
========================================================== */

export default async function PaiementDetailPage({
  params,
}: Props) {
  /* ========================================================
     ID
  ======================================================== */

  const { id } = await params;

  const paiementId = Number(
    id,
  );

  if (
    !Number.isInteger(
      paiementId,
    ) ||
    paiementId <= 0
  ) {
    notFound();
  }

  /* ========================================================
     PAIEMENT
  ======================================================== */

  const paiement =
    await getPaiementById(
      paiementId,
    );

  if (!paiement) {
    notFound();
  }

  /* ========================================================
     RELATIONS
  ======================================================== */

  const patient =
    paiement.patient;

  const facture =
    paiement.facture;

  const caissier =
    paiement.caissier;

  /* ========================================================
     INFORMATIONS
  ======================================================== */

  const nomPatient =
    formatPatient(
      patient,
    );

  const devise =
    paiement.devise ||
    facture?.devise ||
    "USD";

  const montantPaiement =
    Number(
      paiement.montant,
    ) || 0;

  const montantTotal =
    facture
      ? Number(
          facture.montantTotal,
        ) || 0
      : 0;

  const montantPaye =
    facture
      ? Number(
          facture.montantPaye,
        ) || 0
      : 0;

  const reste =
    facture
      ? Number(
          facture.reste,
        ) || 0
      : 0;

  const statutClass =
    paiement.statut ===
    "PAYE"
      ? "badge-success"
      : paiement.statut ===
          "ANNULE"
        ? "badge-error"
        : paiement.statut ===
            "REMBOURSE"
          ? "badge-warning"
          : "badge-ghost";

  /* ========================================================
     DONNÉES REÇU
  ======================================================== */

  const paiementReceipt = {
    id: paiement.id,

    reference:
      paiement.reference,

    montant:
      Number(
        paiement.montant,
      ) || 0,

    devise,

    modePaiement:
      paiement.modePaiement,

    type: paiement.type,

    statut:
      paiement.statut,

    datePaiement:
      paiement.datePaiement instanceof
      Date
        ? paiement.datePaiement.toISOString()
        : String(
            paiement.datePaiement,
          ),

    description:
      paiement.description ??
      null,

    patient: patient
      ? {
          id: patient.id,
          nom: patient.nom,
          postNom:
            patient.postNom,
          prenom:
            patient.prenom,
          numeroDossier:
            patient.numeroDossier,
          telephone:
            patient.telephone,
        }
      : null,

    facture: facture
      ? {
          id: facture.id,
          numero:
            facture.numero,
        }
      : null,

    caissier: caissier
      ? {
          id: caissier.id,
          name: caissier.name,
          email:
            caissier.email,
        }
      : null,
  };

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <>
      {/* ====================================================
          CSS IMPRESSION
      ==================================================== */}

      <style>{`
        @page {
          size: 52mm 74mm;
          margin: 0;
        }

        @media screen {
          .receipt-print-area {
            display: none !important;
          }
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 52mm !important;
            min-width: 52mm !important;
            max-width: 52mm !important;
            background: white !important;
          }

          body {
            overflow: visible !important;
          }

          .screen-only {
            display: none !important;
          }

          .receipt-print-area {
            display: block !important;
            width: 52mm !important;
            min-width: 52mm !important;
            max-width: 52mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* ====================================================
          PARTIE ÉCRAN
      ==================================================== */}

      <main className="screen-only">
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet
                    size={28}
                  />
                </div>

                <div>

                  <div className="mb-1 flex flex-wrap items-center gap-2">

                    <span className="badge badge-primary badge-outline">
                      PAIEMENT
                    </span>

                    <span
                      className={`badge ${statutClass}`}
                    >
                      {getStatutLabel(
                        paiement.statut,
                      )}
                    </span>

                  </div>

                  <h1 className="text-2xl font-black md:text-3xl">
                    {paiement.reference}
                  </h1>

                  <p className="mt-1 text-sm text-base-content/60">
                    Détail de l'encaissement
                  </p>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2">

                <Link
                  href="/paiements"
                  className="btn btn-outline"
                >
                  ← Retour
                </Link>

                <PrintReceiptButton
                  label="Imprimer le reçu"
                />

                {facture && (
                  <Link
                    href={`/facturation/factures/${facture.id}`}
                    className="btn btn-secondary"
                  >
                    <Eye
                      size={17}
                    />
                    Facture
                  </Link>
                )}

              </div>

            </div>

          </div>

          {/* ==================================================
              INDICATEUR PRINCIPAL
          ================================================== */}

          <div className="rounded-3xl border border-success/20 bg-gradient-to-br from-success/10 via-base-100 to-base-100 p-6 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-medium text-base-content/60">
                  Montant encaissé
                </p>

                <div className="mt-1 flex items-center gap-3">

                  <Banknote
                    size={28}
                    className="text-success"
                  />

                  <p className="text-4xl font-black tracking-tight text-success">
                    {montantPaiement.toLocaleString(
                      "fr-FR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>

                  <span className="text-lg font-bold text-success/70">
                    {devise}
                  </span>

                </div>

              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3">

                <div className="flex items-center gap-2 text-sm text-base-content/60">

                  <CalendarDays
                    size={16}
                  />

                  {formatDate(
                    paiement.datePaiement,
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              CARTES RAPIDES
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <InfoCard
              icon={
                <Receipt
                  size={20}
                />
              }
              title="Référence"
              value={
                paiement.reference
              }
            />

            <InfoCard
              icon={
                <CreditCard
                  size={20}
                />
              }
              title="Mode"
              value={getModeLabel(
                paiement.modePaiement,
              )}
            />

            <InfoCard
              icon={
                <UserRound
                  size={20}
                />
              }
              title="Patient"
              value={
                nomPatient ||
                "—"
              }
            />

            <InfoCard
              icon={
                <CalendarDays
                  size={20}
                />
              }
              title="Date"
              value={formatDate(
                paiement.datePaiement,
              )}
            />

          </div>

          {/* ==================================================
              GRID PRINCIPAL
          ================================================== */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* =================================================
                PAIEMENT
            ================================================= */}

            <section className="rounded-3xl border border-base-200 bg-base-100 shadow-sm">

              <div className="border-b border-base-200 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CreditCard
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      Informations du paiement
                    </h2>

                    <p className="text-xs text-base-content/50">
                      Détails de la transaction
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <DetailItem
                    label="Référence"
                    value={
                      paiement.reference
                    }
                  />

                  <DetailItem
                    label="Montant"
                    value={
                      `${montantPaiement.toLocaleString(
                        "fr-FR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )} ${devise}`
                    }
                    highlight
                  />

                  <DetailItem
                    label="Mode de paiement"
                    value={getModeLabel(
                      paiement.modePaiement,
                    )}
                  />

                  <DetailItem
                    label="Type"
                    value={getTypeLabel(
                      paiement.type,
                    )}
                  />

                  <DetailItem
                    label="Devise"
                    value={devise}
                  />

                  <DetailItem
                    label="Date"
                    value={formatDate(
                      paiement.datePaiement,
                    )}
                  />

                  <div className="sm:col-span-2">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Statut
                    </p>

                    <span
                      className={`badge ${statutClass}`}
                    >
                      {getStatutLabel(
                        paiement.statut,
                      )}
                    </span>

                  </div>

                  {paiement.description && (
                    <div className="sm:col-span-2">

                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Description
                      </p>

                      <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4 text-sm">
                        {
                          paiement.description
                        }
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                PATIENT
            ================================================= */}

            <section className="rounded-3xl border border-base-200 bg-base-100 shadow-sm">

              <div className="border-b border-base-200 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                    <UserRound
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      Patient
                    </h2>

                    <p className="text-xs text-base-content/50">
                      Informations du patient
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5">

                <div className="mb-5 flex items-center gap-4 rounded-2xl bg-base-200/50 p-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
                    <UserRound
                      size={25}
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-lg font-bold">
                      {nomPatient ||
                        "Patient inconnu"}
                    </p>

                    <p className="text-sm text-base-content/50">
                      Dossier :{" "}
                      {
                        patient?.numeroDossier ||
                        "—"
                      }
                    </p>

                  </div>

                </div>

                <div className="space-y-4">

                  <DetailItem
                    label="Nom complet"
                    value={
                      nomPatient ||
                      "—"
                    }
                  />

                  <DetailItem
                    label="Numéro de dossier"
                    value={
                      patient?.numeroDossier ||
                      "—"
                    }
                  />

                  <DetailItem
                    label="Téléphone"
                    value={
                      patient?.telephone ||
                      "—"
                    }
                  />

                  <DetailItem
                    label="Email"
                    value={
                      patient?.email ||
                      "—"
                    }
                  />

                </div>

              </div>

            </section>

          </div>

          {/* ==================================================
              FACTURE
          ================================================== */}

          {facture && (
            <section className="rounded-3xl border border-primary/20 bg-base-100 shadow-sm">

              <div className="border-b border-primary/10 bg-primary/5 p-5">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText
                        size={19}
                      />
                    </div>

                    <div>

                      <h2 className="font-bold">
                        Facture associée
                      </h2>

                      <p className="text-xs text-base-content/50">
                        {facture.numero}
                      </p>

                    </div>

                  </div>

                  <Link
                    href={`/facturation/factures/${facture.id}`}
                    className="btn btn-sm btn-outline"
                  >
                    Voir la facture
                  </Link>

                </div>

              </div>

              <div className="p-5">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <AmountCard
                    label="Montant total"
                    value={`${montantTotal.toLocaleString(
                      "fr-FR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )} ${devise}`}
                  />

                  <AmountCard
                    label="Montant payé"
                    value={`${montantPaye.toLocaleString(
                      "fr-FR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )} ${devise}`}
                    variant="success"
                  />

                  <AmountCard
                    label="Reste"
                    value={`${reste.toLocaleString(
                      "fr-FR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )} ${devise}`}
                    variant="error"
                  />

                  <AmountCard
                    label="Statut"
                    value={
                      facture.statut
                    }
                  />

                </div>

              </div>

            </section>
          )}

          {/* ==================================================
              CAISSIER
          ================================================== */}

          <section className="rounded-3xl border border-base-200 bg-base-100 shadow-sm">

            <div className="border-b border-base-200 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <UserRound
                    size={19}
                  />
                </div>

                <div>

                  <h2 className="font-bold">
                    Caissier
                  </h2>

                  <p className="text-xs text-base-content/50">
                    Utilisateur ayant enregistré le paiement
                  </p>

                </div>

              </div>

            </div>

            <div className="p-5">

              {caissier ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div>

                      <p className="font-bold">
                        {caissier.name ||
                          "Utilisateur"}
                      </p>

                      {caissier.email && (
                        <p className="text-sm text-base-content/50">
                          {
                            caissier.email
                          }
                        </p>
                      )}

                    </div>

                  </div>

                  <span className="badge badge-warning badge-outline">
                    Caissier
                  </span>

                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/30 p-5 text-center">

                  <p className="text-sm text-base-content/50">
                    Aucun caissier associé à ce paiement.
                  </p>

                </div>
              )}

            </div>

          </section>

          {/* ==================================================
              ACTIONS FINALES
          ================================================== */}

          <div className="flex flex-wrap justify-end gap-3">

            <Link
              href="/paiements"
              className="btn btn-outline"
            >
              ← Retour aux paiements
            </Link>

            <PrintReceiptButton
              label="Imprimer le reçu A8"
            />

            {facture && (
              <Link
                href={`/facturation/factures/${facture.id}`}
                className="btn btn-secondary"
              >
                <FileText
                  size={17}
                />
                Voir la facture
              </Link>
            )}

          </div>

        </div>
      </main>

      {/* ====================================================
          ZONE D'IMPRESSION
          CACHÉE À L'ÉCRAN
          AFFICHÉE UNIQUEMENT À L'IMPRESSION
      ==================================================== */}

      <div className="receipt-print-area">
        <PaiementReceiptA8
          paiement={
            paiementReceipt
          }
        />
      </div>
    </>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">

      <div className="mb-3 flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
          {title}
        </p>

      </div>

      <p className="break-words text-sm font-bold">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   DETAIL ITEM
========================================================== */

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {label}
      </p>

      <p
        className={
          highlight
            ? "text-lg font-black text-success"
            : "font-semibold"
        }
      >
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   AMOUNT CARD
========================================================== */

function AmountCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?:
    | "default"
    | "success"
    | "error";
}) {
  const classes =
    variant === "success"
      ? "border-success/20 bg-success/10"
      : variant === "error"
        ? "border-error/20 bg-error/10"
        : "border-base-200 bg-base-200/40";

  const text =
    variant === "success"
      ? "text-success"
      : variant === "error"
        ? "text-error"
        : "text-base-content";

  return (
    <div
      className={`rounded-2xl border p-4 ${classes}`}
    >

      <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {label}
      </p>

      <p
        className={`mt-2 font-black ${text}`}
      >
        {value}
      </p>

    </div>
  );
}
