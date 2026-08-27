"use client";

type Ligne = {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  typeOrigine?: string;
  service?: {
    id: number;
    nom: string;
  } | null;
};

type Props = {
  lignes: Ligne[];
};

export default function LignesProforma({
  lignes,
}: Props) {
  const groupes = lignes.reduce(
    (acc: Record<string, Ligne[]>, ligne) => {
      const service =
        ligne.service?.nom || "Service général";

      if (!acc[service]) {
        acc[service] = [];
      }

      acc[service].push(ligne);

      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupes).map(
        ([service, items]) => (
          <section key={service}>
            <div className="bg-base-200 px-4 py-2 font-bold">
              {service}
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Origine</th>
                  <th>Qté</th>
                  <th>Prix</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {items.map((ligne, index) => (
                  <tr key={ligne.id ?? index}>
                    <td>{ligne.designation}</td>

                    <td>
                      <span className="badge badge-outline">
                        {ligne.typeOrigine ||
                          "MANUEL"}
                      </span>
                    </td>

                    <td>{ligne.quantite}</td>

                    <td>
                      {Number(
                        ligne.prixUnitaire
                      ).toFixed(2)}
                    </td>

                    <td className="font-bold">
                      {Number(
                        ligne.montant
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={4}>
                    Total {service}
                  </td>

                  <td>
                    {items
                      .reduce(
                        (sum, l) =>
                          sum +
                          Number(
                            l.montant || 0
                          ),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        )
      )}
    </div>
  );
}