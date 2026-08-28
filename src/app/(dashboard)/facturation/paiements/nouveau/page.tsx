import PaiementForm from "@/components/paiements/PaiementForm";


export default function NouveauPaiementPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Nouveau paiement
        </h1>

        <p className="text-base-content/60">
          Enregistrer un encaissement sur une facture existante.
        </p>
      </div>

      <PaiementForm />

    </div>
  );
}