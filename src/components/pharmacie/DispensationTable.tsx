"use client";

import {
  FileText,
  Pill,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

type Dispensation = {
  id: number;
  numero: string;
  dateDispensation: string | Date;
  statut: string;
  observation?: string | null;

  patient: {
    numeroDossier: string;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
  };

  prescription?: {
    numero: string;
  } | null;

  pharmacien?: {
    name?: string | null;
  } | null;

  lignes: {
    id: number;
    quantiteDispensee: number;

    medicament: {
      code: string;
      nom: string;
      dosage?: string | null;
    };
  }[];
};

type Props = {
  dispensations: Dispensation[];

  onPdf?: (
    dispensation: Dispensation
  ) => void;

  onView?: (
    dispensation: Dispensation
  ) => void;
};

export default function DispensationTable({
  dispensations,
  onPdf,
  onView,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {
    const value =
      search.toLowerCase().trim();

    if (!value) return dispensations;

    return dispensations.filter((d) =>
      [
        d.numero,
        d.statut,
        d.patient.numeroDossier,
        d.patient.nom,
        d.patient.postNom,
        d.patient.prenom,
        d.prescription?.numero,
        d.pharmacien?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [dispensations, search]);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
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
              className="input input-bordered w-full pl-10"
              placeholder="Rechercher une dispensation..."
            />
          </div>

          <div className="badge badge-primary badge-lg">
            {filtered.length} dispensation(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>N°</th>
                <th>Patient</th>
                <th>Ordonnance</th>
                <th>Date</th>
                <th>Médicaments</th>
                <th>Pharmacien</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((d) => {
                const patientName =
                  [
                    d.patient.nom,
                    d.patient.postNom,
                    d.patient.prenom,
                  ]
                    .filter(Boolean)
                    .join(" ");

                const totalMedicaments =
                  d.lignes.reduce(
                    (sum, ligne) =>
                      sum +
                      ligne.quantiteDispensee,
                    0
                  );

                return (
                  <tr key={d.id}>
                    <td className="font-mono font-semibold">
                      {d.numero}
                    </td>

                    <td>
                      <div className="font-semibold">
                        {patientName}
                      </div>

                      <div className="text-xs opacity-60">
                        {d.patient.numeroDossier}
                      </div>
                    </td>

                    <td>
                      {d.prescription?.numero ||
                        "-"}
                    </td>

                    <td>
                      {new Date(
                        d.dateDispensation
                      ).toLocaleString(
                        "fr-FR"
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <Pill size={16} />

                        <span>
                          {d.lignes.length}{" "}
                          ligne(s)
                        </span>

                        <span className="text-xs opacity-60">
                          ({totalMedicaments}{" "}
                          unité(s))
                        </span>
                      </div>
                    </td>

                    <td>
                      {d.pharmacien?.name ||
                        "-"}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          d.statut ===
                          "TERMINEE"
                            ? "badge-success"
                            : d.statut ===
                              "PARTIELLE"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {d.statut}
                      </span>
                    </td>

                    <td>
                      <div className="flex gap-1">
                        {onView && (
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                              onView(d)
                            }
                          >
                            Voir
                          </button>
                        )}

                        {onPdf && (
                          <button
                            className="btn btn-sm btn-ghost"
                            title="Imprimer / PDF"
                            onClick={() =>
                              onPdf(d)
                            }
                          >
                            <FileText
                              size={17}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 opacity-60"
                  >
                    Aucune dispensation trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}