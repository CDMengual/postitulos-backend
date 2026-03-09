-- AlterTable
ALTER TABLE `cursante`
ADD COLUMN `regionId` INTEGER NULL,
ADD COLUMN `distritoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `cursanteaula`
ADD COLUMN `dniAdjuntoUrl` VARCHAR(191) NULL,
ADD COLUMN `tituloAdjuntoUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Cursante_regionId_idx` ON `cursante`(`regionId`);
CREATE INDEX `Cursante_distritoId_idx` ON `cursante`(`distritoId`);

-- AddForeignKey
ALTER TABLE `cursante`
ADD CONSTRAINT `Cursante_regionId_fkey`
FOREIGN KEY (`regionId`) REFERENCES `region`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cursante`
ADD CONSTRAINT `Cursante_distritoId_fkey`
FOREIGN KEY (`distritoId`) REFERENCES `distrito`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
