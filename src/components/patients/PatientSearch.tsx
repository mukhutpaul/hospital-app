"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export default function PatientSearch({
  value = "",
  onChange,
  placeholder = "Rechercher un patient...",
}: Props) {
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  function handleChange(value: string) {
    setSearch(value);
    onChange?.(value);
  }

  function clearSearch() {
    handleChange("");
  }

  return (
    <div className="w-full">
      <label className="input input-bordered flex items-center gap-2 w-full">
        <Search
          size={18}
          className="shrink-0 text-base-content/50"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            handleChange(event.target.value)
          }
          placeholder={placeholder}
          className="grow"
        />

        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Effacer la recherche"
            className="
              btn
              btn-ghost
              btn-xs
              btn-circle
              text-base-content/50
              hover:text-base-content
            "
          >
            <X size={16} />
          </button>
        )}
      </label>

      {search.trim() && (
        <p className="mt-1 px-1 text-xs text-base-content/50">
          Recherche :{" "}
          <span className="font-medium text-base-content/70">
            {search}
          </span>
        </p>
      )}
    </div>
  );
}