import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import UtilisateurTable from "./UtilisateurTable";

export default async function UtilisateursPage() {
  const session = await auth();

  // =========================================
  // AUTHENTIFICATION
  // =========================================

  if (!session?.user) {
    redirect("/login");
  }

  // =========================================
  // RÉCUPÉRATION DES UTILISATEURS
  // =========================================

  const utilisateurs = await prisma.user.findMany({
    include: {
      role: true,
      employe: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // =========================================
  // STATISTIQUES
  // =========================================

  const totalUtilisateurs = utilisateurs.length;

  const utilisateursActifs = utilisateurs.filter(
    (utilisateur) => utilisateur.actif
  ).length;

  const utilisateursInactifs = utilisateurs.filter(
    (utilisateur) => !utilisateur.actif
  ).length;

  const totalRoles = new Set(
    utilisateurs
      .map((utilisateur) => utilisateur.roleId)
      .filter(Boolean)
  ).size;

  // =========================================
  // PAGE
  // =========================================

  return (
    <main className="space-y-6">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Utilisateurs
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Gestion des comptes utilisateurs du système
          </p>
        </div>

        <Link
          href="/utilisateurs/nouveau"
          className="btn btn-primary"
        >
          <Plus size={18} />
          Nouvel utilisateur
        </Link>

      </div>

      {/* =====================================
          STATISTIQUES
      ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
          <div className="stat-title">
            Total utilisateurs
          </div>

          <div className="stat-value text-primary">
            {totalUtilisateurs}
          </div>

          <div className="stat-desc">
            Comptes enregistrés
          </div>
        </div>

        {/* ACTIFS */}

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
          <div className="stat-title">
            Utilisateurs actifs
          </div>

          <div className="stat-value text-success">
            {utilisateursActifs}
          </div>

          <div className="stat-desc">
            Comptes actifs
          </div>
        </div>

        {/* INACTIFS */}

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
          <div className="stat-title">
            Utilisateurs inactifs
          </div>

          <div className="stat-value text-error">
            {utilisateursInactifs}
          </div>

          <div className="stat-desc">
            Comptes désactivés
          </div>
        </div>

        {/* RÔLES */}

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
          <div className="stat-title">
            Rôles utilisés
          </div>

          <div className="stat-value text-info">
            {totalRoles}
          </div>

          <div className="stat-desc">
            Rôles attribués
          </div>
        </div>

      </div>

      {/* =====================================
          DATAGRID
      ===================================== */}

      <UtilisateurTable
        data={utilisateurs}
      />

    </main>
  );
}