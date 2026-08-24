"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  Save,
  Stethoscope,
  UserRound,
  Building2,
  HeartPulse,
} from "lucide-react";

import Select, {
  SingleValue,
  StylesConfig,
} from "react-select";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createRendezVous,
  updateRendezVous,
} from "@/app/actions/rendezVous";

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

type Medecin = {
  id: number;
  matricule: string;
  nom: string;
  postNom: string | null;
  prenom: string;
  serviceId: number | null;
  specialiteId: number | null;
};

type Specialite = {
  id: number;
  code: string;
  nom: string;
  serviceId: number | null;
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

  medecinId: number | null;
  specialiteId: number | null;
  serviceId: number | null;

  dateHeure: Date | string;

  motif: string | null;
  statut: string;
  observation: string | null;
};

type Props = {
  patients: Patient[];
  medecins: Medecin[];
  specialites: Specialite[];
  services: Service[];

  rendezVous?: RendezVous;

  mode?: "create" | "edit";
};

type FormValues = {
  patientId: string;

  medecinId: string;
  specialiteId: string;
  serviceId: string;

  dateHeure: string;

  motif: string;
  statut: string;
  observation: string;
};

/*
|--------------------------------------------------------------------------
| SELECT OPTION
|--------------------------------------------------------------------------
*/

