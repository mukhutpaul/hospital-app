"use client";

import { useState } from "react";

import {
  UserRound,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  Pill,
  FlaskConical,
  ScanLine,
  Activity,
  Plus,
  X,
  Save,
  Loader2,
  Thermometer,
  HeartPulse,
  Scale,
  Droplets,
  Wind,
  Ruler,
  CheckCircle2,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  createConstanteConsultation,
  createPrescription,
  createDemandeLaboratoire,
  createDemandeImagerie,
} from "@/app/actions/consultations";

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

export default function ConsultationDetails({
  consultation,
  medicaments,
  examensLaboratoire,
  examensImagerie,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("general");

  const [modal, setModal] =
    useState<ModalType>(null);

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     CONSTANTES
  ========================================================= */

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

  /* =========================================================
     PRESCRIPTION
  ========================================================= */

  const [medicamentId, setMedicamentId] =
    useState("");

  const [dose, setDose] =
    useState("");

  const [posologie, setPosologie] =
    useState("");

  const [frequence, setFrequence] =
    useState("");

  const [duree, setDuree] =
    useState("");

  const [voie, setVoie] =
    useState("");

  const [quantite, setQuantite] =
    useState("");

  const [observationPrescription, setObservationPrescription] =
    useState("");

  /* =========================================================
     LABORATOIRE
  ========================================================= */

  const [examensSelectionnes, setExamensSelectionnes] =
    useState<number[]>([]);

  const [urgenceLabo, setUrgenceLabo] =
    useState(false);

  const [observationLabo, setObservationLabo] =
    useState("");

  /* =========================================================
     IMAGERIE
  ========================================================= */

  const [examenImagerieId, setExamenImagerieId] =
    useState("");

  const [urgenceImagerie, setUrgenceImagerie] =
    useState(false);

  const [motifImagerie, setMotifImagerie] =
    useState("");

  /* =========================================================
     RESET
  ========================================================= */

  function closeModal() {
    if (loading) return;

    setModal(null);

    setTemperature("");
    setTensionSystolique("");
    setTensionDiastolique("");
    setPouls("");
    setSaturation("");
    setPoids("");
    setTaille("");
    setFrequenceRespiratoire("");
    setGlycemie("");

    setMedicamentId("");
    setDose("");
    setPosologie("");
    setFrequence("");
    setDuree("");
    setVoie("");
    setQuantite("");
    setObservationPrescription("");

    setExamensSelectionnes([]);
    setUrgenceLabo(false);
    setObservationLabo("");

    setExamenImagerieId("");
    setUrgenceImagerie(false);
    setMotifImagerie("");
  }

  /* =========================================================
     AJOUT CONSTANTES
  ========================================================= */

  async function handleCreateConstante(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const result =
        await createConstanteConsultation({
          patientId: consultation.patientId,
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
              ? Number(
                  frequenceRespiratoire,
                )
              : null,

          glycemie: glycemie
            ? Number(glycemie)
            : null,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      closeModal();

      window.location.reload();
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

  /* =========================================================
     CRÉER PRESCRIPTION
  ========================================================= */

  async function handleCreatePrescription(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!medicamentId) {
      toast.error(
        "Veuillez sélectionner un médicament.",
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await createPrescription({
          patientId:
            consultation.patientId,

          consultationId:
            consultation.idConsultation,

          medecinId:
            consultation.medecinId,

          lignes: [
            {
              medicamentId:
                Number(medicamentId),

              dose:
                dose || null,

              posologie:
                posologie || null,

              frequence:
                frequence || null,

              duree:
                duree || null,

              voie:
                voie || null,

              quantite:
                quantite
                  ? Number(quantite)
                  : null,

              observation:
                observationPrescription ||
                null,
            },
          ],
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      closeModal();

      window.location.reload();
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

  /* =========================================================
     DEMANDE LABORATOIRE
  ========================================================= */

  function toggleExamenLaboratoire(
    examenId: number,
  ) {
    setExamensSelectionnes((current) =>
      current.includes(examenId)
        ? current.filter(
            (id) => id !== examenId,
          )
        : [...current, examenId],
    );
  }

  async function handleCreateDemandeLaboratoire(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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
            observationLabo || null,

          examens:
            examensSelectionnes,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      closeModal();

      window.location.reload();
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

  /* =========================================================
     DEMANDE IMAGERIE
  ========================================================= */

  async function handleCreateDemandeImagerie(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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
            motifImagerie || null,

          urgence:
            urgenceImagerie,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      closeModal();

      window.location.reload();
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

  if (!consultation) {
    return null;
  }

  const patient =
    consultation.patient;

  const medecin =
    consultation.medecin;

  return (
    <>
      <div className="space-y-6">

        {/* =====================================================
            EN-TÊTE
        ===================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Stethoscope size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Consultation #
                {consultation.idConsultation}
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

        {/* =====================================================
            PATIENT / MÉDECIN
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* PATIENT */}

          <div className="card bg-base-100 border border-base-200 shadow-sm">

            <div className="card-body">

              <div className="flex items-center gap-3 mb-4">

                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserRound size={20} />
                </div>

                <h2 className="font-semibold">
                  Patient
                </h2>

              </div>

              <div className="text-lg font-semibold">
                {patient?.nom}{" "}
                {patient?.postNom ?? ""}{" "}
                {patient?.prenom ?? ""}
              </div>

              <div className="text-sm text-base-content/60">
                Dossier :{" "}
                {patient?.numeroDossier ?? "—"}
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
                    {patient?.telephone ?? "—"}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* MÉDECIN */}

          <div className="card bg-base-100 border border-base-200 shadow-sm">

            <div className="card-body">

              <div className="flex items-center gap-3 mb-4">

                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Stethoscope size={20} />
                </div>

                <h2 className="font-semibold">
                  Médecin
                </h2>

              </div>

              <div className="text-lg font-semibold">
                Dr{" "}
                {medecin?.nom}{" "}
                {medecin?.postNom ?? ""}{" "}
                {medecin?.prenom ?? ""}
              </div>

              <div className="text-sm text-base-content/60">
                {medecin?.specialite?.nom ??
                  "Médecin"}
              </div>

              <div className="mt-3 text-sm">
                Service :{" "}
                <span className="font-medium">
                  {medecin?.service?.nom ??
                    "—"}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <div className="tabs tabs-boxed bg-base-200 p-1 flex-wrap">

          <TabButton
            active={activeTab === "general"}
            onClick={() =>
              setActiveTab("general")
            }
            icon={<ClipboardList size={16} />}
            label="Consultation"
          />

          <TabButton
            active={
              activeTab === "constantes"
            }
            onClick={() =>
              setActiveTab("constantes")
            }
            icon={<Activity size={16} />}
            label="Constantes"
          />

          <TabButton
            active={
              activeTab === "prescription"
            }
            onClick={() =>
              setActiveTab("prescription")
            }
            icon={<Pill size={16} />}
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
            icon={<ScanLine size={16} />}
            label="Imagerie"
          />

        </div>

        {/* =====================================================
            CONSULTATION
        ===================================================== */}

        {activeTab === "general" && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">

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

              <div className="flex items-center gap-2 text-sm text-base-content/60 mt-3">
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

              <InfoBlock
                title="Motif"
                value={consultation.motif}
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
        )}

        {/* =====================================================
            CONSTANTES
        ===================================================== */}

        {activeTab === "constantes" && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">

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

              {consultation.constantes?.length ? (
                <div className="overflow-x-auto mt-5">

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
                              {new Date(
                                constante.dateMesure,
                              ).toLocaleString(
                                "fr-FR",
                              )}
                            </td>

                            <td>
                              {constante.temperature ??
                                "—"}
                              {constante.temperature !=
                                null && " °C"}
                            </td>

                            <td>
                              {constante.tensionSystolique ??
                                "—"}
                              /
                              {constante.tensionDiastolique ??
                                "—"}{" "}
                              mmHg
                            </td>

                            <td>
                              {constante.pouls ??
                                "—"}{" "}
                              bpm
                            </td>

                            <td>
                              {constante.saturation ??
                                "—"}
                              %
                            </td>

                            <td>
                              {constante.poids ??
                                "—"}{" "}
                              kg
                            </td>

                            <td>
                              {constante.taille ??
                                "—"}{" "}
                              cm
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

        {/* =====================================================
            PRESCRIPTION
        ===================================================== */}

        {activeTab === "prescription" && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={<Pill size={21} />}
                title="Prescriptions"
                description="Prescriptions médicales de cette consultation."
                button="Nouvelle prescription"
                onClick={() =>
                  setModal("prescription")
                }
              />

              {consultation.prescriptions?.length ? (
                <div className="space-y-4 mt-5">

                  {consultation.prescriptions.map(
                    (prescription: any) => (
                      <div
                        key={prescription.id}
                        className="border border-base-200 rounded-xl p-4"
                      >

                        <div className="flex justify-between items-start gap-3">

                          <div>
                            <div className="font-semibold">
                              {prescription.numero}
                            </div>

                            <div className="text-sm text-base-content/50">
                              {prescription.datePrescription
                                ? new Date(
                                    prescription.datePrescription,
                                  ).toLocaleString(
                                    "fr-FR",
                                  )
                                : ""}
                            </div>
                          </div>

                          <span className="badge badge-outline">
                            {prescription.statut ??
                              "ACTIVE"}
                          </span>

                        </div>

                        <div className="mt-4 space-y-2">

                          {prescription.lignes?.map(
                            (ligne: any) => (
                              <div
                                key={ligne.id}
                                className="rounded-lg bg-base-200/50 p-3"
                              >

                                <div className="font-medium">
                                  {ligne.medicament?.nom ??
                                    "Médicament"}
                                </div>

                                <div className="text-sm text-base-content/60 mt-1">
                                  {ligne.dose &&
                                    `Dose : ${ligne.dose}`}
                                  {ligne.frequence &&
                                    ` • ${ligne.frequence}`}
                                  {ligne.duree &&
                                    ` • ${ligne.duree}`}
                                  {ligne.voie &&
                                    ` • ${ligne.voie}`}
                                </div>

                                {ligne.posologie && (
                                  <div className="text-sm mt-1">
                                    {ligne.posologie}
                                  </div>
                                )}

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
                  icon={<Pill size={30} />}
                  title="Aucune prescription"
                  description="Aucune prescription n'a encore été créée pour cette consultation."
                  button="Créer une prescription"
                  onClick={() =>
                    setModal("prescription")
                  }
                />
              )}

            </div>

          </div>
        )}

        {/* =====================================================
            LABORATOIRE
        ===================================================== */}

        {activeTab === "laboratoire" && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <FlaskConical
                    size={21}
                  />
                }
                title="Laboratoire"
                description="Demandes d'examens et résultats de laboratoire."
                button="Demander des examens"
                onClick={() =>
                  setModal("laboratoire")
                }
              />

              {consultation.demandesLabo?.length ? (
                <div className="space-y-4 mt-5">

                  {consultation.demandesLabo.map(
                    (demande: any) => (
                      <div
                        key={demande.id}
                        className="border border-base-200 rounded-xl p-4"
                      >

                        <div className="flex justify-between gap-3">

                          <div>
                            <div className="font-semibold">
                              {demande.numero}
                            </div>

                            <div className="text-sm text-base-content/50">
                              {demande.service?.nom ??
                                "Laboratoire"}
                            </div>
                          </div>

                          <span className="badge">
                            {demande.statut}
                          </span>

                        </div>

                        <div className="mt-4 space-y-2">

                          {demande.lignes?.map(
                            (ligne: any) => (
                              <div
                                key={ligne.id}
                                className="flex justify-between border-b border-base-200 pb-2"
                              >

                                <span>
                                  {ligne.examen?.nom ??
                                    "Examen"}
                                </span>

                                <span className="text-sm text-base-content/60">
                                  {ligne.prix ??
                                    "—"}
                                </span>

                              </div>
                            ),
                          )}

                        </div>

                        {demande.resultats?.length >
                          0 && (
                          <div className="mt-4 alert alert-success">

                            <CheckCircle2
                              size={20}
                            />

                            <div>
                              <strong>
                                Résultats disponibles
                              </strong>

                              <p className="text-sm">
                                {
                                  demande
                                    .resultats
                                    .length
                                }{" "}
                                résultat(s)
                                disponible(s).
                              </p>
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

        {/* =====================================================
            IMAGERIE
        ===================================================== */}

        {activeTab === "imagerie" && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">

            <div className="card-body">

              <HeaderAction
                icon={
                  <ScanLine size={21} />
                }
                title="Imagerie médicale"
                description="Demandes d'examens d'imagerie."
                button="Demander une imagerie"
                onClick={() =>
                  setModal("imagerie")
                }
              />

              {consultation.demandesImagerie?.length ? (
                <div className="space-y-4 mt-5">

                  {consultation.demandesImagerie.map(
                    (demande: any) => (
                      <div
                        key={demande.id}
                        className="border border-base-200 rounded-xl p-4"
                      >

                        <div className="flex justify-between">

                          <div>
                            <div className="font-semibold">
                              {demande.numero}
                            </div>

                            <div>
                              {demande.examen?.nom ??
                                "Examen d'imagerie"}
                            </div>
                          </div>

                          <span className="badge">
                            {demande.statut}
                          </span>

                        </div>

                        {demande.motif && (
                          <p className="text-sm mt-3">
                            <span className="font-medium">
                              Motif :
                            </span>{" "}
                            {demande.motif}
                          </p>
                        )}

                      </div>
                    ),
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

      {/* =====================================================
          MODALE CONSTANTES
      ===================================================== */}

      {modal === "constante" && (
        <Modal
          title="Ajouter les constantes"
          description="Enregistrer les constantes vitales du patient."
          icon={<Activity size={22} />}
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreateConstante
            }
            className="space-y-5"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputField
                label="Température"
                unit="°C"
                icon={
                  <Thermometer size={17} />
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
                  <HeartPulse size={17} />
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
                  <Droplets size={17} />
                }
                value={saturation}
                onChange={setSaturation}
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
                  <Scale size={17} />
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
                onChange={setGlycemie}
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

      {/* =====================================================
          MODALE PRESCRIPTION
      ===================================================== */}

      {modal === "prescription" && (
        <Modal
          title="Nouvelle prescription"
          description="Créer une prescription pour ce patient."
          icon={<Pill size={22} />}
          onClose={closeModal}
        >

          <form
            onSubmit={
              handleCreatePrescription
            }
            className="space-y-5"
          >

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Médicament *
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={medicamentId}
                onChange={(event) =>
                  setMedicamentId(
                    event.target.value,
                  )
                }
                required
              >

                <option value="">
                  Sélectionner un médicament
                </option>

                {medicaments.map(
                  (medicament) => (
                    <option
                      key={medicament.id}
                      value={medicament.id}
                    >
                      {medicament.nom}
                    </option>
                  ),
                )}

              </select>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputField
                label="Dose"
                value={dose}
                onChange={setDose}
                placeholder="Ex. 500 mg"
              />

              <InputField
                label="Fréquence"
                value={frequence}
                onChange={setFrequence}
                placeholder="Ex. 3 fois/jour"
              />

              <InputField
                label="Durée"
                value={duree}
                onChange={setDuree}
                placeholder="Ex. 5 jours"
              />

              <InputField
                label="Voie d'administration"
                value={voie}
                onChange={setVoie}
                placeholder="Ex. Orale"
              />

              <InputField
                label="Quantité"
                value={quantite}
                onChange={setQuantite}
                type="number"
              />

            </div>

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Posologie
                </span>
              </label>

              <textarea
                className="textarea textarea-bordered min-h-24"
                placeholder="Instructions de prise du médicament..."
                value={posologie}
                onChange={(event) =>
                  setPosologie(
                    event.target.value,
                  )
                }
              />

            </div>

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Observation
                </span>
              </label>

              <textarea
                className="textarea textarea-bordered min-h-20"
                placeholder="Informations complémentaires..."
                value={
                  observationPrescription
                }
                onChange={(event) =>
                  setObservationPrescription(
                    event.target.value,
                  )
                }
              />

            </div>

            <ModalActions
              loading={loading}
              submitLabel="Enregistrer la prescription"
              onCancel={closeModal}
            />

          </form>

        </Modal>
      )}

      {/* =====================================================
          MODALE LABORATOIRE
      ===================================================== */}

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

              <div className="border border-base-200 rounded-xl max-h-64 overflow-y-auto">

                {examensLaboratoire.length ===
                0 ? (
                  <div className="p-5 text-sm text-base-content/50">
                    Aucun examen de laboratoire
                    disponible.
                  </div>
                ) : (
                  examensLaboratoire.map(
                    (examen) => {
                      const checked =
                        examensSelectionnes.includes(
                          examen.id,
                        );

                      return (
                        <label
                          key={examen.id}
                          className={`flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-base-200/50 ${
                            checked
                              ? "bg-primary/5"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleExamenLaboratoire(
                                examen.id,
                              )
                            }
                          />

                          <div className="flex-1">

                            <p className="font-medium">
                              {examen.nom}
                            </p>

                            {examen.code && (
                              <p className="text-xs text-base-content/50">
                                {examen.code}
                              </p>
                            )}

                          </div>

                        </label>
                      );
                    },
                  )
                )}

              </div>

              <p className="text-xs text-base-content/50 mt-2">
                {
                  examensSelectionnes.length
                }{" "}
                examen(s) sélectionné(s)
              </p>

            </div>

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={urgenceLabo}
                onChange={(event) =>
                  setUrgenceLabo(
                    event.target.checked,
                  )
                }
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
                value={observationLabo}
                onChange={(event) =>
                  setObservationLabo(
                    event.target.value,
                  )
                }
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

      {/* =====================================================
          MODALE IMAGERIE
      ===================================================== */}

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

              <select
                className="select select-bordered w-full"
                value={examenImagerieId}
                onChange={(event) =>
                  setExamenImagerieId(
                    event.target.value,
                  )
                }
                required
              >

                <option value="">
                  Sélectionner un examen
                </option>

                {examensImagerie.map(
                  (examen) => (
                    <option
                      key={examen.id}
                      value={examen.id}
                    >
                      {examen.code
                        ? `${examen.code} — `
                        : ""}
                      {examen.nom}
                    </option>
                  ),
                )}

              </select>

            </div>

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                className="checkbox checkbox-warning"
                checked={
                  urgenceImagerie
                }
                onChange={(event) =>
                  setUrgenceImagerie(
                    event.target.checked,
                  )
                }
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
                value={motifImagerie}
                onChange={(event) =>
                  setMotifImagerie(
                    event.target.value,
                  )
                }
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
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`tab ${
        active ? "tab-active" : ""
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
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div className="flex items-center gap-3">

        <div className="p-2 rounded-lg bg-primary/10 text-primary">
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
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-base-300 p-8 text-center">

      <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-base-content/50">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-sm text-base-content/50 mt-1 max-w-md mx-auto">
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
    <div className="rounded-xl bg-base-200/40 border border-base-200 p-4">

      <p className="text-xs uppercase tracking-wide text-base-content/50 font-semibold mb-2">
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
  onChange: (value: string) => void;
  unit?: string;
  icon?: React.ReactNode;
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            {icon}
          </div>
        )}

        <input
          type={type}
          step={step}
          className={`input input-bordered w-full ${
            icon ? "pl-10" : ""
          } ${unit ? "pr-16" : ""}`}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={placeholder}
        />

        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/50">
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
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-base-100 shadow-2xl">

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-200 bg-base-100 p-5">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
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
    <div className="flex justify-end gap-3 pt-4 border-t border-base-200">

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