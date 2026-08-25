"use client";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FlaskConical,
  HeartPulse,
  Loader2,
  Pill,
  Plus,
  Ruler,
  Save,
  Scale,
  ScanLine,
  Stethoscope,
  Thermometer,
  UserRound,
  Wind,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/navigation";

import {
  createConstanteConsultation,
  createDemandeImagerie,
  createDemandeLaboratoire,
  createPrescription,
} from "@/app/actions/consultations";

/* ==========================================================
   TYPES
========================================================== */

type Props = {
  consultation: any;
  medicaments: any[];
  examensLaboratoire: any[];
  examensImagerie: any[];
};

type ActiveTab =
  | "general"
  | "constantes"
  | "prescription"
  | "laboratoire"
  | "imagerie";

type ModalType =
  | null
  | "constante"
  | "prescription"
  | "laboratoire"
  | "imagerie";

/* ==========================================================
   TYPE — LIGNE DE PRESCRIPTION
========================================================== */

type PrescriptionLine = {
  medicamentId: string;
  dose: string;
  posologie: string;
  frequence: string;
  duree: string;
  voie: string;
  quantite: string;
  observation: string;
};

/* ==========================================================
   UTILITAIRE — LIGNE VIDE
========================================================== */

function createEmptyPrescriptionLine(): PrescriptionLine {
  return {
    medicamentId: "",
    dose: "",
    posologie: "",
    frequence: "",
    duree: "",
    voie: "",
    quantite: "",
    observation: "",
  };
}

/* ==========================================================
   UTILITAIRES FICHIERS
========================================================== */

/**
 * Vérifie si le fichier est une image.
 */
function isImageFile(file: unknown): boolean {
  if (!file) return false;

  const value = String(file).trim().toLowerCase();

  if (!value) return false;

  const cleanValue = value
    .split("?")[0]
    .split("#")[0];

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".avif",
  ];

  return imageExtensions.some((extension) =>
    cleanValue.endsWith(extension),
  );
}

/**
 * Transforme le chemin du fichier en URL utilisable
 * par le navigateur.
 */
