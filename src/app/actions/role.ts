"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type CreateRoleData = {
  nom: string;
  description?: string | null;
  actif: boolean;
};

export type UpdateRoleData = {
  id: number;
  nom: string;
  description?: string | null;
  actif: boolean;
};

/*
|--------------------------------------------------------------------------
| AUTHENTIFICATION
|--------------------------------------------------------------------------
*/

async function verifierAuthentification() {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false as const,
      message: "Vous devez être connecté.",
    };
  }

  return {
    success: true as const,
    session,
  };
}

/*
|--------------------------------------------------------------------------
| UTILITAIRE : ID UTILISATEUR CONNECTÉ
|--------------------------------------------------------------------------
*/

async function getCurrentUserId() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userId = Number(session.user.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

/*
|--------------------------------------------------------------------------
| RÔLES
|--------------------------------------------------------------------------
*/

/**
 * Récupérer tous les rôles
 */
export async function getRoles() {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const roles = await prisma.role.findMany({
      orderBy: {
        nom: "asc",
      },

      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    });

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error(
      "GET_ROLES_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les rôles.",
    };
  }
}

/**
 * Récupérer un rôle
 */
export async function getRoleById(id: number) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id,
        },

        include: {
          permissions: {
            include: {
              permission: true,
            },

            orderBy: {
              permission: {
                code: "asc",
              },
            },
          },

          _count: {
            select: {
              users: true,
            },
          },
        },
      });

    if (!role) {
      return {
        success: false,
        message: "Rôle introuvable.",
      };
    }

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    console.error(
      "GET_ROLE_BY_ID_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer le rôle.",
    };
  }
}

/**
 * Créer un rôle
 */
export async function createRole(
  data: CreateRoleData
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const nom =
      data.nom?.trim();

    const description =
      data.description?.trim() || null;

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom du rôle est obligatoire.",
      };
    }

    const existe =
      await prisma.role.findUnique({
        where: {
          nom,
        },
      });

    if (existe) {
      return {
        success: false,
        message:
          "Ce rôle existe déjà.",
      };
    }

    const role =
      await prisma.role.create({
        data: {
          nom,
          description,
          actif: Boolean(data.actif),
        },
      });

    revalidatePath("/roles");

    return {
      success: true,
      data: role,
      message:
        "Rôle créé avec succès.",
    };
  } catch (error) {
    console.error(
      "CREATE_ROLE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de créer le rôle.",
    };
  }
}

/**
 * Modifier un rôle
 */
export async function updateRole(
  data: UpdateRoleData
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(data.id) ||
      data.id <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    const nom =
      data.nom?.trim();

    const description =
      data.description?.trim() || null;

    if (!nom) {
      return {
        success: false,
        message:
          "Le nom du rôle est obligatoire.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id: data.id,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    const autreRole =
      await prisma.role.findFirst({
        where: {
          nom,

          NOT: {
            id: data.id,
          },
        },
      });

    if (autreRole) {
      return {
        success: false,
        message:
          "Ce nom de rôle est déjà utilisé.",
      };
    }

    const roleModifie =
      await prisma.role.update({
        where: {
          id: data.id,
        },

        data: {
          nom,
          description,
          actif: Boolean(
            data.actif
          ),
        },
      });

    revalidatePath("/roles");

    revalidatePath(
      `/roles/${data.id}`
    );

    revalidatePath(
      `/roles/${data.id}/permissions`
    );

    return {
      success: true,
      data: roleModifie,
      message:
        "Rôle modifié avec succès.",
    };
  } catch (error) {
    console.error(
      "UPDATE_ROLE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le rôle.",
    };
  }
}

/**
 * Activer / désactiver
 */
export async function toggleRole(
  id: number
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    const nouvelEtat =
      !role.actif;

    await prisma.role.update({
      where: {
        id,
      },

      data: {
        actif: nouvelEtat,
      },
    });

    revalidatePath("/roles");

    revalidatePath(
      `/roles/${id}`
    );

    return {
      success: true,
      actif: nouvelEtat,

      message: nouvelEtat
        ? "Rôle activé avec succès."
        : "Rôle désactivé avec succès.",
    };
  } catch (error) {
    console.error(
      "TOGGLE_ROLE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut du rôle.",
    };
  }
}

