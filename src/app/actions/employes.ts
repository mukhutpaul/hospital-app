"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/*
==========================================================
TYPES
==========================================================
*/

export type EmployeData = {
  nom: string;
  postNom?: string;
  prenom?: string;

  sexe?: string;
  dateNaissance?: string;

  telephone?: string;
  email?: string;
  adresse?: string;

  fonction?: string;
  dateEmbauche?: string;

  serviceId?: number;

  /*
   * ======================================================
   * COMPTE UTILISATEUR
   * ======================================================
   */

  creerCompte?: boolean;
  emailCompte?: string;
  motDePasse?: string;
  roleId?: number;
};

export type UpdateEmployeData =
  EmployeData & {
    actif?: boolean;
  };

/*
==========================================================
GÉNÉRATION AUTOMATIQUE DU MATRICULE
==========================================================

Format :

EMP-0001
EMP-0002
EMP-0003
...
==========================================================
*/

async function generateEmployeMatricule(): Promise<string> {
  const dernierEmploye =
    await prisma.employe.findFirst({
      orderBy: {
        id: "desc",
      },

      select: {
        matricule: true,
      },
    });

  let numero = 1;

  if (dernierEmploye?.matricule) {
    const match =
      dernierEmploye.matricule.match(
        /^EMP-(\d+)$/
      );

    if (match) {
      numero =
        Number(match[1]) + 1;
    }
  }

  let matricule =
    `EMP-${numero
      .toString()
      .padStart(4, "0")}`;

  /*
  --------------------------------------------------------
  SÉCURITÉ
  --------------------------------------------------------
  */

  while (
    await prisma.employe.findUnique({
      where: {
        matricule,
      },
    })
  ) {
    numero++;

    matricule =
      `EMP-${numero
        .toString()
        .padStart(4, "0")}`;
  }

  return matricule;
}

/*
==========================================================
VALIDATION DES DATES
==========================================================
*/

function parseDate(
  value?: string
): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/*
==========================================================
VALIDATION EMAIL
==========================================================
*/

function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/*
==========================================================
CRÉER UN EMPLOYÉ
==========================================================

L'utilisateur peut choisir :

1. Créer uniquement l'employé
2. Créer l'employé + son compte utilisateur

==========================================================
*/

