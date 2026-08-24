"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  createEmploye,
  updateEmploye,
} from "@/app/actions/employes";

/* ==========================================================
   TYPES
========================================================== */

type Service = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

type User = {
  id: number;
  name: string | null;
  email: string | null;
  telephone: string | null;
  actif: boolean;
};

export type Employe = {
  id: number;
  matricule: string;

  nom: string;
  postNom: string | null;
  prenom: string | null;
  sexe: string | null;

  dateNaissance: Date | string | null;

  telephone: string | null;
  email: string | null;
  adresse: string | null;
  fonction: string | null;

  dateEmbauche: Date | string | null;

  serviceId: number | null;
  userId: number | null;

  actif: boolean;

  service?: {
    id: number;
    code?: string;
    nom: string;
  } | null;

  user?: User | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type Props = {
  services?: Service[];
  roles?: Role[];
  employe?: Employe | null;
  onClose?: () => void;
};

/* ==========================================================
   FORM DATA
========================================================== */

type FormData = {
  nom: string;
  postNom: string;
  prenom: string;
  sexe: string;

  dateNaissance: string;

  telephone: string;
  email: string;
  adresse: string;

  fonction: string;
  dateEmbauche: string;

  serviceId: string;

  /* ========================================================
     COMPTE UTILISATEUR
  ======================================================== */

  creerCompte: boolean;
  emailCompte: string;
  motDePasse: string;
  roleId: string;
};

/* ==========================================================
   FORMULAIRE VIDE
========================================================== */

const emptyForm: FormData = {
  nom: "",
  postNom: "",
  prenom: "",
  sexe: "",

  dateNaissance: "",

  telephone: "",
  email: "",
  adresse: "",

  fonction: "",
  dateEmbauche: "",

  serviceId: "",

  creerCompte: false,
  emailCompte: "",
  motDePasse: "",
  roleId: "",
};

/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDateForInput(
  value: Date | string | null | undefined
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function EmployeForm({
  services = [],
  roles = [],
  employe = null,
  onClose,
}: Props) {
  const isEdit = Boolean(employe);

  const [loading, setLoading] = useState(false);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  /* ========================================================
     INITIALISATION
  ======================================================== */

  useEffect(() => {
    if (!employe) {
      setForm({
        ...emptyForm,
      });

      return;
    }

    /*
    ----------------------------------------------------------
    EMPLOYÉ EXISTANT
    ----------------------------------------------------------
    */

    setForm({
      nom: employe.nom ?? "",
      postNom: employe.postNom ?? "",
      prenom: employe.prenom ?? "",
      sexe: employe.sexe ?? "",

      dateNaissance:
        formatDateForInput(
          employe.dateNaissance
        ),

      telephone:
        employe.telephone ?? "",

      email:
        employe.email ?? "",

      adresse:
        employe.adresse ?? "",

      fonction:
        employe.fonction ?? "",

      dateEmbauche:
        formatDateForInput(
          employe.dateEmbauche
        ),

      serviceId:
        employe.serviceId != null
          ? String(employe.serviceId)
          : "",

      /*
      ========================================================
      COMPTE UTILISATEUR
      ========================================================
      */

      creerCompte:
        Boolean(employe.user),

      emailCompte:
        employe.user?.email ??
        "",

      /*
      On ne préremplit jamais
      le mot de passe.
      */

      motDePasse: "",

      /*
      Le rôle n'est pas forcément présent
      dans ton type User actuel.

      Il pourra être sélectionné/modifié
      si tu charges le rôle dans ton
      getEmployes().
      */

      roleId: "",
    });
  }, [employe]);

  /* ========================================================
     CHANGEMENT
  ======================================================== */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox"
    ) {
      setForm((previous) => ({
        ...previous,

        [name]: e.target.checked,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,

      [name]: value,
    }));
  }

  /* ========================================================
     SOUMISSION
  ======================================================== */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    /* ======================================================
       VALIDATION EMPLOYÉ
    ====================================================== */

    if (!form.nom.trim()) {
      toast.error(
        "Le nom est obligatoire."
      );

      return;
    }

    /* ======================================================
       VALIDATION COMPTE UTILISATEUR
    ====================================================== */

    if (form.creerCompte) {
      /*
      --------------------------------------------------------
      EMAIL
      --------------------------------------------------------
      */

      if (!form.emailCompte.trim()) {
        toast.error(
          "L'adresse email du compte utilisateur est obligatoire."
        );

        return;
      }

      /*
      --------------------------------------------------------
      MOT DE PASSE
      --------------------------------------------------------
      */

      /*
      En création :
      mot de passe obligatoire.

      En modification :
      il est facultatif car on peut
      conserver l'ancien.
      */

      if (
        !isEdit &&
        !form.motDePasse.trim()
      ) {
        toast.error(
          "Le mot de passe est obligatoire."
        );

        return;
      }

      /*
      Si un mot de passe est fourni,
      il doit avoir au moins 6 caractères.
      */

      if (
        form.motDePasse.trim() &&
        form.motDePasse.length < 6
      ) {
        toast.error(
          "Le mot de passe doit contenir au moins 6 caractères."
        );

        return;
      }

      /*
      --------------------------------------------------------
      RÔLE
      --------------------------------------------------------
      */

      /*
      Pour un nouvel employé avec compte,
      le rôle est obligatoire.

      Pour une modification d'un employé
      qui possède déjà un compte, ton action
      permet de conserver le rôle actuel.
      */

      if (
        !isEdit &&
        !form.roleId
      ) {
        toast.error(
          "Veuillez sélectionner le rôle de l'utilisateur."
        );

        return;
      }

      /*
      Si l'employé n'avait pas encore
      de compte et qu'on veut en créer
      un pendant la modification,
      le rôle est également obligatoire.
      */

      if (
        isEdit &&
        !employe?.user &&
        !form.roleId
      ) {
        toast.error(
          "Veuillez sélectionner le rôle de l'utilisateur."
        );

        return;
      }
    }

    setLoading(true);

    try {
      /* ====================================================
         DONNÉES EMPLOYÉ
      ==================================================== */

      const data = {
        nom:
          form.nom.trim(),

        postNom:
          form.postNom.trim() ||
          undefined,

        prenom:
          form.prenom.trim() ||
          undefined,

        sexe:
          form.sexe ||
          undefined,

        dateNaissance:
          form.dateNaissance ||
          undefined,

        telephone:
          form.telephone.trim() ||
          undefined,

        email:
          form.email.trim() ||
          undefined,

        adresse:
          form.adresse.trim() ||
          undefined,

        fonction:
          form.fonction.trim() ||
          undefined,

        dateEmbauche:
          form.dateEmbauche ||
          undefined,

        serviceId:
          form.serviceId
            ? Number(form.serviceId)
            : undefined,

        /* ==================================================
           COMPTE UTILISATEUR
        ================================================== */

        creerCompte:
          form.creerCompte,

        emailCompte:
          form.emailCompte.trim() ||
          undefined,

        motDePasse:
          form.motDePasse.trim() ||
          undefined,

        roleId:
          form.roleId
            ? Number(form.roleId)
            : undefined,
      };

      /* ====================================================
         CRÉATION / MODIFICATION
      ==================================================== */

      const result = isEdit
        ? await updateEmploye(
            employe!.id,
            {
              ...data,
              actif:
                employe!.actif,
            }
          )
        : await createEmploye(
            data
          );

      /* ====================================================
         ERREUR
      ==================================================== */

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      /* ====================================================
         SUCCÈS
      ==================================================== */

      toast.success(
        result.message
      );

      /* ====================================================
         RESET
      ==================================================== */

      if (!isEdit) {
        setForm({
          ...emptyForm,
        });
      }

      /* ====================================================
         FERMER
      ==================================================== */

      onClose?.();

    } catch (error) {
      console.error(
        "EMPLOYE FORM:",
        error
      );

      toast.error(
        "Une erreur inattendue est survenue."
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
      {/* ==================================================
          INFORMATIONS PERSONNELLES
      ================================================== */}

      <section>
        <h3 className="text-sm font-semibold mb-4">
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NOM */}

          <Field
            label="Nom *"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom"
            disabled={loading}
          />

          {/* POST-NOM */}

          <Field
            label="Post-nom"
            name="postNom"
            value={form.postNom}
            onChange={handleChange}
            placeholder="Post-nom"
            disabled={loading}
          />

          {/* PRÉNOM */}

          <Field
            label="Prénom"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            disabled={loading}
          />

          {/* SEXE */}

          <SelectField
            label="Sexe"
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            disabled={loading}
            options={[
              {
                value: "M",
                label: "Masculin",
              },
              {
                value: "F",
                label: "Féminin",
              },
            ]}
          />

          {/* DATE NAISSANCE */}

          <Field
            label="Date de naissance"
            name="dateNaissance"
            type="date"
            value={
              form.dateNaissance
            }
            onChange={handleChange}
            disabled={loading}
          />

          {/* TÉLÉPHONE */}

          <Field
            label="Téléphone"
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            placeholder="+243 ..."
            disabled={loading}
          />

          {/* EMAIL */}

          <Field
            label="Email professionnel"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="employe@hopital.com"
            disabled={loading}
          />

          {/* ADRESSE */}

          <div className="form-control md:col-span-2">
            <label className="label py-1">
              <span className="label-text font-medium">
                Adresse
              </span>
            </label>

            <textarea
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              placeholder="Adresse de l'employé"
              rows={2}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          INFORMATIONS PROFESSIONNELLES
      ================================================== */}

      <section>
        <h3 className="text-sm font-semibold mb-4">
          Informations professionnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* MATRICULE */}

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-medium">
                Matricule
              </span>
            </label>

            <input
              value={
                isEdit
                  ? employe?.matricule ??
                    ""
                  : "Généré automatiquement"
              }
              className="input input-bordered w-full"
              disabled
              readOnly
            />
          </div>

          {/* FONCTION */}

          <Field
            label="Fonction"
            name="fonction"
            value={form.fonction}
            onChange={handleChange}
            placeholder="Ex : Secrétaire"
            disabled={loading}
          />

          {/* DATE EMBAUCHE */}

          <Field
            label="Date d'embauche"
            name="dateEmbauche"
            type="date"
            value={
              form.dateEmbauche
            }
            onChange={handleChange}
            disabled={loading}
          />

          {/* SERVICE */}

          <SelectField
            label="Service"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            disabled={loading}
            options={services.map(
              (service) => ({
                value: String(
                  service.id
                ),
                label:
                  service.nom,
              })
            )}
          />
        </div>
      </section>

      {/* ==================================================
          COMPTE UTILISATEUR
      ================================================== */}

      <section className="border border-base-300 rounded-lg p-4">

        <h3 className="text-sm font-semibold mb-3">
          Compte utilisateur
        </h3>

        {/* CHECKBOX */}

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="creerCompte"
            checked={
              form.creerCompte
            }
            onChange={
              handleChange
            }
            className="checkbox checkbox-primary checkbox-sm"
            disabled={loading}
          />

          <span className="text-sm font-medium">
            {isEdit && employe?.user
              ? "Gérer le compte utilisateur"
              : "Créer un compte utilisateur"}
          </span>
        </label>

        {/* INFORMATIONS COMPTE */}

        {form.creerCompte && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            {/* EMAIL COMPTE */}

            <div className="md:col-span-2">

              <Field
                label="Email de connexion *"
                name="emailCompte"
                type="email"
                value={
                  form.emailCompte
                }
                onChange={
                  handleChange
                }
                placeholder="utilisateur@hopital.com"
                disabled={loading}
              />

            </div>

            {/* MOT DE PASSE */}

            <Field
              label={
                isEdit &&
                employe?.user
                  ? "Nouveau mot de passe"
                  : "Mot de passe *"
              }
              name="motDePasse"
              type="password"
              value={
                form.motDePasse
              }
              onChange={
                handleChange
              }
              placeholder={
                isEdit &&
                employe?.user
                  ? "Laisser vide pour conserver"
                  : "Minimum 6 caractères"
              }
              disabled={loading}
            />

            {/* RÔLE */}

            <SelectField
              label={
                !isEdit ||
                !employe?.user
                  ? "Rôle *"
                  : "Rôle"
              }
              name="roleId"
              value={
                form.roleId
              }
              onChange={
                handleChange
              }
              disabled={loading}
              options={roles.map(
                (role) => ({
                  value: String(
                    role.id
                  ),
                  label:
                    role.nom,
                })
              )}
            />

          </div>
        )}

        {/* MESSAGE */}

        {!form.creerCompte && (
          <p className="text-xs text-base-content/60 mt-3">
            Aucun compte utilisateur
            ne sera créé ou modifié.
          </p>
        )}

      </section>

      {/* ==================================================
          INFORMATION MATRICULE
      ================================================== */}

      {!isEdit && (
        <div className="alert alert-info py-3">
          <span className="text-sm">
            Le matricule sera généré
            automatiquement.
          </span>
        </div>
      )}

      {/* ==================================================
          BOUTONS
      ================================================== */}

      <div className="flex justify-end gap-2 pt-2">

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Enregistrement...
            </>
          ) : isEdit ? (
            "Enregistrer les modifications"
          ) : (
            "Enregistrer l'employé"
          )}
        </button>

      </div>
    </form>
  );
}

/* ==========================================================
   INPUT
========================================================== */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  name: string;
  value: string;

  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => void;

  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="form-control">

      <label className="label py-1">
        <span className="label-text font-medium">
          {label}
        </span>
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input input-bordered w-full"
      />

    </div>
  );
}

/* ==========================================================
   SELECT
========================================================== */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  name: string;
  value: string;

  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => void;

  options: {
    value: string;
    label: string;
  }[];

  disabled?: boolean;
}) {
  return (
    <div className="form-control">

      <label className="label py-1">
        <span className="label-text font-medium">
          {label}
        </span>
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="select select-bordered w-full"
      >

        <option value="">
          Sélectionner
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}

      </select>

    </div>
  );
}