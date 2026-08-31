
"use client";

import Link from "next/link";
import {
  ShieldX,
  ArrowLeft,
  Home,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";

export default function AccesRefusePage() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* =====================================================
            CARD PRINCIPALE
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">

          {/* ===================================================
              HEADER
          ==================================================== */}

          <div className="bg-error/10 px-6 py-10 text-center sm:px-10">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-error/10 text-error">
              <ShieldX
                size={52}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="mt-6 text-3xl font-black text-base-content sm:text-4xl">
              Accès refusé
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-base text-base-content/60">
              Vous n&apos;avez pas les autorisations nécessaires
              pour accéder à cette page.
            </p>

          </div>

          {/* ===================================================
              CONTENU
          ==================================================== */}

          <div className="space-y-6 p-6 sm:p-10">

            {/* MESSAGE D'AVERTISSEMENT */}

            <div className="rounded-2xl border border-warning/20 bg-warning/10 p-5">

              <div className="flex items-start gap-4">

                <div className="mt-0.5 shrink-0 text-warning">
                  <AlertTriangle size={24} />
                </div>

                <div>

                  <h2 className="font-bold text-base-content">
                    Autorisation insuffisante
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-base-content/60">
                    Votre compte est correctement authentifié,
                    mais votre rôle ou vos permissions ne permettent
                    pas d&apos;accéder à cette ressource.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                INFORMATIONS
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2">

              {/* ZONE PROTÉGÉE */}

              <div className="rounded-2xl border border-base-200 bg-base-200/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-error/10 p-3 text-error">
                    <LockKeyhole size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Accès sécurisé
                    </p>

                    <p className="text-xs text-base-content/50">
                      Zone protégée
                    </p>
                  </div>

                </div>

              </div>

              {/* PERMISSION */}

              <div className="rounded-2xl border border-base-200 bg-base-200/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <ShieldX size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Permission requise
                    </p>

                    <p className="text-xs text-base-content/50">
                      Contactez un administrateur
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">

              {/* RETOUR */}

              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn btn-outline gap-2"
              >
                <ArrowLeft size={18} />
                Retour
              </button>

              {/* TABLEAU DE BORD */}

              <Link
                href="/"
                className="btn btn-primary gap-2"
              >
                <Home size={18} />
                Tableau de bord
              </Link>

            </div>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <p className="mt-6 text-center text-xs text-base-content/40">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,
          veuillez contacter l&apos;administrateur du système.
        </p>

      </div>
    </main>
  );
}
