"use client";

import { useMemo, useState } from "react";
import {
  Bed,
  Building2,
  ClipboardPlus,
  FileText,
  HeartPulse,
  Save,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  createHospitalisation,
  updateHospitalisation,
} from "@/app/actions/hospitalisations";

/* ==========================================================
   TYPES
========================================================== */

export type Hospitalisation = {
  id: number;
  numero: string;

  patientId: number;
  admissionId: number;

  serviceId?: number | null;
  medecinId?: number | null;
  litId?: number | null;

  motif?: string | null;
  diagnostic?: string | null;

  dateEntree: Date | string;
  dateSortie?: Date | string | null;

  statut: string;
};

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom?: string | null;
  prenom?: string | null;
};

type Admission = {
  id: number;
  numero: string;
  patientId: number;
  type: string;
  statut: string;
};

type Medecin = {
  id: number;
  matricule: string;
  nom: string;
  postNom?: string | null;
  prenom: string;
};

type Service = {
  id: number;
  nom: string;
};

type Lit = {
  id: number;
  numero: string;
  statut: string;

  chambre: {
    id: number;
    numero: string;
    type?: string | null;
  };
};

type Props = {
  patients?: Patient[];
  admissions?: Admission[];
  medecins?: Medecin[];
  services?: Service[];
  lits?: Lit[];

  hospitalisation?: Hospitalisation | null;

  onClose: () => void;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function HospitalisationForm({
  patients = [],
  admissions = [],
  medecins = [],
  services = [],
  lits = [],
  hospitalisation = null,
  onClose,
}: Props) {
  const isEdit = hospitalisation !== null;

  /* ========================================================
     STATES
  ======================================================== */

  const [patientId, setPatientId] = useState(
    hospitalisation?.patientId
      ? String(hospitalisation.patientId)
      : ""
  );

  const [admissionId, setAdmissionId] = useState(
    hospitalisation?.admissionId
      ? String(hospitalisation.admissionId)
      : ""
  );

  const [serviceId, setServiceId] = useState(
    hospitalisation?.serviceId
      ? String(hospitalisation.serviceId)
      : ""
  );

  const [medecinId, setMedecinId] = useState(
    hospitalisation?.medecinId
      ? String(hospitalisation.medecinId)
      : ""
  );

  const [litId, setLitId] = useState(
    hospitalisation?.litId
      ? String(hospitalisation.litId)
      : ""
  );

  const [motif, setMotif] = useState(
    hospitalisation?.motif || ""
  );

  const [diagnostic, setDiagnostic] = useState(
    hospitalisation?.diagnostic || ""
  );

  const [statut, setStatut] = useState(
    hospitalisation?.statut || "EN_COURS"
  );

  const [loading, setLoading] = useState(false);

  /* ========================================================
     PATIENT SÉLECTIONNÉ
  ======================================================== */

  const selectedPatient = useMemo(() => {
    if (!patientId) return null;

    return patients.find(
      (patient) => patient.id === Number(patientId)
    );
  }, [patientId, patients]);

  /* ========================================================
     ADMISSIONS FILTRÉES
  ======================================================== */

  const patientAdmissions = useMemo(() => {
    if (!patientId) return [];

    return admissions.filter(
      (admission) =>
        admission.patientId === Number(patientId)
    );
  }, [patientId, admissions]);

  /* ========================================================
     SUBMIT
  ======================================================== */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!patientId) {
      toast.error("Veuillez sélectionner un patient.");
      return;
    }

    if (!admissionId) {
      toast.error("Veuillez sélectionner une admission.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        patientId: Number(patientId),

        admissionId: Number(admissionId),

        serviceId: serviceId
          ? Number(serviceId)
          : undefined,

        medecinId: medecinId
          ? Number(medecinId)
          : undefined,

        litId: litId
          ? Number(litId)
          : undefined,

        motif,

        diagnostic,

        statut,
      };

      const response = isEdit
        ? await updateHospitalisation(
            hospitalisation.id,
            data
          )
        : await createHospitalisation(data);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);

      onClose();

      window.location.reload();
    } catch (error) {
      console.error(
        "HOSPITALISATION FORM:",
        error
      );

      toast.error(
        "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ====================================================
          EN-TÊTE
      ==================================================== */}

      <div className="flex items-start gap-4 rounded-xl bg-primary/5 border border-primary/10 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
          <HeartPulse size={24} />
        </div>

        <div>
          <h2 className="font-bold text-lg">
            {isEdit
              ? "Modifier l'hospitalisation"
              : "Nouvelle hospitalisation"}
          </h2>

          <p className="text-sm text-base-content/60">
            {isEdit
              ? `Modification de ${hospitalisation?.numero}`
              : "Enregistrer l'admission du patient dans le service."}
          </p>
        </div>
      </div>

      {/* ====================================================
          1. PATIENT & ADMISSION
      ==================================================== */}

      <section className="rounded-xl border border-base-300 bg-base-100">
        <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
          <UserRound
            size={20}
            className="text-primary"
          />

          <div>
            <h3 className="font-semibold">
              Patient et admission
            </h3>

            <p className="text-xs text-base-content/60">
              Informations concernant le patient hospitalisé
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {/* PATIENT */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Patient <span className="text-error">*</span>
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                setAdmissionId("");
              }}
              disabled={isEdit}
              required
            >
              <option value="">
                Sélectionner un patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.numeroDossier} —{" "}
                  {patient.nom}{" "}
                  {patient.postNom || ""}{" "}
                  {patient.prenom || ""}
                </option>
              ))}
            </select>
          </div>

          {/* ADMISSION */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Admission{" "}
                <span className="text-error">*</span>
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={admissionId}
              onChange={(e) =>
                setAdmissionId(e.target.value)
              }
              disabled={isEdit || !patientId}
              required
            >
              <option value="">
                {patientId
                  ? "Sélectionner une admission"
                  : "Sélectionnez d'abord un patient"}
              </option>

              {patientAdmissions.map(
                (admission) => (
                  <option
                    key={admission.id}
                    value={admission.id}
                  >
                    {admission.numero} —{" "}
                    {admission.type} —{" "}
                    {admission.statut}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* PATIENT CARD */}

        {selectedPatient && (
          <div className="mx-5 mb-5 rounded-lg border border-base-300 bg-base-200/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-300">
                <UserRound size={18} />
              </div>

              <div>
                <p className="font-semibold">
                  {selectedPatient.nom}{" "}
                  {selectedPatient.postNom || ""}{" "}
                  {selectedPatient.prenom || ""}
                </p>

                <p className="text-sm text-base-content/60">
                  Dossier :{" "}
                  {selectedPatient.numeroDossier}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================
          2. AFFECTATION
      ==================================================== */}

      <section className="rounded-xl border border-base-300 bg-base-100">
        <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
          <Building2
            size={20}
            className="text-primary"
          />

          <div>
            <h3 className="font-semibold">
              Affectation hospitalière
            </h3>

            <p className="text-xs text-base-content/60">
              Service, médecin responsable et lit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
          {/* SERVICE */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Service
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={serviceId}
              onChange={(e) =>
                setServiceId(e.target.value)
              }
            >
              <option value="">
                Aucun service
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.nom}
                </option>
              ))}
            </select>
          </div>

          {/* MÉDECIN */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Médecin responsable
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={medecinId}
              onChange={(e) =>
                setMedecinId(e.target.value)
              }
            >
              <option value="">
                Aucun médecin
              </option>

              {medecins.map((medecin) => (
                <option
                  key={medecin.id}
                  value={medecin.id}
                >
                  Dr. {medecin.nom}{" "}
                  {medecin.postNom || ""}{" "}
                  {medecin.prenom}
                </option>
              ))}
            </select>
          </div>

          {/* LIT */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Lit
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={litId}
              onChange={(e) =>
                setLitId(e.target.value)
              }
            >
              <option value="">
                Aucun lit
              </option>

              {lits
                .filter(
                  (lit) =>
                    lit.statut === "LIBRE" ||
                    lit.id ===
                      hospitalisation?.litId
                )
                .map((lit) => (
                  <option
                    key={lit.id}
                    value={lit.id}
                  >
                    Chambre {lit.chambre.numero} —
                    Lit {lit.numero}
                    {lit.chambre.type
                      ? ` — ${lit.chambre.type}`
                      : ""}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* INFO LIT */}

        {litId && (
          <div className="mx-5 mb-5 flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
            <Bed
              size={20}
              className="text-success"
            />

            <div>
              <p className="font-medium">
                Lit sélectionné
              </p>

              <p className="text-sm text-base-content/60">
                {(() => {
                  const lit = lits.find(
                    (item) =>
                      item.id === Number(litId)
                  );

                  if (!lit) return "Lit";

                  return `Chambre ${lit.chambre.numero} — Lit ${lit.numero}`;
                })()}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================
          3. INFORMATIONS MÉDICALES
      ==================================================== */}

      <section className="rounded-xl border border-base-300 bg-base-100">
        <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
          <Stethoscope
            size={20}
            className="text-primary"
          />

          <div>
            <h3 className="font-semibold">
              Informations médicales
            </h3>

            <p className="text-xs text-base-content/60">
              Motif et diagnostic du patient
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* MOTIF */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Motif d'hospitalisation
              </span>
            </label>

            <textarea
              className="textarea textarea-bordered min-h-28 w-full"
              placeholder="Décrire le motif de l'hospitalisation..."
              value={motif}
              onChange={(e) =>
                setMotif(e.target.value)
              }
            />

            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Motif clinique ayant justifié l'hospitalisation.
              </span>
            </label>
          </div>

          {/* DIAGNOSTIC */}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Diagnostic
              </span>
            </label>

            <textarea
              className="textarea textarea-bordered min-h-28 w-full"
              placeholder="Saisir le diagnostic médical..."
              value={diagnostic}
              onChange={(e) =>
                setDiagnostic(e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* ====================================================
          4. STATUT
      ==================================================== */}

      {isEdit && (
        <section className="rounded-xl border border-base-300 bg-base-100">
          <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
            <ClipboardPlus
              size={20}
              className="text-primary"
            />

            <div>
              <h3 className="font-semibold">
                État de l'hospitalisation
              </h3>

              <p className="text-xs text-base-content/60">
                Modifier le statut actuel
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="form-control max-w-md">
              <label className="label">
                <span className="label-text font-medium">
                  Statut
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={statut}
                onChange={(e) =>
                  setStatut(e.target.value)
                }
              >
                <option value="EN_COURS">
                  En cours
                </option>

                <option value="TERMINEE">
                  Terminée
                </option>

                <option value="ANNULEE">
                  Annulée
                </option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-base-300 bg-base-100/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="btn btn-primary min-w-44"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Save size={18} />
          )}

          {isEdit
            ? "Enregistrer les modifications"
            : "Hospitaliser le patient"}
        </button>
      </div>
    </form>
  );
}