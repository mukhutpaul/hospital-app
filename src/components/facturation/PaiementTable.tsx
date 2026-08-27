"use client";

import Link from "next/link";
import { deletePaiement } from "@/app/actions/paiements";
import { useState } from "react";

type PaiementTableProps = {
  paiements: any[];
};

export default function PaiementTable({
  paiements,
}: PaiementTableProps) {
  const [loading, setLoading] = useState<number | null>(null);

  async function supprimer(id: number) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce paiement ?"
    );

    if (!confirmation) return;

    setLoading(id);

    const result = await deletePaiement(id);

    setLoading(null);

    if (!result.success) {
      alert(result.message);
      return;
    }

    window.location.reload();
  }

  if (!paiements.length) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center">
        <div className="text-4xl mb-3">
          💰
        </div>

        <h2 className="font-semibold text-lg">
          Aucun paiement
        </h2>

        <p className="text-base-content/60 mt-1">
          Aucun encaissement n'a encore été enregistré.
        </p>
      </div>
    );
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">

      <div className="card-body p-0">

        <div className="overflow-x-auto">

          <table className="table table-zebra">

            <thead>
              <tr>
                <th>Référence</th>
                <th>Patient</th>
                <th>Facture</th>
                <th>Consultation</th>
                <th>Mode</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {paiements.map((p) => {

                const consultation =
                  p.facture?.consultation;

                return (
                  <tr key={p.id}>

                    {/* REFERENCE */}

                    <td>
                      <div className="font-semibold">
                        {p.reference}
                      </div>
                    </td>

                    {/* PATIENT */}

                    <td>
                      <div className="font-medium">
                        {p.patient?.nom}{" "}
                        {p.patient?.postNom || ""}{" "}
                        {p.patient?.prenom || ""}
                      </div>

                      <div className="text-xs opacity-60">
                        {p.patient?.numeroDossier}
                      </div>
                    </td>

                    {/* FACTURE */}

                    <td>
                      {p.facture ? (
                        <Link
                          href={`/factures/${p.facture.id}`}
                          className="link link-primary"
                        >
                          {p.facture.numero}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* CONSULTATION */}

                    <td>
                      {consultation
                        ? `CONS-${consultation.idConsultation}`
                        : "—"}
                    </td>

                    {/* MODE */}

                    <td>
                      <span className="badge badge-outline">
                        {p.modePaiement}
                      </span>
                    </td>

                    {/* TYPE */}

                    <td>
                      {p.type}
                    </td>

                    {/* MONTANT */}

                    <td>
                      <strong>
                        {Number(p.montant).toFixed(2)}
                      </strong>{" "}
                      {p.devise}
                    </td>

                    {/* DATE */}

                    <td>
                      {new Date(
                        p.datePaiement
                      ).toLocaleString("fr-FR")}
                    </td>

                    {/* STATUT */}

                    <td>
                      <span
                        className={`badge ${
                          p.statut === "PAYE"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {p.statut}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex gap-2">

                        <Link
                          href={`/paiements/${p.id}`}
                          className="btn btn-xs btn-outline"
                        >
                          Voir
                        </Link>

                        <Link
                          href={`/paiements/${p.id}/modifier`}
                          className="btn btn-xs btn-outline"
                        >
                          Modifier
                        </Link>

                        <Link
                          href={`/paiements/${p.id}/recu`}
                          className="btn btn-xs btn-primary"
                        >
                          Reçu
                        </Link>

                        <button
                          type="button"
                          className="btn btn-xs btn-error btn-outline"
                          disabled={loading === p.id}
                          onClick={() => supprimer(p.id)}
                        >
                          {loading === p.id
                            ? "..."
                            : "Supprimer"}
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}