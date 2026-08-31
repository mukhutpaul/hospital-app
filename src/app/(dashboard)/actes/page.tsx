
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Activity,
  ArrowRight,
  ClipboardList,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";

import { auth } from "@/lib/auth";

import {
  getActesMedicaux,
  getConsultationsAvecActes,
} from "@/app/actions/actes-medicaux";

import ActesMedicauxTable from "@/components/actes/ActesMedicauxTable";

/* =========================================================
   TYPES
========================================================= */

type Role =
  | "ADMIN"
  | "MEDECIN"
  | "INFIRMIER"
  | "RECEPTIONNISTE"
  | "CAISSIER"
  | "LABORANTIN"
  | "RADIOLOGUE";

/* =========================================================
   DROITS
========================================================= */

/**
 * IMPORTANT :
 *
 * Cette matrice sert à contrôler l'accès à cette PAGE.
 *
 * Les Server Actions doivent impérativement refaire
 * le contrôle côté serveur.
 */

const PAGE_PERMISSIONS: Record<
  Role,
  {
    consulterCatalogue: boolean;
    administrerCatalogue: boolean;
    consulterConsultations: boolean;
  }
> = {
  ADMIN: {
    consulterCatalogue: true,
    administrerCatalogue: true,
    consulterConsultations: true,
  },

  MEDECIN: {
    consulterCatalogue: true,
    administrerCatalogue: false,
    consulterConsultations: true,
  },

  INFIRMIER: {
    consulterCatalogue: false,
    administrerCatalogue: false,
    consulterConsultations: true,
  },

  RECEPTIONNISTE: {
    consulterCatalogue: false,
    administrerCatalogue: false,
    consulterConsultations: false,
  },

  CAISSIER: {
    consulterCatalogue: true,
    administrerCatalogue: false,
    consulterConsultations: false,
  },

  LABORANTIN: {
    consulterCatalogue: false,
    administrerCatalogue: false,
    consulterConsultations: false,
  },

  RADIOLOGUE: {
    consulterCatalogue: false,
    administrerCatalogue: false,
    consulterConsultations: false,
  },
};

/* =========================================================
   VALIDATION DU RÔLE
========================================================= */

