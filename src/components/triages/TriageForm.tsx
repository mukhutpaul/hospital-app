
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select, { SingleValue } from "react-select";
import { toast } from "react-toastify";

import {
  createTriage,
  updateTriage,
} from "@/app/actions/triages";

/* =========================================================
   TYPES
========================================================= */

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom: string | null;
  prenom: string | null;
  sexe: string;
};

type Service = {
  id: number;
  code: string;
  nom: string;
};

type Constante = {
  temperature: number | null;
  tensionSystolique: number | null;
  tensionDiastolique: number | null;
  pouls: number | null;
  saturation: number | null;
  poids: number | null;
  taille: number | null;
  frequenceRespiratoire: number | null;
  glycemie: number | null;
};

type Admission = {
  id: number;
  numero: string;
  type: string;
  statut: string;
  dateAdmission: string | Date;

  patient: Patient;

  service: Service | null;

  constantes?: Constante[];
};

type Triage = {
  id: number;
  admissionId: number;
  niveauUrgence: string | null;
  motif: string | null;
  observation: string | null;
};

type Props = {
  admissions: Admission[];
  triage?: Triage;
  admission?: Admission;
};

type PatientOption = {
  value: number;
  label: string;
  patient: Patient;
};

type AdmissionOption = {
  value: number;
  label: string;
  admission: Admission;
};

/* =========================================================
   NIVEAUX D'URGENCE
========================================================= */

const niveaux = [
  {
    value: "CRITIQUE",
    label: "Critique",
    description: "Prise en charge immédiate",
    className:
      "border-error bg-error/10 text-error",
  },
  {
    value: "URGENT",
    label: "Urgent",
    description: "Prise en charge rapide",
    className:
      "border-warning bg-warning/10 text-warning",
  },
  {
    value: "PRIORITAIRE",
    label: "Prioritaire",
    description:
      "Passe avant les cas normaux",
    className:
      "border-secondary bg-secondary/10 text-secondary",
  },
  {
    value: "NORMAL",
    label: "Normal",
    description:
      "Attente selon l'ordre normal",
    className:
      "border-success bg-success/10 text-success",
  },
];

/* =========================================================
   UTILITAIRES
========================================================= */

