import EmployeTable from "@/components/personnel/EmployeTable";

import { getEmployes } from "@/app/actions/employes";
import { prisma } from "@/lib/prisma";

export default async function EmployesPage() {
  /* ==========================================================
     EMPLOYÉS
  ========================================================== */

  const employesResult = await getEmployes();

  const employes =
    employesResult.success &&
    Array.isArray(employesResult.data)
      ? employesResult.data
      : [];

  /* ==========================================================
     SERVICES
  ========================================================== */

  const services = await prisma.service.findMany({
    where: {
      actif: true,
    },

    select: {
      id: true,
      nom: true,
    },

    orderBy: {
      nom: "asc",
    },
  });

  /* ==========================================================
     RÔLES
  ========================================================== */

  const roles = await prisma.role.findMany({
    where: {
      actif: true,
    },

    select: {
      id: true,
      nom: true,
    },

    orderBy: {
      nom: "asc",
    },
  });

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Employés
        </h1>

        <p className="text-base-content/60">
          Gestion du personnel de l'hôpital
        </p>
      </div>

      {/* ======================================================
          TABLEAU
      ====================================================== */}

      <EmployeTable
        employes={employes}
        services={services}
        roles={roles}
      />
    </div>
  );
}