
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  Search,
  SlidersHorizontal,
  X,
  Eye,
  Receipt,
  CalendarDays,
  CreditCard,
  UserRound,
  RotateCcw,
  ChevronDown,
  Ban,
  Trash2,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

import {
  annulerPaiement,
  deletePaiement,
} from "@/app/actions/paiements";

/* ==========================================================
   TYPES
========================================================== */

type Paiement = {
  id: number;
  reference: string;
  montant: number | string;
  devise: string;
  modePaiement: string;
  type: string;
  statut: string;
  datePaiement: Date | string;
  description: string | null;

  patient?: {
    id: number;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    numeroDossier: string;
    telephone?: string | null;
  } | null;

  facture?: {
    id: number;
    numero: string;
  } | null;

  caissier?: {
    id: number;
    name: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  paiements?: Paiement[] | null;
};

/* ==========================================================
   UTILITAIRES
========================================================== */

function formatDate(
  date: Date | string | null | undefined,
) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPatient(
  patient: Paiement["patient"],
) {
  if (!patient) return "-";

  return [
    patient.nom,
    patient.postNom,
    patient.prenom,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatMontant(
  montant: number | string,
  devise: string,
) {
  const valeur = Number(montant);

  if (Number.isNaN(valeur)) {
    return `0.00 ${devise}`;
  }

  return `${valeur.toFixed(2)} ${devise}`;
}

/* ==========================================================
   MODE DE PAIEMENT
========================================================== */

function getModeLabel(mode: string) {
  const modes: Record<string, string> = {
    ESPECES: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    VIREMENT: "Virement bancaire",
    CHEQUE: "Chèque",
  };

  return modes[mode] || mode || "-";
}

/* ==========================================================
   TYPE
========================================================== */

function getTypeLabel(type: string) {
  const types: Record<string, string> = {
    PAIEMENT: "Paiement",
    AVANCE: "Avance",
    SOLDE: "Solde",
    ACOMPTE: "Acompte",
    REMBOURSEMENT: "Remboursement",
  };

  return types[type] || type || "-";
}

/* ==========================================================
   STATUT
========================================================== */

function getStatutLabel(statut: string) {
  const statuts: Record<string, string> = {
    PAYE: "Payé",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
  };

  return statuts[statut] || statut || "-";
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "PAYE":
      return "badge badge-success gap-1";

    case "ANNULE":
      return "badge badge-error gap-1";

    case "REMBOURSE":
      return "badge badge-warning gap-1";

    default:
      return "badge badge-ghost";
  }
}

/* ==========================================================
   COMPOSANT
========================================================== */

export default function PaiementTable({
  paiements,
}: Props) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  /* ========================================================
     LISTE
  ======================================================== */

  const listePaiements = Array.isArray(paiements)
    ? paiements
    : [];

  /* ========================================================
     RECHERCHE
  ======================================================== */

  const [search, setSearch] = useState("");

  /* ========================================================
     FILTRES
  ======================================================== */

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const [statut, setStatut] =
    useState("TOUS");

  const [modePaiement, setModePaiement] =
    useState("TOUS");

  const [typePaiement, setTypePaiement] =
    useState("TOUS");

  const [dateDebut, setDateDebut] =
    useState("");

  const [dateFin, setDateFin] =
    useState("");

  const [montantMin, setMontantMin] =
    useState("");

  const [montantMax, setMontantMax] =
    useState("");

  /* ========================================================
     OPTIONS DYNAMIQUES
  ======================================================== */

  const modesPaiement = useMemo(() => {
    return Array.from(
      new Set(
        listePaiements
          .map((p) => p.modePaiement)
          .filter(Boolean),
      ),
    );
  }, [listePaiements]);

  const typesPaiement = useMemo(() => {
    return Array.from(
      new Set(
        listePaiements
          .map((p) => p.type)
          .filter(Boolean),
      ),
    );
  }, [listePaiements]);

  /* ========================================================
     FILTRAGE
  ======================================================== */

  const paiementsFiltres = useMemo(() => {
    const recherche =
      search.trim().toLowerCase();

    return listePaiements.filter((p) => {
      const patient = p.patient;
      const facture = p.facture;

      const nomPatient = [
        patient?.nom,
        patient?.postNom,
        patient?.prenom,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const dossier =
        String(
          patient?.numeroDossier || "",
        ).toLowerCase();

      const reference =
        String(
          p.reference || "",
        ).toLowerCase();

      const numeroFacture =
        String(
          facture?.numero || "",
        ).toLowerCase();

      const telephone =
        String(
          patient?.telephone || "",
        ).toLowerCase();

      const mode =
        String(
          getModeLabel(
            p.modePaiement,
          ),
        ).toLowerCase();

      const type =
        String(
          getTypeLabel(p.type),
        ).toLowerCase();

      const correspondRecherche =
        !recherche ||
        reference.includes(recherche) ||
        nomPatient.includes(recherche) ||
        dossier.includes(recherche) ||
        numeroFacture.includes(recherche) ||
        telephone.includes(recherche) ||
        mode.includes(recherche) ||
        type.includes(recherche);

      if (!correspondRecherche) {
        return false;
      }

      /* STATUT */

      if (
        statut !== "TOUS" &&
        p.statut !== statut
      ) {
        return false;
      }

      /* MODE */

      if (
        modePaiement !== "TOUS" &&
        p.modePaiement !== modePaiement
      ) {
        return false;
      }

      /* TYPE */

      if (
        typePaiement !== "TOUS" &&
        p.type !== typePaiement
      ) {
        return false;
      }

      /* DATE */

      if (p.datePaiement) {
        const datePaiement =
          new Date(p.datePaiement);

        if (dateDebut) {
          const debut = new Date(
            `${dateDebut}T00:00:00`,
          );

          if (datePaiement < debut) {
            return false;
          }
        }

        if (dateFin) {
          const fin = new Date(
            `${dateFin}T23:59:59.999`,
          );

          if (datePaiement > fin) {
            return false;
          }
        }
      }

      /* MONTANT MIN */

      if (montantMin) {
        const min =
          Number(montantMin);

        if (
          Number.isFinite(min) &&
          Number(p.montant || 0) < min
        ) {
          return false;
        }
      }

      /* MONTANT MAX */

      if (montantMax) {
        const max =
          Number(montantMax);

        if (
          Number.isFinite(max) &&
          Number(p.montant || 0) > max
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    listePaiements,
    search,
    statut,
    modePaiement,
    typePaiement,
    dateDebut,
    dateFin,
    montantMin,
    montantMax,
  ]);

  /* ========================================================
     STATISTIQUES
  ======================================================== */

  const statistiques = useMemo(() => {
    const valides =
      paiementsFiltres.filter(
        (p) =>
          p.statut !== "ANNULE",
      );

    const annules =
      paiementsFiltres.filter(
        (p) =>
          p.statut === "ANNULE",
      );

    const rembourses =
      paiementsFiltres.filter(
        (p) =>
          p.statut === "REMBOURSE",
      );

    const total = valides.reduce(
      (total, p) =>
        total +
        Number(p.montant || 0),
      0,
    );

    const totalAnnule =
      annules.reduce(
        (total, p) =>
          total +
          Number(p.montant || 0),
        0,
      );

    const totalRembourse =
      rembourses.reduce(
        (total, p) =>
          total +
          Number(p.montant || 0),
        0,
      );

    return {
      total,
      totalAnnule,
      totalRembourse,
      nombre: paiementsFiltres.length,
    };
  }, [paiementsFiltres]);

  /* ========================================================
     FILTRES ACTIFS
  ======================================================== */

  const hasFilters =
    search.trim() !== "" ||
    statut !== "TOUS" ||
    modePaiement !== "TOUS" ||
    typePaiement !== "TOUS" ||
    dateDebut !== "" ||
    dateFin !== "" ||
    montantMin !== "" ||
    montantMax !== "";

  /* ========================================================
     RESET
  ======================================================== */

  function resetFilters() {
    setSearch("");
    setStatut("TOUS");
    setModePaiement("TOUS");
    setTypePaiement("TOUS");
    setDateDebut("");
    setDateFin("");
    setMontantMin("");
    setMontantMax("");
  }

  /* ========================================================
     ANNULER PAIEMENT
  ======================================================== */

  const handleAnnuler = async (
    paiement: Paiement,
  ) => {
    if (loadingId !== null) {
      return;
    }

    const confirmation =
      await Swal.fire({
        icon: "warning",
        title: "Annuler le paiement ?",

        html: `
          <div style="text-align:left">
            <p>
              <strong>Référence :</strong>
              ${paiement.reference}
            </p>

            <p>
              <strong>Montant :</strong>
              ${formatMontant(
                paiement.montant,
                paiement.devise,
              )}
            </p>

            <p style="margin-top:10px">
              Cette opération annulera le paiement.
            </p>
          </div>
        `,

        showCancelButton: true,

        confirmButtonText:
          "Oui, annuler",

        cancelButtonText:
          "Conserver",

        reverseButtons: true,

        confirmButtonColor:
          "#d33",

        cancelButtonColor:
          "#6b7280",
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoadingId(paiement.id);

      const result =
        await annulerPaiement(
          paiement.id,
        );

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible d'annuler le paiement.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Paiement annulé avec succès.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur annulation paiement :",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de l'annulation.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  /* ========================================================
     SUPPRIMER PAIEMENT
  ======================================================== */

  const handleDelete = async (
    paiement: Paiement,
  ) => {
    if (loadingId !== null) {
      return;
    }

    const confirmation =
      await Swal.fire({
        icon: "warning",

        title:
          "Supprimer définitivement ?",

        html: `
          <div style="text-align:left">
            <p>
              <strong>Référence :</strong>
              ${paiement.reference}
            </p>

            <p>
              <strong>Montant :</strong>
              ${formatMontant(
                paiement.montant,
                paiement.devise,
              )}
            </p>

            <p style="margin-top:10px">
              <strong>Attention :</strong>
              cette opération est irréversible.
            </p>
          </div>
        `,

        showCancelButton: true,

        confirmButtonText:
          "Oui, supprimer",

        cancelButtonText:
          "Annuler",

        reverseButtons: true,

        confirmButtonColor:
          "#d33",

        cancelButtonColor:
          "#6b7280",
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoadingId(paiement.id);

      const result =
        await deletePaiement(
          paiement.id,
        );

      if (!result?.success) {
        toast.error(
          result?.message ||
            "Impossible de supprimer le paiement.",
        );

        return;
      }

      toast.success(
        result.message ||
          "Paiement supprimé avec succès.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur suppression paiement :",
        error,
      );

      toast.error(
        "Une erreur est survenue lors de la suppression.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <div className="space-y-4">

      {/* ====================================================
          STATISTIQUES
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/50">
                Paiements
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistiques.nombre}
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Wallet size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Résultats correspondant aux filtres
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/50">
                Total encaissé
              </p>

              <p className="mt-1 text-2xl font-bold text-success">
                {statistiques.total.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-success/10 p-3 text-success">
              <CircleDollarSign size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Paiements valides
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/50">
                Annulé
              </p>

              <p className="mt-1 text-2xl font-bold text-error">
                {statistiques.totalAnnule.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-error/10 p-3 text-error">
              <Ban size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Montant annulé
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/50">
                Remboursé
              </p>

              <p className="mt-1 text-2xl font-bold text-warning">
                {statistiques.totalRembourse.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-warning/10 p-3 text-warning">
              <RotateCcw size={22} />
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Montant remboursé
          </p>
        </div>
      </div>

      {/* ====================================================
          CONTENEUR
      ==================================================== */}

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

        {/* ==================================================
            BARRE DE RECHERCHE
        ================================================== */}

        <div className="border-b border-base-300 p-4 md:p-5">

          <div className="flex flex-col gap-3 xl:flex-row">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Rechercher : référence, patient, dossier, facture, téléphone..."
                className="input input-bordered w-full pl-10 pr-10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAdvanced(
                  !showAdvanced,
                )
              }
              className={`btn ${
                showAdvanced
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              <SlidersHorizontal
                size={18}
              />

              Filtres avancés

              {hasFilters && (
                <span className="badge badge-secondary badge-sm">
                  Actif
                </span>
              )}

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showAdvanced
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost"
              >
                <RotateCcw
                  size={17}
                />

                Réinitialiser
              </button>
            )}
          </div>

          {/* ==================================================
              FILTRES AVANCÉS
          ================================================== */}

          {showAdvanced && (
            <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/40 p-4">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold">
                    Recherche avancée
                  </h3>

                  <p className="text-xs text-base-content/50">
                    Affinez les paiements selon plusieurs critères.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-xs btn-ghost"
                >
                  Effacer
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                {/* STATUT */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-base-content/60">
                    Statut
                  </label>

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
                      Tous
                    </option>

                    <option value="PAYE">
                      Payé
                    </option>

                    <option value="ANNULE">
                      Annulé
                    </option>

                    <option value="REMBOURSE">
                      Remboursé
                    </option>
                  </select>
                </div>

                {/* MODE */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-base-content/60">
                    Mode de paiement
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
                    className="select select-bordered w-full"
                  >
                    <option value="TOUS">
                      Tous
                    </option>

                    {modesPaiement.map(
                      (mode) => (
                        <option
                          key={mode}
                          value={mode}
                        >
                          {getModeLabel(
                            mode,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-base-content/60">
                    Type
                  </label>

                  <select
                    value={
                      typePaiement
                    }
                    onChange={(e) =>
                      setTypePaiement(
                        e.target.value,
                      )
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="TOUS">
                      Tous
                    </option>

                    {typesPaiement.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {getTypeLabel(
                            type,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* DATE DEBUT */}

                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-base-content/60">
                    <CalendarDays
                      size={13}
                    />
                    Date début
                  </label>

                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) =>
                      setDateDebut(
                        e.target.value,
                      )
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                {/* DATE FIN */}

                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-base-content/60">
                    <CalendarDays
                      size={13}
                    />
                    Date fin
                  </label>

                  <input
                    type="date"
                    value={dateFin}
                    min={dateDebut || undefined}
                    onChange={(e) =>
                      setDateFin(
                        e.target.value,
                      )
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                {/* MONTANT MIN */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-base-content/60">
                    Montant minimum
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={montantMin}
                    onChange={(e) =>
                      setMontantMin(
                        e.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="input input-bordered w-full"
                  />
                </div>

              </div>

              {/* MONTANT MAX */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-base-content/60">
                    Montant maximum
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={montantMax}
                    onChange={(e) =>
                      setMontantMax(
                        e.target.value,
                      )
                    }
                    placeholder="0.00"
                    className="input input-bordered w-full"
                  />
                </div>

              </div>

              {/* RÉSUMÉ */}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-base-300 pt-4">

                <span className="text-sm text-base-content/50">
                  Résultats :
                </span>

                <span className="badge badge-primary">
                  {paiementsFiltres.length} paiement(s)
                </span>

                {dateDebut && (
                  <span className="badge badge-outline">
                    À partir du {dateDebut}
                  </span>
                )}

                {dateFin && (
                  <span className="badge badge-outline">
                    Jusqu'au {dateFin}
                  </span>
                )}

                {(montantMin ||
                  montantMax) && (
                  <span className="badge badge-outline">
                    Montant :
                    {" "}
                    {montantMin || "0"}
                    {" - "}
                    {montantMax || "∞"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================
            EN-TÊTE TABLEAU
        ================================================== */}

        <div className="flex flex-col gap-2 border-b border-base-300 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">

          <div>
            <h2 className="font-bold">
              Liste des paiements
            </h2>

            <p className="text-xs text-base-content/50">
              {paiementsFiltres.length}
              {" "}
              résultat(s) sur{" "}
              {listePaiements.length}
            </p>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-outline">
                Filtres actifs
              </span>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="btn btn-xs btn-ghost"
              >
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
            TABLEAU
        ================================================== */}

        <div className="overflow-x-auto">

          <table className="table table-zebra">

            <thead>
              <tr>
                <th>Référence</th>
                <th>Patient</th>
                <th>Facture</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Type</th>
                <th>Date</th>
                <th>Statut</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {paiementsFiltres.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
                        <Search
                          size={30}
                        />
                      </div>

                      <h3 className="font-semibold">
                        Aucun paiement trouvé
                      </h3>

                      <p className="mt-1 text-sm text-base-content/50">
                        Aucun paiement ne correspond
                        aux critères sélectionnés.
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={
                            resetFilters
                          }
                          className="btn btn-primary btn-sm mt-4"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paiementsFiltres.map(
                  (paiement) => {
                    const isLoading =
                      loadingId ===
                      paiement.id;

                    const isAnnule =
                      paiement.statut ===
                      "ANNULE";

                    return (
                      <tr
                        key={
                          paiement.id
                        }
                        className="hover"
                      >

                        {/* REFERENCE */}

                        <td>
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <CreditCard
                                size={17}
                              />
                            </div>

                            <div>
                              <div className="font-bold">
                                {
                                  paiement.reference
                                }
                              </div>

                              <div className="text-xs text-base-content/40">
                                ID #
                                {
                                  paiement.id
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* PATIENT */}

                        <td>
                          {paiement.patient ? (
                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserRound
                                  size={16}
                                />
                              </div>

                              <div>
                                <div className="whitespace-nowrap font-semibold">
                                  {formatPatient(
                                    paiement.patient,
                                  )}
                                </div>

                                <div className="text-xs text-base-content/50">
                                  {
                                    paiement
                                      .patient
                                      .numeroDossier
                                  }
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-base-content/40">
                              Patient inconnu
                            </span>
                          )}
                        </td>

                        {/* FACTURE */}

                        <td>
                          {paiement.facture ? (
                            <Link
                              href={`/facturation/factures/${paiement.facture.id}`}
                              className="font-semibold text-primary hover:underline"
                            >
                              {
                                paiement
                                  .facture
                                  .numero
                              }
                            </Link>
                          ) : (
                            <span className="text-base-content/40">
                              Sans facture
                            </span>
                          )}
                        </td>

                        {/* MONTANT */}

                        <td>
                          <div className="whitespace-nowrap">

                            <div className="font-bold">
                              {Number(
                                paiement.montant,
                              ).toFixed(2)}
                            </div>

                            <div className="text-xs text-base-content/50">
                              {
                                paiement.devise
                              }
                            </div>
                          </div>
                        </td>

                        {/* MODE */}

                        <td>
                          <span className="badge badge-outline whitespace-nowrap">
                            {
                              getModeLabel(
                                paiement.modePaiement,
                              )
                            }
                          </span>
                        </td>

                        {/* TYPE */}

                        <td>
                          <span className="text-sm">
                            {
                              getTypeLabel(
                                paiement.type,
                              )
                            }
                          </span>
                        </td>

                        {/* DATE */}

                        <td>
                          <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                            <CalendarDays
                              size={15}
                              className="text-base-content/40"
                            />

                            {formatDate(
                              paiement.datePaiement,
                            )}
                          </div>
                        </td>

                        {/* STATUT */}

                        <td>
                          <span
                            className={getStatutClass(
                              paiement.statut,
                            )}
                          >
                            {paiement.statut ===
                              "PAYE" &&
                              "✓"}

                            {paiement.statut ===
                              "ANNULE" &&
                              "!"}

                            {paiement.statut ===
                              "REMBOURSE" &&
                              "↩"}

                            {
                              getStatutLabel(
                                paiement.statut,
                              )
                            }
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="flex justify-end gap-1">

                            {/* VOIR */}

                            <Link
                              href={`/facturation/paiements/${paiement.id}`}
                              className="btn btn-sm btn-ghost"
                              title="Voir le paiement"
                            >
                              <Eye
                                size={17}
                              />
                            </Link>

                            {/* REÇU */}

                            <Link
                              href={`/paiements/${paiement.id}/print`}
                              className="btn btn-sm btn-outline"
                              title="Imprimer le reçu"
                            >
                              <Receipt
                                size={17}
                              />
                            </Link>

                            {/* ANNULER */}

                            {!isAnnule && (
                              <button
                                type="button"
                                className="btn btn-sm btn-warning btn-outline"
                                disabled={
                                  loadingId !==
                                  null
                                }
                                onClick={() =>
                                  handleAnnuler(
                                    paiement,
                                  )
                                }
                                title="Annuler"
                              >
                                {isLoading ? (
                                  <span className="loading loading-spinner loading-xs" />
                                ) : (
                                  <RotateCcw
                                    size={16}
                                  />
                                )}
                              </button>
                            )}

                            {/* SUPPRIMER */}

                            <button
                              type="button"
                              className="btn btn-sm btn-error btn-outline"
                              disabled={
                                loadingId !==
                                null
                              }
                              onClick={() =>
                                handleDelete(
                                  paiement,
                                )
                              }
                              title="Supprimer"
                            >
                              {isLoading ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  },
                )
              )}

            </tbody>
          </table>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        {paiementsFiltres.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-base-300 bg-base-200/30 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">

            <div className="text-sm text-base-content/60">
              Affichage de{" "}
              <strong className="text-base-content">
                {paiementsFiltres.length}
              </strong>{" "}
              paiement(s)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/50">
                Total filtré :
              </span>

              <span className="font-bold text-success">
                {statistiques.total.toFixed(
                  2,
                )}{" "}
                {paiementsFiltres[0]
                  ?.devise || "USD"}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
