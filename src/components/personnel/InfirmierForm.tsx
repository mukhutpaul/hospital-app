"use client";

import { useState } from "react";
import {
  createInfirmier,
  updateInfirmier,
} from "@/app/actions/infirmiers";
import { toast } from "react-toastify";

type Service = {
  id: number;
  nom: string;
};

type Role = {
  id: number;
  nom: string;
};

export type Infirmier = {
  id: number;
  matricule: string;
  employeId: number;

  nom: string | null;
  postNom: string | null;
  prenom: string | null;
  sexe: string | null;
  telephone: string | null;
  email: string | null;
  dateEmbauche: Date | string | null;

  numeroOrdre: string | null;
  grade: string | null;
  niveau: string | null;
  fonction: string | null;

  serviceId: number | null;
  userId?: number | null;

  actif: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type Props = {
  services?: Service[];
  roles?: Role[];
  infirmier?: Infirmier | null;
  onClose?: () => void;
};

type FormData = {
  nom: string;
  postNom: string;
  prenom: string;
  sexe: string;
  telephone: string;
  email: string;
  dateEmbauche: string;
  fonction: string;
  numeroOrdre: string;
  grade: string;
  niveau: string;
  serviceId: string;

  creerCompte: boolean;
  userEmail: string;
  userPassword: string;
  roleId: string;
};

const emptyForm: FormData = {
  nom: "",
  postNom: "",
  prenom: "",
  sexe: "",
  telephone: "",
  email: "",
  dateEmbauche: "",
  fonction: "",
  numeroOrdre: "",
  grade: "",
  niveau: "",
  serviceId: "",
  creerCompte: false,
  userEmail: "",
  userPassword: "",
  roleId: "",
};

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";

  const d = new Date(date);

  return Number.isNaN(d.getTime())
    ? ""
    : d.toISOString().split("T")[0];
}

