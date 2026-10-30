/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Postitulo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero` to the `Aula` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `aula` ADD COLUMN `numero` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `postitulo` ADD COLUMN `codigo` VARCHAR(191) NULL DEFAULT 'TEMP';

-- CreateIndex
CREATE UNIQUE INDEX `Postitulo_codigo_key` ON `Postitulo`(`codigo`);
