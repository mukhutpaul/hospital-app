import Link from "next/link";
import { getPaiements } from "@/app/actions/finance";

export default async function PaiementsPage() {
  const result = await getPaiements();

  /*
   * getPaiements() peut retourner :
   *
   * [
   *   ...
   * ]
   *
   * ou :
   *
   * {
   *   success: true,
   *   data: [...]
   * }
   *
   * On normalise toujours en tableau.
   */
  const paiements = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
      ? result.data
      : [];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Paiements
          </h1>

          <p className="opacity-60">
            Tous les encaissements restent rattachés
            à une facture, un patient et, lorsque
            disponible, une consultation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/facturation/factures"
            className="btn btn-outline"
          >
            📄 Factures
          </Link>

          <Link
            href="/facturation/paiements/nouveau"
            className="btn btn-primary"
          >
            ➕ Nouveau paiement
          </Link>

        </div>
      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">
            Nombre de paiements
          </div>

          <div className="stat-value">
            {paiements.length}
          </div>

          <div className="stat-desc">
            Total des encaissements
          </div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">
            Total encaissé
          </div>

          <div className="stat-value text-success">
            {paiements
              .filter(
                (p: any) =>
                  p.statut !== "ANNULE"
              )
              .reduce(
                (
                  total: number,
                  p: any
                ) =>
                  total +
                  Number(
                    p.montant || 0
                  ),
                0
              )
              .toFixed(2)}
          </div>

          <div className="stat-desc">
            Paiements valides
          </div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-title">
            Paiements annulés
          </div>

          <div className="stat-value text-error">
            {paiements
              .filter(
                (p: any) =>
                  p.statut === "ANNULE"
              )
              .reduce(
                (
                  total: number,
                  p: any
                ) =>
                  total +
                  Number(
                    p.montant || 0
                  ),
                0
              )
              .toFixed(2)}
          </div>

          <div className="stat-desc">
            Montant annulé
          </div>
        </div>

      </div>

      {/* =====================================================
          TABLEAU
      ====================================================== */}

      <div className="card border bg-base-100 shadow">

        <div className="card-body p-0">

          <div className="overflow-x-auto">

            <table className="table table-zebra">

              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Patient</th>
                  <th>Consultation</th>
                  <th>Facture</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {paiements.length === 0 ? (

                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10"
                    >
                      <div className="flex flex-col items-center gap-2">

                        <span className="text-4xl">
                          💳
                        </span>

                        <span className="font-semibold">
                          Aucun paiement
                        </span>

                        <span className="text-sm opacity-60">
                          Aucun encaissement n'a encore
                          été enregistré.
                        </span>

                      </div>
                    </td>
                  </tr>

                ) : (

                  paiements.map(
                    (p: any) => {

                      const patient =
                        p.patient;

                      const facture =
                        p.facture;

                      const consultation =
                        facture?.consultation;

                      return (
                        <tr
                          key={p.id}
                        >

                          {/* =================================
                              REFERENCE
                          ================================== */}

                          <td>
                            <span className="font-semibold">
                              {p.reference || "—"}
                            </span>
                          </td>

                          {/* =================================
                              PATIENT
                          ================================== */}

                          <td>

                            {patient ? (
                              <>
                                <div className="font-medium">
                                  {patient.nom}{" "}
                                  {patient.postNom || ""}{" "}
                                  {patient.prenom || ""}
                                </div>

                                <div className="text-xs opacity-60">
                                  {patient.numeroDossier ||
                                    "—"}
                                </div>
                              </>
                            ) : (
                              <span className="opacity-60">
                                Patient inconnu
                              </span>
                            )}

                          </td>

                          {/* =================================
                              CONSULTATION
                          ================================== */}

                          <td>

                            {consultation ? (
                              <span className="font-medium">
                                CONS-
                                {
                                  consultation.idConsultation
                                }
                              </span>
                            ) : (
                              <span className="opacity-60">
                                —
                              </span>
                            )}

                          </td>

                          {/* =================================
                              FACTURE
                          ================================== */}

                          <td>

                            {facture ? (
                              <Link
                                href={`/facturation/factures/${facture.id}`}
                                className="link link-primary font-medium"
                              >
                                {facture.numero}
                              </Link>
                            ) : (
                              <span className="opacity-60">
                                —
                              </span>
                            )}

                          </td>

                          {/* =================================
                              MODE
                          ================================== */}

                          <td>
                            {getModePaiementLabel(
                              p.modePaiement
                            )}
                          </td>

                          {/* =================================
                              MONTANT
                          ================================== */}

                          <td>
                            <span className="font-semibold">
                              {Number(
                                p.montant || 0
                              ).toFixed(2)}{" "}
                              {p.devise || "CDF"}
                            </span>
                          </td>

                          {/* =================================
                              DATE
                          ================================== */}

                          <td>
                            {formatDate(
                              p.datePaiement
                            )}
                          </td>

                          {/* =================================
                              STATUT
                          ================================== */}

                          <td>
                            <span
                              className={getStatutClass(
                                p.statut
                              )}
                            >
                              {getStatutLabel(
                                p.statut
                              )}
                            </span>
                          </td>

                          {/* =================================
                              ACTIONS
                          ================================== */}

                          <td>

                            <div className="flex justify-end gap-1">

                              {/* DETAILS */}

                              <Link
                                href={`/facturation/paiements/${p.id}`}
                                className="btn btn-sm btn-ghost"
                                title="Voir le paiement"
                              >
                                👁️
                              </Link>

                              {/* RECU */}

                              <Link
                                href={`/facturation/paiements/${p.id}/print`}
                                className="btn btn-sm btn-outline"
                                title="Imprimer le reçu"
                              >
                                🧾 Reçu
                              </Link>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   DATE
========================================================== */

function formatDate(
  date: Date | string | null | undefined
) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* ==========================================================
   MODE PAIEMENT
========================================================== */

function getModePaiementLabel(
  mode: string | null | undefined
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

  if (!mode) {
    return "—";
  }

  return (
    modes[mode] || mode
  );
}

/* ==========================================================
   STATUT
========================================================== */

function getStatutLabel(
  statut: string | null | undefined
) {
  const statuts: Record<
    string,
    string
  > = {
    PAYE: "Payé",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
  };

  if (!statut) {
    return "—";
  }

  return (
    statuts[statut] || statut
  );
}

/* ==========================================================
   CLASSE STATUT
========================================================== */

function getStatutClass(
  statut: string | null | undefined
) {
  switch (statut) {
    case "PAYE":
      return "badge badge-success";

    case "ANNULE":
      return "badge badge-error";

    case "REMBOURSE":
      return "badge badge-warning";

    default:
      return "badge badge-ghost";
  }
}