function getFileUrl(file: unknown): string {
  if (!file) return "";

  const value = String(file).trim();

  if (!value) return "";

  /*
   * URL déjà complète.
   */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  /*
   * Normalisation des chemins Windows.
   */
  let normalized = value.replace(/\\/g, "/");

  /*
   * Exemple :
   * C:/dev/hospital-app/public/uploads/imagerie/image.jpg
   *
   * devient :
   * /uploads/imagerie/image.jpg
   */
  if (/^[a-zA-Z]:\//.test(normalized)) {
    const uploadsIndex = normalized
      .toLowerCase()
      .indexOf("/uploads/");

    if (uploadsIndex !== -1) {
      normalized = normalized.substring(
        uploadsIndex,
      );
    } else {
      normalized = `/${
        normalized.split("/").pop() ?? ""
      }`;
    }
  }

  /*
   * Si le chemin commence déjà par /.
   */
  if (normalized.startsWith("/")) {
    return normalized;
  }

  /*
   * Exemple :
   * uploads/imagerie/image.jpg
   *
   * devient :
   * /uploads/imagerie/image.jpg
   */
  return `/${normalized}`;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function ConsultationDetails({
  consultation,
  medicaments = [],
  examensLaboratoire = [],
  examensImagerie = [],
}: Props) {
  /* ========================================================
     ÉTATS
  ======================================================== */

  const [activeTab, setActiveTab] =
    useState<ActiveTab>("general");

  const router = useRouter();

  const [modal, setModal] =
    useState<ModalType>(null);

  const [loading, setLoading] =
    useState(false);

  /* ========================================================
     CONSTANTES
  ======================================================== */

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

  /* ========================================================
     PRESCRIPTION
     UNE PRESCRIPTION = PLUSIEURS MÉDICAMENTS
  ======================================================== */

  const [prescriptionLines, setPrescriptionLines] =
    useState<PrescriptionLine[]>([
      createEmptyPrescriptionLine(),
    ]);

  /* ========================================================
     LABORATOIRE
  ======================================================== */

  const [examensSelectionnes, setExamensSelectionnes] =
    useState<number[]>([]);

  const [urgenceLabo, setUrgenceLabo] =
    useState(false);

  const [observationLabo, setObservationLabo] =
    useState("");

  /* ========================================================
     IMAGERIE
  ======================================================== */

  const [examenImagerieId, setExamenImagerieId] =
    useState("");

  const [urgenceImagerie, setUrgenceImagerie] =
    useState(false);

  const [motifImagerie, setMotifImagerie] =
    useState("");

  /* ========================================================
     FERMETURE MODALE
  ======================================================== */

  function closeModal() {
    if (loading) return;

    setModal(null);

    /* CONSTANTES */

    setTemperature("");
    setTensionSystolique("");
    setTensionDiastolique("");
    setPouls("");
    setSaturation("");
    setPoids("");
    setTaille("");
    setFrequenceRespiratoire("");
    setGlycemie("");

    /* PRESCRIPTION */

    setPrescriptionLines([
      createEmptyPrescriptionLine(),
    ]);

    /* LABORATOIRE */

    setExamensSelectionnes([]);
    setUrgenceLabo(false);
    setObservationLabo("");

    /* IMAGERIE */

    setExamenImagerieId("");
    setUrgenceImagerie(false);
    setMotifImagerie("");
  }

  /* ========================================================
     ESCAPE
  ======================================================== */

  useEffect(() => {
    if (!modal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        closeModal();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [modal, loading]);

  /* ========================================================
     CONSTANTES
  ======================================================== */

  async function handleCreateConstante(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !consultation?.patientId ||
      !consultation?.idConsultation
    ) {
      toast.error(
        "Informations de consultation invalides.",
      );

      return;
    }

    const hasValue =
      temperature ||
      tensionSystolique ||
      tensionDiastolique ||
      pouls ||
      saturation ||
      poids ||
      taille ||
      frequenceRespiratoire ||
      glycemie;

    if (!hasValue) {
      toast.error(
        "Veuillez saisir au moins une constante.",
      );

      return;
    }

    setLoading(true);

    try {
      const result =
        await createConstanteConsultation({
          patientId:
            consultation.patientId,

          consultationId:
            consultation.idConsultation,

          temperature: temperature
            ? Number(temperature)
            : null,

          tensionSystolique:
            tensionSystolique
              ? Number(tensionSystolique)
              : null,

          tensionDiastolique:
            tensionDiastolique
              ? Number(tensionDiastolique)
              : null,

          pouls: pouls
            ? Number(pouls)
            : null,

          saturation: saturation
            ? Number(saturation)
            : null,

          poids: poids
            ? Number(poids)
            : null,

          taille: taille
            ? Number(taille)
            : null,

          frequenceRespiratoire:
            frequenceRespiratoire
              ? Number(frequenceRespiratoire)
              : null,

          glycemie: glycemie
            ? Number(glycemie)
            : null,
        });

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible d'enregistrer les constantes.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Constantes enregistrées avec succès.",
      );

      closeModal();

      router.refresh();
    } catch (error) {
      console.error(
        "handleCreateConstante:",
        error,
      );

      toast.error(
        "Impossible d'enregistrer les constantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     PRESCRIPTION
     GESTION DES LIGNES
  ======================================================== */

  function updatePrescriptionLine(
    index: number,
    field: keyof PrescriptionLine,
    value: string,
  ) {
    setPrescriptionLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: value,
            }
          : line,
      ),
    );
  }

  function addPrescriptionLine() {
    setPrescriptionLines((current) => [
      ...current,
      createEmptyPrescriptionLine(),
    ]);
  }

  function removePrescriptionLine(
    index: number,
  ) {
    setPrescriptionLines((current) => {
      if (current.length === 1) {
        return [
          createEmptyPrescriptionLine(),
        ];
      }

      return current.filter(
        (_, lineIndex) =>
          lineIndex !== index,
      );
    });
  }

  /* ========================================================
     PRESCRIPTION
     CRÉATION D'UNE SEULE PRESCRIPTION
     AVEC PLUSIEURS MÉDICAMENTS
  ======================================================== */

  async function handleCreatePrescription(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !consultation?.patientId ||
      !consultation?.idConsultation
    ) {
      toast.error(
        "Informations de consultation invalides.",
      );

      return;
    }

    if (!consultation?.medecinId) {
      toast.error(
        "Médecin de la consultation introuvable.",
      );

      return;
    }

    /*
     * On ne conserve que les lignes pour lesquelles
     * un médicament a été sélectionné.
     */
    const validLines =
      prescriptionLines.filter(
        (line) =>
          line.medicamentId.trim() !== "",
      );

    if (validLines.length === 0) {
      toast.error(
        "Veuillez sélectionner au moins un médicament.",
      );

      return;
    }

    /*
     * Vérifier qu'un même médicament n'est pas
     * ajouté plusieurs fois dans la même prescription.
     */
    const medicamentIds =
      validLines.map(
        (line) => line.medicamentId,
      );

    const uniqueMedicamentIds =
      new Set(medicamentIds);

    if (
      uniqueMedicamentIds.size !==
      medicamentIds.length
    ) {
      toast.error(
        "Un même médicament ne peut pas être ajouté deux fois dans la même prescription.",
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT :
       *
       * createPrescription est appelé UNE SEULE FOIS.
       *
       * Toutes les lignes sont envoyées dans "lignes".
       */
      const result =
        await createPrescription({
          patientId:
            consultation.patientId,

          consultationId:
            consultation.idConsultation,

          medecinId:
            consultation.medecinId,

          lignes: validLines.map(
            (line) => ({
              medicamentId:
                Number(
                  line.medicamentId,
                ),

              dose:
                line.dose.trim() ||
                null,

              posologie:
                line.posologie.trim() ||
                null,

              frequence:
                line.frequence.trim() ||
                null,

              duree:
                line.duree.trim() ||
                null,

              voie:
                line.voie.trim() ||
                null,

              quantite:
                line.quantite
                  ? Number(
                      line.quantite,
                    )
                  : null,

              observation:
                line.observation.trim() ||
                null,
            }),
          ),
        });

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible de créer la prescription.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Prescription créée avec succès.",
      );

      closeModal();

      router.refresh();
    } catch (error) {
      console.error(
        "handleCreatePrescription:",
        error,
      );

      toast.error(
        "Impossible de créer la prescription.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     LABORATOIRE
  ======================================================== */

  function toggleExamenLaboratoire(
    examenId: number,
  ) {
    setExamensSelectionnes((current) => {
      if (current.includes(examenId)) {
        return current.filter(
          (id) => id !== examenId,
        );
      }

      return [
        ...current,
        examenId,
      ];
    });
  }

  async function handleCreateDemandeLaboratoire(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !consultation?.patientId ||
      !consultation?.idConsultation
    ) {
      toast.error(
        "Informations de consultation invalides.",
      );

      return;
    }

    if (
      examensSelectionnes.length === 0
    ) {
      toast.error(
        "Sélectionnez au moins un examen de laboratoire.",
      );

      return;
    }

    setLoading(true);

    try {
      const result =
        await createDemandeLaboratoire({
          patientId:
            consultation.patientId,

          consultationId:
            consultation.idConsultation,

          serviceId:
            consultation.serviceId ??
            null,

          urgence:
            urgenceLabo,

          observation:
            observationLabo.trim() ||
            null,

          examens:
            examensSelectionnes,
        });

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible de créer la demande de laboratoire.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Demande de laboratoire créée avec succès.",
      );

      closeModal();

      router.refresh();
    } catch (error) {
      console.error(
        "handleCreateDemandeLaboratoire:",
        error,
      );

      toast.error(
        "Impossible de créer la demande de laboratoire.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     IMAGERIE
  ======================================================== */

  async function handleCreateDemandeImagerie(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !consultation?.patientId ||
      !consultation?.idConsultation
    ) {
      toast.error(
        "Informations de consultation invalides.",
      );

      return;
    }

    if (!examenImagerieId) {
      toast.error(
        "Veuillez sélectionner un examen d'imagerie.",
      );

      return;
    }

    setLoading(true);

    try {
      const result =
        await createDemandeImagerie({
          patientId:
            consultation.patientId,

          consultationId:
            consultation.idConsultation,

          serviceId:
            consultation.serviceId ??
            null,

          examenId:
            Number(examenImagerieId),

          motif:
            motifImagerie.trim() ||
            null,

          urgence:
            urgenceImagerie,
        });

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible de créer la demande d'imagerie.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Demande d'imagerie créée avec succès.",
      );

      closeModal();

      router.refresh();
    } catch (error) {
      console.error(
        "handleCreateDemandeImagerie:",
        error,
      );

      toast.error(
        "Impossible de créer la demande d'imagerie.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     PROTECTION
  ======================================================== */

  if (!consultation) {
    return (
      <div className="rounded-xl border border-base-200 bg-base-100 p-8 text-center">
        <p className="text-base-content/60">
          Consultation introuvable.
        </p>
      </div>
    );
  }

  const patient =
    consultation.patient;

  const medecin =
    consultation.medecin;

  /* ========================================================
     OPTIONS MÉDICAMENTS
  ======================================================== */

  const medicamentOptions =
    medicaments.map((m: any) => ({
      value: String(m.id),

      label:
        `${m.code ? `${m.code} — ` : ""}` +
        `${m.nom}` +
        `${m.forme ? ` — ${m.forme}` : ""}` +
        `${m.dosage ? ` — ${m.dosage}` : ""}`,
    }));

  /* ========================================================
     OPTIONS LABORATOIRE
  ======================================================== */

  const laboratoireOptions =
    examensLaboratoire.map(
      (e: any) => ({
        value: Number(e.id),

        label:
          `${e.code ? `${e.code} — ` : ""}` +
          `${e.nom}` +
          `${
            e.prix != null
              ? ` — ${e.prix}`
              : ""
          }`,
      }),
    );

  /* ========================================================
     OPTIONS IMAGERIE
  ======================================================== */

  const imagerieOptions =
    examensImagerie.map(
      (e: any) => ({
        value: String(e.id),

        label:
          `${e.code ? `${e.code} — ` : ""}` +
          `${e.nom}`,
      }),
    );

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <>
      <div className="space-y-6">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Stethoscope size={24} />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Consultation #
                {
                  consultation.idConsultation
                }
              </h1>

              <p className="text-sm text-base-content/60">
                Fiche complète de la consultation
              </p>

            </div>

          </div>

          <div className="badge badge-primary badge-lg">
            Consultation
          </div>

        </div>

        {/* ==================================================
            PATIENT / MÉDECIN
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* PATIENT */}

          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <UserRound size={20} />
                </div>

                <h2 className="font-semibold">
                  Patient
                </h2>

              </div>

              <div className="text-lg font-semibold">
                {patient?.nom ?? "—"}{" "}
                {patient?.postNom ?? ""}{" "}
                {patient?.prenom ?? ""}
              </div>

              <div className="text-sm text-base-content/60">
                Dossier :{" "}
                {
                  patient?.numeroDossier ??
                  "—"
                }
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

                <div>

                  <span className="text-base-content/50">
                    Sexe
                  </span>

                  <p className="font-medium">
                    {patient?.sexe ?? "—"}
                  </p>

                </div>

                <div>

                  <span className="text-base-content/50">
                    Téléphone
                  </span>

                  <p className="font-medium">
                    {
                      patient?.telephone ??
                      "—"
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* MÉDECIN */}

          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                  <Stethoscope size={20} />
                </div>

                <h2 className="font-semibold">
                  Médecin
                </h2>

              </div>

              <div className="text-lg font-semibold">
                Dr {medecin?.nom ?? "—"}{" "}
                {medecin?.postNom ?? ""}{" "}
                {medecin?.prenom ?? ""}
              </div>

              <div className="text-sm text-base-content/60">
                {
                  medecin?.specialite
                    ?.nom ?? "Médecin"
                }
              </div>

              <div className="mt-3 text-sm">

                Service :{" "}

                <span className="font-medium">
                  {
                    medecin?.service
                      ?.nom ?? "—"
                  }
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="tabs tabs-boxed flex-wrap bg-base-200 p-1">

          <TabButton
            active={
              activeTab === "general"
            }
            onClick={() =>
              setActiveTab("general")
            }
            icon={
              <ClipboardList size={16} />
            }
            label="Consultation"
          />

          <TabButton
            active={
              activeTab === "constantes"
            }
            onClick={() =>
              setActiveTab("constantes")
            }
            icon={
              <Activity size={16} />
            }
            label="Constantes"
          />

          <TabButton
            active={
              activeTab === "prescription"
            }
            onClick={() =>
              setActiveTab("prescription")
            }
            icon={
              <Pill size={16} />
            }
            label="Prescription"
          />

          <TabButton
            active={
              activeTab === "laboratoire"
            }
            onClick={() =>
              setActiveTab("laboratoire")
            }
            icon={
              <FlaskConical size={16} />
            }
            label="Laboratoire"
          />

          <TabButton
            active={
              activeTab === "imagerie"
            }
            onClick={() =>
              setActiveTab("imagerie")
            }
            icon={
              <ScanLine size={16} />
            }
            label="Imagerie"
          />

        </div>

        {/* ==================================================
            CONSULTATION
        ================================================== */}

        {activeTab === "general" && (
          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="card-title">
                    Informations de la consultation
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Informations médicales saisies pendant la consultation.
                  </p>

                </div>

                <ClipboardList
                  size={24}
                  className="text-primary"
                />

              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-base-content/60">

                <CalendarDays size={16} />

                {consultation.dateConsultation
                  ? new Date(
                      consultation.dateConsultation,
                    ).toLocaleString(
                      "fr-FR",
                    )
                  : "—"}

              </div>

              <div className="divider" />

              <div className="space-y-3">

                <InfoBlock
                  title="Motif"
                  value={
                    consultation.motif
                  }
                />

                <InfoBlock
                  title="Diagnostic"
                  value={
                    consultation.diagnostic
                  }
                />

                <InfoBlock
                  title="Observation"
                  value={
                    consultation.observation
                  }
                />

                <InfoBlock
                  title="Conclusion"
                  value={
                    consultation.conclusion
                  }
                />

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            CONSTANTES
        ================================================== */}

        {activeTab === "constantes" && (
          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <Activity size={21} />
                }
                title="Constantes"
                description="Mesures physiologiques du patient."
                button="Ajouter les constantes"
                onClick={() =>
                  setModal("constante")
                }
              />

              {consultation.constantes?.length >
              0 ? (
                <div className="mt-5 overflow-x-auto">

                  <table className="table">

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

                      {consultation.constantes.map(
                        (constante: any) => (
                          <tr
                            key={
                              constante.id
                            }
                          >

                            <td>
                              {
                                constante.dateMesure
                                  ? new Date(
                                      constante.dateMesure,
                                    ).toLocaleString(
                                      "fr-FR",
                                    )
                                  : "—"
                              }
                            </td>

                            <td>
                              {
                                constante.temperature ??
                                "—"
                              }

                              {constante.temperature !=
                                null &&
                                " °C"}
                            </td>

                            <td>
                              {
                                constante.tensionSystolique ??
                                "—"
                              }
                              /
                              {
                                constante.tensionDiastolique ??
                                "—"
                              }{" "}
                              mmHg
                            </td>

                            <td>
                              {
                                constante.pouls ??
                                "—"
                              }{" "}
                              bpm
                            </td>

                            <td>
                              {
                                constante.saturation ??
                                "—"
                              }
                              %
                            </td>

                            <td>
                              {
                                constante.poids ??
                                "—"
                              }{" "}
                              kg
                            </td>

                            <td>
                              {
                                constante.taille ??
                                "—"
                              }{" "}
                              cm
                            </td>

                            <td>
                              {
                                constante.frequenceRespiratoire ??
                                "—"
                              }{" "}
                              /min
                            </td>

                            <td>
                              {
                                constante.glycemie ??
                                "—"
                              }{" "}
                              mg/dL
                            </td>

                          </tr>
                        ),
                      )}

                    </tbody>

                  </table>

                </div>
              ) : (
                <EmptyState
                  icon={
                    <Activity size={30} />
                  }
                  title="Aucune constante"
                  description="Aucune constante n'a encore été enregistrée pour cette consultation."
                  button="Ajouter les constantes"
                  onClick={() =>
                    setModal("constante")
                  }
                />
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            PRESCRIPTION
        ================================================== */}

        {activeTab === "prescription" && (
          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <Pill size={21} />
                }
                title="Prescriptions"
                description="Prescriptions médicales de cette consultation."
                button="Nouvelle prescription"
                onClick={() =>
                  setModal("prescription")
                }
              />

              {consultation.prescriptions?.length >
              0 ? (
                <div className="mt-5 space-y-4">

                  {consultation.prescriptions.map(
                    (prescription: any) => (
                      <div
                        key={
                          prescription.id
                        }
                        className="rounded-xl border border-base-200 p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <div className="font-semibold">
                              {
                                prescription.numero ??
                                "Prescription"
                              }
                            </div>

                            <div className="text-sm text-base-content/50">
                              {
                                prescription.datePrescription
                                  ? new Date(
                                      prescription.datePrescription,
                                    ).toLocaleString(
                                      "fr-FR",
                                    )
                                  : "—"
                              }
                            </div>

                          </div>

                          <span className="badge badge-outline">
                            {
                              prescription.statut ??
                              "ACTIVE"
                            }
                          </span>

                        </div>

                        <div className="mt-4 space-y-3">

                          {prescription.lignes?.map(
                            (
                              ligne: any,
                              ligneIndex: number,
                            ) => (
                              <div
                                key={
                                  ligne.id
                                }
                                className="rounded-lg border border-base-200 bg-base-200/40 p-4"
                              >

                                <div className="flex items-start gap-3">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Pill
                                      size={18}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <div className="flex flex-wrap items-center gap-2">

                                      <span className="font-semibold">
                                        {
                                          ligne
                                            .medicament
                                            ?.nom ??
                                          "Médicament"
                                        }
                                      </span>

                                      {ligne
                                        .medicament
                                        ?.code && (
                                        <span className="badge badge-sm badge-outline">
                                          {
                                            ligne
                                              .medicament
                                              .code
                                          }
                                        </span>
                                      )}

                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">

                                      {ligne.dose && (
                                        <span>
                                          <strong>
                                            Dose :
                                          </strong>{" "}
                                          {
                                            ligne.dose
                                          }
                                        </span>
                                      )}

                                      {ligne.frequence && (
                                        <span>
                                          {
                                            ligne.frequence
                                          }
                                        </span>
                                      )}

                                      {ligne.duree && (
                                        <span>
                                          {
                                            ligne.duree
                                          }
                                        </span>
                                      )}

                                      {ligne.voie && (
                                        <span>
                                          {
                                            ligne.voie
                                          }
                                        </span>
                                      )}

                                    </div>

                                    {ligne.posologie && (
                                      <div className="mt-3 rounded-lg bg-base-100 p-3">

                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                          Posologie
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-sm">
                                          {
                                            ligne.posologie
                                          }
                                        </p>

                                      </div>
                                    )}

                                    {ligne.quantite !=
                                      null && (
                                      <div className="mt-2 text-xs text-base-content/50">
                                        Quantité :{" "}
                                        {
                                          ligne.quantite
                                        }
                                      </div>
                                    )}

                                    {ligne.observation && (
                                      <div className="mt-3 rounded-lg border border-base-200 bg-base-100 p-3">

                                        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                          Observation
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-sm">
                                          {
                                            ligne.observation
                                          }
                                        </p>

                                      </div>
                                    )}

                                  </div>

                                </div>

                              </div>
                            ),
                          )}

                        </div>

                      </div>
                    ),
                  )}

                </div>
              ) : (
                <EmptyState
                  icon={
                    <Pill size={30} />
                  }
                  title="Aucune prescription"
                  description="Aucune prescription n'a encore été créée pour cette consultation."
                  button="Créer une prescription"
                  onClick={() =>
                    setModal(
                      "prescription",
                    )
                  }
                />
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            LABORATOIRE
        ================================================== */}

        {activeTab === "laboratoire" && (
          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <FlaskConical size={21} />
                }
                title="Laboratoire"
                description="Demandes d'examens et résultats de laboratoire."
                button="Demander des examens"
                onClick={() =>
                  setModal("laboratoire")
                }
              />

              {consultation.demandesLabo?.length >
              0 ? (
                <div className="mt-5 space-y-4">

                  {consultation.demandesLabo.map(
                    (demande: any) => (
                      <div
                        key={demande.id}
                        className="rounded-xl border border-base-200 p-4"
                      >

                        <div className="flex justify-between gap-3">

                          <div>

                            <div className="font-semibold">
                              {
                                demande.numero ??
                                "Demande laboratoire"
                              }
                            </div>

                            <div className="text-sm text-base-content/50">
                              {
                                demande.service
                                  ?.nom ??
                                "Laboratoire"
                              }
                            </div>

                          </div>

                          <span className="badge">
                            {
                              demande.statut ??
                              "EN_ATTENTE"
                            }
                          </span>

                        </div>

                        <div className="mt-4 space-y-2">

                          {demande.lignes?.map(
                            (ligne: any) => (
                              <div
                                key={
                                  ligne.id
                                }
                                className="flex justify-between gap-4 border-b border-base-200 pb-2"
                              >

                                <div>

                                  <span className="font-medium">
                                    {
                                      ligne
                                        .examen
                                        ?.nom ??
                                      "Examen"
                                    }
                                  </span>

                                  {ligne.examen
                                    ?.code && (
                                    <div className="text-xs text-base-content/50">
                                      {
                                        ligne
                                          .examen
                                          .code
                                      }
                                    </div>
                                  )}

                                </div>

                                <span className="text-sm text-base-content/60">
                                  {
                                    ligne.prix ??
                                    "—"
                                  }
                                </span>

                              </div>
                            ),
                          )}

                        </div>

                        {/* RÉSULTATS */}

                        {demande.resultats?.length >
                          0 && (
                          <div className="mt-5 overflow-hidden rounded-xl border border-success/30 bg-success/5">

                            <div className="flex flex-col gap-3 border-b border-success/20 p-4 md:flex-row md:items-center md:justify-between">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                                  <CheckCircle2 size={21} />
                                </div>

                                <div>

                                  <h4 className="font-semibold">
                                    Résultats de laboratoire
                                  </h4>

                                  <p className="text-xs text-base-content/60">
                                    Résultats transmis par le laboratoire
                                  </p>

                                </div>

                              </div>

                              <span className="badge badge-success gap-1">

                                <CheckCircle2
                                  size={14}
                                />

                                {
                                  demande
                                    .resultats
                                    .length
                                }{" "}
                                résultat(s)

                              </span>

                            </div>

                            <div className="divide-y divide-base-200">

                              {demande.resultats.map(
                                (resultat: any) => {

                                  const examen =
                                    resultat.examen ??
                                    resultat.ligne
                                      ?.examen ??
                                    null;

                                  return (
                                    <div
                                      key={
                                        resultat.id
                                      }
                                      className="p-4"
                                    >

                                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                                        <div>

                                          <div className="flex items-center gap-2">

                                            <FlaskConical
                                              size={18}
                                              className="text-primary"
                                            />

                                            <h5 className="font-semibold">
                                              {
                                                examen?.nom ??
                                                "Examen de laboratoire"
                                              }
                                            </h5>

                                          </div>

                                          {examen?.code && (
                                            <p className="mt-1 text-xs text-base-content/50">
                                              Code :{" "}
                                              {
                                                examen.code
                                              }
                                            </p>
                                          )}

                                        </div>

                                        <span
                                          className={`badge ${
                                            resultat.valide
                                              ? "badge-success"
                                              : "badge-warning"
                                          }`}
                                        >
                                          {resultat.valide
                                            ? "Validé"
                                            : "Non validé"}
                                        </span>

                                      </div>

                                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

                                        <div className="rounded-lg bg-base-200/50 p-3">

                                          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                            Résultat
                                          </p>

                                          <p className="mt-1 text-lg font-bold">

                                            {
                                              resultat.valeur ??
                                              "—"
                                            }

                                            {resultat.unite && (
                                              <span className="ml-2 text-sm font-normal text-base-content/60">
                                                {
                                                  resultat.unite
                                                }
                                              </span>
                                            )}

                                          </p>

                                        </div>

                                        <div className="rounded-lg bg-base-200/50 p-3">

                                          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                            Valeur normale
                                          </p>

                                          <p className="mt-1 font-medium">
                                            {
                                              examen?.valeurNormale ??
                                              "Non renseignée"
                                            }
                                          </p>

                                        </div>

                                      </div>

                                      {resultat.commentaire && (
                                        <div className="mt-3 rounded-lg border border-base-200 p-3">

                                          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                            Commentaire du laboratoire
                                          </p>

                                          <p className="mt-1 whitespace-pre-wrap text-sm">
                                            {
                                              resultat.commentaire
                                            }
                                          </p>

                                        </div>
                                      )}

                                      {resultat.interpretation && (
                                        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">

                                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                            Interprétation
                                          </p>

                                          <p className="mt-1 whitespace-pre-wrap text-sm">
                                            {
                                              resultat.interpretation
                                            }
                                          </p>

                                        </div>
                                      )}

                                      {resultat.dateResultat && (
                                        <p className="mt-3 text-xs text-base-content/50">
                                          Résultat enregistré le{" "}
                                          {new Date(
                                            resultat.dateResultat,
                                          ).toLocaleString(
                                            "fr-FR",
                                          )}
                                        </p>
                                      )}

                                    </div>
                                  );
                                },
                              )}

                            </div>

                          </div>
                        )}

                      </div>
                    ),
                  )}

                </div>
              ) : (
                <EmptyState
                  icon={
                    <FlaskConical
                      size={30}
                    />
                  }
                  title="Aucune demande de laboratoire"
                  description="Le médecin peut demander les examens nécessaires au patient."
                  button="Demander des examens"
                  onClick={() =>
                    setModal("laboratoire")
                  }
                />
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            IMAGERIE
        ================================================== */}

        {activeTab === "imagerie" && (
          <div className="card border border-base-200 bg-base-100 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <ScanLine size={21} />
                }
                title="Imagerie médicale"
                description="Demandes d'examens, comptes rendus et images médicales."
                button="Demander une imagerie"
                onClick={() =>
                  setModal("imagerie")
                }
              />

              {consultation.demandesImagerie?.length ? (
                <div className="mt-5 space-y-5">

                  {consultation.demandesImagerie.map(
                    (demande: any) => {

                      const terminee =
                        demande.statut ===
                          "TERMINEE" ||
                        demande.statut ===
                          "TERMINE" ||
                        demande.statut ===
                          "REALISE";

                      const fichier =
                        demande.fichier;

                      const fichierUrl =
                        fichier
                          ? getFileUrl(
                              fichier,
                            )
                          : "";

                      return (
                        <div
                          key={demande.id}
                          className="overflow-hidden rounded-xl border border-base-200"
                        >

                          {/* EN-TÊTE */}

                          <div className="bg-base-200/30 p-4">

                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                              <div>

                                <div className="flex items-center gap-2">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ScanLine
                                      size={20}
                                    />
                                  </div>

                                  <div>

                                    <h3 className="text-lg font-bold">
                                      {
                                        demande
                                          .examen
                                          ?.nom ??
                                        "Examen d'imagerie"
                                      }
                                    </h3>

                                    {demande.examen
                                      ?.code && (
                                      <p className="text-xs text-base-content/50">
                                        Code :{" "}
                                        {
                                          demande
                                            .examen
                                            .code
                                        }
                                      </p>
                                    )}

                                  </div>

                                </div>

                                <div className="mt-3 text-sm text-base-content/60">

                                  <span>
                                    Demande :{" "}
                                    {
                                      demande.numero ??
                                      "—"
                                    }
                                  </span>

                                  {demande.dateDemande && (
                                    <>
                                      {" • "}
                                      {new Date(
                                        demande.dateDemande,
                                      ).toLocaleString(
                                        "fr-FR",
                                      )}
                                    </>
                                  )}

                                </div>

                              </div>

                              <div>

                                <span
                                  className={`badge badge-lg ${
                                    terminee
                                      ? "badge-success"
                                      : demande.statut ===
                                          "EN_COURS"
                                        ? "badge-warning"
                                        : "badge-info"
                                  }`}
                                >
                                  {terminee
                                    ? "Terminée"
                                    : demande.statut ===
                                        "EN_COURS"
                                      ? "En cours"
                                      : demande.statut ??
                                        "Demandée"}
                                </span>

                              </div>

                            </div>

                          </div>

                          {/* INFORMATIONS */}

                          <div className="space-y-4 p-4">

                            {/* MOTIF */}

                            {demande.motif && (
                              <div className="rounded-lg border border-base-200 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                  Indication médicale
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                  {
                                    demande.motif
                                  }
                                </p>

                              </div>
                            )}

                            {/* RÉSULTAT */}

                            {(demande.compteRendu ||
                              demande.conclusion ||
                              demande.fichier ||
                              demande.dateExamen) && (
                              <div className="overflow-hidden rounded-xl border border-success/30 bg-success/5">

                                <div className="flex flex-col gap-3 border-b border-success/20 p-4 md:flex-row md:items-center md:justify-between">

                                  <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                                      <CheckCircle2
                                        size={21}
                                      />
                                    </div>

                                    <div>

                                      <h4 className="font-semibold">
                                        Résultat de l'imagerie
                                      </h4>

                                      <p className="text-xs text-base-content/60">
                                        Résultat transmis par le service d'imagerie
                                      </p>

                                    </div>

                                  </div>

                                  {demande.dateExamen && (
                                    <span className="text-xs text-base-content/50">
                                      Examen réalisé le{" "}
                                      {new Date(
                                        demande.dateExamen,
                                      ).toLocaleString(
                                        "fr-FR",
                                      )}
                                    </span>
                                  )}

                                </div>

                                <div className="space-y-4 p-4">

                                  {/* COMPTE RENDU */}

                                  {demande.compteRendu && (
                                    <div className="rounded-lg border border-base-200 bg-base-100 p-4">

                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                                        Compte rendu
                                      </p>

                                      <p className="whitespace-pre-wrap text-sm leading-6">
                                        {
                                          demande.compteRendu
                                        }
                                      </p>

                                    </div>
                                  )}

                                  {/* CONCLUSION */}

                                  {demande.conclusion && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">

                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                                        Conclusion
                                      </p>

                                      <p className="whitespace-pre-wrap text-sm font-medium leading-6">
                                        {
                                          demande.conclusion
                                        }
                                      </p>

                                    </div>
                                  )}

                                  {/* IMAGE / FICHIER */}

                                  {fichier && (
                                    <div className="overflow-hidden rounded-xl border border-base-200 bg-base-100">

                                      <div className="border-b border-base-200 p-4">

                                        <div className="flex items-center gap-2">

                                          <ScanLine
                                            size={18}
                                            className="text-primary"
                                          />

                                          <h4 className="font-semibold">
                                            Image / fichier médical
                                          </h4>

                                        </div>

                                      </div>

                                      <div className="p-4">

                                        {isImageFile(
                                          fichier,
                                        ) ? (
                                          <div className="space-y-3">

                                            <div className="overflow-hidden rounded-xl border border-base-200 bg-black/5">

                                              <img
                                                src={
                                                  fichierUrl
                                                }
                                                alt={
                                                  demande
                                                    .examen
                                                    ?.nom ??
                                                  "Image médicale"
                                                }
                                                className="max-h-[600px] w-full object-contain"
                                                loading="lazy"
                                              />

                                            </div>

                                            <div className="flex flex-wrap justify-end gap-2">

                                              <a
                                                href={
                                                  fichierUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline btn-sm"
                                              >

                                                <ScanLine
                                                  size={
                                                    16
                                                  }
                                                />

                                                Ouvrir l'image

                                              </a>

                                            </div>

                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-4 rounded-lg bg-base-200/50 p-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div className="min-w-0">

                                              <p className="font-medium">
                                                Fichier du résultat
                                              </p>

                                              <p className="mt-1 break-all text-xs text-base-content/50">
                                                {String(
                                                  fichier,
                                                )}
                                              </p>

                                            </div>

                                            <a
                                              href={
                                                fichierUrl
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-primary btn-sm shrink-0"
                                            >
                                              Ouvrir
                                            </a>

                                          </div>
                                        )}

                                      </div>

                                    </div>
                                  )}

                                </div>

                              </div>
                            )}

                            {/* PAS DE RÉSULTAT */}

                            {!demande.compteRendu &&
                              !demande.conclusion &&
                              !demande.fichier && (
                                <div className="rounded-xl border border-dashed border-base-300 p-6 text-center">

                                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">

                                    <ScanLine
                                      size={25}
                                    />

                                  </div>

                                  <h4 className="mt-3 font-semibold">
                                    Résultat non disponible
                                  </h4>

                                  <p className="mt-1 text-sm text-base-content/50">
                                    Le service d'imagerie n'a pas encore transmis le résultat de cet examen.
                                  </p>

                                </div>
                              )}

                          </div>

                        </div>
                      );
                    },
                  )}

                </div>
              ) : (
                <EmptyState
                  icon={
                    <ScanLine size={30} />
                  }
                  title="Aucune demande d'imagerie"
                  description="Le médecin peut demander une radiographie, échographie, scanner, IRM, etc."
                  button="Demander une imagerie"
                  onClick={() =>
                    setModal("imagerie")
                  }
                />
              )}

            </div>

          </div>
        )}

      </div>

      {/* ====================================================
          MODALE CONSTANTES
      ==================================================== */}

      {modal === "constante" && (
        <Modal
          title="Ajouter les constantes"
          description="Enregistrer les constantes vitales du patient."
          icon={
            <Activity size={22} />
          }
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreateConstante
            }
            className="space-y-5"
          >

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <InputField
                label="Température"
                unit="°C"
                icon={
                  <Thermometer
                    size={17}
                  />
                }
                value={temperature}
                onChange={
                  setTemperature
                }
                type="number"
                step="0.1"
              />

              <InputField
                label="Pouls"
                unit="bpm"
                icon={
                  <HeartPulse
                    size={17}
                  />
                }
                value={pouls}
                onChange={setPouls}
                type="number"
              />

              <InputField
                label="Tension systolique"
                unit="mmHg"
                value={
                  tensionSystolique
                }
                onChange={
                  setTensionSystolique
                }
                type="number"
              />

              <InputField
                label="Tension diastolique"
                unit="mmHg"
                value={
                  tensionDiastolique
                }
                onChange={
                  setTensionDiastolique
                }
                type="number"
              />

              <InputField
                label="Saturation O₂"
                unit="%"
                icon={
                  <Droplets
                    size={17}
                  />
                }
                value={saturation}
                onChange={
                  setSaturation
                }
                type="number"
                step="0.1"
              />

              <InputField
                label="Fréquence respiratoire"
                unit="/min"
                icon={
                  <Wind size={17} />
                }
                value={
                  frequenceRespiratoire
                }
                onChange={
                  setFrequenceRespiratoire
                }
                type="number"
              />

              <InputField
                label="Poids"
                unit="kg"
                icon={
                  <Scale size={17}
                  />
                }
                value={poids}
                onChange={setPoids}
                type="number"
                step="0.1"
              />

              <InputField
                label="Taille"
                unit="cm"
                icon={
                  <Ruler size={17} />
                }
                value={taille}
                onChange={setTaille}
                type="number"
                step="0.1"
              />

              <InputField
                label="Glycémie"
                unit="mg/dL"
                value={glycemie}
                onChange={
                  setGlycemie
                }
                type="number"
                step="0.1"
              />

            </div>

            <ModalActions
              loading={loading}
              submitLabel="Enregistrer les constantes"
              onCancel={closeModal}
            />

          </form>

        </Modal>
      )}

      {/* ====================================================
          MODALE PRESCRIPTION
          UNE PRESCRIPTION = PLUSIEURS MÉDICAMENTS
      ==================================================== */}

      {modal === "prescription" && (
        <Modal
          title="Nouvelle prescription"
          description="Ajoutez un ou plusieurs médicaments dans la même prescription."
          icon={
            <Pill size={22} />
          }
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreatePrescription
            }
            className="space-y-6"
          >

            {/* ==================================================
                INFORMATION
            ================================================== */}

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 text-primary">
                  <ClipboardList size={20} />
                </div>

                <div>

                  <p className="font-semibold">
                    Prescription médicale
                  </p>

                  <p className="mt-1 text-sm text-base-content/60">
                    Une seule prescription peut contenir plusieurs médicaments.
                    Ajoutez autant de médicaments que nécessaire.
                  </p>

                </div>

              </div>

            </div>

            {/* ==================================================
                MÉDICAMENTS
            ================================================== */}

            <div className="space-y-5">

              {prescriptionLines.map(
                (line, index) => {

                  const selectedMedicament =
                    medicamentOptions.find(
                      (option) =>
                        option.value ===
                        line.medicamentId,
                    ) ?? null;

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm"
                    >

                      {/* EN-TÊTE */}

                      <div className="mb-4 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Pill size={17} />
                          </div>

                          <h3 className="font-semibold">
                            Médicament{" "}
                            {index + 1}
                          </h3>

                        </div>

                        {prescriptionLines.length >
                          1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() =>
                              removePrescriptionLine(
                                index,
                              )
                            }
                            disabled={loading}
                          >

                            <X size={16} />

                            Retirer

                          </button>
                        )}

                      </div>

                      {/* MÉDICAMENT */}

                      <div className="form-control">

                        <label className="label">

                          <span className="label-text font-semibold">
                            Médicament *
                          </span>

                        </label>

                        <Select
                          options={
                            medicamentOptions
                          }

                          value={
                            selectedMedicament
                          }

                          onChange={(
                            option: any,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "medicamentId",
                              option?.value ??
                                "",
                            )
                          }

                          placeholder="Rechercher un médicament..."

                          isSearchable

                          isClearable

                          isDisabled={
                            loading
                          }

                          noOptionsMessage={() =>
                            "Aucun médicament trouvé"
                          }

                          classNamePrefix="react-select"

                          menuPortalTarget={
                            typeof document !==
                            "undefined"
                              ? document.body
                              : undefined
                          }

                          styles={{
                            menuPortal: (
                              base,
                            ) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />

                      </div>

                      {/* INFORMATIONS */}

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                        <InputField
                          label="Dose"
                          value={
                            line.dose
                          }
                          onChange={(
                            value,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "dose",
                              value,
                            )
                          }
                          placeholder="Ex. 500 mg"
                        />

                        <InputField
                          label="Fréquence"
                          value={
                            line.frequence
                          }
                          onChange={(
                            value,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "frequence",
                              value,
                            )
                          }
                          placeholder="Ex. 3 fois/jour"
                        />

                        <InputField
                          label="Durée"
                          value={
                            line.duree
                          }
                          onChange={(
                            value,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "duree",
                              value,
                            )
                          }
                          placeholder="Ex. 5 jours"
                        />

                        <InputField
                          label="Voie d'administration"
                          value={
                            line.voie
                          }
                          onChange={(
                            value,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "voie",
                              value,
                            )
                          }
                          placeholder="Ex. Orale"
                        />

                        <InputField
                          label="Quantité"
                          value={
                            line.quantite
                          }
                          onChange={(
                            value,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "quantite",
                              value,
                            )
                          }
                          type="number"
                          placeholder="Ex. 15"
                        />

                      </div>

                      {/* POSOLOGIE */}

                      <div className="mt-4 form-control">

                        <label className="label">

                          <span className="label-text font-semibold">
                            Posologie
                          </span>

                        </label>

                        <textarea
                          className="textarea textarea-bordered min-h-24"
                          placeholder="Instructions de prise du médicament..."
                          value={
                            line.posologie
                          }
                          onChange={(
                            event,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "posologie",
                              event.target
                                .value,
                            )
                          }
                          disabled={loading}
                        />

                      </div>

                      {/* OBSERVATION */}

                      <div className="mt-4 form-control">

                        <label className="label">

                          <span className="label-text font-semibold">
                            Observation
                          </span>

                        </label>

                        <textarea
                          className="textarea textarea-bordered min-h-20"
                          placeholder="Informations complémentaires..."
                          value={
                            line.observation
                          }
                          onChange={(
                            event,
                          ) =>
                            updatePrescriptionLine(
                              index,
                              "observation",
                              event.target
                                .value,
                            )
                          }
                          disabled={loading}
                        />

                      </div>

                    </div>
                  );
                },
              )}

            </div>

            {/* ==================================================
                AJOUTER UN MÉDICAMENT
            ================================================== */}

            <button
              type="button"
              className="btn btn-outline btn-primary w-full"
              onClick={
                addPrescriptionLine
              }
              disabled={loading}
            >

              <Plus size={18} />

              Ajouter un autre médicament

            </button>

            {/* ==================================================
                RÉSUMÉ
            ================================================== */}

            <div className="rounded-xl bg-base-200/60 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-base-content/60">
                  Nombre de médicaments
                </span>

                <span className="badge badge-primary">

                  {
                    prescriptionLines.filter(
                      (line) =>
                        line.medicamentId,
                    ).length
                  }

                </span>

              </div>

            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <ModalActions
              loading={loading}
              submitLabel="Enregistrer la prescription"
              onCancel={closeModal}
            />

          </form>

        </Modal>
      )}

      {/* ====================================================
          MODALE LABORATOIRE
      ==================================================== */}

      {modal === "laboratoire" && (
        <Modal
          title="Demander des examens"
          description="Sélectionnez les examens nécessaires au patient."
          icon={
            <FlaskConical size={22} />
          }
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreateDemandeLaboratoire
            }
            className="space-y-5"
          >

            <div>

              <label className="label">

                <span className="label-text font-semibold">
                  Examens *
                </span>

              </label>

              <Select
                isMulti
                options={
                  laboratoireOptions
                }
                value={laboratoireOptions.filter(
                  (option) =>
                    examensSelectionnes.includes(
                      Number(
                        option.value,
                      ),
                    ),
                )}
                onChange={(
                  options: any[],
                ) =>
                  setExamensSelectionnes(
                    (options ?? []).map(
                      (option: any) =>
                        Number(
                          option.value,
                        ),
                    ),
                  )
                }
                placeholder="Rechercher et sélectionner les examens..."
                isSearchable
                closeMenuOnSelect={false}
                isDisabled={
                  loading ||
                  examensLaboratoire.length ===
                    0
                }
                noOptionsMessage={() =>
                  "Aucun examen trouvé"
                }
                classNamePrefix="react-select"
                menuPortalTarget={
                  typeof document !==
                  "undefined"
                    ? document.body
                    : undefined
                }
                styles={{
                  menuPortal: (
                    base,
                  ) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

              <p className="mt-2 text-xs text-base-content/50">

                {
                  examensSelectionnes.length
                }{" "}
                examen(s) sélectionné(s)

              </p>

            </div>

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={
                  urgenceLabo
                }
                onChange={(
                  event,
                ) =>
                  setUrgenceLabo(
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <div>

                <p className="font-medium">
                  Demande urgente
                </p>

                <p className="text-xs text-base-content/50">
                  Traitement prioritaire par le laboratoire.
                </p>

              </div>

            </label>

            <div className="form-control">

              <label className="label">

                <span className="label-text font-semibold">
                  Indication / observation
                </span>

              </label>

              <textarea
                className="textarea textarea-bordered min-h-24"
                placeholder="Indication médicale pour les examens..."
                value={
                  observationLabo
                }
                onChange={(event) =>
                  setObservationLabo(
                    event.target.value,
                  )
                }
                disabled={loading}
              />

            </div>

            <ModalActions
              loading={loading}
              submitLabel="Envoyer la demande"
              onCancel={closeModal}
            />

          </form>

        </Modal>
      )}

      {/* ====================================================
          MODALE IMAGERIE
      ==================================================== */}

      {modal === "imagerie" && (
        <Modal
          title="Demander une imagerie"
          description="Sélectionnez l'examen d'imagerie nécessaire."
          icon={
            <ScanLine size={22} />
          }
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreateDemandeImagerie
            }
            className="space-y-5"
          >

            <div className="form-control">

              <label className="label">

                <span className="label-text font-semibold">
                  Examen *
                </span>

              </label>

              <Select
                options={
                  imagerieOptions
                }

                value={
                  imagerieOptions.find(
                    (option) =>
                      option.value ===
                      examenImagerieId,
                  ) ?? null
                }

                onChange={(
                  option: any,
                ) =>
                  setExamenImagerieId(
                    option?.value ??
                      "",
                  )
                }

                placeholder="Rechercher un examen d'imagerie..."

                isSearchable

                isClearable

                isDisabled={loading}

                noOptionsMessage={() =>
                  "Aucun examen trouvé"
                }

                classNamePrefix="react-select"

                menuPortalTarget={
                  typeof document !==
                  "undefined"
                    ? document.body
                    : undefined
                }

                styles={{
                  menuPortal: (
                    base,
                  ) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

            </div>

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={
                  urgenceImagerie
                }
                onChange={(
                  event,
                ) =>
                  setUrgenceImagerie(
                    event.target.checked,
                  )
                }
                disabled={loading}
              />

              <div>

                <p className="font-medium">
                  Examen urgent
                </p>

                <p className="text-xs text-base-content/50">
                  Priorité élevée pour le service d'imagerie.
                </p>

              </div>

            </label>

            <div className="form-control">

              <label className="label">

                <span className="label-text font-semibold">
                  Indication médicale
                </span>

              </label>

              <textarea
                className="textarea textarea-bordered min-h-28"
                placeholder="Décrivez l'indication de l'examen..."
                value={
                  motifImagerie
                }
                onChange={(event) =>
                  setMotifImagerie(
                    event.target.value,
                  )
                }
                disabled={loading}
              />

            </div>

            <ModalActions
              loading={loading}
              submitLabel="Envoyer la demande"
              onCancel={closeModal}
            />

          </form>

        </Modal>
      )}

    </>
  );
}

/* ==========================================================
   TAB BUTTON
========================================================== */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`tab ${
        active
          ? "tab-active"
          : ""
      }`}
      onClick={onClick}
    >

      <span className="mr-2">
        {icon}
      </span>

      {label}

    </button>
  );
}

/* ==========================================================
   HEADER ACTION
========================================================== */

function HeaderAction({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>

        <div>

          <h2 className="card-title">
            {title}
          </h2>

          <p className="text-sm text-base-content/60">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={onClick}
      >

        <Plus size={17} />

        {button}

      </button>

    </div>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyState({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-base-300 p-8 text-center">

      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/50">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-base-content/50">
        {description}
      </p>

      <button
        type="button"
        className="btn btn-primary btn-sm mt-4"
        onClick={onClick}
      >

        <Plus size={16} />

        {button}

      </button>

    </div>
  );
}

/* ==========================================================
   INFO BLOCK
========================================================== */

function InfoBlock({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-base-200 bg-base-200/40 p-4">

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {title}
      </p>

      <p className="whitespace-pre-wrap">
        {value || "—"}
      </p>

    </div>
  );
}

/* ==========================================================
   INPUT FIELD
========================================================== */

function InputField({
  label,
  value,
  onChange,
  unit,
  icon,
  type = "text",
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  unit?: string;
  icon?: ReactNode;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div className="form-control">

      <label className="label">

        <span className="label-text font-semibold">
          {label}
        </span>

      </label>

      <div className="relative">

        {icon && (
          <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/40">
            {icon}
          </div>
        )}

        <input
          type={type}
          step={step}
          className={`input input-bordered w-full ${
            icon
              ? "pl-10"
              : ""
          } ${
            unit
              ? "pr-16"
              : ""
          }`}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={
            placeholder
          }
        />

        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/50">
            {unit}
          </span>
        )}

      </div>

    </div>
  );
}

/* ==========================================================
   MODAL
========================================================== */

function Modal({
  title,
  description,
  icon,
  children,
  onClose,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
      onMouseDown={
        handleBackdropClick
      }
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-base-100 shadow-2xl">

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-200 bg-base-100 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>

            <div>

              <h2 className="text-lg font-bold">
                {title}
              </h2>

              <p className="text-sm text-base-content/60">
                {description}
              </p>

            </div>

          </div>

          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-5">
          {children}
        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   MODAL ACTIONS
========================================================== */

function ModalActions({
  loading,
  submitLabel,
  onCancel,
}: {
  loading: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse justify-end gap-3 border-t border-base-200 pt-4 sm:flex-row">

      <button
        type="button"
        className="btn btn-ghost"
        onClick={onCancel}
        disabled={loading}
      >
        Annuler
      </button>

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

            {submitLabel}
          </>
        )}

      </button>

    </div>
  );
}