/**
 * Supprimer un rôle
 */
export async function deleteRole(
  id: number
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              users: true,
              permissions: true,
            },
          },
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    if (role._count.users > 0) {
      return {
        success: false,
        message:
          "Impossible de supprimer ce rôle car il est attribué à des utilisateurs.",
      };
    }

    await prisma.role.delete({
      where: {
        id,
      },
    });

    revalidatePath("/roles");

    return {
      success: true,
      message:
        "Rôle supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE_ROLE_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer le rôle.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/

/**
 * Toutes les permissions
 */
export async function getPermissions() {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    const permissions =
      await prisma.permission.findMany({
        orderBy: {
          code: "asc",
        },
      });

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error(
      "GET_PERMISSIONS_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les permissions.",
    };
  }
}

/**
 * Permissions d'un rôle
 */
export async function getRolePermissions(
  roleId: number
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    const permissions =
      await prisma.rolePermission.findMany({
        where: {
          roleId,
        },

        include: {
          permission: true,
        },

        orderBy: {
          permission: {
            code: "asc",
          },
        },
      });

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error(
      "GET_ROLE_PERMISSIONS_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les permissions du rôle.",
    };
  }
}

/**
 * Attribuer une permission
 */
export async function assignPermissionToRole(
  roleId: number,
  permissionId: number
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0 ||
      !Number.isInteger(permissionId) ||
      permissionId <= 0
    ) {
      return {
        success: false,
        message:
          "Le rôle et la permission sont obligatoires.",
      };
    }

    const role =
      await prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    const permission =
      await prisma.permission.findUnique({
        where: {
          id: permissionId,
        },
      });

    if (!permission) {
      return {
        success: false,
        message:
          "Permission introuvable.",
      };
    }

    const relation =
      await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });

    if (relation) {
      return {
        success: true,
        message:
          "La permission est déjà attribuée.",
      };
    }

    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    revalidatePath(
      `/roles/${roleId}/permissions`
    );

    revalidatePath(
      `/roles/${roleId}`
    );

    revalidatePath("/roles");

    return {
      success: true,
      message:
        "Permission attribuée avec succès.",
    };
  } catch (error) {
    console.error(
      "ASSIGN_PERMISSION_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible d'attribuer la permission.",
    };
  }
}

/**
 * Retirer une permission
 */
export async function removePermissionFromRole(
  roleId: number,
  permissionId: number
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0 ||
      !Number.isInteger(permissionId) ||
      permissionId <= 0
    ) {
      return {
        success: false,
        message:
          "Le rôle et la permission sont obligatoires.",
      };
    }

    const relation =
      await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });

    if (!relation) {
      return {
        success: false,
        message:
          "Cette permission n'est pas attribuée à ce rôle.",
      };
    }

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    revalidatePath(
      `/roles/${roleId}/permissions`
    );

    revalidatePath(
      `/roles/${roleId}`
    );

    revalidatePath("/roles");

    return {
      success: true,
      message:
        "Permission retirée avec succès.",
    };
  } catch (error) {
    console.error(
      "REMOVE_PERMISSION_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de retirer la permission.",
    };
  }
}

/**
 * Synchroniser toutes les permissions
 *
 * SQLite :
 * On n'utilise PAS skipDuplicates.
 */
