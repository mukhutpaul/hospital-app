"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  AlertTriangle,
  Trash2,
} from "lucide-react";

type Mouvement = {
  id: number;
  medicamentId: number;
  stockId?: number | null;

  type: string;
  quantite: number;

  motif?: string | null;
  reference?: string | null;

  utilisateurId?: number | null;

  dateMouvement: Date | string;

  medicament: {
    id: number;
    code: string;
    nom: string;
    dosage?: string | null;
    forme?: string | null;
  } | null;

  stock?: {
    id: number;
    lot?: string | null;
    dateExpiration?: Date | string | null;
    quantite: number;
  } | null;

  utilisateur?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  mouvements: Mouvement[];
};

export default function MouvementStockTable({
  mouvements,
}: Props) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ENTREE":
        return "Entrée";

      case "SORTIE":
        return "Sortie";

      case "RETOUR":
        return "Retour";

      case "AJUSTEMENT":
        return "Ajustement";

      case "PERTE":
        return "Perte";

      case "PEREMPTION":
        return "Péremption";

      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ENTREE":
        return <ArrowDownToLine size={16} />;

      case "RETOUR":
        return <RotateCcw size={16} />;

      case "SORTIE":
        return <ArrowUpFromLine size={16} />;

      case "PERTE":
      case "PEREMPTION":
        return <AlertTriangle size={16} />;

      case "AJUSTEMENT":
        return <Trash2 size={16} />;

      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Date</th>
            <th>Médicament</th>
            <th>Lot</th>
            <th>Type</th>
            <th>Quantité</th>
            <th>Référence</th>
            <th>Motif</th>
            <th>Utilisateur</th>
          </tr>
        </thead>

        <tbody>
          {mouvements.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-8"
              >
                Aucun mouvement de stock.
              </td>
            </tr>
          ) : (
            mouvements.map((mouvement) => (
              <tr key={mouvement.id}>
                <td>
                  {new Date(
                    mouvement.dateMouvement
                  ).toLocaleDateString("fr-FR")}
                </td>

                <td>
                  {mouvement.medicament ? (
                    <div>
                      <div className="font-semibold">
                        {mouvement.medicament.nom}
                      </div>

                      <div className="text-xs opacity-60">
                        {mouvement.medicament.code}

                        {mouvement.medicament.dosage
                          ? ` — ${mouvement.medicament.dosage}`
                          : ""}
                      </div>
                    </div>
                  ) : (
                    <span className="text-error">
                      Médicament supprimé
                    </span>
                  )}
                </td>

                <td>
                  {mouvement.stock?.lot || "Sans lot"}
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(mouvement.type)}

                    <span>
                      {getTypeLabel(
                        mouvement.type
                      )}
                    </span>
                  </div>
                </td>

                <td className="font-semibold">
                  {mouvement.quantite}
                </td>

                <td>
                  {mouvement.reference || "—"}
                </td>

                <td>
                  {mouvement.motif || "—"}
                </td>

                <td>
                  {mouvement.utilisateur?.name ||
                    mouvement.utilisateur?.email ||
                    "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}