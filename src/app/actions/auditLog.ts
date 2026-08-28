"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
   TYPES
========================================================== */

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ==========================================================
   LISTE DES LOGS
========================================================== */

export async function getAuditLogs(params?: {
  search?: string;
  module?: string;
  action?: string;
  userId?: number;
  page?: number;
  limit?: number;
}): Promise<
  ActionResult<{
    logs: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>
> {
  try {
    const search = params?.search?.trim() || "";
    const module = params?.module?.trim() || "";
    const action = params?.action?.trim() || "";

    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));

    const skip = (page - 1) * limit;

    const where: any = {};

    /* ======================================================
       RECHERCHE
    ====================================================== */

    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
          },
        },
        {
          module: {
            contains: search,
          },
        },
        {
          tableName: {
            contains: search,
          },
        },
        {
          recordId: {
            contains: search,
          },
        },
        {
          ipAddress: {
            contains: search,
          },
        },
        {
          user: {
            name: {
              contains: search,
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
            },
          },
        },
      ];
    }

    if (module) {
      where.module = module;
    }

    if (action) {
      where.action = action;
    }

    if (params?.userId) {
      where.userId = params.userId;
    }

    /* ======================================================
       REQUÊTES
    ====================================================== */

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Journaux récupérés.",
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET AUDIT LOGS:", error);

    return {
      success: false,
      message: "Impossible de récupérer les journaux.",
    };
  }
}

/* ==========================================================
   DÉTAIL D'UN LOG
========================================================== */

export async function getAuditLogById(
  id: number
): Promise<ActionResult<any>> {
  try {
    const log = await prisma.auditLog.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
          },
        },
      },
    });

    if (!log) {
      return {
        success: false,
        message: "Journal introuvable.",
      };
    }

    return {
      success: true,
      message: "Journal récupéré.",
      data: log,
    };
  } catch (error) {
    console.error("GET AUDIT LOG:", error);

    return {
      success: false,
      message: "Impossible de récupérer le journal.",
    };
  }
}

/* ==========================================================
   CRÉER UN LOG
========================================================== */

export async function createAuditLog(data: {
  userId?: number | null;
  action: string;
  module: string;
  tableName?: string | null;
  recordId?: string | null;
  ancienneValeur?: string | null;
  nouvelleValeur?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<ActionResult<any>> {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,

        action: data.action.trim(),
        module: data.module.trim(),

        tableName:
          data.tableName?.trim() || null,

        recordId:
          data.recordId?.trim() || null,

        ancienneValeur:
          data.ancienneValeur || null,

        nouvelleValeur:
          data.nouvelleValeur || null,

        ipAddress:
          data.ipAddress?.trim() || null,

        userAgent:
          data.userAgent || null,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/audit-logs");

    return {
      success: true,
      message: "Journal créé.",
      data: log,
    };
  } catch (error) {
    console.error("CREATE AUDIT LOG:", error);

    return {
      success: false,
      message: "Impossible de créer le journal.",
    };
  }
}

/* ==========================================================
   SUPPRIMER UN LOG
========================================================== */

export async function deleteAuditLog(
  id: number
): Promise<ActionResult> {
  try {
    const existing = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Journal introuvable.",
      };
    }

    await prisma.auditLog.delete({
      where: {
        id,
      },
    });

    revalidatePath("/audit-logs");

    return {
      success: true,
      message: "Journal supprimé.",
    };
  } catch (error) {
    console.error("DELETE AUDIT LOG:", error);

    return {
      success: false,
      message: "Impossible de supprimer le journal.",
    };
  }
}

/* ==========================================================
   SUPPRIMER PLUSIEURS LOGS
========================================================== */

export async function deleteAuditLogs(
  ids: number[]
): Promise<ActionResult> {
  try {
    if (!ids.length) {
      return {
        success: false,
        message: "Aucun journal sélectionné.",
      };
    }

    await prisma.auditLog.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/audit-logs");

    return {
      success: true,
      message: `${ids.length} journal(s) supprimé(s).`,
    };
  } catch (error) {
    console.error("DELETE AUDIT LOGS:", error);

    return {
      success: false,
      message: "Impossible de supprimer les journaux.",
    };
  }
}

/* ==========================================================
   FILTRES
========================================================== */

export async function getAuditLogFilters(): Promise<
  ActionResult<{
    modules: string[];
    actions: string[];
    users: {
      id: number;
      name: string | null;
      email: string | null;
    }[];
  }>
> {
  try {
    const [modules, actions, users] =
      await Promise.all([
        prisma.auditLog.findMany({
          distinct: ["module"],
          select: {
            module: true,
          },
          orderBy: {
            module: "asc",
          },
        }),

        prisma.auditLog.findMany({
          distinct: ["action"],
          select: {
            action: true,
          },
          orderBy: {
            action: "asc",
          },
        }),

        prisma.user.findMany({
          where: {
            auditLogs: {
              some: {},
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          orderBy: {
            name: "asc",
          },
        }),
      ]);

    return {
      success: true,
      message: "Filtres récupérés.",
      data: {
        modules: modules.map((item) => item.module),
        actions: actions.map((item) => item.action),
        users,
      },
    };
  } catch (error) {
    console.error("AUDIT FILTERS:", error);

    return {
      success: false,
      message: "Impossible de récupérer les filtres.",
    };
  }
}