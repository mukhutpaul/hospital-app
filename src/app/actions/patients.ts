"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type Result<T = unknown> = { success: boolean; message: string; data?: T };
const PATIENTS_PATH = "/patients";

function numeroDossier() {
  const d = new Date();
  const y = d.getFullYear();
  const r = Math.floor(100000 + Math.random() * 900000);
  return `PAT-${y}-${r}`;
}

async function saveFile(file: File, folder: "patients" | "documents") {
  if (!file || file.size === 0) return null;
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) throw new Error("Format de fichier non autorisé.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Le fichier ne doit pas dépasser 5 Mo.");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${folder}/${name}`;
}

export async function getPatients(search = ""): Promise<Result> {
  try {
    const q = search.trim();
    const patients = await prisma.patient.findMany({
      where: q ? { OR: [
        { nom: { contains: q } }, { postNom: { contains: q } }, { prenom: { contains: q } },
        { numeroDossier: { contains: q } }, { telephone: { contains: q } },
      ] } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, message: "Patients récupérés.", data: patients };
  } catch (e) { return { success: false, message: e instanceof Error ? e.message : "Erreur." }; }
}

export async function getPatient(id: number): Promise<Result> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        allergies: { orderBy: { createdAt: "desc" } },
        antecedents: { orderBy: { createdAt: "desc" } },
        constantes: { orderBy: { dateMesure: "desc" } },
        documents: { orderBy: { dateDocument: "desc" } },
        rendezVous: { include: { medecin: true, service: true, specialite: true }, orderBy: { dateHeure: "desc" } },
        admissions: { include: { service: true, triage: true }, orderBy: { dateAdmission: "desc" } },
        consultations: { include: { medecin: true, service: true, specialite: true }, orderBy: { dateConsultation: "desc" } },
        hospitalisations: { include: { service: true, medecin: true, lit: { include: { chambre: true } }, transferts: { include: { ancienService: true, nouveauService: true, ancienLit: true, nouveauLit: true }, orderBy: { dateTransfert: "desc" } }, soins: { orderBy: { dateSoin: "desc" } }, sorties: { orderBy: { dateSortie: "desc" } } }, orderBy: { dateEntree: "desc" } },
        factures: { include: { paiements: true, lignes: true }, orderBy: { dateFacture: "desc" } },
        paiements: { orderBy: { datePaiement: "desc" } },
        assurances: { include: { assurance: true } },
        prescriptions: { include: { medecin: true, lignes: { include: { medicament: true } } }, orderBy: { datePrescription: "desc" } },
        demandesLabo: { include: { lignes: { include: { examen: true } }, resultats: { include: { examen: true } } }, orderBy: { dateDemande: "desc" } },
        demandesImagerie: { include: { examen: true }, orderBy: { dateDemande: "desc" } },
        dispensations: { include: { lignes: { include: { medicament: true } } }, orderBy: { dateDispensation: "desc" } },
      },
    });
    if (!patient) return { success: false, message: "Patient introuvable." };
    return { success: true, message: "Dossier récupéré.", data: patient };
  } catch (e) { return { success: false, message: e instanceof Error ? e.message : "Erreur de lecture du dossier." }; }
}

export async function createPatient(formData: FormData): Promise<Result> {
  try {
    const photoFile = formData.get("photoFile");
    const photo = photoFile instanceof File && photoFile.size ? await saveFile(photoFile, "patients") : null;
    const patient = await prisma.patient.create({ data: {
      numeroDossier: numeroDossier(), nom: String(formData.get("nom") || "").trim(), postNom: String(formData.get("postNom") || "").trim() || null,
      prenom: String(formData.get("prenom") || "").trim() || null, sexe: String(formData.get("sexe") || "").trim(),
      dateNaissance: formData.get("dateNaissance") ? new Date(String(formData.get("dateNaissance"))) : null,
      lieuNaissance: String(formData.get("lieuNaissance") || "").trim() || null, telephone: String(formData.get("telephone") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null, adresse: String(formData.get("adresse") || "").trim() || null,
      profession: String(formData.get("profession") || "").trim() || null, nationalite: String(formData.get("nationalite") || "").trim() || null,
      etatCivil: String(formData.get("etatCivil") || "").trim() || null, groupeSanguin: String(formData.get("groupeSanguin") || "").trim() || null,
      rhesus: String(formData.get("rhesus") || "").trim() || null, personneContact: String(formData.get("personneContact") || "").trim() || null,
      contactTelephone: String(formData.get("contactTelephone") || "").trim() || null, contactLien: String(formData.get("contactLien") || "").trim() || null,
      photo, actif: true,
    }});
    revalidatePath(PATIENTS_PATH); return { success: true, message: "Patient créé avec succès.", data: patient };
  } catch (e) { return { success: false, message: e instanceof Error ? e.message : "Impossible de créer le patient." }; }
}

export async function updatePatient(id: number, formData: FormData): Promise<Result> {
  try {
    const photoFile = formData.get("photoFile");
    const photo = photoFile instanceof File && photoFile.size ? await saveFile(photoFile, "patients") : undefined;
    const data: any = {
      nom: String(formData.get("nom") || "").trim(), postNom: String(formData.get("postNom") || "").trim() || null, prenom: String(formData.get("prenom") || "").trim() || null,
      sexe: String(formData.get("sexe") || "").trim(), dateNaissance: formData.get("dateNaissance") ? new Date(String(formData.get("dateNaissance"))) : null,
      lieuNaissance: String(formData.get("lieuNaissance") || "").trim() || null, telephone: String(formData.get("telephone") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null, adresse: String(formData.get("adresse") || "").trim() || null, profession: String(formData.get("profession") || "").trim() || null,
      nationalite: String(formData.get("nationalite") || "").trim() || null, etatCivil: String(formData.get("etatCivil") || "").trim() || null,
      groupeSanguin: String(formData.get("groupeSanguin") || "").trim() || null, rhesus: String(formData.get("rhesus") || "").trim() || null,
      personneContact: String(formData.get("personneContact") || "").trim() || null, contactTelephone: String(formData.get("contactTelephone") || "").trim() || null,
      contactLien: String(formData.get("contactLien") || "").trim() || null,
    };
    if (photo) data.photo = photo;
    const patient = await prisma.patient.update({ where: { id }, data });
    revalidatePath(PATIENTS_PATH); revalidatePath(`/patients/${id}`); return { success: true, message: "Patient modifié avec succès.", data: patient };
  } catch (e) { return { success: false, message: e instanceof Error ? e.message : "Impossible de modifier le patient." }; }
}

export async function togglePatient(id: number): Promise<Result> {
  try { const p = await prisma.patient.findUnique({ where: { id } }); if (!p) return { success: false, message: "Patient introuvable." }; await prisma.patient.update({ where: { id }, data: { actif: !p.actif } }); revalidatePath(PATIENTS_PATH); return { success: true, message: p.actif ? "Patient désactivé." : "Patient activé." }; }
  catch (e) { return { success: false, message: e instanceof Error ? e.message : "Erreur." }; }
}

export async function deletePatient(id: number): Promise<Result> {
  try { await prisma.patient.delete({ where: { id } }); revalidatePath(PATIENTS_PATH); return { success: true, message: "Patient supprimé." }; }
  catch { return { success: false, message: "Suppression impossible : ce patient possède probablement des données liées. Désactivez-le plutôt." }; }
}

export async function addDocument(formData: FormData): Promise<Result> {
  try {
    const patientId = Number(formData.get("patientId")); const file = formData.get("file");
    if (!patientId || !(file instanceof File) || !file.size) return { success: false, message: "Patient et fichier obligatoires." };
    const fichier = await saveFile(file, "documents");
    const doc = await prisma.documentPatient.create({ data: { patientId, type: String(formData.get("type") || "AUTRE"), nom: String(formData.get("nom") || file.name), fichier: fichier!, description: String(formData.get("description") || "").trim() || null } });
    revalidatePath(`/patients/${patientId}`); return { success: true, message: "Document ajouté.", data: doc };
  } catch (e) { return { success: false, message: e instanceof Error ? e.message : "Impossible d'ajouter le document." }; }
}

export async function deleteDocument(id: number, patientId: number): Promise<Result> {
  try { await prisma.documentPatient.delete({ where: { id } }); revalidatePath(`/patients/${patientId}`); return { success: true, message: "Document supprimé." }; }
  catch { return { success: false, message: "Document introuvable." }; }
}

export async function addConstante(data: { patientId: number; admissionId?: number | null; consultationId?: number | null; temperature?: number | null; tensionSystolique?: number | null; tensionDiastolique?: number | null; pouls?: number | null; saturation?: number | null; poids?: number | null; taille?: number | null; frequenceRespiratoire?: number | null; glycemie?: number | null }): Promise<Result> {
  try { const c = await prisma.constante.create({ data: { ...data, admissionId: data.admissionId || null, consultationId: data.consultationId || null } }); revalidatePath(`/patients/${data.patientId}`); return { success: true, message: "Constantes enregistrées.", data: c }; }
  catch (e) { return { success: false, message: e instanceof Error ? e.message : "Impossible d'enregistrer les constantes." }; }
}

export async function deleteConstante(id: number, patientId: number): Promise<Result> {
  try { await prisma.constante.delete({ where: { id } }); revalidatePath(`/patients/${patientId}`); return { success: true, message: "Constante supprimée." }; }
  catch { return { success: false, message: "Constante introuvable." }; }
}

export async function addAllergie(data: { patientId: number; allergene: string; reaction?: string; gravite?: string; description?: string }): Promise<Result> {
  try { const x = await prisma.allergie.create({ data: { ...data, reaction: data.reaction || null, gravite: data.gravite || null, description: data.description || null } }); revalidatePath(`/patients/${data.patientId}`); return { success: true, message: "Allergie ajoutée.", data: x }; } catch { return { success: false, message: "Impossible d'ajouter l'allergie." }; }
}
export async function deleteAllergie(id: number, patientId: number): Promise<Result> { try { await prisma.allergie.delete({ where: { id } }); revalidatePath(`/patients/${patientId}`); return { success: true, message: "Allergie supprimée." }; } catch { return { success: false, message: "Allergie introuvable." }; } }
export async function addAntecedent(data: { patientId: number; type: string; libelle: string; description?: string; dateDebut?: string; dateFin?: string }): Promise<Result> { try { const x = await prisma.antecedent.create({ data: { patientId: data.patientId, type: data.type, libelle: data.libelle, description: data.description || null, dateDebut: data.dateDebut ? new Date(data.dateDebut) : null, dateFin: data.dateFin ? new Date(data.dateFin) : null } }); revalidatePath(`/patients/${data.patientId}`); return { success: true, message: "Antécédent ajouté.", data: x }; } catch { return { success: false, message: "Impossible d'ajouter l'antécédent." }; } }
export async function deleteAntecedent(id: number, patientId: number): Promise<Result> { try { await prisma.antecedent.delete({ where: { id } }); revalidatePath(`/patients/${patientId}`); return { success: true, message: "Antécédent supprimé." }; } catch { return { success: false, message: "Antécédent introuvable." }; } }
