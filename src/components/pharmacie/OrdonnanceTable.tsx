"use client";

import { Eye, FileText } from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

export type Ordonnance = {
  id: number;
  numero: string;
  datePrescription: Date | string;
  statut: string;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  medecin?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
  } | null;

  lignes?: {
    id: number;
    quantite: number;
    posologie?: string | null;
    dose?: string | null;
    frequence?: string | null;
    duree?: string | null;
    voie?: string | null;

    medicament?: {
      id: number;
      code: string;
      nom: string;
      forme?: string | null;
      dosage?: string | null;
    } | null;
  }[];
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  ordonnances: Ordonnance[];
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function OrdonnanceTable({
  ordonnances,
}: Props) {
  /* ========================================================
     FORMAT DATE
  ======================================================== */

  const formatDate = (date: Date | string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* ========================================================
     NOM PATIENT
  ======================================================== */

  const nomPatient = (
    patient?: Ordonnance["patient"]
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
     NOM MEDECIN
  ======================================================== */

  const nomMedecin = (
    medecin?: Ordonnance["medecin"]
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
     STATUT
  ======================================================== */

  const getStatutClass = (statut: string) => {
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
     NAVIGATION
  ======================================================== */

  const voirOrdonnance = (id: number) => {
    window.location.href =
      `/pharmacie/ordonnances/${id}`;
  };

  /* ========================================================
     AUCUNE DONNEE
  ======================================================== */

  if (!ordonnances || ordonnances.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <FileText
          className="mx-auto mb-3 h-10 w-10 opacity-40"
        />

        <h3 className="font-semibold">
          Aucune ordonnance disponible
        </h3>

        <p className="mt-1 text-sm opacity-60">
          Les ordonnances médicales apparaîtront ici.
        </p>
      </div>
    );
  }

  /* ========================================================
     TABLEAU
  ======================================================== */

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
        {/* ==================================================
            HEADER
        ================================================== */}

        <thead>
          <tr>
            <th>N° Ordonnance</th>
            <th>Date</th>
            <th>Patient</th>
            <th>Médecin</th>
            <th>Médicaments</th>
            <th>Statut</th>
            <th className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        {/* ==================================================
            BODY
        ================================================== */}

        <tbody>
          {ordonnances.map((ordonnance) => (
            <tr key={ordonnance.id}>
              {/* ============================================
                  NUMERO
              ============================================ */}

              <td>
                <span className="font-semibold">
                  {ordonnance.numero}
                </span>
              </td>

              {/* ============================================
                  DATE
              ============================================ */}

              <td>
                {formatDate(
                  ordonnance.datePrescription
                )}
              </td>

              {/* ============================================
                  PATIENT
              ============================================ */}

              <td>
                <div className="font-medium">
                  {nomPatient(
                    ordonnance.patient
                  )}
                </div>

                {ordonnance.patient
                  ?.numeroDossier && (
                  <div className="text-xs opacity-60">
                    Dossier :{" "}
                    {
                      ordonnance.patient
                        .numeroDossier
                    }
                  </div>
                )}
              </td>

              {/* ============================================
                  MEDECIN
              ============================================ */}

              <td>
                {nomMedecin(
                  ordonnance.medecin
                )}
              </td>

              {/* ============================================
                  MEDICAMENTS
              ============================================ */}

              <td>
                <span className="badge badge-outline">
                  {ordonnance.lignes
                    ?.length ?? 0}{" "}
                  médicament
                  {(ordonnance.lignes
                    ?.length ?? 0) > 1
                    ? "s"
                    : ""}
                </span>
              </td>

              {/* ============================================
                  STATUT
              ============================================ */}

              <td>
                <span
                  className={`badge ${getStatutClass(
                    ordonnance.statut
                  )}`}
                >
                  {ordonnance.statut}
                </span>
              </td>

              {/* ============================================
                  ACTIONS
              ============================================ */}

              <td>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    title="Voir l'ordonnance"
                    onClick={() =>
                      voirOrdonnance(
                        ordonnance.id
                      )
                    }
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}