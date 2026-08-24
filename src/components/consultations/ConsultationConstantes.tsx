"use client";

import { useState } from "react";

import {
  Activity,
  Save,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  createConstanteConsultation,
} from "@/app/actions/consultations";

type Props = {
  consultationId: number;
  patientId: number;
  admissionId?: number | null;
  constantes: any[];
};

export default function ConsultationConstantes({
  consultationId,
  patientId,
  admissionId,
  constantes,
}: Props) {
  const [temperature, setTemperature] =
    useState("");

  const [tensionSystolique, setTensionSystolique] =
    useState("");

  const [tensionDiastolique, setTensionDiastolique] =
    useState("");

  const [pouls, setPouls] =
    useState("");

  const [saturation, setSaturation] =
    useState("");

  const [poids, setPoids] =
    useState("");

  const [taille, setTaille] =
    useState("");

  const [frequenceRespiratoire, setFrequenceRespiratoire] =
    useState("");

  const [glycemie, setGlycemie] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const result =
        await createConstanteConsultation({
          consultationId,
          patientId,
          admissionId,

          temperature:
            temperature
              ? Number(temperature)
              : null,

          tensionSystolique:
            tensionSystolique
              ? Number(
                  tensionSystolique,
                )
              : null,

          tensionDiastolique:
            tensionDiastolique
              ? Number(
                  tensionDiastolique,
                )
              : null,

          pouls:
            pouls
              ? Number(pouls)
              : null,

          saturation:
            saturation
              ? Number(saturation)
              : null,

          poids:
            poids
              ? Number(poids)
              : null,

          taille:
            taille
              ? Number(taille)
              : null,

          frequenceRespiratoire:
            frequenceRespiratoire
              ? Number(
                  frequenceRespiratoire,
                )
              : null,

          glycemie:
            glycemie
              ? Number(glycemie)
              : null,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTemperature("");
      setTensionSystolique("");
      setTensionDiastolique("");
      setPouls("");
      setSaturation("");
      setPoids("");
      setTaille("");
      setFrequenceRespiratoire("");
      setGlycemie("");

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer les constantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ==================================================
          FORMULAIRE
      ================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Activity
              size={22}
              className="text-primary"
            />

            <div>
              <h2 className="text-lg font-semibold">
                Constantes vitales
              </h2>

              <p className="text-sm text-base-content/60">
                Ajouter les constantes du patient.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* TEMPÉRATURE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Température °C
                  </span>
                </label>

                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(
                      e.target.value,
                    )
                  }
                  placeholder="36.8"
                />
              </div>

              {/* TENSION SYSTOLIQUE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    TA systolique
                  </span>
                </label>

                <input
                  type="number"
                  className="input input-bordered"
                  value={
                    tensionSystolique
                  }
                  onChange={(e) =>
                    setTensionSystolique(
                      e.target.value,
                    )
                  }
                  placeholder="120"
                />
              </div>

              {/* TENSION DIASTOLIQUE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    TA diastolique
                  </span>
                </label>

                <input
                  type="number"
                  className="input input-bordered"
                  value={
                    tensionDiastolique
                  }
                  onChange={(e) =>
                    setTensionDiastolique(
                      e.target.value,
                    )
                  }
                  placeholder="80"
                />
              </div>

              {/* POULS */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Pouls / min
                  </span>
                </label>

                <input
                  type="number"
                  className="input input-bordered"
                  value={pouls}
                  onChange={(e) =>
                    setPouls(
                      e.target.value,
                    )
                  }
                  placeholder="72"
                />
              </div>

              {/* SATURATION */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    SpO₂ %
                  </span>
                </label>

                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={saturation}
                  onChange={(e) =>
                    setSaturation(
                      e.target.value,
                    )
                  }
                  placeholder="98"
                />
              </div>

              {/* POIDS */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Poids kg
                  </span>
                </label>

                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={poids}
                  onChange={(e) =>
                    setPoids(
                      e.target.value,
                    )
                  }
                  placeholder="70"
                />
              </div>

              {/* TAILLE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Taille cm
                  </span>
                </label>

                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={taille}
                  onChange={(e) =>
                    setTaille(
                      e.target.value,
                    )
                  }
                  placeholder="175"
                />
              </div>

              {/* FR */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Fréquence respiratoire
                  </span>
                </label>

                <input
                  type="number"
                  className="input input-bordered"
                  value={
                    frequenceRespiratoire
                  }
                  onChange={(e) =>
                    setFrequenceRespiratoire(
                      e.target.value,
                    )
                  }
                  placeholder="18"
                />
              </div>

              {/* GLYCÉMIE */}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Glycémie
                  </span>
                </label>

                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered"
                  value={glycemie}
                  onChange={(e) =>
                    setGlycemie(
                      e.target.value,
                    )
                  }
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer les constantes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ==================================================
          HISTORIQUE
      ================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="font-semibold text-lg mb-4">
            Historique des constantes
          </h2>

          {constantes.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              Aucune constante enregistrée
              pour cette consultation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Température</th>
                    <th>Tension</th>
                    <th>Pouls</th>
                    <th>SpO₂</th>
                    <th>Poids</th>
                    <th>Taille</th>
                    <th>FR</th>
                    <th>Glycémie</th>
                  </tr>
                </thead>

                <tbody>
                  {constantes.map(
                    (constante) => (
                      <tr
                        key={
                          constante.id
                        }
                      >
                        <td>
                          {new Date(
                            constante.dateMesure,
                          ).toLocaleString(
                            "fr-FR",
                          )}
                        </td>

                        <td>
                          {constante.temperature ??
                            "—"}
                        </td>

                        <td>
                          {constante.tensionSystolique !=
                            null &&
                          constante.tensionDiastolique !=
                            null
                            ? `${constante.tensionSystolique}/${constante.tensionDiastolique}`
                            : "—"}
                        </td>

                        <td>
                          {constante.pouls ??
                            "—"}
                        </td>

                        <td>
                          {constante.saturation !=
                          null
                            ? `${constante.saturation}%`
                            : "—"}
                        </td>

                        <td>
                          {constante.poids !=
                          null
                            ? `${constante.poids} kg`
                            : "—"}
                        </td>

                        <td>
                          {constante.taille !=
                          null
                            ? `${constante.taille} cm`
                            : "—"}
                        </td>

                        <td>
                          {constante.frequenceRespiratoire ??
                            "—"}
                        </td>

                        <td>
                          {constante.glycemie ??
                            "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}