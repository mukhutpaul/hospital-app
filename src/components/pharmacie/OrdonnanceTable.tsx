"use client";

import { Eye, FileText } from "lucide-react";

type Medicament = {
  id: number;
  code: string;
  nom: string;
  forme?: string | null;
  dosage?: string | null;
};

type LigneOrdonnance = {
  id: number;
  quantite: number;
  posologie?: string | null;
  dose?: string | null;
  frequence?: string | null;
  duree?: string | null;
  voie?: string | null;
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
};

type Ordonnance = {
  id: number;
  numero: string;
  datePrescription: Date | string;
  statut: string;

  patient?: Patient | null;

  medecin?: Medecin | null;

  lignes?: LigneOrdonnance[];
};

type Props = {
  ordonnances: Ordonnance[];
};

export default function OrdonnanceTable({
  ordonnances,
}: Props) {
  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  /* ==========================================================
     NOM PATIENT
  ========================================================== */

  const nomPatient = (
    patient?: Patient | null
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

  /* ==========================================================
     NOM MÉDECIN
  ========================================================== */

  const nomMedecin = (
    medecin?: Medecin | null
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

  /* ==========================================================
     STATUT
  ========================================================== */

  const getStatutClass = (
    statut: string
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

  /* ==========================================================
     AUCUNE ORDONNANCE
  ========================================================== */

  if (
    !ordonnances ||
    ordonnances.length === 0
  ) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <FileText
          className="mx-auto mb-3 opacity-40"
          size={40}
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

  /* ==========================================================
     TABLEAU
  ========================================================== */

  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table">
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

        <tbody>
          {ordonnances.map(
            (ordonnance: Ordonnance) => (
              <tr key={ordonnance.id}>
                {/* NUMÉRO */}

                <td>
                  <span className="font-semibold">
                    {ordonnance.numero}
                  </span>
                </td>

                {/* DATE */}

                <td>
                  {formatDate(
                    ordonnance.datePrescription
                  )}
                </td>

                {/* PATIENT */}

                <td>
                  <div className="font-medium">
                    {nomPatient(
                      ordonnance.patient
                    )}
                  </div>

                  {ordonnance.patient
                    ?.numeroDossier && (
                    <div className="text-xs opacity-60">
                      {
                        ordonnance.patient
                          .numeroDossier
                      }
                    </div>
                  )}
                </td>

                {/* MÉDECIN */}

                <td>
                  {nomMedecin(
                    ordonnance.medecin
                  )}
                </td>

                {/* MÉDICAMENTS */}

                <td>
                  <div className="flex flex-wrap gap-1">
                    {ordonnance.lignes &&
                    ordonnance.lignes.length > 0 ? (
                      ordonnance.lignes.map(
                        (
                          ligne: LigneOrdonnance
                        ) => (
                          <span
                            key={ligne.id}
                            className="badge badge-outline"
                          >
                            {ligne.medicament
                              ?.nom ??
                              "Médicament inconnu"}

                            {" × "}

                            {ligne.quantite}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm opacity-50">
                        Aucun médicament
                      </span>
                    )}
                  </div>
                </td>

                {/* STATUT */}

                <td>
                  <span
                    className={`badge ${getStatutClass(
                      ordonnance.statut
                    )}`}
                  >
                    {ordonnance.statut}
                  </span>
                </td>

                {/* ACTIONS */}

                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      title="Voir l'ordonnance"
                      onClick={() => {
                        window.location.href =
                          `/pharmacie/ordonnances/${ordonnance.id}`;
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}