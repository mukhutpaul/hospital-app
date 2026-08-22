"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { createUtilisateur } from "@/app/actions/utilisateurs";


type Role = {
  id: number;
  nom: string;
};

type Props = {
  roles?: Role[];
};

export default function UtilisateurForm({
  roles = [],
}: Props) {
  const router = useRouter();

  // =========================================
  // ÉTATS
  // =========================================

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    password: "",
    roleId: "",
    actif: true,
  });

  // =========================================
  // CHANGEMENT DES CHAMPS
  // =========================================

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const target = event.target;

    const name = target.name;
    const value = target.value;

    setFormData((previous) => ({
      ...previous,
      [name]:
        target.type === "checkbox"
          ? (target as HTMLInputElement).checked
          : value,
    }));

    setError("");
    setSuccess("");
  }

  // =========================================
  // SOUMISSION
  // =========================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // =========================================
    // NETTOYAGE
    // =========================================

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const telephone = formData.telephone.trim();
    const password = formData.password;

    // =========================================
    // VALIDATION
    // =========================================

    if (!name) {
      setError("Le nom de l'utilisateur est obligatoire.");
      return;
    }

    if (!email) {
      setError("L'adresse email est obligatoire.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    if (!password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (!formData.roleId) {
      setError("Veuillez sélectionner un rôle.");
      return;
    }

    // =========================================
    // APPEL SERVER ACTION
    // =========================================

    try {
      setLoading(true);

      const result = await createUtilisateur({
        name,
        email,
        telephone: telephone || null,
        password,
        roleId: Number(formData.roleId),
        actif: formData.actif,
      });

      // =========================================
      // RÉSULTAT
      // =========================================

      if (!result.success) {
        setError(
          result.message ||
            "Impossible de créer l'utilisateur."
        );
        return;
      }

      // =========================================
      // SUCCÈS
      // =========================================

      setSuccess(
        result.message ||
          "Utilisateur créé avec succès."
      );

      // =========================================
      // RESET
      // =========================================

      setFormData({
        name: "",
        email: "",
        telephone: "",
        password: "",
        roleId: "",
        actif: true,
      });

      setShowPassword(false);

      // =========================================
      // RAFRAÎCHIR
      // =========================================

      router.refresh();

      // =========================================
      // RETOUR À LA LISTE
      // =========================================

      setTimeout(() => {
        router.push("/utilisateurs");
      }, 800);
    } catch (error) {
      console.error(
        "Erreur création utilisateur :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de l'utilisateur."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // ANNULER
  // =========================================

  function handleCancel() {
    if (loading) return;

    router.push("/utilisateurs");
  }

  // =========================================
  // AFFICHAGE
  // =========================================

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">

        {/* HEADER */}

        <div className="flex items-center gap-3 pb-5 border-b border-base-300">

          <div className="avatar placeholder">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <User size={24} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Nouvel utilisateur
            </h2>

            <p className="text-sm text-base-content/60">
              Créer un nouveau compte utilisateur
            </p>
          </div>

        </div>

        {/* ERREUR */}

        {error && (
          <div className="alert alert-error mt-5">
            <span>{error}</span>
          </div>
        )}

        {/* SUCCÈS */}

        {success && (
          <div className="alert alert-success mt-5">
            <span>{success}</span>
          </div>
        )}

        {/* FORMULAIRE */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 mt-5"
        >

          {/* INFORMATIONS */}

          <section>

            <h3 className="text-lg font-semibold mb-4">
              Informations utilisateur
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NOM */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Nom complet
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <User
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex : Jean Dupont"
                    className="grow"
                    disabled={loading}
                    autoComplete="name"
                  />

                </label>

              </div>

              {/* EMAIL */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Adresse email
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <Mail
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@hospital.local"
                    className="grow"
                    disabled={loading}
                    autoComplete="email"
                  />

                </label>

              </div>

              {/* TELEPHONE */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Téléphone
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <Phone
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+243 ..."
                    className="grow"
                    disabled={loading}
                    autoComplete="tel"
                  />

                </label>

              </div>

              {/* ROLE */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-medium">
                    Rôle
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>

                </label>

                <label className="select select-bordered flex items-center gap-2">

                  <ShieldCheck
                    size={18}
                    className="text-base-content/50"
                  />

                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="grow"
                    disabled={loading}
                  >

                    <option value="">
                      Sélectionner un rôle
                    </option>

                    {roles.length === 0 ? (
                      <option disabled>
                        Aucun rôle disponible
                      </option>
                    ) : (
                      roles.map((role) => (
                        <option
                          key={role.id}
                          value={role.id}
                        >
                          {role.nom}
                        </option>
                      ))
                    )}

                  </select>

                </label>

                {roles.length === 0 && (
                  <label className="label">

                    <span className="label-text-alt text-warning">
                      Aucun rôle n'est disponible.
                    </span>

                  </label>
                )}

              </div>

            </div>

          </section>

          {/* SÉCURITÉ */}

          <section>

            <h3 className="text-lg font-semibold mb-4">
              Sécurité du compte
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* MOT DE PASSE */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-medium">
                    Mot de passe
                  </span>

                  <span className="label-text-alt text-error">
                    *
                  </span>

                </label>

                <label className="input input-bordered flex items-center gap-2">

                  <Lock
                    size={18}
                    className="text-base-content/50"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 caractères"
                    className="grow"
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </label>

                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Minimum 8 caractères
                  </span>
                </label>

              </div>

              {/* STATUT */}

              <div className="form-control">

                <label className="label">
                  <span className="label-text font-medium">
                    Statut du compte
                  </span>
                </label>

                <label className="label cursor-pointer justify-start gap-4 border border-base-300 rounded-lg px-4 py-3">

                  <input
                    type="checkbox"
                    name="actif"
                    className="toggle toggle-success"
                    checked={formData.actif}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <div>

                    <p className="font-medium">
                      Compte actif
                    </p>

                    <p className="text-xs text-base-content/60">
                      L'utilisateur pourra se connecter
                    </p>

                  </div>

                </label>

              </div>

            </div>

          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-base-300">

            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              <X size={18} />
              Annuler
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading || roles.length === 0
              }
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Création...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Créer l'utilisateur
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}