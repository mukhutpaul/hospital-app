
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import Select, {
  GroupBase,
  MultiValue,
  SingleValue,
} from "react-select";

import {
  createProforma,
  getPatientConsultations,
  getPatientPrestations,
} from "@/app/actions/proformas";

/* ==========================================================
   TYPES
========================================================== */

type Patient = {
  id: number;
  numeroDossier?: string | null;
  nom?: string | null;
  postNom?: string | null;
  prenom?: string | null;
};

type Consultation = {
  idConsultation: number;
  dateConsultation: string | Date;

  motif?: string | null;

  medecin?: {
    id: number;
    matricule?: string | null;
    nom?: string | null;
    postNom?: string | null;
    prenom?: string | null;
  } | null;

  service?: {
    id: number;
    code?: string | null;
    nom?: string | null;
  } | null;

  specialite?: {
    id: number;
    code?: string | null;
    nom?: string | null;
  } | null;

  admission?: {
    id: number;
    numero?: string | null;
    type?: string | null;
    statut?: string | null;
    dateAdmission?: string | Date | null;
  } | null;
};

type Prestation = {
  id: string;
  sourceId: number;

  typeOrigine: string;
  designation: string;

  quantite: number;
  prixUnitaire: number;
  montant: number;

  reference?: string | null;

  acteId?: number | null;
  serviceId?: number | null;
  consultationId?: number | null;

  demandeLaboratoireId?: number | null;
  demandeImagerieId?: number | null;
  dispensationId?: number | null;
  hospitalisationId?: number | null;
};

type Prestations = {
  pharmacie: Prestation[];
  laboratoire: Prestation[];
  imagerie: Prestation[];
  hospitalisation: Prestation[];
  actesMedicaux: Prestation[];
  autres: Prestation[];
};

type PatientOption = {
  value: number;
  label: string;
  patient: Patient;
};

type ConsultationOption = {
  value: number;
  label: string;
  consultation: Consultation;
};

type SelectOption = Prestation & {
  value: string;
  label: string;
};

type SelectGroup = GroupBase<SelectOption>;

type Props = {
  patients: Patient[];
};

/* ==========================================================
   TYPE RÉDUCTION
========================================================== */

type TypeReduction = "MONTANT" | "POURCENTAGE";

/* ==========================================================
   CATÉGORIES
========================================================== */

const CATEGORY_CONFIG = [
  {
    key: "laboratoire" as const,
    label: "Laboratoire",
    icon: "🧪",
  },
  {
    key: "imagerie" as const,
    label: "Imagerie",
    icon: "🩻",
  },
  {
    key: "pharmacie" as const,
    label: "Pharmacie",
    icon: "💊",
  },
  {
    key: "actesMedicaux" as const,
    label: "Actes médicaux",
    icon: "🩺",
  },
  {
    key: "hospitalisation" as const,
    label: "Hospitalisation",
    icon: "🏥",
  },
  {
    key: "autres" as const,
    label: "Autres",
    icon: "➕",
  },
];

/* ==========================================================
   UTILITAIRES
========================================================== */

function createEmptyPrestations(): Prestations {
  return {
    pharmacie: [],
    laboratoire: [],
    imagerie: [],
    hospitalisation: [],
    actesMedicaux: [],
    autres: [],
  };
}

function toNumber(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: unknown): string {
  return toNumber(value).toFixed(2);
}

function formatDate(
  value: string | Date | null | undefined
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPatientName(patient: Patient): string {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim())
    )
    .join(" ");
}

function getMedecinName(
  consultation: Consultation
): string {
  if (!consultation.medecin) {
    return "Médecin non renseigné";
  }

  const name = [
    consultation.medecin.nom,
    consultation.medecin.postNom,
    consultation.medecin.prenom,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim())
    )
    .join(" ");

  return name || "Médecin non renseigné";
}

