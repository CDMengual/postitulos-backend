/*
  Warnings:

  - You are about to drop the column `aulaId` on the `cursante` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cursante` DROP FOREIGN KEY `Cursante_aulaId_fkey`;

-- DropIndex
DROP INDEX `Cursante_aulaId_fkey` ON `cursante`;

-- AlterTable
ALTER TABLE `cursante` DROP COLUMN `aulaId`;

-- CreateTable
CREATE TABLE `_CursantesEnAulas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CursantesEnAulas_AB_unique`(`A`, `B`),
    INDEX `_CursantesEnAulas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CursantesEnAulas` ADD CONSTRAINT `_CursantesEnAulas_A_fkey` FOREIGN KEY (`A`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CursantesEnAulas` ADD CONSTRAINT `_CursantesEnAulas_B_fkey` FOREIGN KEY (`B`) REFERENCES `Cursante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
