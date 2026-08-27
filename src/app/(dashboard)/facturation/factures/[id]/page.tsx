import Link from "next/link";
import { notFound } from "next/navigation";
import { getFactureById } from "@/app/actions/facturation";
import FacturePrint from "@/components/facturation/FacturePrint";


type Props = {
  params: Promise<{ id: string }>;
};

export default async function FactureDetailsPage({ params }: Props) {
  const { id } = await params;

  const factureId = Number(id);

  if (!Number.isInteger(factureId)) {
    notFound();
  }

  const result = await getFactureById(factureId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Facture {result.data.numero}
          </h1>

          <p className="text-base-content/60">
            Détails et historique de paiement
          </p>
        </div>

        <Link
          href="/facturation/factures"
          className="btn btn-ghost"
        >
          Retour
        </Link>
      </div>

      <FacturePrint facture={result.data as any} />
    </div>
  );
}