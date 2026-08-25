
"use client";

import Select from "react-select";
import {
  CheckCircle2,
  Loader2,
  Pill,
  UserRound,
  PackageCheck,
  FileText,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "react-toastify";

import { createDispensation } from "@/app/actions/dispensations";

/* ==========================================================
   TYPES
========================================================== */

type Medicament = {
  id: number;
  code: string;
  nom: string;
  forme?: string | null;
  dosage?: string | null;
};

type LigneOrdonnance = {
  id: number;
  quantite: number;

  medicament?: Medicament | null;
};

type Ordonnance = {
  id: number;
  numero: string;
  statut: string;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  lignes?: LigneOrdonnance[];
};

type Props = {
  ordonnances: Ordonnance[];
};

/* ==========================================================
   OPTION REACT SELECT
========================================================== */

type OrdonnanceOption = {
  value: number;
  label: string;
  ordonnance: Ordonnance;
};

/* ==========================================================
   QUANTITÉS
========================================================== */

type QuantiteDispensation = {
  [ligneId: number]: number;
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function DispensationForm({
  ordonnances,
}: Props) {
  const [selectedOrdonnance, setSelectedOrdonnance] =
    useState<Ordonnance | null>(null);

  const [quantites, setQuantites] =
    useState<QuantiteDispensation>({});

  const [observation, setObservation] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* ========================================================
     OPTIONS DES ORDONNANCES
  ======================================================== */

  const ordonnanceOptions =
    useMemo<OrdonnanceOption[]>(() => {
      return ordonnances
        .filter(
          (ordonnance) =>
            ordonnance.statut !== "ANNULEE" &&
            ordonnance.statut !== "EXPIREE"
        )
        .map((ordonnance) => {
          const patientName = [
            ordonnance.patient?.nom,
            ordonnance.patient?.postNom,
            ordonnance.patient?.prenom,
          ]
            .filter(Boolean)
            .join(" ");

          const dossier =
            ordonnance.patient?.numeroDossier;

          return {
            value: ordonnance.id,

            label: [
              ordonnance.numero,
              patientName,
              dossier,
            ]
              .filter(Boolean)
              .join(" — "),

            ordonnance,
          };
        });
    }, [ordonnances]);

  /* ========================================================
     PATIENT
  ======================================================== */

  const patientName = useMemo(() => {
    if (!selectedOrdonnance?.patient) {
      return "";
    }

    return [
      selectedOrdonnance.patient.nom,
      selectedOrdonnance.patient.postNom,
      selectedOrdonnance.patient.prenom,
    ]
      .filter(Boolean)
      .join(" ");
  }, [selectedOrdonnance]);

  /* ========================================================
     LIGNES VALIDES
  ======================================================== */

  const lignes = useMemo(() => {
    return (
      selectedOrdonnance?.lignes?.filter(
        (ligne) => ligne.medicament
      ) ?? []
    );
  }, [selectedOrdonnance]);

  /* ========================================================
     INITIALISATION DES QUANTITÉS
  ======================================================== */

  useEffect(() => {
    if (!selectedOrdonnance) {
      setQuantites({});
      return;
    }

    const initial: QuantiteDispensation = {};

    for (
      const ligne of selectedOrdonnance.lignes ?? []
    ) {
      initial[ligne.id] =
        Number(ligne.quantite) || 0;
    }

    setQuantites(initial);
  }, [selectedOrdonnance]);

  /* ========================================================
     CHANGEMENT ORDONNANCE
  ======================================================== */

  function handleOrdonnanceChange(
    option: OrdonnanceOption | null
  ) {
    setSelectedOrdonnance(
      option?.ordonnance ?? null
    );

    setObservation("");
  }

  /* ========================================================
     CHANGEMENT QUANTITÉ
  ======================================================== */

  function handleQuantiteChange(
    ligneId: number,
    quantitePrescrite: number,
    value: string
  ) {
    let quantite = Number(value);

    if (!Number.isFinite(quantite)) {
      quantite = 0;
    }

    quantite = Math.max(0, quantite);

    quantite = Math.min(
      quantite,
      quantitePrescrite
    );

    setQuantites((previous) => ({
      ...previous,
      [ligneId]: quantite,
    }));
  }

  /* ========================================================
     TOTAL DES UNITÉS
  ======================================================== */

  const totalUnites = useMemo(() => {
    return Object.values(quantites).reduce(
      (total, value) =>
        total + (Number(value) || 0),
      0
    );
  }, [quantites]);

  /* ========================================================
     TOTAL PRESCRIT
  ======================================================== */

  const totalPrescrit = useMemo(() => {
    return lignes.reduce(
      (total, ligne) =>
        total +
        (Number(ligne.quantite) || 0),
      0
    );
  }, [lignes]);

  /* ========================================================
     VALIDATION
  ======================================================== */

  function validateForm(): string | null {
    if (!selectedOrdonnance) {
      return "Veuillez sélectionner une ordonnance.";
    }

    if (!selectedOrdonnance.patient?.id) {
      return "Cette ordonnance n'est associée à aucun patient.";
    }

    if (lignes.length === 0) {
      return "Cette ordonnance ne contient aucun médicament.";
    }

    const auMoinsUn = lignes.some(
      (ligne) =>
        (quantites[ligne.id] ?? 0) > 0
    );

    if (!auMoinsUn) {
      return "Veuillez sélectionner au moins un médicament à dispenser.";
    }

    for (const ligne of lignes) {
      const quantite =
        quantites[ligne.id] ?? 0;

      const prescrite =
        Number(ligne.quantite) || 0;

      if (quantite < 0) {
        return "Une quantité ne peut pas être négative.";
      }

      if (quantite > prescrite) {
        return `La quantité dispensée ne peut pas dépasser la quantité prescrite pour ${ligne.medicament?.nom}.`;
      }
    }

    return null;
  }

  /* ========================================================
     SOUMISSION
  ======================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const error = validateForm();

    if (error) {
      toast.error(error);
      return;
    }

    if (!selectedOrdonnance) {
      return;
    }

    if (!selectedOrdonnance.patient?.id) {
      toast.error(
        "Patient introuvable pour cette ordonnance."
      );
      return;
    }

    try {
      setLoading(true);

      /* ====================================================
         LIGNES À DISPENSER
      ==================================================== */

      const lignesDispensation =
        lignes
          .map((ligne) => ({
            prescriptionLigneId:
              ligne.id,

            medicamentId:
              ligne.medicament!.id,

            quantitePrescrite:
              Number(ligne.quantite),

            quantiteDispensee:
              Number(
                quantites[ligne.id] ?? 0
              ),
          }))
          .filter(
            (ligne) =>
              ligne.quantiteDispensee > 0
          );

      /* ====================================================
         APPEL ACTION SERVEUR
      ==================================================== */

      const result =
        await createDispensation({
          prescriptionId:
            selectedOrdonnance.id,

          patientId:
            selectedOrdonnance.patient.id,

          observation:
            observation.trim() || null,

          lignes:
            lignesDispensation,
        });

      /* ====================================================
         ERREUR
      ==================================================== */

      if (!result?.success) {
        toast.error(
          result?.message ??
            "Impossible d'enregistrer la dispensation."
        );

        return;
      }

      /* ====================================================
         SUCCÈS
      ==================================================== */

      toast.success(
        result.message ??
          "Dispensation enregistrée avec succès."
      );

      /* ====================================================
         RESET
      ==================================================== */

      setSelectedOrdonnance(null);
      setQuantites({});
      setObservation("");

      /*
       * Actualisation afin de récupérer :
       * - l'historique
       * - les stocks
       * - les ordonnances mises à jour
       */
      window.location.reload();
    } catch (error) {
      console.error(
        "Erreur création dispensation :",
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
     RENDU
  ======================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ==================================================
          ORDONNANCE
      ================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Ordonnance *
        </label>

        <Select<OrdonnanceOption, false>
          options={ordonnanceOptions}

          value={
            selectedOrdonnance
              ? ordonnanceOptions.find(
                  (option) =>
                    option.value ===
                    selectedOrdonnance.id
                ) ?? null
              : null
          }

          onChange={
            handleOrdonnanceChange
          }

          placeholder="Rechercher une ordonnance ou un patient..."

          isClearable
          isSearchable

          noOptionsMessage={() =>
            "Aucune ordonnance ou patient trouvé"
          }

          loadingMessage={() =>
            "Chargement..."
          }

          className="text-sm"
          classNamePrefix="react-select"

          /*
           * Recherche :
           * - numéro ordonnance
           * - nom
           * - post-nom
           * - prénom
           * - numéro dossier
           */

          filterOption={(
            option,
            inputValue
          ) => {
            const search =
              inputValue
                .toLowerCase()
                .trim();

            if (!search) {
              return true;
            }

            const ordonnance =
              option.data.ordonnance;

            const patient =
              ordonnance.patient;

            const patientName = [
              patient?.nom,
              patient?.postNom,
              patient?.prenom,
            ]
              .filter(Boolean)
              .join(" ");

            const searchableText = [
              ordonnance.numero,
              patientName,
              patient?.numeroDossier,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              search
            );
          }}

          /*
           * AFFICHAGE DES OPTIONS
           */

          formatOptionLabel={(
            option,
            { context }
          ) => {
            const patient =
              option.ordonnance.patient;

            const patientName = [
              patient?.nom,
              patient?.postNom,
              patient?.prenom,
            ]
              .filter(Boolean)
              .join(" ");

            /*
             * MENU DE RECHERCHE
             */

            if (context === "menu") {
              return (
                <div className="py-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={16}
                        className="text-primary"
                      />

                      <span className="font-semibold">
                        {
                          option
                            .ordonnance
                            .numero
                        }
                      </span>
                    </div>

                    <span className="badge badge-xs badge-primary">
                      {
                        option
                          .ordonnance
                          .statut
                      }
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <UserRound
                      size={14}
                      className="opacity-50"
                    />

                    <span className="text-sm font-medium">
                      {patientName ||
                        "Patient non renseigné"}
                    </span>
                  </div>

                  {patient?.numeroDossier && (
                    <div className="ml-5 text-xs opacity-60">
                      Dossier :{" "}
                      {
                        patient.numeroDossier
                      }
                    </div>
                  )}
                </div>
              );
            }

            /*
             * CHAMP APRÈS SÉLECTION
             */

            return (
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold">
                  {
                    option
                      .ordonnance
                      .numero
                  }
                </span>

                <span className="truncate text-xs opacity-60">
                  {patientName ||
                    "Patient non renseigné"}

                  {patient?.numeroDossier
                    ? ` — ${patient.numeroDossier}`
                    : ""}
                </span>
              </div>
            );
          }}
        />
      </div>

      {/* ==================================================
          INFORMATIONS PATIENT
      ================================================== */}

      {selectedOrdonnance && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound size={21} />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Patient
              </p>

              <h3 className="mt-1 text-lg font-bold">
                {patientName ||
                  "Patient non renseigné"}
              </h3>

              {selectedOrdonnance
                .patient
                ?.numeroDossier && (
                <p className="text-sm text-base-content/60">
                  Dossier :{" "}
                  {
                    selectedOrdonnance
                      .patient
                      .numeroDossier
                  }
                </p>
              )}

              <p className="mt-1 text-sm text-base-content/60">
                Ordonnance :{" "}
                <span className="font-semibold">
                  {
                    selectedOrdonnance.numero
                  }
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MÉDICAMENTS
      ================================================== */}

      {selectedOrdonnance && (
        <div className="rounded-xl border border-base-200">

          <div className="border-b border-base-200 bg-base-200/30 p-4">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-2">

                <Pill
                  size={20}
                  className="text-primary"
                />

                <div>
                  <h3 className="font-bold">
                    Médicaments prescrits
                  </h3>

                  <p className="text-xs text-base-content/60">
                    Indiquez les quantités réellement délivrées.
                  </p>
                </div>

              </div>

              <span className="badge badge-primary">
                {lignes.length} ligne
                {lignes.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="table">

              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Forme</th>
                  <th>Dosage</th>
                  <th className="text-center">
                    Prescrit
                  </th>
                  <th className="text-center">
                    À dispenser
                  </th>
                </tr>
              </thead>

              <tbody>

                {lignes.map((ligne) => {

                  const medicament =
                    ligne.medicament;

                  if (!medicament) {
                    return null;
                  }

                  const prescrite =
                    Number(
                      ligne.quantite
                    ) || 0;

                  const dispensee =
                    quantites[
                      ligne.id
                    ] ?? 0;

                  return (
                    <tr key={ligne.id}>

                      <td>
                        <div className="font-semibold">
                          {
                            medicament.nom
                          }
                        </div>

                        <div className="text-xs opacity-60">
                          {
                            medicament.code
                          }
                        </div>
                      </td>

                      <td>
                        {
                          medicament.forme ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          medicament.dosage ||
                          "-"
                        }
                      </td>

                      <td className="text-center">
                        <span className="badge badge-outline">
                          {prescrite}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center justify-center gap-2">

                          <input
                            type="number"
                            min={0}
                            max={prescrite}
                            step="1"
                            value={dispensee}
                            onChange={(event) =>
                              handleQuantiteChange(
                                ligne.id,
                                prescrite,
                                event.target
                                  .value
                              )
                            }
                            className="input input-bordered input-sm w-28 text-center"
                          />

                          <span className="text-xs opacity-50">
                            / {prescrite}
                          </span>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {lignes.length === 0 && (
            <div className="p-8 text-center">

              <Pill
                size={30}
                className="mx-auto opacity-30"
              />

              <p className="mt-2 font-semibold">
                Aucun médicament
              </p>

              <p className="text-sm opacity-60">
                Cette ordonnance ne contient aucun médicament dispensable.
              </p>

            </div>
          )}

        </div>
      )}

      {/* ==================================================
          RÉSUMÉ
      ================================================== */}

      {selectedOrdonnance &&
        lignes.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-base-200 bg-base-100 p-4">

              <div className="flex items-center gap-3">

                <PackageCheck
                  size={20}
                  className="text-primary"
                />

                <div>

                  <p className="text-xs opacity-60">
                    Total à dispenser
                  </p>

                  <p className="text-xl font-bold">
                    {totalUnites} unité
                    {totalUnites > 1
                      ? "s"
                      : ""}
                  </p>

                </div>
              </div>
            </div>

            <div className="rounded-xl border border-base-200 bg-base-100 p-4">

              <p className="text-xs opacity-60">
                Total prescrit
              </p>

              <p className="mt-1 text-xl font-bold">
                {totalPrescrit} unité
                {totalPrescrit > 1
                  ? "s"
                  : ""}
              </p>

            </div>

            <div className="rounded-xl border border-base-200 bg-base-100 p-4">

              <p className="text-xs opacity-60">
                Patient
              </p>

              <p className="mt-1 truncate font-bold">
                {patientName ||
                  "Non renseigné"}
              </p>

            </div>

          </div>
        )}

      {/* ==================================================
          OBSERVATION
      ================================================== */}

      {selectedOrdonnance && (
        <div>

          <label className="mb-2 block text-sm font-semibold">
            Observation
          </label>

          <textarea
            value={observation}
            onChange={(event) =>
              setObservation(
                event.target.value
              )
            }
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Observation éventuelle concernant la dispensation..."
          />

        </div>
      )}

      {/* ==================================================
          ACTIONS
      ================================================== */}

      {selectedOrdonnance && (
        <div className="flex flex-col-reverse gap-3 border-t border-base-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-sm text-base-content/60">

            {totalUnites > 0
              ? "La validation enregistrera la dispensation."
              : "Sélectionnez au moins une quantité à dispenser."}

          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !selectedOrdonnance ||
              totalUnites <= 0 ||
              lignes.length === 0
            }
            className="btn btn-primary"
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
                <CheckCircle2 size={18} />

                Enregistrer la dispensation
              </>
            )}

          </button>

        </div>
      )}

    </form>
  );
}
