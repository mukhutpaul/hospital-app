-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Infirmier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "numeroOrdre" TEXT,
    "grade" TEXT,
    "niveau" TEXT,
    "fonction" TEXT,
    "serviceId" INTEGER,
    "employeId" INTEGER NOT NULL,
    "userId" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Infirmier_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Infirmier_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Infirmier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Infirmier" ("actif", "createdAt", "employeId", "fonction", "grade", "id", "matricule", "niveau", "numeroOrdre", "serviceId", "updatedAt") SELECT "actif", "createdAt", "employeId", "fonction", "grade", "id", "matricule", "niveau", "numeroOrdre", "serviceId", "updatedAt" FROM "Infirmier";
DROP TABLE "Infirmier";
ALTER TABLE "new_Infirmier" RENAME TO "Infirmier";
CREATE UNIQUE INDEX "Infirmier_matricule_key" ON "Infirmier"("matricule");
CREATE UNIQUE INDEX "Infirmier_employeId_key" ON "Infirmier"("employeId");
CREATE UNIQUE INDEX "Infirmier_userId_key" ON "Infirmier"("userId");
CREATE TABLE "new_Medecin" (
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
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medecin_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Medecin_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Medecin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Medecin" ("actif", "createdAt", "email", "id", "matricule", "nom", "numeroOrdre", "postNom", "prenom", "serviceId", "specialiteId", "telephone", "updatedAt") SELECT "actif", "createdAt", "email", "id", "matricule", "nom", "numeroOrdre", "postNom", "prenom", "serviceId", "specialiteId", "telephone", "updatedAt" FROM "Medecin";
DROP TABLE "Medecin";
ALTER TABLE "new_Medecin" RENAME TO "Medecin";
CREATE UNIQUE INDEX "Medecin_matricule_key" ON "Medecin"("matricule");
CREATE UNIQUE INDEX "Medecin_userId_key" ON "Medecin"("userId");
CREATE TABLE "new_ResultatLaboratoire" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demandeId" INTEGER NOT NULL,
    "examenId" INTEGER NOT NULL,
    "valeur" TEXT,
    "unite" TEXT,
    "commentaire" TEXT,
    "interpretation" TEXT,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "dateResultat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResultatLaboratoire_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeLaboratoire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResultatLaboratoire_examenId_fkey" FOREIGN KEY ("examenId") REFERENCES "ExamenLaboratoire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResultatLaboratoire" ("commentaire", "dateResultat", "demandeId", "examenId", "id", "interpretation", "unite", "valeur", "valide") SELECT "commentaire", "dateResultat", "demandeId", "examenId", "id", "interpretation", "unite", "valeur", "valide" FROM "ResultatLaboratoire";
DROP TABLE "ResultatLaboratoire";
ALTER TABLE "new_ResultatLaboratoire" RENAME TO "ResultatLaboratoire";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
