import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";




async function main() {
  console.log("🌱 Démarrage du seed...");

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const permissions = [
    // Patients
    ["PATIENT_CREATE", "Créer un patient"],
    ["PATIENT_READ", "Consulter les patients"],
    ["PATIENT_UPDATE", "Modifier un patient"],
    ["PATIENT_DELETE", "Supprimer un patient"],

    // Rendez-vous
    ["RENDEZVOUS_CREATE", "Créer un rendez-vous"],
    ["RENDEZVOUS_READ", "Consulter les rendez-vous"],
    ["RENDEZVOUS_UPDATE", "Modifier un rendez-vous"],
    ["RENDEZVOUS_DELETE", "Supprimer un rendez-vous"],

    // Admissions
    ["ADMISSION_CREATE", "Créer une admission"],
    ["ADMISSION_READ", "Consulter les admissions"],
    ["ADMISSION_UPDATE", "Modifier une admission"],

    // Consultation
    ["CONSULTATION_CREATE", "Créer une consultation"],
    ["CONSULTATION_READ", "Consulter une consultation"],
    ["CONSULTATION_UPDATE", "Modifier une consultation"],

    // Prescriptions
    ["PRESCRIPTION_CREATE", "Créer une prescription"],
    ["PRESCRIPTION_READ", "Consulter une prescription"],
    ["PRESCRIPTION_UPDATE", "Modifier une prescription"],

    // Laboratoire
    ["LABORATOIRE_CREATE", "Créer une demande laboratoire"],
    ["LABORATOIRE_READ", "Consulter les demandes laboratoire"],
    ["LABORATOIRE_RESULTAT", "Saisir un résultat laboratoire"],
    ["LABORATOIRE_VALIDER", "Valider un résultat laboratoire"],

    // Imagerie
    ["IMAGERIE_CREATE", "Créer une demande d'imagerie"],
    ["IMAGERIE_READ", "Consulter les examens d'imagerie"],
    ["IMAGERIE_RESULTAT", "Saisir un compte rendu d'imagerie"],

    // Pharmacie
    ["PHARMACIE_READ", "Consulter la pharmacie"],
    ["PHARMACIE_STOCK", "Gérer le stock pharmacie"],
    ["PHARMACIE_VENTE", "Effectuer une vente pharmacie"],

    // Hospitalisation
    ["HOSPITALISATION_CREATE", "Créer une hospitalisation"],
    ["HOSPITALISATION_READ", "Consulter les hospitalisations"],
    ["HOSPITALISATION_UPDATE", "Modifier une hospitalisation"],
    ["HOSPITALISATION_TRANSFERT", "Effectuer un transfert"],

    // Sorties
    ["SORTIE_CREATE", "Créer une sortie"],
    ["SORTIE_READ", "Consulter les sorties"],

    // Facturation
    ["FACTURE_CREATE", "Créer une facture"],
    ["FACTURE_READ", "Consulter les factures"],
    ["FACTURE_UPDATE", "Modifier une facture"],

    // Paiements
    ["PAIEMENT_CREATE", "Enregistrer un paiement"],
    ["PAIEMENT_READ", "Consulter les paiements"],
    ["PAIEMENT_DELETE", "Annuler un paiement"],

    // Assurances
    ["ASSURANCE_CREATE", "Créer une assurance"],
    ["ASSURANCE_READ", "Consulter les assurances"],
    ["ASSURANCE_UPDATE", "Modifier une assurance"],

    // Personnel
    ["EMPLOYE_CREATE", "Créer un employé"],
    ["EMPLOYE_READ", "Consulter les employés"],
    ["EMPLOYE_UPDATE", "Modifier un employé"],
    ["EMPLOYE_DELETE", "Supprimer un employé"],

    // Administration
    ["USER_CREATE", "Créer un utilisateur"],
    ["USER_READ", "Consulter les utilisateurs"],
    ["USER_UPDATE", "Modifier un utilisateur"],
    ["USER_DELETE", "Supprimer un utilisateur"],

    ["ROLE_CREATE", "Créer un rôle"],
    ["ROLE_READ", "Consulter les rôles"],
    ["ROLE_UPDATE", "Modifier un rôle"],
    ["ROLE_DELETE", "Supprimer un rôle"],

    // Rapports
    ["RAPPORT_READ", "Consulter les rapports"],
    ["RAPPORT_EXPORT", "Exporter les rapports"],

    // Audit
    ["AUDIT_READ", "Consulter les journaux d'audit"],
  ];

  // =====================================================
  // CRÉATION DES PERMISSIONS
  // =====================================================

  const permissionMap = new Map<string, number>();

  for (const [code, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        code,
      },
      update: {
        description,
      },
      create: {
        code,
        description,
      },
    });

    permissionMap.set(code, permission.id);
  }

  console.log(`✅ ${permissions.length} permissions créées`);

  // =====================================================
  // RÔLES
  // =====================================================

  const roles = [
    {
      nom: "ADMIN",
      description: "Administrateur système avec accès complet",
    },
    {
      nom: "MEDECIN",
      description: "Médecin",
    },
    {
      nom: "INFIRMIER",
      description: "Personnel infirmier",
    },
    {
      nom: "RECEPTIONNISTE",
      description: "Personnel chargé de l'accueil",
    },
    {
      nom: "LABORANTIN",
      description: "Personnel du laboratoire",
    },
    {
      nom: "RADIOLOGUE",
      description: "Personnel chargé de l'imagerie médicale",
    },
    {
      nom: "PHARMACIEN",
      description: "Personnel de la pharmacie",
    },
    {
      nom: "CAISSIER",
      description: "Personnel de caisse",
    },
    {
      nom: "COMPTABLE",
      description: "Personnel comptable",
    },
    {
      nom: "RESPONSABLE",
      description: "Responsable de l'établissement",
    },
  ];

  const roleMap = new Map<string, number>();

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: {
        nom: roleData.nom,
      },
      update: {
        description: roleData.description,
        actif: true,
      },
      create: {
        nom: roleData.nom,
        description: roleData.description,
      },
    });

    roleMap.set(roleData.nom, role.id);
  }

  console.log(`✅ ${roles.length} rôles créés`);

  // =====================================================
  // PERMISSIONS PAR RÔLE
  // =====================================================

  const rolePermissions: Record<string, string[]> = {
    ADMIN: permissions.map(([code]) => code),

    MEDECIN: [
      "PATIENT_READ",
      "PATIENT_UPDATE",
      "RENDEZVOUS_READ",
      "ADMISSION_READ",
      "CONSULTATION_CREATE",
      "CONSULTATION_READ",
      "CONSULTATION_UPDATE",
      "PRESCRIPTION_CREATE",
      "PRESCRIPTION_READ",
      "PRESCRIPTION_UPDATE",
      "LABORATOIRE_CREATE",
      "LABORATOIRE_READ",
      "IMAGERIE_CREATE",
      "IMAGERIE_READ",
      "HOSPITALISATION_READ",
      "SORTIE_CREATE",
      "SORTIE_READ",
    ],

    INFIRMIER: [
      "PATIENT_READ",
      "PATIENT_UPDATE",
      "RENDEZVOUS_READ",
      "ADMISSION_READ",
      "CONSULTATION_READ",
      "HOSPITALISATION_READ",
      "HOSPITALISATION_UPDATE",
      "HOSPITALISATION_TRANSFERT",
      "SORTIE_READ",
    ],

    RECEPTIONNISTE: [
      "PATIENT_CREATE",
      "PATIENT_READ",
      "PATIENT_UPDATE",
      "RENDEZVOUS_CREATE",
      "RENDEZVOUS_READ",
      "RENDEZVOUS_UPDATE",
      "RENDEZVOUS_DELETE",
      "ADMISSION_CREATE",
      "ADMISSION_READ",
      "ADMISSION_UPDATE",
    ],

    LABORANTIN: [
      "PATIENT_READ",
      "LABORATOIRE_READ",
      "LABORATOIRE_RESULTAT",
      "LABORATOIRE_VALIDER",
    ],

    RADIOLOGUE: [
      "PATIENT_READ",
      "IMAGERIE_READ",
      "IMAGERIE_RESULTAT",
    ],

    PHARMACIEN: [
      "PATIENT_READ",
      "PHARMACIE_READ",
      "PHARMACIE_STOCK",
      "PHARMACIE_VENTE",
      "PRESCRIPTION_READ",
    ],

    CAISSIER: [
      "PATIENT_READ",
      "FACTURE_READ",
      "PAIEMENT_CREATE",
      "PAIEMENT_READ",
    ],

    COMPTABLE: [
      "FACTURE_READ",
      "PAIEMENT_READ",
      "RAPPORT_READ",
      "RAPPORT_EXPORT",
    ],

    RESPONSABLE: [
      "PATIENT_READ",
      "RENDEZVOUS_READ",
      "ADMISSION_READ",
      "CONSULTATION_READ",
      "HOSPITALISATION_READ",
      "FACTURE_READ",
      "PAIEMENT_READ",
      "RAPPORT_READ",
      "RAPPORT_EXPORT",
      "AUDIT_READ",
    ],
  };

  for (const [roleName, permissionCodes] of Object.entries(
    rolePermissions
  )) {
    const roleId = roleMap.get(roleName);

    if (!roleId) {
      throw new Error(`Rôle introuvable : ${roleName}`);
    }

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionMap.get(permissionCode);

      if (!permissionId) {
        throw new Error(
          `Permission introuvable : ${permissionCode}`
        );
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log("✅ Permissions des rôles configurées");

  // =====================================================
  // COMPTE ADMINISTRATEUR
  // =====================================================

  const adminRoleId = roleMap.get("ADMIN");

  if (!adminRoleId) {
    throw new Error("Rôle ADMIN introuvable");
  }

  const password = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@hospital.local",
    },
    update: {
      name: "Administrateur",
      roleId: adminRoleId,
      actif: true,
    },
    create: {
      name: "Administrateur",
      email: "admin@hospital.local",
      password,
      telephone: null,
      actif: true,
      roleId: adminRoleId,
    },
  });

  console.log("✅ Administrateur créé");

  console.log("");
  console.log("==========================================");
  console.log("🌱 SEED TERMINÉ");
  console.log("==========================================");
  console.log(`Email : ${admin.email}`);
  console.log("Mot de passe : Admin@123456");
  console.log("Rôle : ADMIN");
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("❌ Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });