import Link from "next/link";
import { getPatients } from "@/app/actions/patients";
import PatientsTable from "@/components/patients/PatientsTable";
export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const p = await searchParams;
  const r = await getPatients(p.q || "");
  const patients = (r.data || []) as any[];
  return (
    <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>Hôpital</li>
              <li>Patients</li>
            </ul>
          </div>
          <h1 className="text-3xl font-black">Patients</h1>
          <p className="text-base-content/60">
            Gestion des dossiers et accès au parcours complet.
          </p>
        </div>
        <Link href="/patients/nouveau" className="btn btn-primary">
          ＋ Nouveau patient
        </Link>
      </div>
   
      <PatientsTable patients={patients} />
    </main>
  );
}
