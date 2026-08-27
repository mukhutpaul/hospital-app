import FactureForm from "@/components/facturation/FactureForm";

import {
  getPatientsFacturation,
  getServicesFacturation,
  getActesMedicaux,
} from "@/app/actions/facturation";

export default async function Page() {
  const [
    patientsResult,
    servicesResult,
    actesResult,
  ] = await Promise.all([
    getPatientsFacturation(),
    getServicesFacturation(),
    getActesMedicaux(),
  ]);

  const patients =
    patientsResult.success &&
    Array.isArray(patientsResult.data)
      ? patientsResult.data
      : [];

  const services =
    servicesResult.success &&
    Array.isArray(servicesResult.data)
      ? servicesResult.data
      : [];

  const actes =
    actesResult.success &&
    Array.isArray(actesResult.data)
      ? actesResult.data
      : [];

  return (
    <FactureForm
      patients={patients}
      services={services}
      actes={actes}
    />
  );
}