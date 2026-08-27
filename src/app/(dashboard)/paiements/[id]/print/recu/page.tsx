import { getPaiementById } from "@/app/actions/paiements";
import RecuPaiement from "@/components/facturation/RecuPaiement";

export default async function RecuPaiementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getPaiementById(
    Number(id)
  );

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          {result.message}
        </div>
      </div>
    );
  }

  return (
    <RecuPaiement
      paiement={result.data}
    />
  );
}