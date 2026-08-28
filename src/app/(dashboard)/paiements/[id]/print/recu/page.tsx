
import { notFound } from "next/navigation";

import { getPaiementById } from "@/app/actions/paiements";
import PaiementReceiptA8 from "@/components/recu/PaiementReceiptA8";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaiementRecuPage({
  params,
}: Props) {
  const { id } = await params;

  const paiementId = Number(id);

  if (
    !Number.isInteger(paiementId) ||
    paiementId <= 0
  ) {
    notFound();
  }

  const paiement =
    await getPaiementById(paiementId);

  if (!paiement) {
    notFound();
  }

  return (
    <PaiementReceiptA8
      paiement={{
        id: paiement.id,

        reference: paiement.reference,

        montant: Number(
          paiement.montant,
        ),

        devise:
          paiement.devise ||
          paiement.facture?.devise ||
          "USD",

        modePaiement:
          paiement.modePaiement,

        type: paiement.type,

        statut: paiement.statut,

        datePaiement:
          paiement.datePaiement.toISOString(),

        description:
          paiement.description,

        patient:
          paiement.patient
            ? {
                id: paiement.patient.id,
                nom: paiement.patient.nom,
                postNom:
                  paiement.patient.postNom,
                prenom:
                  paiement.patient.prenom,
                numeroDossier:
                  paiement.patient.numeroDossier,
                telephone:
                  paiement.patient.telephone,
              }
            : null,

        facture:
          paiement.facture
            ? {
                id: paiement.facture.id,
                numero:
                  paiement.facture.numero,
              }
            : null,

        caissier:
          paiement.caissier
            ? {
                id: paiement.caissier.id,
                name:
                  paiement.caissier.name,
                email:
                  paiement.caissier.email,
              }
            : null,
      }}
    />
  );
}
