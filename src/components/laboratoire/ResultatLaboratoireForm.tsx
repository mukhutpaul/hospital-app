"use client";

import { useState } from "react";

import {
  createResultatLaboratoire,
  validateResultatLaboratoire,
} from "@/app/actions/laboratoire";

import {
  CheckCircle2,
  Save,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";

type Props = {
  demandeId: number;
  lignes: any[];
  resultats: any[];
};

export default function ResultatLaboratoireForm({
  demandeId,
  lignes,
  resultats,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState<
    Record<
      number,
      {
        valeur: string;
        unite: string;
        commentaire: string;
        interpretation: string;
      }
    >
  >(() => {
    const initial: Record<
      number,
      any
    > = {};

    resultats.forEach((resultat) => {
      initial[resultat.examenId] = {
        valeur:
          resultat.valeur ?? "",
        unite:
          resultat.unite ?? "",
        commentaire:
          resultat.commentaire ?? "",
        interpretation:
          resultat.interpretation ?? "",
      };
    });

    return initial;
  });

  function getValue(
    examenId: number,
    field: string,
  ) {
    return (
      form[examenId]?.[field] ?? ""
    );
  }

  function updateField(
    examenId: number,
    field: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,

      [examenId]: {
        ...(current[examenId] ?? {
          valeur: "",
          unite: "",
          commentaire: "",
          interpretation: "",
        }),

        [field]: value,
      },
    }));
  }

  async function saveResultat(
    examenId: number,
  ) {
    setLoading(true);

    try {
      const values =
        form[examenId] ?? {
          valeur: "",
          unite: "",
          commentaire: "",
          interpretation: "",
        };

      const existing =
        resultats.find(
          (resultat) =>
            resultat.examenId ===
            examenId,
        );

      if (existing) {
        toast.info(
          "Ce résultat existe déjà. Utilisez la validation.",
        );

        return;
      }

      const result =
        await createResultatLaboratoire({
          demandeId,
          examenId,

          valeur: values.valeur,
          unite: values.unite,
          commentaire:
            values.commentaire,
          interpretation:
            values.interpretation,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Erreur lors de l'enregistrement.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function validateResultat(
    resultatId: number,
  ) {
    setLoading(true);

    try {
      const result =
        await validateResultatLaboratoire(
          resultatId,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Erreur lors de la validation.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Saisie des résultats
          </h2>

          <p className="text-sm text-base-content/60">
            Saisissez les résultats de chaque
            examen puis validez-les.
          </p>
        </div>

        <div className="space-y-8">
          {lignes.map((ligne: any) => {
            const examenId =
              ligne.examenId;

            const resultat =
              resultats.find(
                (r: any) =>
                  r.examenId ===
                  examenId,
              );

            return (
              <div
                key={ligne.id}
                className="p-5 rounded-2xl border border-base-200 bg-base-200/20"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-bold">
                      {ligne.examen.nom}
                    </h3>

                    <p className="text-xs text-base-content/60">
                      Code :{" "}
                      {ligne.examen.code}
                    </p>
                  </div>

                  {resultat && (
                    <span
                      className={`badge ${
                        resultat.valide
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {resultat.valide
                        ? "VALIDÉ"
                        : "NON VALIDÉ"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VALEUR */}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Valeur
                      </span>
                    </label>

                    <input
                      className="input input-bordered"
                      value={getValue(
                        examenId,
                        "valeur",
                      )}
                      disabled={
                        !!resultat?.valide
                      }
                      onChange={(e) =>
                        updateField(
                          examenId,
                          "valeur",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* UNITE */}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Unité
                      </span>
                    </label>

                    <input
                      className="input input-bordered"
                      placeholder={
                        ligne.examen
                          .unite ??
                        "Ex. g/dL"
                      }
                      value={getValue(
                        examenId,
                        "unite",
                      )}
                      disabled={
                        !!resultat?.valide
                      }
                      onChange={(e) =>
                        updateField(
                          examenId,
                          "unite",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* COMMENTAIRE */}

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">
                        Commentaire
                      </span>
                    </label>

                    <textarea
                      className="textarea textarea-bordered"
                      value={getValue(
                        examenId,
                        "commentaire",
                      )}
                      disabled={
                        !!resultat?.valide
                      }
                      onChange={(e) =>
                        updateField(
                          examenId,
                          "commentaire",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* INTERPRETATION */}

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">
                        Interprétation
                      </span>
                    </label>

                    <textarea
                      className="textarea textarea-bordered"
                      value={getValue(
                        examenId,
                        "interpretation",
                      )}
                      disabled={
                        !!resultat?.valide
                      }
                      onChange={(e) =>
                        updateField(
                          examenId,
                          "interpretation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                {/* ACTION */}

                <div className="flex justify-end gap-2 mt-5">
                  {!resultat && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={loading}
                      onClick={() =>
                        saveResultat(
                          examenId,
                        )
                      }
                    >
                      {loading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={17}
                        />
                      )}

                      Enregistrer
                    </button>
                  )}

                  {resultat &&
                    !resultat.valide && (
                      <button
                        type="button"
                        className="btn btn-success"
                        disabled={loading}
                        onClick={() =>
                          validateResultat(
                            resultat.id,
                          )
                        }
                      >
                        {loading ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2
                            size={17}
                          />
                        )}

                        Valider le résultat
                      </button>
                    )}

                  {resultat?.valide && (
                    <div className="alert alert-success py-2 px-4 w-auto">
                      <CheckCircle2
                        size={18}
                      />

                      Résultat validé
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}