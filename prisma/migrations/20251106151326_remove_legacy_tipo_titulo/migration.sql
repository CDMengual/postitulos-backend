/*
  Warnings:

  - You are about to drop the column `tipo` on the `postitulo` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `postitulo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `postitulo` DROP COLUMN `tipo`,
    DROP COLUMN `titulo`;
