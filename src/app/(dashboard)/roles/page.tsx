import Link from "next/link";
import {
  Plus,
  ShieldCheck,
  Users,
  KeyRound,
  Eye,
  Edit,
  Settings2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getRoles } from "@/app/actions/role";



export default async function RolesPage() {
  const result = await getRoles();

  if (!result.success) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="alert alert-error">
          <span>
            {result.message ||
              "Impossible de récupérer les rôles."}
          </span>
        </div>
      </div>
    );
  }

  const roles = result.data ?? [];

  const totalRoles = roles.length;

  const rolesActifs = roles.filter(
    (role) => role.actif
  ).length;

  const rolesInactifs = roles.filter(
    (role) => !role.actif
  ).length;

  const totalUtilisateurs = roles.reduce(
    (total, role) => total + role._count.users,
    0
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Rôles
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Gérez les rôles et les permissions des utilisateurs.
          </p>
        </div>

        <Link
          href="/roles/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouveau rôle
        </Link>

      </div>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Total rôles
                </p>

                <p className="text-3xl font-bold mt-1">
                  {totalRoles}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

            </div>

          </div>
        </div>

        {/* ACTIFS */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Rôles actifs
                </p>

                <p className="text-3xl font-bold mt-1">
                  {rolesActifs}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>

            </div>

          </div>
        </div>

        {/* INACTIFS */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Rôles inactifs
                </p>

                <p className="text-3xl font-bold mt-1">
                  {rolesInactifs}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-error/10 text-error flex items-center justify-center">
                <XCircle size={22} />
              </div>

            </div>

          </div>
        </div>

        {/* UTILISATEURS */}

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Utilisateurs
                </p>

                <p className="text-3xl font-bold mt-1">
                  {totalUtilisateurs}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <Users size={22} />
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          TABLEAU
      ===================================================== */}

      <div className="card bg-base-100 border border-base-300 shadow-sm">

        <div className="card-body p-0">

          {/* HEADER TABLE */}

          <div className="p-5 border-b border-base-300">

            <div className="flex items-center gap-2">

              <ShieldCheck size={21} />

              <div>
                <h2 className="font-semibold text-lg">
                  Liste des rôles
                </h2>

                <p className="text-sm text-base-content/60">
                  {totalRoles} rôle
                  {totalRoles > 1 ? "s" : ""} enregistré
                  {totalRoles > 1 ? "s" : ""}
                </p>
              </div>

            </div>

          </div>

          {/* TABLE */}

          {roles.length === 0 ? (

            <div className="p-12 text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-base-200 flex items-center justify-center">
                <ShieldCheck
                  size={30}
                  className="text-base-content/40"
                />
              </div>

              <h3 className="font-semibold text-lg mt-4">
                Aucun rôle
              </h3>

              <p className="text-sm text-base-content/60 mt-1">
                Commencez par créer votre premier rôle.
              </p>

              <Link
                href="/roles/nouveau"
                className="btn btn-primary mt-5"
              >
                <Plus size={18} />
                Créer un rôle
              </Link>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="table">

                <thead>
                  <tr>
                    <th>Rôle</th>
                    <th>Description</th>
                    <th>Utilisateurs</th>
                    <th>Permissions</th>
                    <th>Statut</th>
                    <th className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {roles.map((role) => (

                    <tr key={role.id}>

                      {/* NOM */}

                      <td>

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck size={20} />
                          </div>

                          <div>
                            <p className="font-semibold">
                              {role.nom}
                            </p>

                            <p className="text-xs text-base-content/50">
                              ID : {role.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <span className="text-sm text-base-content/70">
                          {role.description ||
                            "Aucune description"}
                        </span>

                      </td>

                      {/* UTILISATEURS */}

                      <td>

                        <div className="flex items-center gap-2">

                          <Users
                            size={16}
                            className="text-base-content/50"
                          />

                          <span className="font-medium">
                            {role._count.users}
                          </span>

                        </div>

                      </td>

                      {/* PERMISSIONS */}

                      <td>

                        <div className="flex items-center gap-2">

                          <KeyRound
                            size={16}
                            className="text-base-content/50"
                          />

                          <span className="font-medium">
                            {role._count.permissions}
                          </span>

                        </div>

                      </td>

                      {/* STATUT */}

                      <td>

                        {role.actif ? (

                          <span className="badge badge-success gap-1">
                            <CheckCircle2 size={13} />
                            Actif
                          </span>

                        ) : (

                          <span className="badge badge-error gap-1">
                            <XCircle size={13} />
                            Inactif
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="flex justify-end gap-1">

                          {/* VOIR */}

                          <Link
                            href={`/roles/${role.id}`}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Voir le rôle"
                          >
                            <Eye size={17} />
                          </Link>

                          {/* MODIFIER */}

                          <Link
                            href={`/roles/${role.id}/modifier`}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Modifier le rôle"
                          >
                            <Edit size={17} />
                          </Link>

                          {/* PERMISSIONS */}

                          <Link
                            href={`/roles/${role.id}/permissions`}
                            className="btn btn-ghost btn-sm btn-square text-primary"
                            title="Gérer les permissions"
                          >
                            <Settings2 size={17} />
                          </Link>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}