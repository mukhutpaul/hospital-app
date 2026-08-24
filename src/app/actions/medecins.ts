"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/*
==========================================================
TYPE DES DONNÉES
==========================================================
*/

type MedecinData = {
  nom: string;
  postNom?: string;
  prenom: string;
  telephone?: string;
  email?: string;
  numeroOrdre?: string;
  serviceId?: number;
  specialiteId?: number;

  /*
  ========================================================
  COMPTE UTILISATEUR
  ========================================================
  */

  creerCompte?: boolean;
  emailCompte?: string;
  motDePasse?: string;
  roleId?: number;
};

type UpdateMedecinData = MedecinData & {
  matricule?: string;
  actif?: boolean;
};

/*
==========================================================
CHEMIN
==========================================================
*/

const MEDECINS_PATH = "/dashboard/personnel/medecins";

/*
==========================================================
GÉNÉRATION AUTOMATIQUE DU MATRICULE
==========================================================
*/

async function generateMedecinMatricule(
  tx: typeof prisma
): Promise<string> {
  const derniers = await tx.medecin.findMany({
    select: {
      matricule: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  let numero = 1;

  for (const medecin of derniers) {
    const match = medecin.matricule.match(/^MED-(\d+)$/);

    if (match) {
      const currentNumero = Number(match[1]);

      if (currentNumero >= numero) {
        numero = currentNumero + 1;
      }
    }
  }

  let matricule = `MED-${numero
    .toString()
    .padStart(4, "0")}`;

  /*
  Sécurité contre les doublons
  */

  while (
    await tx.medecin.findUnique({
      where: {
        matricule,
      },
    })
  ) {
    numero++;

    matricule = `MED-${numero
      .toString()
      .padStart(4, "0")}`;
  }

  return matricule;
}

/*
==========================================================
CRÉER UN MÉDECIN
==========================================================
*/

export async function createMedecin(
  data: MedecinData
) {
  try {
    /*
    ======================================================
    VALIDATIONS
    ======================================================
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    if (!data.prenom?.trim()) {
      return {
        success: false,
        message: "Le prénom est obligatoire.",
      };
    }

    /*
    ======================================================
    VALIDATION DU SERVICE
    ======================================================
    */

    if (data.serviceId) {
      const service = await prisma.service.findUnique({
        where: {
          id: data.serviceId,
        },
      });

      if (!service) {
        return {
          success: false,
          message: "Le service sélectionné est introuvable.",
        };
      }
    }

    /*
    ======================================================
    VALIDATION DE LA SPÉCIALITÉ
    ======================================================
    */

    if (data.specialiteId) {
      const specialite =
        await prisma.specialite.findUnique({
          where: {
            id: data.specialiteId,
          },
        });

      if (!specialite) {
        return {
          success: false,
          message:
            "La spécialité sélectionnée est introuvable.",
        };
      }
    }

    /*
    ======================================================
    VALIDATION DU COMPTE UTILISATEUR
    ======================================================
    */

    if (data.creerCompte) {
      if (!data.emailCompte?.trim()) {
        return {
          success: false,
          message:
            "L'adresse email du compte utilisateur est obligatoire.",
        };
      }

      if (!data.motDePasse) {
        return {
          success: false,
          message:
            "Le mot de passe du compte utilisateur est obligatoire.",
        };
      }

      if (data.motDePasse.length < 6) {
        return {
          success: false,
          message:
            "Le mot de passe doit contenir au moins 6 caractères.",
        };
      }

      /*
      Vérifier que l'email n'existe pas
      */

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: data.emailCompte
              .trim()
              .toLowerCase(),
          },
        });

      if (existingUser) {
        return {
          success: false,
          message:
            "Un utilisateur avec cette adresse email existe déjà.",
        };
      }

      /*
      Vérifier le rôle
      */

      if (data.roleId) {
        const role = await prisma.role.findUnique({
          where: {
            id: data.roleId,
          },
        });

        if (!role) {
          return {
            success: false,
            message: "Le rôle sélectionné est introuvable.",
          };
        }
      }
    }

    /*
    ======================================================
    TRANSACTION
    ======================================================

    On crée :

    1. User si creerCompte = true
    2. Medecin

    dans une seule transaction.
    */

    const result = await prisma.$transaction(
      async (tx) => {
        /*
        ----------------------------------------------
        MATRICULE
        ----------------------------------------------
        */

        const matricule =
          await generateMedecinMatricule(tx);

        /*
        ----------------------------------------------
        COMPTE UTILISATEUR
        ----------------------------------------------
        */

        let userId: number | undefined;

        if (data.creerCompte) {
          const hashedPassword =
            await bcrypt.hash(
              data.motDePasse!,
              12
            );

          const user = await tx.user.create({
            data: {
              name:
                `${data.nom.trim()} ${
                  data.postNom?.trim() || ""
                } ${data.prenom.trim()}`.trim(),

              email:
                data.emailCompte
                  ?.trim()
                  .toLowerCase(),

              password: hashedPassword,

              telephone:
                data.telephone?.trim() || null,

              actif: true,

              ...(data.roleId
                ? {
                    role: {
                      connect: {
                        id: data.roleId,
                      },
                    },
                  }
                : {}),
            },
          });

          userId = user.id;
        }

        /*
        ----------------------------------------------
        CRÉATION DU MÉDECIN
        ----------------------------------------------
        */

        const medecin =
          await tx.medecin.create({
            data: {
              matricule,

              nom: data.nom.trim(),

              postNom:
                data.postNom?.trim() || null,

              prenom:
                data.prenom.trim(),

              telephone:
                data.telephone?.trim() || null,

              email:
                data.email?.trim() || null,

              numeroOrdre:
                data.numeroOrdre?.trim() || null,

              actif: true,

              /*
              Compte utilisateur
              */

              ...(userId
                ? {
                    user: {
                      connect: {
                        id: userId,
                      },
                    },
                  }
                : {}),

              /*
              Service
              */

              ...(data.serviceId
                ? {
                    service: {
                      connect: {
                        id: data.serviceId,
                      },
                    },
                  }
                : {}),

              /*
              Spécialité
              */

              ...(data.specialiteId
                ? {
                    specialite: {
                      connect: {
                        id: data.specialiteId,
                      },
                    },
                  }
                : {}),
            },

            include: {
              user: {
                include: {
                  role: true,
                },
              },

              service: true,

              specialite: true,
            },
          });

        return medecin;
      }
    );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(MEDECINS_PATH);

    /*
    ======================================================
    SUCCÈS
    ======================================================
    */

    return {
      success: true,
      data: result,

      message: data.creerCompte
        ? `Médecin et compte utilisateur enregistrés avec succès. Matricule : ${result.matricule}`
        : `Médecin enregistré avec succès. Matricule : ${result.matricule}`,
    };
  } catch (error) {
    console.error(
      "CREATE MEDECIN:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la création du médecin.",
    };
  }
}

