/*
  Warnings:

  - Made the column `institutoId` on table `aula` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `aula` DROP FOREIGN KEY `Aula_institutoId_fkey`;

-- DropIndex
DROP INDEX `Aula_institutoId_fkey` ON `aula`;

-- AlterTable
ALTER TABLE `aula` MODIFY `institutoId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_institutoId_fkey` FOREIGN KEY (`institutoId`) REFERENCES `Instituto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
