
import {
  ImageIcon,
  FileText,
} from "lucide-react";

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
   PAGE IMAGERIE
========================================================= */

export default async function ImageriePage() {
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
    Array.isArray(
      demandesResult.data,
    )
      ? demandesResult.data
      : [];

  /* =========================================================
     EXAMENS
  ========================================================= */

  const examens =
    examensResult.success &&
    Array.isArray(
      examensResult.data,
    )
      ? examensResult.data
      : [];

  /* =========================================================
     CATÉGORIES
  ========================================================= */

  const categories =
    categoriesResult.success &&
    Array.isArray(
      categoriesResult.data,
    )
      ? categoriesResult.data
      : [];

  return (
    <div className="space-y-8 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Imagerie médicale
          </h1>

          <p className="mt-1 text-base-content/60">
            Gestion des examens, demandes,
            catégories et comptes rendus
            d'imagerie médicale.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <AjouterCategorieImagerieButton />

          <AjouterExamenImagerie />
        </div>

      </div>

      {/* =====================================================
          ALERTES
      ===================================================== */}

      {!demandesResult.success && (
        <div className="alert alert-error">
          <span>
            {demandesResult.message}
          </span>
        </div>
      )}

      {!examensResult.success && (
        <div className="alert alert-error">
          <span>
            {examensResult.message}
          </span>
        </div>
      )}

      {/* =====================================================
          PETITS RÉSUMÉS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

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
                  Recherchez et filtrez les
                  examens demandés pour les
                  patients.
                </p>

              </div>

            </div>

            <span className="badge badge-primary badge-lg">
              {demandes.length} demande
              {demandes.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          <div className="divider my-2" />

          <DemandesImagerieTable
            demandes={demandes as any[]}
          />

        </div>

      </section>

      {/* =====================================================
          EXAMENS D'IMAGERIE
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
                  Gérez le catalogue des examens
                  et leurs tarifs.
                </p>

              </div>

            </div>

            <div className="badge badge-info badge-lg">
              {examens.length} examen
              {examens.length !== 1
                ? "s"
                : ""}
            </div>

          </div>

          <div className="divider my-2" />

          <ExamensImagerieTable
            examens={examens as any[]}
          />

        </div>

      </section>

    </div>
  );
}
