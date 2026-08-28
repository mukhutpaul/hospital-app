"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Database,
  FileClock,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getAuditLogFilters,
  getAuditLogs,
} from "@/app/actions/auditLog";
import AuditLogTable from "@/components/audit/AuditLogTable";
import AuditLogFilters from "@/components/audit/AuditLogFilters";



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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [modules, setModules] = useState<string[]>(
    []
  );

  const [actions, setActions] = useState<string[]>(
    []
  );

  const [users, setUsers] = useState<
    {
      id: number;
      name: string | null;
      email: string | null;
    }[]
  >([]);

  const [search, setSearch] = useState("");

  const [module, setModule] = useState("");

  const [action, setAction] = useState("");

  const [userId, setUserId] = useState("");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAuditLogs({
        search,
        module,
        action,
        userId: userId
          ? Number(userId)
          : undefined,
        page,
        limit: 20,
      });

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      if (!response.data) return;

      setLogs(response.data.logs);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les journaux."
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    module,
    action,
    userId,
    page,
  ]);

  const loadFilters = useCallback(async () => {
    const response =
      await getAuditLogFilters();

    if (!response.success || !response.data) {
      return;
    }

    setModules(response.data.modules);
    setActions(response.data.actions);
    setUsers(response.data.users);
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function handleReset() {
    setSearch("");
    setModule("");
    setAction("");
    setUserId("");
    setPage(1);
  }

  const activeFilters =
    Number(Boolean(search)) +
    Number(Boolean(module)) +
    Number(Boolean(action)) +
    Number(Boolean(userId));

  return (
    <div className="min-h-screen bg-base-200/40 p-4 md:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20">
            <ShieldCheck size={27} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Journaux d'audit
              </h1>

              <span className="badge badge-primary">
                {total}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-base-content/60">
              Consultez et surveillez les actions effectuées
              dans le système hospitalier.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="btn btn-outline gap-2"
          onClick={loadLogs}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Actualiser
        </button>

      </div>

      {/* STATISTIQUES */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body flex-row items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileClock size={21} />
            </div>

            <div>
              <p className="text-xs font-medium text-base-content/50">
                Total événements
              </p>

              <p className="text-2xl font-bold">
                {total}
              </p>
            </div>

          </div>
        </div>

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body flex-row items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
              <Activity size={21} />
            </div>

            <div>
              <p className="text-xs font-medium text-base-content/50">
                Modules
              </p>

              <p className="text-2xl font-bold">
                {modules.length}
              </p>
            </div>

          </div>
        </div>

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body flex-row items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Database size={21} />
            </div>

            <div>
              <p className="text-xs font-medium text-base-content/50">
                Actions
              </p>

              <p className="text-2xl font-bold">
                {actions.length}
              </p>
            </div>

          </div>
        </div>

        <div className="card border border-base-200 bg-base-100 shadow-sm">
          <div className="card-body flex-row items-center gap-4 p-5">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <Users size={21} />
            </div>

            <div>
              <p className="text-xs font-medium text-base-content/50">
                Utilisateurs
              </p>

              <p className="text-2xl font-bold">
                {users.length}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* FILTRES */}

      <AuditLogFilters
        search={search}
        module={module}
        action={action}
        userId={userId}
        modules={modules}
        actions={actions}
        users={users}
        activeFilters={activeFilters}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onModule={(value) => {
          setModule(value);
          setPage(1);
        }}
        onAction={(value) => {
          setAction(value);
          setPage(1);
        }}
        onUser={(value) => {
          setUserId(value);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* TABLE */}

      <AuditLogTable
        logs={logs}
        loading={loading}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onDeleted={loadLogs}
      />

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">

          <p className="text-sm text-base-content/60">
            Page{" "}
            <strong>
              {page}
            </strong>{" "}
            sur{" "}
            <strong>
              {totalPages}
            </strong>
          </p>

          <div className="join">

            <button
              className="btn join-item"
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
            >
              Précédent
            </button>

            <button
              className="btn join-item"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) => p + 1)
              }
            >
              Suivant
            </button>

          </div>

        </div>
      )}

    </div>
  );
}