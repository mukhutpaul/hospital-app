"use client";

import { useState } from "react";

import {
  createMedecin,
  updateMedecin,
} from "@/app/actions/medecins";

import { toast } from "react-toastify";

/* ==========================================================
   TYPES
========================================================== */

type Service = {
  id: number;
  nom: string;
};

type Specialite = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

export type Medecin = {
  id: number;
  matricule: string;

  nom: string;
  postNom: string | null;
  prenom: string;

  telephone: string | null;
  email: string | null;
  numeroOrdre: string | null;

  actif: boolean;

  serviceId: number | null;
  specialiteId: number | null;

  userId?: number | null;
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  services?: Service[];
  specialites?: Specialite[];
  roles?: Role[];
  medecin?: Medecin | null;
  onClose?: () => void;
};

/* ==========================================================
   FORM DATA
========================================================== */

type FormData = {
  nom: string;
  postNom: string;
  prenom: string;

  telephone: string;
  email: string;
  numeroOrdre: string;

  serviceId: string;
  specialiteId: string;

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

  telephone: "",
  email: "",
  numeroOrdre: "",

  serviceId: "",
  specialiteId: "",

  creerCompte: false,

  emailCompte: "",
  motDePasse: "",
  roleId: "",
};

/* ==========================================================
   CREATION DU FORMULAIRE INITIAL
========================================================== */

