/*
  Warnings:

  - The values [ADEUDANDO] on the enum `Cursante_estado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `cursante` MODIFY `estado` ENUM('ACTIVO', 'ADEUDA', 'BAJA') NOT NULL DEFAULT 'ACTIVO';
