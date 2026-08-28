
import Link from "next/link";
import {
  Activity,
  ClipboardList,
  PlusCircle,
  Eye,
  Pencil,
} from "lucide-react";

import {
  getActesMedicaux,
  getConsultationsAvecActes,
} from "@/app/actions/actes-medicaux";

export default async function ActesMedicauxPage() {
  const [actesResult, consultationsResult] =
    await Promise.all([
      getActesMedicaux(),
      getConsultationsAvecActes(),
    ]);

  const actes = actesResult.success
    ? actesResult.data ?? []
    : [];

  const consultations =
    consultationsResult.success
      ? consultationsResult.data ?? []
      : [];

  const actesActifs = actes.filter(
    (acte: any) => acte.actif,
  ).length;

  const actesUtilises = actes.filter(
    (acte: any) =>
      (acte._count?.consultations ?? 0) > 0,
  ).length;

  return (
    <div className="w-full space-y-6">

      {/* =====================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Actes médicaux
          </h1>

          <p className="mt-1 text-base-content/60">
            Gestion du catalogue tarifaire et des actes
            réalisés en consultation.
          </p>
        </div>

        <Link
          href="/actes/nouveau"
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          Nouvel acte médical
        </Link>
      </div>

      {/* =====================================================
          ERREUR
      ====================================================== */}

      {!actesResult.success && (
        <div className="alert alert-error">
          {actesResult.message}
        </div>
      )}

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-60">
                Total actes
              </p>

              <Activity className="text-primary" />
            </div>

            <p className="text-3xl font-bold">
              {actes.length}
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-60">
                Actes actifs
              </p>

              <span className="badge badge-success">
                Actifs
              </span>
            </div>

            <p className="text-3xl font-bold">
              {actesActifs}
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-60">
                Actes utilisés
              </p>

              <ClipboardList className="text-info" />
            </div>

            <p className="text-3xl font-bold">
              {actesUtilises}
            </p>
          </div>
        </div>

      </div>

      {/* =====================================================
          CATALOGUE + CONSULTATIONS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* CATALOGUE */}

        <Link
          href="/actes"
          className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="card-body">

            <Activity
              className="mb-2 text-primary"
              size={28}
            />

            <h2 className="card-title">
              Catalogue des actes
            </h2>

            <p className="text-sm opacity-60">
              Créer, modifier, activer, désactiver et
              consulter les tarifs des actes médicaux.
            </p>

          </div>
        </Link>

        {/* ACTES DE CONSULTATION */}

        <Link
          href="/actes/consultations"
          className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="card-body">

            <ClipboardList
              className="mb-2 text-info"
              size={28}
            />

            <h2 className="card-title">
              Actes de consultation
            </h2>

            <p className="text-sm opacity-60">
              Voir les actes réellement associés aux
              consultations des patients.
            </p>

          </div>
        </Link>

      </div>

      {/* =====================================================
          TABLEAU DES ACTES MÉDICAUX
      ====================================================== */}

      <div className="card w-full border border-base-300 bg-base-100 shadow-sm">

        {/* HEADER TABLE */}

        <div className="flex flex-col gap-3 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Liste des actes médicaux
            </h2>

            <p className="text-sm text-base-content/60">
              Catalogue tarifaire des actes disponibles.
            </p>
          </div>

          <Link
            href="/actes/nouveau"
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            Ajouter un acte
          </Link>

        </div>

        {/* TABLE */}

        <div className="w-full overflow-x-auto">

          <table className="table w-full">

            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Devise</th>
                <th>Utilisation</th>
                <th>Statut</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {actes.map((acte: any) => {

                const nombreUtilisations =
                  acte._count?.consultations ?? 0;

                return (
                  <tr
                    key={acte.id}
                    className="hover"
                  >

                    {/* CODE */}

                    <td>
                      <span className="font-mono font-semibold">
                        {acte.code}
                      </span>
                    </td>

                    {/* LIBELLÉ */}

                    <td>
                      <span className="font-medium">
                        {acte.libelle}
                      </span>
                    </td>

                    {/* CATÉGORIE */}

                    <td>
                      {acte.categorie ? (
                        <span className="badge badge-ghost">
                          {acte.categorie}
                        </span>
                      ) : (
                        <span className="opacity-40">
                          —
                        </span>
                      )}
                    </td>

                    {/* MONTANT */}

                    <td>
                      <span className="font-semibold">
                        {Number(acte.montant).toLocaleString(
                          "fr-FR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </td>

                    {/* DEVISE */}

                    <td>
                      {acte.devise}
                    </td>

                    {/* UTILISATION */}

                    <td>
                      <span className="badge badge-info badge-outline">
                        {nombreUtilisations}
                      </span>
                    </td>

                    {/* STATUT */}

                    <td>
                      {acte.actif ? (
                        <span className="badge badge-success">
                          Actif
                        </span>
                      ) : (
                        <span className="badge badge-ghost">
                          Inactif
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-end gap-1">

                        <Link
                          href={`/actes/${acte.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Voir l'acte"
                        >
                          <Eye size={17} />
                        </Link>

                        <Link
                          href={`/actes/${acte.id}/modifier`}
                          className="btn btn-ghost btn-sm"
                          title="Modifier l'acte"
                        >
                          <Pencil size={17} />
                        </Link>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {/* AUCUN ACTE */}

              {actes.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">

                      <Activity
                        size={40}
                        className="text-base-content/20"
                      />

                      <div>
                        <p className="font-semibold">
                          Aucun acte médical
                        </p>

                        <p className="text-sm text-base-content/50">
                          Aucun acte n'est actuellement
                          enregistré dans le catalogue.
                        </p>
                      </div>

                      <Link
                        href="/actes/nouveau"
                        className="btn btn-primary btn-sm"
                      >
                        <PlusCircle size={16} />
                        Créer le premier acte
                      </Link>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}
