
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Stethoscope,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  createSpecialite,
  updateSpecialite,
} from "@/app/actions/specialite";

/* ==========================================================
   TYPES
========================================================== */

type Specialite = {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  serviceId: number | null;
  actif: boolean;
};

type Props = {
  open: boolean;
  specialite: Specialite | null;

  services: {
    id: number;
    code: string;
    nom: string;
  }[];

  onClose: () => void;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function SpecialiteModal({
  open,
  specialite,
  services,
  onClose,
}: Props) {
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [actif, setActif] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ========================================================
     INITIALISATION
  ======================================================== */

  useEffect(() => {
    if (!open) return;

    if (specialite) {
      setCode(specialite.code);
      setNom(specialite.nom);
      setDescription(specialite.description ?? "");
      setServiceId(
        specialite.serviceId
          ? String(specialite.serviceId)
          : ""
      );
      setActif(specialite.actif);
    } else {
      setCode("");
      setNom("");
      setDescription("");
      setServiceId("");
      setActif(true);
    }
  }, [open, specialite]);

  /* ========================================================
     SERVICE SELECTIONNE
  ======================================================== */

  const selectedService = services.find(
    (service) =>
      String(service.id) === serviceId
  );

  /* ========================================================
     SUBMIT
  ======================================================== */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const cleanCode = code
      .trim()
      .toUpperCase();

    const cleanNom = nom.trim();

    const cleanDescription =
      description.trim();

    if (!cleanCode) {
      toast.error(
        "Le code de la spécialité est obligatoire."
      );
      return;
    }

    if (!cleanNom) {
      toast.error(
        "Le nom de la spécialité est obligatoire."
      );
      return;
    }

    try {
      setLoading(true);

      const data = {
        code: cleanCode,
        nom: cleanNom,
        description:
          cleanDescription || null,
        serviceId: serviceId
          ? Number(serviceId)
          : null,
        actif,
      };

      const response = specialite
        ? await updateSpecialite(
            specialite.id,
            data
          )
        : await createSpecialite(data);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);

      onClose();

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <dialog
      open
      className="modal modal-middle"
    >
      <div
        className="
          modal-box
          w-[95vw]
          max-w-3xl
          overflow-hidden
          rounded-2xl
          border
          border-base-200
          bg-base-100
          p-0
          shadow-2xl
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="border-b border-base-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary
                  text-primary-content
                "
              >
                <Stethoscope size={24} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    {specialite
                      ? "Modifier la spécialité"
                      : "Nouvelle spécialité"}
                  </h2>

                  {specialite && (
                    <span className="badge badge-primary badge-sm">
                      Modification
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-base-content/55">
                  Gestion des spécialités médicales
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                btn
                btn-circle
                btn-sm
                btn-ghost
              "
              aria-label="Fermer"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[78vh] flex-col"
        >
          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="overflow-y-auto p-6">

            {/* ===============================================
                INFORMATIONS PRINCIPALES
            =============================================== */}

            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={16} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Informations générales
                  </h3>

                  <p className="text-xs text-base-content/50">
                    Identité de la spécialité médicale
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* CODE */}

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-medium">
                      Code
                      <span className="ml-1 text-error">
                        *
                      </span>
                    </span>

                    <span className="text-xs text-base-content/40">
                      {code.length}/20
                    </span>
                  </label>

                  <input
                    type="text"
                    value={code}
                    maxLength={20}
                    onChange={(e) =>
                      setCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/\s/g, "_")
                      )
                    }
                    placeholder="CARDIO"
                    className="
                      input
                      input-bordered
                      w-full
                      font-semibold
                      tracking-wide
                      focus:input-primary
                    "
                  />

                  <span className="mt-1 text-[11px] text-base-content/45">
                    Exemple : CARDIO, PEDIATRIE, ORL
                  </span>
                </div>

                {/* NOM */}

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-medium">
                      Nom
                      <span className="ml-1 text-error">
                        *
                      </span>
                    </span>
                  </label>

                  <input
                    type="text"
                    value={nom}
                    maxLength={100}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    placeholder="Cardiologie"
                    className="
                      input
                      input-bordered
                      w-full
                      focus:input-primary
                    "
                  />

                  <span className="mt-1 text-[11px] text-base-content/45">
                    Nom officiel de la spécialité
                  </span>
                </div>
              </div>
            </div>

            {/* ===============================================
                RATTACHEMENT + STATUT
            =============================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* SERVICE */}

              <div
                className="
                  rounded-xl
                  border
                  border-base-200
                  bg-base-50
                  p-4
                "
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Service de rattachement
                    </h3>

                    <p className="text-[11px] text-base-content/50">
                      Service responsable
                    </p>
                  </div>
                </div>

                <select
                  className="
                    select
                    select-bordered
                    w-full
                    focus:select-secondary
                  "
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
                      {service.code} — {service.nom}
                    </option>
                  ))}
                </select>

                {selectedService && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/5 px-3 py-2">
                    <Check
                      size={15}
                      className="text-secondary"
                    />

                    <span className="truncate text-xs font-medium">
                      {selectedService.nom}
                    </span>
                  </div>
                )}
              </div>

              {/* STATUT */}

              <div
                className={`
                  rounded-xl
                  border
                  p-4
                  transition
                  ${
                    actif
                      ? "border-success/25 bg-success/5"
                      : "border-base-200 bg-base-200/30"
                  }
                `}
              >
                <div className="flex h-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          actif
                            ? "bg-success/10 text-success"
                            : "bg-base-300 text-base-content/40"
                        }
                      `}
                    >
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          Statut
                        </h3>

                        <span
                          className={`
                            badge
                            badge-xs
                            ${
                              actif
                                ? "badge-success"
                                : "badge-ghost"
                            }
                          `}
                        >
                          {actif
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-base-content/50">
                        {actif
                          ? "Disponible pour les nouveaux enregistrements."
                          : "Non disponible pour les nouveaux enregistrements."}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={actif}
                    onChange={(e) =>
                      setActif(
                        e.target.checked
                      )
                    }
                    aria-label="Activer la spécialité"
                  />
                </div>
              </div>
            </div>

            {/* ===============================================
                DESCRIPTION
            =============================================== */}

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Activity size={16} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Description
                  </h3>

                  <p className="text-xs text-base-content/50">
                    Informations complémentaires
                  </p>
                </div>
              </div>

              <textarea
                value={description}
                maxLength={500}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Décrivez brièvement les domaines couverts par cette spécialité..."
                rows={4}
                className="
                  textarea
                  textarea-bordered
                  w-full
                  resize-none
                  leading-relaxed
                  focus:textarea-info
                "
              />

              <div className="mt-1 flex justify-end">
                <span className="text-[11px] text-base-content/40">
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* ===============================================
                NOTE
            =============================================== */}

            <div className="mt-5 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
              <div className="flex items-start gap-3">
                <Stethoscope
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <p className="text-xs leading-relaxed text-base-content/60">
                  Cette spécialité pourra être associée aux
                  médecins, consultations et dossiers médicaux
                  de l'établissement.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-t
              border-base-200
              bg-base-100
              px-6
              py-4
            "
          >
            <div className="hidden items-center gap-2 text-xs text-base-content/45 sm:flex">
              <span className="text-error">*</span>
              Champs obligatoires
            </div>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-ghost"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  btn
                  btn-primary
                  min-w-40
                  gap-2
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />

                    {specialite
                      ? "Enregistrer"
                      : "Créer la spécialité"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ====================================================
          BACKDROP
      ==================================================== */}

      <form
        method="dialog"
        className="modal-backdrop"
      >
        <button
          type="button"
          onClick={onClose}
        >
          close
        </button>
      </form>
    </dialog>
  );
}

