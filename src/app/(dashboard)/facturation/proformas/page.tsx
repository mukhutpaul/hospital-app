import {
  getPatientsFinance,
} from "@/app/actions/finance";

import ProformaForm from "@/components/facturation/ProformaForm";

/* ==========================================================
   TYPES
========================================================== */

type Patient = {
  id: number;
  numeroDossier?: string | null;
  nom?: string | null;
  postNom?: string | null;
  prenom?: string | null;
};

/* ==========================================================
   PAGE
========================================================== */

export default async function Page() {
  const patientsResult =
    await getPatientsFinance();

  const patients: Patient[] =
    patientsResult.success &&
    Array.isArray(patientsResult.data)
      ? patientsResult.data
      : [];

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        <ProformaForm
          patients={patients}
        />
      </div>
    </main>
  );
}