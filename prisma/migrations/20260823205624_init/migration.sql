-- CreateTable
CREATE TABLE "Infirmier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "numeroOrdre" TEXT,
    "grade" TEXT,
    "niveau" TEXT,
    "fonction" TEXT,
    "serviceId" INTEGER,
    "employeId" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Infirmier_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Infirmier_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Infirmier_matricule_key" ON "Infirmier"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Infirmier_employeId_key" ON "Infirmier"("employeId");
