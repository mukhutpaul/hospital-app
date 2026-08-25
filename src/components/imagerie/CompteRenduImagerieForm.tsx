"use client";

import { useState } from "react";

import { updateCompteRenduImagerie } from "@/app/actions/imagerie";

import {
  Save,
  Loader2,
  FileText,
  CalendarDays,
  Stethoscope,
  Upload,
  X,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

import { toast } from "react-toastify";

type Props = {
  demande: any;
};

export default function CompteRenduImagerieForm({ demande }: Props) {
  /* =========================================================
     DONNÉES
  ========================================================= */

  const [dateExamen, setDateExamen] = useState(
    demande.dateExamen
      ? new Date(demande.dateExamen).toISOString().slice(0, 16)
      : "",
  );

  const [compteRendu, setCompteRendu] = useState(
    demande.compteRendu ?? "",
  );

  const [conclusion, setConclusion] = useState(
    demande.conclusion ?? "",
  );

  /**
   * IMPORTANT :
   * On conserve le véritable objet File.
   */
  const [fichier, setFichier] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  /* =========================================================
     INFORMATIONS
  ========================================================= */

  const patientNom = [
    demande.patient?.nom,
    demande.patient?.postNom,
    demande.patient?.prenom,
  ]
    .filter(Boolean)
    .join(" ");

  const examenNom =
    demande.examen?.nom ?? "Examen d'imagerie";

  /* =========================================================
     FICHIER DÉJÀ ENREGISTRÉ
  ========================================================= */

  const fichierEnregistre = demande.fichier
    ? String(demande.fichier)
    : null;

  /**
   * Le fichier est normalement enregistré sous :
   *
   * /uploads/imagerie/nom-du-fichier.ext
   *
   * Si la base contient déjà le chemin complet,
   * on le conserve.
   */
  const fichierUrl = fichierEnregistre
    ? fichierEnregistre.startsWith("/")
      ? fichierEnregistre
      : `/uploads/imagerie/${fichierEnregistre}`
    : null;

  const fichierNom = fichierEnregistre
    ? fichierEnregistre.split("/").pop() || "Fichier d'imagerie"
    : "";

  const fichierEstImage =
    !!fichierUrl &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(fichierUrl);

  const fichierEstPdf =
    !!fichierUrl && /\.pdf$/i.test(fichierUrl);

  /* =========================================================
     CHOIX DU FICHIER
  ========================================================= */

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const typesAutorises = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!typesAutorises.includes(file.type)) {
      toast.error(
        "Format non autorisé. Utilisez PDF, JPG, PNG ou WEBP.",
      );

      event.target.value = "";
      setFichier(null);

      return;
    }

    /* -------------------------------------------------------
       TAILLE MAXIMALE : 10 Mo
    ------------------------------------------------------- */

    const tailleMax = 10 * 1024 * 1024;

    if (file.size > tailleMax) {
      toast.error(
        "Le fichier ne doit pas dépasser 10 Mo.",
      );

      event.target.value = "";
      setFichier(null);

      return;
    }

    /**
     * On conserve le véritable objet File.
     */
    setFichier(file);
  }

  /* =========================================================
     SUPPRIMER FICHIER SÉLECTIONNÉ
  ========================================================= */

  function supprimerFichier() {
    setFichier(null);

    const input = document.getElementById(
      "fichier-imagerie",
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /* =========================================================
     FORMAT TAILLE
  ========================================================= */

  function formatFileSize(size: number) {
    if (size < 1024) {
      return `${size} octets`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} Ko`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("dateExamen", dateExamen);

      formData.append(
        "compteRendu",
        compteRendu,
      );

      formData.append(
        "conclusion",
        conclusion,
      );

      /**
       * IMPORTANT :
       * On envoie uniquement un nouveau fichier
       * si l'utilisateur en a sélectionné un.
       *
       * Sinon le fichier déjà enregistré reste inchangé
       * côté serveur.
       */
      if (fichier) {
        formData.append("fichier", fichier);
      }

      const result =
        await updateCompteRenduImagerie(
          demande.id,
          formData,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      window.location.reload();
    } catch (error) {
      console.error(
        "Erreur enregistrement compte rendu :",
        error,
      );

      toast.error(
        "Erreur lors de l'enregistrement du compte rendu.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =====================================================
          DATE EXAMEN
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <CalendarDays size={20} />
            </div>

            <div>
              <h3 className="font-bold">
                Informations de l'examen
              </h3>

              <p className="text-sm text-base-content/60">
                Indiquez la date et l'heure de réalisation.
              </p>
            </div>

          </div>

          <div className="divider my-2" />

          <div className="max-w-md">

            <label className="label">
              <span className="label-text font-medium">
                Date et heure de l'examen
              </span>
            </label>

            <label className="input input-bordered flex items-center gap-3">

              <CalendarDays
                size={18}
                className="text-base-content/40"
              />

              <input
                type="datetime-local"
                value={dateExamen}
                onChange={(e) =>
                  setDateExamen(e.target.value)
                }
                className="grow"
              />

            </label>

          </div>

        </div>
      </div>

      {/* =====================================================
          COMPTE RENDU
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={20} />
            </div>

            <div>
              <h3 className="font-bold">
                Observations radiologiques
              </h3>

              <p className="text-sm text-base-content/60">
                Décrivez les constatations observées pendant
                l'examen.
              </p>
            </div>

          </div>

          <div className="divider my-2" />

          <textarea
            value={compteRendu}
            onChange={(e) =>
              setCompteRendu(e.target.value)
            }
            placeholder="Décrire les constatations radiologiques..."
            className="textarea textarea-bordered min-h-64 w-full resize-y leading-7"
          />

          <div className="flex justify-between text-xs text-base-content/50">

            <span>
              Décrivez les résultats de manière claire et
              structurée.
            </span>

            <span>
              {compteRendu.length} caractères
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          CONCLUSION
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Stethoscope size={20} />
            </div>

            <div>
              <h3 className="font-bold">
                Conclusion
              </h3>

              <p className="text-sm text-base-content/60">
                Résumez les principaux résultats de l'examen.
              </p>
            </div>

          </div>

          <div className="divider my-2" />

          <textarea
            value={conclusion}
            onChange={(e) =>
              setConclusion(e.target.value)
            }
            placeholder="Indiquer la conclusion de l'examen..."
            className="textarea textarea-bordered min-h-40 w-full resize-y leading-7"
          />

          <div className="flex justify-between text-xs text-base-content/50">

            <span>
              La conclusion doit être concise et compréhensible.
            </span>

            <span>
              {conclusion.length} caractères
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          FICHIER DÉJÀ ENREGISTRÉ
      ===================================================== */}

      {fichierUrl && (

        <div className="card border border-success/30 bg-base-100 shadow-sm">

          <div className="card-body">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">

                  {fichierEstImage ? (
                    <ImageIcon size={20} />
                  ) : (
                    <FileText size={20} />
                  )}

                </div>

                <div>

                  <h3 className="font-bold">
                    Fichier déjà enregistré
                  </h3>

                  <p className="text-sm text-base-content/60">
                    {fichierNom}
                  </p>

                </div>

              </div>

              <a
                href={fichierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                <ExternalLink size={16} />
                Ouvrir
              </a>

            </div>

            <div className="divider my-2" />

            {/* -------------------------------------------------
                IMAGE
            ------------------------------------------------- */}

            {fichierEstImage && (

              <div className="overflow-hidden rounded-xl border border-base-200 bg-base-200/20 p-3">

                <img
                  src={fichierUrl}
                  alt={`Résultat d'imagerie - ${examenNom}`}
                  className="mx-auto max-h-[600px] w-auto max-w-full rounded-lg object-contain"
                />

              </div>

            )}

            {/* -------------------------------------------------
                PDF
            ------------------------------------------------- */}

            {fichierEstPdf && (

              <div className="overflow-hidden rounded-xl border border-base-200 bg-base-200/20">

                <iframe
                  src={fichierUrl}
                  title={`Document d'imagerie - ${examenNom}`}
                  className="h-[700px] w-full"
                />

              </div>

            )}

            {/* -------------------------------------------------
                AUTRE FORMAT
            ------------------------------------------------- */}

            {!fichierEstImage &&
              !fichierEstPdf && (

                <div className="rounded-xl border border-base-200 bg-base-200/30 p-6 text-center">

                  <FileText
                    size={40}
                    className="mx-auto mb-3 text-base-content/40"
                  />

                  <p className="font-medium">
                    {fichierNom}
                  </p>

                  <a
                    href={fichierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary mt-4"
                  >
                    Consulter le fichier
                  </a>

                </div>

              )}

          </div>

        </div>

      )}

      {/* =====================================================
          UPLOAD / REMPLACER LE FICHIER
      ===================================================== */}

      <div className="card border border-base-200 bg-base-100 shadow-sm">

        <div className="card-body">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Upload size={20} />
            </div>

            <div>

              <h3 className="font-bold">
                Fichier d'imagerie
              </h3>

              <p className="text-sm text-base-content/60">
                Ajoutez un nouveau fichier ou remplacez le
                fichier actuellement enregistré.
              </p>

            </div>

          </div>

          <div className="divider my-2" />

          {/* =================================================
              ZONE UPLOAD
          ================================================= */}

          <label
            htmlFor="fichier-imagerie"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300 bg-base-200/20 px-6 py-10 text-center transition hover:border-primary hover:bg-primary/5"
          >

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-105">

              <Upload size={26} />

            </div>

            <p className="font-semibold">
              Cliquez pour sélectionner un fichier
            </p>

            <p className="mt-1 text-sm text-base-content/50">
              PDF, JPG, JPEG, PNG ou WEBP
            </p>

            <p className="mt-3 text-xs text-base-content/40">
              Taille maximale : 10 Mo
            </p>

            <input
              id="fichier-imagerie"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>

          {/* =================================================
              NOUVEAU FICHIER SÉLECTIONNÉ
          ================================================= */}

          {fichier && (

            <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">

                  <FileText size={19} />

                </div>

                <div className="min-w-0">

                  <p className="truncate font-medium">
                    {fichier.name}
                  </p>

                  <p className="text-xs text-base-content/50">
                    {formatFileSize(fichier.size)}
                  </p>

                  <p className="text-xs text-primary">
                    Nouveau fichier sélectionné
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-ghost text-error"
                onClick={supprimerFichier}
                disabled={loading}
              >
                <X size={16} />
                Supprimer
              </button>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          ACTION
      ===================================================== */}

      <div className="sticky bottom-4 z-10">

        <div className="flex flex-col gap-3 rounded-xl border border-base-200 bg-base-100/95 p-4 shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">

          <div>

            <p className="font-medium">
              Enregistrer le compte rendu
            </p>

            <p className="text-sm text-base-content/50">
              Vérifiez les informations avant l'enregistrement.
            </p>

          </div>

          <button
            type="submit"
            className="btn btn-primary min-w-52"
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer
              </>
            )}

          </button>

        </div>

      </div>

    </form>
  );
}