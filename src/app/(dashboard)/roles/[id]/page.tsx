import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  ShieldCheck,
  Users,
  KeyRound,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Hash,
  Settings2,
} from "lucide-react";
import { getRoleById } from "@/app/actions/role";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RolePage({
  params,
}: PageProps) {
  const { id } = await params;

  const roleId = Number(id);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    notFound();
  }

  const result = await getRoleById(roleId);

  if (!result.success || !result.data) {
    notFound();
  }

  const role = result.data;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-2 text-sm text-base-content/50 mb-2">

            <Link
              href="/roles"
              className="hover:text-primary transition-colors"
            >
              Rôles
            </Link>

            <span>/</span>

            <span>{role.nom}</span>

          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            {role.nom}
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Consultez les informations et les permissions de ce rôle.
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <Link
            href="/roles"
            className="btn btn-outline"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <Link
            href={`/roles/${role.id}/modifier`}
            className="btn btn-primary"
          >
            <Edit size={18} />
            Modifier
          </Link>

          <Link
            href={`/roles/${role.id}/permissions`}
            className="btn btn-secondary"
          >
            <Settings2 size={18} />
            Permissions
          </Link>

        </div>

      </div>

      {/* =====================================================
          CARTE PRINCIPALE
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================================================
            IDENTITÉ DU RÔLE
        =================================================== */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body items-center text-center">

            <div className="w-24 h-24 rounded-full bg-primary text-primary-content flex items-center justify-center">

              <ShieldCheck size={46} />

            </div>

            <h2 className="text-2xl font-bold mt-3">
              {role.nom}
            </h2>

            <p className="text-sm text-base-content/60 max-w-sm">
              {role.description ||
                "Aucune description pour ce rôle."}
            </p>

            <div className="mt-4">

              {role.actif ? (

                <span className="badge badge-success gap-1 px-3 py-3">

                  <CheckCircle2 size={15} />

                  Rôle actif

                </span>

              ) : (

                <span className="badge badge-error gap-1 px-3 py-3">

                  <XCircle size={15} />

                  Rôle inactif

                </span>

              )}

            </div>

          </div>

        </div>

        {/* ===================================================
            INFORMATIONS
        =================================================== */}

        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">

          <div className="card-body">

            <h2 className="card-title mb-5">
              <ShieldCheck size={21} />
              Informations du rôle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InfoItem
                icon={<Hash size={18} />}
                label="Identifiant"
                value={String(role.id)}
              />

              <InfoItem
                icon={<ShieldCheck size={18} />}
                label="Nom du rôle"
                value={role.nom}
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Utilisateurs"
                value={String(role._count.users)}
              />

              <InfoItem
                icon={<KeyRound size={18} />}
                label="Permissions"
                value={String(role.permissions.length)}
              />

              <InfoItem
                icon={
                  role.actif ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )
                }
                label="Statut"
                value={
                  role.actif
                    ? "Actif"
                    : "Inactif"
                }
              />

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Créé le"
                value={new Date(
                  role.createdAt
                ).toLocaleDateString("fr-FR")}
              />

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PERMISSIONS
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <h2 className="card-title">

                <KeyRound size={21} />

                Permissions du rôle

              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Permissions actuellement accordées à ce rôle.
              </p>

            </div>

            <Link
              href={`/roles/${role.id}/permissions`}
              className="btn btn-outline btn-sm"
            >
              <Settings2 size={16} />
              Gérer les permissions
            </Link>

          </div>

          {role.permissions.length === 0 ? (

            <div className="py-10 text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-base-200 flex items-center justify-center">

                <KeyRound
                  size={25}
                  className="text-base-content/40"
                />

              </div>

              <h3 className="font-semibold mt-4">
                Aucune permission
              </h3>

              <p className="text-sm text-base-content/60 mt-1">
                Ce rôle ne possède actuellement aucune permission.
              </p>

              <Link
                href={`/roles/${role.id}/permissions`}
                className="btn btn-primary btn-sm mt-4"
              >
                Configurer les permissions
              </Link>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              {role.permissions.map(
                (rolePermission) => (

                  <div
                    key={rolePermission.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-base-200"
                  >

                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">

                      <CheckCircle2 size={17} />

                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold break-words">
                        {rolePermission.permission.code}
                      </p>

                      <p className="text-xs text-base-content/60 mt-1">
                        {rolePermission.permission.description ||
                          "Aucune description"}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          UTILISATEURS
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="card-title">

                <Users size={21} />

                Utilisateurs

              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Nombre d'utilisateurs possédant ce rôle.
              </p>

            </div>

            <span className="badge badge-primary badge-lg">
              {role._count.users}
            </span>

          </div>

          <div className="alert">

            <Users size={20} />

            <span>
              Ce rôle est actuellement attribué à{" "}
              <strong>
                {role._count.users}
              </strong>{" "}
              utilisateur
              {role._count.users > 1
                ? "s"
                : ""}
              .
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          INFORMATIONS SYSTÈME
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <h2 className="card-title mb-4">
            Informations système
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <InfoItem
              icon={<Hash size={18} />}
              label="ID"
              value={String(role.id)}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Créé le"
              value={new Date(
                role.createdAt
              ).toLocaleString("fr-FR")}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Dernière modification"
              value={new Date(
                role.updatedAt
              ).toLocaleString("fr-FR")}
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
    <div className="flex items-start gap-3 p-4 rounded-xl bg-base-200">

      <div className="text-primary mt-0.5">
        {icon}
      </div>

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