/*
==========================================================
MODIFIER UN MÉDECIN
==========================================================
*/

export async function updateMedecin(
  id: number,
  data: UpdateMedecinData
) {
  try {
    /*
    ======================================================
    RECHERCHE
    ======================================================
    */

    const existingMedecin =
      await prisma.medecin.findUnique({
        where: {
          id,
        },

        include: {
          user: true,
        },
      });

    if (!existingMedecin) {
      return {
        success: false,
        message: "Médecin introuvable.",
      };
    }

    /*
    ======================================================
    VALIDATION
    ======================================================
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    if (!data.prenom?.trim()) {
      return {
        success: false,
        message: "Le prénom est obligatoire.",
      };
    }

    /*
    ======================================================
    VALIDATION SERVICE
    ======================================================
    */

    if (data.serviceId) {
      const service =
        await prisma.service.findUnique({
          where: {
            id: data.serviceId,
          },
        });

      if (!service) {
        return {
          success: false,
          message:
            "Le service sélectionné est introuvable.",
        };
      }
    }

    /*
    ======================================================
    VALIDATION SPÉCIALITÉ
    ======================================================
    */

    if (data.specialiteId) {
      const specialite =
        await prisma.specialite.findUnique({
          where: {
            id: data.specialiteId,
          },
        });

      if (!specialite) {
        return {
          success: false,
          message:
            "La spécialité sélectionnée est introuvable.",
        };
      }
    }

    /*
    ======================================================
    TRANSACTION
    ======================================================
    */

    const medecin =
      await prisma.$transaction(
        async (tx) => {
          /*
          ----------------------------------------------
          MODIFICATION DU COMPTE UTILISATEUR
          ----------------------------------------------
          */

          if (
            existingMedecin.userId &&
            existingMedecin.user
          ) {
            const userData: any = {
              name:
                `${data.nom.trim()} ${
                  data.postNom?.trim() || ""
                } ${data.prenom.trim()}`.trim(),

              telephone:
                data.telephone?.trim() || null,
            };

            /*
            Email du compte uniquement
            si fourni explicitement.
            */

            if (data.emailCompte?.trim()) {
              const email =
                data.emailCompte
                  .trim()
                  .toLowerCase();

              const emailUser =
                await tx.user.findUnique({
                  where: {
                    email,
                  },
                });

              if (
                emailUser &&
                emailUser.id !==
                  existingMedecin.userId
              ) {
                throw new Error(
                  "EMAIL_USER_EXISTS"
                );
              }

              userData.email = email;
            }

            /*
            Nouveau mot de passe
            */

            if (data.motDePasse) {
              if (
                data.motDePasse.length < 6
              ) {
                throw new Error(
                  "PASSWORD_TOO_SHORT"
                );
              }

              userData.password =
                await bcrypt.hash(
                  data.motDePasse,
                  12
                );
            }

            /*
            Nouveau rôle
            */

            if (data.roleId) {
              const role =
                await tx.role.findUnique({
                  where: {
                    id: data.roleId,
                  },
                });

              if (!role) {
                throw new Error(
                  "ROLE_NOT_FOUND"
                );
              }

              userData.role = {
                connect: {
                  id: data.roleId,
                },
              };
            }

            await tx.user.update({
              where: {
                id: existingMedecin.userId,
              },

              data: userData,
            });
          }

          /*
          ----------------------------------------------
          MODIFICATION DU MÉDECIN
          ----------------------------------------------
          */

          return await tx.medecin.update({
            where: {
              id,
            },

            data: {
              /*
              Le matricule reste inchangé.
              */

              nom:
                data.nom.trim(),

              postNom:
                data.postNom?.trim() || null,

              prenom:
                data.prenom.trim(),

              telephone:
                data.telephone?.trim() || null,

              email:
                data.email?.trim() || null,

              numeroOrdre:
                data.numeroOrdre?.trim() || null,

              serviceId:
                data.serviceId || null,

              specialiteId:
                data.specialiteId || null,

              actif:
                data.actif ??
                existingMedecin.actif,
            },

            include: {
              user: {
                include: {
                  role: true,
                },
              },

              service: true,

              specialite: true,
            },
          });
        }
      );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(MEDECINS_PATH);

    return {
      success: true,
      data: medecin,
      message:
        "Médecin modifié avec succès.",
    };
  } catch (error: any) {
    console.error(
      "UPDATE MEDECIN:",
      error
    );

    if (
      error?.message ===
      "EMAIL_USER_EXISTS"
    ) {
      return {
        success: false,
        message:
          "Cette adresse email est déjà utilisée par un autre utilisateur.",
      };
    }

    if (
      error?.message ===
      "PASSWORD_TOO_SHORT"
    ) {
      return {
        success: false,
        message:
          "Le mot de passe doit contenir au moins 6 caractères.",
      };
    }

    if (
      error?.message ===
      "ROLE_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "Le rôle sélectionné est introuvable.",
      };
    }

    return {
      success: false,
      message:
        "Impossible de modifier le médecin.",
    };
  }
}

