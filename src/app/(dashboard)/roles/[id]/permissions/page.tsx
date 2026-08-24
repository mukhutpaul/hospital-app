import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { getPermissions, getRoleById, getRolePermissions } from "@/app/actions/role";
import RolePermissions from "@/components/roles/RolePermissions";



type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RolePermissionsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const roleId = Number(id);

  if (!Number.isInteger(roleId) || roleId <= 0) {
    notFound();
  }

  const [roleResult, permissionsResult, rolePermissionsResult] =
    await Promise.all([
      getRoleById(roleId),
      getPermissions(),
      getRolePermissions(roleId),
    ]);

  if (!roleResult.success || !roleResult.data) {
    notFound();
  }

  if (
    !permissionsResult.success ||
    !permissionsResult.data
  ) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>
            Impossible de récupérer les permissions.
          </span>
        </div>
      </div>
    );
  }

  if (
    !rolePermissionsResult.success ||
    !rolePermissionsResult.data
  ) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>
            Impossible de récupérer les permissions du rôle.
          </span>
        </div>
      </div>
    );
  }

  const permissionsAttribuees =
    rolePermissionsResult.data.map(
      (item) => item.permissionId
    );

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

            <Link
              href={`/roles/${roleId}`}
              className="hover:text-primary transition-colors"
            >
              {roleResult.data.nom}
            </Link>

            <span>/</span>

            <span>Permissions</span>

          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            Permissions du rôle
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Configurez les permissions accordées à ce rôle.
          </p>
        </div>

        <Link
          href={`/roles/${roleId}`}
          className="btn btn-outline"
        >
          <ArrowLeft size={18} />
          Retour au rôle
        </Link>

      </div>

      {/* =====================================================
          RÔLE
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
              <ShieldCheck size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {roleResult.data.nom}
              </h2>

              <p className="text-sm text-base-content/60">
                {roleResult.data.description ||
                  "Aucune description"}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          GESTION DES PERMISSIONS
      ===================================================== */}

      <RolePermissions
        roleId={roleId}
        roleNom={roleResult.data.nom}
        permissions={permissionsResult.data}
        permissionsAttribuees={permissionsAttribuees}
      />

    </div>
  );
}