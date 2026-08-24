import Link from "next/link";

import {
  getRendezVousFormData,
} from "@/app/actions/rendezVous";
import RendezVousForm from "@/components/rende-vous/RendezVousForm";



export default async function NouveauRendezVousPage() {
  const response =
    await getRendezVousFormData();

  if (!response.success) {
    return (
      <div className="p-6">

        <div className="alert alert-error">
          {response.message}
        </div>

      </div>
    );
  }

  const {
    patients,
    medecins,
    specialites,
    services,
  } = response.data;

  return (
    <div className="p-4 md:p-6">

      <RendezVousForm
        patients={patients}
        medecins={medecins}
        specialites={specialites}
        services={services}
        mode="create"
      />

    </div>
  );
}