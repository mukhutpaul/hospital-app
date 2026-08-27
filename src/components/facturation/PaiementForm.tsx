"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createPaiement,
  getFacturesPourPaiement,
} from "@/app/actions/paiements";

import { useRouter } from "next/navigation";

export default function PaiementForm() {
  const router = useRouter();

  const [factures, setFactures] = useState<any[]>([]);
  const [factureId, setFactureId] = useState("");

  const [montant, setMontant] = useState("");

  const [modePaiement, setModePaiement] =
    useState("ESPECES");

  const [type, setType] =
    useState("ENCAISSEMENT");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingFactures, setLoadingFactures] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ======================================================
     CHARGEMENT FACTURES
  ====================================================== */

  useEffect(() => {
    async function load() {
      setLoadingFactures(true);

      const result =
        await getFacturesPourPaiement();

      if (result.success) {
        setFactures(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      }

      setLoadingFactures(false);
    }

    load();
  }, []);

  /* ======================================================
     FACTURE SELECTIONNEE
  ====================================================== */

  const facture = factures.find(
    (f) => String(f.id) === factureId
  );

  /* ======================================================
     MONTANT MAXIMUM
  ====================================================== */

  const reste = facture
    ? Number(facture.reste)
    : 0;

  /* ======================================================
     SUBMIT
  ====================================================== */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!facture) {
      setError("Veuillez sélectionner une facture.");
      return;
    }

    const montantNumber =
      Number(montant);

    if (
      !montantNumber ||
      montantNumber <= 0
    ) {
      setError(
        "Le montant doit être supérieur à zéro."
      );

      return;
    }

    if (montantNumber > reste) {
      setError(
        `Le montant ne peut pas dépasser ${reste.toFixed(
          2
        )} ${facture.devise}.`
      );

      return;
    }

    setLoading(true);

    const result = await createPaiement({
      factureId: facture.id,
      montant: montantNumber,
      modePaiement,
      type,
      description,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    router.push(
      `/paiements/${result.data.id}/recu`
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* ==================================================
          ERREUR
      ================================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* ==================================================
          FACTURE
      ================================================== */}

      <div className="card border border-base-300 bg-base-100 shadow-sm">

        <div className="card-body">

          <h2 className="card-title">
            Facture
          </h2>

          <div className="form-control">

            <label className="label">
              <span className="label-text">
                Facture *
              </span>
            </label>

            <select
              className="select select-bordered w-full"
              value={factureId}
              onChange={(e) => {
                setFactureId(e.target.value);

                const selected =
                  factures.find(
                    (f) =>
                      String(f.id) ===
                      e.target.value
                  );

                if (selected) {
                  setMontant(
                    String(
                      selected.reste
                    )
                  );
                }
              }}
              disabled={loadingFactures}
            >

              <option value="">
                {loadingFactures
                  ? "Chargement..."
                  : "Sélectionner une facture"}
              </option>

              {factures.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                >
                  {f.numero} —{" "}
                  {f.patient.nom}{" "}
                  {f.patient.postNom || ""}{" "}
                  {f.patient.prenom || ""} —{" "}
                  Reste :{" "}
                  {Number(f.reste).toFixed(2)}{" "}
                  {f.devise}
                </option>
              ))}

            </select>

          </div>

        </div>

      </div>

      {/* ==================================================
          INFORMATIONS PATIENT
      ================================================== */}

      {facture && (
        <div className="grid md:grid-cols-3 gap-4">

          <div className="card bg-base-100 border">
            <div className="card-body">
              <div className="text-sm opacity-60">
                Patient
              </div>

              <div className="font-bold">
                {facture.patient.nom}{" "}
                {facture.patient.postNom || ""}{" "}
                {facture.patient.prenom || ""}
              </div>

              <div className="text-sm">
                {facture.patient.numeroDossier}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border">
            <div className="card-body">
              <div className="text-sm opacity-60">
                Total facture
              </div>

              <div className="font-bold text-lg">
                {Number(
                  facture.montantTotal
                ).toFixed(2)}{" "}
                {facture.devise}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border">
            <div className="card-body">
              <div className="text-sm opacity-60">
                Reste à payer
              </div>

              <div className="font-bold text-lg text-error">
                {reste.toFixed(2)}{" "}
                {facture.devise}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================
          PAIEMENT
      ================================================== */}

      <div className="card border border-base-300 bg-base-100 shadow-sm">

        <div className="card-body">

          <h2 className="card-title">
            Encaissement
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* MONTANT */}

            <div className="form-control">

              <label className="label">
                <span className="label-text">
                  Montant *
                </span>
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                max={reste}
                className="input input-bordered w-full"
                value={montant}
                onChange={(e) =>
                  setMontant(
                    e.target.value
                  )
                }
              />

            </div>

            {/* MODE */}

            <div className="form-control">

              <label className="label">
                <span className="label-text">
                  Mode de paiement *
                </span>
              </label>

              <select
                className="select select-bordered"
                value={modePaiement}
                onChange={(e) =>
                  setModePaiement(
                    e.target.value
                  )
                }
              >
                <option value="ESPECES">
                  Espèces
                </option>

                <option value="CARTE">
                  Carte bancaire
                </option>

                <option value="VIREMENT">
                  Virement
                </option>

                <option value="MOBILE_MONEY">
                  Mobile Money
                </option>

                <option value="CHEQUE">
                  Chèque
                </option>
              </select>

            </div>

            {/* TYPE */}

            <div className="form-control">

              <label className="label">
                <span className="label-text">
                  Type
                </span>
              </label>

              <select
                className="select select-bordered"
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              >
                <option value="ENCAISSEMENT">
                  Encaissement
                </option>

                <option value="AVANCE">
                  Avance
                </option>

                <option value="SOLDE">
                  Solde
                </option>
              </select>

            </div>

            {/* DESCRIPTION */}

            <div className="form-control">

              <label className="label">
                <span className="label-text">
                  Description
                </span>
              </label>

              <input
                type="text"
                className="input input-bordered"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Observation..."
              />

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          BOUTONS
      ================================================== */}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            router.push("/paiements")
          }
        >
          Annuler
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Enregistrement..."
            : "Enregistrer le paiement"}
        </button>

      </div>

    </form>
  );
}