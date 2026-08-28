import Link from "next/link";

import {
  Users,
  UserPlus,
  Search,
  FolderHeart,
  ChevronRight,
} from "lucide-react";

import { getPatients } from "@/app/actions/patients";

import PatientsTable from "@/components/patients/PatientsTable";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const p = await searchParams;

  const r = await getPatients(
    p.q || "",
  );

  const patients =
    (r.data || []) as any[];

  const totalPatients =
    patients.length;

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm">

        {/* Décoration */}

        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5" />

        <div className="relative p-5 md:p-7">

          {/* BREADCRUMB */}

          <div className="breadcrumbs text-sm mb-5">

            <ul>

              <li>
                <Link href="/">
                  Hôpital
                </Link>
              </li>

              <li>
                <Users
                  size={14}
                />
                Patients
              </li>

            </ul>

          </div>


          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

            {/* TITRE */}

            <div className="flex items-start gap-4">

              <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center shadow-lg shadow-primary/20">

                <Users size={30} />

              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Patients
                  </h1>

                  <span className="badge badge-primary badge-outline">

                    {totalPatients}

                    {" "}

                    patient
                    {totalPatients !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>

                <p className="mt-2 text-sm md:text-base text-base-content/60 max-w-2xl">

                  Gérez les dossiers médicaux des patients
                  et accédez rapidement à leur parcours
                  administratif et médical.

                </p>

              </div>

            </div>


            {/* ACTION */}

            <Link
              href="/patients/nouveau"
              className="btn btn-primary rounded-xl shadow-md shadow-primary/20"
            >

              <UserPlus size={19} />

              Nouveau patient

              <ChevronRight size={17} />

            </Link>

          </div>

        </div>

      </div>


    


      {/* ======================================================
          RECHERCHE
      ====================================================== */}

      <form
        className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
      >

        <div className="flex flex-col md:flex-row gap-3">

          <label className="input input-bordered flex items-center gap-3 flex-1">

            <Search
              size={20}
              className="text-base-content/50"
            />

            <input
              type="search"
              name="q"
              defaultValue={p.q || ""}
              placeholder="Rechercher par nom, prénom ou numéro de dossier..."
              className="grow"
            />

          </label>


          <button
            type="submit"
            className="btn btn-primary"
          >

            <Search size={18} />

            Rechercher

          </button>


          {p.q && (

            <Link
              href="/patients"
              className="btn btn-ghost"
            >
              Réinitialiser
            </Link>

          )}

        </div>

      </form>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="rounded-3xl border border-base-200 bg-base-100 shadow-sm overflow-hidden">

        {/* TABLE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 md:px-6 py-4 border-b border-base-200">

          <div>

            <h2 className="font-semibold text-lg">
              Liste des patients
            </h2>

            <p className="text-sm text-base-content/50">

              Consultez et gérez les dossiers
              enregistrés dans le système.

            </p>

          </div>


          <span className="badge badge-outline badge-primary">

            {totalPatients}

            {" "}

            résultat
            {totalPatients !== 1
              ? "s"
              : ""}

          </span>

        </div>


        {/* TABLE */}

        <div className="p-3 md:p-5">

          <PatientsTable
            patients={patients}
          />

        </div>

      </div>

    </main>
  );
}