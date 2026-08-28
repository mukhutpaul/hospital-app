"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* ==========================================================
TYPES
========================================================== */

export type SpecialiteFormData = {
code: string;
nom: string;
description?: string;
serviceId?: number | null;
actif?: boolean;
};

export type ActionResult<T = unknown> = {
success: boolean;
message: string;
data?: T;
};

/* ==========================================================
UTILITAIRE
========================================================== */

function cleanString(
value?: string | null
) {
return value?.trim() || null;
}

/* ==========================================================
GET SPECIALITES
========================================================== */

export async function getSpecialites() {

try {


return await prisma.specialite.findMany({

  include: {
    service: {
      select: {
        id: true,
        code: true,
        nom: true,
      },
    },

    _count: {
      select: {
        medecins: true,
        rendezVous: true,
        consultations: true,
      },
    },
  },

  orderBy: {
    nom: "asc",
  },

});


} catch (error) {


console.error(
  "getSpecialites:",
  error
);

return [];


}

}

/* ==========================================================
GET SERVICES
========================================================== */

export async function getServicesForSpecialites() {

try {


return await prisma.service.findMany({

  where: {
    actif: true,
  },

  select: {
    id: true,
    code: true,
    nom: true,
  },

  orderBy: {
    nom: "asc",
  },

});


} catch (error) {


console.error(
  "getServicesForSpecialites:",
  error
);

return [];


}

}

/* ==========================================================
CREATE
========================================================== */

export async function createSpecialite(
data: SpecialiteFormData
): Promise<ActionResult> {

try {


const code =
  data.code
    ?.trim()
    .toUpperCase();

const nom =
  data.nom?.trim();

if (!code) {

  return {
    success: false,
    message:
      "Le code de la spécialité est obligatoire.",
  };

}

if (!nom) {

  return {
    success: false,
    message:
      "Le nom de la spécialité est obligatoire.",
  };

}

const existing =
  await prisma.specialite.findUnique({
    where: {
      code,
    },
  });

if (existing) {

  return {
    success: false,
    message:
      "Ce code de spécialité existe déjà.",
  };

}

if (
  data.serviceId !== undefined &&
  data.serviceId !== null
) {

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
        "Le service sélectionné n'existe pas.",
    };

  }

}

const specialite =
  await prisma.specialite.create({

    data: {

      code,

      nom,

      description:
        cleanString(
          data.description
        ),

      serviceId:
        data.serviceId ??
        null,

      actif:
        data.actif ??
        true,

    },

  });

revalidatePath(
  "/specialites"
);

revalidatePath(
  "/parametres"
);

return {

  success: true,

  message:
    "Spécialité créée avec succès.",

  data: specialite,

};


} catch (error) {


console.error(
  "createSpecialite:",
  error
);

return {

  success: false,

  message:
    "Une erreur est survenue lors de la création.",

};


}

}

/* ==========================================================
UPDATE
========================================================== */

export async function updateSpecialite(
id: number,
data: SpecialiteFormData
): Promise<ActionResult> {

try {


const code =
  data.code
    ?.trim()
    .toUpperCase();

const nom =
  data.nom?.trim();

if (!code) {

  return {
    success: false,
    message:
      "Le code de la spécialité est obligatoire.",
  };

}

if (!nom) {

  return {
    success: false,
    message:
      "Le nom de la spécialité est obligatoire.",
  };

}

const specialite =
  await prisma.specialite.findUnique({
    where: {
      id,
    },
  });

if (!specialite) {

  return {
    success: false,
    message:
      "Spécialité introuvable.",
  };

}

const duplicate =
  await prisma.specialite.findFirst({

    where: {

      code,

      NOT: {
        id,
      },

    },

  });

if (duplicate) {

  return {
    success: false,
    message:
      "Ce code est déjà utilisé par une autre spécialité.",
  };

}

if (
  data.serviceId !== undefined &&
  data.serviceId !== null
) {

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
        "Le service sélectionné n'existe pas.",
    };

  }

}

const updated =
  await prisma.specialite.update({

    where: {
      id,
    },

    data: {

      code,

      nom,

      description:
        cleanString(
          data.description
        ),

      serviceId:
        data.serviceId ??
        null,

      actif:
        data.actif ??
        specialite.actif,

    },

  });

revalidatePath(
  "/specialites"
);

revalidatePath(
  "/parametres"
);

return {

  success: true,

  message:
    "Spécialité modifiée avec succès.",

  data: updated,

};


} catch (error) {


console.error(
  "updateSpecialite:",
  error
);

return {

  success: false,

  message:
    "Une erreur est survenue lors de la modification.",

};


}

}

/* ==========================================================
TOGGLE ACTIF
========================================================== */

export async function toggleSpecialite(
id: number
): Promise<ActionResult> {

try {


const specialite =
  await prisma.specialite.findUnique({
    where: {
      id,
    },
  });

if (!specialite) {

  return {
    success: false,
    message:
      "Spécialité introuvable.",
  };

}

const updated =
  await prisma.specialite.update({

    where: {
      id,
    },

    data: {
      actif:
        !specialite.actif,
    },

  });

revalidatePath(
  "/specialites"
);

return {

  success: true,

  message: updated.actif
    ? "Spécialité activée."
    : "Spécialité désactivée.",

  data: updated,

};




} catch (error) {


console.error(
  "toggleSpecialite:",
  error
);

return {

  success: false,

  message:
    "Impossible de modifier le statut.",

};


}

}

/* ==========================================================
DELETE
========================================================== */

export async function deleteSpecialite(
id: number
): Promise<ActionResult> {

try {


const specialite =
  await prisma.specialite.findUnique({

    where: {
      id,
    },

    include: {

      _count: {

        select: {

          medecins: true,

          rendezVous: true,

          consultations: true,

        },

      },

    },

  });

if (!specialite) {

  return {

    success: false,

    message:
      "Spécialité introuvable.",

  };

}

const totalUtilisation =
  specialite._count.medecins +
  specialite._count.rendezVous +
  specialite._count.consultations;

if (totalUtilisation > 0) {

  return {

    success: false,

    message:
      "Cette spécialité est déjà utilisée. Désactivez-la plutôt que de la supprimer.",

  };

}

await prisma.specialite.delete({

  where: {
    id,
  },

});

revalidatePath(
  "/specialites"
);

revalidatePath(
  "/parametres"
);

return {

  success: true,

  message:
    "Spécialité supprimée avec succès.",

};


} catch (error) {


console.error(
  "deleteSpecialite:",
  error
);

return {

  success: false,

  message:
    "Impossible de supprimer cette spécialité.",

};


}

}
