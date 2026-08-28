import {
  getRapportFilters,
  getRapportGlobal,
} from "@/app/actions/rapport";
import RapportDashboard from "./RapportDashboard";



export default async function RapportsPage() {

  const [
    rapport,
    filters,
  ] = await Promise.all([
    getRapportGlobal({
      periode: "MOIS",
    }),

    getRapportFilters(),
  ]);

  return (
    <RapportDashboard
      initialRapport={rapport}
      services={filters.services}
      medecins={filters.medecins}
    />
  );
}