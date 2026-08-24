import Link from "next/link";

import {
  Eye,
  ImageIcon,
} from "lucide-react";

import {
  getCategoriesImagerie,
  getExamensImagerie,
  getDemandesImagerie,
} from "@/app/actions/imagerie";

import AjouterCategorieImagerieButton from "@/components/imagerie/AjouterCategorieImagerieButton";
import AjouterExamenImagerieButton from "@/components/imagerie/AjouterExamenImagerieButton";

export default async function ImageriePage() {
  /* =========================================================
     DEMANDES D'IMAGERIE
  ========================================================= */

  const demandesResult = await getDemandesImagerie();

  const demandes =
    demandesResult.success &&
    Array.isArray(demandesResult.data)
      ? demandesResult.data
      : [];

  /* =========================================================
     CATÉGORIES D'IMAGERIE
  ========================================================= */

  const categoriesResult =
    await getCategoriesImagerie();

  const categories =
    categoriesResult.success &&
    Array.isArray(categoriesResult.data)
      ? categoriesResult.data
      : [];

  /* =========================================================
     EXAMENS D'IMAGERIE
  ========================================================= */

  const examensResult =
    await getExamensImagerie();

  const examens =
    examensResult.success &&
    Array.isArray(examensResult.data)
      ? examensResult.data
      : [];

  return (
    <div className="space-y-8 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Imagerie médicale
        </h1>

        <p className="text-base-content/60">
          Gestion des examens, catégories et comptes rendus
          d'imagerie.
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
                <h2 className="text-lg font-bold">
                  Demandes d'imagerie
                </h2>

                <p className="text-sm text-base-content/60">
                  Liste des examens d'imagerie demandés
                  pour les patients.
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
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {demandes.map(
                  (demande: any) => (

                    <tr key={demande.id}>

                      {/* NUMÉRO */}

                      <td className="font-bold">
                        {demande.numero ?? "—"}
                      </td>

                      {/* PATIENT */}

                      <td>
                        {demande.patient?.nom ?? ""}
                        {" "}
                        {demande.patient?.postNom ?? ""}
                        {" "}
                        {demande.patient?.prenom ?? ""}
                      </td>

                      {/* EXAMEN */}

                      <td>

                        <div className="flex items-center gap-2">

                          <ImageIcon
                            size={17}
                            className="text-primary"
                          />

                          {demande.examen?.nom ??
                            "Examen d'imagerie"}

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
                          ? new Date(
                              demande.dateDemande,
                            ).toLocaleString("fr-FR")
                          : "—"}

                      </td>

                      {/* URGENCE */}

                      <td>

                        {demande.urgence ? (

                          <span className="badge badge-error">
                            URGENT
                          </span>

                        ) : (

                          <span className="badge">
                            Normal
                          </span>

                        )}

                      </td>

                      {/* STATUT */}

                      <td>

                        <span
                          className={`badge ${
                            demande.statut ===
                            "TERMINE"
                              ? "badge-success"
                              : demande.statut ===
                                "EN_COURS"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {demande.statut ?? "EN_ATTENTE"}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <Link
                          href={`/imagerie/${demande.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          <Eye size={16} />
                          Ouvrir
                        </Link>

                      </td>

                    </tr>

                  ),
                )}

                {/* AUCUNE DEMANDE */}

                {demandes.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-12 text-center"
                    >

                      <div className="flex flex-col items-center gap-2">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">

                          <ImageIcon size={25} />

                        </div>

                        <p className="font-medium">
                          Aucune demande d'imagerie
                        </p>

                        <p className="text-sm text-base-content/50">
                          Les demandes d'imagerie
                          apparaîtront ici.
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

                <ImageIcon size={21} />

              </div>

              <div>

                <h2 className="text-lg font-bold">
                  Examens d'imagerie
                </h2>

                <p className="text-sm text-base-content/60">
                  Liste des examens disponibles en imagerie
                  médicale.
                </p>

              </div>

            </div>

            {/* AJOUT EXAMEN */}

            <AjouterExamenImagerieButton />

          </div>

          <div className="divider my-2" />

          {/* TABLEAU DES EXAMENS */}

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

                  <th>Devise</th>

                  <th>Statut</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {examens.map(
                  (examen: any, index: number) => (

                    <tr key={examen.id}>

                      {/* NUMÉRO */}

                      <td>
                        {index + 1}
                      </td>

                      {/* CODE */}

                      <td>

                        <span className="font-mono text-sm font-semibold">
                          {examen.code ?? "—"}
                        </span>

                      </td>

                      {/* NOM */}

                      <td>

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">

                            <ImageIcon size={17} />

                          </div>

                          <div>

                            <p className="font-semibold">
                              {examen.nom ?? "—"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CATÉGORIE */}

                      <td>

                        <span className="badge badge-outline">
                          {examen.type ?? "—"}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <span className="text-sm text-base-content/70">

                          {examen.description
                            ? examen.description
                            : "—"}

                        </span>

                      </td>

                      {/* PRIX */}

                      <td>

                        <span className="font-semibold">

                          {typeof examen.prix ===
                          "number"
                            ? examen.prix.toFixed(2)
                            : examen.prix ?? "0.00"}

                        </span>

                      </td>

                      {/* DEVISE */}

                      <td>

                        <span className="badge badge-ghost">
                          {examen.devise ?? "USD"}
                        </span>

                      </td>

                      {/* STATUT */}

                      <td>

                        {examen.actif ? (

                          <span className="badge badge-success">
                            Actif
                          </span>

                        ) : (

                          <span className="badge badge-error">
                            Inactif
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="flex items-center gap-2">

                          {/* VOIR */}

                          <Link
                            href={`/imagerie/examens/${examen.id}`}
                            className="btn btn-sm btn-ghost"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* MODIFIER */}

                          <Link
                            href={`/imagerie/examens/${examen.id}/modifier`}
                            className="btn btn-sm btn-outline"
                          >
                            Modifier
                          </Link>

                        </div>

                      </td>

                    </tr>

                  ),
                )}

                {/* AUCUN EXAMEN */}

                {examens.length === 0 && (

                  <tr>

                    <td
                      colSpan={9}
                      className="py-12 text-center"
                    >

                      <div className="flex flex-col items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">

                          <ImageIcon size={25} />

                        </div>

                        <p className="font-medium">
                          Aucun examen d'imagerie
                        </p>

                        <p className="text-sm text-base-content/50">
                          Aucun examen d'imagerie
                          n'a encore été enregistré.
                        </p>

                        <AjouterExamenImagerieButton />

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
          CATÉGORIES D'IMAGERIE
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          {/* HEADER */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">

                <ImageIcon size={21} />

              </div>

              <div>

                <h2 className="text-lg font-bold">
                  Catégories d'imagerie
                </h2>

                <p className="text-sm text-base-content/60">
                  Catégories utilisées pour classer
                  les examens d'imagerie.
                </p>

              </div>

            </div>

            <AjouterCategorieImagerieButton />

          </div>

          <div className="divider my-2" />

          {/* TABLEAU CATÉGORIES */}

          <div className="overflow-x-auto">

            <table className="table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Catégorie</th>

                  <th>Examens</th>

                </tr>

              </thead>

              <tbody>

                {categories.map(
                  (
                    categorie: string,
                    index: number,
                  ) => {

                    const nombreExamens =
                      examens.filter(
                        (examen: any) =>
                          examen.type?.trim() ===
                          categorie.trim(),
                      ).length;

                    return (

                      <tr
                        key={`${categorie}-${index}`}
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">

                              <ImageIcon size={17} />

                            </div>

                            <div>

                              <p className="font-semibold">
                                {categorie}
                              </p>

                              <p className="text-xs text-base-content/50">
                                Type d'imagerie
                              </p>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="badge badge-primary">

                            {nombreExamens} examen
                            {nombreExamens > 1
                              ? "s"
                              : ""}

                          </span>

                        </td>

                      </tr>

                    );

                  },
                )}

                {categories.length === 0 && (

                  <tr>

                    <td
                      colSpan={3}
                      className="py-12 text-center"
                    >

                      <div className="flex flex-col items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/40">

                          <ImageIcon size={25} />

                        </div>

                        <p className="font-medium">
                          Aucune catégorie
                        </p>

                        <p className="text-sm text-base-content/50">
                          Aucune catégorie d'imagerie
                          n'a encore été créée.
                        </p>

                        <AjouterCategorieImagerieButton />

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