
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Activity,
} from "lucide-react";

import {
  getActeMedicalById,
} from "@/app/actions/actes-medicaux";

export default async function ActeMedicalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result =
    await getActeMedicalById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const acte = result.data as any;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {acte.libelle}
          </h1>

          <p className="text-sm opacity-60">
            Détails de l'acte médical
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/actes"
            className="btn btn-ghost"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <Link
            href={`/actes/${acte.id}/modifier`}
            className="btn btn-primary"
          >
            <Edit size={18} />
            Modifier
          </Link>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Activity size={28} />
              </div>

              <div>
                <p className="font-mono text-sm opacity-60">
                  {acte.code}
                </p>

                <h2 className="text-xl font-bold">
                  {acte.libelle}
                </h2>

                <p className="text-sm opacity-60">
                  {acte.categorie || "Sans catégorie"}
                </p>
              </div>
            </div>

            {acte.actif ? (
              <span className="badge badge-success">
                Actif
              </span>
            ) : (
              <span className="badge">
                Inactif
              </span>
            )}
          </div>

          <div className="divider" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-base-200 p-5">
              <p className="text-xs opacity-60">
                Tarif
              </p>

              <p className="mt-1 text-2xl font-bold">
                {Number(
                  acte.montant,
                ).toFixed(2)}{" "}
                {acte.devise}
              </p>
            </div>

            <div className="rounded-xl bg-base-200 p-5">
              <p className="text-xs opacity-60">
                Consultations
              </p>

              <p className="mt-1 text-2xl font-bold">
                {acte._count?.consultations ??
                  0}
              </p>
            </div>

            <div className="rounded-xl bg-base-200 p-5">
              <p className="text-xs opacity-60">
                Lignes de facture
              </p>

              <p className="mt-1 text-2xl font-bold">
                {acte._count?.lignesFacture ??
                  0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
