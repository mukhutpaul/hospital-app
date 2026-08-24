
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  UserRound,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  Save,
  ArrowLeft,
  Loader2,
  Camera,
  UsersRound,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createPatient,
  updatePatient,
} from "@/app/actions/patient";

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

  sexe: string;

  dateNaissance: Date | null;
  lieuNaissance: string | null;

  telephone: string | null;
  email: string | null;
  adresse: string | null;

  profession: string | null;

  nationalite: string | null;
  etatCivil: string | null;

  groupeSanguin: string | null;
  rhesus: string | null;

  personneContact: string | null;
  contactTelephone: string | null;
  contactLien: string | null;

  photo: string | null;

  actif: boolean;
};

type FormValues = {
  numeroDossier: string;

  nom: string;
  postNom: string;
  prenom: string;

  sexe: string;

  dateNaissance: string;
  lieuNaissance: string;

  telephone: string;
  email: string;
  adresse: string;

  profession: string;

  nationalite: string;
  etatCivil: string;

  groupeSanguin: string;
  rhesus: string;

  personneContact: string;
  contactTelephone: string;
  contactLien: string;

  photo: string;

  actif: boolean;
};

type Props = {
  patient?: Patient;
  mode?: "create" | "edit";
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Transforme une date en YYYY-MM-DD
 * pour l'input type="date".
 */
function formatDateForInput(
  date: Date | string | null | undefined
): string {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Génération automatique du numéro de dossier.
 *
 * Exemple :
 * PAT-20260822-4837
 */
function generatePatientNumber(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAT-${year}${month}${day}-${random}`;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function PatientForm({
  patient,
  mode = patient ? "edit" : "create",
}: Props) {
  const router = useRouter();

  const isEdit = mode === "edit" && !!patient;

  const [loading, setLoading] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    patient?.photo || null
  );

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      /*
      |--------------------------------------------------------------------------
      | NUMÉRO AUTOMATIQUE
      |--------------------------------------------------------------------------
      */

      numeroDossier:
        patient?.numeroDossier || generatePatientNumber(),

      nom: patient?.nom || "",

      postNom: patient?.postNom || "",

      prenom: patient?.prenom || "",

      sexe: patient?.sexe || "",

      dateNaissance: formatDateForInput(
        patient?.dateNaissance
      ),

      lieuNaissance: patient?.lieuNaissance || "",

      telephone: patient?.telephone || "",

      email: patient?.email || "",

      adresse: patient?.adresse || "",

      profession: patient?.profession || "",

      nationalite: patient?.nationalite || "Congolaise",

      etatCivil: patient?.etatCivil || "",

      groupeSanguin: patient?.groupeSanguin || "",

      rhesus: patient?.rhesus || "",

      personneContact: patient?.personneContact || "",

      contactTelephone: patient?.contactTelephone || "",

      contactLien: patient?.contactLien || "",

      photo: patient?.photo || "",

      actif: patient?.actif ?? true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | RESET SI LE PATIENT CHANGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!patient) {
      return;
    }

    reset({
      numeroDossier: patient.numeroDossier,

      nom: patient.nom || "",

      postNom: patient.postNom || "",

      prenom: patient.prenom || "",

      sexe: patient.sexe || "",

      dateNaissance: formatDateForInput(
        patient.dateNaissance
      ),

      lieuNaissance: patient.lieuNaissance || "",

      telephone: patient.telephone || "",

      email: patient.email || "",

      adresse: patient.adresse || "",

      profession: patient.profession || "",

      nationalite: patient.nationalite || "Congolaise",

      etatCivil: patient.etatCivil || "",

      groupeSanguin: patient.groupeSanguin || "",

      rhesus: patient.rhesus || "",

      personneContact: patient.personneContact || "",

      contactTelephone: patient.contactTelephone || "",

      contactLien: patient.contactLien || "",

      photo: patient.photo || "",

      actif: patient.actif ?? true,
    });

    setPhotoPreview(patient.photo || null);
  }, [patient, reset]);

  /*
  |--------------------------------------------------------------------------
  | PHOTO
  |--------------------------------------------------------------------------
  */

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification type
    |--------------------------------------------------------------------------
    */

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Veuillez sélectionner une image valide."
      );

      event.target.value = "";
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification taille
    |--------------------------------------------------------------------------
    */

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "La photo ne doit pas dépasser 5 Mo."
      );

      event.target.value = "";
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Lecture de la photo
    |--------------------------------------------------------------------------
    */

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        return;
      }

      setPhotoPreview(result);

      setValue("photo", result, {
        shouldDirty: true,
        shouldValidate: true,
      });
    };

    reader.onerror = () => {
      toast.error(
        "Impossible de lire la photo sélectionnée."
      );
    };

    reader.readAsDataURL(file);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function onSubmit(data: FormValues) {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Préparation du payload
      |--------------------------------------------------------------------------
      */

      const payload = {
        numeroDossier: data.numeroDossier.trim(),

        nom: data.nom.trim(),

        postNom:
          data.postNom.trim() || null,

        prenom:
          data.prenom.trim() || null,

        sexe: data.sexe,

        dateNaissance:
          data.dateNaissance || null,

        lieuNaissance:
          data.lieuNaissance.trim() || null,

        telephone:
          data.telephone.trim() || null,

        email:
          data.email.trim() || null,

        adresse:
          data.adresse.trim() || null,

        profession:
          data.profession.trim() || null,

        nationalite:
          data.nationalite.trim() || null,

        etatCivil:
          data.etatCivil || null,

        groupeSanguin:
          data.groupeSanguin || null,

        rhesus:
          data.rhesus || null,

        personneContact:
          data.personneContact.trim() || null,

        contactTelephone:
          data.contactTelephone.trim() || null,

        contactLien:
          data.contactLien || null,

        photo:
          data.photo || null,

        actif: data.actif,
      };

      /*
      |--------------------------------------------------------------------------
      | CREATE / UPDATE
      |--------------------------------------------------------------------------
      */

      const response = isEdit
        ? await updatePatient(
            patient.id,
            payload
          )
        : await createPatient(
            payload
          );

      /*
      |--------------------------------------------------------------------------
      | ERREUR SERVEUR
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
      | SUCCÈS
      |--------------------------------------------------------------------------
      */

      await Swal.fire({
        title: "Opération réussie",

        text:
          response.message ||
          (isEdit
            ? "Patient modifié avec succès."
            : "Patient enregistré avec succès."),

        icon: "success",

        confirmButtonText: "OK",

        confirmButtonColor: "#2563eb",
      });

      /*
      |--------------------------------------------------------------------------
      | REDIRECTION
      |--------------------------------------------------------------------------
      */

      router.push("/patients");

      router.refresh();
    } catch (error) {
      console.error(
        "PatientForm error:",
        error
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement du patient."
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

    router.push("/patients");
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-sm btn-ghost"
            disabled={loading}
          >
            <ArrowLeft size={18} />

            Retour
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              {isEdit
                ? "Modifier le patient"
                : "Nouveau patient"}
            </h1>

            <p className="text-sm text-base-content/60">
              {isEdit
                ? "Modifier les informations du dossier patient."
                : "Créer un nouveau dossier patient."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          IDENTITÉ
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={<UserRound size={20} />}
            title="Identité du patient"
            description="Informations principales du patient"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* NUMÉRO DOSSIER */}

            <FormField
              label="Numéro de dossier"
              required
              error={
                errors.numeroDossier?.message
              }
            >
              <label className="input input-bordered flex items-center gap-2 bg-base-200">
                <FileText
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="text"
                  {...register(
                    "numeroDossier",
                    {
                      required:
                        "Le numéro de dossier est obligatoire.",
                    }
                  )}
                  readOnly
                  className="grow font-semibold"
                />
              </label>

              {!isEdit && (
                <p className="text-xs text-base-content/50 mt-1">
                  Généré automatiquement par le système.
                </p>
              )}
            </FormField>

            {/* NOM */}

            <FormField
              label="Nom"
              required
              error={errors.nom?.message}
            >
              <input
                type="text"
                {...register("nom", {
                  required:
                    "Le nom est obligatoire.",

                  minLength: {
                    value: 2,
                    message:
                      "Le nom doit contenir au moins 2 caractères.",
                  },
                })}
                className={`input input-bordered w-full ${
                  errors.nom
                    ? "input-error"
                    : ""
                }`}
                placeholder="Nom"
              />
            </FormField>

            {/* POST NOM */}

            <FormField
              label="Post-nom"
              error={
                errors.postNom?.message
              }
            >
              <input
                type="text"
                {...register("postNom")}
                className="input input-bordered w-full"
                placeholder="Post-nom"
              />
            </FormField>

            {/* PRENOM */}

            <FormField
              label="Prénom"
              error={
                errors.prenom?.message
              }
            >
              <input
                type="text"
                {...register("prenom")}
                className="input input-bordered w-full"
                placeholder="Prénom"
              />
            </FormField>

            {/* SEXE */}

            <FormField
              label="Sexe"
              required
              error={
                errors.sexe?.message
              }
            >
              <select
                {...register("sexe", {
                  required:
                    "Veuillez sélectionner le sexe.",
                })}
                className={`select select-bordered w-full ${
                  errors.sexe
                    ? "select-error"
                    : ""
                }`}
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="M">
                  Masculin
                </option>

                <option value="F">
                  Féminin
                </option>

                <option value="AUTRE">
                  Autre
                </option>
              </select>
            </FormField>

            {/* DATE NAISSANCE */}

            <FormField
              label="Date de naissance"
              error={
                errors.dateNaissance?.message
              }
            >
              <label className="input input-bordered flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="date"
                  {...register(
                    "dateNaissance"
                  )}
                  className="grow"
                />
              </label>
            </FormField>

            {/* LIEU NAISSANCE */}

            <FormField label="Lieu de naissance">
              <input
                type="text"
                {...register(
                  "lieuNaissance"
                )}
                className="input input-bordered w-full"
                placeholder="Lieu de naissance"
              />
            </FormField>

            {/* NATIONALITE */}

            <FormField label="Nationalité">
              <input
                type="text"
                {...register(
                  "nationalite"
                )}
                className="input input-bordered w-full"
                placeholder="Congolaise"
              />
            </FormField>

            {/* ETAT CIVIL */}

            <FormField label="État civil">
              <select
                {...register(
                  "etatCivil"
                )}
                className="select select-bordered w-full"
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="CELIBATAIRE">
                  Célibataire
                </option>

                <option value="MARIE">
                  Marié(e)
                </option>

                <option value="DIVORCE">
                  Divorcé(e)
                </option>

                <option value="VEUF">
                  Veuf / Veuve
                </option>
              </select>
            </FormField>

            {/* PROFESSION */}

            <FormField label="Profession">
              <label className="input input-bordered flex items-center gap-2">
                <BriefcaseBusiness
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="text"
                  {...register(
                    "profession"
                  )}
                  className="grow"
                  placeholder="Profession"
                />
              </label>
            </FormField>
          </div>
        </div>
      </div>

      {/* =====================================================
          PHOTO
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={<Camera size={20} />}
            title="Photo"
            description="Photo d'identification du patient"
          />

          <div className="flex flex-col sm:flex-row items-center gap-5 mt-5">
            <div className="shrink-0">
              {photoPreview ? (
                <div className="avatar">
                  <div className="w-28 h-28 rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Photo du patient"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
                  <UserRound size={45} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="btn btn-outline">
                <Camera size={17} />

                Choisir une photo

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handlePhotoChange
                  }
                  className="hidden"
                />
              </label>

              <p className="text-xs text-base-content/50">
                JPG, PNG ou WEBP.
                Taille maximale : 5 Mo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={<Phone size={20} />}
            title="Coordonnées"
            description="Coordonnées et adresse du patient"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* TELEPHONE */}

            <FormField
              label="Téléphone"
              error={
                errors.telephone?.message
              }
            >
              <label className="input input-bordered flex items-center gap-2">
                <Phone
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="tel"
                  {...register(
                    "telephone"
                  )}
                  className="grow"
                  placeholder="+243 ..."
                />
              </label>
            </FormField>

            {/* EMAIL */}

            <FormField
              label="Email"
              error={
                errors.email?.message
              }
            >
              <label className="input input-bordered flex items-center gap-2">
                <Mail
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="email"
                  {...register("email", {
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                      message:
                        "Adresse email invalide.",
                    },
                  })}
                  className="grow"
                  placeholder="patient@email.com"
                />
              </label>
            </FormField>

            {/* ADRESSE */}

            <FormField
              label="Adresse"
              className="md:col-span-2"
            >
              <label className="input input-bordered flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-base-content/50"
                />

                <input
                  type="text"
                  {...register(
                    "adresse"
                  )}
                  className="grow"
                  placeholder="Adresse complète"
                />
              </label>
            </FormField>
          </div>
        </div>
      </div>

      {/* =====================================================
          INFORMATIONS MÉDICALES
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <HeartPulse size={20} />
            }
            title="Informations médicales"
            description="Informations utiles pour la prise en charge"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* GROUPE SANGUIN */}

            <FormField label="Groupe sanguin">
              <select
                {...register(
                  "groupeSanguin"
                )}
                className="select select-bordered w-full"
              >
                <option value="">
                  Non renseigné
                </option>

                <option value="A">
                  A
                </option>

                <option value="B">
                  B
                </option>

                <option value="AB">
                  AB
                </option>

                <option value="O">
                  O
                </option>
              </select>
            </FormField>

            {/* RHESUS */}

            <FormField label="Rhésus">
              <select
                {...register("rhesus")}
                className="select select-bordered w-full"
              >
                <option value="">
                  Non renseigné
                </option>

                <option value="+">
                  Positif (+)
                </option>

                <option value="-">
                  Négatif (-)
                </option>
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* =====================================================
          PERSONNE À CONTACTER
      ===================================================== */}

      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <SectionTitle
            icon={
              <UsersRound size={20} />
            }
            title="Personne à contacter"
            description="Contact d'urgence du patient"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* NOM CONTACT */}

            <FormField label="Nom complet">
              <input
                type="text"
                {...register(
                  "personneContact"
                )}
                className="input input-bordered w-full"
                placeholder="Nom de la personne"
              />
            </FormField>

            {/* TELEPHONE CONTACT */}

            <FormField label="Téléphone">
              <input
                type="tel"
                {...register(
                  "contactTelephone"
                )}
                className="input input-bordered w-full"
                placeholder="+243 ..."
              />
            </FormField>

            {/* LIEN */}

            <FormField label="Lien avec le patient">
              <select
                {...register(
                  "contactLien"
                )}
                className="select select-bordered w-full"
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="PERE">
                  Père
                </option>

                <option value="MERE">
                  Mère
                </option>

                <option value="CONJOINT">
                  Conjoint(e)
                </option>

                <option value="FRERE">
                  Frère
                </option>

                <option value="SOEUR">
                  Sœur
                </option>

                <option value="ENFANT">
                  Enfant
                </option>

                <option value="AUTRE">
                  Autre
                </option>
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATUT
      ===================================================== */}

      {isEdit && (
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <SectionTitle
              icon={
                <ShieldCheck size={20} />
              }
              title="Statut du dossier"
              description="Activer ou désactiver le dossier patient"
            />

            <label className="flex items-center gap-4 cursor-pointer mt-5">
              <input
                type="checkbox"
                {...register("actif")}
                className="toggle toggle-primary"
              />

              <div>
                <p className="font-medium">
                  Patient actif
                </p>

                <p className="text-sm text-base-content/60">
                  Un patient inactif peut
                  être conservé dans
                  l'historique sans être
                  utilisé pour de nouvelles
                  opérations.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="btn btn-ghost"
        >
          <ArrowLeft size={17} />

          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary min-w-44"
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

              {isEdit
                ? "Enregistrer les modifications"
                : "Enregistrer le patient"}
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
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`form-control w-full ${className}`}
    >
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
