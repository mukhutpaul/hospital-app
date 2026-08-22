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

export default function UtilisateurTable({
  data,
}: Props) {
  const router = useRouter();

  /* =======================================================
     ÉTATS
  ======================================================= */

  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [loadingId, setLoadingId] =
    useState<number | null>(null);

  /* =======================================================
     VOIR LE PROFIL
  ======================================================= */

  function handleVoir(
    utilisateur: Utilisateur
  ) {
    router.push(
      `/utilisateurs/${utilisateur.id}`
    );
  }

  /* =======================================================
     MODIFIER
  ======================================================= */

  function handleModifier(
    utilisateur: Utilisateur
  ) {
    router.push(
      `/utilisateurs/${utilisateur.id}/modifier`
    );
  }

  /* =======================================================
     ACTIVER / DÉSACTIVER
  ======================================================= */

  async function handleToggle(
    utilisateur: Utilisateur
  ) {
    if (loadingId !== null) {
      return;
    }

    const action = utilisateur.actif
      ? "désactiver"
      : "activer";

    const result = await Swal.fire({
      title: utilisateur.actif
        ? "Désactiver l'utilisateur ?"
        : "Activer l'utilisateur ?",

      text: `Voulez-vous vraiment ${action} "${utilisateur.name ?? "cet utilisateur"}" ?`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: utilisateur.actif
        ? "Oui, désactiver"
        : "Oui, activer",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: utilisateur.actif
        ? "#f59e0b"
        : "#22c55e",

      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      const response = await toggleUtilisateur(
        utilisateur.id
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
            : "Impossible de modifier le statut."
        );

        return;
      }

      toast.success(
        utilisateur.actif
          ? "Utilisateur désactivé avec succès."
          : "Utilisateur activé avec succès."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur activation/désactivation :",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut de l'utilisateur."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     RÉINITIALISER LE MOT DE PASSE
  ======================================================= */

  async function handleResetPassword(
    utilisateur: Utilisateur
  ) {
    if (loadingId !== null) {
      return;
    }

    const result = await Swal.fire({
      title: "Réinitialiser le mot de passe ?",

      text: `Le mot de passe de "${utilisateur.name ?? "cet utilisateur"}" sera réinitialisé.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Oui, réinitialiser",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: "#f59e0b",

      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      /*
       * IMPORTANT :
       * resetUtilisateurPassword attend maintenant
       * 2 arguments :
       *
       * resetUtilisateurPassword(id, newPassword)
       *
       * Ici on génère un nouveau mot de passe temporaire.
       */

      const newPassword =
        generateTemporaryPassword();

      const response =
        await resetUtilisateurPassword(
          utilisateur.id,
          newPassword
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
            : "Impossible de réinitialiser le mot de passe."
        );

        return;
      }

      /*
       * On affiche le nouveau mot de passe
       * dans une boîte SweetAlert.
       */

      await Swal.fire({
        title: "Mot de passe réinitialisé",

        html: `
          <div style="text-align:left">
            <p style="margin-bottom:10px">
              Le nouveau mot de passe temporaire est :
            </p>

            <div
              style="
                padding:12px;
                border-radius:8px;
                background:#f3f4f6;
                font-size:18px;
                font-weight:bold;
                text-align:center;
                letter-spacing:1px;
              "
            >
              ${escapeHtml(newPassword)}
            </div>

            <p style="margin-top:12px;font-size:13px;color:#6b7280">
              Communiquez ce mot de passe à l'utilisateur
              de manière sécurisée.
            </p>
          </div>
        `,

        icon: "success",

        confirmButtonText: "Fermer",
      });

      toast.success(
        "Mot de passe réinitialisé avec succès."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur réinitialisation mot de passe :",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de réinitialiser le mot de passe."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  async function handleDelete(
    utilisateur: Utilisateur
  ) {
    if (loadingId !== null) {
      return;
    }

    const result = await Swal.fire({
      title: "Supprimer l'utilisateur ?",

      html: `
        <p>
          Voulez-vous vraiment supprimer
          <strong>
            ${escapeHtml(
              utilisateur.name ??
                "cet utilisateur"
            )}
          </strong>
          ?
        </p>

        <p style="margin-top:10px;color:#dc2626;font-size:14px">
          Cette opération peut être irréversible.
        </p>
      `,

      icon: "error",

      showCancelButton: true,

      confirmButtonText:
        "Oui, supprimer",

      cancelButtonText: "Annuler",

      reverseButtons: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoadingId(utilisateur.id);

      const response =
        await deleteUtilisateur(
          utilisateur.id
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
            : "Impossible de supprimer l'utilisateur."
        );

        return;
      }

      toast.success(
        "Utilisateur supprimé avec succès."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erreur suppression utilisateur :",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur."
      );
    } finally {
      setLoadingId(null);
    }
  }

  /* =======================================================
     COLONNES
  ======================================================= */

  const columns =
    useMemo<ColumnDef<Utilisateur>[]>(
      () => [
        /* ===================================================
           UTILISATEUR
        =================================================== */

        {
          id: "utilisateur",

          accessorFn: (row) =>
            row.name ?? "",

          header: "Utilisateur",

          cell: ({ row }) => {
            const utilisateur =
              row.original;

            const initial =
              utilisateur.name
                ?.trim()
                .charAt(0)
                .toUpperCase() || "U";

            return (
              <div className="flex items-center gap-3">

                {/* AVATAR */}

                <div className="avatar placeholder shrink-0">
                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-primary
                      text-primary-content
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span className="font-bold">
                      {initial}
                    </span>
                  </div>
                </div>

                {/* INFORMATIONS */}

                <div className="min-w-0">
                  <p className="font-semibold truncate max-w-48">
                    {utilisateur.name ||
                      "Sans nom"}
                  </p>

                  {utilisateur.employe && (
                    <p className="text-xs text-base-content/50">
                      {
                        utilisateur
                          .employe
                          .matricule
                      }
                    </p>
                  )}
                </div>
              </div>
            );
          },
        },

        /* ===================================================
           EMAIL
        =================================================== */

        {
          accessorKey: "email",

          header: "Email",

          cell: ({ row }) => (
            <span className="text-sm">
              {row.original.email || "-"}
            </span>
          ),
        },

        /* ===================================================
           TELEPHONE
        =================================================== */

        {
          accessorKey: "telephone",

          header: "Téléphone",

          cell: ({ row }) => (
            <span className="text-sm">
              {row.original.telephone ||
                "-"}
            </span>
          ),
        },

        /* ===================================================
           ROLE
        =================================================== */

        {
          id: "role",

          accessorFn: (row) =>
            row.role?.nom ?? "",

          header: "Rôle",

          cell: ({ row }) => {
            const role =
              row.original.role;

            if (!role) {
              return (
                <span className="badge badge-ghost">
                  Aucun rôle
                </span>
              );
            }

            return (
              <span className="badge badge-primary badge-outline">
                {role.nom}
              </span>
            );
          },
        },

        /* ===================================================
           STATUT
        =================================================== */

        {
          id: "statut",

          accessorFn: (row) =>
            row.actif
              ? "Actif"
              : "Inactif",

          header: "Statut",

          cell: ({ row }) => {
            const actif =
              row.original.actif;

            return actif ? (
              <span className="badge badge-success gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Actif
              </span>
            ) : (
              <span className="badge badge-error gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Inactif
              </span>
            );
          },
        },

        /* ===================================================
           DATE
        =================================================== */

        {
          accessorKey: "createdAt",

          header: "Créé le",

          cell: ({ row }) => {
            const date =
              new Date(
                row.original.createdAt
              );

            return (
              <span className="text-sm text-base-content/70">
                {date.toLocaleDateString(
                  "fr-FR"
                )}
              </span>
            );
          },
        },

        /* ===================================================
           ACTIONS
        =================================================== */

        {
          id: "actions",

          header: "Actions",

          enableSorting: false,

          enableGlobalFilter: false,

          cell: ({ row }) => {
            const utilisateur =
              row.original;

            const loading =
              loadingId ===
              utilisateur.id;

            return (
              <div className="dropdown dropdown-end">

                {/* BOUTON */}

                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={
                    loadingId !== null
                  }
                  title="Actions"
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <MoreHorizontal
                      size={18}
                    />
                  )}
                </button>

                {/* MENU */}

                {!loading && (
                  <ul
                    tabIndex={0}
                    className="
                      dropdown-content
                      menu
                      bg-base-100
                      rounded-box
                      shadow-xl
                      border
                      border-base-200
                      w-64
                      z-50
                      p-2
                    "
                  >

                    {/* VOIR */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          handleVoir(
                            utilisateur
                          )
                        }
                      >
                        <Eye size={17} />

                        Voir le profil
                      </button>
                    </li>

                    {/* MODIFIER */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          handleModifier(
                            utilisateur
                          )
                        }
                      >
                        <Pencil size={17} />

                        Modifier
                      </button>
                    </li>

                    {/* RESET PASSWORD */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          handleResetPassword(
                            utilisateur
                          )
                        }
                      >
                        <KeyRound
                          size={17}
                        />

                        Réinitialiser le mot de passe
                      </button>
                    </li>

                    <div className="divider my-1" />

                    {/* ACTIVER / DÉSACTIVER */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(
                            utilisateur
                          )
                        }
                        className={
                          utilisateur.actif
                            ? "text-warning"
                            : "text-success"
                        }
                      >
                        <Power size={17} />

                        {utilisateur.actif
                          ? "Désactiver"
                          : "Activer"}
                      </button>
                    </li>

                    {/* SUPPRIMER */}

                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            utilisateur
                          )
                        }
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

      [loadingId]
    );

  /* =======================================================
     TANSTACK TABLE
  ======================================================= */

  const table = useReactTable({
    data,

    columns,

    state: {
      sorting,
      globalFilter,
    },

    onSortingChange:
      setSorting,

    onGlobalFilterChange:
      setGlobalFilter,

    getCoreRowModel:
      getCoreRowModel(),

    getSortedRowModel:
      getSortedRowModel(),

    getFilteredRowModel:
      getFilteredRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),

    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4">

      {/* ===================================================
          RECHERCHE
      =================================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <label className="input input-bordered flex items-center gap-2 w-full lg:w-96">

          <Search
            size={18}
            className="text-base-content/50"
          />

          <input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="grow"
            value={globalFilter}
            onChange={(event) =>
              setGlobalFilter(
                event.target.value
              )
            }
          />

        </label>

        <div className="text-sm text-base-content/60">
          {
            table
              .getFilteredRowModel()
              .rows.length
          }{" "}
          utilisateur(s)
        </div>

      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-x-auto rounded-box border border-base-300">

        <table className="table table-zebra">

          {/* HEADER */}

          <thead>
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <tr
                  key={
                    headerGroup.id
                  }
                >

                  {headerGroup.headers.map(
                    (header) => {
                      const canSort =
                        header.column.getCanSort();

                      const sorted =
                        header.column.getIsSorted();

                      return (
                        <th
                          key={
                            header.id
                          }
                        >

                          {header.isPlaceholder
                            ? null
                            : (
                              <button
                                type="button"
                                className={`
                                  flex
                                  items-center
                                  gap-1
                                  text-left
                                  ${
                                    canSort
                                      ? "cursor-pointer select-none"
                                      : ""
                                  }
                                `}
                                onClick={
                                  canSort
                                    ? header.column.getToggleSortingHandler()
                                    : undefined
                                }
                              >

                                {flexRender(
                                  header
                                    .column
                                    .columnDef
                                    .header,
                                  header.getContext()
                                )}

                                {canSort && (
                                  <>
                                    {sorted ===
                                      "asc" && (
                                      <ChevronUp
                                        size={
                                          15
                                        }
                                      />
                                    )}

                                    {sorted ===
                                      "desc" && (
                                      <ChevronDown
                                        size={
                                          15
                                        }
                                      />
                                    )}

                                    {!sorted && (
                                      <ChevronsUpDown
                                        size={
                                          15
                                        }
                                        className="opacity-40"
                                      />
                                    )}
                                  </>
                                )}
                              </button>
                            )}

                        </th>
                      );
                    }
                  )}

                </tr>
              ))}
          </thead>

          {/* BODY */}

          <tbody>

            {table.getRowModel().rows
              .length === 0 ? (

              <tr>

                <td
                  colSpan={
                    columns.length
                  }
                  className="text-center py-12"
                >

                  <div className="flex flex-col items-center gap-2">

                    <div className="text-4xl opacity-30">
                      👤
                    </div>

                    <p className="font-semibold">
                      Aucun utilisateur trouvé
                    </p>

                    <p className="text-sm text-base-content/50">
                      Essayez de modifier votre recherche.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              table
                .getRowModel()
                .rows
                .map((row) => (

                  <tr
                    key={row.id}
                  >

                    {row
                      .getVisibleCells()
                      .map(
                        (cell) => (

                          <td
                            key={
                              cell.id
                            }
                          >
                            {flexRender(
                              cell
                                .column
                                .columnDef
                                .cell,
                              cell.getContext()
                            )}
                          </td>

                        )
                      )}

                  </tr>

                ))

            )}

          </tbody>

        </table>

      </div>

      {/* ===================================================
          PAGINATION
      =================================================== */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* INFORMATION */}

        <p className="text-sm text-base-content/60">

          Page{" "}

          <span className="font-semibold">
            {table.getState()
              .pagination
              .pageIndex + 1}
          </span>

          {" "}sur{" "}

          <span className="font-semibold">
            {Math.max(
              table.getPageCount(),
              1
            )}
          </span>

        </p>

        {/* BOUTONS */}

        <div className="join">

          <button
            type="button"
            className="join-item btn btn-sm"
            onClick={() =>
              table.previousPage()
            }
            disabled={
              !table.getCanPreviousPage()
            }
          >
            «
          </button>

          {Array.from(
            {
              length:
                table.getPageCount(),
            },
            (_, index) => (

              <button
                key={index}
                type="button"
                className={`
                  join-item
                  btn
                  btn-sm
                  ${
                    table.getState()
                      .pagination
                      .pageIndex ===
                    index
                      ? "btn-primary"
                      : ""
                  }
                `}
                onClick={() =>
                  table.setPageIndex(
                    index
                  )
                }
              >
                {index + 1}
              </button>

            )
          )}

          <button
            type="button"
            className="join-item btn btn-sm"
            onClick={() =>
              table.nextPage()
            }
            disabled={
              !table.getCanNextPage()
            }
          >
            »
          </button>

        </div>

        {/* NOMBRE PAR PAGE */}

        <select
          className="select select-bordered select-sm"
          value={
            table.getState()
              .pagination
              .pageSize
          }
          onChange={(event) =>
            table.setPageSize(
              Number(
                event.target.value
              )
            )
          }
        >

          <option value={10}>
            10 / page
          </option>

          <option value={20}>
            20 / page
          </option>

          <option value={50}>
            50 / page
          </option>

          <option value={100}>
            100 / page
          </option>

        </select>

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
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password +=
      chars.charAt(
        Math.floor(
          Math.random() *
            chars.length
        )
      );
  }

  return password;
}

/**
 * Protection minimale avant insertion
 * dans le HTML de SweetAlert.
 */
function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}