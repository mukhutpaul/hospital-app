"use client";

import { useRouter } from "next/navigation";

type Props = {
  proformaId: number;
};

export default function ProformaActions({
  proformaId,
}: Props) {
  const router = useRouter();

  function handleRetour() {
    router.push("/facturation/proformas");
  }

  function handleFacturer() {
    router.push(
      `/facturation/factures/nouveau?proformaId=${proformaId}`
    );
  }

  function handleImprimer() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleRetour}
        className="btn btn-outline"
      >
        ← Retour
      </button>

      <button
        type="button"
        onClick={handleImprimer}
        className="btn btn-outline"
      >
        🖨️ Imprimer
      </button>

      <button
        type="button"
        onClick={handleFacturer}
        className="btn btn-primary"
      >
        Créer la facture
      </button>
    </div>
  );
}