export async function createEmploye(
  data: EmployeData
) {
  try {
    /*
    --------------------------------------------------------
    VALIDATION EMPLOYÉ
    --------------------------------------------------------
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message:
          "Le nom est obligatoire.",
      };
    }

    /*
    --------------------------------------------------------
    VALIDATION COMPTE UTILISATEUR
    --------------------------------------------------------
    */

    if (data.creerCompte) {
      /*
      Email obligatoire
      */

      if (!data.emailCompte?.trim()) {
        return {
          success: false,
          message:
            "L'adresse email du compte utilisateur est obligatoire.",
        };
      }

      const emailCompte =
        data.emailCompte
          .trim()
          .toLowerCase();

      /*
      Vérification email
      */

      if (!isValidEmail(emailCompte)) {
        return {
          success: false,
          message:
            "Veuillez saisir une adresse email valide.",
        };
      }

      /*
      Mot de passe obligatoire
      */

      if (!data.motDePasse?.trim()) {
        return {
          success: false,
          message:
            "Le mot de passe est obligatoire.",
        };
      }

      /*
      Mot de passe minimum
      */

      if (
        data.motDePasse.length < 6
      ) {
        return {
          success: false,
          message:
            "Le mot de passe doit contenir au moins 6 caractères.",
        };
      }

      /*
      Rôle obligatoire
      */

      if (!data.roleId) {
        return {
          success: false,
          message:
            "Veuillez sélectionner le rôle de l'utilisateur.",
        };
      }

      /*
      Vérifier le rôle
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
            "Le rôle sélectionné est introuvable.",
        };
      }

      /*
      Vérifier l'email utilisateur
      */

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: emailCompte,
          },
        });

      if (existingUser) {
        return {
          success: false,
          message:
            "Cette adresse email est déjà utilisée par un utilisateur.",
        };
      }
    }

    /*
    --------------------------------------------------------
    PRÉPARATION DATE DE NAISSANCE
    --------------------------------------------------------
    */

    let dateNaissance:
      | Date
      | null = null;

    if (data.dateNaissance) {
      dateNaissance =
        parseDate(
          data.dateNaissance
        );

      if (!dateNaissance) {
        return {
          success: false,
          message:
            "La date de naissance est invalide.",
        };
      }
    }

    /*
    --------------------------------------------------------
    PRÉPARATION DATE D'EMBAUCHE
    --------------------------------------------------------
    */

    let dateEmbauche:
      | Date
      | null = null;

    if (data.dateEmbauche) {
      dateEmbauche =
        parseDate(
          data.dateEmbauche
        );

      if (!dateEmbauche) {
        return {
          success: false,
          message:
            "La date d'embauche est invalide.",
        };
      }
    }

    /*
    --------------------------------------------------------
    VÉRIFICATION DU SERVICE
    --------------------------------------------------------
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
    --------------------------------------------------------
    GÉNÉRATION MATRICULE
    --------------------------------------------------------
    */

    const matricule =
      await generateEmployeMatricule();

    /*
    --------------------------------------------------------
    TRANSACTION
    --------------------------------------------------------

    L'employé et son éventuel compte utilisateur
    sont créés dans la même transaction.

    Si une opération échoue :
    → tout est annulé.
    --------------------------------------------------------
    */

    const employe =
      await prisma.$transaction(
        async (tx) => {
          let userId:
            | number
            | undefined;

          /*
          ==================================================
          CRÉATION DU COMPTE UTILISATEUR
          ==================================================
          */

          if (
            data.creerCompte &&
            data.emailCompte &&
            data.motDePasse &&
            data.roleId
          ) {
            /*
            Hash du mot de passe
            */

            const hashedPassword =
              await bcrypt.hash(
                data.motDePasse,
                10
              );

            /*
            Nom complet
            */

            const nomComplet =
              [
                data.nom?.trim(),
                data.postNom?.trim(),
                data.prenom?.trim(),
              ]
                .filter(Boolean)
                .join(" ");

            /*
            Création User
            */

            const user =
              await tx.user.create({
                data: {
                  name:
                    nomComplet,

                  email:
                    data.emailCompte
                      .trim()
                      .toLowerCase(),

                  telephone:
                    data.telephone?.trim() ||
                    null,

                  password:
                    hashedPassword,

                  role: {
                    connect: {
                      id: data.roleId,
                    },
                  },

                  actif: true,
                },
              });

            userId = user.id;
          }

          /*
          ==================================================
          CRÉATION EMPLOYÉ
          ==================================================
          */

          const nouvelEmploye =
            await tx.employe.create({
              data: {
                /*
                ------------------------------------------
                IDENTITÉ
                ------------------------------------------
                */

                matricule,

                nom:
                  data.nom.trim(),

                postNom:
                  data.postNom?.trim() ||
                  null,

                prenom:
                  data.prenom?.trim() ||
                  null,

                /*
                ------------------------------------------
                INFORMATIONS
                ------------------------------------------
                */

                sexe:
                  data.sexe?.trim() ||
                  null,

                dateNaissance,

                telephone:
                  data.telephone?.trim() ||
                  null,

                email:
                  data.email?.trim() ||
                  null,

                adresse:
                  data.adresse?.trim() ||
                  null,

                fonction:
                  data.fonction?.trim() ||
                  null,

                dateEmbauche,

                /*
                ------------------------------------------
                SERVICE
                ------------------------------------------
                */

                service:
                  data.serviceId
                    ? {
                        connect: {
                          id: data.serviceId,
                        },
                      }
                    : undefined,

                /*
                ------------------------------------------
                USER
                ------------------------------------------
                */

                user: userId
                  ? {
                      connect: {
                        id: userId,
                      },
                    }
                  : undefined,

                /*
                ------------------------------------------
                STATUT
                ------------------------------------------
                */

                actif: true,
              },

              include: {
                service: true,
                user: true,
              },
            });

          return nouvelEmploye;
        }
      );

    /*
    --------------------------------------------------------
    RAFRAÎCHISSEMENT
    --------------------------------------------------------
    */

    revalidatePath(
      "/personnel/employes"
    );

    revalidatePath(
      "/dashboard/personnel/employes"
    );

    /*
    --------------------------------------------------------
    RÉPONSE
    --------------------------------------------------------
    */

    return {
      success: true,
      data: employe,

      message: data.creerCompte
        ? `Employé enregistré avec succès avec son compte utilisateur. Matricule : ${matricule}`
        : `Employé enregistré avec succès. Matricule : ${matricule}`,
    };
  } catch (error) {
    console.error(
      "CREATE EMPLOYE:",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la création de l'employé.",
    };
  }
}

/*
==========================================================
RÉCUPÉRER UN EMPLOYÉ
==========================================================
*/

export async function getEmploye(
  id: number
) {
  try {
    const employe =
      await prisma.employe.findUnique({
        where: {
          id,
        },

        include: {
          service: true,
          user: true,
          infirmiers: true,
        },
      });

    if (!employe) {
      return {
        success: false,
        message:
          "Employé introuvable.",
      };
    }

    return {
      success: true,
      data: employe,
    };
  } catch (error) {
    console.error(
      "GET EMPLOYE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer cet employé.",
    };
  }
}

