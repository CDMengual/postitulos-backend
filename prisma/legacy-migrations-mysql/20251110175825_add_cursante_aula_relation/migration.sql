/*
  Warnings:

  - You are about to drop the column `documentacion` on the `cursante` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `cursante` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `cursante` table. All the data in the column will be lost.
  - You are about to drop the `_cursantesenaulas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_cursantesenaulas` DROP FOREIGN KEY `_CursantesEnAulas_A_fkey`;

-- DropForeignKey
ALTER TABLE `_cursantesenaulas` DROP FOREIGN KEY `_CursantesEnAulas_B_fkey`;

-- AlterTable
ALTER TABLE `cursante` DROP COLUMN `documentacion`,
    DROP COLUMN `estado`,
    DROP COLUMN `observaciones`;

-- DropTable
DROP TABLE `_cursantesenaulas`;

-- CreateTable
CREATE TABLE `CursanteAula` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cursanteId` INTEGER NOT NULL,
    `aulaId` INTEGER NOT NULL,
    `estado` ENUM('ACTIVO', 'ADEUDA', 'BAJA') NOT NULL DEFAULT 'ACTIVO',
    `documentacion` ENUM('VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE') NOT NULL DEFAULT 'PENDIENTE',
    `observaciones` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CursanteAula_cursanteId_aulaId_key`(`cursanteId`, `aulaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CursanteAula` ADD CONSTRAINT `CursanteAula_cursanteId_fkey` FOREIGN KEY (`cursanteId`) REFERENCES `Cursante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursanteAula` ADD CONSTRAINT `CursanteAula_aulaId_fkey` FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
