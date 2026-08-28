import { getPaiementById } from "@/app/actions/paiements";
import PaiementDetails from "@/components/paiements/PaiementDetails";
import Link from "next/link";
import { notFound } from "next/navigation";





type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaiementPage({
  params,
}: Props) {
  const { id } = await params;

  const paiementId =
    Number(id);

  if (
    !Number.isInteger(
      paiementId
    ) ||
    paiementId <= 0
  ) {
    notFound();
  }

  const paiement =
    await getPaiementById(
      paiementId
    );

  if (!paiement) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6">
      <PaiementDetails
        paiement={
          paiement as any
        }
      />
    </div>
  );
}