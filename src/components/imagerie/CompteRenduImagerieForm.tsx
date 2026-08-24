"use client";

import { useState } from "react";

import {
  updateCompteRenduImagerie,
} from "@/app/actions/imagerie";

import {
  Save,
  Loader2,
  FileText,
} from "lucide-react";

import { toast } from "react-toastify";

type Props = {
  demande: any;
};

export default function CompteRenduImagerieForm({
  demande,
}: Props) {
  const [dateExamen, setDateExamen] =
    useState(
      demande.dateExamen
        ? new Date(
            demande.dateExamen,
          )
            .toISOString()
            .slice(0, 16)
        : "",
    );

  const [compteRendu, setCompteRendu] =
    useState(
      demande.compteRendu ?? "",
    );

  const [conclusion, setConclusion] =
    useState(
      demande.conclusion ?? "",
    );

  const [fichier, setFichier] =
    useState(
      demande.fichier ?? "",
    );

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const result =
        await updateCompteRenduImagerie(
          demande.id,
          {
            dateExamen,
            compteRendu,
            conclusion,
            fichier,
          },
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.message,
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        "Erreur lors de l'enregistrement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card bg-base-100 border border-base-200 shadow-sm"
    >
      <div className="card-body space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} />

            Compte rendu
          </h2>

          <p className="text-sm text-base-content/60">
            Saisissez les observations de
            l'examen d'imagerie.
          </p>
        </div>

        {/* DATE */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Date de l'examen
            </span>
          </label>

          <input
            type="datetime-local"
            className="input input-bordered"
            value={dateExamen}
            onChange={(e) =>
              setDateExamen(
                e.target.value,
              )
            }
          />
        </div>

        {/* COMPTE RENDU */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Compte rendu
            </span>
          </label>

          <textarea
            className="textarea textarea-bordered min-h-48"
            placeholder="Décrire les constatations radiologiques..."
            value={compteRendu}
            onChange={(e) =>
              setCompteRendu(
                e.target.value,
              )
            }
          />
        </div>

        {/* CONCLUSION */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Conclusion
            </span>
          </label>

          <textarea
            className="textarea textarea-bordered min-h-32"
            placeholder="Conclusion de l'examen..."
            value={conclusion}
            onChange={(e) =>
              setConclusion(
                e.target.value,
              )
            }
          />
        </div>

        {/* FICHIER */}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">
              Fichier
            </span>
          </label>

          <input
            type="text"
            className="input input-bordered"
            placeholder="/uploads/imagerie/resultat.pdf"
            value={fichier}
            onChange={(e) =>
              setFichier(
                e.target.value,
              )
            }
          />

          <label className="label">
            <span className="label-text-alt">
              Chemin ou URL du fichier
              d'imagerie.
            </span>
          </label>
        </div>

        {/* ACTION */}

        <div className="flex justify-end border-t border-base-200 pt-5">
          <button
            type="submit"
            className="btn btn-primary"
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

                Enregistrer le compte rendu
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}