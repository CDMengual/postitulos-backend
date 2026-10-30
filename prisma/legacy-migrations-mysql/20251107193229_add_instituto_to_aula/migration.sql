/*
  Warnings:

  - You are about to drop the column `institutoId` on the `cursante` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cursante` DROP FOREIGN KEY `Cursante_institutoId_fkey`;

-- DropIndex
DROP INDEX `Cursante_institutoId_fkey` ON `cursante`;

-- AlterTable
ALTER TABLE `aula` ADD COLUMN `institutoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `cursante` DROP COLUMN `institutoId`;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_institutoId_fkey` FOREIGN KEY (`institutoId`) REFERENCES `Instituto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
