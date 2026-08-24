"use client";

import { useMemo, useState } from "react";

import {
  Search,
  CalendarDays,
  Eye,
  FlaskConical,
  AlertTriangle,
  X,
  Save,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  createResultatLaboratoire,
  validerResultatLaboratoire,
} from "@/app/actions/laboratoire";

/* ==========================================================
   TYPES
========================================================== */

type Examen = {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  unite?: string | null;
  valeurNormale?: string | null;
  prix?: number | null;
  devise?: string | null;
  actif?: boolean;
};

type Resultat = {
  id: number;
  demandeId: number;
  examenId: number;
  valeur?: string | null;
  unite?: string | null;
  commentaire?: string | null;
  interpretation?: string | null;
  valide: boolean;
  dateResultat: string | Date;
  examen?: Examen | null;
};

type DemandeLigne = {
  id: number;
  prix: number;
  examenId?: number;
  examen: Examen;
};

type Demande = {
  id: number;
  numero: string;
  dateDemande: string | Date;
  statut: string;
  urgence: boolean;
  observation?: string | null;

  patient: {
    id: number;
    numeroDossier: string;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    sexe?: string | null;
    dateNaissance?: string | Date | null;
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
  };

  consultation?: {
    idConsultation: number;
    dateConsultation: string | Date;
    motif?: string | null;
    diagnostic?: string | null;

    medecin?: {
      id: number;
      matricule?: string | null;
      nom: string;
      postNom?: string | null;
      prenom: string;
      numeroOrdre?: string | null;

      user?: {
        id: number;
        name?: string | null;
        email?: string | null;
      } | null;

      service?: {
        id: number;
        code?: string | null;
        nom: string;
      } | null;

      specialite?: {
        id: number;
        code?: string | null;
        nom: string;
      } | null;
    } | null;
  } | null;

  service?: {
    id: number;
    code?: string | null;
    nom: string;
  } | null;

  lignes: DemandeLigne[];

  resultats: Resultat[];
};

type Props = {
  demandes?: Demande[] | null;
};

