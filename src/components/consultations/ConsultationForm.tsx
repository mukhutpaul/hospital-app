"use client";

import { useMemo, useState } from "react";

import { createConsultation } from "@/app/actions/consultations";

import {
  Save,
  Loader2,
  Stethoscope,
  Building2,
  Award,
  UserRound,
  CalendarDays,
  ClipboardList,
  FileText,
  Activity,
  CheckCircle2,
} from "lucide-react";

import { toast } from "react-toastify";

type Props = {
  patients: any[];
  medecinConnecte: any;
  services: any[];
  specialites: any[];
  admissions: any[];
  onSuccess?: () => void;
};

export default function ConsultationForm({
  patients,
  medecinConnecte,
  services,
  specialites,
  admissions,
  onSuccess,
}: Props) {
  const [patientId, setPatientId] = useState("");

  const [serviceId, setServiceId] = useState(
    medecinConnecte?.serviceId
      ? String(medecinConnecte.serviceId)
      : "",
  );

  const [specialiteId, setSpecialiteId] = useState(
    medecinConnecte?.specialiteId
      ? String(medecinConnecte.specialiteId)
      : "",
  );

  const [admissionId, setAdmissionId] = useState("");

  const [dateConsultation, setDateConsultation] =
    useState(() => {
      const now = new Date();

      const local = new Date(
        now.getTime() -
          now.getTimezoneOffset() * 60000,
      );

      return local.toISOString().slice(0, 16);
    });

  const [motif, setMotif] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [observation, setObservation] = useState("");
  const [conclusion, setConclusion] = useState("");

  const [loading, setLoading] = useState(false);

  /* =========================================================
     PATIENT SÉLECTIONNÉ
  ========================================================= */

  const patientSelectionne = useMemo(() => {
    return patients.find(
      (patient) =>
        Number(patient.id) === Number(patientId),
    );
  }, [patients, patientId]);

  /* =========================================================
     ADMISSIONS DU PATIENT
  ========================================================= */

  const admissionsFiltrees = useMemo(() => {
    if (!patientId) {
      return [];
    }

    return admissions.filter(
      (admission) =>
        Number(admission.patientId) ===
        Number(patientId),
    );
  }, [admissions, patientId]);

  /* =========================================================
     MÉDECIN CONNECTÉ
  ========================================================= */

  if (!medecinConnecte) {
    return (
      <div className="alert alert-error">
        <Stethoscope size={20} />

        <span>
          Aucun médecin n'est associé à votre compte.
        </span>
      </div>
    );
  }

  /* =========================================================
     SOUMISSION
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!patientId) {
      toast.error(
        "Veuillez sélectionner un patient.",
      );
      return;
    }

    if (!dateConsultation) {
      toast.error(
        "La date de consultation est obligatoire.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await createConsultation({
        patientId: Number(patientId),

        serviceId: serviceId
          ? Number(serviceId)
          : null,

        specialiteId: specialiteId
          ? Number(specialiteId)
          : null,

        admissionId: admissionId
          ? Number(admissionId)
          : null,

        dateConsultation,

        motif: motif.trim(),
        diagnostic: diagnostic.trim(),
        observation: observation.trim(),
        conclusion: conclusion.trim(),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      /* RESET */

      setPatientId("");
      setAdmissionId("");
      setMotif("");
      setDiagnostic("");
      setObservation("");
      setConclusion("");

      setServiceId(
        medecinConnecte.serviceId
          ? String(
              medecinConnecte.serviceId,
            )
          : "",
      );

      setSpecialiteId(
        medecinConnecte.specialiteId
          ? String(
              medecinConnecte.specialiteId,
            )
          : "",
      );

      onSuccess?.();

      window.location.reload();
    } catch (error) {
      console.error(
        "handleSubmit:",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* =====================================================
          1. MÉDECIN CONNECTÉ
      ===================================================== */}

      <section className="card bg-primary/5 border border-primary/20 shadow-sm">
        <div className="card-body p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">

            {/* AVATAR */}

            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-content flex items-center justify-center shrink-0">
              <Stethoscope size={27} />
            </div>

            {/* INFORMATIONS */}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Médecin connecté
                </span>

                <CheckCircle2
                  size={15}
                  className="text-success"
                />
              </div>

              <h2 className="text-xl font-bold">
                Dr{" "}
                {medecinConnecte.nom}{" "}
                {medecinConnecte.postNom ?? ""}{" "}
                {medecinConnecte.prenom ?? ""}
              </h2>

              <div className="flex flex-wrap gap-2 mt-2">

                {medecinConnecte.matricule && (
                  <span className="badge badge-outline">
                    {medecinConnecte.matricule}
                  </span>
                )}

                {medecinConnecte.specialite?.nom && (
                  <span className="badge badge-primary gap-1">
                    <Award size={13} />

                    {
                      medecinConnecte
                        .specialite.nom
                    }
                  </span>
                )}

                {medecinConnecte.service?.nom && (
                  <span className="badge badge-outline gap-1">
                    <Building2 size={13} />

                    {
                      medecinConnecte
                        .service.nom
                    }
                  </span>
                )}
              </div>
            </div>

            {/* STATUT */}

            <div className="badge badge-success badge-outline gap-1 self-start md:self-center">
              <span className="w-2 h-2 rounded-full bg-success" />
              Actif
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. PATIENT ET CONTEXTE
      ===================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5 md:p-6">

          <SectionHeader
            icon={<UserRound size={19} />}
            title="Patient et contexte"
            description="Identifiez le patient et rattachez la consultation à son parcours de soins."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

            {/* PATIENT */}

            <div className="form-control lg:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Patient *
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={patientId}
                onChange={(event) => {
                  setPatientId(
                    event.target.value,
                  );

                  setAdmissionId("");
                }}
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
                    {patient.postNom ?? ""}{" "}
                    {patient.prenom ?? ""}
                  </option>
                ))}
              </select>

              {/* PATIENT SÉLECTIONNÉ */}

              {patientSelectionne && (
                <div className="mt-3 p-3 rounded-xl bg-base-200/50 border border-base-200">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserRound size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {
                          patientSelectionne.nom
                        }{" "}
                        {
                          patientSelectionne.postNom ??
                          ""
                        }{" "}
                        {
                          patientSelectionne.prenom ??
                          ""
                        }
                      </p>

                      <p className="text-xs text-base-content/60">
                        Dossier :{" "}
                        {
                          patientSelectionne.numeroDossier
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DATE */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Date et heure *
                </span>
              </label>

              <label className="input input-bordered flex items-center gap-3">
                <CalendarDays
                  size={18}
                  className="text-base-content/50"
                />

                <input
                  type="datetime-local"
                  className="grow"
                  value={
                    dateConsultation
                  }
                  onChange={(event) =>
                    setDateConsultation(
                      event.target.value,
                    )
                  }
                  required
                />
              </label>
            </div>

            {/* ADMISSION */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Admission
                </span>
              </label>

              <select
                className="select select-bordered"
                value={admissionId}
                onChange={(event) =>
                  setAdmissionId(
                    event.target.value,
                  )
                }
                disabled={!patientId}
              >
                <option value="">
                  Aucune admission
                </option>

                {admissionsFiltrees.map(
                  (admission) => (
                    <option
                      key={admission.id}
                      value={admission.id}
                    >
                      {admission.numero} —{" "}
                      {admission.type} —{" "}
                      {admission.statut}
                    </option>
                  ),
                )}
              </select>

              {!patientId && (
                <span className="text-xs text-base-content/50 mt-2">
                  Sélectionnez d'abord un
                  patient.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. AFFECTATION MÉDICALE
      ===================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5 md:p-6">

          <SectionHeader
            icon={<Building2 size={19} />}
            title="Affectation médicale"
            description="Le service et la spécialité sont préremplis depuis le profil du médecin connecté."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

            {/* SERVICE */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Service
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={serviceId}
                onChange={(event) => {
                  const newServiceId =
                    event.target.value;

                  setServiceId(
                    newServiceId,
                  );

                  const specialiteValide =
                    specialites.some(
                      (specialite) =>
                        Number(
                          specialite.id,
                        ) ===
                          Number(
                            specialiteId,
                          ) &&
                        Number(
                          specialite.serviceId,
                        ) ===
                          Number(
                            newServiceId,
                          ),
                    );

                  if (
                    !specialiteValide
                  ) {
                    setSpecialiteId("");
                  }
                }}
              >
                <option value="">
                  Aucun service
                </option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.code} —{" "}
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* SPÉCIALITÉ */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Spécialité
                </span>
              </label>

              <select
                className="select select-bordered w-full"
                value={specialiteId}
                onChange={(event) =>
                  setSpecialiteId(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Aucune spécialité
                </option>

                {specialites
                  .filter((specialite) => {
                    if (!serviceId) {
                      return true;
                    }

                    return (
                      Number(
                        specialite.serviceId,
                      ) ===
                      Number(serviceId)
                    );
                  })
                  .map((specialite) => (
                    <option
                      key={specialite.id}
                      value={specialite.id}
                    >
                      {specialite.code} —{" "}
                      {specialite.nom}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. MOTIF DE CONSULTATION
      ===================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5 md:p-6">

          <SectionHeader
            icon={<ClipboardList size={19} />}
            title="Motif de consultation"
            description="Décrivez la raison principale de la venue du patient."
          />

          <div className="form-control mt-5">
            <textarea
              className="textarea textarea-bordered min-h-28 w-full"
              placeholder="Ex. Fièvre depuis trois jours, douleurs abdominales, contrôle médical..."
              value={motif}
              onChange={(event) =>
                setMotif(
                  event.target.value,
                )
              }
            />

            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Motif principal présenté
                par le patient.
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. ÉVALUATION CLINIQUE
      ===================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5 md:p-6">

          <SectionHeader
            icon={<Activity size={19} />}
            title="Évaluation clinique"
            description="Consignez les éléments médicaux observés pendant la consultation."
          />

          <div className="space-y-6 mt-6">

            {/* DIAGNOSTIC */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Diagnostic
                </span>
              </label>

              <textarea
                className="textarea textarea-bordered min-h-28 w-full"
                placeholder="Saisir le diagnostic médical..."
                value={diagnostic}
                onChange={(event) =>
                  setDiagnostic(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* OBSERVATIONS */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Observations cliniques
                </span>
              </label>

              <textarea
                className="textarea textarea-bordered min-h-32 w-full"
                placeholder="Observations, symptômes, examen clinique, évolution..."
                value={observation}
                onChange={(event) =>
                  setObservation(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. CONCLUSION MÉDICALE
      ===================================================== */}

      <section className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body p-5 md:p-6">

          <SectionHeader
            icon={<FileText size={19} />}
            title="Conclusion médicale"
            description="Résumez la décision médicale et la conduite à tenir."
          />

          <div className="form-control mt-5">
            <textarea
              className="textarea textarea-bordered min-h-32 w-full"
              placeholder="Conclusion, conduite à tenir, suivi recommandé..."
              value={conclusion}
              onChange={(event) =>
                setConclusion(
                  event.target.value,
                )
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          7. RÉSUMÉ
      ===================================================== */}

      {patientSelectionne && (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <h3 className="font-semibold">
                Vérification
              </h3>

              <p className="text-xs text-base-content/60">
                Vérifiez les informations
                avant l'enregistrement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            <SummaryItem
              label="Patient"
              value={`${patientSelectionne.nom} ${
                patientSelectionne.postNom ??
                ""
              }`}
            />

            <SummaryItem
              label="Médecin"
              value={`Dr ${medecinConnecte.nom} ${
                medecinConnecte.postNom ??
                ""
              }`}
            />

            <SummaryItem
              label="Service"
              value={
                services.find(
                  (service) =>
                    Number(service.id) ===
                    Number(serviceId),
                )?.nom ||
                medecinConnecte.service
                  ?.nom ||
                "—"
              }
            />

            <SummaryItem
              label="Spécialité"
              value={
                specialites.find(
                  (specialite) =>
                    Number(
                      specialite.id,
                    ) ===
                    Number(
                      specialiteId,
                    ),
                )?.nom ||
                medecinConnecte
                  .specialite?.nom ||
                "—"
              }
            />
          </div>
        </section>
      )}

      {/* =====================================================
          8. BOUTON D'ENREGISTREMENT
      ===================================================== */}

      <div className="sticky bottom-0 z-10 bg-base-100/95 backdrop-blur border-t border-base-200 -mx-4 md:-mx-6 px-4 md:px-6 py-4">

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">

          <p className="text-xs text-base-content/50">
            Les informations seront
            enregistrées dans le dossier
            médical du patient.
          </p>

          <button
            type="submit"
            className="btn btn-primary min-w-56"
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

                Enregistrer la
                consultation
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ============================================================
   HEADER DE SECTION
============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="font-bold text-lg">
          {title}
        </h2>

        <p className="text-sm text-base-content/60 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ÉLÉMENT DU RÉSUMÉ
============================================================ */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-base-100 border border-base-200 p-3">

      <p className="text-xs text-base-content/50 mb-1">
        {label}
      </p>

      <p className="font-medium text-sm truncate">
        {value || "—"}
      </p>
    </div>
  );
}