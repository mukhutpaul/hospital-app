import {
  FlaskConical,
  ClipboardList,
  BookOpen,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  getExamensLaboratoire,
} from "@/app/actions/examens-laboratoire";

import {
  getDemandesLaboratoire,
} from "@/app/actions/laboratoire";

import ExamenLaboratoireForm from "@/components/laboratoire/ExamenLaboratoireForm";

import ExamenLaboratoireTable from "@/components/laboratoire/ExamenLaboratoireTable";

import DemandeLaboratoireTable from "@/components/laboratoire/DemandeLaboratoireTable";

/* ==========================================================
   PAGE LABORATOIRE
========================================================== */

export default async function LaboratoirePage() {
  /* ========================================================
     CHARGEMENT DU CATALOGUE DES EXAMENS
  ======================================================== */

  const examensResult =
    await getExamensLaboratoire();

  const examens =
    examensResult.success &&
    Array.isArray(examensResult.data)
      ? examensResult.data
      : [];

  /* ========================================================
     CHARGEMENT DES DEMANDES DE LABORATOIRE
  ======================================================== */

  const demandesResult =
    await getDemandesLaboratoire();

  const demandes =
    demandesResult.success &&
    Array.isArray(demandesResult.data)
      ? demandesResult.data
      : [];

  /* ========================================================
     STATISTIQUES DU CATALOGUE
  ======================================================== */

  const totalExamens =
    examens.length;

  const examensActifs =
    examens.filter(
      (examen) => examen.actif === true,
    ).length;

  const examensDesactives =
    examens.filter(
      (examen) => examen.actif === false,
    ).length;

  /* ========================================================
     STATISTIQUES DES DEMANDES
  ======================================================== */

  const totalDemandes =
    demandes.length;

  const demandesEnAttente =
    demandes.filter(
      (demande) =>
        demande.statut === "DEMANDE",
    ).length;

  const demandesEnCours =
    demandes.filter(
      (demande) =>
        demande.statut === "EN_COURS",
    ).length;

  const demandesTerminees =
    demandes.filter(
      (demande) =>
        demande.statut === "TERMINE",
    ).length;

  const demandesUrgentes =
    demandes.filter(
      (demande) =>
        demande.urgence === true,
    ).length;

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <div className="space-y-8 p-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <FlaskConical size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Laboratoire
            </h1>

            <p className="text-sm text-base-content/60">
              Gestion des examens, demandes et résultats
              de laboratoire
            </p>
          </div>

        </div>

      </div>

      {/* ====================================================
          STATISTIQUES DES DEMANDES
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  Demandes reçues
                </p>

                <p className="text-3xl font-bold text-primary">
                  {totalDemandes}
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <ClipboardList size={24} />
              </div>

            </div>

          </div>
        </div>

        {/* EN ATTENTE */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  En attente
                </p>

                <p className="text-3xl font-bold text-warning">
                  {demandesEnAttente}
                </p>
              </div>

              <div className="rounded-xl bg-warning/10 p-3 text-warning">
                <Clock3 size={24} />
              </div>

            </div>

          </div>
        </div>

        {/* EN COURS */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  En cours
                </p>

                <p className="text-3xl font-bold text-info">
                  {demandesEnCours}
                </p>
              </div>

              <div className="rounded-xl bg-info/10 p-3 text-info">
                <FlaskConical size={24} />
              </div>

            </div>

          </div>
        </div>

        {/* URGENTES */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  Demandes urgentes
                </p>

                <p className="text-3xl font-bold text-error">
                  {demandesUrgentes}
                </p>
              </div>

              <div className="rounded-xl bg-error/10 p-3 text-error">
                <AlertTriangle size={24} />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ====================================================
          RÉSUMÉ DES DEMANDES
      ==================================================== */}

      <div className="flex flex-wrap gap-2">

        <span className="badge badge-warning badge-lg">
          En attente : {demandesEnAttente}
        </span>

        <span className="badge badge-info badge-lg">
          En cours : {demandesEnCours}
        </span>

        <span className="badge badge-success badge-lg">
          Terminées : {demandesTerminees}
        </span>

        <span className="badge badge-error badge-lg text-white">
          Urgentes : {demandesUrgentes}
        </span>

      </div>

      {/* ====================================================
          DEMANDES DES MÉDECINS
      ==================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ClipboardList size={21} />
              </div>

              <div>

                <h2 className="text-lg font-semibold">
                  Demandes des médecins
                </h2>

                <p className="text-sm text-base-content/60">
                  Examens de laboratoire prescrits
                  lors des consultations.
                </p>

              </div>

            </div>

            <div className="badge badge-primary badge-lg">
              {totalDemandes} demande(s)
            </div>

          </div>

          {/* ==================================================
              TABLEAU DES DEMANDES
          ================================================== */}

          <DemandeLaboratoireTable
            demandes={demandes}
          />

        </div>

      </div>

      {/* ====================================================
          SÉPARATEUR CATALOGUE
      ==================================================== */}

      <div className="divider">
        <div className="flex items-center gap-2">
          <BookOpen size={18} />
          Catalogue du laboratoire
        </div>
      </div>

      {/* ====================================================
          STATISTIQUES DU CATALOGUE
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* TOTAL EXAMENS */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  Examens disponibles
                </p>

                <p className="text-3xl font-bold text-primary">
                  {totalExamens}
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <FlaskConical size={24} />
              </div>

            </div>

          </div>
        </div>

        {/* EXAMENS ACTIFS */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  Examens actifs
                </p>

                <p className="text-3xl font-bold text-success">
                  {examensActifs}
                </p>
              </div>

              <div className="rounded-xl bg-success/10 p-3 text-success">
                <CheckCircle2 size={24} />
              </div>

            </div>

          </div>
        </div>

        {/* EXAMENS DÉSACTIVÉS */}

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/50">
                  Examens désactivés
                </p>

                <p className="text-3xl font-bold text-error">
                  {examensDesactives}
                </p>
              </div>

              <div className="rounded-xl bg-error/10 p-3 text-error">
                <FlaskConical size={24} />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ====================================================
          AJOUT D'UN EXAMEN
      ==================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="mb-5">

            <h2 className="text-lg font-semibold">
              Ajouter un examen de laboratoire
            </h2>

            <p className="text-sm text-base-content/60">
              Enregistrez les examens disponibles
              dans le catalogue du laboratoire.
            </p>

          </div>

          <ExamenLaboratoireForm />

        </div>

      </div>

      {/* ====================================================
          CATALOGUE DES EXAMENS
      ==================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FlaskConical size={21} />
              </div>

              <div>

                <h2 className="text-lg font-semibold">
                  Examens disponibles
                </h2>

                <p className="text-sm text-base-content/60">
                  Catalogue des examens pouvant être
                  demandés pendant une consultation.
                </p>

              </div>

            </div>

            <div className="badge badge-primary badge-lg">
              {totalExamens} examen(s)
            </div>

          </div>

          <ExamenLaboratoireTable
            examens={examens}
          />

        </div>

      </div>

    </div>
  );
}