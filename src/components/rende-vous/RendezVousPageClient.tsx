"use client";

import { useMemo, useState } from "react";

import RendezVousSearch from "./RendezVousSearch";
import RendezVousStats from "./RendezVousStats";
import RendezVousTable from "./RendezVousTable";

type RendezVous = {
  id: number;
  numero: string;

  patient: {
    id: number;
    numeroDossier: string;
    nom: string;
    postNom: string | null;
    prenom: string | null;
    telephone: string | null;
  };

  medecin: {
    id: number;
    matricule: string;
    nom: string;
    postNom: string | null;
    prenom: string;
  } | null;

  specialite: {
    id: number;
    code: string;
    nom: string;
  } | null;

  service: {
    id: number;
    code: string;
    nom: string;
  } | null;

  dateHeure: Date | string;

  motif: string | null;

  statut: string;

  observation: string | null;

  admission: {
    id: number;
    numero: string;
    statut: string;
  } | null;
};

type Props = {
  rendezVous: RendezVous[];
};

export default function RendezVousPageClient({
  rendezVous,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filtered =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return rendezVous;
      }

      return rendezVous.filter(
        (rdv) => {
          const patientName = [
            rdv.patient.nom,
            rdv.patient.postNom,
            rdv.patient.prenom,
          ]
            .filter(Boolean)
            .join(" ");

          const medecinName =
            rdv.medecin
              ? [
                  rdv.medecin.nom,
                  rdv.medecin.postNom,
                  rdv.medecin.prenom,
                ]
                  .filter(Boolean)
                  .join(" ")
              : "";

          return (
            rdv.numero
              .toLowerCase()
              .includes(term) ||

            rdv.patient.numeroDossier
              .toLowerCase()
              .includes(term) ||

            patientName
              .toLowerCase()
              .includes(term) ||

            medecinName
              .toLowerCase()
              .includes(term) ||

            (
              rdv.service?.nom ||
              ""
            )
              .toLowerCase()
              .includes(term) ||

            (
              rdv.specialite?.nom ||
              ""
            )
              .toLowerCase()
              .includes(term) ||

            (
              rdv.motif ||
              ""
            )
              .toLowerCase()
              .includes(term)
          );
        }
      );
    }, [
      rendezVous,
      search,
    ]);

  return (
    <div className="space-y-6">

      <RendezVousStats
        rendezVous={
          rendezVous
        }
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <RendezVousSearch
          value={search}
          onChange={setSearch}
        />

        {search && (
          <p className="text-sm text-base-content/60">
            {filtered.length} résultat(s)
          </p>
        )}

      </div>

      <RendezVousTable
        rendezVous={
          filtered
        }
      />

    </div>
  );
}