
import Link from "next/link";
import { prisma } from "@/lib/prisma";

import {
  requireHospitalisationPermission,
  hasHospitalisationPermission,
  type Role,
  type HospitalisationPermission,
} from "@/lib/authorization";

/* =========================================================
   PAGE DASHBOARD HOSPITALISATION
========================================================= */

export default async function HospitalisationDashboard() {
  /* =======================================================
     SÉCURITÉ
     L'utilisateur doit au minimum pouvoir consulter
     les hospitalisations.
  ======================================================= */

  const user = await requireHospitalisationPermission(
    "HOSPITALISATIONS_READ",
  );

  /* =======================================================
     RÔLE
  ======================================================= */

  const role = user.role as Role;

  /* =======================================================
     HELPER PERMISSION
  ======================================================= */

  const can = (
    permission: HospitalisationPermission,
  ): boolean => {
    return hasHospitalisationPermission(
      role,
      permission,
    );
  };

  /* =======================================================
     DATE DU JOUR
  ======================================================= */

  const maintenant = new Date();

  const debutJour = new Date(maintenant);
  debutJour.setHours(0, 0, 0, 0);

  const finJour = new Date(maintenant);
  finJour.setHours(23, 59, 59, 999);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const [
    hospitalisationsEnCours,
    litsLibres,
    litsOccupes,
    entreesAujourdHui,
    sortiesAujourdHui,
    chambresActives,
    soins,
    transferts,
  ] = await Promise.all([
    /* -------------------------------------------------------
       HOSPITALISATIONS
    ------------------------------------------------------- */

    can("HOSPITALISATIONS_READ")
      ? prisma.hospitalisation.count({
          where: {
            statut: "EN_COURS",
          },
        })
      : 0,

    /* -------------------------------------------------------
       LITS LIBRES
    ------------------------------------------------------- */

    can("LITS_READ")
      ? prisma.lit.count({
          where: {
            statut: "LIBRE",
          },
        })
      : 0,

    /* -------------------------------------------------------
       LITS OCCUPÉS
    ------------------------------------------------------- */

    can("LITS_READ")
      ? prisma.lit.count({
          where: {
            statut: "OCCUPE",
          },
        })
      : 0,

    /* -------------------------------------------------------
       ENTRÉES AUJOURD'HUI
    ------------------------------------------------------- */

    can("HOSPITALISATIONS_READ")
      ? prisma.hospitalisation.count({
          where: {
            dateEntree: {
              gte: debutJour,
              lte: finJour,
            },
          },
        })
      : 0,

    /* -------------------------------------------------------
       SORTIES AUJOURD'HUI
    ------------------------------------------------------- */

    can("SORTIES_READ")
      ? prisma.sortie.count({
          where: {
            dateSortie: {
              gte: debutJour,
              lte: finJour,
            },
          },
        })
      : 0,

    /* -------------------------------------------------------
       CHAMBRES ACTIVES
    ------------------------------------------------------- */

    can("CHAMBRES_READ")
      ? prisma.chambre.count({
          where: {
            actif: true,
          },
        })
      : 0,

    /* -------------------------------------------------------
       SOINS
    ------------------------------------------------------- */

    can("SOINS_READ")
      ? prisma.soin.count()
      : 0,

    /* -------------------------------------------------------
       TRANSFERTS
    ------------------------------------------------------- */

    can("TRANSFERTS_READ")
      ? prisma.transfert.count()
      : 0,
  ]);

  /* =======================================================
     CARTES STATISTIQUES
  ======================================================= */

  const cards = [
    can("HOSPITALISATIONS_READ") && {
      label: "Hospitalisés",
      value: hospitalisationsEnCours,
      color: "primary",
    },

    can("LITS_READ") && {
      label: "Lits libres",
      value: litsLibres,
      color: "success",
    },

    can("LITS_READ") && {
      label: "Lits occupés",
      value: litsOccupes,
      color: "warning",
    },

    can("HOSPITALISATIONS_READ") && {
      label: "Entrées aujourd'hui",
      value: entreesAujourdHui,
      color: "info",
    },

    can("SORTIES_READ") && {
      label: "Sorties aujourd'hui",
      value: sortiesAujourdHui,
      color: "secondary",
    },

    can("CHAMBRES_READ") && {
      label: "Chambres actives",
      value: chambresActives,
      color: "accent",
    },

    can("SOINS_READ") && {
      label: "Soins",
      value: soins,
      color: "primary",
    },

    can("TRANSFERTS_READ") && {
      label: "Transferts",
      value: transferts,
      color: "info",
    },
  ].filter(Boolean) as {
    label: string;
    value: number;
    color:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "info"
      | "accent";
  }[];

  /* =======================================================
     MENU
  ======================================================= */

  const menuItems = [
    can("HOSPITALISATIONS_READ") && {
      label: "Hospitalisations",
      href: "/hospitalisation/hospitalisations",
      className: "btn-primary",
    },

    can("CHAMBRES_READ") && {
      label: "Chambres",
      href: "/hospitalisation/chambres",
      className: "btn-outline",
    },

    can("LITS_READ") && {
      label: "Lits",
      href: "/hospitalisation/lits",
      className: "btn-outline",
    },

    can("SOINS_READ") && {
      label: "Soins",
      href: "/hospitalisation/soins",
      className: "btn-outline",
    },

    can("TRANSFERTS_READ") && {
      label: "Transferts",
      href: "/hospitalisation/transferts",
      className: "btn-outline",
    },

    can("SORTIES_READ") && {
      label: "Sorties",
      href: "/hospitalisation/sorties",
      className: "btn-outline",
    },
  ].filter(Boolean) as {
    label: string;
    href: string;
    className: string;
  }[];

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <main className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Hospitalisation
          </h1>

          <p className="mt-1 text-base-content/60">
            Gestion des hospitalisations, chambres, lits,
            soins, transferts et sorties.
          </p>
        </div>

        <div className="badge badge-primary badge-outline">
          {role}
        </div>
      </div>

      {/* ===================================================
          STATISTIQUES
      =================================================== */}

      {cards.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Vue d'ensemble
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="
                  rounded-2xl
                  border
                  border-base-300
                  bg-base-100
                  p-5
                  shadow-sm
                  transition
                  hover:shadow-md
                "
              >
                <p className="text-sm text-base-content/60">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {card.value.toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================
          MENU HOSPITALISATION
      =================================================== */}

      {menuItems.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Gestion hospitalisation
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`btn ${item.className} h-12`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================
          MESSAGE SI AUCUN MODULE
      =================================================== */}

      {cards.length === 0 && menuItems.length === 0 && (
        <div className="alert alert-info">
          <div>
            <h3 className="font-semibold">
              Aucun accès disponible
            </h3>

            <p className="text-sm">
              Votre rôle ne possède aucune permission
              pour le module hospitalisation.
            </p>
          </div>
        </div>
      )}

    </main>
  );
}

