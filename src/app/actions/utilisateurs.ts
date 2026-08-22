"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type CreateUtilisateurData = {
  name: string;
  email: string;
  telephone?: string | null;
  password: string;
  roleId: number;
  actif: boolean;
};

type UpdateUtilisateurData = {
  id: number;
  name: string;
  email: string;
  telephone?: string | null;
  roleId: number;
  actif: boolean;
  password?: string;
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
| CRÉER UN UTILISATEUR
|--------------------------------------------------------------------------
*/

export async function createUtilisateur(
  data: CreateUtilisateurData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    const authResult = await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALISATION
    |--------------------------------------------------------------------------
    */

    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const telephone =
      data.telephone?.trim() || null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    if (!email) {
      return {
        success: false,
        message:
          "L'adresse email est obligatoire.",
      };
    }

    if (!data.password) {
      return {
        success: false,
        message:
          "Le mot de passe est obligatoire.",
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        message:
          "Le mot de passe doit contenir au moins 8 caractères.",
      };
    }

    if (!data.roleId) {
      return {
        success: false,
        message: "Le rôle est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL EXISTANT
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return {
        success: false,
        message:
          "Cette adresse email est déjà utilisée.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VÉRIFIER LE RÔLE
    |--------------------------------------------------------------------------
    */

    const role =
      await prisma.role.findUnique({
        where: {
          id: data.roleId,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Le rôle sélectionné n'existe pas.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(data.password, 12);

    /*
    |--------------------------------------------------------------------------
    | CRÉATION
    |--------------------------------------------------------------------------
    */

    await prisma.user.create({
      data: {
        name,
        email,
        telephone,
        password: hashedPassword,
        roleId: data.roleId,
        actif: data.actif,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHIR
    |--------------------------------------------------------------------------
    */

    revalidatePath("/utilisateurs");

    return {
      success: true,
      message:
        "Utilisateur créé avec succès.",
    };
  } catch (error) {
    console.error(
      "CREATE_UTILISATEUR_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la création.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MODIFIER UN UTILISATEUR
|--------------------------------------------------------------------------
*/

export async function updateUtilisateur(
  data: UpdateUtilisateurData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION ID
    |--------------------------------------------------------------------------
    */

    if (!data.id) {
      return {
        success: false,
        message:
          "L'identifiant de l'utilisateur est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALISATION
    |--------------------------------------------------------------------------
    */

    const name = data.name?.trim();
    const email =
      data.email?.trim().toLowerCase();
    const telephone =
      data.telephone?.trim() || null;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    if (!email) {
      return {
        success: false,
        message:
          "L'adresse email est obligatoire.",
      };
    }

    if (!data.roleId) {
      return {
        success: false,
        message: "Le rôle est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | UTILISATEUR EXISTANT
    |--------------------------------------------------------------------------
    */

    const utilisateur =
      await prisma.user.findUnique({
        where: {
          id: data.id,
        },
      });

    if (!utilisateur) {
      return {
        success: false,
        message:
          "Utilisateur introuvable.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL UTILISÉ PAR UN AUTRE UTILISATEUR
    |--------------------------------------------------------------------------
    */

    const emailExiste =
      await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: data.id,
          },
        },
      });

    if (emailExiste) {
      return {
        success: false,
        message:
          "Cette adresse email est déjà utilisée par un autre utilisateur.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VÉRIFIER LE RÔLE
    |--------------------------------------------------------------------------
    */

    const role =
      await prisma.role.findUnique({
        where: {
          id: data.roleId,
        },
      });

    if (!role) {
      return {
        success: false,
        message:
          "Le rôle sélectionné n'existe pas.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | DONNÉES À MODIFIER
    |--------------------------------------------------------------------------
    */

    const updateData: {
      name: string;
      email: string;
      telephone: string | null;
      roleId: number;
      actif: boolean;
      password?: string;
    } = {
      name,
      email,
      telephone,
      roleId: data.roleId,
      actif: data.actif,
    };

    /*
    |--------------------------------------------------------------------------
    | MODIFIER LE PASSWORD SI FOURNI
    |--------------------------------------------------------------------------
    */

    if (
      data.password &&
      data.password.trim()
    ) {
      if (data.password.length < 8) {
        return {
          success: false,
          message:
            "Le mot de passe doit contenir au moins 8 caractères.",
        };
      }

      updateData.password =
        await bcrypt.hash(
          data.password,
          12
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHIR
    |--------------------------------------------------------------------------
    */

    revalidatePath("/utilisateurs");
    revalidatePath(
      `/utilisateurs/${data.id}`
    );
    revalidatePath(
      `/utilisateurs/${data.id}/modifier`
    );

    return {
      success: true,
      message:
        "Utilisateur modifié avec succès.",
    };
  } catch (error) {
    console.error(
      "UPDATE_UTILISATEUR_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la modification.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| ACTIVER / DÉSACTIVER UN UTILISATEUR
|--------------------------------------------------------------------------
*/

export async function toggleUtilisateur(
  id: number
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return {
        success: false,
        message:
          "L'identifiant de l'utilisateur est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | UTILISATEUR
    |--------------------------------------------------------------------------
    */

    const utilisateur =
      await prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!utilisateur) {
      return {
        success: false,
        message:
          "Utilisateur introuvable.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | INVERSER LE STATUT
    |--------------------------------------------------------------------------
    */

    const nouvelEtat =
      !utilisateur.actif;

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        actif: nouvelEtat,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHIR
    |--------------------------------------------------------------------------
    */

    revalidatePath("/utilisateurs");
    revalidatePath(`/utilisateurs/${id}`);

    return {
      success: true,
      actif: nouvelEtat,
      message: nouvelEtat
        ? "Utilisateur activé avec succès."
        : "Utilisateur désactivé avec succès.",
    };
  } catch (error) {
    console.error(
      "TOGGLE_UTILISATEUR_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut de l'utilisateur.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| SUPPRIMER UN UTILISATEUR
|--------------------------------------------------------------------------
*/

export async function deleteUtilisateur(
  id: number
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return {
        success: false,
        message:
          "L'identifiant de l'utilisateur est obligatoire.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | VÉRIFIER EXISTENCE
    |--------------------------------------------------------------------------
    */

    const utilisateur =
      await prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!utilisateur) {
      return {
        success: false,
        message:
          "Utilisateur introuvable.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPRESSION
    |--------------------------------------------------------------------------
    */

    await prisma.user.delete({
      where: {
        id,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHIR
    |--------------------------------------------------------------------------
    */

    revalidatePath("/utilisateurs");

    return {
      success: true,
      message:
        "Utilisateur supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE_UTILISATEUR_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer l'utilisateur. Il peut être lié à d'autres données.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| RÉINITIALISER LE MOT DE PASSE
|--------------------------------------------------------------------------
|
| Cette fonction reçoit un nouveau mot de passe.
| Le composant/modal peut demander le nouveau mot de passe
| à l'administrateur.
|
|--------------------------------------------------------------------------
*/

export async function resetUtilisateurPassword(
  id: number,
  newPassword: string
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTIFICATION
    |--------------------------------------------------------------------------
    */

    const authResult =
      await verifierAuthentification();

    if (!authResult.success) {
      return authResult;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return {
        success: false,
        message:
          "L'identifiant de l'utilisateur est obligatoire.",
      };
    }

    if (!newPassword) {
      return {
        success: false,
        message:
          "Le nouveau mot de passe est obligatoire.",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message:
          "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | UTILISATEUR
    |--------------------------------------------------------------------------
    */

    const utilisateur =
      await prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!utilisateur) {
      return {
        success: false,
        message:
          "Utilisateur introuvable.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | HASH
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    /*
    |--------------------------------------------------------------------------
    | UPDATE PASSWORD
    |--------------------------------------------------------------------------
    */

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RAFRAÎCHIR
    |--------------------------------------------------------------------------
    */

    revalidatePath("/utilisateurs");
    revalidatePath(`/utilisateurs/${id}`);

    return {
      success: true,
      message:
        "Le mot de passe a été réinitialisé avec succès.",
    };
  } catch (error) {
    console.error(
      "RESET_PASSWORD_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de réinitialiser le mot de passe.",
    };
  }
}