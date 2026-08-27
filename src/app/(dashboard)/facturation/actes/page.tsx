import { getActesMedicaux } from "@/app/actions/facturation";

export default async function ActesPage() {
  const result = await getActesMedicaux();

  const actes = result.success ? result.data ?? [] : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Tarification des actes
        </h1>

        <p className="text-base-content/60">
          Liste des actes médicaux et leurs tarifs.
        </p>
      </div>

      {!result.success && (
        <div className="alert alert-error">
          {result.message}
        </div>
      )}

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Montant</th>
              <th>Devise</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {actes.map((acte: any) => (
              <tr key={acte.id}>
                <td className="font-mono">
                  {acte.code}
                </td>

                <td>{acte.libelle}</td>

                <td>{acte.categorie || "-"}</td>

                <td className="font-semibold">
                  {Number(acte.montant).toFixed(2)}
                </td>

                <td>{acte.devise}</td>

                <td>
                  {acte.actif ? (
                    <span className="badge badge-success">
                      Actif
                    </span>
                  ) : (
                    <span className="badge">
                      Inactif
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {actes.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  Aucun acte médical.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}