"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/*
==========================================================
TYPES DES DONNÉES
==========================================================
*/

export type InfirmierData = {
  nom: string;
  postNom?: string;
  prenom: string;

  sexe?: string;
  telephone?: string;
  email?: string;

  fonction?: string;
  dateEmbauche?: string;

  numeroOrdre?: string;
  grade?: string;
  niveau?: string;

  serviceId?: number;

  /*
  ========================================================
  COMPTE UTILISATEUR
  ========================================================
  */

  creerCompte?: boolean;

  userEmail?: string;
  userPassword?: string;

  roleId?: number;
};

export type UpdateInfirmierData = InfirmierData & {
  actif?: boolean;
};

/*
==========================================================
CHEMIN DE LA PAGE
==========================================================
*/

const INFIRMIERS_PATH = "/personnel/infirmiers";

/*
==========================================================
GÉNÉRATION AUTOMATIQUE DU MATRICULE

Format :

INF-0001
INF-0002
INF-0003
...

Le matricule est généré uniquement lors de la création.
==========================================================
*/

async function generateInfirmierMatricule(tx: any): Promise<string> {
  const derniersInfirmiers =
    await tx.infirmier.findMany({
      select: {
        matricule: true,
      },

      orderBy: {
        id: "desc",
      },
    });

  let numero = 1;

  for (const infirmier of derniersInfirmiers) {
    const match =
      infirmier.matricule.match(/^INF-(\d+)$/);

    if (match) {
      const currentNumero = Number(match[1]);

      if (currentNumero >= numero) {
        numero = currentNumero + 1;
      }
    }
  }

  let matricule = `INF-${numero
    .toString()
    .padStart(4, "0")}`;

  /*
  ========================================================
  SÉCURITÉ SUPPLÉMENTAIRE
  ========================================================
  */

  while (
    await tx.infirmier.findUnique({
      where: {
        matricule,
      },
    })
  ) {
    numero++;

    matricule = `INF-${numero
      .toString()
      .padStart(4, "0")}`;
  }

  return matricule;
}

/*
==========================================================
CRÉER UN INFIRMIER
==========================================================
*/

