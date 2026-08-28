
"use client";

import { useEffect, useRef } from "react";

type PaiementReceipt = {
  id: number;
  reference: string;
  montant: number | string;
  devise: string;
  modePaiement: string;
  type: string;
  statut: string;
  datePaiement: string | Date;
  description?: string | null;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier: string;
    telephone?: string | null;
  } | null;

  facture?: {
    id: number;
    numero: string;
  } | null;

  caissier?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  paiement: PaiementReceipt;
};

function nomPatient(
  patient: PaiementReceipt["patient"],
) {
  if (!patient) return "Patient inconnu";

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(
  value: string | Date,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
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

function montant(
  value: number | string,
  devise: string,
) {
  return `${Number(value).toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )} ${devise}`;
}

export default function PaiementReceiptA8({
  paiement,
}: Props) {
  const impressionLancee =
    useRef(false);

  useEffect(() => {
    if (impressionLancee.current) {
      return;
    }

    impressionLancee.current = true;

    const timer = window.setTimeout(() => {
      window.print();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @page {
          size: 52mm 74mm;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        @media print {
          html,
          body {
            width: 52mm !important;
            min-width: 52mm !important;
            max-width: 52mm !important;

            margin: 0 !important;
            padding: 0 !important;

            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .receipt-a8,
          .receipt-a8 * {
            visibility: visible;
          }

          .receipt-a8 {
            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 52mm !important;
            min-height: 74mm !important;

            margin: 0 !important;
            padding: 3mm !important;

            background: white !important;
            color: black !important;

            box-shadow: none !important;
          }

          .print-button {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "20px",
        }}
      >
        <div
          className="print-button"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              border: "none",
              background: "#2563eb",
              color: "white",
              padding:
                "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🖨️ Imprimer le reçu
          </button>
        </div>

        <div
          className="receipt-a8"
          style={{
            width: "52mm",
            minHeight: "74mm",
            margin: "0 auto",
            background: "white",
            color: "black",
            padding: "3mm",
            fontFamily:
              "Arial, sans-serif",
            fontSize: "8px",
          }}
        >
          {/* EN-TÊTE */}

          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                margin: "0 auto 4px",
                border:
                  "1px solid black",
                borderRadius: "50%",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "14px",
              }}
            >
              +
            </div>

            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              HÔPITAL
            </div>

            <div
              style={{
                fontSize: "6px",
                marginTop: "2px",
              }}
            >
              SERVICE DE CAISSE
            </div>

            <div
              style={{
                borderTop:
                  "1px dashed black",
                margin:
                  "6px 0",
              }}
            />

            <div
              style={{
                fontSize: "8px",
                fontWeight: 800,
              }}
            >
              REÇU DE PAIEMENT
            </div>
          </div>

          {/* REFERENCE */}

          <div
            style={{
              border:
                "1px solid black",
              padding: "5px",
              textAlign: "center",
              marginTop: "7px",
            }}
          >
            <div
              style={{
                fontSize: "6px",
                fontWeight: 600,
              }}
            >
              RÉFÉRENCE
            </div>

            <div
              style={{
                fontSize: "8px",
                fontWeight: 800,
                marginTop: "2px",
                wordBreak:
                  "break-all",
              }}
            >
              {paiement.reference}
            </div>
          </div>

          {/* PATIENT */}

          <div
            style={{
              marginTop: "8px",
            }}
          >
            <div
              style={{
                fontSize: "7px",
                fontWeight: 800,
                borderBottom:
                  "1px solid black",
                paddingBottom:
                  "2px",
                marginBottom:
                  "4px",
              }}
            >
              PATIENT
            </div>

            <Row
              label="Nom"
              value={nomPatient(
                paiement.patient,
              )}
            />

            <Row
              label="Dossier"
              value={
                paiement.patient
                  ?.numeroDossier ||
                "-"
              }
            />

            {paiement.patient
              ?.telephone && (
              <Row
                label="Téléphone"
                value={
                  paiement.patient
                    .telephone
                }
              />
            )}
          </div>

          {/* PAIEMENT */}

          <div
            style={{
              marginTop: "8px",
            }}
          >
            <div
              style={{
                fontSize: "7px",
                fontWeight: 800,
                borderBottom:
                  "1px solid black",
                paddingBottom:
                  "2px",
                marginBottom:
                  "4px",
              }}
            >
              PAIEMENT
            </div>

            <Row
              label="Type"
              value={
                paiement.type
              }
            />

            <Row
              label="Mode"
              value={
                paiement.modePaiement
              }
            />

            {paiement.facture && (
              <Row
                label="Facture"
                value={
                  paiement.facture
                    .numero
                }
              />
            )}

            <Row
              label="Date"
              value={formatDate(
                paiement.datePaiement,
              )}
            />
          </div>

          {/* MONTANT */}

          <div
            style={{
              borderTop:
                "2px solid black",
              borderBottom:
                "2px solid black",
              padding:
                "7px 0",
              margin:
                "8px 0",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: "6px",
                fontWeight: 700,
              }}
            >
              MONTANT PAYÉ
            </div>

            <div
              style={{
                fontSize: "15px",
                fontWeight: 900,
                marginTop:
                  "3px",
              }}
            >
              {montant(
                paiement.montant,
                paiement.devise,
              )}
            </div>
          </div>

          {/* STATUT */}

          <div
            style={{
              textAlign: "center",
            }}
          >
            <span
              style={{
                display:
                  "inline-block",
                border:
                  "1px solid black",
                padding:
                  "2px 7px",
                fontSize: "6px",
                fontWeight: 800,
              }}
            >
              {paiement.statut}
            </span>
          </div>

          {/* DESCRIPTION */}

          {paiement.description && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "5px",
                borderTop:
                  "1px dashed black",
              }}
            >
              <div
                style={{
                  fontSize: "6px",
                  fontWeight: 800,
                }}
              >
                DESCRIPTION
              </div>

              <div
                style={{
                  fontSize: "6.5px",
                  marginTop: "2px",
                  wordBreak:
                    "break-word",
                }}
              >
                {
                  paiement.description
                }
              </div>
            </div>
          )}

          {/* CAISSIER */}

          <div
            style={{
              marginTop: "8px",
              paddingTop: "5px",
              borderTop:
                "1px dashed black",
              fontSize: "6.5px",
            }}
          >
            <Row
              label="Caissier"
              value={
                paiement.caissier
                  ?.name ||
                paiement.caissier
                  ?.email ||
                "Utilisateur connecté"
              }
            />
          </div>

          {/* PIED */}

          <div
            style={{
              marginTop: "9px",
              paddingTop: "6px",
              borderTop:
                "1px solid black",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: "6px",
                fontWeight: 600,
              }}
            >
              Merci pour votre confiance.
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "5px",
              }}
            >
              Ce reçu constitue
              une preuve de paiement.
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "5px",
              }}
            >
              ID paiement :
              #{paiement.id}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==========================================================
   LIGNE
========================================================== */

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: "8px",
        marginBottom:
          "2px",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {label} :
      </span>

      <span
        style={{
          textAlign: "right",
          wordBreak:
            "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

