"use client";

import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

type Props = {
  search: string;
  module: string;
  action: string;
  userId: string;

  modules: string[];
  actions: string[];

  users: {
    id: number;
    name: string | null;
    email: string | null;
  }[];

  activeFilters: number;

  onSearch: (value: string) => void;
  onModule: (value: string) => void;
  onAction: (value: string) => void;
  onUser: (value: string) => void;
  onReset: () => void;
};

export default function AuditLogFilters({
  search,
  module,
  action,
  userId,
  modules,
  actions,
  users,
  activeFilters,
  onSearch,
  onModule,
  onAction,
  onUser,
  onReset,
}: Props) {
  return (
    <div className="mb-5 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter size={17} />
          </div>

          <div>
            <p className="font-semibold">
              Filtrer les journaux
            </p>

            <p className="text-xs text-base-content/50">
              Recherchez un événement précis
            </p>
          </div>

        </div>

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-ghost btn-sm gap-2"
          >
            <RotateCcw size={15} />
            Réinitialiser
          </button>
        )}

      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

        {/* RECHERCHE */}

        <label className="input input-bordered flex items-center gap-2">
          <Search
            size={17}
            className="text-base-content/40"
          />

          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) =>
              onSearch(e.target.value)
            }
          />
        </label>

        {/* MODULE */}

        <select
          className="select select-bordered"
          value={module}
          onChange={(e) =>
            onModule(e.target.value)
          }
        >
          <option value="">
            Tous les modules
          </option>

          {modules.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {/* ACTION */}

        <select
          className="select select-bordered"
          value={action}
          onChange={(e) =>
            onAction(e.target.value)
          }
        >
          <option value="">
            Toutes les actions
          </option>

          {actions.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {/* UTILISATEUR */}

        <select
          className="select select-bordered"
          value={userId}
          onChange={(e) =>
            onUser(e.target.value)
          }
        >
          <option value="">
            Tous les utilisateurs
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name ||
                user.email ||
                `Utilisateur #${user.id}`}
            </option>
          ))}
        </select>

      </div>

    </div>
  );
}