/*
==========================================================
SUPPRIMER UN MÉDECIN
==========================================================
*/

export async function deleteMedecin(
  id: number
) {
  try {
    const medecin =
      await prisma.medecin.findUnique({
        where: {
          id,
        },

        include: {
          user: true,
        },
      });

    if (!medecin) {
      return {
        success: false,
        message: "Médecin introuvable.",
      };
    }

    /*
    ======================================================
    TRANSACTION
    ======================================================
    */

    await prisma.$transaction(
      async (tx) => {
        /*
        Supprimer le médecin.
        */

        await tx.medecin.delete({
          where: {
            id,
          },
        });

        /*
        Supprimer le compte utilisateur
        associé s'il existe.
        */

        if (medecin.userId) {
          await tx.user.delete({
            where: {
              id: medecin.userId,
            },
          });
        }
      }
    );

    revalidatePath(MEDECINS_PATH);

    return {
      success: true,
      message:
        "Médecin et compte utilisateur supprimés avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE MEDECIN:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer ce médecin. Il est peut-être déjà utilisé dans le système.",
    };
  }
}

/*
==========================================================
ACTIVER / DÉSACTIVER UN MÉDECIN
==========================================================
*/

export async function toggleMedecin(
  id: number
) {
  try {
    const medecin =
      await prisma.medecin.findUnique({
        where: {
          id,
        },

        include: {
          user: true,
        },
      });

    if (!medecin) {
      return {
        success: false,
        message: "Médecin introuvable.",
      };
    }

    const nouveauStatut =
      !medecin.actif;

    /*
    ======================================================
    SYNCHRONISER MÉDECIN + USER
    ======================================================
    */

    await prisma.$transaction(
      async (tx) => {
        await tx.medecin.update({
          where: {
            id,
          },

          data: {
            actif: nouveauStatut,
          },
        });

        /*
        Si le médecin possède un compte,
        son compte suit son statut.
        */

        if (medecin.userId) {
          await tx.user.update({
            where: {
              id: medecin.userId,
            },

            data: {
              actif: nouveauStatut,
            },
          });
        }
      }
    );

    revalidatePath(MEDECINS_PATH);

    return {
      success: true,

      message: nouveauStatut
        ? "Médecin et compte utilisateur activés."
        : "Médecin et compte utilisateur désactivés.",
    };
  } catch (error) {
    console.error(
      "TOGGLE MEDECIN:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut du médecin.",
    };
  }
}