-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "roleId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postNom" TEXT,
    "prenom" TEXT,
    "sexe" TEXT,
    "dateNaissance" DATETIME,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "fonction" TEXT,
    "dateEmbauche" DATETIME,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER,
    "serviceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employe_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Departement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "departementId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "serviceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Specialite_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medecin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postNom" TEXT,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "numeroOrdre" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "serviceId" INTEGER,
    "specialiteId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medecin_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Medecin_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroDossier" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postNom" TEXT,
    "prenom" TEXT,
    "sexe" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "lieuNaissance" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "profession" TEXT,
    "nationalite" TEXT,
    "etatCivil" TEXT,
    "groupeSanguin" TEXT,
    "rhesus" TEXT,
    "personneContact" TEXT,
    "contactTelephone" TEXT,
    "contactLien" TEXT,
    "photo" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Allergie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "allergene" TEXT NOT NULL,
    "reaction" TEXT,
    "gravite" TEXT,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Allergie_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Antecedent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "dateDebut" DATETIME,
    "dateFin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Antecedent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medecinId" INTEGER,
    "specialiteId" INTEGER,
    "serviceId" INTEGER,
    "dateHeure" DATETIME NOT NULL,
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "observation" TEXT,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RendezVous_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RendezVous_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RendezVous_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RendezVous_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RendezVous_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "rendezVousId" INTEGER,
    "serviceId" INTEGER,
    "type" TEXT NOT NULL,
    "motif" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateAdmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSortie" DATETIME,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Admission_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Admission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Triage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admissionId" INTEGER NOT NULL,
    "niveauUrgence" TEXT,
    "motif" TEXT,
    "observation" TEXT,
    "dateTriage" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Triage_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Constante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "admissionId" INTEGER,
    "consultationId" INTEGER,
    "temperature" REAL,
    "tensionSystolique" REAL,
    "tensionDiastolique" REAL,
    "pouls" INTEGER,
    "saturation" REAL,
    "poids" REAL,
    "taille" REAL,
    "frequenceRespiratoire" INTEGER,
    "glycemie" REAL,
    "dateMesure" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Constante_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Constante_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Constante_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultation" (
    "idConsultation" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateConsultation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT,
    "diagnostic" TEXT,
    "observation" TEXT,
    "conclusion" TEXT,
    "patientId" INTEGER NOT NULL,
    "medecinId" INTEGER NOT NULL,
    "userMedecinId" INTEGER,
    "serviceId" INTEGER,
    "specialiteId" INTEGER,
    "admissionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_userMedecinId_fkey" FOREIGN KEY ("userMedecinId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Consultation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Consultation_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Consultation_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "medecinId" INTEGER NOT NULL,
    "datePrescription" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',
    "auteurId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prescription_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrescriptionLigne" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prescriptionId" INTEGER NOT NULL,
    "medicamentId" INTEGER NOT NULL,
    "posologie" TEXT,
    "dose" TEXT,
    "frequence" TEXT,
    "duree" TEXT,
    "voie" TEXT,
    "quantite" REAL,
    "observation" TEXT,
    CONSTRAINT "PrescriptionLigne_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrescriptionLigne_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamenLaboratoire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "unite" TEXT,
    "valeurNormale" TEXT,
    "prix" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DemandeLaboratoire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "serviceId" INTEGER,
    "dateDemande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'DEMANDE',
    "urgence" BOOLEAN NOT NULL DEFAULT false,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DemandeLaboratoire_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DemandeLaboratoire_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DemandeLaboratoire_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandeLaboratoireLigne" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demandeId" INTEGER NOT NULL,
    "examenId" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    CONSTRAINT "DemandeLaboratoireLigne_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeLaboratoire" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DemandeLaboratoireLigne_examenId_fkey" FOREIGN KEY ("examenId") REFERENCES "ExamenLaboratoire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultatLaboratoire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demandeId" INTEGER NOT NULL,
    "examenId" INTEGER NOT NULL,
    "valeur" TEXT,
    "unite" TEXT,
    "commentaire" TEXT,
    "interpretation" TEXT,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "dateResultat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResultatLaboratoire_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeLaboratoire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamenImagerie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "prix" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DemandeImagerie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "serviceId" INTEGER,
    "examenId" INTEGER NOT NULL,
    "motif" TEXT,
    "urgence" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'DEMANDE',
    "dateDemande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExamen" DATETIME,
    "compteRendu" TEXT,
    "conclusion" TEXT,
    "fichier" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DemandeImagerie_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DemandeImagerie_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DemandeImagerie_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DemandeImagerie_examenId_fkey" FOREIGN KEY ("examenId") REFERENCES "ExamenImagerie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "denomination" TEXT,
    "forme" TEXT,
    "dosage" TEXT,
    "laboratoire" TEXT,
    "categorie" TEXT,
    "prixVente" REAL NOT NULL DEFAULT 0,
    "prixAchat" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "seuilAlerte" REAL NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockMedicament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicamentId" INTEGER NOT NULL,
    "lot" TEXT,
    "dateExpiration" DATETIME,
    "quantite" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockMedicament_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicamentId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "motif" TEXT,
    "reference" TEXT,
    "dateMouvement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MouvementStock_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chambre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "type" TEXT,
    "etage" TEXT,
    "prixJournalier" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "serviceId" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chambre_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "chambreId" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'LIBRE',
    CONSTRAINT "Lit_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "Chambre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hospitalisation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "serviceId" INTEGER,
    "medecinId" INTEGER,
    "litId" INTEGER,
    "motif" TEXT,
    "diagnostic" TEXT,
    "dateEntree" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSortie" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hospitalisation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hospitalisation_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hospitalisation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hospitalisation_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "Medecin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hospitalisation_litId_fkey" FOREIGN KEY ("litId") REFERENCES "Lit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transfert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hospitalisationId" INTEGER NOT NULL,
    "ancienServiceId" INTEGER,
    "nouveauServiceId" INTEGER,
    "ancienLitId" INTEGER,
    "nouveauLitId" INTEGER,
    "motif" TEXT,
    "dateTransfert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transfert_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Soin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hospitalisationId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "observation" TEXT,
    "dateSoin" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Soin_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sortie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "hospitalisationId" INTEGER,
    "motif" TEXT,
    "diagnosticFinal" TEXT,
    "recommandation" TEXT,
    "traitement" TEXT,
    "dateSortie" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    CONSTRAINT "Sortie_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sortie_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActeMedical" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT,
    "montant" REAL NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "dateFacture" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" DATETIME,
    "montantTotal" REAL NOT NULL DEFAULT 0,
    "montantPaye" REAL NOT NULL DEFAULT 0,
    "reste" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "statut" TEXT NOT NULL DEFAULT 'IMPAYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facture_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LigneFacture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factureId" INTEGER NOT NULL,
    "acteId" INTEGER,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "prixUnitaire" REAL NOT NULL,
    "montant" REAL NOT NULL,
    "reference" TEXT,
    CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "ActeMedical" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "factureId" INTEGER,
    "montant" REAL NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "modePaiement" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PAYE',
    "datePaiement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "caissierId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Paiement_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paiement_caissierId_fkey" FOREIGN KEY ("caissierId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assurance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "tauxCouverture" REAL NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PatientAssurance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "assuranceId" INTEGER NOT NULL,
    "numeroCarte" TEXT,
    "numeroPolice" TEXT,
    "dateDebut" DATETIME,
    "dateFin" DATETIME,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PatientAssurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientAssurance_assuranceId_fkey" FOREIGN KEY ("assuranceId") REFERENCES "Assurance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentPatient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fichier" TEXT NOT NULL,
    "description" TEXT,
    "dateDocument" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "tableName" TEXT,
    "recordId" TEXT,
    "ancienneValeur" TEXT,
    "nouvelleValeur" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_key" ON "Role"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Employe_matricule_key" ON "Employe"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Employe_userId_key" ON "Employe"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Departement_code_key" ON "Departement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Specialite_code_key" ON "Specialite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Medecin_matricule_key" ON "Medecin"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_numeroDossier_key" ON "Patient"("numeroDossier");

-- CreateIndex
CREATE INDEX "Patient_nom_postNom_prenom_idx" ON "Patient"("nom", "postNom", "prenom");

-- CreateIndex
CREATE INDEX "Patient_telephone_idx" ON "Patient"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "RendezVous_numero_key" ON "RendezVous"("numero");

-- CreateIndex
CREATE INDEX "RendezVous_patientId_idx" ON "RendezVous"("patientId");

-- CreateIndex
CREATE INDEX "RendezVous_medecinId_idx" ON "RendezVous"("medecinId");

-- CreateIndex
CREATE INDEX "RendezVous_dateHeure_idx" ON "RendezVous"("dateHeure");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_numero_key" ON "Admission"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_rendezVousId_key" ON "Admission"("rendezVousId");

-- CreateIndex
CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");

-- CreateIndex
CREATE INDEX "Admission_dateAdmission_idx" ON "Admission"("dateAdmission");

-- CreateIndex
CREATE UNIQUE INDEX "Triage_admissionId_key" ON "Triage"("admissionId");

-- CreateIndex
CREATE INDEX "Constante_patientId_idx" ON "Constante"("patientId");

-- CreateIndex
CREATE INDEX "Constante_admissionId_idx" ON "Constante"("admissionId");

-- CreateIndex
CREATE INDEX "Constante_consultationId_idx" ON "Constante"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_admissionId_key" ON "Consultation"("admissionId");

-- CreateIndex
CREATE INDEX "Consultation_patientId_idx" ON "Consultation"("patientId");

-- CreateIndex
CREATE INDEX "Consultation_medecinId_idx" ON "Consultation"("medecinId");

-- CreateIndex
CREATE INDEX "Consultation_dateConsultation_idx" ON "Consultation"("dateConsultation");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_numero_key" ON "Prescription"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ExamenLaboratoire_code_key" ON "ExamenLaboratoire"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeLaboratoire_numero_key" ON "DemandeLaboratoire"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ExamenImagerie_code_key" ON "ExamenImagerie"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeImagerie_numero_key" ON "DemandeImagerie"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Medicament_code_key" ON "Medicament"("code");

-- CreateIndex
CREATE INDEX "StockMedicament_medicamentId_idx" ON "StockMedicament"("medicamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Chambre_numero_key" ON "Chambre"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Lit_chambreId_numero_key" ON "Lit"("chambreId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Hospitalisation_numero_key" ON "Hospitalisation"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Hospitalisation_admissionId_key" ON "Hospitalisation"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActeMedical_code_key" ON "ActeMedical"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_reference_key" ON "Paiement"("reference");

-- CreateIndex
CREATE INDEX "Paiement_patientId_idx" ON "Paiement"("patientId");

-- CreateIndex
CREATE INDEX "Paiement_factureId_idx" ON "Paiement"("factureId");

-- CreateIndex
CREATE INDEX "Paiement_datePaiement_idx" ON "Paiement"("datePaiement");

-- CreateIndex
CREATE UNIQUE INDEX "Assurance_code_key" ON "Assurance"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAssurance_patientId_assuranceId_key" ON "PatientAssurance"("patientId", "assuranceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