function getInitialForm(
  medecin?: Medecin | null
): FormData {
  if (!medecin) {
    return {
      ...emptyForm,
    };
  }

  return {
    nom: medecin.nom ?? "",

    postNom:
      medecin.postNom ?? "",

    prenom:
      medecin.prenom ?? "",

    telephone:
      medecin.telephone ?? "",

    email:
      medecin.email ?? "",

    numeroOrdre:
      medecin.numeroOrdre ?? "",

    serviceId:
      medecin.serviceId != null
        ? String(medecin.serviceId)
        : "",

    specialiteId:
      medecin.specialiteId != null
        ? String(medecin.specialiteId)
        : "",

    /*
     * Si le médecin possède déjà un utilisateur,
     * on active automatiquement la section compte.
     */
    creerCompte:
      Boolean(medecin.userId),

    /*
     * L'email du médecin peut servir de valeur
     * initiale pour l'email du compte.
     */
    emailCompte:
      medecin.email ?? "",

    /*
     * Pour des raisons de sécurité, le mot de passe
     * n'est jamais prérempli.
     */
    motDePasse: "",

    /*
     * Le rôle n'est pas connu dans Medecin.
     * Il pourra être sélectionné lors de la modification.
     */
    roleId: "",
  };
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MedecinForm({
  services = [],
  specialites = [],
  roles = [],
  medecin = null,
  onClose,
}: Props) {
  const isEdit = Boolean(medecin);

  const [loading, setLoading] =
    useState(false);

  /*
   * Initialisation directe du state.
   *
   * IMPORTANT :
   * Pas de useEffect + setForm().
   */
  const [form, setForm] =
    useState<FormData>(() =>
      getInitialForm(medecin)
    );

  /* ========================================================
     CHANGEMENT
  ======================================================== */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    /*
     * Gestion checkbox
     */
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox"
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));

      return;
    }

    /*
     * Gestion input/select
     */
    setForm((prev) => ({
      ...prev,
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

    /* ------------------------------------------------------
       VALIDATION MÉDECIN
    ------------------------------------------------------ */

    if (!form.nom.trim()) {
      toast.error(
        "Le nom est obligatoire."
      );

      return;
    }

    if (!form.prenom.trim()) {
      toast.error(
        "Le prénom est obligatoire."
      );

      return;
    }

    /* ------------------------------------------------------
       VALIDATION COMPTE UTILISATEUR
    ------------------------------------------------------ */

    if (form.creerCompte) {
      /*
       * Email du compte obligatoire
       */
      if (!form.emailCompte.trim()) {
        toast.error(
          "L'adresse email du compte utilisateur est obligatoire."
        );

        return;
      }

      /*
       * Vérification simple de l'email
       */
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.emailCompte.trim()
        )
      ) {
        toast.error(
          "Veuillez saisir une adresse email valide."
        );

        return;
      }

      /*
       * Création :
       * mot de passe obligatoire
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
       * Mot de passe minimum 6 caractères
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
       * Lors de la création :
       * rôle obligatoire
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
    }

    setLoading(true);

    try {
      /* ----------------------------------------------------
         DONNÉES
      ---------------------------------------------------- */

      const data = {
        nom:
          form.nom.trim(),

        postNom:
          form.postNom.trim() ||
          undefined,

        prenom:
          form.prenom.trim(),

        telephone:
          form.telephone.trim() ||
          undefined,

        email:
          form.email.trim() ||
          undefined,

        numeroOrdre:
          form.numeroOrdre.trim() ||
          undefined,

        serviceId:
          form.serviceId
            ? Number(form.serviceId)
            : undefined,

        specialiteId:
          form.specialiteId
            ? Number(form.specialiteId)
            : undefined,

        /*
         * COMPTE UTILISATEUR
         *
         * Ces noms doivent correspondre
         * exactement à ton Server Action.
         */

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

      /* ----------------------------------------------------
         CREATE / UPDATE
      ---------------------------------------------------- */

      const result = isEdit
        ? await updateMedecin(
            medecin!.id,
            {
              ...data,

              /*
               * On conserve le statut actuel.
               */
              actif:
                medecin!.actif,
            }
          )
        : await createMedecin(
            data
          );

      /* ----------------------------------------------------
         ERREUR
      ---------------------------------------------------- */

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      /* ----------------------------------------------------
         SUCCÈS
      ---------------------------------------------------- */

      toast.success(
        result.message
      );

      /*
       * Réinitialisation après création.
       */
      if (!isEdit) {
        setForm({
          ...emptyForm,
        });
      }

      /*
       * Fermeture du modal.
       */
      onClose?.();

    } catch (error) {
      console.error(
        "Erreur médecin :",
        error
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement."
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
      className="space-y-5"
    >

      {/* ====================================================
          INFORMATIONS PERSONNELLES
      ==================================================== */}

      <section>
        <h3 className="text-sm font-semibold mb-3">
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <Field
            label="Nom *"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom"
            disabled={loading}
          />

          <Field
            label="Post-nom"
            name="postNom"
            value={form.postNom}
            onChange={handleChange}
            placeholder="Post-nom"
            disabled={loading}
          />

          <Field
            label="Prénom *"
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            disabled={loading}
          />

          <Field
            label="Téléphone"
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            placeholder="+243 ..."
            disabled={loading}
          />

          <Field
            label="Email professionnel"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="medecin@hopital.com"
            disabled={loading}
          />

          <Field
            label="Numéro d'ordre"
            name="numeroOrdre"
            value={form.numeroOrdre}
            onChange={handleChange}
            placeholder="N° ordre professionnel"
            disabled={loading}
          />

        </div>
      </section>

      {/* ====================================================
          AFFECTATION
      ==================================================== */}

      <section>
        <h3 className="text-sm font-semibold mb-3">
          Affectation professionnelle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <SelectField
            label="Service"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            disabled={loading}
            options={services.map(
              (service) => ({
                value:
                  String(service.id),

                label:
                  service.nom,
              })
            )}
          />

          <SelectField
            label="Spécialité"
            name="specialiteId"
            value={form.specialiteId}
            onChange={handleChange}
            disabled={loading}
            options={specialites.map(
              (specialite) => ({
                value:
                  String(
                    specialite.id
                  ),

                label:
                  specialite.nom,
              })
            )}
          />

        </div>
      </section>

      {/* ====================================================
          COMPTE UTILISATEUR
      ==================================================== */}

      <section className="border border-base-300 rounded-lg p-4">

        <h3 className="text-sm font-semibold mb-3">
          Compte utilisateur
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">

          <input
            type="checkbox"
            name="creerCompte"
            checked={
              form.creerCompte
            }
            onChange={handleChange}
            className="checkbox checkbox-primary checkbox-sm"
            disabled={loading}
          />

          <span className="text-sm font-medium">
            Créer un compte utilisateur
          </span>

        </label>

        {form.creerCompte && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

            {/* EMAIL COMPTE */}

            <div className="md:col-span-2">

              <Field
                label="Email du compte utilisateur *"
                name="emailCompte"
                type="email"
                value={
                  form.emailCompte
                }
                onChange={
                  handleChange
                }
                placeholder="medecin@hopital.com"
                disabled={loading}
              />

            </div>

            {/* MOT DE PASSE */}

            <Field
              label={
                isEdit
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
                isEdit
                  ? "Laisser vide pour conserver"
                  : "Minimum 6 caractères"
              }
              disabled={loading}
            />

            {/* ROLE */}

            <SelectField
              label={
                isEdit
                  ? "Rôle"
                  : "Rôle *"
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
                  value:
                    String(
                      role.id
                    ),

                  label:
                    role.nom,
                })
              )}
            />

          </div>
        )}

        {!form.creerCompte && (
          <p className="text-xs text-base-content/60 mt-3">
            Aucun compte de connexion ne sera créé.
          </p>
        )}

      </section>

      {/* ====================================================
          MATRICULE
      ==================================================== */}

      <div className="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2">

        {isEdit && medecin ? (
          <div className="text-sm">

            <span className="text-base-content/60">
              Matricule :
            </span>{" "}

            <strong className="font-mono">
              {medecin.matricule}
            </strong>

          </div>
        ) : (
          <div className="text-xs text-base-content/60">
            Le matricule du médecin sera généré
            automatiquement lors de l'enregistrement.
          </div>
        )}

      </div>

      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <div className="flex justify-end gap-2 pt-1">

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading}
        >

          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Enregistrement...
            </>
          ) : isEdit ? (
            "Enregistrer les modifications"
          ) : (
            "Enregistrer le médecin"
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
      HTMLInputElement | HTMLSelectElement
    >
  ) => void;

  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="form-control">

      <label className="label py-0.5">
        <span className="label-text text-sm font-medium">
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
        className="input input-bordered input-sm w-full"
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
      HTMLInputElement | HTMLSelectElement
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

      <label className="label py-0.5">
        <span className="label-text text-sm font-medium">
          {label}
        </span>
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="select select-bordered select-sm w-full"
      >

        <option value="">
          Sélectionner
        </option>

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}

      </select>

    </div>
  );
}