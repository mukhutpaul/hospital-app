"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Select, {
  SingleValue,
} from "react-select";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createPaiement,
  getFacturesPourPaiement,
  getPatientsPourPaiement,
} from "@/app/actions/paiements";

/* ==========================================================
   TYPES
========================================================== */

type Patient = {
  id: number;
  nom: string;
  postNom: string | null;
  prenom: string | null;
  numeroDossier: string;
};

type Consultation = {
  id: number;
  idConsultation: number;
};

type Facture = {
  id: number;
  patientId: number;
  numero: string;

  montantTotal: number;
  montantPaye: number;
  reste: number;

  devise: string;
  statut: string;

  consultation: Consultation | null;
};

type PatientOption = {
  value: number;
  label: string;
  patient: Patient;
};

/* ==========================================================
   PROPS
========================================================== */

type Props = {
  patientId?: number;
  factureId?: number | null;
  caissierId?: number | null;

  devise?: string;
  reste?: number;

  onSuccess?: () => void;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

function formatNomPatient(patient: Patient): string {
  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function getModeLabel(mode: string): string {
  const modes: Record<string, string> = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    VIREMENT: "Virement bancaire",
    CHEQUE: "Chèque",
  };

  return modes[mode] ?? mode;
}

function formatMontant(
  montant: number,
  devise: string,
): string {
  return `${Number(montant).toFixed(2)} ${devise}`;
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function PaiementForm({
  patientId: patientIdInitial,
  factureId: factureIdInitial,
  caissierId,
  devise: _deviseInitial = "USD",
  reste: _resteInitial = 0,
  onSuccess,
}: Props) {
  const router = useRouter();

  /* ========================================================
     PATIENT
  ======================================================== */

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [patientOption, setPatientOption] =
    useState<PatientOption | null>(null);

  const [loadingPatients, setLoadingPatients] =
    useState(false);

  /* ========================================================
     FACTURES
  ======================================================== */

  const [factures, setFactures] =
    useState<Facture[]>([]);

  const [factureId, setFactureId] =
    useState<number | null>(
      factureIdInitial ?? null,
    );

  const [loadingFactures, setLoadingFactures] =
    useState(false);

  /* ========================================================
     PAIEMENT
  ======================================================== */

  const [montant, setMontant] =
    useState("");

  const [modePaiement, setModePaiement] =
    useState("ESPECES");

  const [type, setType] =
    useState("FACTURE");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ========================================================
     OPTIONS PATIENT
  ======================================================== */

  const patientOptions =
    useMemo<PatientOption[]>(
      () =>
        patients.map((patient) => ({
          value: patient.id,

          label:
            `${formatNomPatient(
              patient,
            )} — Dossier : ${patient.numeroDossier}`,

          patient,
        })),

      [patients],
    );

  /* ========================================================
     FACTURE SÉLECTIONNÉE
  ======================================================== */

  const factureSelectionnee =
    useMemo(() => {
      if (factureId === null) {
        return null;
      }

      return (
        factures.find(
          (facture) =>
            facture.id === factureId,
        ) ?? null
      );
    }, [factures, factureId]);

  /* ========================================================
     CHARGER FACTURES
  ======================================================== */

  const chargerFactures =
    useCallback(
      async (
        selectedPatientId: number,
        selectedFactureId?: number | null,
      ) => {
        try {
          setLoadingFactures(true);

          /*
           * Réinitialisation avant le chargement.
           */
          setFactures([]);
          setFactureId(null);
          setMontant("");

          const result =
            await getFacturesPourPaiement(
              selectedPatientId,
            );

          /*
           * Vérification du résultat.
           */
          if (
            !result.success ||
            !Array.isArray(result.data)
          ) {
            setFactures([]);

            if (!result.success) {
              toast.error(
                result.message,
              );
            }

            return;
          }

          const facturesChargees =
            result.data as Facture[];

          setFactures(
            facturesChargees,
          );

          /* ------------------------------------------------
             FACTURE INITIALE
          ------------------------------------------------ */

          if (
            selectedFactureId !== null &&
            selectedFactureId !== undefined
          ) {
            const facture =
              facturesChargees.find(
                (item) =>
                  item.id ===
                  selectedFactureId,
              );

            if (facture) {
              setFactureId(
                facture.id,
              );

              setMontant(
                facture.reste.toFixed(2),
              );
            }
          }
        } catch (error) {
          console.error(
            "❌ Chargement factures:",
            error,
          );

          setFactures([]);
          setFactureId(null);
          setMontant("");

          toast.error(
            "Impossible de charger les factures du patient.",
          );
        } finally {
          setLoadingFactures(false);
        }
      },
      [],
    );

  /* ========================================================
     CHARGER PATIENTS
     
     IMPORTANT :
     L'initialisation du patient se fait ici, après réception
     des données, et non dans un useEffect qui appelle
     directement setPatientOption().
  ======================================================== */

  useEffect(() => {
    let actif = true;

    async function chargerPatients() {
      try {
        setLoadingPatients(true);

        const result =
          await getPatientsPourPaiement();

        if (!actif) {
          return;
        }

        const patientsCharges =
          Array.isArray(result)
            ? result
            : [];

        setPatients(
          patientsCharges,
        );

        /*
         * --------------------------------------------------
         * PATIENT INITIAL
         * --------------------------------------------------
         *
         * Si le formulaire reçoit un patientId,
         * on sélectionne automatiquement ce patient.
         */

        if (
          patientIdInitial !== undefined &&
          patientIdInitial !== null
        ) {
          const patient =
            patientsCharges.find(
              (item) =>
                item.id ===
                Number(patientIdInitial),
            );

          if (patient) {
            const option: PatientOption = {
              value: patient.id,

              label:
                `${formatNomPatient(
                  patient,
                )} — Dossier : ${patient.numeroDossier}`,

              patient,
            };

            setPatientOption(option);

            /*
             * Chargement automatique des factures
             * du patient initial.
             */
            void chargerFactures(
              patient.id,
              factureIdInitial,
            );
          }
        }
      } catch (error) {
        console.error(
          "❌ Chargement patients:",
          error,
        );

        if (actif) {
          toast.error(
            "Impossible de charger les patients.",
          );
        }
      } finally {
        if (actif) {
          setLoadingPatients(false);
        }
      }
    }

    void chargerPatients();

    return () => {
      actif = false;
    };
  }, [
    patientIdInitial,
    factureIdInitial,
    chargerFactures,
  ]);

  /* ========================================================
     CHANGEMENT PATIENT
  ======================================================== */

  async function handlePatientChange(
    option: SingleValue<PatientOption>,
  ) {
    setPatientOption(option);

    setFactures([]);
    setFactureId(null);
    setMontant("");

    if (!option) {
      return;
    }

    await chargerFactures(
      option.value,
      null,
    );
  }

  /* ========================================================
     CHANGEMENT FACTURE
  ======================================================== */

  function handleFactureChange(
    value: string,
  ) {
    if (!value) {
      setFactureId(null);
      setMontant("");

      return;
    }

    const id = Number(value);

    if (!Number.isInteger(id)) {
      return;
    }

    const facture =
      factures.find(
        (item) =>
          item.id === id,
      );

    if (!facture) {
      toast.error(
        "La facture sélectionnée est introuvable.",
      );

      return;
    }

    setFactureId(
      facture.id,
    );

    setMontant(
      facture.reste.toFixed(2),
    );
  }

  /* ========================================================
     MONTANT
  ======================================================== */

  function handleMontantChange(
    value: string,
  ) {
    if (value === "") {
      setMontant("");

      return;
    }

    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue,
      )
    ) {
      return;
    }

    if (
      factureSelectionnee &&
      numericValue >
        factureSelectionnee.reste
    ) {
      setMontant(
        factureSelectionnee.reste.toFixed(
          2,
        ),
      );

      return;
    }

    setMontant(value);
  }

  /* ========================================================
     SUBMIT
  ======================================================== */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    /* ------------------------------------------------------
       PATIENT
    ------------------------------------------------------ */

    if (!patientOption) {
      toast.error(
        "Veuillez sélectionner un patient.",
      );

      return;
    }

    /* ------------------------------------------------------
       FACTURE
    ------------------------------------------------------ */

    if (!factureSelectionnee) {
      toast.error(
        "Veuillez sélectionner une facture.",
      );

      return;
    }

    /* ------------------------------------------------------
       RESTE
    ------------------------------------------------------ */

    const reste =
      Number(
        factureSelectionnee.reste,
      );

    if (
      !Number.isFinite(reste) ||
      reste <= 0
    ) {
      toast.error(
        "Cette facture est déjà entièrement payée.",
      );

      return;
    }

    /* ------------------------------------------------------
       MONTANT
    ------------------------------------------------------ */

    const montantNumber =
      Number(montant);

    if (
      !Number.isFinite(
        montantNumber,
      ) ||
      montantNumber <= 0
    ) {
      toast.error(
        "Veuillez saisir un montant valide.",
      );

      return;
    }

    const montantFinal =
      Math.round(
        montantNumber * 100,
      ) / 100;

    if (
      montantFinal > reste
    ) {
      toast.error(
        `Le montant ne peut pas dépasser ${formatMontant(
          reste,
          factureSelectionnee.devise,
        )}.`,
      );

      return;
    }

    /* ------------------------------------------------------
       RESTE APRÈS
    ------------------------------------------------------ */

    const resteApres =
      Math.max(
        0,
        Math.round(
          (
            reste -
            montantFinal
          ) * 100,
        ) / 100,
      );

    /* ------------------------------------------------------
       CONFIRMATION
    ------------------------------------------------------ */

    const confirmation =
      await Swal.fire({
        icon: "question",

        title:
          "Confirmer le paiement",

        html: `
          <div style="
            text-align:left;
            font-size:14px;
            line-height:1.8;
          ">

            <p>
              <strong>Patient :</strong>
              ${formatNomPatient(
                patientOption.patient,
              )}
            </p>

            <p>
              <strong>Dossier :</strong>
              ${patientOption.patient.numeroDossier}
            </p>

            <hr />

            <p>
              <strong>Facture :</strong>
              ${factureSelectionnee.numero}
            </p>

            <p>
              <strong>Total facture :</strong>
              ${formatMontant(
                factureSelectionnee.montantTotal,
                factureSelectionnee.devise,
              )}
            </p>

            <p>
              <strong>Déjà payé :</strong>
              ${formatMontant(
                factureSelectionnee.montantPaye,
                factureSelectionnee.devise,
              )}
            </p>

            <p>
              <strong>Reste avant :</strong>
              ${formatMontant(
                reste,
                factureSelectionnee.devise,
              )}
            </p>

            <p>
              <strong>Montant du paiement :</strong>
              ${formatMontant(
                montantFinal,
                factureSelectionnee.devise,
              )}
            </p>

            <p>
              <strong>Reste après :</strong>
              ${formatMontant(
                resteApres,
                factureSelectionnee.devise,
              )}
            </p>

            <p>
              <strong>Mode :</strong>
              ${getModeLabel(
                modePaiement,
              )}
            </p>

          </div>
        `,

        showCancelButton: true,

        confirmButtonText:
          "Oui, enregistrer",

        cancelButtonText:
          "Annuler",

        reverseButtons: true,
      });

    if (
      !confirmation.isConfirmed
    ) {
      return;
    }

    /* ------------------------------------------------------
       ENREGISTREMENT
    ------------------------------------------------------ */

    try {
      setLoading(true);

      const result =
        await createPaiement({
          patientId:
            patientOption.value,

          factureId:
            factureSelectionnee.id,

          montant:
            montantFinal,

          devise:
            factureSelectionnee.devise,

          modePaiement,

          type,

          description:
            description.trim() ||
            null,

          caissierId,
        });

      if (!result.success) {
        toast.error(
          result.message,
        );

        return;
      }

      /* ----------------------------------------------------
         SUCCÈS
      ---------------------------------------------------- */

      toast.success(
        result.message,
      );

      const factureMiseAJour =
        result.data &&
        typeof result.data ===
          "object" &&
        "facture" in result.data
          ? (
              result.data as {
                facture?: {
                  reste: number;
                  statut: string;
                };
              }
            ).facture
          : undefined;

      await Swal.fire({
        icon: "success",

        title:
          "Paiement enregistré",

        html: `
          <div>

            <p>
              ${result.message}
            </p>

            ${
              factureMiseAJour
                ? `
                  <p style="margin-top:10px">
                    <strong>Nouveau reste :</strong>
                    ${formatMontant(
                      Number(
                        factureMiseAJour.reste,
                      ),
                      factureSelectionnee.devise,
                    )}
                  </p>
                `
                : ""
            }

          </div>
        `,

        confirmButtonText:
          "OK",
      });

      /* ----------------------------------------------------
         RESET
      ---------------------------------------------------- */

      setMontant("");
      setDescription("");
      setFactureId(null);

      /* ----------------------------------------------------
         RECHARGER FACTURES
      ---------------------------------------------------- */

      await chargerFactures(
        patientOption.value,
        null,
      );

      /* ----------------------------------------------------
         RAFRAÎCHIR
      ---------------------------------------------------- */

      router.refresh();

      onSuccess?.();
    } catch (error) {
      console.error(
        "❌ Erreur création paiement:",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement du paiement.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              💰
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Enregistrer un paiement
              </h2>

              <p className="text-sm opacity-60">
                Sélectionnez le patient puis la
                facture à régler.
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* ==================================================
          PATIENT
      ================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <h3 className="card-title text-base">
            👤 Patient
          </h3>

          <div className="divider my-1" />

          <label className="label">
            <span className="label-text font-semibold">
              Rechercher un patient *
            </span>
          </label>

          <Select<
            PatientOption,
            false
          >
            options={
              patientOptions
            }

            value={
              patientOption
            }

            onChange={
              handlePatientChange
            }

            isLoading={
              loadingPatients
            }

            isDisabled={
              loading
            }

            isClearable

            isSearchable

            placeholder={
              loadingPatients
                ? "Chargement des patients..."
                : "Rechercher un patient..."
            }

            noOptionsMessage={() =>
              "Aucun patient trouvé"
            }

            loadingMessage={() =>
              "Chargement..."
            }

            className="w-full"

            classNamePrefix="patient-select"
          />

          {patientOption && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="font-bold">
                    {formatNomPatient(
                      patientOption.patient,
                    )}
                  </p>

                  <p className="text-sm opacity-70">
                    Dossier :

                    <span className="ml-1 font-semibold">
                      {
                        patientOption
                          .patient
                          .numeroDossier
                      }
                    </span>
                  </p>

                </div>

                <span className="badge badge-primary">
                  Patient sélectionné
                </span>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* ==================================================
          FACTURES
      ================================================== */}

      {patientOption && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <div className="flex items-center justify-between">

              <h3 className="card-title text-base">
                🧾 Facture
              </h3>

              {loadingFactures && (
                <span className="loading loading-spinner loading-sm text-primary" />
              )}

            </div>

            <div className="divider my-1" />

            <label className="label">
              <span className="label-text font-semibold">
                Facture à payer *
              </span>
            </label>

            <select
              value={
                factureId ?? ""
              }

              onChange={(e) =>
                handleFactureChange(
                  e.target.value,
                )
              }

              className="select select-bordered h-12 w-full"

              disabled={
                loading ||
                loadingFactures
              }

              required
            >

              <option value="">
                {loadingFactures
                  ? "Chargement des factures..."
                  : "-- Sélectionner une facture --"}
              </option>

              {factures.map(
                (facture) => (
                  <option
                    key={
                      facture.id
                    }
                    value={
                      facture.id
                    }
                  >
                    {facture.numero}
                    {" — Reste : "}
                    {facture.reste.toFixed(
                      2,
                    )}{" "}
                    {
                      facture.devise
                    }
                  </option>
                ),
              )}

            </select>

            {!loadingFactures &&
              factures.length ===
                0 && (
                <div className="alert alert-warning mt-3">

                  <span className="text-xl">
                    ⚠️
                  </span>

                  <div>

                    <p className="font-semibold">
                      Aucune facture non soldée
                    </p>

                    <p className="text-sm">
                      Ce patient ne possède
                      actuellement aucune
                      facture avec un reste à
                      payer.
                    </p>

                  </div>

                </div>
              )}

          </div>
        </div>
      )}

      {/* ==================================================
          DÉTAIL FACTURE
      ================================================== */}

      {factureSelectionnee && (
        <div className="card bg-base-100 border border-primary/30 shadow-sm">

          <div className="card-body">

            <div className="flex items-center justify-between">

              <h3 className="card-title text-base">
                📄 Détails de la facture
              </h3>

              <span className="badge badge-warning">
                {
                  factureSelectionnee.statut
                }
              </span>

            </div>

            <div className="divider my-1" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-base-200 p-4">

                <p className="text-xs opacity-60">
                  Numéro facture
                </p>

                <p className="mt-1 font-bold">
                  {
                    factureSelectionnee.numero
                  }
                </p>

              </div>

              <div className="rounded-xl bg-base-200 p-4">

                <p className="text-xs opacity-60">
                  Montant total
                </p>

                <p className="mt-1 font-bold">

                  {factureSelectionnee.montantTotal.toFixed(
                    2,
                  )}{" "}

                  {
                    factureSelectionnee.devise
                  }

                </p>

              </div>

              <div className="rounded-xl bg-base-200 p-4">

                <p className="text-xs opacity-60">
                  Déjà payé
                </p>

                <p className="mt-1 font-bold text-success">

                  {factureSelectionnee.montantPaye.toFixed(
                    2,
                  )}{" "}

                  {
                    factureSelectionnee.devise
                  }

                </p>

              </div>

              <div className="rounded-xl bg-error/10 p-4">

                <p className="text-xs opacity-60">
                  Reste à payer
                </p>

                <p className="mt-1 text-lg font-bold text-error">

                  {factureSelectionnee.reste.toFixed(
                    2,
                  )}{" "}

                  {
                    factureSelectionnee.devise
                  }

                </p>

              </div>

            </div>

            {factureSelectionnee.consultation && (
              <div className="mt-4 rounded-lg border border-base-300 p-3 text-sm">

                <span className="opacity-60">
                  Consultation :
                </span>

                <strong className="ml-2">
                  CONS-
                  {
                    factureSelectionnee
                      .consultation
                      .idConsultation
                  }
                </strong>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================
          PAIEMENT
      ================================================== */}

      {factureSelectionnee && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <h3 className="card-title text-base">
              💳 Informations du paiement
            </h3>

            <div className="divider my-1" />

            {/* RESTE */}

            <div className="rounded-xl border border-info/20 bg-info/10 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm opacity-70">
                    Reste à payer
                  </p>

                  <p className="text-2xl font-bold text-info">

                    {factureSelectionnee.reste.toFixed(
                      2,
                    )}{" "}

                    {
                      factureSelectionnee.devise
                    }

                  </p>

                </div>

                <div className="text-3xl">
                  💰
                </div>

              </div>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* MONTANT */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Montant à payer *
                  </span>

                </label>

                <input
                  type="number"
                  min="0.01"
                  max={
                    factureSelectionnee.reste
                  }
                  step="0.01"
                  value={
                    montant
                  }
                  onChange={(e) =>
                    handleMontantChange(
                      e.target.value,
                    )
                  }
                  className="input input-bordered h-12 w-full"
                  placeholder="0.00"
                  disabled={
                    loading
                  }
                  required
                />

                <label className="label">

                  <span className="label-text-alt">

                    Maximum :{" "}

                    <strong>

                      {factureSelectionnee.reste.toFixed(
                        2,
                      )}{" "}

                      {
                        factureSelectionnee.devise
                      }

                    </strong>

                  </span>

                </label>

              </div>

              {/* DEVISE */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Devise
                  </span>

                </label>

                <input
                  value={
                    factureSelectionnee.devise
                  }
                  className="input input-bordered h-12 w-full"
                  readOnly
                />

              </div>

              {/* MODE */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Mode de paiement *
                  </span>

                </label>

                <select
                  value={
                    modePaiement
                  }
                  onChange={(e) =>
                    setModePaiement(
                      e.target.value,
                    )
                  }
                  className="select select-bordered h-12 w-full"
                  disabled={
                    loading
                  }
                >

                  <option value="ESPECES">
                    💵 Espèces
                  </option>

                  <option value="MOBILE_MONEY">
                    📱 Mobile Money
                  </option>

                  <option value="CARTE">
                    💳 Carte bancaire
                  </option>

                  <option value="VIREMENT">
                    🏦 Virement bancaire
                  </option>

                  <option value="CHEQUE">
                    🧾 Chèque
                  </option>

                </select>

              </div>

              {/* TYPE */}

              <div className="form-control">

                <label className="label">

                  <span className="label-text font-semibold">
                    Type de paiement *
                  </span>

                </label>

                <select
                  value={
                    type
                  }
                  onChange={(e) =>
                    setType(
                      e.target.value,
                    )
                  }
                  className="select select-bordered h-12 w-full"
                  disabled={
                    loading
                  }
                >

                  <option value="FACTURE">
                    Paiement facture
                  </option>

                  <option value="AVANCE">
                    Avance
                  </option>

                  <option value="ACOMPTE">
                    Acompte
                  </option>

                </select>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="form-control mt-5">

              <label className="label">

                <span className="label-text font-semibold">
                  Description
                </span>

              </label>

              <textarea
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value,
                  )
                }
                className="textarea textarea-bordered min-h-24 w-full"
                placeholder="Ajouter une remarque..."
                disabled={
                  loading
                }
              />

            </div>

            {/* BOUTON */}

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={
                  loading ||
                  !patientOption ||
                  !factureSelectionnee ||
                  factureSelectionnee.reste <=
                    0 ||
                  Number(montant) <=
                    0 ||
                  Number(montant) >
                    factureSelectionnee.reste
                }
              >

                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />

                    Enregistrement...
                  </>
                ) : (
                  <>
                    💰 Enregistrer le paiement
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </form>
  );
}