export async function createInfirmier(
  data: InfirmierData
) {
  try {
    /*
    ======================================================
    VALIDATION NOM
    ======================================================
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message: "Le nom est obligatoire.",
      };
    }

    /*
    ======================================================
    VALIDATION PRÉNOM
    ======================================================
    */

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
    VALIDATION COMPTE UTILISATEUR
    ======================================================
    */

    if (data.creerCompte) {
      /*
      ----------------------------------------------
      EMAIL
      ----------------------------------------------
      */

      if (!data.userEmail?.trim()) {
        return {
          success: false,
          message:
            "L'adresse email du compte utilisateur est obligatoire.",
        };
      }

      /*
      ----------------------------------------------
      MOT DE PASSE
      ----------------------------------------------
      */

      if (!data.userPassword?.trim()) {
        return {
          success: false,
          message:
            "Le mot de passe du compte utilisateur est obligatoire.",
        };
      }

      if (data.userPassword.length < 6) {
        return {
          success: false,
          message:
            "Le mot de passe doit contenir au moins 6 caractères.",
        };
      }

      /*
      ----------------------------------------------
      VÉRIFIER SI L'EMAIL EXISTE
      ----------------------------------------------
      */

      const userEmail =
        data.userEmail.trim().toLowerCase();

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: userEmail,
          },
        });

      if (existingUser) {
        return {
          success: false,
          message:
            "Cette adresse email est déjà utilisée par un compte utilisateur.",
        };
      }

      /*
      ----------------------------------------------
      VÉRIFIER LE ROLE
      ----------------------------------------------
      */

      if (data.roleId) {
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
              "Le rôle sélectionné est introuvable.",
          };
        }
      }
    }

    /*
    ======================================================
    DATE D'EMBAUCHE
    ======================================================
    */

    let dateEmbauche: Date | null = null;

    if (data.dateEmbauche) {
      dateEmbauche = new Date(
        data.dateEmbauche
      );

      if (
        Number.isNaN(
          dateEmbauche.getTime()
        )
      ) {
        return {
          success: false,
          message:
            "La date d'embauche est invalide.",
        };
      }
    }

    /*
    ======================================================
    TRANSACTION
    ======================================================
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
          ================================================
          MATRICULE
          ================================================
          */

          const matricule =
            await generateInfirmierMatricule(
              tx
            );

          /*
          ================================================
          CRÉER L'EMPLOYÉ
          ================================================
          */

          const employe =
            await tx.employe.create({
              data: {
                matricule,

                nom: data.nom.trim(),

                postNom:
                  data.postNom?.trim() ||
                  null,

                prenom:
                  data.prenom.trim(),

                sexe:
                  data.sexe?.trim() ||
                  null,

                telephone:
                  data.telephone?.trim() ||
                  null,

                email:
                  data.email?.trim() ||
                  null,

                fonction:
                  data.fonction?.trim() ||
                  null,

                dateEmbauche,

                actif: true,

                ...(data.serviceId
                  ? {
                      service: {
                        connect: {
                          id: data.serviceId,
                        },
                      },
                    }
                  : {}),
              },
            });

          /*
          ================================================
          CRÉER LE COMPTE USER
          ================================================
          */

          let userId:
            | number
            | undefined;

          if (data.creerCompte) {
            /*
            ----------------------------------------------
            HASH DU MOT DE PASSE
            ----------------------------------------------
            */

            const passwordHash =
              await bcrypt.hash(
                data.userPassword!,
                12
              );

            /*
            ----------------------------------------------
            CRÉATION USER
            ----------------------------------------------
            */

            const user =
              await tx.user.create({
                data: {
                  name: `${data.nom.trim()} ${data.prenom.trim()}`,

                  email:
                    data.userEmail!
                      .trim()
                      .toLowerCase(),

                  password:
                    passwordHash,

                  telephone:
                    data.telephone?.trim() ||
                    null,

                  actif: true,

                  /*
                  ----------------------------------------
                  ROLE
                  ----------------------------------------
                  */

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

            /*
            ----------------------------------------------
            LIER USER À EMPLOYÉ
            ----------------------------------------------
            */

            await tx.employe.update({
              where: {
                id: employe.id,
              },

              data: {
                user: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });
          }

          /*
          ================================================
          CRÉER L'INFIRMIER
          ================================================
          */

          const infirmier =
            await tx.infirmier.create({
              data: {
                matricule,

                numeroOrdre:
                  data.numeroOrdre?.trim() ||
                  null,

                grade:
                  data.grade?.trim() ||
                  null,

                niveau:
                  data.niveau?.trim() ||
                  null,

                fonction:
                  data.fonction?.trim() ||
                  null,

                actif: true,

                /*
                ------------------------------------------
                RELATION EMPLOYÉ
                ------------------------------------------
                */

                employe: {
                  connect: {
                    id: employe.id,
                  },
                },

                /*
                ------------------------------------------
                RELATION SERVICE
                ------------------------------------------
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
                ------------------------------------------
                RELATION USER
                ------------------------------------------
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
              },

              include: {
                employe: true,

                service: true,

                user: {
                  include: {
                    role: true,
                  },
                },
              },
            });

          return infirmier;
        }
      );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(
      INFIRMIERS_PATH
    );

    /*
    ======================================================
    RÉPONSE
    ======================================================
    */

    return {
      success: true,

      data: result,

      message: data.creerCompte
        ? `Infirmier et compte utilisateur créés avec succès. Matricule : ${result.matricule}`
        : `Infirmier enregistré avec succès. Matricule : ${result.matricule}`,
    };
  } catch (error) {
    console.error(
      "CREATE INFIRMIER:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de l'infirmier.",
    };
  }
}

/*
==========================================================
MODIFIER UN INFIRMIER
==========================================================

Le matricule ne change jamais.
==========================================================
*/

export async function updateInfirmier(
  id: number,
  data: UpdateInfirmierData
) {
  try {
    /*
    ======================================================
    RECHERCHER L'INFIRMIER
    ======================================================
    */

    const existing =
      await prisma.infirmier.findUnique({
        where: {
          id,
        },

        include: {
          employe: true,

          service: true,

          user: {
            include: {
              role: true,
            },
          },
        },
      });

    if (!existing) {
      return {
        success: false,
        message:
          "Infirmier introuvable.",
      };
    }

    /*
    ======================================================
    VALIDATION NOM
    ======================================================
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message:
          "Le nom est obligatoire.",
      };
    }

    /*
    ======================================================
    VALIDATION PRÉNOM
    ======================================================
    */

    if (!data.prenom?.trim()) {
      return {
        success: false,
        message:
          "Le prénom est obligatoire.",
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
    DATE D'EMBAUCHE
    ======================================================
    */

    let dateEmbauche:
      | Date
      | null = null;

    if (data.dateEmbauche) {
      dateEmbauche = new Date(
        data.dateEmbauche
      );

      if (
        Number.isNaN(
          dateEmbauche.getTime()
        )
      ) {
        return {
          success: false,
          message:
            "La date d'embauche est invalide.",
        };
      }
    }

    /*
    ======================================================
    TRANSACTION
    ======================================================
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
          ================================================
          MODIFIER EMPLOYÉ
          ================================================
          */

          await tx.employe.update({
            where: {
              id: existing.employeId,
            },

            data: {
              nom:
                data.nom.trim(),

              postNom:
                data.postNom?.trim() ||
                null,

              prenom:
                data.prenom.trim(),

              sexe:
                data.sexe?.trim() ||
                null,

              telephone:
                data.telephone?.trim() ||
                null,

              email:
                data.email?.trim() ||
                null,

              fonction:
                data.fonction?.trim() ||
                null,

              dateEmbauche,

              actif:
                data.actif ??
                existing.actif,

              ...(data.serviceId
                ? {
                    service: {
                      connect: {
                        id: data.serviceId,
                      },
                    },
                  }
                : {
                    service: {
                      disconnect: true,
                    },
                  }),
            },
          });

          /*
          ================================================
          MODIFIER INFIRMIER
          ================================================
          */

          const infirmier =
            await tx.infirmier.update({
              where: {
                id,
              },

              data: {
                numeroOrdre:
                  data.numeroOrdre?.trim() ||
                  null,

                grade:
                  data.grade?.trim() ||
                  null,

                niveau:
                  data.niveau?.trim() ||
                  null,

                fonction:
                  data.fonction?.trim() ||
                  null,

                actif:
                  data.actif ??
                  existing.actif,

                ...(data.serviceId
                  ? {
                      service: {
                        connect: {
                          id: data.serviceId,
                        },
                      },
                    }
                  : {
                      service: {
                        disconnect: true,
                      },
                    }),
              },
            });

          /*
          ================================================
          MODIFIER LE COMPTE USER
          ================================================
          */

          if (
            existing.userId &&
            existing.user
          ) {
            /*
            ----------------------------------------------
            DONNÉES USER
            ----------------------------------------------
            */

            const userData: {
              name?: string;
              email?: string;
              telephone?: string | null;
              password?: string;
              actif?: boolean;
              roleId?: number;
            } = {
              name: `${data.nom.trim()} ${data.prenom.trim()}`,

              telephone:
                data.telephone?.trim() ||
                null,

              actif:
                data.actif ??
                existing.actif,
            };

            /*
            ----------------------------------------------
            EMAIL
            ----------------------------------------------
            */

            if (
              data.userEmail?.trim()
            ) {
              const email =
                data.userEmail
                  .trim()
                  .toLowerCase();

              const emailExists =
                await tx.user.findFirst({
                  where: {
                    email,

                    NOT: {
                      id: existing.userId,
                    },
                  },
                });

              if (emailExists) {
                throw new Error(
                  "Cette adresse email est déjà utilisée."
                );
              }

              userData.email = email;
            }

            /*
            ----------------------------------------------
            NOUVEAU MOT DE PASSE
            ----------------------------------------------
            */

            if (
              data.userPassword?.trim()
            ) {
              if (
                data.userPassword.length <
                6
              ) {
                throw new Error(
                  "Le mot de passe doit contenir au moins 6 caractères."
                );
              }

              userData.password =
                await bcrypt.hash(
                  data.userPassword,
                  12
                );
            }

            /*
            ----------------------------------------------
            NOUVEAU ROLE
            ----------------------------------------------
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
                  "Le rôle sélectionné est introuvable."
                );
              }

              userData.roleId =
                data.roleId;
            }

            /*
            ----------------------------------------------
            UPDATE USER
            ----------------------------------------------
            */

            await tx.user.update({
              where: {
                id: existing.userId,
              },

              data: userData,
            });
          }

          /*
          ================================================
          RETOURNER INFIRMIER
          ================================================
          */

          return await tx.infirmier.findUnique({
            where: {
              id,
            },

            include: {
              employe: true,

              service: true,

              user: {
                include: {
                  role: true,
                },
              },
            },
          });
        }
      );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(
      INFIRMIERS_PATH
    );

    return {
      success: true,

      data: result,

      message:
        "Infirmier modifié avec succès.",
    };
  } catch (error) {
    console.error(
      "UPDATE INFIRMIER:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier l'infirmier.",
    };
  }
}

/*
==========================================================
SUPPRIMER UN INFIRMIER
==========================================================
*/

export async function deleteInfirmier(
  id: number
) {
  try {
    /*
    ======================================================
    RECHERCHER
    ======================================================
    */

    const infirmier =
      await prisma.infirmier.findUnique({
        where: {
          id,
        },

        include: {
          employe: true,

          user: true,
        },
      });

    if (!infirmier) {
      return {
        success: false,
        message:
          "Infirmier introuvable.",
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
        ----------------------------------------------
        SUPPRIMER INFIRMIER
        ----------------------------------------------
        */

        await tx.infirmier.delete({
          where: {
            id,
          },
        });

        /*
        ----------------------------------------------
        SUPPRIMER EMPLOYÉ
        ----------------------------------------------
        */

        await tx.employe.delete({
          where: {
            id: infirmier.employeId,
          },
        });

        /*
        ----------------------------------------------
        SUPPRIMER USER
        ----------------------------------------------
        */

        if (infirmier.userId) {
          await tx.user.delete({
            where: {
              id: infirmier.userId,
            },
          });
        }
      }
    );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(
      INFIRMIERS_PATH
    );

    return {
      success: true,

      message:
        "Infirmier et son compte utilisateur supprimés avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE INFIRMIER:",
      error
    );

    return {
      success: false,

      message:
        "Impossible de supprimer cet infirmier. Il est peut-être déjà utilisé dans le système.",
    };
  }
}

/*
==========================================================
ACTIVER / DÉSACTIVER UN INFIRMIER
==========================================================

Le statut est synchronisé sur :

1. Infirmier
2. Employé
3. User
==========================================================
*/

export async function toggleInfirmier(
  id: number
) {
  try {
    /*
    ======================================================
    RECHERCHER
    ======================================================
    */

    const infirmier =
      await prisma.infirmier.findUnique({
        where: {
          id,
        },

        include: {
          employe: true,

          user: true,
        },
      });

    if (!infirmier) {
      return {
        success: false,
        message:
          "Infirmier introuvable.",
      };
    }

    /*
    ======================================================
    NOUVEAU STATUT
    ======================================================
    */

    const nouveauStatut =
      !infirmier.actif;

    /*
    ======================================================
    TRANSACTION
    ======================================================
    */

    await prisma.$transaction(
      async (tx) => {
        /*
        ----------------------------------------------
        INFIRMIER
        ----------------------------------------------
        */

        await tx.infirmier.update({
          where: {
            id,
          },

          data: {
            actif:
              nouveauStatut,
          },
        });

        /*
        ----------------------------------------------
        EMPLOYÉ
        ----------------------------------------------
        */

        await tx.employe.update({
          where: {
            id: infirmier.employeId,
          },

          data: {
            actif:
              nouveauStatut,
          },
        });

        /*
        ----------------------------------------------
        USER
        ----------------------------------------------
        */

        if (infirmier.userId) {
          await tx.user.update({
            where: {
              id: infirmier.userId,
            },

            data: {
              actif:
                nouveauStatut,
            },
          });
        }
      }
    );

    /*
    ======================================================
    REVALIDATION
    ======================================================
    */

    revalidatePath(
      INFIRMIERS_PATH
    );

    return {
      success: true,

      message: nouveauStatut
        ? "Infirmier et compte utilisateur activés."
        : "Infirmier et compte utilisateur désactivés.",
    };
  } catch (error) {
    console.error(
      "TOGGLE INFIRMIER:",
      error
    );

    return {
      success: false,

      message:
        "Impossible de modifier le statut.",
    };
  }
}