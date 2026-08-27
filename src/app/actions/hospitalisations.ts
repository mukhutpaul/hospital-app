"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = { success: boolean; message: string; data?: T };

const PATH = "/hospitalisation/hospitalisations";

export async function getHospitalisations(): Promise<ActionResult> {
  try {
    const data = await prisma.hospitalisation.findMany({
      orderBy: { dateEntree: "desc" },
      include: {
        patient: true,
        admission: true,
        service: true,
        medecin: true,
        lit: { include: { chambre: true } },
      },
    });
    return { success: true, message: "Hospitalisations récupérées.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de récupérer les hospitalisations." };
  }
}

export async function getHospitalisationById(id: number): Promise<ActionResult> {
  try {
    const data = await prisma.hospitalisation.findUnique({
      where: { id },
      include: {
        patient: true,
        admission: true,
        service: true,
        medecin: true,
        lit: { include: { chambre: true } },
        soins: { orderBy: { dateSoin: "desc" } },
        transferts: { orderBy: { dateTransfert: "desc" } },
        sorties: { orderBy: { dateSortie: "desc" } },
      },
    });
    if (!data) return { success: false, message: "Hospitalisation introuvable." };
    return { success: true, message: "Hospitalisation récupérée.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur lors de la récupération." };
  }
}

export async function getAdmissionsDisponiblesPourHospitalisation(): Promise<ActionResult> {
  try {
    const data = await prisma.admission.findMany({
      where: { hospitalisation: null },
      orderBy: { dateAdmission: "desc" },
      include: { patient: true, service: true },
    });
    return { success: true, message: "Admissions disponibles récupérées.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de récupérer les admissions disponibles." };
  }
}

export async function createHospitalisation(input: {
  admissionId: number;
  serviceId?: number | null;
  medecinId?: number | null;
  litId?: number | null;
  motif?: string | null;
  diagnostic?: string | null;
}): Promise<ActionResult> {
  try {
    if (!input.admissionId) return { success: false, message: "L'admission est obligatoire." };

    const admission = await prisma.admission.findUnique({
      where: { id: input.admissionId },
      include: { hospitalisation: true },
    });
    if (!admission) return { success: false, message: "Admission introuvable." };
    if (admission.hospitalisation) return { success: false, message: "Cette admission possède déjà une hospitalisation." };

    if (input.litId) {
      const lit = await prisma.lit.findUnique({ where: { id: input.litId } });
      if (!lit) return { success: false, message: "Lit introuvable." };
      if (lit.statut !== "LIBRE") return { success: false, message: "Le lit sélectionné n'est pas libre." };
    }

    const numero = `HOSP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const data = await prisma.$transaction(async (tx) => {
      const hospitalisation = await tx.hospitalisation.create({
        data: {
          numero,
          patientId: admission.patientId,
          admissionId: input.admissionId,
          serviceId: input.serviceId ?? null,
          medecinId: input.medecinId ?? null,
          litId: input.litId ?? null,
          motif: input.motif?.trim() || null,
          diagnostic: input.diagnostic?.trim() || null,
          statut: "EN_COURS",
        },
      });

      if (input.litId) {
        await tx.lit.update({ where: { id: input.litId }, data: { statut: "OCCUPE" } });
      }

      return hospitalisation;
    });

    revalidatePath(PATH);
    revalidatePath("/hospitalisation");
    revalidatePath("/hospitalisation/lits");
    return { success: true, message: "Hospitalisation créée avec succès.", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de créer l'hospitalisation." };
  }
}

export async function updateHospitalisation(id: number, input: {
  serviceId?: number | null;
  medecinId?: number | null;
  litId?: number | null;
  motif?: string | null;
  diagnostic?: string | null;
  statut?: string;
}): Promise<ActionResult> {
  try {
    const current = await prisma.hospitalisation.findUnique({ where: { id } });
    if (!current) return { success: false, message: "Hospitalisation introuvable." };
    if (current.statut !== "EN_COURS" && input.statut !== current.statut) {
      return { success: false, message: "Cette hospitalisation n'est plus modifiable." };
    }

    const newLitId = input.litId ?? null;
    if (newLitId && newLitId !== current.litId) {
      const lit = await prisma.lit.findUnique({ where: { id: newLitId } });
      if (!lit) return { success: false, message: "Nouveau lit introuvable." };
      if (lit.statut !== "LIBRE") return { success: false, message: "Le nouveau lit n'est pas libre." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.hospitalisation.update({
        where: { id },
        data: {
          serviceId: input.serviceId ?? null,
          medecinId: input.medecinId ?? null,
          litId: newLitId,
          motif: input.motif?.trim() || null,
          diagnostic: input.diagnostic?.trim() || null,
          ...(input.statut ? { statut: input.statut } : {}),
        },
      });

      if (current.litId && current.litId !== newLitId) {
        await tx.lit.update({ where: { id: current.litId }, data: { statut: "LIBRE" } });
      }
      if (newLitId && current.litId !== newLitId) {
        await tx.lit.update({ where: { id: newLitId }, data: { statut: "OCCUPE" } });
      }
    });

    revalidatePath(PATH);
    revalidatePath(`/hospitalisation/hospitalisations/${id}`);
    revalidatePath("/hospitalisation/lits");
    return { success: true, message: "Hospitalisation modifiée avec succès." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de modifier l'hospitalisation." };
  }
}

export async function terminerHospitalisation(id: number): Promise<ActionResult> {
  try {
    const current = await prisma.hospitalisation.findUnique({ where: { id } });
    if (!current) return { success: false, message: "Hospitalisation introuvable." };
    if (current.statut !== "EN_COURS") return { success: false, message: "Cette hospitalisation est déjà terminée." };

    await prisma.$transaction(async (tx) => {
      await tx.hospitalisation.update({ where: { id }, data: { statut: "TERMINEE", dateSortie: new Date() } });
      if (current.litId) await tx.lit.update({ where: { id: current.litId }, data: { statut: "LIBRE" } });
    });

    revalidatePath(PATH);
    revalidatePath("/hospitalisation/lits");
    revalidatePath(`/hospitalisation/hospitalisations/${id}`);
    return { success: true, message: "Hospitalisation terminée." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de terminer l'hospitalisation." };
  }
}

export async function deleteHospitalisation(id: number): Promise<ActionResult> {
  try {
    const current = await prisma.hospitalisation.findUnique({ where: { id } });
    if (!current) return { success: false, message: "Hospitalisation introuvable." };
    if (current.statut === "EN_COURS") return { success: false, message: "Impossible de supprimer une hospitalisation en cours. Faites d'abord une sortie." };

    await prisma.$transaction(async (tx) => {
      await tx.hospitalisation.delete({ where: { id } });
      if (current.litId) await tx.lit.update({ where: { id: current.litId }, data: { statut: "LIBRE" } });
    });

    revalidatePath(PATH);
    revalidatePath("/hospitalisation/lits");
    return { success: true, message: "Hospitalisation supprimée." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Impossible de supprimer l'hospitalisation." };
  }
}
