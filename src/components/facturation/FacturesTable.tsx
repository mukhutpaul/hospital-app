"use client";

import Link from "next/link";

type Props = {
  factures: any[];
};

export default function FactureTable({
  factures,
}: Props) {
  const money = (v: number) =>
    Number(v || 0).toFixed(2);

  const statusClass = (statut: string) => {
    switch (statut) {
      case "PAYEE":
        return "badge-success";

      case "PARTIELLEMENT_PAYEE":
        return "badge-warning";

      case "ANNULEE":
        return "badge-error";

      default:
        return "badge-error";
    }
  };

  return (
    <div className="overflow-x-auto bg-base-100 rounded-box shadow">
      <table className="table">
        <thead>
          <tr>
            <th>Facture</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Total</th>
            <th>Payé</th>
            <th>Reste</th>
            <th>Statut</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {factures.map((f) => (
            <tr key={f.id}>
              <td className="font-semibold">
                {f.numero}
              </td>

              <td>
                {f.patient?.nom}{" "}
                {f.patient?.postNom || ""}{" "}
                {f.patient?.prenom || ""}
              </td>

              <td>
                {new Date(
                  f.dateFacture
                ).toLocaleDateString("fr-FR")}
              </td>

              <td className="font-bold">
                {money(f.montantTotal)} {f.devise}
              </td>

              <td className="text-success">
                {money(f.montantPaye)} {f.devise}
              </td>

              <td className="text-error">
                {money(f.reste)} {f.devise}
              </td>

              <td>
                <span
                  className={`badge ${statusClass(
                    f.statut
                  )}`}
                >
                  {f.statut}
                </span>
              </td>

              <td>
                <Link
                  href={`/facturation/factures/${f.id}`}
                  className="btn btn-sm btn-primary"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}

          {factures.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center py-10"
              >
                Aucune facture.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}