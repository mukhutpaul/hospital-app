import Link from "next/link";

import { Eye, ImageIcon, FileText } from "lucide-react";

import {
  getCategoriesImagerie,
  getDemandesImagerie,
  getExamensImagerie,
} from "@/app/actions/imagerie";

import AjouterCategorieImagerieButton from "@/components/imagerie/AjouterCategorieImagerieButton";

import AjouterExamenImagerie from "@/components/imagerie/AjouterExamenImagerie";

import ExamenImagerieActions from "@/components/imagerie/ExamenImagerieActions";

export default async function ImageriePage() {
  /* =========================================================
     DEMANDES D'IMAGERIE
  ========================================================= */

  const demandesResult = await getDemandesImagerie();

  const demandes =
    demandesResult.success && Array.isArray(demandesResult.data)
      ? demandesResult.data
      : [];

  /* =========================================================
     EXAMENS D'IMAGERIE
  ========================================================= */

  const examensResult = await getExamensImagerie();

  const examens =
    examensResult.success && Array.isArray(examensResult.data)
      ? examensResult.data
      : [];

  /* =========================================================
     CATÉGORIES
  ========================================================= */

  const categoriesResult = await getCategoriesImagerie();

  const categories =
    categoriesResult.success && Array.isArray(categoriesResult.data)
      ? categoriesResult.data
      : [];

  return (
    <div className="space-y-8 p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold">Imagerie médicale</h1>

        <p className="text-base-content/60">
          Gestion des examens, demandes, catégories et comptes rendus d'imagerie
          médicale.
        </p>
      </div>

      {/* =====================================================
          DEMANDES D'IMAGERIE
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          {/* HEADER */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold">Demandes d'imagerie</h2>

                <p className="text-sm text-base-content/60">
                  Liste des examens d'imagerie demandés pour les patients.
                </p>
              </div>
            </div>
          </div>

          <div className="divider my-2" />

          {/* TABLEAU */}

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Numéro</th>

                  <th>Patient</th>

                  <th>Examen</th>

                  <th>Catégorie</th>

                  <th>Date demande</th>

                  <th>Urgence</th>

                  <th>Statut</th>

                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {demandes.map((demande: any) => {
                  const patientNom = [
                    demande.patient?.nom,
                    demande.patient?.postNom,
                    demande.patient?.prenom,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr key={demande.id}>
                      {/* NUMÉRO */}

                      <td className="font-bold">{demande.numero ?? "—"}</td>

                      {/* PATIENT */}

                      <td>
                        <div className="font-medium">
                          {patientNom || "Patient inconnu"}
                        </div>
                      </td>

                      {/* EXAMEN */}

                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ImageIcon size={16} />
                          </div>

                          <span>
                            {demande.examen?.nom ?? "Examen d'imagerie"}
                          </span>
                        </div>
                      </td>

                      {/* CATÉGORIE */}

                      <td>
                        <span className="badge badge-outline">
                          {demande.examen?.type ?? "—"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        {demande.dateDemande
                          ? new Date(demande.dateDemande).toLocaleString(
                              "fr-FR",
                            )
                          : "—"}
                      </td>

                      {/* URGENCE */}

                      <td>
                        {demande.urgence ? (
                          <span className="badge badge-error">Urgent</span>
                        ) : (
                          <span className="badge">Normal</span>
                        )}
                      </td>

                      {/* STATUT */}

                      <td>
                        <span
                          className={`badge ${
                            demande.statut === "TERMINE"
                              ? "badge-success"
                              : demande.statut === "EN_COURS"
                                ? "badge-info"
                                : "badge-warning"
                          }`}
                        >
                          {demande.statut ?? "DEMANDE"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <div className="flex justify-end">
                          <Link
                            href={`/imagerie/${demande.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            <Eye size={16} />
                            Ouvrir
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* AUCUNE DEMANDE */}

                {demandes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                          <ImageIcon size={25} />
                        </div>

                        <p className="font-medium">Aucune demande d'imagerie</p>

                        <p className="text-sm text-base-content/50">
                          Les demandes d'imagerie apparaîtront ici.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================
          EXAMENS D'IMAGERIE
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">
          {/* HEADER */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold">Examens d'imagerie</h2>

                <p className="text-sm text-base-content/60">
                  Gestion du catalogue des examens d'imagerie médicale.
                </p>
              </div>
            </div>

            {/* =================================================
                BOUTON + POPUP
            ================================================= */}

            <AjouterExamenImagerie />
          </div>

          <div className="divider my-2" />

          {/* =================================================
              TABLEAU DES EXAMENS
          ================================================= */}

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>

                  <th>Code</th>

                  <th>Examen</th>

                  <th>Catégorie</th>

                  <th>Description</th>

                  <th>Prix</th>

                  <th>Demandes</th>

                  <th>Statut</th>

                  <th>Créé le</th>

                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {examens.map((examen: any, index: number) => {
                  const nombreDemandes =
                    examen._count?.demandes ?? examen.demandes?.length ?? 0;

                  return (
                    <tr key={examen.id}>
                      {/* =================================================
                            NUMÉRO
                        ================================================= */}

                      <td>{index + 1}</td>

                      {/* =================================================
                            CODE
                        ================================================= */}

                      <td>
                        <span className="font-mono text-sm font-semibold">
                          {examen.code}
                        </span>
                      </td>

                      {/* =================================================
                            EXAMEN
                        ================================================= */}

                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ImageIcon size={17} />
                          </div>

                          <div>
                            <p className="font-semibold">{examen.nom}</p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                            CATÉGORIE
                        ================================================= */}

                      <td>
                        <span className="badge badge-outline">
                          {examen.type || "—"}
                        </span>
                      </td>

                      {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                      <td>
                        <div className="max-w-xs">
                          <p
                            className="truncate text-sm text-base-content/70"
                            title={examen.description ?? ""}
                          >
                            {examen.description || "Aucune description"}
                          </p>
                        </div>
                      </td>

                      {/* =================================================
                            PRIX
                        ================================================= */}

                      <td>
                        <span className="font-semibold">
                          {Number(examen.prix ?? 0).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          {examen.devise ?? "USD"}
                        </span>
                      </td>

                      {/* =================================================
                            DEMANDES
                        ================================================= */}

                      <td>
                        <span className="badge badge-primary">
                          {nombreDemandes} demande
                          {nombreDemandes !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* =================================================
                            STATUT
                        ================================================= */}

                      <td>
                        {examen.actif ? (
                          <span className="badge badge-success">Actif</span>
                        ) : (
                          <span className="badge badge-error">Inactif</span>
                        )}
                      </td>

                      {/* =================================================
                            DATE
                        ================================================= */}

                      <td>
                        {examen.createdAt
                          ? new Date(examen.createdAt).toLocaleDateString(
                              "fr-FR",
                            )
                          : "—"}
                      </td>

                      {/* =================================================
                            ACTIONS
                        ================================================= */}

                      <td>
                        <ExamenImagerieActions examen={examen} />
                      </td>
                    </tr>
                  );
                })}

                {/* =================================================
                    AUCUN EXAMEN
                ================================================= */}

                {examens.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                          <ImageIcon size={25} />
                        </div>

                        <p className="font-medium">Aucun examen d'imagerie</p>

                        <p className="text-sm text-base-content/50">
                          Aucun examen n'a encore été enregistré.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

   
    </div>
  );
}