function patientName(
  patient: Patient,
): string {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function dateFr(
  value: string | Date,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function numberOrNull(
  value: string,
): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

/* =========================================================
   COMPOSANT
========================================================= */

export default function TriageForm({
  admissions,
  triage,
  admission,
}: Props) {
  const router = useRouter();

  /* =======================================================
     ADMISSION INITIALE
  ======================================================= */

  const initialAdmissionId =
    triage?.admissionId ??
    admission?.id ??
    "";

  const initialAdmission =
    admissions.find(
      (item) =>
        item.id ===
        Number(initialAdmissionId),
    ) ??
    admission ??
    null;

  const initialPatientId =
    initialAdmission?.patient?.id ?? "";

  const initialConstante =
    initialAdmission?.constantes?.[0] ??
    null;

  /* =======================================================
     ÉTATS
  ======================================================= */

  const [patientId, setPatientId] =
    useState(
      String(initialPatientId),
    );

  const [admissionId, setAdmissionId] =
    useState(
      String(initialAdmissionId),
    );

  const [niveauUrgence, setNiveauUrgence] =
    useState(
      triage?.niveauUrgence ??
        "NORMAL",
    );

  const [motif, setMotif] =
    useState(
      triage?.motif ?? "",
    );

  const [observation, setObservation] =
    useState(
      triage?.observation ?? "",
    );

  const [temperature, setTemperature] =
    useState(
      initialConstante?.temperature?.toString() ??
        "",
    );

  const [tensionSystolique, setTensionSystolique] =
    useState(
      initialConstante?.tensionSystolique?.toString() ??
        "",
    );

  const [tensionDiastolique, setTensionDiastolique] =
    useState(
      initialConstante?.tensionDiastolique?.toString() ??
        "",
    );

  const [pouls, setPouls] =
    useState(
      initialConstante?.pouls?.toString() ??
        "",
    );

  const [saturation, setSaturation] =
    useState(
      initialConstante?.saturation?.toString() ??
        "",
    );

  const [poids, setPoids] =
    useState(
      initialConstante?.poids?.toString() ??
        "",
    );

  const [taille, setTaille] =
    useState(
      initialConstante?.taille?.toString() ??
        "",
    );

  const [
    frequenceRespiratoire,
    setFrequenceRespiratoire,
  ] = useState(
    initialConstante?.frequenceRespiratoire?.toString() ??
      "",
  );

  const [glycemie, setGlycemie] =
    useState(
      initialConstante?.glycemie?.toString() ??
        "",
    );

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     PATIENTS UNIQUES
  ======================================================= */

  const patientOptions =
    useMemo<PatientOption[]>(() => {
      const patientsMap =
        new Map<number, Patient>();

      for (const item of admissions) {
        if (
          !patientsMap.has(
            item.patient.id,
          )
        ) {
          patientsMap.set(
            item.patient.id,
            item.patient,
          );
        }
      }

      return Array.from(
        patientsMap.values(),
      )
        .sort((a, b) =>
          patientName(a).localeCompare(
            patientName(b),
            "fr",
          ),
        )
        .map((patient) => ({
          value: patient.id,

          label: `${patientName(
            patient,
          )} — Dossier : ${
            patient.numeroDossier
          }`,

          patient,
        }));
    }, [admissions]);

  /* =======================================================
     PATIENT SÉLECTIONNÉ
  ======================================================= */

  const selectedPatientOption =
    useMemo(() => {
      if (!patientId) {
        return null;
      }

      return (
        patientOptions.find(
          (option) =>
            option.value ===
            Number(patientId),
        ) ?? null
      );
    }, [
      patientId,
      patientOptions,
    ]);

  /* =======================================================
     ADMISSIONS DU PATIENT
  ======================================================= */

  const admissionsDuPatient =
    useMemo(() => {
      if (!patientId) {
        return [];
      }

      return admissions
        .filter(
          (item) =>
            item.patient.id ===
            Number(patientId),
        )
        .sort(
          (a, b) =>
            new Date(
              b.dateAdmission,
            ).getTime() -
            new Date(
              a.dateAdmission,
            ).getTime(),
        );
    }, [
      admissions,
      patientId,
    ]);

  /* =======================================================
     OPTIONS ADMISSIONS
  ======================================================= */

  const admissionOptions =
    useMemo<AdmissionOption[]>(() => {
      return admissionsDuPatient.map(
        (item) => ({
          value: item.id,

          label: `${item.numero} — ${
            item.type
          } — ${item.statut}`,

          admission: item,
        }),
      );
    }, [
      admissionsDuPatient,
    ]);

  /* =======================================================
     ADMISSION SÉLECTIONNÉE
  ======================================================= */

  const selectedAdmission =
    useMemo(() => {
      if (!admissionId) {
        return null;
      }

      return (
        admissions.find(
          (item) =>
            item.id ===
            Number(admissionId),
        ) ??
        null
      );
    }, [
      admissions,
      admissionId,
    ]);

  /* =======================================================
     OPTION ADMISSION SÉLECTIONNÉE
  ======================================================= */

  const selectedAdmissionOption =
    useMemo(() => {
      if (!selectedAdmission) {
        return null;
      }

      return (
        admissionOptions.find(
          (option) =>
            option.value ===
            selectedAdmission.id,
        ) ?? null
      );
    }, [
      admissionOptions,
      selectedAdmission,
    ]);

  /* =======================================================
     CHANGEMENT PATIENT
  ======================================================= */

  function handlePatientChange(
    option: SingleValue<PatientOption>,
  ) {
    setPatientId(
      option
        ? String(option.value)
        : "",
    );

    /*
     * Un changement de patient
     * invalide l'admission actuelle.
     */
    setAdmissionId("");

    setTemperature("");
    setTensionSystolique("");
    setTensionDiastolique("");
    setPouls("");
    setSaturation("");
    setPoids("");
    setTaille("");
    setFrequenceRespiratoire("");
    setGlycemie("");
  }

  /* =======================================================
     CHANGEMENT ADMISSION
  ======================================================= */

  function handleAdmissionChange(
    option: SingleValue<AdmissionOption>,
  ) {
    if (!option) {
      setAdmissionId("");
      return;
    }

    setAdmissionId(
      String(option.value),
    );

    const constante =
      option.admission
        .constantes?.[0] ?? null;

    setTemperature(
      constante?.temperature?.toString() ??
        "",
    );

    setTensionSystolique(
      constante?.tensionSystolique?.toString() ??
        "",
    );

    setTensionDiastolique(
      constante?.tensionDiastolique?.toString() ??
        "",
    );

    setPouls(
      constante?.pouls?.toString() ??
        "",
    );

    setSaturation(
      constante?.saturation?.toString() ??
        "",
    );

    setPoids(
      constante?.poids?.toString() ??
        "",
    );

    setTaille(
      constante?.taille?.toString() ??
        "",
    );

    setFrequenceRespiratoire(
      constante?.frequenceRespiratoire?.toString() ??
        "",
    );

    setGlycemie(
      constante?.glycemie?.toString() ??
        "",
    );
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const selectedAdmissionId =
      Number(admissionId);

    if (
      !Number.isInteger(
        selectedAdmissionId,
      ) ||
      selectedAdmissionId <= 0
    ) {
      toast.error(
        "Veuillez sélectionner une admission.",
      );

      return;
    }

    /*
     * Vérification supplémentaire :
     * l'admission doit bien appartenir
     * au patient sélectionné.
     */
    if (
      patientId &&
      selectedAdmission &&
      selectedAdmission.patient.id !==
        Number(patientId)
    ) {
      toast.error(
        "L'admission sélectionnée n'appartient pas au patient sélectionné.",
      );

      return;
    }

    if (!niveauUrgence) {
      toast.error(
        "Veuillez sélectionner le niveau d'urgence.",
      );

      return;
    }

    try {
      setLoading(true);

      const payload = {
        admissionId:
          selectedAdmissionId,

        niveauUrgence,

        motif:
          motif.trim() ||
          null,

        observation:
          observation.trim() ||
          null,

        constantes: {
          temperature:
            numberOrNull(
              temperature,
            ),

          tensionSystolique:
            numberOrNull(
              tensionSystolique,
            ),

          tensionDiastolique:
            numberOrNull(
              tensionDiastolique,
            ),

          pouls:
            numberOrNull(
              pouls,
            ),

          saturation:
            numberOrNull(
              saturation,
            ),

          poids:
            numberOrNull(
              poids,
            ),

          taille:
            numberOrNull(
              taille,
            ),

          frequenceRespiratoire:
            numberOrNull(
              frequenceRespiratoire,
            ),

          glycemie:
            numberOrNull(
              glycemie,
            ),
        },
      };

      const result = triage
        ? await updateTriage(
            triage.id,
            payload,
          )
        : await createTriage(
            payload,
          );

      if (!result.success) {
        toast.error(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      router.push(
        triage
          ? `/triages/${triage.id}`
          : "/triages",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "❌ Erreur triage :",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement du triage.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     STYLES REACT SELECT
  ======================================================= */

  const selectStyles = {
    control: (
      base: Record<
        string,
        unknown
      >,
      state: {
        isFocused: boolean;
      },
    ) => ({
      ...base,

      minHeight: "52px",

      borderRadius:
        "0.75rem",

      borderColor:
        state.isFocused
          ? "oklch(var(--p))"
          : "oklch(var(--bc) / 0.2)",

      boxShadow:
        state.isFocused
          ? "0 0 0 1px oklch(var(--p))"
          : "none",

      backgroundColor:
        "oklch(var(--b1))",

      "&:hover": {
        borderColor:
          "oklch(var(--p))",
      },
    }),

    menuPortal: (
      base: Record<
        string,
        unknown
      >,
    ) => ({
      ...base,
      zIndex: 9999,
    }),

    menu: (
      base: Record<
        string,
        unknown
      >,
    ) => ({
      ...base,
      zIndex: 9999,
    }),

    option: (
      base: Record<
        string,
        unknown
      >,
      state: {
        isSelected: boolean;
        isFocused: boolean;
      },
    ) => ({
      ...base,

      cursor: "pointer",

      backgroundColor:
        state.isSelected
          ? "oklch(var(--p))"
          : state.isFocused
            ? "oklch(var(--b2))"
            : "transparent",

      color:
        state.isSelected
          ? "oklch(var(--pc))"
          : "inherit",
    }),
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
    >

      {/* ===================================================
          1 — PATIENT + ADMISSION
      =================================================== */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">

          <div>
            <h2 className="card-title">
              Patient et admission
            </h2>

            <p className="text-sm text-base-content/60">
              Sélectionnez d'abord le
              patient, puis l'admission
              correspondante.
            </p>
          </div>

          <div className="divider my-2" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* ================================
                PATIENT
            ================================= */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Patient *
                </span>
              </label>

              <Select<
                PatientOption,
                false
              >
                options={
                  patientOptions
                }

                value={
                  selectedPatientOption
                }

                onChange={
                  handlePatientChange
                }

                isClearable
                isSearchable
                isDisabled={loading}

                placeholder="Rechercher un patient..."

                noOptionsMessage={() =>
                  "Aucun patient trouvé"
                }

                formatOptionLabel={(
                  option,
                ) => (
                  <div className="py-1">
                    <div className="font-semibold">
                      {patientName(
                        option.patient,
                      )}
                    </div>

                    <div className="text-xs opacity-60">
                      Dossier :{" "}
                      {
                        option
                          .patient
                          .numeroDossier
                      }
                    </div>

                    <div className="text-xs opacity-50">
                      Sexe :{" "}
                      {
                        option
                          .patient
                          .sexe
                      }
                    </div>
                  </div>
                )}

                menuPortalTarget={
                  typeof document !==
                  "undefined"
                    ? document.body
                    : undefined
                }

                styles={
                  selectStyles
                }
              />

            </div>

            {/* ================================
                ADMISSION
            ================================= */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Admission *
                </span>
              </label>

              <Select<
                AdmissionOption,
                false
              >
                options={
                  admissionOptions
                }

                value={
                  selectedAdmissionOption
                }

                onChange={
                  handleAdmissionChange
                }

                isClearable
                isSearchable

                isDisabled={
                  loading ||
                  !patientId
                }

                placeholder={
                  !patientId
                    ? "Sélectionnez d'abord un patient"
                    : "Rechercher une admission..."
                }

                noOptionsMessage={() =>
                  "Aucune admission trouvée pour ce patient"
                }

                formatOptionLabel={(
                  option,
                ) => (
                  <div className="py-1">

                    <div className="font-semibold">
                      {option.admission.numero}
                    </div>

                    <div className="text-sm">
                      {option.admission.type}
                      {" — "}
                      {option.admission.statut}
                    </div>

                    <div className="text-xs opacity-60">
                      {dateFr(
                        option
                          .admission
                          .dateAdmission,
                      )}
                    </div>

                    {option
                      .admission
                      .service && (
                      <div className="text-xs opacity-50">
                        Service :{" "}
                        {
                          option
                            .admission
                            .service
                            .nom
                        }
                      </div>
                    )}

                  </div>
                )}

                menuPortalTarget={
                  typeof document !==
                  "undefined"
                    ? document.body
                    : undefined
                }

                styles={
                  selectStyles
                }
              />

            </div>

          </div>

          {/* PATIENT SÉLECTIONNÉ */}

          {selectedPatientOption && (
            <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <InfoBlock
                  label="Patient"
                  value={patientName(
                    selectedPatientOption.patient,
                  )}
                />

                <InfoBlock
                  label="Dossier"
                  value={
                    selectedPatientOption
                      .patient
                      .numeroDossier
                  }
                />

                <InfoBlock
                  label="Sexe"
                  value={
                    selectedPatientOption
                      .patient
                      .sexe
                  }
                />

              </div>

            </div>
          )}

          {/* ADMISSION SÉLECTIONNÉE */}

          {selectedAdmission && (
            <div className="mt-3 rounded-2xl border border-base-300 bg-base-200/50 p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <InfoBlock
                  label="Admission"
                  value={
                    selectedAdmission.numero
                  }
                />

                <InfoBlock
                  label="Type"
                  value={
                    selectedAdmission.type
                  }
                />

                <InfoBlock
                  label="Date"
                  value={dateFr(
                    selectedAdmission.dateAdmission,
                  )}
                />

              </div>

              {selectedAdmission.service && (
                <div className="mt-4 rounded-xl bg-base-100 p-3 text-sm">

                  <span className="opacity-60">
                    Service :
                  </span>

                  <strong className="ml-2">
                    {
                      selectedAdmission
                        .service
                        .nom
                    }
                  </strong>

                </div>
              )}

            </div>
          )}

        </div>
      </section>

      {/* ===================================================
          2 — NIVEAU D'URGENCE
      =================================================== */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">

        <div className="card-body">

          <div>
            <h2 className="card-title">
              Niveau de priorité
            </h2>

            <p className="text-sm text-base-content/60">
              Classez le patient selon
              l'urgence de sa prise en
              charge.
            </p>
          </div>

          <div className="divider my-2" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {niveaux.map(
              (niveau) => {
                const selected =
                  niveauUrgence ===
                  niveau.value;

                return (
                  <button
                    key={
                      niveau.value
                    }
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      setNiveauUrgence(
                        niveau.value,
                      )
                    }
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      selected
                        ? niveau.className
                        : "border-base-300 bg-base-100 hover:border-base-content/20"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span className="font-bold">
                        {
                          niveau.label
                        }
                      </span>

                      {selected && (
                        <span className="badge badge-sm">
                          Sélectionné
                        </span>
                      )}

                    </div>

                    <p className="mt-2 text-xs opacity-70">
                      {
                        niveau.description
                      }
                    </p>

                  </button>
                );
              },
            )}

          </div>

        </div>

      </section>

      {/* ===================================================
          3 — ÉVALUATION
      =================================================== */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">

        <div className="card-body">

          <div>
            <h2 className="card-title">
              Évaluation du triage
            </h2>

            <p className="text-sm text-base-content/60">
              Décrivez le motif et les
              observations initiales.
            </p>
          </div>

          <div className="divider my-2" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <TextareaField
              label="Motif"
              value={motif}
              onChange={
                setMotif
              }
              placeholder="Motif principal de la prise en charge..."
              disabled={loading}
            />

            <TextareaField
              label="Observation"
              value={observation}
              onChange={
                setObservation
              }
              placeholder="Observations cliniques initiales..."
              disabled={loading}
            />

          </div>

        </div>

      </section>

      {/* ===================================================
          4 — CONSTANTES
      =================================================== */}

      <section className="card border border-base-300 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="card-title">
                Constantes vitales
              </h2>

              <p className="text-sm text-base-content/60">
                Mesures prises au moment
                du triage.
              </p>
            </div>

            <span className="badge badge-info">
              Optionnel
            </span>

          </div>

          <div className="divider my-2" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Input
              label="Température"
              unit="°C"
              value={
                temperature
              }
              onChange={
                setTemperature
              }
              disabled={
                loading
              }
            />

            <Input
              label="Tension systolique"
              unit="mmHg"
              value={
                tensionSystolique
              }
              onChange={
                setTensionSystolique
              }
              disabled={
                loading
              }
            />

            <Input
              label="Tension diastolique"
              unit="mmHg"
              value={
                tensionDiastolique
              }
              onChange={
                setTensionDiastolique
              }
              disabled={
                loading
              }
            />

            <Input
              label="Pouls"
              unit="bpm"
              value={pouls}
              onChange={
                setPouls
              }
              disabled={
                loading
              }
            />

            <Input
              label="Saturation"
              unit="%"
              value={
                saturation
              }
              onChange={
                setSaturation
              }
              disabled={
                loading
              }
            />

            <Input
              label="Poids"
              unit="kg"
              value={poids}
              onChange={
                setPoids
              }
              disabled={
                loading
              }
            />

            <Input
              label="Taille"
              unit="cm"
              value={
                taille
              }
              onChange={
                setTaille
              }
              disabled={
                loading
              }
            />

            <Input
              label="Fréquence respiratoire"
              unit="c/min"
              value={
                frequenceRespiratoire
              }
              onChange={
                setFrequenceRespiratoire
              }
              disabled={
                loading
              }
            />

            <Input
              label="Glycémie"
              unit="g/L"
              value={
                glycemie
              }
              onChange={
                setGlycemie
              }
              disabled={
                loading
              }
            />

          </div>

        </div>

      </section>

      {/* ===================================================
          ACTIONS
      =================================================== */}

      <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            router.push(
              "/triages",
            )
          }
          disabled={loading}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            loading ||
            !patientId ||
            !admissionId ||
            !niveauUrgence
          }
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />

              Enregistrement...
            </>
          ) : triage ? (
            "Enregistrer les modifications"
          ) : (
            "Enregistrer le triage"
          )}
        </button>

      </div>

    </form>
  );
}

/* =========================================================
   INFO BLOCK
========================================================= */

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="form-control">

      <label className="label">
        <span className="label-text font-semibold">
          {label}
        </span>
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="textarea textarea-bordered min-h-32 w-full"
        placeholder={
          placeholder
        }
        disabled={disabled}
      />

    </div>
  );
}

/* =========================================================
   INPUT CONSTANTE
========================================================= */

function Input({
  label,
  unit,
  value,
  onChange,
  disabled,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  disabled: boolean;
}) {
  return (
    <div className="form-control">

      <label className="label">
        <span className="label-text font-medium">
          {label}
        </span>
      </label>

      <div className="join w-full">

        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="input input-bordered join-item w-full"
          placeholder="—"
          disabled={disabled}
        />

        <span className="join-item flex min-w-16 items-center justify-center border border-base-300 bg-base-200 px-3 text-xs font-medium">
          {unit}
        </span>

      </div>

    </div>
  );
}

