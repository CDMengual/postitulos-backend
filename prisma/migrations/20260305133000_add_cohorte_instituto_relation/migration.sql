-- CreateTable
CREATE TABLE `CohorteInstituto` (
  `cohorteId` INTEGER NOT NULL,
  `institutoId` INTEGER NOT NULL,

  INDEX `CohorteInstituto_institutoId_idx`(`institutoId`),
  PRIMARY KEY (`cohorteId`, `institutoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CohorteInstituto`
ADD CONSTRAINT `CohorteInstituto_cohorteId_fkey`
FOREIGN KEY (`cohorteId`) REFERENCES `cohorte`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CohorteInstituto`
ADD CONSTRAINT `CohorteInstituto_institutoId_fkey`
FOREIGN KEY (`institutoId`) REFERENCES `instituto`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
