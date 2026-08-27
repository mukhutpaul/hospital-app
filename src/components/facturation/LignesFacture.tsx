"use client";

type Ligne = {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  service?: {
    id: number;
    nom: string;
  } | null;
};

type Props = {
  lignes: Ligne[];
};

export default function LignesFacture({
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
          <div key={service}>
            <div className="bg-base-200 px-4 py-2 font-bold">
              {service}
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Qté</th>
                    <th>Prix unitaire</th>
                    <th>Montant</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((ligne, index) => (
                    <tr key={ligne.id ?? index}>
                      <td>
                        {ligne.designation}
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
                    <td colSpan={3}>
                      <strong>
                        Total {service}
                      </strong>
                    </td>

                    <td>
                      <strong>
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
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}