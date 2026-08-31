"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  deleteUtilisateur,
  resetUtilisateurPassword,
  toggleUtilisateur,
} from "@/app/actions/utilisateurs";

/* =========================================================
   TYPES
========================================================= */

type Role = {
  id: number;
  nom: string;
};

type Employe = {
  id: number;
  matricule: string;
  nom: string;
  postNom: string | null;
  prenom: string | null;
};

export type Utilisateur = {
  id: number;

  name: string | null;

  email: string | null;

  telephone: string | null;

  actif: boolean;

  createdAt: Date | string;

  role: Role | null;

  employe: Employe | null;
};

type Props = {
  data: Utilisateur[];
};

/* =========================================================
   COMPOSANT
========================================================= */

export default function UtilisateurTable({ data }: Props) {
  const router = useRouter();

  /* =======================================================
     ÉTATS
  ======================================================= */

  const [sorting, setSorting] = useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] = useState("");

  const [loadingId, setLoadingId] = useState<number | null>(null);

  /* =======================================================
     VOIR LE PROFIL
  ======================================================= */

  function handleVoir(utilisateur: Utilisateur) {
    if (loadingId !== null) return;

    router.push(`/utilisateurs/${utilisateur.id}`);
  }

  /* =======================================================
     MODIFIER
  ======================================================= */

  function handleModifier(utilisateur: Utilisateur) {
    if (loadingId !== null) return;

    router.push(`/utilisateurs/${utilisateur.id}/modifier`);
  }

  /* =======================================================
     RÉINITIALISER LE MOT DE PASSE
  ======================================================= */

  async function handleResetPassword(utilisateur: Utilisateur) {
    if (loadingId !== null) {
      return;
    }

    const nomUtilisateur =
      utilisateur.name?.trim() || utilisateur.email || "cet utilisateur";

    const result = await Swal.fire({
      title: "Réinitialiser le mot de passe ?",

      html: `
        <div style="text-align:left">
          <p>
            Le mot de passe de
            <strong>${escapeHtml(nomUtilisateur)}</strong>
            sera remplacé par un nouveau mot de passe temporaire.
          </p>

          <p style="
            margin-top:12px;
            color:#6b7280;
            font-size:13px;
          ">
            Assurez-vous de communiquer le nouveau mot de passe
            à l'utilisateur de manière sécurisée.
          </p>
        </div>
      `,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Oui, réinitialiser",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: "#f59e0b",

      cancelButtonColor: "#6b7280",

      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      const newPassword = generateTemporaryPassword();

      const response = await resetUtilisateurPassword(
        utilisateur.id,
        newPassword,
      );

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        toast.error(
          "message" in response
            ? String(response.message)
            : "Impossible de réinitialiser le mot de passe.",
        );

        return;
      }

      await Swal.fire({
        title: "Mot de passe réinitialisé",

        html: `
          <div style="text-align:left">

            <p style="
              margin-bottom:14px;
              font-size:14px;
            ">
              Le nouveau mot de passe temporaire de
              <strong>
                ${escapeHtml(nomUtilisateur)}
              </strong>
              est :
            </p>

            <div style="
              padding:16px;
              border-radius:12px;
              background:#f3f4f6;
              border:1px solid #e5e7eb;
              font-size:20px;
              font-weight:bold;
              text-align:center;
              letter-spacing:2px;
              user-select:text;
            ">
              ${escapeHtml(newPassword)}
            </div>

            <p style="
              margin-top:14px;
              font-size:13px;
              color:#6b7280;
            ">
              Communiquez ce mot de passe à l'utilisateur
              de manière sécurisée.
            </p>

          </div>
        `,

        icon: "success",

        confirmButtonText: "Fermer",

        confirmButtonColor: "#22c55e",

        allowOutsideClick: false,
      });

      toast.success("Mot de passe réinitialisé avec succès.");

      router.refresh();
    } catch (error) {
      console.error("Erreur réinitialisation mot de passe :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de réinitialiser le mot de passe.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     ACTIVER / DÉSACTIVER
  ======================================================= */

  async function handleToggle(utilisateur: Utilisateur) {
    if (loadingId !== null) {
      return;
    }

    const action = utilisateur.actif ? "désactiver" : "activer";

    const nomUtilisateur =
      utilisateur.name?.trim() || utilisateur.email || "cet utilisateur";

    const result = await Swal.fire({
      title: utilisateur.actif
        ? "Désactiver l'utilisateur ?"
        : "Activer l'utilisateur ?",

      text: `Voulez-vous vraiment ${action} "${nomUtilisateur}" ?`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: utilisateur.actif ? "Oui, désactiver" : "Oui, activer",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: utilisateur.actif ? "#f59e0b" : "#22c55e",

      cancelButtonColor: "#6b7280",

      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      const response = await toggleUtilisateur(utilisateur.id);

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        toast.error(
          "message" in response
            ? String(response.message)
            : "Impossible de modifier le statut.",
        );

        return;
      }

      toast.success(
        utilisateur.actif
          ? "Utilisateur désactivé avec succès."
          : "Utilisateur activé avec succès.",
      );

      router.refresh();
    } catch (error) {
      console.error("Erreur activation/désactivation :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut de l'utilisateur.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  async function handleDelete(utilisateur: Utilisateur) {
    if (loadingId !== null) {
      return;
    }

    const nomUtilisateur =
      utilisateur.name?.trim() || utilisateur.email || "cet utilisateur";

    const result = await Swal.fire({
      title: "Supprimer l'utilisateur ?",

      html: `
        <p>
          Voulez-vous vraiment supprimer
          <strong>
            ${escapeHtml(nomUtilisateur)}
          </strong>
          ?
        </p>

        <p style="
          margin-top:10px;
          color:#dc2626;
          font-size:14px;
        ">
          Cette opération peut être irréversible.
        </p>
      `,

      icon: "error",

      showCancelButton: true,

      confirmButtonText: "Oui, supprimer",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#6b7280",

      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      const response = await deleteUtilisateur(utilisateur.id);

      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success === false
      ) {
        toast.error(
          "message" in response
            ? String(response.message)
            : "Impossible de supprimer l'utilisateur.",
        );

        return;
      }

      toast.success("Utilisateur supprimé avec succès.");

      router.refresh();
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     COLONNES
  ======================================================= */

  const columns = useMemo<ColumnDef<Utilisateur>[]>(
    () => [
      /* ===============================================
           UTILISATEUR
        =============================================== */

      {
        id: "utilisateur",

        accessorFn: (row) => row.name ?? "",

        header: "Utilisateur",

        cell: ({ row }) => {
          const utilisateur = row.original;

          const initial =
            utilisateur.name?.trim().charAt(0).toUpperCase() || "U";

          return (
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <div className="avatar placeholder shrink-0">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-content shadow-md ring-1 ring-base-300">
                  <span className="text-base font-bold uppercase">
                    {initial}
                  </span>
                </div>
              </div>

              {/* INFORMATIONS */}
              <div className="min-w-0">
                <p className="max-w-[220px] truncate font-semibold text-base-content">
                  {utilisateur.name || "Sans nom"}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />

                  <p className="truncate text-xs text-base-content/50">
                    {utilisateur.employe
                      ? utilisateur.employe.matricule
                      : "Aucun employé associé"}
                  </p>
                </div>
              </div>
            </div>
          );
        },
      },

      /* ===============================================
           EMAIL
        =============================================== */

      {
        accessorKey: "email",

        header: "Email",

        cell: ({ row }) => (
          <span className="max-w-60 truncate text-sm text-base-content/80">
            {row.original.email || "Non renseigné"}
          </span>
        ),
      },

      /* ===============================================
           TÉLÉPHONE
        =============================================== */

      {
        accessorKey: "telephone",

        header: "Téléphone",

        cell: ({ row }) => (
          <span className="text-sm text-base-content/80">
            {row.original.telephone || "Non renseigné"}
          </span>
        ),
      },

      /* ===============================================
           RÔLE
        =============================================== */

      {
        id: "role",

        accessorFn: (row) => row.role?.nom ?? "",

        header: "Rôle",

        cell: ({ row }) => {
          const role = row.original.role;

          if (!role) {
            return (
              <span className="badge badge-ghost badge-sm">Aucun rôle</span>
            );
          }

          return (
            <span className="badge badge-primary badge-outline">
              {role.nom}
            </span>
          );
        },
      },

      /* ===============================================
           STATUT
        =============================================== */

      {
        id: "statut",

        accessorFn: (row) => (row.actif ? "Actif" : "Inactif"),

        header: "Statut",

        cell: ({ row }) => {
          const actif = row.original.actif;

          return actif ? (
            <span className="badge badge-success gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Actif
            </span>
          ) : (
            <span className="badge badge-error gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Inactif
            </span>
          );
        },
      },

      /* ===============================================
           DATE
        =============================================== */

      {
        accessorKey: "createdAt",

        header: "Créé le",

        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);

          return (
            <span className="text-sm text-base-content/70">
              {Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
          );
        },
      },

      /* ===============================================
           ACTIONS
        =============================================== */

      {
        id: "actions",

        header: "Actions",

        enableSorting: false,

        enableGlobalFilter: false,

        cell: ({ row }) => {
          const utilisateur = row.original;

          const loading = loadingId === utilisateur.id;

          return (
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-square rounded-lg"
                disabled={loadingId !== null}
                title="Actions"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <MoreHorizontal size={19} />
                )}
              </button>

              {!loading && (
                <ul
                  tabIndex={0}
                  className="
                      dropdown-content
                      menu
                      z-50
                      mt-2
                      w-64
                      rounded-2xl
                      border
                      border-base-200
                      bg-base-100
                      p-2
                      shadow-xl
                    "
                >
                  <li>
                    <button
                      type="button"
                      onClick={() => handleVoir(utilisateur)}
                    >
                      <Eye size={17} />
                      Voir le profil
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => handleModifier(utilisateur)}
                    >
                      <Pencil size={17} />
                      Modifier
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(utilisateur)}
                    >
                      <KeyRound size={17} />
                      Réinitialiser le mot de passe
                    </button>
                  </li>

                  <div className="divider my-1" />

                  <li>
                    <button
                      type="button"
                      onClick={() => handleToggle(utilisateur)}
                      className={
                        utilisateur.actif ? "text-warning" : "text-success"
                      }
                    >
                      <Power size={17} />

                      {utilisateur.actif ? "Désactiver" : "Activer"}
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => handleDelete(utilisateur)}
                      className="text-error"
                    >
                      <Trash2 size={17} />
                      Supprimer
                    </button>
                  </li>
                </ul>
              )}
            </div>
          );
        },
      },
    ],

    [loadingId],
  );

  /* =======================================================
     TABLE
  ======================================================= */

  const table = useReactTable({
    data,

    columns,

    state: {
      sorting,
      globalFilter,
    },

    onSortingChange: setSorting,

    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  const pageCount = table.getPageCount();

  const currentPage = table.getState().pagination.pageIndex;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===============================================
         EN-TÊTE
      =============================================== */}

      <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold">Gestion des utilisateurs</h2>

              <p className="mt-1 text-sm text-base-content/60">
                Gérez les comptes, les rôles et les accès.
              </p>
            </div>
          </div>

          <div className="badge badge-primary badge-lg gap-2 px-4">
            <Users size={16} />
            {filteredCount}
            utilisateur
            {filteredCount > 1 ? "s" : ""}
          </div>
        </div>

        {/* =============================================
           RECHERCHE
        ============================================= */}

        <div className="border-t border-base-200 bg-base-200/30 p-5">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={19}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-base-content/40
              "
            />

            <input
              type="search"
              placeholder="Rechercher un utilisateur..."
              className="
                input
                input-bordered
                h-12
                w-full
                rounded-xl
                pl-11
                pr-11
                shadow-sm
              "
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />

            {globalFilter && (
              <button
                type="button"
                className="
                  btn
                  btn-ghost
                  btn-xs
                  btn-circle
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                "
                onClick={() => setGlobalFilter("")}
                title="Effacer la recherche"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===============================================
         TABLEAU
      =============================================== */}

      <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            {/* ===========================================
               HEADER
            =========================================== */}

            <thead className="bg-base-200/70">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();

                    const sorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className="
                                h-14
                                whitespace-nowrap
                                text-xs
                                font-bold
                                uppercase
                                tracking-wider
                                text-base-content/60
                              "
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={`
                                      flex
                                      items-center
                                      gap-2
                                      text-left
                                      transition-colors
                                      ${
                                        canSort
                                          ? "cursor-pointer hover:text-primary"
                                          : "cursor-default"
                                      }
                                    `}
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}

                            {canSort && (
                              <>
                                {sorted === "asc" && <ChevronUp size={15} />}

                                {sorted === "desc" && <ChevronDown size={15} />}

                                {!sorted && (
                                  <ChevronsUpDown
                                    size={15}
                                    className="opacity-30"
                                  />
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* ===========================================
               BODY
            =========================================== */}

            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/40">
                        <Users size={30} />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Aucun utilisateur trouvé
                        </p>

                        <p className="mt-1 text-sm text-base-content/50">
                          Essayez de modifier votre recherche.
                        </p>
                      </div>

                      {globalFilter && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setGlobalFilter("")}
                        >
                          Réinitialiser la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="
                          border-base-200
                          transition-colors
                          hover:bg-base-200/40
                        "
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===============================================
           PAGINATION
        =============================================== */}

        <div className="flex flex-col gap-4 border-t border-base-200 bg-base-200/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* INFORMATION */}

          <div className="text-sm text-base-content/60">
            Affichage de{" "}
            <span className="font-semibold text-base-content">
              {table.getRowModel().rows.length}
            </span>{" "}
            sur{" "}
            <span className="font-semibold text-base-content">
              {filteredCount}
            </span>{" "}
            utilisateur
            {filteredCount > 1 ? "s" : ""}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* NAVIGATION */}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Page précédente"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="min-w-28 text-center text-sm text-base-content/70">
                Page{" "}
                <span className="font-bold text-base-content">
                  {currentPage + 1}
                </span>{" "}
                sur{" "}
                <span className="font-bold text-base-content">
                  {Math.max(pageCount, 1)}
                </span>
              </span>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Page suivante"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            {/* NOMBRE PAR PAGE */}

            <select
              className="select select-bordered select-sm"
              value={table.getState().pagination.pageSize}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
            >
              <option value={10}>10 / page</option>

              <option value={20}>20 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FONCTIONS UTILITAIRES
========================================================= */

/**
 * Génère un mot de passe temporaire.
 */
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Protection minimale avant insertion
 * dans le HTML de SweetAlert.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
