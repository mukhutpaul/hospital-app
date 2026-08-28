"use client";

import {
  useState,
} from "react";

import {
  Eye,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  deleteAuditLog,
  deleteAuditLogs,
} from "@/app/actions/auditLog";

import AuditLogDetailsModal from "./AuditLogDetailsModal";

type AuditLog = {
  id: number;

  userId: number | null;

  user: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;

  action: string;
  module: string;
  tableName: string | null;
  recordId: string | null;

  ancienneValeur: string | null;
  nouvelleValeur: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  createdAt: Date | string;
};

type Props = {
  logs: AuditLog[];
  loading: boolean;

  selectedIds: number[];
  setSelectedIds: (
    ids: number[]
  ) => void;

  onDeleted: () => void;
};

function actionBadge(action: string) {
  const value = action.toUpperCase();

  if (
    value.includes("CREATE") ||
    value.includes("CREATION") ||
    value.includes("AJOUT")
  ) {
    return "badge-success";
  }

  if (
    value.includes("UPDATE") ||
    value.includes("MODIFICATION") ||
    value.includes("MODIF")
  ) {
    return "badge-info";
  }

  if (
    value.includes("DELETE") ||
    value.includes("SUPPRESSION") ||
    value.includes("SUPPR")
  ) {
    return "badge-error";
  }

  if (
    value.includes("LOGIN") ||
    value.includes("CONNEXION")
  ) {
    return "badge-primary";
  }

  return "badge-ghost";
}

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "medium",
    }
  ).format(new Date(value));
}

export default function AuditLogTable({
  logs,
  loading,
  selectedIds,
  setSelectedIds,
  onDeleted,
}: Props) {
  const [
    selectedLog,
    setSelectedLog,
  ] = useState<AuditLog | null>(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(null);

  const allSelected =
    logs.length > 0 &&
    logs.every((log) =>
      selectedIds.includes(log.id)
    );

  function toggleAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      logs.map((log) => log.id)
    );
  }

  function toggleOne(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(
        selectedIds.filter(
          (item) => item !== id
        )
      );
    } else {
      setSelectedIds([
        ...selectedIds,
        id,
      ]);
    }
  }

  async function handleDelete(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Voulez-vous vraiment supprimer ce journal ?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response =
        await deleteAuditLog(id);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);

      onDeleted();
    } catch {
      toast.error(
        "Impossible de supprimer le journal."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteSelected() {
    if (!selectedIds.length) return;

    const confirmed =
      window.confirm(
        `Supprimer ${selectedIds.length} journal(s) ?`
      );

    if (!confirmed) return;

    const response =
      await deleteAuditLogs(
        selectedIds
      );

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);

    setSelectedIds([]);

    onDeleted();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">

      {/* TOOLBAR */}

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between border-b border-error/20 bg-error/5 px-4 py-3">

          <p className="text-sm font-medium">
            {selectedIds.length} sélectionné(s)
          </p>

          <button
            type="button"
            className="btn btn-error btn-sm gap-2"
            onClick={handleDeleteSelected}
          >
            <Trash2 size={15} />
            Supprimer
          </button>

        </div>
      )}

      <div className="overflow-x-auto">

        <table className="table">

          <thead>
            <tr>

              <th>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>

              <th>Date</th>

              <th>Utilisateur</th>

              <th>Action</th>

              <th>Module</th>

              <th>Enregistrement</th>

              <th>Adresse IP</th>

              <th className="text-right">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-48 text-center"
                >
                  <span className="inline-flex items-center gap-2 text-base-content/50">
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Chargement des journaux...
                  </span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-base-content/50">
                    <UserRound size={32} />
                    <p className="font-medium">
                      Aucun journal trouvé
                    </p>
                    <p className="text-xs">
                      Aucun événement ne correspond aux filtres.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-base-200/40"
                >

                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedIds.includes(
                        log.id
                      )}
                      onChange={() =>
                        toggleOne(log.id)
                      }
                    />
                  </td>

                  <td>
                    <div className="whitespace-nowrap">
                      <p className="text-sm font-medium">
                        {formatDate(
                          log.createdAt
                        )}
                      </p>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-3">

                      <div className="avatar placeholder">
                        <div className="w-9 rounded-xl bg-primary/10 text-primary">
                          <span className="text-xs font-bold">
                            {(
                              log.user?.name ||
                              "S"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {log.user?.name ||
                            "Système"}
                        </p>

                        {log.user?.email && (
                          <p className="text-xs text-base-content/50">
                            {log.user.email}
                          </p>
                        )}
                      </div>

                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${actionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td>
                    <span className="font-medium">
                      {log.module}
                    </span>
                  </td>

                  <td>
                    <div>
                      <p className="text-sm">
                        {log.tableName ||
                          "—"}
                      </p>

                      {log.recordId && (
                        <p className="text-xs text-base-content/50">
                          #{log.recordId}
                        </p>
                      )}
                    </div>
                  </td>

                  <td>
                    <code className="text-xs">
                      {log.ipAddress || "—"}
                    </code>
                  </td>

                  <td>
                    <div className="flex justify-end gap-1">

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        title="Voir les détails"
                        onClick={() =>
                          setSelectedLog(log)
                        }
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square text-error"
                        title="Supprimer"
                        disabled={
                          deletingId ===
                          log.id
                        }
                        onClick={() =>
                          handleDelete(
                            log.id
                          )
                        }
                      >
                        {deletingId ===
                        log.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={17}
                          />
                        )}
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {selectedLog && (
        <AuditLogDetailsModal
          log={selectedLog}
          onClose={() =>
            setSelectedLog(null)
          }
        />
      )}

    </div>
  );
}