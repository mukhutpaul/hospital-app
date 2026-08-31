
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/* =========================================================
   RÔLES
========================================================= */

export const ROLES = [
  "ADMIN",
  "MEDECIN",
  "INFIRMIER",
  "RECEPTIONNISTE",
  "CAISSIER",
  "LABORANTIN",
  "RADIOLOGUE",
  "PHARMACIEN",
  "COMPTABLE",
  "SECRETAIRE",
] as const;

export type Role = (typeof ROLES)[number];

/* =========================================================
   PERMISSIONS HOSPITALISATION
========================================================= */

export const HOSPITALISATION_PERMISSIONS = [
  "HOSPITALISATIONS_READ",
  "CHAMBRES_READ",
  "LITS_READ",
  "SOINS_READ",
  "TRANSFERTS_READ",
  "SORTIES_READ",
] as const;

export type HospitalisationPermission =
  (typeof HOSPITALISATION_PERMISSIONS)[number];

/* =========================================================
   PERMISSIONS PAR RÔLE
========================================================= */

const ROLE_HOSPITALISATION_PERMISSIONS: Record<
  Role,
  readonly HospitalisationPermission[]
> = {
  /* =======================================================
     ADMIN
     Accès complet
  ======================================================= */

  ADMIN: [
    "HOSPITALISATIONS_READ",
    "CHAMBRES_READ",
    "LITS_READ",
    "SOINS_READ",
    "TRANSFERTS_READ",
    "SORTIES_READ",
  ],

  /* =======================================================
     MÉDECIN
  ======================================================= */

  MEDECIN: [
    "HOSPITALISATIONS_READ",
    "SOINS_READ",
    "TRANSFERTS_READ",
    "SORTIES_READ",
  ],

  /* =======================================================
     INFIRMIER
  ======================================================= */

  INFIRMIER: [
    "HOSPITALISATIONS_READ",
    "LITS_READ",
    "SOINS_READ",
    "TRANSFERTS_READ",
    "SORTIES_READ",
  ],

  /* =======================================================
     RÉCEPTIONNISTE
  ======================================================= */

  RECEPTIONNISTE: [],

  /* =======================================================
     CAISSIER
  ======================================================= */

  CAISSIER: [],

  /* =======================================================
     LABORANTIN
  ======================================================= */

  LABORANTIN: [],

  /* =======================================================
     RADIOLOGUE
  ======================================================= */

  RADIOLOGUE: [],

  /* =======================================================
     PHARMACIEN
  ======================================================= */

  PHARMACIEN: [],

  /* =======================================================
     COMPTABLE
  ======================================================= */

  COMPTABLE: [],

  /* =======================================================
     SECRÉTAIRE
  ======================================================= */

  SECRETAIRE: [],
};

/* =========================================================
   VÉRIFIER SI UNE VALEUR EST UN RÔLE VALIDE
========================================================= */

export function isValidRole(
  value: unknown,
): value is Role {
  return (
    typeof value === "string" &&
    ROLES.includes(value as Role)
  );
}

/* =========================================================
   OBTENIR L'UTILISATEUR CONNECTÉ
========================================================= */

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

/* =========================================================
   OBTENIR LE RÔLE DE L'UTILISATEUR
========================================================= */

export async function getCurrentUserRole(): Promise<Role> {
  const user = await getCurrentUser();

  if (!isValidRole(user.role)) {
    redirect("/acces-refuse");
  }

  return user.role;
}

/* =========================================================
   VÉRIFIER UN RÔLE
========================================================= */

export async function requireRole(
  allowedRoles: readonly Role[],
) {
  const user = await getCurrentUser();

  if (!isValidRole(user.role)) {
    redirect("/acces-refuse");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/acces-refuse");
  }

  return user;
}

/* =========================================================
   OBTENIR LES PERMISSIONS D'HOSPITALISATION
========================================================= */

export function getHospitalisationPermissions(
  role: Role | undefined,
): readonly HospitalisationPermission[] {
  if (!role) {
    return [];
  }

  if (role === "ADMIN") {
    return HOSPITALISATION_PERMISSIONS;
  }

  return ROLE_HOSPITALISATION_PERMISSIONS[role] ?? [];
}

/* =========================================================
   VÉRIFIER UNE PERMISSION
========================================================= */

export function hasHospitalisationPermission(
  role: Role | undefined,
  permission: HospitalisationPermission,
): boolean {
  if (!role) {
    return false;
  }

  return getHospitalisationPermissions(role).includes(
    permission,
  );
}

/* =========================================================
   EXIGER UNE PERMISSION
========================================================= */

export async function requireHospitalisationPermission(
  permission: HospitalisationPermission,
) {
  const user = await getCurrentUser();

  /* =======================================================
     RÔLE VALIDE
  ======================================================= */

  if (!isValidRole(user.role)) {
    redirect("/acces-refuse");
  }

  /* =======================================================
     PERMISSION
  ======================================================= */

  if (
    !hasHospitalisationPermission(
      user.role,
      permission,
    )
  ) {
    redirect("/acces-refuse");
  }

  return user;
}

/* =========================================================
   HELPERS SPÉCIFIQUES
========================================================= */

export async function requireHospitalisationsRead() {
  return requireHospitalisationPermission(
    "HOSPITALISATIONS_READ",
  );
}

export async function requireChambresRead() {
  return requireHospitalisationPermission(
    "CHAMBRES_READ",
  );
}

export async function requireLitsRead() {
  return requireHospitalisationPermission(
    "LITS_READ",
  );
}

export async function requireSoinsRead() {
  return requireHospitalisationPermission(
    "SOINS_READ",
  );
}

export async function requireTransfertsRead() {
  return requireHospitalisationPermission(
    "TRANSFERTS_READ",
  );
}

export async function requireSortiesRead() {
  return requireHospitalisationPermission(
    "SORTIES_READ",
  );
}
