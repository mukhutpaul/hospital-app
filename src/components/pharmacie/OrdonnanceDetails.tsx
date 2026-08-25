"use client";

import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
} from "lucide-react";

import { useRouter } from "next/navigation";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ==========================================================
   TYPES
========================================================== */

type Medicament = {
  id: number;
  code: string;
  nom: string;
  denomination?: string | null;
  forme?: string | null;
  dosage?: string | null;
  prixVente: number;
  devise: string;
};

type LigneOrdonnance = {
  id: number;
  quantite: number;

  posologie?: string | null;
  dose?: string | null;
  frequence?: string | null;
  duree?: string | null;
  voie?: string | null;
  observation?: string | null;

  medicament?: Medicament | null;
};

type Patient = {
  id: number;
  nom: string;
  postNom?: string | null;
  prenom?: string | null;
  numeroDossier?: string | null;
};

type Medecin = {
  id: number;
  nom: string;
  postNom?: string | null;
  prenom?: string | null;
  numeroOrdre?: string | null;
};

type Ordonnance = {
  id: number;
  numero: string;
  datePrescription: Date | string;
  statut: string;

  patient?: Patient | null;
  medecin?: Medecin | null;

  lignes: LigneOrdonnance[];
};

type Props = {
  ordonnance: Ordonnance;
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function OrdonnanceDetails({
  ordonnance,
}: Props) {
  const router = useRouter();

  /* ========================================================
     DATE
  ======================================================== */

  const formatDate = (
    date: Date | string,
  ) => {
    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };

  /* ========================================================
     PATIENT
  ======================================================== */

  const nomPatient = (
    patient?: Patient | null,
  ) => {
    if (!patient) {
      return "Patient inconnu";
    }

    return [
      patient.nom,
      patient.postNom,
      patient.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  };

  /* ========================================================
     MÉDECIN
  ======================================================== */

  const nomMedecin = (
    medecin?: Medecin | null,
  ) => {
    if (!medecin) {
      return "Médecin inconnu";
    }

    return [
      medecin.nom,
      medecin.postNom,
      medecin.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  };

  /* ========================================================
     DEVISE
  ======================================================== */

  const devise =
    ordonnance.lignes.find(
      (ligne) =>
        ligne.medicament?.devise,
    )?.medicament?.devise ??
    "USD";

  /* ========================================================
     PRIX
  ======================================================== */

  const getPrixUnitaire = (
    ligne: LigneOrdonnance,
  ) => {
    return (
      Number(
        ligne.medicament?.prixVente,
      ) || 0
    );
  };

  /* ========================================================
     QUANTITÉ
  ======================================================== */

  const getQuantite = (
    ligne: LigneOrdonnance,
  ) => {
    return (
      Number(ligne.quantite) || 0
    );
  };

  /* ========================================================
     TOTAL LIGNE
  ======================================================== */

  const getTotalLigne = (
    ligne: LigneOrdonnance,
  ) => {
    return (
      getPrixUnitaire(ligne) *
      getQuantite(ligne)
    );
  };

  /* ========================================================
     TOTAL GÉNÉRAL
  ======================================================== */

  const totalGeneral =
    ordonnance.lignes.reduce(
      (total, ligne) =>
        total +
        getTotalLigne(ligne),
      0,
    );

  /* ========================================================
     MONNAIE
  ======================================================== */

  const formatMoney = (
    montant: number,
    currency = devise,
  ) => {
    return `${montant.toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} ${currency}`;
  };

  /* ========================================================
     STATUT
  ======================================================== */

  const getStatutClass = (
    statut: string,
  ) => {
    switch (statut) {
      case "ACTIVE":
        return "badge-success";

      case "DISPENSEE":
        return "badge-info";

      case "PARTIELLE":
        return "badge-warning";

      case "ANNULEE":
      case "EXPIREE":
        return "badge-error";

      default:
        return "badge-ghost";
    }
  };

  /* ========================================================
     IMPRESSION
  ======================================================== */

  const handlePrint = () => {
    window.print();
  };

  /* ========================================================
     PDF — VERSION COMPACTE A4
  ======================================================== */

  const handleDownloadPDF = () => {
    const pdf = new jsPDF(
      "p",
      "mm",
      "a4",
    );

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    /*
      A4 = 210 mm

      Nous gardons 12 mm de marge
      de chaque côté.

      Zone utile = 186 mm.

      Le tableau utilise seulement
      180 mm pour éviter tout débordement.
    */

    const margin = 12;

    const contentWidth =
      pageWidth - margin * 2;

    let currentY = 16;

    /* ======================================================
       CADRE PAGE
    ====================================================== */

    const drawFrame = () => {
      pdf.setDrawColor(
        210,
        210,
        210,
      );

      pdf.setLineWidth(0.25);

      pdf.roundedRect(
        7,
        7,
        pageWidth - 14,
        pageHeight - 14,
        3,
        3,
      );
    };

    drawFrame();

    /* ======================================================
       EN-TÊTE
    ====================================================== */

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(15);

    pdf.text(
      "ORDONNANCE MÉDICALE",
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );

    currentY += 6;

    pdf.setFont(
      "helvetica",
      "normal",
    );

    pdf.setFontSize(8);

    pdf.text(
      `N° ${ordonnance.numero}`,
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );

    pdf.text(
      `Date : ${formatDate(
        ordonnance.datePrescription,
      )}`,
      pageWidth - margin,
      currentY - 6,
      {
        align: "right",
      },
    );

    currentY += 10;

    /* ======================================================
       PATIENT / MÉDECIN
    ====================================================== */

    const gap = 4;

    const boxWidth =
      (contentWidth - gap) / 2;

    const boxHeight = 25;

    /* PATIENT */

    pdf.setFillColor(
      248,
      248,
      248,
    );

    pdf.setDrawColor(
      225,
      225,
      225,
    );

    pdf.roundedRect(
      margin,
      currentY,
      boxWidth,
      boxHeight,
      2,
      2,
      "FD",
    );

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(7);

    pdf.text(
      "PATIENT",
      margin + 4,
      currentY + 6,
    );

    pdf.setFontSize(9);

    pdf.text(
      nomPatient(
        ordonnance.patient,
      ),
      margin + 4,
      currentY + 13,
    );

    pdf.setFont(
      "helvetica",
      "normal",
    );

    pdf.setFontSize(7);

    if (
      ordonnance.patient
        ?.numeroDossier
    ) {
      pdf.text(
        `Dossier : ${ordonnance.patient.numeroDossier}`,
        margin + 4,
        currentY + 20,
      );
    }

    /* MÉDECIN */

    const medecinX =
      margin +
      boxWidth +
      gap;

    pdf.setFillColor(
      248,
      248,
      248,
    );

    pdf.roundedRect(
      medecinX,
      currentY,
      boxWidth,
      boxHeight,
      2,
      2,
      "FD",
    );

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(7);

    pdf.text(
      "MÉDECIN",
      medecinX + 4,
      currentY + 6,
    );

    pdf.setFontSize(9);

    pdf.text(
      `Dr ${nomMedecin(
        ordonnance.medecin,
      )}`,
      medecinX + 4,
      currentY + 13,
    );

    pdf.setFont(
      "helvetica",
      "normal",
    );

    pdf.setFontSize(7);

    if (
      ordonnance.medecin
        ?.numeroOrdre
    ) {
      pdf.text(
        `N° ordre : ${ordonnance.medecin.numeroOrdre}`,
        medecinX + 4,
        currentY + 20,
      );
    }

    currentY +=
      boxHeight + 10;

    /* ======================================================
       TITRE MÉDICAMENTS
    ====================================================== */

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(10);

    pdf.text(
      "Médicaments prescrits",
      margin,
      currentY,
    );

    currentY += 4;

    /* ======================================================
       TABLEAU
    ====================================================== */

    autoTable(pdf, {
      startY: currentY,

      margin: {
        left: margin,
        right: margin,
      },

      /*
        TOTAL :

        Produit       54
        Forme         34
        Qté           13
        PU            39
        Total         40

        TOTAL = 180 mm

        Zone utile = 186 mm

        Il reste donc 6 mm de sécurité.
      */

      head: [
        [
          "Produit",
          "Forme / Dosage",
          "Qté",
          "PU",
          "Total",
        ],
      ],

      body:
        ordonnance.lignes.map(
          (ligne) => {
            const produit =
              ligne.medicament
                ?.nom ??
              "Médicament";

            const formeDosage = [
              ligne.medicament
                ?.forme,
              ligne.medicament
                ?.dosage,
            ]
              .filter(Boolean)
              .join(" / ");

            return [
              produit,
              formeDosage ||
                "—",
              String(
                getQuantite(
                  ligne,
                ),
              ),
              formatMoney(
                getPrixUnitaire(
                  ligne,
                ),
                ligne
                  .medicament
                  ?.devise ??
                  devise,
              ),
              formatMoney(
                getTotalLigne(
                  ligne,
                ),
                ligne
                  .medicament
                  ?.devise ??
                  devise,
              ),
            ];
          },
        ),

      theme: "grid",

      tableWidth: 180,

      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,

        overflow: "linebreak",

        valign: "middle",

        lineWidth: 0.2,

        lineColor: [
          210,
          210,
          210,
        ],
      },

      headStyles: {
        fontStyle: "bold",

        fontSize: 7,

        halign: "center",

        cellPadding: 2.2,
      },

      bodyStyles: {
        fontSize: 7,
      },

      columnStyles: {
        0: {
          cellWidth: 54,
          halign: "left",
        },

        1: {
          cellWidth: 34,
          halign: "left",
        },

        2: {
          cellWidth: 13,
          halign: "center",
        },

        3: {
          cellWidth: 39,
          halign: "right",
          fontSize: 6.5,
        },

        4: {
          cellWidth: 40,
          halign: "right",
          fontSize: 6.5,
        },
      },

      didDrawPage: () => {
        drawFrame();
      },
    });

    /* ======================================================
       POSITION APRÈS TABLEAU
    ====================================================== */

    const tableFinalY =
      (
        pdf as any
      ).lastAutoTable
        ?.finalY ??
      currentY + 20;

    currentY =
      tableFinalY + 6;

    /* ======================================================
       TOTAL GÉNÉRAL
    ====================================================== */

    const totalWidth = 68;

    const totalHeight = 15;

    const totalX =
      pageWidth -
      margin -
      totalWidth;

    /*
      Si le total arrive trop bas,
      on crée une nouvelle page.
    */

    if (
      currentY >
      pageHeight - 65
    ) {
      pdf.addPage();

      drawFrame();

      currentY = 18;
    }

    pdf.setFillColor(
      246,
      246,
      246,
    );

    pdf.setDrawColor(
      205,
      205,
      205,
    );

    pdf.setLineWidth(0.25);

    pdf.roundedRect(
      totalX,
      currentY,
      totalWidth,
      totalHeight,
      2,
      2,
      "FD",
    );

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(7.5);

    pdf.text(
      "TOTAL GÉNÉRAL",
      totalX + 4,
      currentY + 6,
    );

    /*
      IMPORTANT :
      le montant est suffisamment petit
      et aligné à droite.
    */

    pdf.setFontSize(8);

    pdf.text(
      formatMoney(
        totalGeneral,
      ),
      totalX +
        totalWidth -
        4,
      currentY + 12,
      {
        align: "right",
      },
    );

    currentY += 23;

    /* ======================================================
       POSOLOGIE
    ====================================================== */

    if (
      ordonnance.lignes.length >
      0
    ) {
      if (
        currentY >
        pageHeight - 70
      ) {
        pdf.addPage();

        drawFrame();

        currentY = 18;
      }

      pdf.setFont(
        "helvetica",
        "bold",
      );

      pdf.setFontSize(10);

      pdf.text(
        "Posologie et instructions",
        margin,
        currentY,
      );

      currentY += 7;

      ordonnance.lignes.forEach(
        (
          ligne,
          index,
        ) => {
          const nom =
            ligne.medicament
              ?.nom ??
            "Médicament";

          const details = [
            ligne.dose
              ? `Dose : ${ligne.dose}`
              : null,

            ligne.frequence,

            ligne.duree,

            ligne.voie
              ? `Voie : ${ligne.voie}`
              : null,
          ]
            .filter(Boolean)
            .join(" • ");

          let texte =
            `${index + 1}. ${nom}`;

          if (details) {
            texte +=
              ` — ${details}`;
          }

          if (
            ligne.posologie
          ) {
            texte +=
              ` — ${ligne.posologie}`;
          }

          if (
            ligne.observation
          ) {
            texte +=
              ` — ${ligne.observation}`;
          }

          const wrapped =
            pdf.splitTextToSize(
              texte,
              180,
            );

          const lineHeight = 4;

          const requiredHeight =
            wrapped.length *
              lineHeight +
            5;

          if (
            currentY +
              requiredHeight >
            pageHeight - 35
          ) {
            pdf.addPage();

            drawFrame();

            currentY = 18;

            pdf.setFont(
              "helvetica",
              "bold",
            );

            pdf.setFontSize(10);

            pdf.text(
              "Posologie et instructions",
              margin,
              currentY,
            );

            currentY += 7;
          }

          pdf.setFont(
            "helvetica",
            "normal",
          );

          pdf.setFontSize(7.5);

          pdf.text(
            wrapped,
            margin,
            currentY,
          );

          currentY +=
            requiredHeight;
        },
      );
    }

    /* ======================================================
       SIGNATURE
    ====================================================== */

    if (
      currentY >
      pageHeight - 55
    ) {
      pdf.addPage();

      drawFrame();
    }

    const signatureY =
      pageHeight - 38;

    pdf.setFont(
      "helvetica",
      "normal",
    );

    pdf.setFontSize(8);

    pdf.text(
      `Fait le ${formatDate(
        ordonnance.datePrescription,
      )}`,
      pageWidth - margin,
      signatureY,
      {
        align: "right",
      },
    );

    pdf.setDrawColor(
      120,
      120,
      120,
    );

    pdf.line(
      pageWidth -
        margin -
        50,
      signatureY + 9,
      pageWidth - margin,
      signatureY + 9,
    );

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.setFontSize(8);

    pdf.text(
      "Signature du médecin",
      pageWidth - margin,
      signatureY + 15,
      {
        align: "right",
      },
    );

    /* ======================================================
       PIED DE PAGE
    ====================================================== */

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pdf.setPage(page);

      pdf.setFont(
        "helvetica",
        "normal",
      );

      pdf.setFontSize(6.5);

      pdf.text(
        `Prescription médicale — ${ordonnance.numero}`,
        margin,
        pageHeight - 7,
      );

      pdf.text(
        `Page ${page} / ${totalPages}`,
        pageWidth - margin,
        pageHeight - 7,
        {
          align: "right",
        },
      );
    }

    /* ======================================================
       SAUVEGARDE
    ====================================================== */

    pdf.save(
      `ordonnance-${ordonnance.numero}.pdf`,
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            router.push(
              "/pharmacie/ordonnances",
            )
          }
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={
              handlePrint
            }
          >
            <Printer size={18} />
            Imprimer
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={
              handleDownloadPDF
            }
          >
            <Download size={18} />
            Télécharger PDF
          </button>
        </div>
      </div>

      {/* =====================================================
          DOCUMENT
      ===================================================== */}

      <div
        id="ordonnance-print"
        className="
          ordonnance-document
          mx-auto
          w-full
          max-w-5xl
          overflow-hidden
          rounded-2xl
          border
          border-base-300
          bg-base-100
          shadow-sm
          print:max-w-none
          print:rounded-none
          print:border-0
          print:shadow-none
        "
      >
        {/* ===================================================
            EN-TÊTE
        =================================================== */}

        <div className="border-b border-base-300 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
                  <FileText size={22} />
                </div>

                <div>
                  <h1 className="text-xl font-bold">
                    ORDONNANCE MÉDICALE
                  </h1>

                  <p className="text-sm opacity-60">
                    N°{" "}
                    {ordonnance.numero}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm opacity-60">
                Date de prescription
              </p>

              <p className="font-semibold">
                {formatDate(
                  ordonnance.datePrescription,
                )}
              </p>

              <span
                className={`badge mt-2 ${getStatutClass(
                  ordonnance.statut,
                )}`}
              >
                {ordonnance.statut}
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            PATIENT / MÉDECIN
        =================================================== */}

        <div className="grid gap-4 border-b border-base-300 p-6 md:grid-cols-2">
          <div className="min-w-0 rounded-xl bg-base-200/50 p-4">
            <p className="mb-2 text-xs font-bold uppercase opacity-60">
              Patient
            </p>

            <p className="break-words text-lg font-semibold">
              {nomPatient(
                ordonnance.patient,
              )}
            </p>

            {ordonnance.patient
              ?.numeroDossier && (
              <p className="mt-1 break-words text-sm opacity-60">
                Dossier :{" "}
                {
                  ordonnance.patient
                    .numeroDossier
                }
              </p>
            )}
          </div>

          <div className="min-w-0 rounded-xl bg-base-200/50 p-4">
            <p className="mb-2 text-xs font-bold uppercase opacity-60">
              Médecin
            </p>

            <p className="break-words text-lg font-semibold">
              Dr{" "}
              {nomMedecin(
                ordonnance.medecin,
              )}
            </p>

            {ordonnance.medecin
              ?.numeroOrdre && (
              <p className="mt-1 break-words text-sm opacity-60">
                N° ordre :{" "}
                {
                  ordonnance.medecin
                    .numeroOrdre
                }
              </p>
            )}
          </div>
        </div>

        {/* ===================================================
            MÉDICAMENTS
        =================================================== */}

        <div className="p-6">
          <h2 className="mb-4 text-lg font-bold">
            Médicaments prescrits
          </h2>

          {ordonnance.lignes.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-base-300 p-8 text-center opacity-60">
              Aucun médicament
              dans cette
              prescription.
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-[30%]">
                      Produit
                    </th>

                    <th className="w-[22%]">
                      Forme / Dosage
                    </th>

                    <th className="w-[10%] text-center">
                      Qté
                    </th>

                    <th className="w-[19%] text-right">
                      PU
                    </th>

                    <th className="w-[19%] text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ordonnance.lignes.map(
                    (ligne) => (
                      <tr
                        key={
                          ligne.id
                        }
                      >
                        <td className="break-words">
                          <div className="font-semibold">
                            {
                              ligne
                                .medicament
                                ?.nom ??
                              "Médicament inconnu"
                            }
                          </div>

                          {ligne
                            .medicament
                            ?.code && (
                            <div className="break-all text-xs opacity-50">
                              Code :{" "}
                              {
                                ligne
                                  .medicament
                                  .code
                              }
                            </div>
                          )}
                        </td>

                        <td className="break-words">
                          <div>
                            {
                              ligne
                                .medicament
                                ?.forme ??
                              "—"
                            }
                          </div>

                          <div className="text-xs opacity-60">
                            {
                              ligne
                                .medicament
                                ?.dosage ??
                              "—"
                            }
                          </div>
                        </td>

                        <td className="text-center font-semibold">
                          {getQuantite(
                            ligne,
                          )}
                        </td>

                        <td className="break-words text-right text-sm">
                          {formatMoney(
                            getPrixUnitaire(
                              ligne,
                            ),
                            ligne
                              .medicament
                              ?.devise ??
                              devise,
                          )}
                        </td>

                        <td className="break-words text-right text-sm font-semibold">
                          {formatMoney(
                            getTotalLigne(
                              ligne,
                            ),
                            ligne
                              .medicament
                              ?.devise ??
                              devise,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td
                      colSpan={4}
                      className="break-words text-right font-bold"
                    >
                      TOTAL GÉNÉRAL
                    </td>

                    <td className="break-words text-right font-bold text-primary">
                      {formatMoney(
                        totalGeneral,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================
            POSOLOGIE
        =================================================== */}

        {ordonnance.lignes
          .length > 0 && (
          <div className="border-t border-base-300 p-6">
            <h2 className="mb-4 text-lg font-bold">
              Posologie et instructions
            </h2>

            <div className="space-y-3">
              {ordonnance.lignes.map(
                (
                  ligne,
                  index,
                ) => (
                  <div
                    key={
                      ligne.id
                    }
                    className="break-inside-avoid rounded-xl border border-base-300 p-4"
                  >
                    <div className="break-words font-semibold">
                      {index + 1}.{" "}
                      {ligne
                        .medicament
                        ?.nom ??
                        "Médicament"}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      {ligne.dose && (
                        <span className="badge badge-outline">
                          Dose :{" "}
                          {
                            ligne.dose
                          }
                        </span>
                      )}

                      {ligne.frequence && (
                        <span className="badge badge-outline">
                          {
                            ligne.frequence
                          }
                        </span>
                      )}

                      {ligne.duree && (
                        <span className="badge badge-outline">
                          {
                            ligne.duree
                          }
                        </span>
                      )}

                      {ligne.voie && (
                        <span className="badge badge-outline">
                          Voie :{" "}
                          {
                            ligne.voie
                          }
                        </span>
                      )}
                    </div>

                    {ligne.posologie && (
                      <p className="mt-2 break-words text-sm">
                        <strong>
                          Posologie :
                        </strong>{" "}
                        {
                          ligne.posologie
                        }
                      </p>
                    )}

                    {ligne.observation && (
                      <p className="mt-2 break-words text-sm opacity-70">
                        <strong>
                          Observation :
                        </strong>{" "}
                        {
                          ligne.observation
                        }
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            PIED
        =================================================== */}

        <div className="border-t border-base-300 p-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <p className="text-sm opacity-60">
                Prescription médicale
              </p>

              <p className="font-semibold">
                {ordonnance.numero}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm opacity-60">
                Fait le{" "}
                {formatDate(
                  ordonnance.datePrescription,
                )}
              </p>

              <div className="mt-10 border-t border-base-content/30 pt-2 md:w-56">
                <p className="text-sm font-semibold">
                  Signature du médecin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          IMPRESSION
      ===================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html,
          body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            overflow: visible !important;
          }

          body * {
            visibility: hidden !important;
          }

          #ordonnance-print,
          #ordonnance-print * {
            visibility: visible !important;
          }

          #ordonnance-print {
            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 194mm !important;
            max-width: 194mm !important;

            margin: 0 !important;
            padding: 0 !important;

            border: 0 !important;
            border-radius: 0 !important;

            box-shadow: none !important;

            overflow: visible !important;

            background: white !important;
          }

          /*
          ================================================
          TABLEAU
          ================================================
          */

          #ordonnance-print table {
            width: 100% !important;
            max-width: 100% !important;

            table-layout: fixed !important;

            border-collapse: collapse !important;
          }

          #ordonnance-print th,
          #ordonnance-print td {
            min-width: 0 !important;

            padding: 4px !important;

            white-space: normal !important;

            overflow-wrap: anywhere !important;

            word-break: break-word !important;
          }

          /*
          Produit
          */

          #ordonnance-print th:nth-child(1),
          #ordonnance-print td:nth-child(1) {
            width: 30% !important;
          }

          /*
          Forme
          */

          #ordonnance-print th:nth-child(2),
          #ordonnance-print td:nth-child(2) {
            width: 22% !important;
          }

          /*
          Quantité
          */

          #ordonnance-print th:nth-child(3),
          #ordonnance-print td:nth-child(3) {
            width: 10% !important;
            text-align: center !important;
          }

          /*
          PU
          */

          #ordonnance-print th:nth-child(4),
          #ordonnance-print td:nth-child(4) {
            width: 19% !important;
            text-align: right !important;
            font-size: 9px !important;
          }

          /*
          TOTAL
          */

          #ordonnance-print th:nth-child(5),
          #ordonnance-print td:nth-child(5) {
            width: 19% !important;
            text-align: right !important;
            font-size: 9px !important;
          }

          /*
          ================================================
          PADDING
          ================================================
          */

          #ordonnance-print .p-6 {
            padding: 5mm !important;
          }

          #ordonnance-print .p-4 {
            padding: 3mm !important;
          }

          /*
          ================================================
          ÉVITER COUPURES
          ================================================
          */

          #ordonnance-print tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #ordonnance-print
            .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /*
          ================================================
          BARRE ACTIONS
          ================================================
          */

          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }

          /*
          ================================================
          COULEURS
          ================================================
          */

          #ordonnance-print {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}