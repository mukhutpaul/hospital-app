"use client";

import { useMemo, useState } from "react";

import {
  AlertTriangle,
  CalendarClock,
  Package,
  Search,
  XCircle,
} from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

type Stock = {
  id: number;
  medicamentId: number;

  lot?: string | null;
  dateExpiration?: Date | string | null;
  quantite: number;

  medicament?: {
    id: number;
    code: string;
    nom: string;
    denomination?: string | null;
    forme?: string | null;
    dosage?: string | null;
    laboratoire?: string | null;
    categorie?: string | null;

    prixVente: number;
    prixAchat: number;
    devise: string;
    seuilAlerte: number;
    actif: boolean;
  } | null;
};

type Props = {
  stocks: Stock[];
};

/* ==========================================================
   COMPOSANT
========================================================== */

export default function InventairePageClient({
  stocks,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [filtre, setFiltre] =
    useState("TOUS");

  /* ========================================================
     DATE
  ======================================================== */

  const aujourdHui =
    new Date();

  const dans30Jours =
    new Date();

  dans30Jours.setDate(
    dans30Jours.getDate() + 30
  );

  /* ========================================================
     STOCK EN ALERTE
  ======================================================== */

  const stockAlerte = (
    stock: Stock
  ) => {
    const seuil =
      stock.medicament
        ?.seuilAlerte ?? 0;

    return (
      stock.quantite <= seuil
    );
  };

  /* ========================================================
     STOCK EXPIRÉ
  ======================================================== */

  const stockExpire = (
    stock: Stock
  ) => {
    if (
      !stock.dateExpiration
    ) {
      return false;
    }

    const date =
      new Date(
        stock.dateExpiration
      );

    return date < aujourdHui;
  };

  /* ========================================================
     STOCK EXPIRANT BIENTÔT
  ======================================================== */

  const stockExpireBientot = (
    stock: Stock
  ) => {
    if (
      !stock.dateExpiration
    ) {
      return false;
    }

    const date =
      new Date(
        stock.dateExpiration
      );

    return (
      date >= aujourdHui &&
      date <= dans30Jours
    );
  };

  /* ========================================================
     RECHERCHE + FILTRE
  ======================================================== */

  const stocksFiltres =
    useMemo(() => {
      return stocks.filter(
        (stock) => {
          const medicament =
            stock.medicament;

          const texte =
            search
              .toLowerCase()
              .trim();

          const correspondRecherche =
            !texte ||
            medicament?.nom
              ?.toLowerCase()
              .includes(texte) ||
            medicament?.code
              ?.toLowerCase()
              .includes(texte) ||
            medicament?.denomination
              ?.toLowerCase()
              .includes(texte) ||
            stock.lot
              ?.toLowerCase()
              .includes(texte);

          if (
            !correspondRecherche
          ) {
            return false;
          }

          switch (filtre) {
            case "ALERTE":
              return stockAlerte(
                stock
              );

            case "EXPIRE":
              return stockExpire(
                stock
              );

            case "EXPIRATION":
              return stockExpireBientot(
                stock
              );

            case "DISPONIBLE":
              return (
                stock.quantite > 0
              );

            case "RUPTURE":
              return (
                stock.quantite <= 0
              );

            default:
              return true;
          }
        }
      );
    }, [
      stocks,
      search,
      filtre,
    ]);

  /* ========================================================
     STATISTIQUES
  ======================================================== */

  const quantiteTotale =
    stocks.reduce(
      (total, stock) =>
        total + stock.quantite,
      0
    );

  const nombreStocks =
    stocks.length;

  const nombreAlertes =
    stocks.filter(
      stock =>
        stockAlerte(stock)
    ).length;

  const nombreExpires =
    stocks.filter(
      stock =>
        stockExpire(stock)
    ).length;

  const nombreExpiration =
    stocks.filter(
      stock =>
        stockExpireBientot(
          stock
        )
    ).length;

  /* ========================================================
     FORMAT DATE
  ======================================================== */

  const formatDate = (
    date?: Date | string | null
  ) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "fr-FR"
    ).format(
      new Date(date)
    );
  };

  /* ========================================================
     VALEUR DU STOCK
  ======================================================== */

  const valeurStock = (
    stock: Stock
  ) => {
    const prix =
      stock.medicament
        ?.prixAchat ?? 0;

    return (
      stock.quantite * prix
    );
  };

  /* ========================================================
     TOTAL VALEUR
  ======================================================== */

  const valeurTotale =
    stocks.reduce(
      (total, stock) =>
        total +
        valeurStock(stock),
      0
    );

  /* ========================================================
     RENDU
  ======================================================== */

  return (
    <div className="space-y-6">

      {/* ====================================================
          STATISTIQUES
      ==================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* STOCKS */}

        <div className="card bg-base-100 shadow">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Lots en stock
                </p>

                <p className="text-2xl font-bold">
                  {nombreStocks}
                </p>
              </div>

              <Package
                size={28}
                className="text-primary"
              />

            </div>

          </div>
        </div>

        {/* QUANTITÉ */}

        <div className="card bg-base-100 shadow">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Quantité totale
                </p>

                <p className="text-2xl font-bold">
                  {quantiteTotale}
                </p>
              </div>

              <Package
                size={28}
                className="text-success"
              />

            </div>

          </div>
        </div>

        {/* ALERTES */}

        <div className="card bg-base-100 shadow">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Stock faible
                </p>

                <p className="text-2xl font-bold text-warning">
                  {nombreAlertes}
                </p>
              </div>

              <AlertTriangle
                size={28}
                className="text-warning"
              />

            </div>

          </div>
        </div>

        {/* EXPIRÉS */}

        <div className="card bg-base-100 shadow">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Expirés
                </p>

                <p className="text-2xl font-bold text-error">
                  {nombreExpires}
                </p>
              </div>

              <XCircle
                size={28}
                className="text-error"
              />

            </div>

          </div>
        </div>

        {/* EXPIRATION */}

        <div className="card bg-base-100 shadow">
          <div className="card-body">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-base-content/60">
                  Expirent bientôt
                </p>

                <p className="text-2xl font-bold text-info">
                  {nombreExpiration}
                </p>
              </div>

              <CalendarClock
                size={28}
                className="text-info"
              />

            </div>

          </div>
        </div>

      </div>

      {/* ====================================================
          VALEUR
      ==================================================== */}

      <div className="alert alert-info">

        <Package size={22} />

        <div>
          <p className="font-semibold">
            Valeur estimée du stock
          </p>

          <p>
            {valeurTotale.toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}{" "}
            USD
          </p>
        </div>

      </div>

      {/* ====================================================
          RECHERCHE / FILTRES
      ==================================================== */}

      <div className="card bg-base-100 shadow">

        <div className="card-body">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* RECHERCHE */}

            <div>

              <label className="label">
                <span className="label-text font-semibold">
                  Rechercher
                </span>
              </label>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Nom, code, lot..."
                  className="input input-bordered w-full pl-10"
                />

              </div>

            </div>

            {/* FILTRE */}

            <div>

              <label className="label">
                <span className="label-text font-semibold">
                  Filtrer
                </span>
              </label>

              <select
                value={filtre}
                onChange={(e) =>
                  setFiltre(
                    e.target.value
                  )
                }
                className="select select-bordered w-full"
              >

                <option value="TOUS">
                  Tous les stocks
                </option>

                <option value="DISPONIBLE">
                  Disponibles
                </option>

                <option value="RUPTURE">
                  Rupture
                </option>

                <option value="ALERTE">
                  Stock faible
                </option>

                <option value="EXPIRATION">
                  Expirent bientôt
                </option>

                <option value="EXPIRE">
                  Expirés
                </option>

              </select>

            </div>

          </div>

        </div>

      </div>

      {/* ====================================================
          TABLEAU
      ==================================================== */}

      <div className="card bg-base-100 shadow">

        <div className="card-body">

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <h2 className="card-title">
              État de l'inventaire
            </h2>

            <span className="text-sm text-base-content/60">
              {stocksFiltres.length} résultat(s)
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="table table-zebra">

              <thead>

                <tr>

                  <th>
                    Médicament
                  </th>

                  <th>
                    Lot
                  </th>

                  <th>
                    Expiration
                  </th>

                  <th>
                    Quantité
                  </th>

                  <th>
                    Seuil
                  </th>

                  <th>
                    Prix achat
                  </th>

                  <th>
                    Valeur
                  </th>

                  <th>
                    État
                  </th>

                </tr>

              </thead>

              <tbody>

                {stocksFiltres.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-10 text-center text-base-content/60"
                    >
                      Aucun stock trouvé.
                    </td>

                  </tr>

                ) : (

                  stocksFiltres.map(
                    (stock) => {

                      const medicament =
                        stock.medicament;

                      const expire =
                        stockExpire(
                          stock
                        );

                      const expirationProche =
                        stockExpireBientot(
                          stock
                        );

                      const alerte =
                        stockAlerte(
                          stock
                        );

                      return (
                        <tr
                          key={
                            stock.id
                          }
                        >

                          {/* MÉDICAMENT */}

                          <td>

                            <div className="font-semibold">
                              {medicament?.nom ??
                                "—"}
                            </div>

                            <div className="text-xs text-base-content/60">
                              {medicament?.code ??
                                "—"}

                              {medicament?.dosage
                                ? ` • ${medicament.dosage}`
                                : ""}
                            </div>

                          </td>

                          {/* LOT */}

                          <td>
                            {stock.lot ||
                              "Sans lot"}
                          </td>

                          {/* EXPIRATION */}

                          <td>

                            <span
                              className={
                                expire
                                  ? "text-error font-semibold"
                                  : expirationProche
                                    ? "text-warning font-semibold"
                                    : ""
                              }
                            >
                              {formatDate(
                                stock.dateExpiration
                              )}
                            </span>

                          </td>

                          {/* QUANTITÉ */}

                          <td>

                            <span
                              className={
                                stock.quantite <=
                                0
                                  ? "font-bold text-error"
                                  : alerte
                                    ? "font-bold text-warning"
                                    : "font-semibold text-success"
                              }
                            >
                              {stock.quantite}
                            </span>

                          </td>

                          {/* SEUIL */}

                          <td>
                            {medicament?.seuilAlerte ??
                              0}
                          </td>

                          {/* PRIX */}

                          <td>
                            {(
                              medicament?.prixAchat ??
                              0
                            ).toLocaleString(
                              "fr-FR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}{" "}
                            {medicament?.devise ??
                              "USD"}
                          </td>

                          {/* VALEUR */}

                          <td>

                            {valeurStock(
                              stock
                            ).toLocaleString(
                              "fr-FR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}{" "}
                            {medicament?.devise ??
                              "USD"}

                          </td>

                          {/* ÉTAT */}

                          <td>

                            {expire ? (

                              <span className="badge badge-error">
                                Expiré
                              </span>

                            ) : expirationProche ? (

                              <span className="badge badge-warning">
                                Expire bientôt
                              </span>

                            ) : stock.quantite <=
                              0 ? (

                              <span className="badge badge-error">
                                Rupture
                              </span>

                            ) : alerte ? (

                              <span className="badge badge-warning">
                                Stock faible
                              </span>

                            ) : (

                              <span className="badge badge-success">
                                Disponible
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}