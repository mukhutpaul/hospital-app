"use client";

import {
  Search,
  X,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function RendezVousSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative w-full md:max-w-md">

      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
      />

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder="Rechercher un rendez-vous..."
        className="input input-bordered w-full pl-10 pr-10"
      />

      {value && (
        <button
          type="button"
          onClick={() =>
            onChange("")
          }
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-ghost"
        >
          <X size={15} />
        </button>
      )}

    </div>
  );
}