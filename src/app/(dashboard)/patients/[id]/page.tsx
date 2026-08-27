import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/app/actions/patients";
import PatientDossier from "@/components/patients/PatientDossier";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patientId = Number(id);

  if (!Number.isInteger(patientId) || patientId <= 0) {
    notFound();
  }

  const r = await getPatient(patientId);

  if (!r.success || !r.data) {
    notFound();
  }

  const p = r.data as any;

  return (
    <main className="p-6 max-w-[1600px] mx-auto space-y-6">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="avatar">
            <div className="w-20 h-20 rounded-2xl bg-base-200 overflow-hidden">

              {p.photo ? (
                <img
                  src={p.photo}
                  alt={`Photo de ${p.nom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold">
                  {p.nom?.[0] || ""}
                  {p.postNom?.[0] || ""}
                </div>
              )}

            </div>
          </div>

          <div>

            <div className="text-sm font-mono text-primary">
              {p.numeroDossier}
            </div>

            <h1 className="text-3xl font-black">
              {p.nom} {p.postNom || ""} {p.prenom || ""}
            </h1>

            <p className="text-base-content/60">
              {p.sexe} ·{" "}
              {p.dateNaissance
                ? new Date(p.dateNaissance).toLocaleDateString("fr-FR")
                : "Date de naissance non renseignée"}{" "}
              ·{" "}
              {p.telephone || "Téléphone non renseigné"}
            </p>

          </div>
        </div>

        <div className="flex gap-2">

          <Link
            href="/patients"
            className="btn btn-ghost"
          >
            Retour
          </Link>

          <Link
            href={`/patients/${p.id}/modifier`}
            className="btn btn-primary"
          >
            Modifier
          </Link>

        </div>

      </div>

      <div className="alert bg-primary/5 border-primary/20">
        <div>

          <b>Dossier médical centralisé</b>

          <div className="text-sm">
            Le parcours ci-dessous rassemble rendez-vous, admissions,
            consultations, hospitalisations, examens, prescriptions,
            paiements et soins enregistrés.
          </div>

        </div>
      </div>

      <PatientDossier patient={p} />

    </main>
  );
}