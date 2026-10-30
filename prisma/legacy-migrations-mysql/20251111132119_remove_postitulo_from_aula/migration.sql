/*
  Warnings:

  - You are about to drop the column `postituloId` on the `aula` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `aula` DROP FOREIGN KEY `Aula_postituloId_fkey`;

-- DropIndex
DROP INDEX `Aula_postituloId_fkey` ON `aula`;

-- AlterTable
ALTER TABLE `aula` DROP COLUMN `postituloId`;
