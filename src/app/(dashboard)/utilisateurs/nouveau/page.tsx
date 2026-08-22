import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UtilisateurForm from "@/components/utilisateurs/UtilisateurForm";


export default async function NouveauUtilisateurPage() {
  // =========================================
  // AUTHENTIFICATION
  // =========================================

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // =========================================
  // RÉCUPÉRER LES RÔLES
  // =========================================

  const roles = await prisma.role.findMany({
    orderBy: {
      nom: "asc",
    },
  });

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
          <div className="flex items-center gap-2 mb-3">

            <Link
              href="/utilisateurs"
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft size={17} />
              Retour
            </Link>

          </div>

          <h1 className="text-2xl font-bold">
            Nouvel utilisateur
          </h1>

          <p className="text-sm text-base-content/60 mt-1">
            Créer un nouveau compte utilisateur
          </p>
        </div>

      </div>

      {/* =====================================
          FORMULAIRE
      ===================================== */}

      <UtilisateurForm
        roles={roles}
      />

    </main>
  );
}