import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrdonnanceDetails from "@/components/pharmacie/OrdonnanceDetails";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrdonnanceDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const ordonnanceId = Number(id);

  if (!Number.isInteger(ordonnanceId)) {
    notFound();
  }

  /*
  ==========================================================
  PRESCRIPTION
  ==========================================================
  */

  const prescription =
    await prisma.prescription.findUnique({
      where: {
        id: ordonnanceId,
      },

      include: {
        patient: true,

        medecin: true,

        consultation: true,

        lignes: {
          include: {
            medicament: true,
          },

          orderBy: {
            id: "asc",
          },
        },
      },
    });

  if (!prescription) {
    notFound();
  }

  /*
  ==========================================================
  TRANSFORMATION DES DONNÉES
  ==========================================================
  */

  const ordonnance = {
    id: prescription.id,

    numero: prescription.numero,

    datePrescription:
      prescription.datePrescription,

    statut: prescription.statut,

    patient: prescription.patient
      ? {
          id: prescription.patient.id,

          nom: prescription.patient.nom,

          postNom:
            prescription.patient.postNom,

          prenom:
            prescription.patient.prenom,

          numeroDossier:
            prescription.patient.numeroDossier,
        }
      : null,

    medecin: prescription.medecin
      ? {
          id: prescription.medecin.id,

          nom: prescription.medecin.nom,

          postNom:
            prescription.medecin.postNom,

          prenom:
            prescription.medecin.prenom,

          numeroOrdre:
            prescription.medecin.numeroOrdre,
        }
      : null,

    lignes:
      prescription.lignes.map(
        (ligne) => ({
          id: ligne.id,

          quantite:
            ligne.quantite ?? 0,

          posologie:
            ligne.posologie,

          dose: ligne.dose,

          frequence:
            ligne.frequence,

          duree:
            ligne.duree,

          voie: ligne.voie,

          observation:
            ligne.observation,

          medicament:
            ligne.medicament
              ? {
                  id: ligne.medicament.id,

                  code:
                    ligne.medicament.code,

                  nom:
                    ligne.medicament.nom,

                  denomination:
                    ligne.medicament
                      .denomination,

                  forme:
                    ligne.medicament.forme,

                  dosage:
                    ligne.medicament.dosage,

                  prixVente:
                    ligne.medicament
                      .prixVente,

                  devise:
                    ligne.medicament.devise,
                }
              : null,
        }),
      ),
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <OrdonnanceDetails
        ordonnance={ordonnance}
      />
    </div>
  );
}