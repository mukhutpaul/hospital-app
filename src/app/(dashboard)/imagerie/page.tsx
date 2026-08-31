
import { redirect } from "next/navigation";

import {
  ImageIcon,
  FileText,
} from "lucide-react";

import { auth } from "@/lib/auth";

import {
  getCategoriesImagerie,
  getDemandesImagerie,
  getExamensImagerie,
} from "@/app/actions/imagerie";

import AjouterCategorieImagerieButton from "@/components/imagerie/AjouterCategorieImagerieButton";
import AjouterExamenImagerie from "@/components/imagerie/AjouterExamenImagerie";

import DemandesImagerieTable from "@/components/imagerie/DemandesImagerieTable";
import ExamensImagerieTable from "@/components/imagerie/ExamensImagerieTable";

/* =========================================================
   RÔLES AUTORISÉS À ADMINISTRER LE CATALOGUE D'IMAGERIE

   IMPORTANT :
   - Le médecin ne doit PAS créer les examens du catalogue.
   - Le médecin prescrit/demande un examen existant.
   - La création du catalogue est réservée aux responsables.
========================================================= */

const ROLES_GESTION_IMAGERIE = [
  "ADMIN",
  "DIRECTEUR",
  "RESPONSABLE_IMAGERIE",
  "RADIOLOGUE",
] as const;

/* =========================================================
   PAGE IMAGERIE
========================================================= */

export default async function ImageriePage() {
  /* =========================================================
     AUTHENTIFICATION
  ========================================================= */

  const session = await auth();

  /*
   * Aucun utilisateur connecté
   */
  if (!session?.user) {
    redirect("/login");
  }

  /*
   * Récupération sécurisée du rôle.
   *
   * On utilise String() afin d'éviter les problèmes
   * éventuels de typage si le rôle n'est pas encore
   * correctement déclaré dans les types NextAuth.
   */
  const role = session.user.role
    ? String(session.user.role)
    : undefined;

  /* =========================================================
     AUTORISATION
  ========================================================= */

  const peutGererCatalogue =
    !!role &&
    ROLES_GESTION_IMAGERIE.includes(
      role as (typeof ROLES_GESTION_IMAGERIE)[number],
    );

  /*
   * Si tu veux que seuls les responsables du module
   * puissent accéder complètement à cette page,
   * décommente ce bloc.

   if (!peutGererCatalogue) {
     redirect("/dashboard");
   }
  */

  /* =========================================================
     CHARGEMENT DES DONNÉES
  ========================================================= */

  const [
    demandesResult,
    examensResult,
    categoriesResult,
  ] = await Promise.all([
    getDemandesImagerie(),
    getExamensImagerie(),
    getCategoriesImagerie(),
  ]);

  /* =========================================================
     DEMANDES
  ========================================================= */

  const demandes =
    demandesResult.success &&
    Array.isArray(demandesResult.data)
      ? demandesResult.data
      : [];

  /* =========================================================
     EXAMENS
  ========================================================= */

  const examens =
    examensResult.success &&
    Array.isArray(examensResult.data)
      ? examensResult.data
      : [];

  /* =========================================================
     CATÉGORIES
  ========================================================= */

  const categories =
    categoriesResult.success &&
    Array.isArray(categoriesResult.data)
      ? categoriesResult.data
      : [];

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ImageIcon size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Imagerie médicale
                  </h1>

                  {peutGererCatalogue && (
                    <span className="badge badge-primary badge-outline">
                      Administration
                    </span>
                  )}

                </div>

                <p className="mt-1 max-w-3xl text-sm text-base-content/60 sm:text-base">
                  Gestion des examens, demandes, catégories
                  et comptes rendus d'imagerie médicale.
                </p>

              </div>

            </div>

            {/* =================================================
                ACTIONS ADMINISTRATION
            ================================================= */}

            {peutGererCatalogue && (
              <div className="flex flex-wrap gap-2">

                <AjouterCategorieImagerieButton />

                <AjouterExamenImagerie />

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            INFORMATION POUR UTILISATEUR NON ADMINISTRATEUR
        ===================================================== */}

        {!peutGererCatalogue && (
          <div className="alert border border-info/20 bg-info/10 text-info shadow-sm">

            <ImageIcon size={20} />

            <div>
              <h3 className="font-semibold">
                Consultation du module d'imagerie
              </h3>

              <p className="text-sm">
                Vous pouvez consulter et traiter les demandes
                d'imagerie qui vous sont accessibles.
                La gestion du catalogue est réservée aux
                utilisateurs autorisés.
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            ALERTES
        ===================================================== */}

        {!demandesResult.success && (
          <div className="alert alert-error shadow-sm">
            <span>
              {demandesResult.message}
            </span>
          </div>
        )}

        {!examensResult.success && (
          <div className="alert alert-error shadow-sm">
            <span>
              {examensResult.message}
            </span>
          </div>
        )}

        {!categoriesResult.success && (
          <div className="alert alert-error shadow-sm">
            <span>
              {categoriesResult.message}
            </span>
          </div>
        )}

        {/* =====================================================
            STATISTIQUES
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* ===================================================
              DEMANDES
          =================================================== */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Demandes
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {demandes.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon size={24} />
              </div>

            </div>

            <p className="mt-2 text-xs text-base-content/50">
              Demandes d'imagerie enregistrées
            </p>

          </div>

          {/* ===================================================
              EXAMENS
          =================================================== */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Examens
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {examens.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info">
                <FileText size={24} />
              </div>

            </div>

            <p className="mt-2 text-xs text-base-content/50">
              Examens disponibles dans le catalogue
            </p>

          </div>

          {/* ===================================================
              CATÉGORIES
          =================================================== */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Catégories
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {categories.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                🗂️
              </div>

            </div>

            <p className="mt-2 text-xs text-base-content/50">
              Catégories d'imagerie disponibles
            </p>

          </div>

        </div>

        {/* =====================================================
            DEMANDES D'IMAGERIE
        ===================================================== */}

        <section className="card border border-base-200 bg-base-100 shadow-sm">

          <div className="card-body">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ImageIcon size={22} />
                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Demandes d'imagerie
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Recherchez et filtrez les examens
                    demandés pour les patients.
                  </p>

                </div>

              </div>

              <span className="badge badge-primary badge-lg">
                {demandes.length} demande
                {demandes.length !== 1 ? "s" : ""}
              </span>

            </div>

            <div className="divider my-2" />

            <DemandesImagerieTable
              demandes={demandes as any[]}
            />

          </div>

        </section>

        {/* =====================================================
            CATALOGUE D'IMAGERIE
        ===================================================== */}

        <section className="card border border-base-200 bg-base-100 shadow-sm">

          <div className="card-body">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                  <FileText size={22} />
                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Examens d'imagerie
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Catalogue des examens disponibles
                    et leurs tarifs.
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <div className="badge badge-info badge-lg">
                  {examens.length} examen
                  {examens.length !== 1 ? "s" : ""}
                </div>

                {!peutGererCatalogue && (
                  <div className="badge badge-ghost">
                    Lecture seule
                  </div>
                )}

              </div>

            </div>

            <div className="divider my-2" />

            <ExamensImagerieTable
              examens={examens as any[]}
              // Le tableau doit également vérifier
              // les permissions avant d'afficher
              // Modifier / Supprimer.
              peutGererCatalogue={peutGererCatalogue}
            />

          </div>

        </section>

      </div>
    </main>
  );
}