/*
==========================================================
RÉCUPÉRER TOUS LES EMPLOYÉS
==========================================================
*/

export async function getEmployes() {
  try {
    const employes =
      await prisma.employe.findMany({
        orderBy: [
          {
            nom: "asc",
          },
          {
            prenom: "asc",
          },
        ],

        include: {
          service: {
            select: {
              id: true,
              code: true,
              nom: true,
            },
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              telephone: true,
              actif: true,
            },
          },

          infirmiers: {
            select: {
              id: true,
              matricule: true,
              numeroOrdre: true,
              grade: true,
              niveau: true,
              fonction: true,
              actif: true,
            },
          },
        },
      });

    return {
      success: true,
      data: employes,
    };
  } catch (error) {
    console.error(
      "GET EMPLOYES:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de récupérer les employés.",
      data: [],
    };
  }
}

/*
==========================================================
MODIFIER UN EMPLOYÉ
==========================================================

Le matricule ne change jamais.

La modification permet également :

- modifier les informations de l'employé
- modifier le service
- associer un compte utilisateur existant
- supprimer l'association avec un compte

==========================================================
*/

export async function updateEmploye(
  id: number,
  data: UpdateEmployeData
) {
  try {
    /*
    --------------------------------------------------------
    VÉRIFIER L'EXISTENCE
    --------------------------------------------------------
    */

    const existing =
      await prisma.employe.findUnique({
        where: {
          id,
        },

        include: {
          user: true,
        },
      });

    if (!existing) {
      return {
        success: false,
        message:
          "Employé introuvable.",
      };
    }

    /*
    --------------------------------------------------------
    VALIDATION
    --------------------------------------------------------
    */

    if (!data.nom?.trim()) {
      return {
        success: false,
        message:
          "Le nom est obligatoire.",
      };
    }

    /*
    --------------------------------------------------------
    DATE NAISSANCE
    --------------------------------------------------------
    */

    let dateNaissance:
      | Date
      | null = null;

    if (data.dateNaissance) {
      dateNaissance =
        parseDate(
          data.dateNaissance
        );

      if (!dateNaissance) {
        return {
          success: false,
          message:
            "La date de naissance est invalide.",
        };
      }
    }

    /*
    --------------------------------------------------------
    DATE EMBAUCHE
    --------------------------------------------------------
    */

    let dateEmbauche:
      | Date
      | null = null;

    if (data.dateEmbauche) {
      dateEmbauche =
        parseDate(
          data.dateEmbauche
        );

      if (!dateEmbauche) {
        return {
          success: false,
          message:
            "La date d'embauche est invalide.",
        };
      }
    }

    /*
    --------------------------------------------------------
    VÉRIFICATION SERVICE
    --------------------------------------------------------
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
    --------------------------------------------------------
    VÉRIFICATION USER
    --------------------------------------------------------
    */

    if (data.creerCompte) {
      /*
      Si on demande un compte pendant
      la modification, il faut un email.
      */

      if (!data.emailCompte?.trim()) {
        return {
          success: false,
          message:
            "L'adresse email du compte utilisateur est obligatoire.",
        };
      }

      const emailCompte =
        data.emailCompte
          .trim()
          .toLowerCase();

      if (!isValidEmail(emailCompte)) {
        return {
          success: false,
          message:
            "Veuillez saisir une adresse email valide.",
        };
      }

      /*
      ======================================================
      CAS 1 : L'employé possède déjà un compte
      ======================================================
      */

      if (existing.user) {
        /*
        Email différent :
        vérifier qu'il n'existe pas ailleurs.
        */

        if (
          emailCompte !==
          existing.user.email
        ) {
          const otherUser =
            await prisma.user.findFirst({
              where: {
                email: emailCompte,

                NOT: {
                  id: existing.user.id,
                },
              },
            });

          if (otherUser) {
            return {
              success: false,
              message:
                "Cette adresse email est déjà utilisée par un autre utilisateur.",
            };
          }
        }

        /*
        Nouveau mot de passe facultatif
        */

        if (
          data.motDePasse &&
          data.motDePasse.length < 6
        ) {
          return {
            success: false,
            message:
              "Le mot de passe doit contenir au moins 6 caractères.",
          };
        }

        /*
        Rôle facultatif en modification
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
      CAS 2 : Aucun compte actuellement
      ======================================================
      */

      else {
        if (!data.motDePasse?.trim()) {
          return {
            success: false,
            message:
              "Le mot de passe est obligatoire pour créer le compte.",
          };
        }

        if (
          data.motDePasse.length < 6
        ) {
          return {
            success: false,
            message:
              "Le mot de passe doit contenir au moins 6 caractères.",
          };
        }

        if (!data.roleId) {
          return {
            success: false,
            message:
              "Veuillez sélectionner le rôle de l'utilisateur.",
          };
        }

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

        const existingUser =
          await prisma.user.findUnique({
            where: {
              email: emailCompte,
            },
          });

        if (existingUser) {
          return {
            success: false,
            message:
              "Cette adresse email est déjà utilisée par un utilisateur.",
          };
        }
      }
    }

    /*
    --------------------------------------------------------
    TRANSACTION
    --------------------------------------------------------
    */

    const employe =
      await prisma.$transaction(
        async (tx) => {
          /*
          ================================================
          CAS 1 :
          L'employé possède déjà un compte
          ================================================
          */

          if (
            existing.user &&
            data.creerCompte
          ) {
            const userUpdateData: {
              name?: string;
              email?: string;
              telephone?: string | null;
              password?: string;
              role?: {
                connect: {
                  id: number;
                };
              };
            } = {
              name: [
                data.nom?.trim(),
                data.postNom?.trim(),
                data.prenom?.trim(),
              ]
                .filter(Boolean)
                .join(" "),

              email:
                data.emailCompte
                  ?.trim()
                  .toLowerCase(),

              telephone:
                data.telephone?.trim() ||
                null,
            };

            /*
            Nouveau mot de passe
            */

            if (
              data.motDePasse?.trim()
            ) {
              userUpdateData.password =
                await bcrypt.hash(
                  data.motDePasse,
                  10
                );
            }

            /*
            Nouveau rôle
            */

            if (data.roleId) {
              userUpdateData.role = {
                connect: {
                  id: data.roleId,
                },
              };
            }

            await tx.user.update({
              where: {
                id: existing.user.id,
              },

              data: userUpdateData,
            });
          }

          /*
          ================================================
          CAS 2 :
          Aucun compte → créer un compte
          ================================================
          */

          if (
            !existing.user &&
            data.creerCompte &&
            data.emailCompte &&
            data.motDePasse &&
            data.roleId
          ) {
            const hashedPassword =
              await bcrypt.hash(
                data.motDePasse,
                10
              );

            const nomComplet =
              [
                data.nom?.trim(),
                data.postNom?.trim(),
                data.prenom?.trim(),
              ]
                .filter(Boolean)
                .join(" ");

            const user =
              await tx.user.create({
                data: {
                  name:
                    nomComplet,

                  email:
                    data.emailCompte
                      .trim()
                      .toLowerCase(),

                  telephone:
                    data.telephone?.trim() ||
                    null,

                  password:
                    hashedPassword,

                  role: {
                    connect: {
                      id: data.roleId,
                    },
                  },

                  actif: true,
                },
              });

            /*
            Lier le nouvel utilisateur
            */

            const updated =
              await tx.employe.update({
                where: {
                  id,
                },

                data: {
                  nom:
                    data.nom.trim(),

                  postNom:
                    data.postNom?.trim() ||
                    null,

                  prenom:
                    data.prenom?.trim() ||
                    null,

                  sexe:
                    data.sexe?.trim() ||
                    null,

                  dateNaissance,

                  telephone:
                    data.telephone?.trim() ||
                    null,

                  email:
                    data.email?.trim() ||
                    null,

                  adresse:
                    data.adresse?.trim() ||
                    null,

                  fonction:
                    data.fonction?.trim() ||
                    null,

                  dateEmbauche,

                  service:
                    data.serviceId
                      ? {
                          connect: {
                            id: data.serviceId,
                          },
                        }
                      : {
                          disconnect: true,
                        },

                  user: {
                    connect: {
                      id: user.id,
                    },
                  },

                  actif:
                    data.actif ??
                    existing.actif,
                },

                include: {
                  service: true,
                  user: true,
                },
              });

            return updated;
          }

          /*
          ================================================
          MISE À JOUR NORMALE EMPLOYÉ
          ================================================
          */

          return tx.employe.update({
            where: {
              id,
            },

            data: {
              /*
              Le matricule n'est jamais modifié.
              */

              nom:
                data.nom.trim(),

              postNom:
                data.postNom?.trim() ||
                null,

              prenom:
                data.prenom?.trim() ||
                null,

              sexe:
                data.sexe?.trim() ||
                null,

              dateNaissance,

              telephone:
                data.telephone?.trim() ||
                null,

              email:
                data.email?.trim() ||
                null,

              adresse:
                data.adresse?.trim() ||
                null,

              fonction:
                data.fonction?.trim() ||
                null,

              dateEmbauche,

              service:
                data.serviceId
                  ? {
                      connect: {
                        id: data.serviceId,
                      },
                    }
                  : {
                      disconnect: true,
                    },

              /*
              On ne supprime pas automatiquement
              le compte utilisateur existant.
              */

              actif:
                data.actif ??
                existing.actif,
            },

            include: {
              service: true,
              user: true,
            },
          });
        }
      );

    /*
    --------------------------------------------------------
    RAFRAÎCHISSEMENT
    --------------------------------------------------------
    */

    revalidatePath(
      "/personnel/employes"
    );

    revalidatePath(
      "/dashboard/personnel/employes"
    );

    return {
      success: true,
      data: employe,
      message:
        "Employé modifié avec succès.",
    };
  } catch (error) {
    console.error(
      "UPDATE EMPLOYE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier l'employé.",
    };
  }
}

/*
==========================================================
SUPPRIMER UN EMPLOYÉ
==========================================================

IMPORTANT :

Un employé peut être lié à un infirmier.

On vérifie donc d'abord cette relation.
==========================================================
*/

export async function deleteEmploye(
  id: number
) {
  try {
    /*
    --------------------------------------------------------
    VÉRIFIER L'EMPLOYÉ
    --------------------------------------------------------
    */

    const employe =
      await prisma.employe.findUnique({
        where: {
          id,
        },

        include: {
          infirmiers: {
            select: {
              id: true,
            },
          },

          user: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!employe) {
      return {
        success: false,
        message:
          "Employé introuvable.",
      };
    }

    /*
    --------------------------------------------------------
    VÉRIFIER INFIRMIERS
    --------------------------------------------------------
    */

    if (
      employe.infirmiers.length > 0
    ) {
      return {
        success: false,
        message:
          "Impossible de supprimer cet employé car il est associé à un infirmier.",
      };
    }

    /*
    --------------------------------------------------------
    SUPPRESSION
    --------------------------------------------------------
    */

    await prisma.$transaction(
      async (tx) => {
        /*
        Supprimer l'employé.
        */

        await tx.employe.delete({
          where: {
            id,
          },
        });

        /*
        ----------------------------------------------------
        COMPTE USER
        ----------------------------------------------------

        Si l'utilisateur était uniquement lié
        à cet employé, on peut le supprimer.

        ----------------------------------------------------
        */

        if (employe.user?.id) {
          await tx.user.delete({
            where: {
              id: employe.user.id,
            },
          });
        }
      }
    );

    /*
    --------------------------------------------------------
    RAFRAÎCHISSEMENT
    --------------------------------------------------------
    */

    revalidatePath(
      "/personnel/employes"
    );

    revalidatePath(
      "/dashboard/personnel/employes"
    );

    return {
      success: true,
      message:
        "Employé supprimé avec succès.",
    };
  } catch (error) {
    console.error(
      "DELETE EMPLOYE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de supprimer cet employé. Il est peut-être encore utilisé dans le système.",
    };
  }
}

/*
==========================================================
ACTIVER / DÉSACTIVER UN EMPLOYÉ
==========================================================
*/

export async function toggleEmploye(
  id: number
) {
  try {
    /*
    --------------------------------------------------------
    RÉCUPÉRER L'EMPLOYÉ
    --------------------------------------------------------
    */

    const employe =
      await prisma.employe.findUnique({
        where: {
          id,
        },
      });

    if (!employe) {
      return {
        success: false,
        message:
          "Employé introuvable.",
      };
    }

    /*
    --------------------------------------------------------
    NOUVEAU STATUT
    --------------------------------------------------------
    */

    const nouveauStatut =
      !employe.actif;

    /*
    --------------------------------------------------------
    MISE À JOUR EMPLOYÉ
    --------------------------------------------------------
    */

    await prisma.employe.update({
      where: {
        id,
      },

      data: {
        actif:
          nouveauStatut,
      },
    });

    /*
    --------------------------------------------------------
    RAFRAÎCHISSEMENT
    --------------------------------------------------------
    */

    revalidatePath(
      "/personnel/employes"
    );

    revalidatePath(
      "/dashboard/personnel/employes"
    );

    return {
      success: true,
      message:
        nouveauStatut
          ? "Employé activé."
          : "Employé désactivé.",
    };
  } catch (error) {
    console.error(
      "TOGGLE EMPLOYE:",
      error
    );

    return {
      success: false,
      message:
        "Impossible de modifier le statut de l'employé.",
    };
  }
}