export async function syncRolePermissions(
  roleId: number,
  permissionIds: number[]
) {
  try {
    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0
    ) {
      return {
        success: false,
        message:
          "L'identifiant du rôle est invalide.",
      };
    }

    /*
     * Nettoyer les IDs
     */
    const idsUniques = [
      ...new Set(
        permissionIds.filter(
          (id): id is number =>
            Number.isInteger(id) &&
            id > 0
        )
      ),
    ];

    /*
     * Vérifier le rôle
     */
    const role =
      await prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Rôle introuvable.",
      };
    }

    /*
     * Vérifier les permissions
     */
    if (idsUniques.length > 0) {
      const permissions =
        await prisma.permission.findMany({
          where: {
            id: {
              in: idsUniques,
            },
          },

          select: {
            id: true,
          },
        });

      const idsExistants =
        new Set(
          permissions.map(
            (permission) =>
              permission.id
          )
        );

      const idsInvalides =
        idsUniques.filter(
          (id) =>
            !idsExistants.has(id)
        );

      if (idsInvalides.length > 0) {
        return {
          success: false,
          message:
            "Une ou plusieurs permissions sélectionnées sont invalides.",
        };
      }
    }

    /*
     * TRANSACTION
     */
    await prisma.$transaction(
      async (tx) => {
        /*
         * Supprimer les anciennes
         */
        await tx.rolePermission.deleteMany({
          where: {
            roleId,
          },
        });

        /*
         * Ajouter les nouvelles
         */
        for (const permissionId of idsUniques) {
          await tx.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          });
        }
      }
    );

    revalidatePath(
      `/roles/${roleId}/permissions`
    );

    revalidatePath(
      `/roles/${roleId}`
    );

    revalidatePath("/roles");

    return {
      success: true,
      message:
        "Les permissions du rôle ont été mises à jour.",
    };
  } catch (error) {
    console.error(
      "SYNC_ROLE_PERMISSIONS_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de synchroniser les permissions.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| CONTRÔLE DES PERMISSIONS
|--------------------------------------------------------------------------
*/

/**
 * Vérifie si un utilisateur possède
 * une permission précise.
 *
 * Exemple :
 *
 * await hasPermission(
 *   userId,
 *   "PATIENT_CREATE"
 * );
 */
export async function hasPermission(
  userId: number,
  permissionCode: string
) {
  try {
    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return false;
    }

    const code =
      permissionCode.trim();

    if (!code) {
      return false;
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          actif: true,

          role: {
            select: {
              actif: true,

              permissions: {
                where: {
                  permission: {
                    code,
                  },
                },

                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      return false;
    }

    /*
     * Utilisateur désactivé
     */
    if (!user.actif) {
      return false;
    }

    /*
     * Pas de rôle
     */
    if (!user.role) {
      return false;
    }

    /*
     * Rôle désactivé
     */
    if (!user.role.actif) {
      return false;
    }

    /*
     * Permission trouvée
     */
    return (
      user.role.permissions.length > 0
    );
  } catch (error) {
    console.error(
      "HAS_PERMISSION_ERROR:",
      error
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| PERMISSIONS DE L'UTILISATEUR CONNECTÉ
|--------------------------------------------------------------------------
*/

/**
 * Récupérer toutes les permissions
 * de l'utilisateur actuellement connecté.
 */
export async function getCurrentUserPermissions() {
  try {
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message:
          "Utilisateur non authentifié.",
        data: [] as string[],
      };
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          actif: true,

          role: {
            select: {
              nom: true,
              actif: true,

              permissions: {
                select: {
                  permission: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!user) {
      return {
        success: false,
        message:
          "Utilisateur introuvable.",
        data: [] as string[],
      };
    }

    if (
      !user.actif ||
      !user.role ||
      !user.role.actif
    ) {
      return {
        success: true,
        data: [] as string[],
      };
    }

    const permissions =
      user.role.permissions.map(
        (item) =>
          item.permission.code
      );

    return {
      success: true,
      data: permissions,
      role: user.role.nom,
    };
  } catch (error) {
    console.error(
      "GET_CURRENT_USER_PERMISSIONS_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les permissions.",
      data: [] as string[],
    };
  }
}

/*
|--------------------------------------------------------------------------
| EXIGER UNE PERMISSION
|--------------------------------------------------------------------------
*/

/**
 * Utilitaire serveur.
 *
 * Si l'utilisateur possède la permission :
 *    retourne true
 *
 * Sinon :
 *    retourne false
 *
 * Exemple :
 *
 * const autorise =
 *   await requirePermission(
 *     "PATIENT_CREATE"
 *   );
 *
 * if (!autorise) {
 *   return {
 *     success: false,
 *     message: "Accès refusé.",
 *   };
 * }
 */
export async function requirePermission(
  permissionCode: string
) {
  try {
    const userId =
      await getCurrentUserId();

    if (!userId) {
      return false;
    }

    return await hasPermission(
      userId,
      permissionCode
    );
  } catch (error) {
    console.error(
      "REQUIRE_PERMISSION_ERROR:",
      error
    );

    return false;
  }
}