import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UtilisateurEditForm from "@/components/utilisateurs/UtilisateurEditForm";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   PAGE
========================================================= */

export default async function ModifierUtilisateurPage({
  params,
}: Props) {
  /* =======================================================
     AUTHENTIFICATION
  ======================================================= */

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /* =======================================================
     ID
  ======================================================= */

  const { id } = await params;

  const utilisateurId = Number(id);

  if (
    !Number.isInteger(utilisateurId) ||
    utilisateurId <= 0
  ) {
    notFound();
  }

  /* =======================================================
     RÉCUPÉRER UTILISATEUR
  ======================================================= */

  const utilisateur =
    await prisma.user.findUnique({
      where: {
        id: utilisateurId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        actif: true,
        roleId: true,
      },
    });

  if (!utilisateur) {
    notFound();
  }

  /* =======================================================
     RÉCUPÉRER LES RÔLES
  ======================================================= */

  const roles =
    await prisma.role.findMany({
      orderBy: {
        nom: "asc",
      },

      select: {
        id: true,
        nom: true,
      },
    });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="container mx-auto p-4 md:p-6">

      {/* HEADER */}

      <div className="mb-6">

        <div className="breadcrumbs text-sm mb-2">
          <ul>
            <li>
              <a href="/utilisateurs">
                Utilisateurs
              </a>
            </li>

            <li>
              Modifier
            </li>
          </ul>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">
          Modifier l'utilisateur
        </h1>

        <p className="text-base-content/60 mt-1">
          Modifiez les informations du compte utilisateur.
        </p>

      </div>

      {/* FORMULAIRE */}

      <UtilisateurEditForm
        utilisateur={utilisateur}
        roles={roles}
      />

    </div>
  );
}