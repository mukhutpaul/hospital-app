"use client";

import { useEffect, useState } from "react";

import Select from "react-select";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Loader2,
  Save,
  UserRound,
  ClipboardPlus,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createAdmission,
  updateAdmission,
} from "@/app/actions/admission";

import { useRouter } from "next/navigation";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom: string | null;
  prenom: string | null;
  telephone: string | null;
};

type Service = {
  id: number;
  code: string;
  nom: string;
};

type RendezVous = {
  id: number;
  numero: string;

  patientId: number;

  dateHeure: Date | string;

  motif: string | null;

  statut: string;
};

type Admission = {
  id: number;
  numero: string;

  patientId: number;

  rendezVousId: number | null;

  serviceId: number | null;

  type: string;

  motif: string | null;

  statut: string;

  dateAdmission: Date | string;
};

type Props = {
  patients: Patient[];

  services: Service[];

  rendezVous: RendezVous[];

  admission?: Admission;

  mode?: "create" | "edit";
};

type FormValues = {
  patientId: number | null;

  rendezVousId: number | null;

  serviceId: number | null;

  type: string;

  motif: string;

  statut: string;

  dateAdmission: string;
};

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDateTimeForInput(
  value: Date | string | null | undefined
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function AdmissionForm({
  patients,
  services,
  rendezVous,
  admission,
  mode = admission ? "edit" : "create",
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const isEdit =
    mode === "edit" &&
    !!admission;

  const [form, setForm] =
    useState<FormValues>({
      patientId:
        admission?.patientId ?? null,

      rendezVousId:
        admission?.rendezVousId ?? null,

      serviceId:
        admission?.serviceId ?? null,

      type:
        admission?.type ??
        "CONSULTATION",

      motif:
        admission?.motif ?? "",

      statut:
        admission?.statut ??
        "EN_ATTENTE",

      dateAdmission:
        formatDateTimeForInput(
          admission?.dateAdmission
        ),
    });

  /*
  |--------------------------------------------------------------------------
  | RESET EN MODE EDIT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!admission) {
      return;
    }

    setForm({
      patientId:
        admission.patientId,

      rendezVousId:
        admission.rendezVousId,

      serviceId:
        admission.serviceId,

      type:
        admission.type,

      motif:
        admission.motif ?? "",

      statut:
        admission.statut,

      dateAdmission:
        formatDateTimeForInput(
          admission.dateAdmission
        ),
    });
  }, [admission]);

  /*
  |--------------------------------------------------------------------------
  | PATIENT OPTIONS
  |--------------------------------------------------------------------------
  */

  const patientOptions =
    patients.map((patient) => ({
      value: patient.id,
      label: `${patient.numeroDossier} — ${patient.nom} ${
        patient.postNom ?? ""
      } ${patient.prenom ?? ""}`.trim(),
    }));

  /*
  |--------------------------------------------------------------------------
  | SERVICE OPTIONS
  |--------------------------------------------------------------------------
  */

  const serviceOptions =
    services.map((service) => ({
      value: service.id,
      label: `${service.code} — ${service.nom}`,
    }));

  /*
  |--------------------------------------------------------------------------
  | RENDEZ-VOUS
  |--------------------------------------------------------------------------
  */

  const filteredRendezVous =
    form.patientId
      ? rendezVous.filter(
          (rdv) =>
            rdv.patientId ===
            form.patientId
        )
      : [];

  const rendezVousOptions =
    filteredRendezVous.map(
      (rdv) => ({
        value: rdv.id,

        label: `${rdv.numero} — ${new Date(
          rdv.dateHeure
        ).toLocaleString("fr-FR")} — ${
          rdv.motif ?? "Sans motif"
        }`,
      })
    );

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!form.patientId) {
      toast.error(
        "Veuillez sélectionner un patient."
      );

      return;
    }

    if (!form.type) {
      toast.error(
        "Veuillez sélectionner le type d'admission."
      );

      return;
    }

    if (!form.dateAdmission) {
      toast.error(
        "Veuillez sélectionner la date d'admission."
      );

      return;
    }

    setLoading(true);

    try {
      const payload = {
        patientId:
          form.patientId,

        rendezVousId:
          form.rendezVousId,

        serviceId:
          form.serviceId,

        type:
          form.type,

        motif:
          form.motif.trim() ||
          null,

        statut:
          form.statut,

        dateAdmission:
          form.dateAdmission,
      };

      const response = isEdit
        ? await updateAdmission(
            admission!.id,
            payload
          )
        : await createAdmission(
            payload
          );

      if (!response.success) {
        toast.error(
          response.message ||
            "Une erreur est survenue."
        );

        return;
      }

      await Swal.fire({
        title:
          "Opération réussie",

        text:
          response.message,

        icon: "success",

        confirmButtonText: "OK",
      });

      router.push(
        "/admissions"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "AdmissionForm:",
        error
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  function handleCancel() {
    if (loading) {
      return;
    }

    router.push(
      "/admissions"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="btn btn-sm btn-ghost"
          >
            <ArrowLeft
              size={18}
            />

            Retour
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              {isEdit
                ? "Modifier l'admission"
                : "Nouvelle admission"}
            </h1>

            <p className="text-sm text-base-content/60">
              {isEdit
                ? "Modifier les informations de l'admission."
                : "Enregistrer l'admission d'un patient."}
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="badge badge-primary badge-lg">
            {admission?.numero}
          </div>
        )}
      </div>

      {/* PATIENT */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <UserRound
                size={20}
              />
            }
            title="Patient"
            description="Sélectionner le patient à admettre"
          />

          <div className="mt-5">
            <label className="label">
              <span className="label-text font-medium">
                Patient
                <span className="text-error ml-1">
                  *
                </span>
              </span>
            </label>

            <Select
              options={
                patientOptions
              }
              value={
                patientOptions.find(
                  (option) =>
                    option.value ===
                    form.patientId
                ) ?? null
              }
              onChange={(option) => {
                setForm(
                  (previous) => ({
                    ...previous,

                    patientId:
                      option?.value ??
                      null,

                    rendezVousId:
                      null,
                  })
                );
              }}
              placeholder="Rechercher un patient..."
              isSearchable
              isClearable
              noOptionsMessage={() =>
                "Aucun patient trouvé"
              }
            />
          </div>
        </div>
      </div>

      {/* ADMISSION */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <ClipboardPlus
                size={20}
              />
            }
            title="Informations de l'admission"
            description="Définir le contexte de l'admission"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {/* TYPE */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Type d'admission
                </span>
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      type:
                        event.target
                          .value,
                    })
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="CONSULTATION">
                  Consultation
                </option>

                <option value="URGENCE">
                  Urgence
                </option>

                <option value="HOSPITALISATION">
                  Hospitalisation
                </option>

                <option value="MATERNITE">
                  Maternité
                </option>

                <option value="CHIRURGIE">
                  Chirurgie
                </option>

                <option value="AUTRE">
                  Autre
                </option>
              </select>
            </div>

            {/* DATE */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Date et heure
                </span>
              </label>

              <label className="input input-bordered flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="datetime-local"
                  value={
                    form.dateAdmission
                  }
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        dateAdmission:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="grow"
                />
              </label>
            </div>

            {/* SERVICE */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Service
                </span>
              </label>

              <Select
                options={
                  serviceOptions
                }
                value={
                  serviceOptions.find(
                    (option) =>
                      option.value ===
                      form.serviceId
                  ) ?? null
                }
                onChange={(option) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      serviceId:
                        option?.value ??
                        null,
                    })
                  )
                }
                placeholder="Rechercher un service..."
                isSearchable
                isClearable
                noOptionsMessage={() =>
                  "Aucun service trouvé"
                }
              />
            </div>

            {/* RENDEZ-VOUS */}

            <div className="form-control md:col-span-2 lg:col-span-3">
              <label className="label">
                <span className="label-text font-medium">
                  Rendez-vous associé
                </span>
              </label>

              <Select
                options={
                  rendezVousOptions
                }
                value={
                  rendezVousOptions.find(
                    (option) =>
                      option.value ===
                      form.rendezVousId
                  ) ?? null
                }
                onChange={(option) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      rendezVousId:
                        option?.value ??
                        null,
                    })
                  )
                }
                placeholder={
                  form.patientId
                    ? "Rechercher un rendez-vous..."
                    : "Sélectionnez d'abord un patient"
                }
                isSearchable
                isClearable
                isDisabled={
                  !form.patientId
                }
                noOptionsMessage={() =>
                  "Aucun rendez-vous trouvé"
                }
              />
            </div>

            {/* STATUT */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Statut
                </span>
              </label>

              <select
                value={
                  form.statut
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      statut:
                        event.target
                          .value,
                    })
                  )
                }
                className="select select-bordered w-full"
              >
                <option value="EN_ATTENTE">
                  En attente
                </option>

                <option value="ADMISE">
                  Admise
                </option>

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
        </div>
      </div>

      {/* MOTIF */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <FileText
                size={20}
              />
            }
            title="Motif"
            description="Informations complémentaires"
          />

          <div className="mt-5">
            <label className="label">
              <span className="label-text font-medium">
                Motif de l'admission
              </span>
            </label>

            <textarea
              value={form.motif}
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    motif:
                      event.target
                        .value,
                  })
                )
              }
              className="textarea textarea-bordered w-full min-h-32"
              placeholder="Décrire le motif de l'admission..."
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="btn btn-ghost"
        >
          <ArrowLeft
            size={17}
          />

          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary min-w-52"
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
              <Save
                size={18}
              />

              {isEdit
                ? "Enregistrer les modifications"
                : "Enregistrer l'admission"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

function SectionTitle({
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
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-lg">
          {title}
        </h2>

        <p className="text-sm text-base-content/60">
          {description}
        </p>
      </div>
    </div>
  );
}