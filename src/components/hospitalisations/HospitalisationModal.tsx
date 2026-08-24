"use client";

import {
  X,
  Bed,
  ClipboardPlus,
} from "lucide-react";

import HospitalisationForm, {
  type Hospitalisation,
} from "./HospitalisationForm";

/* ==========================================================
   TYPES
========================================================== */

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
  open: boolean;
  onClose: () => void;

  patients?: Patient[];
  admissions?: Admission[];
  medecins?: Medecin[];
  services?: Service[];
  lits?: Lit[];

  hospitalisation?: Hospitalisation | null;
};

/* ==========================================================
   COMPONENT
========================================================== */

export default function HospitalisationModal({
  open,
  onClose,
  patients = [],
  admissions = [],
  medecins = [],
  services = [],
  lits = [],
  hospitalisation = null,
}: Props) {
  if (!open) {
    return null;
  }

  const isEdit = hospitalisation !== null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospitalisation-modal-title"
    >
      {/* ====================================================
          BACKDROP
      ==================================================== */}

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ====================================================
          MODAL
      ==================================================== */}

      <div
        className="
          relative
          flex
          w-full
          max-w-5xl
          max-h-[94vh]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-base-100
          shadow-2xl
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="shrink-0 border-b border-base-300 bg-base-100">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary
                  text-primary-content
                "
              >
                {isEdit ? (
                  <ClipboardPlus size={22} />
                ) : (
                  <Bed size={22} />
                )}
              </div>

              <div className="min-w-0">
                <h2
                  id="hospitalisation-modal-title"
                  className="truncate text-lg font-bold sm:text-xl"
                >
                  {isEdit
                    ? "Modifier l'hospitalisation"
                    : "Nouvelle hospitalisation"}
                </h2>

                <p className="truncate text-sm text-base-content/60">
                  {isEdit
                    ? `Dossier ${hospitalisation.numero}`
                    : "Enregistrer un nouveau séjour hospitalier"}
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              className="
                btn
                btn-sm
                btn-circle
                btn-ghost
                shrink-0
              "
              aria-label="Fermer la fenêtre"
              title="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* ==================================================
              EDIT INFO BAR
          ================================================== */}

          {isEdit && hospitalisation && (
            <div className="flex flex-wrap items-center gap-2 border-t border-base-300 bg-base-200/40 px-5 py-2.5 text-xs sm:px-6">
              <span className="font-medium">
                Hospitalisation :
              </span>

              <span className="badge badge-primary badge-sm">
                {hospitalisation.numero}
              </span>

              <span className="text-base-content/40">
                •
              </span>

              <span
                className={`
                  badge
                  badge-sm
                  ${
                    hospitalisation.statut ===
                    "EN_COURS"
                      ? "badge-success"
                      : hospitalisation.statut ===
                        "TERMINEE"
                      ? "badge-info"
                      : "badge-error"
                  }
                `}
              >
                {hospitalisation.statut ===
                "EN_COURS"
                  ? "En cours"
                  : hospitalisation.statut ===
                    "TERMINEE"
                  ? "Terminée"
                  : hospitalisation.statut ===
                    "ANNULEE"
                  ? "Annulée"
                  : hospitalisation.statut}
              </span>
            </div>
          )}
        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <HospitalisationForm
              patients={patients}
              admissions={admissions}
              medecins={medecins}
              services={services}
              lits={lits}
              hospitalisation={
                hospitalisation
              }
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}