type SelectOption = {
  value: string;
  label: string;
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

  const year = date.getFullYear();

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
| REACT SELECT STYLES
|--------------------------------------------------------------------------
*/

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (provided, state) => ({
    ...provided,

    minHeight: "48px",

    borderRadius: "0.5rem",

    borderColor: state.isFocused
      ? "oklch(var(--p))"
      : "oklch(var(--bc) / 0.2)",

    boxShadow: state.isFocused
      ? "0 0 0 1px oklch(var(--p))"
      : "none",

    backgroundColor:
      "oklch(var(--b1))",

    "&:hover": {
      borderColor:
        "oklch(var(--bc) / 0.4)",
    },
  }),

  menu: (provided) => ({
    ...provided,

    zIndex: 50,

    backgroundColor:
      "oklch(var(--b1))",
  }),

  menuList: (provided) => ({
    ...provided,

    maxHeight: "250px",
  }),

  option: (
    provided,
    state
  ) => ({
    ...provided,

    backgroundColor:
      state.isSelected
        ? "oklch(var(--p))"
        : state.isFocused
        ? "oklch(var(--b2))"
        : "transparent",

    color:
      state.isSelected
        ? "oklch(var(--pc))"
        : "oklch(var(--bc))",

    cursor: "pointer",
  }),

  singleValue: (provided) => ({
    ...provided,

    color: "oklch(var(--bc))",
  }),

  input: (provided) => ({
    ...provided,

    color: "oklch(var(--bc))",
  }),

  placeholder: (provided) => ({
    ...provided,

    color: "oklch(var(--bc) / 0.5)",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function RendezVousForm({
  patients,
  medecins,
  specialites,
  services,
  rendezVous,
  mode = rendezVous
    ? "edit"
    : "create",
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const isEdit =
    mode === "edit" &&
    !!rendezVous;

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: {
      errors,
    },
  } = useForm<FormValues>({
    defaultValues: {
      patientId:
        rendezVous?.patientId
          ? String(
              rendezVous.patientId
            )
          : "",

      medecinId:
        rendezVous?.medecinId
          ? String(
              rendezVous.medecinId
            )
          : "",

      specialiteId:
        rendezVous?.specialiteId
          ? String(
              rendezVous.specialiteId
            )
          : "",

      serviceId:
        rendezVous?.serviceId
          ? String(
              rendezVous.serviceId
            )
          : "",

      dateHeure:
        formatDateTimeForInput(
          rendezVous?.dateHeure
        ),

      motif:
        rendezVous?.motif || "",

      statut:
        rendezVous?.statut ||
        "PLANIFIE",

      observation:
        rendezVous?.observation ||
        "",
    },
  });

  /*
  |--------------------------------------------------------------------------
  | RESET EN MODE EDIT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!rendezVous) {
      return;
    }

    reset({
      patientId:
        String(
          rendezVous.patientId
        ),

      medecinId:
        rendezVous.medecinId
          ? String(
              rendezVous.medecinId
            )
          : "",

      specialiteId:
        rendezVous.specialiteId
          ? String(
              rendezVous.specialiteId
            )
          : "",

      serviceId:
        rendezVous.serviceId
          ? String(
              rendezVous.serviceId
            )
          : "",

      dateHeure:
        formatDateTimeForInput(
          rendezVous.dateHeure
        ),

      motif:
        rendezVous.motif || "",

      statut:
        rendezVous.statut ||
        "PLANIFIE",

      observation:
        rendezVous.observation ||
        "",
    });
  }, [
    rendezVous,
    reset,
  ]);

  /*
  |--------------------------------------------------------------------------
  | WATCH
  |--------------------------------------------------------------------------
  */

  const selectedServiceId =
    watch("serviceId");

  const selectedSpecialiteId =
    watch("specialiteId");

  /*
  |--------------------------------------------------------------------------
  | FILTRAGE SPECIALITES
  |--------------------------------------------------------------------------
  */

  const filteredSpecialites =
    selectedServiceId
      ? specialites.filter(
          (specialite) =>
            !specialite.serviceId ||
            specialite.serviceId ===
              Number(
                selectedServiceId
              )
        )
      : specialites;

  /*
  |--------------------------------------------------------------------------
  | FILTRAGE MEDECINS
  |--------------------------------------------------------------------------
  */

  const filteredMedecins =
    medecins.filter(
      (medecin) => {
        const serviceOk =
          !selectedServiceId ||
          !medecin.serviceId ||
          medecin.serviceId ===
            Number(
              selectedServiceId
            );

        const specialiteOk =
          !selectedSpecialiteId ||
          !medecin.specialiteId ||
          medecin.specialiteId ===
            Number(
              selectedSpecialiteId
            );

        return (
          serviceOk &&
          specialiteOk
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | OPTIONS PATIENTS
  |--------------------------------------------------------------------------
  */

  const patientOptions: SelectOption[] =
    patients.map(
      (patient) => ({
        value: String(
          patient.id
        ),

        label: `${patient.numeroDossier} — ${patient.nom} ${
          patient.postNom || ""
        } ${patient.prenom || ""}`.trim(),
      })
    );

  /*
  |--------------------------------------------------------------------------
  | OPTIONS SERVICES
  |--------------------------------------------------------------------------
  */

  const serviceOptions: SelectOption[] =
    services.map(
      (service) => ({
        value: String(
          service.id
        ),

        label: `${service.code} — ${service.nom}`,
      })
    );

  /*
  |--------------------------------------------------------------------------
  | OPTIONS SPECIALITES
  |--------------------------------------------------------------------------
  */

  const specialiteOptions: SelectOption[] =
    filteredSpecialites.map(
      (specialite) => ({
        value: String(
          specialite.id
        ),

        label: `${specialite.code} — ${specialite.nom}`,
      })
    );

  /*
  |--------------------------------------------------------------------------
  | OPTIONS MEDECINS
  |--------------------------------------------------------------------------
  */

  const medecinOptions: SelectOption[] =
    filteredMedecins.map(
      (medecin) => ({
        value: String(
          medecin.id
        ),

        label: `Dr ${medecin.nom} ${
          medecin.postNom || ""
        } ${medecin.prenom}`.trim(),
      })
    );

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function onSubmit(
    data: FormValues
  ) {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!data.patientId) {
        toast.error(
          "Veuillez sélectionner un patient."
        );

        return;
      }

      if (!data.dateHeure) {
        toast.error(
          "Veuillez sélectionner la date et l'heure."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | PAYLOAD
      |--------------------------------------------------------------------------
      */

      const payload = {
        patientId:
          Number(
            data.patientId
          ),

        medecinId:
          data.medecinId
            ? Number(
                data.medecinId
              )
            : null,

        specialiteId:
          data.specialiteId
            ? Number(
                data.specialiteId
              )
            : null,

        serviceId:
          data.serviceId
            ? Number(
                data.serviceId
              )
            : null,

        dateHeure:
          data.dateHeure,

        motif:
          data.motif.trim() ||
          null,

        statut:
          data.statut ||
          "PLANIFIE",

        observation:
          data.observation.trim() ||
          null,
      };

      /*
      |--------------------------------------------------------------------------
      | CREATE / UPDATE
      |--------------------------------------------------------------------------
      */

      const response =
        isEdit
          ? await updateRendezVous(
              rendezVous!.id,
              payload
            )
          : await createRendezVous(
              payload
            );

      /*
      |--------------------------------------------------------------------------
      | ERREUR
      |--------------------------------------------------------------------------
      */

      if (!response.success) {
        toast.error(
          response.message ||
            "Une erreur est survenue."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCES
      |--------------------------------------------------------------------------
      */

      await Swal.fire({
        title:
          "Opération réussie",

        text:
          response.message ||
          (isEdit
            ? "Rendez-vous modifié avec succès."
            : "Rendez-vous créé avec succès."),

        icon: "success",

        confirmButtonText:
          "OK",
      });

      router.push(
        "/rendez-vous"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "RendezVousForm:",
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
  | ANNULER
  |--------------------------------------------------------------------------
  */

  function handleCancel() {
    if (loading) {
      return;
    }

    router.push(
      "/rendez-vous"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-6"
    >
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={
              handleCancel
            }
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
                ? "Modifier le rendez-vous"
                : "Nouveau rendez-vous"}
            </h1>

            <p className="text-sm text-base-content/60">
              {isEdit
                ? "Modifier les informations du rendez-vous."
                : "Planifier un rendez-vous pour un patient."}
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="badge badge-primary badge-lg">
            {
              rendezVous?.numero
            }
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
            description="Sélectionner le patient concerné"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <FormField
              label="Patient"
              required
              error={
                errors.patientId
                  ?.message
              }
            >
              <Controller
                name="patientId"
                control={control}
                rules={{
                  required:
                    "Le patient est obligatoire.",
                }}
                render={({
                  field,
                }) => (
                  <Select
                    options={
                      patientOptions
                    }
                    value={
                      patientOptions.find(
                        (
                          option
                        ) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option
                          ? option.value
                          : ""
                      )
                    }
                    onBlur={
                      field.onBlur
                    }
                    isClearable
                    isSearchable
                    isDisabled={
                      loading
                    }
                    placeholder="Rechercher un patient..."
                    noOptionsMessage={() =>
                      "Aucun patient trouvé"
                    }
                    loadingMessage={() =>
                      "Chargement..."
                    }
                    styles={
                      selectStyles
                    }
                    className={
                      errors.patientId
                        ? "react-select-error"
                        : ""
                    }
                  />
                )}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* PLANIFICATION */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <CalendarDays
                size={20}
              />
            }
            title="Planification"
            description="Date, heure et affectation du rendez-vous"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {/* DATE */}

            <FormField
              label="Date et heure"
              required
              error={
                errors.dateHeure
                  ?.message
              }
            >
              <label className="input input-bordered flex items-center gap-2">
                <Clock
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="datetime-local"
                  {...register(
                    "dateHeure",
                    {
                      required:
                        "La date et l'heure sont obligatoires.",
                    }
                  )}
                  className="grow"
                  disabled={
                    loading
                  }
                />
              </label>
            </FormField>

            {/* SERVICE */}

            <FormField label="Service">
              <Controller
                name="serviceId"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    options={
                      serviceOptions
                    }
                    value={
                      serviceOptions.find(
                        (
                          option
                        ) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option
                          ? option.value
                          : ""
                      )
                    }
                    onBlur={
                      field.onBlur
                    }
                    isClearable
                    isSearchable
                    isDisabled={
                      loading
                    }
                    placeholder="Rechercher un service..."
                    noOptionsMessage={() =>
                      "Aucun service trouvé"
                    }
                    styles={
                      selectStyles
                    }
                  />
                )}
              />
            </FormField>

            {/* SPECIALITE */}

            <FormField label="Spécialité">
              <Controller
                name="specialiteId"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    options={
                      specialiteOptions
                    }
                    value={
                      specialiteOptions.find(
                        (
                          option
                        ) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option
                          ? option.value
                          : ""
                      )
                    }
                    onBlur={
                      field.onBlur
                    }
                    isClearable
                    isSearchable
                    isDisabled={
                      loading
                    }
                    placeholder="Rechercher une spécialité..."
                    noOptionsMessage={() =>
                      "Aucune spécialité trouvée"
                    }
                    styles={
                      selectStyles
                    }
                  />
                )}
              />
            </FormField>

            {/* MEDECIN */}

            <FormField label="Médecin">
              <Controller
                name="medecinId"
                control={control}
                render={({
                  field,
                }) => (
                  <Select
                    options={
                      medecinOptions
                    }
                    value={
                      medecinOptions.find(
                        (
                          option
                        ) =>
                          option.value ===
                          field.value
                      ) || null
                    }
                    onChange={(
                      option
                    ) =>
                      field.onChange(
                        option
                          ? option.value
                          : ""
                      )
                    }
                    onBlur={
                      field.onBlur
                    }
                    isClearable
                    isSearchable
                    isDisabled={
                      loading
                    }
                    placeholder="Rechercher un médecin..."
                    noOptionsMessage={() =>
                      "Aucun médecin trouvé"
                    }
                    styles={
                      selectStyles
                    }
                  />
                )}
              />
            </FormField>

            {/* STATUT */}

            <FormField label="Statut">
              <select
                {...register(
                  "statut"
                )}
                className="select select-bordered w-full"
                disabled={loading}
              >
                <option value="PLANIFIE">
                  Planifié
                </option>

                <option value="CONFIRME">
                  Confirmé
                </option>

                <option value="ANNULE">
                  Annulé
                </option>

                <option value="TERMINE">
                  Terminé
                </option>

                <option value="ABSENT">
                  Absent
                </option>
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* MOTIF */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <HeartPulse
                size={20}
              />
            }
            title="Motif du rendez-vous"
            description="Informations médicales liées au rendez-vous"
          />

          <div className="space-y-4 mt-5">
            {/* MOTIF */}

            <FormField label="Motif">
              <textarea
                {...register(
                  "motif"
                )}
                className="textarea textarea-bordered w-full min-h-24"
                placeholder="Motif du rendez-vous..."
                disabled={loading}
              />
            </FormField>

            {/* OBSERVATION */}

            <FormField label="Observation">
              <textarea
                {...register(
                  "observation"
                )}
                className="textarea textarea-bordered w-full min-h-24"
                placeholder="Observation éventuelle..."
                disabled={loading}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={
            handleCancel
          }
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
          className="btn btn-primary min-w-48"
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
                : "Enregistrer le rendez-vous"}
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

/*
|--------------------------------------------------------------------------
| FORM FIELD
|--------------------------------------------------------------------------
*/

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">
          {label}

          {required && (
            <span className="text-error ml-1">
              *
            </span>
          )}
        </span>
      </label>

      {children}

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">
            {error}
          </span>
        </label>
      )}
    </div>
  );
}