export default function InfirmierForm({
  services = [],
  roles = [],
  infirmier = null,
  onClose,
}: Props) {
  const isEdit = Boolean(infirmier);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>(() => {
    if (!infirmier) return { ...emptyForm };

    return {
      nom: infirmier.nom ?? "",
      postNom: infirmier.postNom ?? "",
      prenom: infirmier.prenom ?? "",
      sexe: infirmier.sexe ?? "",
      telephone: infirmier.telephone ?? "",
      email: infirmier.email ?? "",
      dateEmbauche: formatDate(infirmier.dateEmbauche),

      fonction: infirmier.fonction ?? "",
      numeroOrdre: infirmier.numeroOrdre ?? "",
      grade: infirmier.grade ?? "",
      niveau: infirmier.niveau ?? "",

      serviceId:
        infirmier.serviceId != null
          ? String(infirmier.serviceId)
          : "",

      creerCompte: Boolean(infirmier.userId),
      userEmail: infirmier.email ?? "",
      userPassword: "",
      roleId: "",
    };
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.nom.trim()) {
      toast.error("Le nom est obligatoire.");
      return;
    }

    if (!form.prenom.trim()) {
      toast.error("Le prénom est obligatoire.");
      return;
    }

    if (form.creerCompte) {
      if (!form.userEmail.trim()) {
        toast.error(
          "L'adresse email du compte est obligatoire."
        );
        return;
      }

      if (!isEdit && !form.userPassword.trim()) {
        toast.error(
          "Le mot de passe est obligatoire."
        );
        return;
      }

      if (
        form.userPassword.trim() &&
        form.userPassword.length < 6
      ) {
        toast.error(
          "Le mot de passe doit contenir au moins 6 caractères."
        );
        return;
      }

      if (!isEdit && !form.roleId) {
        toast.error(
          "Veuillez sélectionner le rôle de l'utilisateur."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const data = {
        nom: form.nom.trim(),
        postNom: form.postNom.trim() || undefined,
        prenom: form.prenom.trim(),
        sexe: form.sexe || undefined,
        telephone: form.telephone.trim() || undefined,
        email: form.email.trim() || undefined,
        dateEmbauche: form.dateEmbauche || undefined,

        fonction: form.fonction.trim() || undefined,
        numeroOrdre:
          form.numeroOrdre.trim() || undefined,
        grade: form.grade.trim() || undefined,
        niveau: form.niveau.trim() || undefined,

        serviceId: form.serviceId
          ? Number(form.serviceId)
          : undefined,

        creerCompte: form.creerCompte,
        userEmail:
          form.userEmail.trim() || undefined,
        userPassword:
          form.userPassword.trim() || undefined,
        roleId: form.roleId
          ? Number(form.roleId)
          : undefined,
      };

      const result = isEdit
        ? await updateInfirmier(infirmier!.id, {
            ...data,
            actif: infirmier!.actif,
          })
        : await createInfirmier(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      if (!isEdit) {
        setForm({ ...emptyForm });
      }

      onClose?.();
    } catch (error) {
      console.error("Erreur infirmier :", error);

      toast.error(
        "Une erreur inattendue est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* INFORMATIONS PERSONNELLES */}

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

          <SelectField
            label="Sexe"
            name="sexe"
            value={form.sexe}
            onChange={handleChange}
            disabled={loading}
            options={[
              { value: "M", label: "Masculin" },
              { value: "F", label: "Féminin" },
            ]}
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
            placeholder="infirmier@hopital.com"
            disabled={loading}
          />

          <Field
            label="Date d'embauche"
            name="dateEmbauche"
            type="date"
            value={form.dateEmbauche}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </section>

      {/* INFORMATIONS PROFESSIONNELLES */}

      <section>
        <h3 className="text-sm font-semibold mb-3">
          Informations professionnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Fonction"
            name="fonction"
            value={form.fonction}
            onChange={handleChange}
            placeholder="Infirmier titulaire"
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

          <Field
            label="Grade"
            name="grade"
            value={form.grade}
            onChange={handleChange}
            placeholder="Infirmier titulaire"
            disabled={loading}
          />

          <Field
            label="Niveau"
            name="niveau"
            value={form.niveau}
            onChange={handleChange}
            placeholder="A1, A2, A3..."
            disabled={loading}
          />

          <div className="form-control md:col-span-2">
            <label className="label py-1">
              <span className="label-text font-medium">
                Service
              </span>
            </label>

            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="select select-bordered select-sm w-full"
              disabled={loading}
            >
              <option value="">
                Sélectionner un service
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
        </div>
      </section>

      {/* COMPTE UTILISATEUR */}

      <section className="border border-base-300 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">
          Compte utilisateur
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="creerCompte"
            checked={form.creerCompte}
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
            <div className="md:col-span-2">
              <Field
                label="Email de connexion *"
                name="userEmail"
                type="email"
                value={form.userEmail}
                onChange={handleChange}
                placeholder="infirmier@hopital.com"
                disabled={loading}
              />
            </div>

            <Field
              label={
                isEdit
                  ? "Nouveau mot de passe"
                  : "Mot de passe *"
              }
              name="userPassword"
              type="password"
              value={form.userPassword}
              onChange={handleChange}
              placeholder={
                isEdit
                  ? "Laisser vide pour conserver"
                  : "Minimum 6 caractères"
              }
              disabled={loading}
            />

            <SelectField
              label={
                isEdit
                  ? "Rôle"
                  : "Rôle *"
              }
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              disabled={loading}
              options={roles.map((role) => ({
                value: String(role.id),
                label: role.nom,
              }))}
            />
          </div>
        )}

        {!form.creerCompte && (
          <p className="text-xs text-base-content/60 mt-3">
            Aucun compte de connexion ne sera créé.
          </p>
        )}
      </section>

      {/* MATRICULE */}

      {!isEdit && (
        <div className="alert alert-info py-3">
          <span className="text-sm">
            Le matricule sera généré automatiquement.
          </span>
        </div>
      )}

      {/* ACTIONS */}

      <div className="flex justify-end gap-2 pt-2">
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
            "Enregistrer l'infirmier"
          )}
        </button>
      </div>
    </form>
  );
}

/* ==========================================================
   CHAMP INPUT
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
        className="select select-bordered select-sm w-full"
      >
        <option value="">
          Sélectionner
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}