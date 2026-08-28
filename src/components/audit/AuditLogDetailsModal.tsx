"use client";

import {
  Activity,
  CalendarDays,
  Database,
  Globe,
  Monitor,
  UserRound,
  X,
} from "lucide-react";

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
  log: AuditLog;
  onClose: () => void;
};

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "full",
      timeStyle: "medium",
    }
  ).format(new Date(value));
}

function prettyValue(
  value: string | null
) {
  if (!value) return "Aucune donnée";

  try {
    return JSON.stringify(
      JSON.parse(value),
      null,
      2
    );
  } catch {
    return value;
  }
}

export default function AuditLogDetailsModal({
  log,
  onClose,
}: Props) {
  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
    >

      <div className="modal-box w-11/12 max-w-4xl overflow-hidden rounded-3xl p-0">

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-base-200 bg-base-200/40 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content">
              <Activity size={23} />
            </div>

            <div>
              <h3 className="text-lg font-bold">
                Détails du journal
              </h3>

              <p className="text-xs text-base-content/50">
                Événement #{log.id}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>

        {/* BODY */}

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">

          {/* INFOS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-base-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-base-content/50">
                <UserRound size={15} />
                Utilisateur
              </div>

              <p className="font-semibold">
                {log.user?.name ||
                  "Système"}
              </p>

              <p className="text-sm text-base-content/50">
                {log.user?.email ||
                  "Aucun compte utilisateur"}
              </p>
            </div>

            <div className="rounded-2xl border border-base-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-base-content/50">
                <CalendarDays size={15} />
                Date
              </div>

              <p className="text-sm font-semibold">
                {formatDate(
                  log.createdAt
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-base-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-base-content/50">
                <Database size={15} />
                Module
              </div>

              <p className="font-semibold">
                {log.module}
              </p>

              {log.tableName && (
                <p className="text-sm text-base-content/50">
                  Table : {log.tableName}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-base-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-base-content/50">
                <Globe size={15} />
                Adresse IP
              </div>

              <code className="text-sm">
                {log.ipAddress ||
                  "Non disponible"}
              </code>
            </div>

          </div>

          {/* ACTION */}

          <div>
            <p className="mb-2 text-sm font-semibold">
              Action
            </p>

            <span className="badge badge-primary badge-lg">
              {log.action}
            </span>
          </div>

          {/* RECORD */}

          {log.recordId && (
            <div className="rounded-2xl bg-base-200/50 p-4">
              <p className="text-xs text-base-content/50">
                Enregistrement concerné
              </p>

              <p className="mt-1 font-mono text-sm">
                {log.tableName
                  ? `${log.tableName} #${log.recordId}`
                  : `#${log.recordId}`}
              </p>
            </div>
          )}

          {/* AVANT / APRES */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            <div>
              <p className="mb-2 font-semibold">
                Ancienne valeur
              </p>

              <pre className="max-h-72 overflow-auto rounded-2xl border border-base-200 bg-base-200/50 p-4 text-xs leading-relaxed">
                {prettyValue(
                  log.ancienneValeur
                )}
              </pre>
            </div>

            <div>
              <p className="mb-2 font-semibold">
                Nouvelle valeur
              </p>

              <pre className="max-h-72 overflow-auto rounded-2xl border border-base-200 bg-base-200/50 p-4 text-xs leading-relaxed">
                {prettyValue(
                  log.nouvelleValeur
                )}
              </pre>
            </div>

          </div>

          {/* USER AGENT */}

          {log.userAgent && (
            <div className="rounded-2xl border border-base-200 p-4">

              <div className="mb-2 flex items-center gap-2 text-xs text-base-content/50">
                <Monitor size={15} />
                Navigateur / appareil
              </div>

              <p className="break-all text-xs leading-relaxed text-base-content/70">
                {log.userAgent}
              </p>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-base-200 px-6 py-4">

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Fermer
          </button>

        </div>

      </div>

      <form
        method="dialog"
        className="modal-backdrop"
      >
        <button
          type="button"
          onClick={onClose}
        >
          close
        </button>
      </form>

    </dialog>
  );
}