function isValidRole(value: unknown): value is Role {
  return (
    value === "ADMIN" ||
    value === "MEDECIN" ||
    value === "INFIRMIER" ||
    value === "RECEPTIONNISTE" ||
    value === "CAISSIER" ||
    value === "LABORANTIN" ||
    value === "RADIOLOGUE"
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function ActesMedicauxPage() {
  /* =======================================================
     AUTHENTIFICATION SERVEUR
  ======================================================= */

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /* =======================================================
     VÉRIFICATION DU RÔLE
  ======================================================= */

  const rawRole = session.user.role;

  if (!isValidRole(rawRole)) {
    redirect("/acces-refuse");
  }

  const role = rawRole;
  const permissions = PAGE_PERMISSIONS[role];

  /* =======================================================
     AUTORISATION PAGE
  ======================================================= */

  if (!permissions.consulterCatalogue) {
    redirect("/acces-refuse");
  }

  /* =======================================================
     RÉCUPÉRATION DES DONNÉES
  ======================================================= */

  const [actesResult, consultationsResult] =
    await Promise.all([
      getActesMedicaux(),
      getConsultationsAvecActes(),
    ]);

  /* =======================================================
     DONNÉES SÉCURISÉES
  ======================================================= */

  const actes =
    actesResult.success && Array.isArray(actesResult.data)
      ? actesResult.data
      : [];

  const consultations =
    consultationsResult.success &&
    Array.isArray(consultationsResult.data)
      ? consultationsResult.data
      : [];

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const actesActifs = actes.filter(
    (acte: any) => acte.actif === true
  ).length;

  const actesInactifs =
    actes.length - actesActifs;

  const actesUtilises = actes.filter(
    (acte: any) =>
      Number(acte._count?.consultations ?? 0) > 0
  ).length;

  const totalUtilisations = actes.reduce(
    (total: number, acte: any) =>
      total +
      Number(acte._count?.consultations ?? 0),
    0
  );

  /* =======================================================
     ERREURS
  ======================================================= */

  const erreurActes = !actesResult.success
    ? actesResult.message
    : null;

  const erreurConsultations =
    !consultationsResult.success
      ? consultationsResult.message
      : null;

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =================================================
            EN-TÊTE
        ================================================= */}

        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity size={28} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Actes médicaux
                  </h1>

                  <span className="badge badge-primary badge-outline">
                    {actes.length} acte
                    {actes.length !== 1 ? "s" : ""}
                  </span>

                  <span className="badge badge-ghost">
                    {role}
                  </span>

                </div>

                <p className="mt-1 max-w-2xl text-sm text-base-content/60 sm:text-base">
                  Consultez le catalogue tarifaire et
                  suivez les actes médicaux utilisés
                  dans les consultations.
                </p>

              </div>

            </div>

            {/* =============================================
                BOUTON ADMINISTRATION
            ============================================== */}

            {permissions.administrerCatalogue && (
              <Link
                href="/actes/nouveau"
                className="btn btn-primary"
              >
                <PlusCircle size={18} />
                Nouvel acte médical
              </Link>
            )}

          </div>
        </section>

        {/* =================================================
            ERREUR ACTES
        ================================================= */}

        {erreurActes && (
          <div className="alert alert-error shadow-sm">
            <Activity size={20} />

            <span>
              Impossible de récupérer le catalogue
              des actes médicaux : {erreurActes}
            </span>
          </div>
        )}

        {/* =================================================
            ERREUR CONSULTATIONS
        ================================================= */}

        {erreurConsultations && (
          <div className="alert alert-warning shadow-sm">
            <ClipboardList size={20} />

            <span>
              Les statistiques d'utilisation des actes
              ne sont pas disponibles actuellement.
            </span>
          </div>
        )}

        {/* =================================================
            STATISTIQUES
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-base-content/60">
                  Total des actes
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {actes.length}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Actes enregistrés
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={21} />
              </div>

            </div>

          </div>

          {/* ACTIFS */}

          <div className="rounded-2xl border border-success/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-base-content/60">
                  Actes actifs
                </p>

                <p className="mt-2 text-3xl font-bold text-success">
                  {actesActifs}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Disponibles à l'utilisation
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                <span className="text-lg font-bold">
                  ✓
                </span>
              </div>

            </div>

          </div>

          {/* INACTIFS */}

          <div className="rounded-2xl border border-warning/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-base-content/60">
                  Actes inactifs
                </p>

                <p className="mt-2 text-3xl font-bold text-warning">
                  {actesInactifs}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  Non disponibles
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <span className="text-lg font-bold">
                  !
                </span>
              </div>

            </div>

          </div>

          {/* UTILISATIONS */}

          <div className="rounded-2xl border border-info/20 bg-base-100 p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-base-content/60">
                  Utilisations
                </p>

                <p className="mt-2 text-3xl font-bold text-info">
                  {totalUtilisations}
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  {actesUtilises} acte
                  {actesUtilises !== 1 ? "s" : ""}
                  {" "}utilisé
                  {actesUtilises !== 1 ? "s" : ""}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                <ClipboardList size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ACCÈS RAPIDES
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* CATALOGUE */}

          <Link
            href="/actes"
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity size={22} />
              </div>

              <ArrowRight
                size={18}
                className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-primary"
              />

            </div>

            <h2 className="mt-4 font-bold">
              Catalogue des actes
            </h2>

            <p className="mt-1 text-sm leading-6 text-base-content/60">
              Consultez les actes médicaux et leurs
              tarifs.
              {permissions.administrerCatalogue &&
                " Vous pouvez également les administrer."}
            </p>

          </Link>

          {/* CONSULTATIONS */}

          {permissions.consulterConsultations && (
            <Link
              href="/actes/consultations"
              className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-info/30 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
                  <ClipboardList size={22} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-info"
                />

              </div>

              <h2 className="mt-4 font-bold">
                Actes de consultation
              </h2>

              <p className="mt-1 text-sm leading-6 text-base-content/60">
                Consultez les actes associés aux
                consultations des patients.
              </p>

            </Link>
          )}

        </div>

        {/* =================================================
            TABLEAU
        ================================================= */}

        <ActesMedicauxTable
          actes={actes}
          canEdit={permissions.administrerCatalogue}
          canDelete={permissions.administrerCatalogue}
          canToggle={permissions.administrerCatalogue}
        />

        {/* =================================================
            INFORMATION DE SÉCURITÉ
        ================================================= */}

        {!permissions.administrerCatalogue && (
          <div className="alert alert-info shadow-sm">

            <ShieldAlert size={20} />

            <div>

              <h3 className="font-semibold">
                Accès en lecture seule
              </h3>

              <p className="text-sm">
                Votre rôle vous permet de consulter
                les actes médicaux, mais pas de créer,
                modifier, activer, désactiver ou
                supprimer le catalogue.
              </p>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
