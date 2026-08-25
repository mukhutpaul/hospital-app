"use client";

import {
  Edit,
  MoreHorizontal,
  Power,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

type Medicament = {
  id: number;
  code: string;
  nom: string;
  denomination?: string | null;
  forme?: string | null;
  dosage?: string | null;
  laboratoire?: string | null;
  categorie?: string | null;
  prixVente: number;
  prixAchat: number;
  devise: string;
  seuilAlerte: number;
  actif: boolean;
};

type Props = {
  medicaments: Medicament[];
  onEdit?: (medicament: Medicament) => void;
  onDelete?: (id: number) => Promise<void>;
  onToggle?: (
    id: number,
    actif: boolean
  ) => Promise<void>;
};

export default function MedicamentTable({
  medicaments,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return medicaments;

    return medicaments.filter((m) =>
      [
        m.code,
        m.nom,
        m.denomination,
        m.forme,
        m.dosage,
        m.laboratoire,
        m.categorie,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [medicaments, search]);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Rechercher un médicament..."
              className="input input-bordered w-full pl-10"
            />
          </div>

          <div className="badge badge-primary badge-lg">
            {filtered.length} médicament(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Code</th>
                <th>Médicament</th>
                <th>Forme</th>
                <th>Dosage</th>
                <th>Laboratoire</th>
                <th>Prix vente</th>
                <th>Seuil</th>
                <th>Statut</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 opacity-60"
                  >
                    Aucun médicament trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((medicament) => (
                  <tr key={medicament.id}>
                    <td className="font-mono">
                      {medicament.code}
                    </td>

                    <td>
                      <div className="font-semibold">
                        {medicament.nom}
                      </div>

                      {medicament.denomination && (
                        <div className="text-xs opacity-60">
                          {medicament.denomination}
                        </div>
                      )}
                    </td>

                    <td>
                      {medicament.forme || "-"}
                    </td>

                    <td>
                      {medicament.dosage || "-"}
                    </td>

                    <td>
                      {medicament.laboratoire || "-"}
                    </td>

                    <td>
                      {medicament.prixVente.toFixed(2)}{" "}
                      {medicament.devise}
                    </td>

                    <td>
                      {medicament.seuilAlerte}
                    </td>

                    <td>
                      {medicament.actif ? (
                        <span className="badge badge-success">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          Inactif
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <button
                            className="btn btn-sm btn-ghost"
                            title="Modifier"
                            onClick={() =>
                              onEdit(medicament)
                            }
                          >
                            <Edit size={17} />
                          </button>
                        )}

                        {onToggle && (
                          <button
                            className="btn btn-sm btn-ghost"
                            title={
                              medicament.actif
                                ? "Désactiver"
                                : "Activer"
                            }
                            onClick={() =>
                              onToggle(
                                medicament.id,
                                !medicament.actif
                              )
                            }
                          >
                            <Power size={17} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            className="btn btn-sm btn-ghost text-error"
                            title="Supprimer"
                            onClick={() =>
                              onDelete(medicament.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                        <button className="btn btn-sm btn-ghost">
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}