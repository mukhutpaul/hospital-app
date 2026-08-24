import MedecinTable from "@/components/personnel/MedecinTable";
import { prisma } from "@/lib/prisma";

export default async function MedecinsPage() {
  const [
    medecins,
    services,
    specialites,
    roles,
  ] = await Promise.all([
    /* =====================================================
       MÉDECINS
    ===================================================== */

    prisma.medecin.findMany({
      include: {
        service: {
          select: {
            id: true,
            nom: true,
          },
        },

        specialite: {
          select: {
            id: true,
            nom: true,
          },
        },
      },

      orderBy: {
        nom: "asc",
      },
    }),

    /* =====================================================
       SERVICES
    ===================================================== */

    prisma.service.findMany({
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
    }),

    /* =====================================================
       SPÉCIALITÉS
    ===================================================== */

    prisma.specialite.findMany({
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
    }),

    /* =====================================================
       RÔLES
    ===================================================== */

    prisma.role.findMany({
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
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* ===================================================
          EN-TÊTE
      =================================================== */}

      <div>
        <h1 className="text-2xl font-bold">
          Médecins
        </h1>

        <p className="text-base-content/60">
          Gestion du personnel médical de l'hôpital
        </p>
      </div>

      {/* ===================================================
          TABLEAU DES MÉDECINS
      =================================================== */}

      <MedecinTable
        medecins={medecins}
        services={services}
        specialites={specialites}
        roles={roles}
      />
    </div>
  );
}