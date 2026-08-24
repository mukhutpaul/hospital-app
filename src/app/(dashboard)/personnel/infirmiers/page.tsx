import { prisma } from "@/lib/prisma";
import InfirmierTable from "@/components/personnel/InfirmierTable";

export default async function InfirmiersPage() {
  /* ==========================================================
     INFIRMIERS
  ========================================================== */

  const infirmiersData = await prisma.infirmier.findMany({
    include: {
      employe: true,
      service: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /* ==========================================================
     SERVICES
  ========================================================== */

  const services = await prisma.service.findMany({
    where: {
      actif: true,
    },
    orderBy: {
      nom: "asc",
    },
    select: {
      id: true,
      nom: true,
    },
  });

  /* ==========================================================
     RÔLES
  ========================================================== */

  const roles = await prisma.role.findMany({
    orderBy: {
      nom: "asc",
    },
    select: {
      id: true,
      nom: true,
    },
  });

  /* ==========================================================
     FORMAT INFIRMIERS
  ========================================================== */

  const infirmiers = infirmiersData.map((infirmier) => ({
    id: infirmier.id,
    matricule: infirmier.matricule,

    employeId: infirmier.employeId,

    /* EMPLOYÉ */
    nom: infirmier.employe?.nom ?? "",
    postNom: infirmier.employe?.postNom ?? null,
    prenom: infirmier.employe?.prenom ?? "",
    sexe: infirmier.employe?.sexe ?? null,
    telephone: infirmier.employe?.telephone ?? null,
    email: infirmier.employe?.email ?? null,
    dateEmbauche:
      infirmier.employe?.dateEmbauche ?? null,

    /* INFIRMIER */
    numeroOrdre: infirmier.numeroOrdre ?? null,
    grade: infirmier.grade ?? null,
    niveau: infirmier.niveau ?? null,
    fonction: infirmier.fonction ?? null,

    serviceId: infirmier.serviceId ?? null,

    /* COMPTE UTILISATEUR */
    userId: infirmier.userId ?? null,

    actif: infirmier.actif,

    createdAt: infirmier.createdAt,
    updatedAt: infirmier.updatedAt,
  }));

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="p-6 space-y-6">
      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Gestion des infirmiers
          </h1>

          <p className="text-base-content/60">
            Gérez les infirmiers de l&apos;hôpital.
          </p>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <InfirmierTable
        infirmiers={infirmiers}
        services={services}
        roles={roles}
      />
    </div>
  );
}