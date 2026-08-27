"use client";

import Link from "next/link";

type Proforma = {
  id: number;
  numero: string;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string;
  } | null;

  montantBrut: number;
  reduction: number;
  montantTotal: number;

  devise: string;
  statut: string;

  dateEmission: Date | string;
  dateExpiration?: Date | string | null;
};

type Props = {
  proformas: Proforma[];
};

function formatMontant(
  montant: number,
  devise: string
) {
  return `${montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${devise}`;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "BROUILLON":
      return "badge-warning";

    case "VALIDE":
      return "badge-info";

    case "EXPIRE":
      return "badge-error";

    case "FACTURE":
      return "badge-success";

    case "ANNULE":
      return "badge-error";

    default:
      return "badge-ghost";
  }
}

export default function ProformaTable({
  proformas,
}: Props) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-base-300 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Liste des proformas
          </h2>

          <p className="text-sm text-base-content/60">
            {proformas.length} proforma
            {proformas.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/facturation/proformas/nouveau"
          className="btn btn-primary"
        >
          + Nouveau proforma
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>N°</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Montant brut</th>
              <th>Réduction</th>
              <th>Total</th>
              <th>Statut</th>
              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {proformas.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl opacity-40">
                      📄
                    </div>

                    <p className="font-semibold">
                      Aucun proforma
                    </p>

                    <p className="text-sm text-base-content/60">
                      Aucun proforma n'a encore été enregistré.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              proformas.map((proforma) => (
                <tr key={proforma.id}>
                  {/* NUMERO */}
                  <td>
                    <span className="font-semibold">
                      {proforma.numero}
                    </span>
                  </td>

                  {/* PATIENT */}
                  <td>
                    {proforma.patient ? (
                      <div>
                        <div className="font-medium">
                          {proforma.patient.nom}{" "}
                          {proforma.patient.postNom ?? ""}{" "}
                          {proforma.patient.prenom ?? ""}
                        </div>

                        {proforma.patient.numeroDossier && (
                          <div className="text-xs text-base-content/50">
                            Dossier :{" "}
                            {proforma.patient.numeroDossier}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-base-content/50">
                        Patient inconnu
                      </span>
                    )}
                  </td>

                  {/* DATE */}
                  <td>
                    {formatDate(
                      proforma.dateEmission
                    )}
                  </td>

                  {/* BRUT */}
                  <td>
                    {formatMontant(
                      proforma.montantBrut,
                      proforma.devise
                    )}
                  </td>

                  {/* REDUCTION */}
                  <td>
                    {proforma.reduction > 0 ? (
                      <span className="text-warning">
                        -{" "}
                        {formatMontant(
                          proforma.reduction,
                          proforma.devise
                        )}
                      </span>
                    ) : (
                      <span className="text-base-content/50">
                        -
                      </span>
                    )}
                  </td>

                  {/* TOTAL */}
                  <td>
                    <span className="font-bold">
                      {formatMontant(
                        proforma.montantTotal,
                        proforma.devise
                      )}
                    </span>
                  </td>

                  {/* STATUT */}
                  <td>
                    <span
                      className={`badge ${getStatutClass(
                        proforma.statut
                      )}`}
                    >
                      {proforma.statut}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/facturation/proformas/${proforma.id}`}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Voir
                      </Link>

                      <Link
                        href={`/facturation/proformas/${proforma.id}`}
                        className="btn btn-sm btn-ghost"
                      >
                        Détails
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}