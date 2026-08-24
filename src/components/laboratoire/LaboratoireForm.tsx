"use client";

import { useState } from "react";

import {
  FlaskConical,
  Plus,
  Trash2,
  AlertTriangle,
  Send,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createDemandeLaboratoire,
} from "@/app/actions/laboratoire";

/*
==========================================================
TYPES
==========================================================
*/

type Patient = {
  id: number;
  numeroDossier: string;
  nom: string;
  postNom: string | null;
  prenom: string | null;
};

type Examen = {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  unite: string | null;
  valeurNormale: string | null;
  prix: number;
  devise: string;
};

type Service = {
  id: number;
  code: string;
  nom: string;
};

type Consultation = {
  idConsultation: number;
  patientId: number;
  dateConsultation: Date;
  motif: string | null;
  statut: string;
};

type Props = {
  patients: Patient[];
  examens: Examen[];
  services: Service[];
  consultations: Consultation[];
};

/*
==========================================================
COMPOSANT
==========================================================
*/

export default function LaboratoireForm({
  patients,
  examens,
  services,
  consultations,
}: Props) {
  /*
  ========================================================
  ÉTATS
  ========================================================
  */

  const [patientId, setPatientId] = useState("");

  const [consultationId, setConsultationId] =
    useState("");

  const [serviceId, setServiceId] =
    useState("");

  const [examenId, setExamenId] =
    useState("");

  const [
    examensSelectionnes,
    setExamensSelectionnes,
  ] = useState<Examen[]>([]);

  const [urgence, setUrgence] =
    useState(false);

  const [observation, setObservation] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /*
  ========================================================
  CONSULTATIONS DU PATIENT
  ========================================================
  */

  const consultationsPatient =
    patientId
      ? consultations.filter(
          (consultation) =>
            consultation.patientId ===
            Number(patientId),
        )
      : [];

  /*
  ========================================================
  EXAMEN SÉLECTIONNÉ
  ========================================================
  */

  const examenSelectionne =
    examens.find(
      (examen) =>
        examen.id === Number(examenId),
    );

  /*
  ========================================================
  AJOUTER UN EXAMEN
  ========================================================
  */

  function ajouterExamen() {
    if (!examenSelectionne) {
      toast.warning(
        "Veuillez sélectionner un examen.",
      );

      return;
    }

    const existe =
      examensSelectionnes.some(
        (examen) =>
          examen.id ===
          examenSelectionne.id,
      );

    if (existe) {
      toast.warning(
        "Cet examen est déjà ajouté.",
      );

      return;
    }

    setExamensSelectionnes(
      (prev) => [
        ...prev,
        examenSelectionne,
      ],
    );

    setExamenId("");
  }

  /*
  ========================================================
  SUPPRIMER UN EXAMEN
  ========================================================
  */

  function supprimerExamen(
    id: number,
  ) {
    setExamensSelectionnes(
      (prev) =>
        prev.filter(
          (examen) =>
            examen.id !== id,
        ),
    );
  }

  /*
  ========================================================
  CALCUL DU TOTAL
  ========================================================
  */

  const total =
    examensSelectionnes.reduce(
      (somme, examen) =>
        somme + Number(examen.prix),
      0,
    );

  /*
  ========================================================
  DEVISE
  ========================================================
  */

  const devise =
    examensSelectionnes[0]?.devise ??
    "USD";

  /*
  ========================================================
  SOUMISSION
  ========================================================
  */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    /*
    ------------------------------------------------------
    VALIDATION PATIENT
    ------------------------------------------------------
    */

    if (!patientId) {
      toast.error(
        "Veuillez sélectionner un patient.",
      );

      return;
    }

    /*
    ------------------------------------------------------
    VALIDATION EXAMENS
    ------------------------------------------------------
    */

    if (
      examensSelectionnes.length ===
      0
    ) {
      toast.error(
        "Veuillez sélectionner au moins un examen.",
      );

      return;
    }

    /*
    ------------------------------------------------------
    CONFIRMATION
    ------------------------------------------------------
    */

    const nombreExamens =
      examensSelectionnes.length;

    const confirmation =
      await Swal.fire({
        title:
          "Créer la demande ?",

        text: `${nombreExamens} examen${
          nombreExamens > 1
            ? "s"
            : ""
        } seront demandé${
          nombreExamens > 1
            ? "s"
            : ""
        }. Total estimé : ${total.toFixed(
          2,
        )} ${devise}.`,

        icon: "question",

        showCancelButton: true,

        confirmButtonText:
          "Créer la demande",

        cancelButtonText:
          "Annuler",

        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    /*
    ------------------------------------------------------
    CHARGEMENT
    ------------------------------------------------------
    */

    setLoading(true);

    try {
      const response =
        await createDemandeLaboratoire({
          patientId:
            Number(patientId),

          consultationId:
            consultationId
              ? Number(
                  consultationId,
                )
              : null,

          serviceId:
            serviceId
              ? Number(serviceId)
              : null,

          urgence,

          observation:
            observation.trim() ||
            null,

          examens:
            examensSelectionnes.map(
              (examen) => ({
                examenId:
                  examen.id,
              }),
            ),
        });

      /*
      ----------------------------------------------------
      ERREUR
      ----------------------------------------------------
      */

      if (!response.success) {
        toast.error(
          response.message,
        );

        return;
      }

      /*
      ----------------------------------------------------
      SUCCÈS
      ----------------------------------------------------
      */

      toast.success(
        response.message,
      );

      /*
      ----------------------------------------------------
      RESET
      ----------------------------------------------------
      */

      setPatientId("");
      setConsultationId("");
      setServiceId("");
      setExamenId("");
      setExamensSelectionnes([]);
      setUrgence(false);
      setObservation("");

      /*
      ----------------------------------------------------
      RAFRAÎCHISSEMENT
      ----------------------------------------------------
      */

      window.location.reload();
    } catch (error) {
      console.error(
        "Erreur création laboratoire :",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de la création de la demande.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================================
  RENDU
  ========================================================
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ==================================================
          PATIENT / CONSULTATION
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* PATIENT */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Patient
              <span className="ml-1 text-error">
                *
              </span>
            </span>
          </label>

          <select
            value={patientId}
            onChange={(event) => {
              setPatientId(
                event.target.value,
              );

              setConsultationId("");
            }}
            className="select select-bordered w-full"
            disabled={loading}
          >
            <option value="">
              Sélectionner un patient
            </option>

            {patients.map(
              (patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.numeroDossier}{" "}
                  —{" "}
                  {patient.nom}{" "}
                  {patient.postNom ??
                    ""}{" "}
                  {patient.prenom ??
                    ""}
                </option>
              ),
            )}
          </select>
        </div>

        {/* CONSULTATION */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Consultation
            </span>
          </label>

          <select
            value={consultationId}
            onChange={(event) =>
              setConsultationId(
                event.target.value,
              )
            }
            className="select select-bordered w-full"
            disabled={
              loading ||
              !patientId
            }
          >
            <option value="">
              {patientId
                ? "Sélectionner une consultation"
                : "Sélectionnez d'abord un patient"}
            </option>

            {consultationsPatient.map(
              (consultation) => (
                <option
                  key={
                    consultation.idConsultation
                  }
                  value={
                    consultation.idConsultation
                  }
                >
                  {new Date(
                    consultation.dateConsultation,
                  ).toLocaleDateString(
                    "fr-FR",
                  )}{" "}
                  —{" "}
                  {consultation.motif ??
                    "Sans motif"}
                </option>
              ),
            )}
          </select>

          {patientId &&
            consultationsPatient.length ===
              0 && (
              <label className="label">
                <span className="label-text-alt text-warning">
                  Aucune consultation trouvée
                  pour ce patient.
                </span>
              </label>
            )}
        </div>

        {/* SERVICE */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Service
            </span>
          </label>

          <select
            value={serviceId}
            onChange={(event) =>
              setServiceId(
                event.target.value,
              )
            }
            className="select select-bordered w-full"
            disabled={loading}
          >
            <option value="">
              Sélectionner un service
            </option>

            {services.map(
              (service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.code} —{" "}
                  {service.nom}
                </option>
              ),
            )}
          </select>
        </div>

        {/* URGENCE */}

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3 h-full">
            <input
              type="checkbox"
              className="checkbox checkbox-error"
              checked={urgence}
              onChange={(event) =>
                setUrgence(
                  event.target.checked,
                )
              }
              disabled={loading}
            />

            <div>
              <span className="font-medium">
                Demande urgente
              </span>

              <p className="text-xs text-base-content/60">
                Priorité élevée pour le
                laboratoire.
              </p>
            </div>

            {urgence && (
              <AlertTriangle
                size={18}
                className="text-error"
              />
            )}
          </label>
        </div>
      </div>

      {/* ==================================================
          EXAMENS
      ================================================== */}

      <div className="divider">
        Examens demandés
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">

        <select
          value={examenId}
          onChange={(event) =>
            setExamenId(
              event.target.value,
            )
          }
          className="select select-bordered w-full"
          disabled={loading}
        >
          <option value="">
            Sélectionner un examen
          </option>

          {examens.map(
            (examen) => (
              <option
                key={examen.id}
                value={examen.id}
              >
                {examen.code} —{" "}
                {examen.nom} —{" "}
                {Number(
                  examen.prix,
                ).toFixed(2)}{" "}
                {examen.devise}
              </option>
            ),
          )}
        </select>

        <button
          type="button"
          className="btn btn-primary"
          onClick={
            ajouterExamen
          }
          disabled={
            loading ||
            !examenId
          }
        >
          <Plus size={18} />

          Ajouter
        </button>
      </div>

      {/* ==================================================
          EXAMENS SÉLECTIONNÉS
      ================================================== */}

      {examensSelectionnes.length >
        0 && (
        <div className="overflow-hidden rounded-xl border border-base-300">

          <div className="overflow-x-auto">
            <table className="table">

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Examen</th>
                  <th>Unité</th>
                  <th>Valeur normale</th>
                  <th>Prix</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {examensSelectionnes.map(
                  (examen) => (
                    <tr
                      key={
                        examen.id
                      }
                    >
                      <td>
                        <span className="font-mono font-semibold">
                          {
                            examen.code
                          }
                        </span>
                      </td>

                      <td>
                        <div>
                          <p className="font-medium">
                            {
                              examen.nom
                            }
                          </p>

                          {examen.description && (
                            <p className="max-w-xs truncate text-xs text-base-content/60">
                              {
                                examen.description
                              }
                            </p>
                          )}
                        </div>
                      </td>

                      <td>
                        {examen.unite ??
                          "—"}
                      </td>

                      <td>
                        {examen.valeurNormale ??
                          "—"}
                      </td>

                      <td>
                        {Number(
                          examen.prix,
                        ).toFixed(
                          2,
                        )}{" "}
                        {
                          examen.devise
                        }
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost btn-circle text-error"
                          onClick={() =>
                            supprimerExamen(
                              examen.id,
                            )
                          }
                          disabled={
                            loading
                          }
                          title="Retirer"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* TOTAL */}

          <div className="flex items-center justify-between border-t border-base-300 bg-base-200/40 px-4 py-3">
            <span className="font-medium">
              Total estimé
            </span>

            <span className="text-lg font-bold">
              {total.toFixed(
                2,
              )}{" "}
              {devise}
            </span>
          </div>
        </div>
      )}

      {/* ==================================================
          OBSERVATION
      ================================================== */}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Observation
          </span>
        </label>

        <textarea
          value={observation}
          onChange={(event) =>
            setObservation(
              event.target.value,
            )
          }
          className="textarea textarea-bordered min-h-24 w-full"
          placeholder="Observation ou indication clinique..."
          disabled={loading}
        />
      </div>

      {/* ==================================================
          RÉSUMÉ
      ================================================== */}

      {examensSelectionnes.length >
        0 && (
        <div className="alert">
          <FlaskConical
            size={20}
          />

          <div>
            <p className="font-semibold">
              Demande de laboratoire
            </p>

            <p className="text-sm">
              {
                examensSelectionnes.length
              }{" "}
              examen
              {examensSelectionnes.length >
              1
                ? "s"
                : ""}{" "}
              sélectionné
              {examensSelectionnes.length >
              1
                ? "s"
                : ""}
              {urgence &&
                " — Demande urgente"}
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          BOUTON
      ================================================== */}

      <div className="flex justify-end border-t border-base-300 pt-5">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            loading ||
            !patientId ||
            examensSelectionnes.length ===
              0
          }
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />

              Création...
            </>
          ) : (
            <>
              <Send size={18} />

              Créer la demande
            </>
          )}
        </button>
      </div>
    </form>
  );
}