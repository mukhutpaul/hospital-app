import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserRound,
  XCircle,
  BriefcaseBusiness,
  Hash,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UtilisateurProfilPage({
  params,
}: PageProps) {
  const { id } = await params;

  const utilisateurId = Number(id);

  /* =====================================================
     VALIDATION ID
  ===================================================== */

  if (
    !Number.isInteger(utilisateurId) ||
    utilisateurId <= 0
  ) {
    notFound();
  }

  /* =====================================================
     RÉCUPÉRER L'UTILISATEUR
  ===================================================== */

  const utilisateur = await prisma.user.findUnique({
    where: {
      id: utilisateurId,
    },
    include: {
      role: true,
      employe: true,
    },
  });

  /* =====================================================
     UTILISATEUR INTROUVABLE
  ===================================================== */

  if (!utilisateur) {
    notFound();
  }

  /* =====================================================
     INITIAL
  ===================================================== */

  const initial =
    utilisateur.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "U";

  /* =====================================================
     NOM COMPLET EMPLOYÉ
  ===================================================== */

  const nomCompletEmploye = utilisateur.employe
    ? [
        utilisateur.employe.nom,
        utilisateur.employe.postNom,
        utilisateur.employe.prenom,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          {/* BREADCRUMB */}

          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">

            <Link
              href="/utilisateurs"
              className="hover:text-primary transition-colors"
            >
              Utilisateurs
            </Link>

            <span>/</span>

            <span>Profil</span>

          </div>

          {/* TITRE */}

          <h1 className="text-2xl md:text-3xl font-bold">
            Profil utilisateur
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Consultez les informations détaillées de cet
            utilisateur.
          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          <Link
            href="/utilisateurs"
            className="btn btn-outline"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <Link
            href={`/utilisateurs/${utilisateur.id}/modifier`}
            className="btn btn-primary"
          >
            <Edit size={18} />
            Modifier
          </Link>

        </div>

      </div>

      {/* =====================================================
          PROFIL PRINCIPAL
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ===================================================
            CARTE IDENTITÉ
        =================================================== */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body items-center text-center">

            {/* AVATAR */}

            <div
              className="
                w-24
                h-24
                rounded-full
                bg-primary
                text-primary-content
                flex
                items-center
                justify-center
                mb-3
              "
            >
              <span className="text-3xl font-bold leading-none">
                {initial}
              </span>
            </div>

            {/* NOM */}

            <h2 className="text-xl font-bold">
              {utilisateur.name || "Sans nom"}
            </h2>

            {/* EMAIL */}

            <p className="text-sm text-base-content/60 break-all">
              {utilisateur.email || "Aucun email"}
            </p>

            {/* ROLE */}

            <div className="mt-2">

              {utilisateur.role ? (
                <span className="badge badge-primary badge-outline gap-1">
                  <ShieldCheck size={14} />
                  {utilisateur.role.nom}
                </span>
              ) : (
                <span className="badge badge-ghost">
                  Aucun rôle
                </span>
              )}

            </div>

            {/* STATUT */}

            <div className="mt-2">

              {utilisateur.actif ? (
                <span className="badge badge-success gap-1">
                  <CheckCircle2 size={14} />
                  Actif
                </span>
              ) : (
                <span className="badge badge-error gap-1">
                  <XCircle size={14} />
                  Inactif
                </span>
              )}

            </div>

          </div>

        </div>

        {/* ===================================================
            INFORMATIONS UTILISATEUR
        =================================================== */}

        <div className="xl:col-span-2 card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <h2 className="card-title mb-4">
              <UserRound size={21} />
              Informations de l'utilisateur
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NOM */}

              <InfoItem
                icon={<User size={18} />}
                label="Nom"
                value={utilisateur.name || "-"}
              />

              {/* EMAIL */}

              <InfoItem
                icon={<Mail size={18} />}
                label="Adresse email"
                value={utilisateur.email || "-"}
              />

              {/* TELEPHONE */}

              <InfoItem
                icon={<Phone size={18} />}
                label="Téléphone"
                value={utilisateur.telephone || "-"}
              />

              {/* ROLE */}

              <InfoItem
                icon={<ShieldCheck size={18} />}
                label="Rôle"
                value={
                  utilisateur.role?.nom ||
                  "Aucun rôle"
                }
              />

              {/* STATUT */}

              <InfoItem
                icon={
                  utilisateur.actif ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )
                }
                label="Statut"
                value={
                  utilisateur.actif
                    ? "Actif"
                    : "Inactif"
                }
              />

              {/* DATE CRÉATION */}

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Date de création"
                value={new Date(
                  utilisateur.createdAt
                ).toLocaleString("fr-FR")}
              />

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          EMPLOYÉ ASSOCIÉ
      ===================================================== */}

      {utilisateur.employe && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <h2 className="card-title mb-4">
              <BriefcaseBusiness size={21} />
              Employé associé
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* MATRICULE */}

              <InfoItem
                icon={<Hash size={18} />}
                label="Matricule"
                value={
                  utilisateur.employe.matricule ||
                  "-"
                }
              />

              {/* NOM */}

              <InfoItem
                icon={<User size={18} />}
                label="Nom"
                value={
                  utilisateur.employe.nom || "-"
                }
              />

              {/* POST-NOM */}

              <InfoItem
                icon={<User size={18} />}
                label="Post-nom"
                value={
                  utilisateur.employe.postNom || "-"
                }
              />

              {/* PRÉNOM */}

              <InfoItem
                icon={<User size={18} />}
                label="Prénom"
                value={
                  utilisateur.employe.prenom || "-"
                }
              />

            </div>

            {/* NOM COMPLET */}

            {nomCompletEmploye && (
              <div className="mt-4 p-4 rounded-box bg-base-200">

                <p className="text-xs text-base-content/50">
                  Nom complet de l'employé
                </p>

                <p className="font-semibold mt-1">
                  {nomCompletEmploye}
                </p>

              </div>
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          INFORMATIONS SYSTÈME
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <h2 className="card-title mb-4">
            Informations système
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ID */}

            <InfoItem
              icon={<Hash size={18} />}
              label="Identifiant"
              value={String(utilisateur.id)}
            />

            {/* DATE */}

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Créé le"
              value={new Date(
                utilisateur.createdAt
              ).toLocaleDateString("fr-FR")}
            />

            {/* ROLE ID */}

            <InfoItem
              icon={<ShieldCheck size={18} />}
              label="ID du rôle"
              value={
                utilisateur.roleId
                  ? String(utilisateur.roleId)
                  : "-"
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   COMPOSANT INFORMATION
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-box bg-base-200">

      {/* ICÔNE */}

      <div className="text-primary mt-0.5 shrink-0">
        {icon}
      </div>

      {/* CONTENU */}

      <div className="min-w-0">

        <p className="text-xs text-base-content/50">
          {label}
        </p>

        <p className="font-medium break-words mt-1">
          {value}
        </p>

      </div>

    </div>
  );
}