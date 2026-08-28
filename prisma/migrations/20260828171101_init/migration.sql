-- AlterTable
ALTER TABLE "Medicament" ADD COLUMN "unite" TEXT;

-- CreateTable
CREATE TABLE "Dispensation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "prescriptionId" INTEGER,
    "pharmacienId" INTEGER,
    "dateDispensation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'TERMINEE',
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dispensation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dispensation_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Dispensation_pharmacienId_fkey" FOREIGN KEY ("pharmacienId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispensationLigne" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dispensationId" INTEGER NOT NULL,
    "prescriptionLigneId" INTEGER,
    "medicamentId" INTEGER NOT NULL,
    "stockId" INTEGER,
    "pharmacienId" INTEGER,
    "quantitePrescrite" REAL,
    "quantiteDispensee" REAL NOT NULL,
    "prixUnitaire" REAL NOT NULL DEFAULT 0,
    "montant" REAL NOT NULL DEFAULT 0,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DispensationLigne_dispensationId_fkey" FOREIGN KEY ("dispensationId") REFERENCES "Dispensation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DispensationLigne_prescriptionLigneId_fkey" FOREIGN KEY ("prescriptionLigneId") REFERENCES "PrescriptionLigne" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DispensationLigne_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DispensationLigne_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "StockMedicament" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DispensationLigne_pharmacienId_fkey" FOREIGN KEY ("pharmacienId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proforma" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "admissionId" INTEGER,
    "hospitalisationId" INTEGER,
    "montantBrut" REAL NOT NULL DEFAULT 0,
    "typeReduction" TEXT,
    "reduction" REAL NOT NULL DEFAULT 0,
    "montantTotal" REAL NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpiration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proforma_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proforma_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Proforma_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Proforma_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProformaLigne" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proformaId" INTEGER NOT NULL,
    "typeOrigine" TEXT NOT NULL,
    "acteId" INTEGER,
    "serviceId" INTEGER,
    "consultationId" INTEGER,
    "demandeLaboratoireId" INTEGER,
    "demandeImagerieId" INTEGER,
    "dispensationId" INTEGER,
    "hospitalisationId" INTEGER,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "prixUnitaire" REAL NOT NULL,
    "montant" REAL NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProformaLigne_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProformaLigne_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "ActeMedical" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProformaLigne_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultationActe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "consultationId" INTEGER NOT NULL,
    "acteId" INTEGER NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "prixUnitaire" REAL NOT NULL,
    "montant" REAL NOT NULL,
    "observation" TEXT,
    "dateActe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationActe_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConsultationActe_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "ActeMedical" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Facture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "admissionId" INTEGER,
    "hospitalisationId" INTEGER,
    "proformaId" INTEGER,
    "dateFacture" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" DATETIME,
    "montantBrut" REAL NOT NULL DEFAULT 0,
    "reduction" REAL NOT NULL DEFAULT 0,
    "montantTotal" REAL NOT NULL DEFAULT 0,
    "montantPaye" REAL NOT NULL DEFAULT 0,
    "reste" REAL NOT NULL DEFAULT 0,
    "typeReduction" TEXT,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "statut" TEXT NOT NULL DEFAULT 'IMPAYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facture_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Facture_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("idConsultation") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Facture_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Facture_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Facture_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Facture" ("createdAt", "dateEcheance", "dateFacture", "devise", "id", "montantPaye", "montantTotal", "numero", "patientId", "reste", "statut", "updatedAt") SELECT "createdAt", "dateEcheance", "dateFacture", "devise", "id", "montantPaye", "montantTotal", "numero", "patientId", "reste", "statut", "updatedAt" FROM "Facture";
DROP TABLE "Facture";
ALTER TABLE "new_Facture" RENAME TO "Facture";
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");
CREATE UNIQUE INDEX "Facture_proformaId_key" ON "Facture"("proformaId");
CREATE INDEX "Facture_patientId_idx" ON "Facture"("patientId");
CREATE INDEX "Facture_consultationId_idx" ON "Facture"("consultationId");
CREATE INDEX "Facture_admissionId_idx" ON "Facture"("admissionId");
CREATE INDEX "Facture_hospitalisationId_idx" ON "Facture"("hospitalisationId");
CREATE INDEX "Facture_dateFacture_idx" ON "Facture"("dateFacture");
CREATE TABLE "new_LigneFacture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factureId" INTEGER NOT NULL,
    "acteId" INTEGER,
    "consultationActeId" INTEGER,
    "serviceId" INTEGER,
    "demandeLaboratoireLigneId" INTEGER,
    "demandeImagerieId" INTEGER,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "prixUnitaire" REAL NOT NULL,
    "montant" REAL NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_acteId_fkey" FOREIGN KEY ("acteId") REFERENCES "ActeMedical" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_consultationActeId_fkey" FOREIGN KEY ("consultationActeId") REFERENCES "ConsultationActe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_demandeLaboratoireLigneId_fkey" FOREIGN KEY ("demandeLaboratoireLigneId") REFERENCES "DemandeLaboratoireLigne" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LigneFacture_demandeImagerieId_fkey" FOREIGN KEY ("demandeImagerieId") REFERENCES "DemandeImagerie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LigneFacture" ("acteId", "designation", "factureId", "id", "montant", "prixUnitaire", "quantite", "reference") SELECT "acteId", "designation", "factureId", "id", "montant", "prixUnitaire", "quantite", "reference" FROM "LigneFacture";
DROP TABLE "LigneFacture";
ALTER TABLE "new_LigneFacture" RENAME TO "LigneFacture";
CREATE INDEX "LigneFacture_factureId_idx" ON "LigneFacture"("factureId");
CREATE INDEX "LigneFacture_acteId_idx" ON "LigneFacture"("acteId");
CREATE INDEX "LigneFacture_consultationActeId_idx" ON "LigneFacture"("consultationActeId");
CREATE INDEX "LigneFacture_serviceId_idx" ON "LigneFacture"("serviceId");
CREATE TABLE "new_MouvementStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicamentId" INTEGER NOT NULL,
    "stockId" INTEGER,
    "type" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "motif" TEXT,
    "reference" TEXT,
    "utilisateurId" INTEGER,
    "dateMouvement" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MouvementStock_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MouvementStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "StockMedicament" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MouvementStock_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MouvementStock" ("dateMouvement", "id", "medicamentId", "motif", "quantite", "reference", "type") SELECT "dateMouvement", "id", "medicamentId", "motif", "quantite", "reference", "type" FROM "MouvementStock";
DROP TABLE "MouvementStock";
ALTER TABLE "new_MouvementStock" RENAME TO "MouvementStock";
CREATE INDEX "MouvementStock_medicamentId_idx" ON "MouvementStock"("medicamentId");
CREATE INDEX "MouvementStock_stockId_idx" ON "MouvementStock"("stockId");
CREATE INDEX "MouvementStock_type_idx" ON "MouvementStock"("type");
CREATE INDEX "MouvementStock_dateMouvement_idx" ON "MouvementStock"("dateMouvement");
CREATE TABLE "new_PrescriptionLigne" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prescriptionId" INTEGER NOT NULL,
    "medicamentId" INTEGER NOT NULL,
    "posologie" TEXT,
    "dose" TEXT,
    "frequence" TEXT,
    "duree" TEXT,
    "voie" TEXT,
    "quantite" REAL NOT NULL DEFAULT 1,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrescriptionLigne_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrescriptionLigne_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrescriptionLigne" ("dose", "duree", "frequence", "id", "medicamentId", "observation", "posologie", "prescriptionId", "quantite", "voie") SELECT "dose", "duree", "frequence", "id", "medicamentId", "observation", "posologie", "prescriptionId", coalesce("quantite", 1) AS "quantite", "voie" FROM "PrescriptionLigne";
DROP TABLE "PrescriptionLigne";
ALTER TABLE "new_PrescriptionLigne" RENAME TO "PrescriptionLigne";
CREATE INDEX "PrescriptionLigne_prescriptionId_idx" ON "PrescriptionLigne"("prescriptionId");
CREATE INDEX "PrescriptionLigne_medicamentId_idx" ON "PrescriptionLigne"("medicamentId");
CREATE TABLE "new_StockMedicament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicamentId" INTEGER NOT NULL,
    "lot" TEXT,
    "dateExpiration" DATETIME,
    "quantite" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockMedicament_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "Medicament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StockMedicament" ("createdAt", "dateExpiration", "id", "lot", "medicamentId", "quantite", "updatedAt") SELECT "createdAt", "dateExpiration", "id", "lot", "medicamentId", "quantite", "updatedAt" FROM "StockMedicament";
DROP TABLE "StockMedicament";
ALTER TABLE "new_StockMedicament" RENAME TO "StockMedicament";
CREATE INDEX "StockMedicament_medicamentId_idx" ON "StockMedicament"("medicamentId");
CREATE INDEX "StockMedicament_dateExpiration_idx" ON "StockMedicament"("dateExpiration");
CREATE INDEX "StockMedicament_lot_idx" ON "StockMedicament"("lot");
CREATE TABLE "new_Transfert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hospitalisationId" INTEGER NOT NULL,
    "ancienServiceId" INTEGER,
    "nouveauServiceId" INTEGER,
    "ancienLitId" INTEGER,
    "nouveauLitId" INTEGER,
    "motif" TEXT,
    "dateTransfert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transfert_hospitalisationId_fkey" FOREIGN KEY ("hospitalisationId") REFERENCES "Hospitalisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transfert_ancienServiceId_fkey" FOREIGN KEY ("ancienServiceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfert_nouveauServiceId_fkey" FOREIGN KEY ("nouveauServiceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfert_ancienLitId_fkey" FOREIGN KEY ("ancienLitId") REFERENCES "Lit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transfert_nouveauLitId_fkey" FOREIGN KEY ("nouveauLitId") REFERENCES "Lit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transfert" ("ancienLitId", "ancienServiceId", "dateTransfert", "hospitalisationId", "id", "motif", "nouveauLitId", "nouveauServiceId") SELECT "ancienLitId", "ancienServiceId", "dateTransfert", "hospitalisationId", "id", "motif", "nouveauLitId", "nouveauServiceId" FROM "Transfert";
DROP TABLE "Transfert";
ALTER TABLE "new_Transfert" RENAME TO "Transfert";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Dispensation_numero_key" ON "Dispensation"("numero");

-- CreateIndex
CREATE INDEX "Dispensation_patientId_idx" ON "Dispensation"("patientId");

-- CreateIndex
CREATE INDEX "Dispensation_prescriptionId_idx" ON "Dispensation"("prescriptionId");

-- CreateIndex
CREATE INDEX "Dispensation_pharmacienId_idx" ON "Dispensation"("pharmacienId");

-- CreateIndex
CREATE INDEX "Dispensation_dateDispensation_idx" ON "Dispensation"("dateDispensation");

-- CreateIndex
CREATE INDEX "DispensationLigne_dispensationId_idx" ON "DispensationLigne"("dispensationId");

-- CreateIndex
CREATE INDEX "DispensationLigne_medicamentId_idx" ON "DispensationLigne"("medicamentId");

-- CreateIndex
CREATE INDEX "DispensationLigne_stockId_idx" ON "DispensationLigne"("stockId");

-- CreateIndex
CREATE INDEX "DispensationLigne_pharmacienId_idx" ON "DispensationLigne"("pharmacienId");

-- CreateIndex
CREATE UNIQUE INDEX "Proforma_numero_key" ON "Proforma"("numero");

-- CreateIndex
CREATE INDEX "Proforma_patientId_idx" ON "Proforma"("patientId");

-- CreateIndex
CREATE INDEX "Proforma_consultationId_idx" ON "Proforma"("consultationId");

-- CreateIndex
CREATE INDEX "Proforma_admissionId_idx" ON "Proforma"("admissionId");

-- CreateIndex
CREATE INDEX "Proforma_hospitalisationId_idx" ON "Proforma"("hospitalisationId");

-- CreateIndex
CREATE INDEX "Proforma_dateEmission_idx" ON "Proforma"("dateEmission");

-- CreateIndex
CREATE INDEX "ProformaLigne_proformaId_idx" ON "ProformaLigne"("proformaId");

-- CreateIndex
CREATE INDEX "ProformaLigne_consultationId_idx" ON "ProformaLigne"("consultationId");

-- CreateIndex
CREATE INDEX "ProformaLigne_demandeLaboratoireId_idx" ON "ProformaLigne"("demandeLaboratoireId");

-- CreateIndex
CREATE INDEX "ProformaLigne_demandeImagerieId_idx" ON "ProformaLigne"("demandeImagerieId");

-- CreateIndex
CREATE INDEX "ProformaLigne_dispensationId_idx" ON "ProformaLigne"("dispensationId");

-- CreateIndex
CREATE INDEX "ProformaLigne_hospitalisationId_idx" ON "ProformaLigne"("hospitalisationId");

-- CreateIndex
CREATE INDEX "ConsultationActe_consultationId_idx" ON "ConsultationActe"("consultationId");

-- CreateIndex
CREATE INDEX "ConsultationActe_acteId_idx" ON "ConsultationActe"("acteId");

-- CreateIndex
CREATE INDEX "Medicament_nom_idx" ON "Medicament"("nom");

-- CreateIndex
CREATE INDEX "Medicament_categorie_idx" ON "Medicament"("categorie");

-- CreateIndex
CREATE INDEX "Medicament_actif_idx" ON "Medicament"("actif");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_medecinId_idx" ON "Prescription"("medecinId");

-- CreateIndex
CREATE INDEX "Prescription_datePrescription_idx" ON "Prescription"("datePrescription");