function getCategoryLabel(
  typeOrigine: string
): string {
  switch (
    String(typeOrigine)
      .trim()
      .toUpperCase()
  ) {
    case "LABORATOIRE":
      return "🧪 Laboratoire";

    case "IMAGERIE":
      return "🩻 Imagerie";

    case "PHARMACIE":
      return "💊 Pharmacie";

    case "ACTE_MEDICAL":
    case "ACTES_MEDICAUX":
    case "ACTE_MEDICAUX":
      return "🩺 Acte médical";

    case "HOSPITALISATION":
      return "🏥 Hospitalisation";

    default:
      return "➕ Autre";
  }
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function ProformaForm({
  patients,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  /* ========================================================
     PATIENT
  ======================================================== */

  const [
    selectedPatient,
    setSelectedPatient,
  ] = useState<PatientOption | null>(null);

  /* ========================================================
     CONSULTATIONS
  ======================================================== */

  const [
    consultations,
    setConsultations,
  ] = useState<Consultation[]>([]);

  const [
    selectedConsultation,
    setSelectedConsultation,
  ] =
    useState<ConsultationOption | null>(
      null
    );

  /* ========================================================
     PRESTATIONS
  ======================================================== */

  const [
    prestations,
    setPrestations,
  ] = useState<Prestations>(
    createEmptyPrestations()
  );

  const [
    selected,
    setSelected,
  ] = useState<SelectOption[]>([]);

  /* ========================================================
     ÉTATS
  ======================================================== */

  const [
    loadingConsultations,
    setLoadingConsultations,
  ] = useState(false);

  const [
    loadingPrestations,
    setLoadingPrestations,
  ] = useState(false);

  /* ========================================================
     RÉDUCTION
  ======================================================== */

  const [
    typeReduction,
    setTypeReduction,
  ] = useState<TypeReduction>("MONTANT");

  const [
    reduction,
    setReduction,
  ] = useState<number>(0);

  const [
    error,
    setError,
  ] = useState("");

  /* ==========================================================
     OPTIONS PATIENTS
  ========================================================== */

  const patientOptions =
    useMemo<PatientOption[]>(() => {
      return patients.map((patient) => {
        const patientName =
          getPatientName(patient);

        return {
          value: patient.id,

          label: `${patientName || "Patient"} — ${
            patient.numeroDossier ||
            "Sans dossier"
          }`,

          patient,
        };
      });
    }, [patients]);

  /* ==========================================================
     OPTIONS CONSULTATIONS
  ========================================================== */

  const consultationOptions =
    useMemo<ConsultationOption[]>(() => {
      return consultations.map(
        (consultation) => ({
          value:
            consultation.idConsultation,

          label: `CONS-${consultation.idConsultation} — ${formatDate(
            consultation.dateConsultation
          )} — ${getMedecinName(
            consultation
          )}`,

          consultation,
        })
      );
    }, [consultations]);

  /* ==========================================================
     CHARGER LES CONSULTATIONS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadConsultations() {
      if (!selectedPatient) {
        if (mounted) {
          setConsultations([]);
          setSelectedConsultation(null);
          setPrestations(
            createEmptyPrestations()
          );
          setSelected([]);
          setReduction(0);
          setTypeReduction("MONTANT");
          setLoadingConsultations(false);
        }

        return;
      }

      setLoadingConsultations(true);
      setError("");

      setSelectedConsultation(null);
      setPrestations(
        createEmptyPrestations()
      );
      setSelected([]);
      setReduction(0);
      setTypeReduction("MONTANT");

      try {
        const result =
          await getPatientConsultations(
            selectedPatient.patient.id
          );

        if (!mounted) {
          return;
        }

        if (
          !result ||
          !result.success
        ) {
          setConsultations([]);

          setError(
            result?.message ||
              "Impossible de charger les consultations."
          );

          return;
        }

        const data =
          Array.isArray(result.data)
            ? result.data
            : [];

        setConsultations(
          data as Consultation[]
        );
      } catch (err) {
        console.error(
          "Chargement consultations :",
          err
        );

        if (mounted) {
          setConsultations([]);

          setError(
            "Une erreur est survenue lors du chargement des consultations."
          );
        }
      } finally {
        if (mounted) {
          setLoadingConsultations(false);
        }
      }
    }

    void loadConsultations();

    return () => {
      mounted = false;
    };
  }, [selectedPatient]);

  /* ==========================================================
     CHARGER LES PRESTATIONS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadPrestations() {
      if (
        !selectedPatient ||
        !selectedConsultation
      ) {
        if (mounted) {
          setPrestations(
            createEmptyPrestations()
          );
          setSelected([]);
          setReduction(0);
          setTypeReduction("MONTANT");
          setLoadingPrestations(false);
        }

        return;
      }

      setLoadingPrestations(true);
      setError("");

      setSelected([]);
      setReduction(0);
      setTypeReduction("MONTANT");

      try {
        const result =
          await getPatientPrestations(
            selectedPatient.patient.id,
            selectedConsultation.value
          );

        if (!mounted) {
          return;
        }

        if (
          !result ||
          !result.success ||
          !result.data
        ) {
          setPrestations(
            createEmptyPrestations()
          );

          setError(
            result?.message ||
              "Impossible de charger les prestations de la consultation."
          );

          return;
        }

        const data =
          result.data as Partial<Prestations>;

        setPrestations({
          pharmacie:
            Array.isArray(data.pharmacie)
              ? data.pharmacie
              : [],

          laboratoire:
            Array.isArray(
              data.laboratoire
            )
              ? data.laboratoire
              : [],

          imagerie:
            Array.isArray(data.imagerie)
              ? data.imagerie
              : [],

          hospitalisation:
            Array.isArray(
              data.hospitalisation
            )
              ? data.hospitalisation
              : [],

          actesMedicaux:
            Array.isArray(
              data.actesMedicaux
            )
              ? data.actesMedicaux
              : [],

          autres:
            Array.isArray(data.autres)
              ? data.autres
              : [],
        });
      } catch (err) {
        console.error(
          "Chargement prestations :",
          err
        );

        if (mounted) {
          setPrestations(
            createEmptyPrestations()
          );

          setError(
            "Une erreur est survenue lors du chargement des prestations."
          );
        }
      } finally {
        if (mounted) {
          setLoadingPrestations(false);
        }
      }
    }

    void loadPrestations();

    return () => {
      mounted = false;
    };
  }, [
    selectedPatient,
    selectedConsultation,
  ]);

  /* ==========================================================
     TOUTES LES PRESTATIONS
  ========================================================== */

  const toutesLesPrestations =
    useMemo<Prestation[]>(() => {
      return [
        ...prestations.laboratoire,
        ...prestations.imagerie,
        ...prestations.pharmacie,
        ...prestations.actesMedicaux,
        ...prestations.hospitalisation,
        ...prestations.autres,
      ];
    }, [prestations]);

  /* ==========================================================
     OPTIONS GROUPÉES
  ========================================================== */

  const groupedOptions =
    useMemo<SelectGroup[]>(() => {
      return CATEGORY_CONFIG
        .map((category) => {
          const liste =
            prestations[category.key];

          const options: SelectOption[] =
            liste.map((prestation) => ({
              ...prestation,

              value: prestation.id,

              label:
                prestation.designation ||
                "Prestation sans désignation",
            }));

          return {
            label: `${category.icon} ${category.label}`,
            options,
          };
        })
        .filter(
          (group) =>
            group.options.length > 0
        );
    }, [prestations]);

  /* ==========================================================
     MONTANT BRUT
  ========================================================== */

  const montantBrut =
    useMemo<number>(() => {
      return selected.reduce(
        (total, ligne) => {
          const quantite = Math.max(
            0,
            toNumber(ligne.quantite)
          );

          const prix = Math.max(
            0,
            toNumber(ligne.prixUnitaire)
          );

          return (
            total + quantite * prix
          );
        },
        0
      );
    }, [selected]);

  /* ==========================================================
     VALEUR DE RÉDUCTION SAISIE
  ========================================================== */

  const reductionSaisie =
    Math.max(0, toNumber(reduction));

  /* ==========================================================
     RÉDUCTION EFFECTIVE
  ========================================================== */

  const reductionEffective =
    typeReduction === "POURCENTAGE"
      ? Math.min(
          montantBrut,
          (montantBrut *
            Math.min(
              100,
              reductionSaisie
            )) /
            100
        )
      : Math.min(
          montantBrut,
          reductionSaisie
        );

  /* ==========================================================
     TOTAL
  ========================================================== */

  const montantTotal =
    Math.max(
      0,
      montantBrut -
        reductionEffective
    );

  /* ==========================================================
     CHANGEMENT TYPE RÉDUCTION
  ========================================================== */

  function handleTypeReductionChange(
    value: TypeReduction
  ) {
    setTypeReduction(value);

    /*
     * Lorsque l'utilisateur passe de montant
     * à pourcentage, on repart à 0 afin
     * d'éviter une valeur incohérente.
     */
    setReduction(0);

    setError("");
  }

  /* ==========================================================
     CHANGEMENT PATIENT
  ========================================================== */

  function handlePatientChange(
    option: SingleValue<PatientOption>
  ) {
    setSelectedPatient(
      option ?? null
    );

    setSelectedConsultation(null);
    setConsultations([]);

    setPrestations(
      createEmptyPrestations()
    );

    setSelected([]);
    setReduction(0);
    setTypeReduction("MONTANT");
    setError("");
  }

  /* ==========================================================
     CHANGEMENT CONSULTATION
  ========================================================== */

  function handleConsultationChange(
    option: SingleValue<ConsultationOption>
  ) {
    setSelectedConsultation(
      option ?? null
    );

    setPrestations(
      createEmptyPrestations()
    );

    setSelected([]);
    setReduction(0);
    setTypeReduction("MONTANT");
    setError("");
  }

  /* ==========================================================
     CHANGEMENT PRESTATIONS
  ========================================================== */

  function handlePrestationsChange(
    values: MultiValue<SelectOption>
  ) {
    setSelected(
      Array.from(values)
    );

    setError("");
  }

  /* ==========================================================
     TOUT SÉLECTIONNER
  ========================================================== */

  function selectAll() {
    const options: SelectOption[] =
      toutesLesPrestations.map(
        (prestation) => ({
          ...prestation,

          value: prestation.id,

          label:
            prestation.designation ||
            "Prestation sans désignation",
        })
      );

    setSelected(options);
    setError("");
  }

  /* ==========================================================
     TOUT EFFACER
  ========================================================== */

  function clearAll() {
    setSelected([]);
    setError("");
  }

  /* ==========================================================
     SUPPRIMER UNE PRESTATION
  ========================================================== */

  function removeSelected(
    id: string
  ) {
    setSelected((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setError("");
  }

  /* ==========================================================
     SOUMISSION
  ========================================================== */

  function submit() {
    if (!selectedPatient) {
      setError(
        "Veuillez sélectionner un patient."
      );

      return;
    }

    if (!selectedConsultation) {
      setError(
        "Veuillez sélectionner une consultation."
      );

      return;
    }

    if (selected.length === 0) {
      setError(
        "Veuillez sélectionner au moins une prestation."
      );

      return;
    }

    /* ------------------------------------------------------
       VALIDATION DES PRESTATIONS
    ------------------------------------------------------ */

    const prestationInvalide =
      selected.find((ligne) => {
        const quantite = toNumber(
          ligne.quantite
        );

        const prix = toNumber(
          ligne.prixUnitaire
        );

        return (
          quantite <= 0 ||
          prix < 0
        );
      });

    if (prestationInvalide) {
      setError(
        `La prestation "${prestationInvalide.designation}" possède une quantité ou un prix invalide.`
      );

      return;
    }

    /* ------------------------------------------------------
       VALIDATION RÉDUCTION
    ------------------------------------------------------ */

    if (reductionSaisie < 0) {
      setError(
        "La réduction ne peut pas être négative."
      );

      return;
    }

    if (
      typeReduction === "POURCENTAGE" &&
      reductionSaisie > 100
    ) {
      setError(
        "La réduction en pourcentage ne peut pas dépasser 100 %."
      );

      return;
    }

    if (
      typeReduction === "MONTANT" &&
      reductionSaisie > montantBrut
    ) {
      setError(
        "La réduction ne peut pas dépasser le montant brut."
      );

      return;
    }

    setError("");

    /* ------------------------------------------------------
       CONSTRUCTION DES LIGNES
    ------------------------------------------------------ */

    const lignes = selected.map(
      (ligne) => {
        const quantite = Math.max(
          0,
          toNumber(ligne.quantite)
        );

        const prixUnitaire =
          Math.max(
            0,
            toNumber(
              ligne.prixUnitaire
            )
          );

        const montant =
          quantite * prixUnitaire;

        return {
          typeOrigine:
            ligne.typeOrigine,

          acteId:
            ligne.acteId ??
            undefined,

          serviceId:
            ligne.serviceId ??
            undefined,

          consultationId:
            selectedConsultation.value,

          demandeLaboratoireId:
            ligne.demandeLaboratoireId ??
            undefined,

          demandeImagerieId:
            ligne.demandeImagerieId ??
            undefined,

          dispensationId:
            ligne.dispensationId ??
            undefined,

          hospitalisationId:
            ligne.hospitalisationId ??
            undefined,

          designation:
            ligne.designation,

          quantite,

          prixUnitaire,

          montant,

          reference:
            ligne.reference ??
            undefined,
        };
      }
    );

    /* ------------------------------------------------------
       CRÉATION PROFORMA
    ------------------------------------------------------ */

    startTransition(async () => {
      try {
        const result =
          await createProforma({
            patientId:
              selectedPatient.patient.id,

            consultationId:
              selectedConsultation.value,

            /*
             * On envoie la réduction effective
             * en montant USD.
             */
            reduction:
              reductionEffective,

            /*
             * On indique au backend le type
             * réellement utilisé.
             */
            typeReduction,

            devise: "USD",

            lignes,
          });

        if (
          !result ||
          !result.success
        ) {
          setError(
            result?.message ||
              "Erreur lors de la création de la proforma."
          );

          return;
        }

        const proforma =
          result.data as
            | {
                id?: number;
              }
            | undefined;

        const id =
          proforma?.id;

        if (
          typeof id !== "number" ||
          !Number.isInteger(id) ||
          id <= 0
        ) {
          setError(
            "La proforma a été créée mais son identifiant est introuvable."
          );

          return;
        }

        router.push(
          `/facturation/proformas/${id}`
        );
      } catch (err) {
        console.error(
          "Création proforma :",
          err
        );

        setError(
          "Une erreur est survenue lors de la création de la proforma."
        );
      }
    });
  }

  /* ==========================================================
     STYLES REACT SELECT
  ========================================================== */

  const selectStyles = {
    menu: (base: object) => ({
      ...base,
      zIndex: 9999,
    }),

    menuPortal: (base: object) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">

      {/* ====================================================
          TITRE
      ==================================================== */}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">

          <h2 className="card-title text-2xl">
            Nouvelle proforma
          </h2>

          <p className="text-sm text-base-content/60">
            Sélectionnez un patient, sa
            consultation, puis les prestations
            à facturer.
          </p>

        </div>
      </div>

      {/* ====================================================
          ERREUR
      ==================================================== */}

      {error && (
        <div className="alert alert-error">

          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() =>
              setError("")
            }
          >
            Fermer
          </button>

        </div>
      )}

      {/* ====================================================
          1 — PATIENT
      ==================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="card-body">

          <h3 className="card-title">
            1. Patient
          </h3>

          <div className="divider" />

          <Select<PatientOption>
            options={patientOptions}
            value={selectedPatient}
            onChange={
              handlePatientChange
            }
            isSearchable
            isClearable
            placeholder="Rechercher un patient..."
            noOptionsMessage={() =>
              "Aucun patient trouvé"
            }
            formatOptionLabel={(
              option
            ) => (
              <div>
                <div className="font-semibold">
                  {getPatientName(
                    option.patient
                  ) ||
                    "Patient"}
                </div>

                <div className="text-xs opacity-60">
                  Dossier :{" "}
                  {option.patient
                    .numeroDossier ||
                    "N/A"}
                </div>
              </div>
            )}
            menuPortalTarget={
              typeof document !==
              "undefined"
                ? document.body
                : undefined
            }
            styles={selectStyles}
          />

          {selectedPatient && (
            <div className="mt-4 rounded-xl bg-base-200 p-4">

              <div className="text-xs opacity-60">
                Patient sélectionné
              </div>

              <div className="text-xl font-bold">
                {getPatientName(
                  selectedPatient.patient
                ) ||
                  "Patient"}
              </div>

              <div className="text-sm">
                Dossier :{" "}
                <strong>
                  {selectedPatient
                    .patient
                    .numeroDossier ||
                    "N/A"}
                </strong>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ====================================================
          2 — CONSULTATION
      ==================================================== */}

      {selectedPatient && (
        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <h3 className="card-title">
              2. Consultation
            </h3>

            <div className="divider" />

            {loadingConsultations ? (
              <div className="flex flex-col items-center py-8">

                <span className="loading loading-spinner loading-lg" />

                <p className="mt-3 text-sm opacity-60">
                  Chargement des
                  consultations...
                </p>

              </div>
            ) : consultations.length ===
              0 ? (
              <div className="alert alert-warning">

                <span>
                  Aucune consultation
                  trouvée pour ce patient.
                </span>

              </div>
            ) : (
              <Select<ConsultationOption>
                options={
                  consultationOptions
                }
                value={
                  selectedConsultation
                }
                onChange={
                  handleConsultationChange
                }
                isSearchable
                isClearable
                placeholder="Sélectionner une consultation..."
                noOptionsMessage={() =>
                  "Aucune consultation trouvée"
                }
                formatOptionLabel={(
                  option
                ) => (
                  <div>

                    <div className="font-semibold">
                      CONS-
                      {
                        option
                          .consultation
                          .idConsultation
                      }{" "}
                      —{" "}
                      {formatDate(
                        option
                          .consultation
                          .dateConsultation
                      )}
                    </div>

                    <div className="text-xs opacity-70">
                      Médecin :{" "}
                      {getMedecinName(
                        option.consultation
                      )}
                    </div>

                    {option
                      .consultation
                      .service && (
                      <div className="text-xs opacity-60">
                        Service :{" "}
                        {
                          option
                            .consultation
                            .service
                            .nom
                        }
                      </div>
                    )}

                    {option
                      .consultation
                      .specialite && (
                      <div className="text-xs opacity-60">
                        Spécialité :{" "}
                        {
                          option
                            .consultation
                            .specialite
                            .nom
                        }
                      </div>
                    )}

                    {option
                      .consultation
                      .motif && (
                      <div className="text-xs opacity-50">
                        Motif :{" "}
                        {
                          option
                            .consultation
                            .motif
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
                styles={selectStyles}
              />
            )}

            {selectedConsultation && (
              <div className="mt-4 rounded-xl bg-primary/10 p-4">

                <div className="text-xs opacity-60">
                  Consultation sélectionnée
                </div>

                <div className="font-bold">
                  Consultation #
                  {
                    selectedConsultation
                      .value
                  }
                </div>

                <div className="text-sm">
                  Date :{" "}
                  {formatDate(
                    selectedConsultation
                      .consultation
                      .dateConsultation
                  )}
                </div>

                <div className="text-sm">
                  Médecin :{" "}
                  {getMedecinName(
                    selectedConsultation
                      .consultation
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ====================================================
          3 — CHARGEMENT PRESTATIONS
      ==================================================== */}

      {selectedConsultation &&
        loadingPrestations && (
          <div className="card bg-base-100 shadow-xl">

            <div className="card-body items-center py-12">

              <span className="loading loading-spinner loading-lg" />

              <p className="mt-3 opacity-60">
                Chargement des prestations
                de la consultation...
              </p>

            </div>

          </div>
        )}

      {/* ====================================================
          3 — PRESTATIONS DISPONIBLES
      ==================================================== */}

      {selectedConsultation &&
        !loadingPrestations && (
          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="card-title">
                    3. Prestations de la
                    consultation
                  </h3>

                  <p className="text-sm opacity-60">
                    {
                      toutesLesPrestations.length
                    }{" "}
                    prestation
                    {toutesLesPrestations.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    disponible
                    {toutesLesPrestations.length !==
                    1
                      ? "s"
                      : ""}
                  </p>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    disabled={
                      toutesLesPrestations.length ===
                      0
                    }
                    onClick={
                      selectAll
                    }
                  >
                    Tout sélectionner
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    disabled={
                      selected.length ===
                      0
                    }
                    onClick={
                      clearAll
                    }
                  >
                    Tout effacer
                  </button>

                </div>

              </div>

              {toutesLesPrestations.length ===
              0 ? (
                <div className="alert alert-info mt-4">

                  <span>
                    Aucune prestation
                    facturable n'est
                    disponible pour cette
                    consultation.
                  </span>

                </div>
              ) : (
                <div className="mt-4">

                  <Select<
                    SelectOption,
                    true,
                    SelectGroup
                  >
                    isMulti
                    isSearchable
                    isClearable
                    closeMenuOnSelect={
                      false
                    }
                    hideSelectedOptions={
                      false
                    }
                    options={
                      groupedOptions
                    }
                    value={selected}
                    onChange={
                      handlePrestationsChange
                    }
                    placeholder="Rechercher une prestation..."
                    noOptionsMessage={() =>
                      "Aucune prestation trouvée"
                    }
                    formatGroupLabel={(
                      group
                    ) => (
                      <div className="flex justify-between font-bold">

                        <span>
                          {group.label}
                        </span>

                        <span className="badge badge-sm">
                          {
                            group
                              .options
                              .length
                          }
                        </span>

                      </div>
                    )}
                    formatOptionLabel={(
                      option
                    ) => (
                      <div className="flex justify-between gap-4">

                        <div className="min-w-0">

                          <div className="font-medium">
                            {
                              option.designation
                            }
                          </div>

                          <div className="text-xs opacity-60">
                            {getCategoryLabel(
                              option.typeOrigine
                            )}
                          </div>

                          {option.reference && (
                            <div className="text-xs opacity-50">
                              Réf.{" "}
                              {
                                option.reference
                              }
                            </div>
                          )}

                        </div>

                        <div className="whitespace-nowrap text-right">

                          <div className="text-xs opacity-60">
                            {
                              option.quantite
                            }{" "}
                            ×{" "}
                            {formatMoney(
                              option.prixUnitaire
                            )}
                          </div>

                          <div className="font-bold">
                            {formatMoney(
                              option.montant
                            )}{" "}
                            USD
                          </div>

                        </div>

                      </div>
                    )}
                    menuPortalTarget={
                      typeof document !==
                      "undefined"
                        ? document.body
                        : undefined
                    }
                    styles={selectStyles}
                  />

                </div>
              )}

            </div>

          </div>
        )}

      {/* ====================================================
          4 — PRESTATIONS SÉLECTIONNÉES
      ==================================================== */}

      {selectedConsultation &&
        selected.length > 0 && (
          <div className="card bg-base-100 shadow-xl">

            <div className="card-body">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="card-title">
                    4. Prestations à facturer
                  </h3>

                  <p className="text-sm opacity-60">
                    Les prestations
                    ci-dessous seront
                    incluses dans la
                    proforma.
                  </p>

                </div>

                <span className="badge badge-primary badge-lg">
                  {selected.length}
                </span>

              </div>

              <div className="divider" />

              <div className="space-y-3">

                {selected.map(
                  (ligne) => (
                    <div
                      key={`${ligne.id}-${ligne.sourceId}`}
                      className="rounded-xl border border-base-300 bg-base-100 p-4"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div className="min-w-0">

                          <div className="font-semibold">
                            {
                              ligne.designation
                            }
                          </div>

                          <div className="mt-1 text-xs opacity-60">
                            {getCategoryLabel(
                              ligne.typeOrigine
                            )}
                          </div>

                          <div className="mt-1 text-sm opacity-70">
                            {
                              ligne.quantite
                            }{" "}
                            ×{" "}
                            {formatMoney(
                              ligne.prixUnitaire
                            )}{" "}
                            USD
                          </div>

                          {ligne.reference && (
                            <div className="mt-1 text-xs opacity-50">
                              Référence :{" "}
                              {
                                ligne.reference
                              }
                            </div>
                          )}

                          {ligne.dispensationId !=
                            null && (
                            <div className="mt-1 text-xs opacity-50">
                              Dispensation :{" "}
                              {
                                ligne.dispensationId
                              }
                            </div>
                          )}

                          {ligne.demandeLaboratoireId !=
                            null && (
                            <div className="mt-1 text-xs opacity-50">
                              Demande laboratoire :{" "}
                              {
                                ligne.demandeLaboratoireId
                              }
                            </div>
                          )}

                          {ligne.demandeImagerieId !=
                            null && (
                            <div className="mt-1 text-xs opacity-50">
                              Demande imagerie :{" "}
                              {
                                ligne.demandeImagerieId
                              }
                            </div>
                          )}

                          {ligne.hospitalisationId !=
                            null && (
                            <div className="mt-1 text-xs opacity-50">
                              Hospitalisation :{" "}
                              {
                                ligne.hospitalisationId
                              }
                            </div>
                          )}

                        </div>

                        <div className="flex items-center justify-between gap-4 md:justify-end">

                          <strong className="text-lg">
                            {formatMoney(
                              ligne.montant
                            )}{" "}
                            USD
                          </strong>

                          <button
                            type="button"
                            className="btn btn-sm btn-error btn-outline"
                            onClick={() =>
                              removeSelected(
                                ligne.id
                              )
                            }
                          >
                            Retirer
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>
        )}

      {/* ====================================================
          5 — RÉCAPITULATIF
      ==================================================== */}

      {selectedPatient && (
        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <h3 className="card-title">
              5. Récapitulatif financier
            </h3>

            <div className="divider" />

            <div className="space-y-4">

              {/* ------------------------------------------------
                   NOMBRE DE PRESTATIONS
              ------------------------------------------------ */}

              <div className="flex justify-between">

                <span>
                  Prestations sélectionnées
                </span>

                <strong>
                  {selected.length}
                </strong>

              </div>

              {/* ------------------------------------------------
                   MONTANT BRUT
              ------------------------------------------------ */}

              <div className="flex justify-between text-lg">

                <span>
                  Montant brut
                </span>

                <strong>
                  {formatMoney(
                    montantBrut
                  )}{" "}
                  USD
                </strong>

              </div>

              {/* ------------------------------------------------
                   TYPE DE RÉDUCTION
              ------------------------------------------------ */}

              <div className="space-y-2">

                <label
                  htmlFor="typeReduction"
                  className="font-medium"
                >
                  Type de réduction
                </label>

                <select
                  id="typeReduction"
                  className="select select-bordered w-full"
                  value={typeReduction}
                  onChange={(event) =>
                    handleTypeReductionChange(
                      event.target
                        .value as TypeReduction
                    )
                  }
                >
                  <option value="MONTANT">
                    Montant fixe (USD)
                  </option>

                  <option value="POURCENTAGE">
                    Pourcentage (%)
                  </option>
                </select>

              </div>

              {/* ------------------------------------------------
                   VALEUR DE RÉDUCTION
              ------------------------------------------------ */}

              <div className="space-y-2">

                <label
                  htmlFor="reduction"
                  className="font-medium"
                >
                  Réduction
                </label>

                <div className="relative">

                  <input
                    id="reduction"
                    type="number"
                    min="0"
                    max={
                      typeReduction ===
                      "POURCENTAGE"
                        ? 100
                        : montantBrut
                    }
                    step="0.01"
                    className="input input-bordered w-full pr-16 text-right"
                    value={
                      reduction
                    }
                    onChange={(event) => {
                      const value =
                        toNumber(
                          event.target
                            .value
                        );

                      const max =
                        typeReduction ===
                        "POURCENTAGE"
                          ? 100
                          : montantBrut;

                      setReduction(
                        Math.min(
                          max,
                          Math.max(
                            0,
                            value
                          )
                        )
                      );
                    }}
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-60">
                    {typeReduction ===
                    "POURCENTAGE"
                      ? "%"
                      : "USD"}
                  </span>

                </div>

              </div>

              {/* ------------------------------------------------
                   DÉTAIL RÉDUCTION
              ------------------------------------------------ */}

              {reductionEffective >
                0 && (
                <div className="rounded-xl bg-warning/10 p-4">

                  <div className="flex justify-between">

                    <span>
                      Réduction saisie
                    </span>

                    <strong>
                      {typeReduction ===
                      "POURCENTAGE"
                        ? `${formatMoney(
                            reductionSaisie
                          )} %`
                        : `${formatMoney(
                            reductionSaisie
                          )} USD`}
                    </strong>

                  </div>

                  <div className="mt-2 flex justify-between text-sm">

                    <span>
                      Équivalent réduction
                    </span>

                    <strong>
                      -{" "}
                      {formatMoney(
                        reductionEffective
                      )}{" "}
                      USD
                    </strong>

                  </div>

                </div>
              )}

              <div className="divider" />

              {/* ------------------------------------------------
                   TOTAL
              ------------------------------------------------ */}

              <div className="flex justify-between text-2xl font-bold">

                <span>
                  Total
                </span>

                <span>
                  {formatMoney(
                    montantTotal
                  )}{" "}
                  USD
                </span>

              </div>

            </div>

            {/* ================================================
                ACTIONS
            ================================================= */}

            <div className="card-actions mt-6 justify-end">

              <button
                type="button"
                className="btn btn-ghost"
                disabled={pending}
                onClick={() =>
                  router.push(
                    "/facturation/proformas"
                  )
                }
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  pending ||
                  !selectedPatient ||
                  !selectedConsultation ||
                  selected.length ===
                    0
                }
                onClick={submit}
              >
                {pending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Création...
                  </>
                ) : (
                  "Créer la proforma"
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
