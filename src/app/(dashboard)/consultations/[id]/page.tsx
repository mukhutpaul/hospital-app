import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import ConsultationDetails from "@/components/consultations/ConsultationDetails";

type Props = {
params: Promise<{
id: string;
}>;
};

export default async function ConsultationDetailsPage({
params,
}: Props) {
/* ========================================================
PARAMÈTRE
======================================================== */

const { id } = await params;

const consultationId = Number(id);

if (!Number.isInteger(consultationId)) {
notFound();
}

/* ========================================================
CONSULTATION
======================================================== */

const consultation =
await prisma.consultation.findUnique({
where: {
idConsultation: consultationId,
},


  include: {
    /* ====================================================
       PATIENT
    ==================================================== */

    patient: true,

    /* ====================================================
       MÉDECIN
    ==================================================== */

    medecin: {
      include: {
        specialite: true,
        service: true,
      },
    },

    /* ====================================================
       SERVICE
    ==================================================== */

    service: true,

    /* ====================================================
       SPÉCIALITÉ
    ==================================================== */

    specialite: true,

    /* ====================================================
       ADMISSION
    ==================================================== */

    admission: true,

    /* ====================================================
       CONSTANTES
    ==================================================== */

    constantes: {
      orderBy: {
        dateMesure: "desc",
      },
    },

    /* ====================================================
       PRESCRIPTIONS
    ==================================================== */

    prescriptions: {
      orderBy: {
        datePrescription: "desc",
      },

      include: {
        medecin: true,

        lignes: {
          include: {
            medicament: true,
          },
        },
      },
    },

    /* ====================================================
       DEMANDES LABORATOIRE
    ==================================================== */

    demandesLabo: {
      orderBy: {
        dateDemande: "desc",
      },

      include: {
        service: true,

        lignes: {
          include: {
            examen: true,
          },
        },

        resultats: {
          orderBy: {
            dateResultat: "desc",
          },
        },
      },
    },

    /* ====================================================
       DEMANDES IMAGERIE
    ==================================================== */

    demandesImagerie: {
      orderBy: {
        dateDemande: "desc",
      },

      include: {
        examen: true,
        service: true,
      },
    },
  },
});


/* ========================================================
CONSULTATION INTROUVABLE
======================================================== */

if (!consultation) {
notFound();
}

/* ========================================================
CATALOGUE DES MÉDICAMENTS
======================================================== */

const medicaments =
await prisma.medicament.findMany({
where: {
actif: true,
},


  orderBy: {
    nom: "asc",
  },
});


/* ========================================================
CATALOGUE DES EXAMENS LABORATOIRE
======================================================== */

const examensLaboratoire =
await prisma.examenLaboratoire.findMany({
where: {
actif: true,
},


  orderBy: {
    nom: "asc",
  },
});


/* ========================================================
CATALOGUE DES EXAMENS IMAGERIE
======================================================== */

const examensImagerie =
await prisma.examenImagerie.findMany({
where: {
actif: true,
},


  orderBy: {
    nom: "asc",
  },
});


/* ========================================================
AFFICHAGE
======================================================== */

return ( <main className="min-h-screen bg-base-200/40"> <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

    {/* ==================================================
        EN-TÊTE DE PAGE
    ================================================== */}

    <div className="mb-5 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="h-1.5 w-full bg-primary" />

      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="text-xl font-bold">
              C
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Dossier de consultation
              </h1>

              <span className="badge badge-primary badge-outline font-mono">
                CONS-{consultation.idConsultation}
              </span>
            </div>

            <p className="mt-1 text-sm text-base-content/60">
              Vue détaillée de la consultation,
              du dossier médical et des actes associés.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-success badge-soft gap-1 px-3 py-3">
            <span className="h-2 w-2 rounded-full bg-success" />
            Consultation active
          </span>
        </div>

      </div>
    </div>

    {/* ==================================================
        CONTENU PRINCIPAL
    ================================================== */}

    <div className="rounded-2xl border border-base-300/80 bg-base-100 shadow-sm">
      <ConsultationDetails
        consultation={consultation}
        medicaments={medicaments}
        examensLaboratoire={examensLaboratoire}
        examensImagerie={examensImagerie}
      />
    </div>

  </div>
</main>


);
}
