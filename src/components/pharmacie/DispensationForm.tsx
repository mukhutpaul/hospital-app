"use client";

type Ordonnance = {
  id: number;
  numero: string;
  statut: string;

  patient?: {
    id: number;
    nom: string;
    postNom?: string | null;
    prenom?: string | null;
    numeroDossier?: string | null;
  } | null;

  lignes?: {
    id: number;
    quantite: number;

    medicament?: {
      id: number;
      code: string;
      nom: string;
      forme?: string | null;
      dosage?: string | null;
    } | null;
  }[];
};

type Props = {
  ordonnances: Ordonnance[];
};

export default function DispensationForm({
  ordonnances,
}: Props) {
  return (
    <div>
      {/* ton formulaire ici */}
    </div>
  );
}