-- DropForeignKey
ALTER TABLE `cursanteaula` DROP FOREIGN KEY `CursanteAula_aulaId_fkey`;

-- DropForeignKey
ALTER TABLE `cursanteaula` DROP FOREIGN KEY `CursanteAula_cursanteId_fkey`;

-- DropIndex
DROP INDEX `CursanteAula_aulaId_fkey` ON `cursanteaula`;

-- AddForeignKey
ALTER TABLE `CursanteAula` ADD CONSTRAINT `CursanteAula_cursanteId_fkey` FOREIGN KEY (`cursanteId`) REFERENCES `Cursante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursanteAula` ADD CONSTRAINT `CursanteAula_aulaId_fkey` FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