/* ==========================================================
   HELPERS
========================================================== */

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: string | Date | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(
  date: string | Date | null | undefined,
) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nomPatient(patient?: Demande["patient"] | null) {
  if (!patient) return "Patient inconnu";

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function nomMedecin(
  medecin?: NonNullable<
    NonNullable<Demande["consultation"]>["medecin"]
  > | null,
) {
  if (!medecin) return "Médecin inconnu";

  return [
    medecin.nom,
    medecin.postNom,
    medecin.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function getStatutLabel(statut: string) {
  switch (statut) {
    case "DEMANDE":
      return "Demandée";

    case "EN_COURS":
      return "En cours";

    case "TERMINE":
      return "Terminée";

    case "ANNULEE":
      return "Annulée";

    default:
      return statut || "Inconnu";
  }
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "DEMANDE":
      return "badge-warning";

    case "EN_COURS":
      return "badge-info";

    case "TERMINE":
      return "badge-success";

    case "ANNULEE":
      return "badge-error";

    default:
      return "badge-ghost";
  }
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function DemandeLaboratoireTable({
  demandes: demandesProp,
}: Props) {
  /*
  ============================================================
  NORMALISATION DES DONNÉES
  ============================================================
  */

  const demandes = Array.isArray(demandesProp)
    ? demandesProp
    : [];

  /* ========================================================
     FILTRES
  ======================================================== */

  const [recherche, setRecherche] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [statut, setStatut] = useState("TOUS");
  const [urgence, setUrgence] = useState("TOUS");

  /* ========================================================
     MODAL
  ======================================================== */

  const [
    demandeSelectionnee,
    setDemandeSelectionnee,
  ] = useState<Demande | null>(null);

  /* ========================================================
     FILTRAGE
  ======================================================== */

  const demandesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return demandes.filter((demande) => {
      /*
      ======================================================
      RECHERCHE
      ======================================================
      */

      if (terme) {
        const patient = demande.patient;
        const medecin = demande.consultation?.medecin;

        const examens = (demande.lignes ?? []).flatMap(
          (ligne) => [
            ligne.examen?.nom,
            ligne.examen?.code,
            ligne.examen?.description,
          ],
        );

        const texte = [
          demande.numero,
          demande.statut,

          patient?.numeroDossier,
          patient?.nom,
          patient?.postNom,
          patient?.prenom,
          patient?.telephone,
          patient?.email,

          medecin?.nom,
          medecin?.postNom,
          medecin?.prenom,
          medecin?.matricule,

          demande.service?.nom,
          demande.service?.code,

          ...examens,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!texte.includes(terme)) {
          return false;
        }
      }

      /*
      ======================================================
      STATUT
      ======================================================
      */

      if (
        statut !== "TOUS" &&
        demande.statut !== statut
      ) {
        return false;
      }

      /*
      ======================================================
      URGENCE
      ======================================================
      */

      if (urgence !== "TOUS") {
        const valeurUrgence = demande.urgence
          ? "true"
          : "false";

        if (valeurUrgence !== urgence) {
          return false;
        }
      }

      /*
      ======================================================
      DATE DÉBUT
      ======================================================
      */

      if (dateDebut) {
        const date = new Date(
          demande.dateDemande,
        );

        const debut = new Date(
          `${dateDebut}T00:00:00`,
        );

        if (date < debut) {
          return false;
        }
      }

      /*
      ======================================================
      DATE FIN
      ======================================================
      */

      if (dateFin) {
        const date = new Date(
          demande.dateDemande,
        );

        const fin = new Date(
          `${dateFin}T23:59:59.999`,
        );

        if (date > fin) {
          return false;
        }
      }

      return true;
    });
  }, [
    demandes,
    recherche,
    dateDebut,
    dateFin,
    statut,
    urgence,
  ]);

  /* ========================================================
     RESET
  ======================================================== */

  function resetFiltres() {
    setRecherche("");
    setDateDebut("");
    setDateFin("");
    setStatut("TOUS");
    setUrgence("TOUS");
  }

  /* ========================================================
     TROUVER RESULTAT
  ======================================================== */

  function getResultat(
    demande: Demande,
    examenId: number,
  ) {
    return (demande.resultats ?? []).find(
      (resultat) =>
        resultat.examenId === examenId,
    );
  }

  /* ========================================================
     ENREGISTRER RESULTAT
  ======================================================== */

  async function handleResultat(
    demandeId: number,
    examenId: number,
    form: HTMLFormElement,
  ) {
    try {
      const formData = new FormData(form);

      formData.set(
        "demandeId",
        String(demandeId),
      );

      formData.set(
        "examenId",
        String(examenId),
      );

      const result =
        await createResultatLaboratoire(
          formData,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      /*
      ======================================================
      RÉCUPÉRATION DU NOUVEAU RESULTAT
      ======================================================
      */

      if (!result.data) {
        return;
      }

      const nouveauResultat =
        result.data as Resultat;

      /*
      ======================================================
      MISE À JOUR DU MODAL
      ======================================================
      */

      setDemandeSelectionnee((ancienne) => {
        if (!ancienne) {
          return null;
        }

        const anciens =
          ancienne.resultats ?? [];

        const index = anciens.findIndex(
          (item) =>
            item.id === nouveauResultat.id,
        );

        if (index >= 0) {
          const nouveaux = [...anciens];

          nouveaux[index] = {
            ...anciens[index],
            ...nouveauResultat,
          };

          return {
            ...ancienne,
            resultats: nouveaux,
          };
        }

        return {
          ...ancienne,
          resultats: [
            ...anciens,
            nouveauResultat,
          ],
        };
      });
    } catch (error) {
      console.error(
        "handleResultat:",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de l'enregistrement.",
      );
    }
  }

  /* ========================================================
     VALIDER RESULTAT
  ======================================================== */

  async function handleValidation(
    resultatId: number,
  ) {
    const confirmation =
      await Swal.fire({
        title: "Valider le résultat ?",
        text:
          "Après validation, le résultat sera considéré comme définitif.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, valider",
        cancelButtonText: "Annuler",
        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const result =
        await validerResultatLaboratoire(
          resultatId,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setDemandeSelectionnee((ancienne) => {
        if (!ancienne) {
          return null;
        }

        return {
          ...ancienne,

          resultats: (
            ancienne.resultats ?? []
          ).map((item) =>
            item.id === resultatId
              ? {
                  ...item,
                  valide: true,
                }
              : item,
          ),
        };
      });
    } catch (error) {
      console.error(
        "handleValidation:",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de la validation.",
      );
    }
  }

  /* ========================================================
     OUVRIR DEMANDE
  ======================================================== */

  function ouvrirDemande(
    demande: Demande,
  ) {
    setDemandeSelectionnee(demande);
  }

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <>
      {/* ==================================================
          FILTRES
      ================================================== */}

      <div className="mb-6 rounded-xl border border-base-200 bg-base-100 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

          {/* RECHERCHE */}

          <label className="form-control lg:col-span-2">
            <div className="label">
              <span className="label-text font-medium">
                Recherche
              </span>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />

              <input
                type="text"
                value={recherche}
                onChange={(e) =>
                  setRecherche(
                    e.target.value,
                  )
                }
                placeholder="N° demande, dossier, patient, médecin, examen..."
                className="input input-bordered w-full pl-10"
              />
            </div>
          </label>

          {/* DATE DÉBUT */}

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">
                Date début
              </span>
            </div>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />

              <input
                type="date"
                value={dateDebut}
                onChange={(e) =>
                  setDateDebut(
                    e.target.value,
                  )
                }
                className="input input-bordered w-full pl-10"
              />
            </div>
          </label>

          {/* DATE FIN */}

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">
                Date fin
              </span>
            </div>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />

              <input
                type="date"
                value={dateFin}
                onChange={(e) =>
                  setDateFin(
                    e.target.value,
                  )
                }
                className="input input-bordered w-full pl-10"
              />
            </div>
          </label>

          {/* STATUT */}

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">
                Statut
              </span>
            </div>

            <select
              value={statut}
              onChange={(e) =>
                setStatut(
                  e.target.value,
                )
              }
              className="select select-bordered w-full"
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="DEMANDE">
                Demandée
              </option>

              <option value="EN_COURS">
                En cours
              </option>

              <option value="TERMINE">
                Terminée
              </option>

              <option value="ANNULEE">
                Annulée
              </option>
            </select>
          </label>
        </div>

        {/* DEUXIÈME LIGNE */}

        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">

          <label className="form-control w-full md:w-64">
            <div className="label">
              <span className="label-text font-medium">
                Urgence
              </span>
            </div>

            <select
              value={urgence}
              onChange={(e) =>
                setUrgence(
                  e.target.value,
                )
              }
              className="select select-bordered"
            >
              <option value="TOUS">
                Toutes
              </option>

              <option value="true">
                Urgentes uniquement
              </option>

              <option value="false">
                Non urgentes
              </option>
            </select>
          </label>

          <button
            type="button"
            onClick={resetFiltres}
            className="btn btn-outline"
          >
            <RefreshCw size={16} />
            Réinitialiser
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="badge badge-primary badge-lg">
              {demandesFiltrees.length} demande(s)
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          TABLEAU
      ================================================== */}

      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Demande</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Examens</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Urgence</th>
              <th className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {demandesFiltrees.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3 text-base-content/50">
                    <FlaskConical size={42} />

                    <p className="font-medium">
                      Aucune demande trouvée
                    </p>

                    <p className="text-sm">
                      Aucune demande ne correspond
                      aux critères actuels.
                    </p>

                    {demandes.length > 0 && (
                      <button
                        type="button"
                        onClick={resetFiltres}
                        className="btn btn-sm btn-outline"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              demandesFiltrees.map(
                (demande) => (
                  <tr key={demande.id}>

                    {/* DEMANDE */}

                    <td>
                      <div className="font-semibold">
                        {demande.numero}
                      </div>

                      <div className="text-xs text-base-content/50">
                        ID : {demande.id}
                      </div>

                      {demande.consultation && (
                        <div className="text-xs text-base-content/50">
                          Consultation #
                          {
                            demande
                              .consultation
                              .idConsultation
                          }
                        </div>
                      )}
                    </td>

                    {/* PATIENT */}

                    <td>
                      <div className="font-medium">
                        {nomPatient(
                          demande.patient,
                        )}
                      </div>

                      <div className="text-xs text-base-content/50">
                        {
                          demande.patient
                            ?.numeroDossier
                        }
                      </div>
                    </td>

                    {/* MÉDECIN */}

                    <td>
                      {demande.consultation?.medecin ? (
                        <>
                          <div className="font-medium">
                            Dr{" "}
                            {nomMedecin(
                              demande
                                .consultation
                                .medecin,
                            )}
                          </div>

                          <div className="text-xs text-base-content/50">
                            {
                              demande
                                .consultation
                                .medecin
                                .specialite
                                ?.nom
                            }
                          </div>
                        </>
                      ) : (
                        <span className="text-base-content/40">
                          Non renseigné
                        </span>
                      )}
                    </td>

                    {/* EXAMENS */}

                    <td>
                      <div className="flex flex-col gap-1">
                        {(
                          demande.lignes ??
                          []
                        )
                          .slice(0, 2)
                          .map((ligne) => (
                            <span
                              key={ligne.id}
                              className="badge badge-ghost"
                            >
                              {
                                ligne.examen
                                  ?.nom
                              }
                            </span>
                          ))}

                        {(
                          demande.lignes ??
                          []
                        ).length > 2 && (
                          <span className="text-xs text-base-content/50">
                            +
                            {demande.lignes.length -
                              2}{" "}
                            autre(s)
                          </span>
                        )}

                        {(
                          demande.lignes ??
                          []
                        ).length === 0 && (
                          <span className="text-xs text-base-content/40">
                            Aucun examen
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DATE */}

                    <td>
                      <div className="whitespace-nowrap">
                        {formatDate(
                          demande.dateDemande,
                        )}
                      </div>

                      <div className="text-xs text-base-content/50">
                        {formatTime(
                          demande.dateDemande,
                        )}
                      </div>
                    </td>

                    {/* STATUT */}

                    <td>
                      <span
                        className={`badge ${getStatutClass(
                          demande.statut,
                        )}`}
                      >
                        {getStatutLabel(
                          demande.statut,
                        )}
                      </span>
                    </td>

                    {/* URGENCE */}

                    <td>
                      {demande.urgence ? (
                        <span className="badge badge-error gap-1 text-white">
                          <AlertTriangle
                            size={13}
                          />
                          Urgent
                        </span>
                      ) : (
                        <span className="badge badge-ghost">
                          Normal
                        </span>
                      )}
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            ouvrirDemande(
                              demande,
                            )
                          }
                          className="btn btn-sm btn-primary"
                        >
                          <Eye size={16} />
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {demandeSelectionnee && (
        <div className="modal modal-open">
          <div className="modal-box max-w-6xl">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical
                    className="text-primary"
                    size={24}
                  />

                  <h3 className="text-xl font-bold">
                    Demande{" "}
                    {
                      demandeSelectionnee.numero
                    }
                  </h3>
                </div>

                <p className="mt-1 text-sm text-base-content/60">
                  Demandée le{" "}
                  {formatDateTime(
                    demandeSelectionnee.dateDemande,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDemandeSelectionnee(
                    null,
                  )
                }
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={20} />
              </button>
            </div>

            <div className="divider" />

            {/* PATIENT / MÉDECIN */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* PATIENT */}

              <div className="rounded-xl border border-base-200 p-4">
                <h4 className="mb-3 font-semibold">
                  Patient
                </h4>

                <p className="font-medium">
                  {nomPatient(
                    demandeSelectionnee.patient,
                  )}
                </p>

                <p className="text-sm text-base-content/60">
                  Dossier :{" "}
                  {
                    demandeSelectionnee
                      .patient
                      .numeroDossier
                  }
                </p>

                {demandeSelectionnee
                  .patient
                  .telephone && (
                  <p className="text-sm text-base-content/60">
                    Tél. :{" "}
                    {
                      demandeSelectionnee
                        .patient
                        .telephone
                    }
                  </p>
                )}

                {demandeSelectionnee
                  .patient
                  .sexe && (
                  <p className="text-sm text-base-content/60">
                    Sexe :{" "}
                    {
                      demandeSelectionnee
                        .patient.sexe
                    }
                  </p>
                )}

                {demandeSelectionnee
                  .patient
                  .dateNaissance && (
                  <p className="text-sm text-base-content/60">
                    Naissance :{" "}
                    {formatDate(
                      demandeSelectionnee
                        .patient
                        .dateNaissance,
                    )}
                  </p>
                )}
              </div>

              {/* MÉDECIN */}

              <div className="rounded-xl border border-base-200 p-4">
                <h4 className="mb-3 font-semibold">
                  Médecin prescripteur
                </h4>

                {demandeSelectionnee
                  .consultation
                  ?.medecin ? (
                  <>
                    <p className="font-medium">
                      Dr{" "}
                      {nomMedecin(
                        demandeSelectionnee
                          .consultation
                          .medecin,
                      )}
                    </p>

                    <p className="text-sm text-base-content/60">
                      {
                        demandeSelectionnee
                          .consultation
                          .medecin
                          .specialite
                          ?.nom
                      }
                    </p>

                    <p className="text-sm text-base-content/60">
                      {
                        demandeSelectionnee
                          .consultation
                          .medecin
                          .service?.nom
                      }
                    </p>
                  </>
                ) : (
                  <p className="text-base-content/50">
                    Médecin non renseigné
                  </p>
                )}
              </div>
            </div>

            {/* OBSERVATION */}

            {demandeSelectionnee.observation && (
              <div className="mt-4 rounded-xl bg-base-200/50 p-4">
                <h4 className="mb-1 font-semibold">
                  Observation
                </h4>

                <p className="text-sm">
                  {
                    demandeSelectionnee.observation
                  }
                </p>
              </div>
            )}

            <div className="divider">
              Examens demandés et résultats
            </div>

            {/* EXAMENS */}

            <div className="space-y-4">
              {(
                demandeSelectionnee.lignes ??
                []
              ).map((ligne) => {
                const resultat =
                  getResultat(
                    demandeSelectionnee,
                    ligne.examen.id,
                  );

                return (
                  <div
                    key={ligne.id}
                    className="rounded-xl border border-base-200 p-4"
                  >

                    {/* HEADER EXAMEN */}

                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FlaskConical
                            size={18}
                            className="text-primary"
                          />

                          <h4 className="font-semibold">
                            {
                              ligne.examen
                                .nom
                            }
                          </h4>
                        </div>

                        <p className="mt-1 text-xs text-base-content/50">
                          Code :{" "}
                          {
                            ligne.examen
                              .code
                          }
                        </p>

                        {ligne.examen
                          .valeurNormale && (
                          <p className="mt-1 text-xs text-base-content/60">
                            Valeur normale :{" "}
                            {
                              ligne.examen
                                .valeurNormale
                            }
                          </p>
                        )}
                      </div>

                      {resultat ? (
                        resultat.valide ? (
                          <span className="badge badge-success gap-1">
                            <CheckCircle2
                              size={14}
                            />
                            Validé
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            Résultat saisi
                          </span>
                        )
                      ) : (
                        <span className="badge badge-ghost">
                          En attente
                        </span>
                      )}
                    </div>

                    {/* FORMULAIRE */}

                    <form
                      onSubmit={async (
                        e,
                      ) => {
                        e.preventDefault();

                        await handleResultat(
                          demandeSelectionnee.id,
                          ligne.examen.id,
                          e.currentTarget,
                        );
                      }}
                      className="mt-4"
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                        {/* VALEUR */}

                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">
                              Résultat
                            </span>
                          </div>

                          <input
                            name="valeur"
                            defaultValue={
                              resultat?.valeur ??
                              ""
                            }
                            disabled={
                              resultat?.valide ===
                              true
                            }
                            placeholder="Ex. 1.20"
                            className="input input-bordered"
                          />
                        </label>

                        {/* UNITÉ */}

                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">
                              Unité
                            </span>
                          </div>

                          <input
                            name="unite"
                            defaultValue={
                              resultat?.unite ??
                              ligne.examen
                                .unite ??
                              ""
                            }
                            disabled={
                              resultat?.valide ===
                              true
                            }
                            className="input input-bordered"
                          />
                        </label>

                        {/* COMMENTAIRE */}

                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">
                              Commentaire
                            </span>
                          </div>

                          <textarea
                            name="commentaire"
                            defaultValue={
                              resultat?.commentaire ??
                              ""
                            }
                            disabled={
                              resultat?.valide ===
                              true
                            }
                            className="textarea textarea-bordered"
                            placeholder="Commentaire du laboratoire..."
                          />
                        </label>

                        {/* INTERPRÉTATION */}

                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">
                              Interprétation
                            </span>
                          </div>

                          <textarea
                            name="interpretation"
                            defaultValue={
                              resultat?.interpretation ??
                              ""
                            }
                            disabled={
                              resultat?.valide ===
                              true
                            }
                            className="textarea textarea-bordered"
                            placeholder="Interprétation du résultat..."
                          />
                        </label>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-4 flex flex-wrap justify-end gap-2">

                        {!resultat?.valide && (
                          <button
                            type="submit"
                            className="btn btn-sm btn-primary"
                          >
                            <Save size={16} />

                            {resultat
                              ? "Modifier le résultat"
                              : "Enregistrer le résultat"}
                          </button>
                        )}

                        {resultat &&
                          !resultat.valide && (
                            <button
                              type="button"
                              onClick={() =>
                                handleValidation(
                                  resultat.id,
                                )
                              }
                              className="btn btn-sm btn-success"
                            >
                              <CheckCircle2
                                size={16}
                              />
                              Valider
                            </button>
                          )}
                      </div>
                    </form>
                  </div>
                );
              })}

              {(
                demandeSelectionnee.lignes ??
                []
              ).length === 0 && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-6 text-center">
                  <p className="font-medium">
                    Aucun examen associé à cette
                    demande.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="modal-action">
              <button
                type="button"
                onClick={() =>
                  setDemandeSelectionnee(
                    null,
                  )
                }
                className="btn"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* BACKDROP */}

          <div
            className="modal-backdrop"
            onClick={() =>
              setDemandeSelectionnee(
                null,
              )
            }
          />
        </div>
      )}
    </>
  );
}