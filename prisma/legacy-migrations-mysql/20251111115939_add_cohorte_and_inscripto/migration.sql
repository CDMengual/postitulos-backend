/*
  Warnings:

  - You are about to drop the column `cohorte` on the `aula` table. All the data in the column will be lost.
  - Added the required column `cohorteId` to the `Aula` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `aula` DROP COLUMN `cohorte`,
    ADD COLUMN `cohorteId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Cohorte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anio` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NULL,
    `estado` ENUM('INSCRIPCION', 'ACTIVA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'INSCRIPCION',
    `postituloId` INTEGER NOT NULL,
    `cantidadAulas` INTEGER NULL,
    `cupos` INTEGER NULL,
    `cuposListaEspera` INTEGER NULL,
    `cuposTotales` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscripto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cohorteId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `celular` VARCHAR(191) NULL,
    `datosFormulario` JSON NULL,
    `tituloAdjuntoUrl` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'RECHAZADA', 'ASIGNADA', 'LISTA_ESPERA') NOT NULL DEFAULT 'PENDIENTE',
    `prioridad` INTEGER NULL,
    `listaEspera` BOOLEAN NOT NULL DEFAULT false,
    `condicionada` BOOLEAN NOT NULL DEFAULT false,
    `observaciones` TEXT NULL,
    `documentacion` ENUM('VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE') NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Inscripto_cohorteId_dni_key`(`cohorteId`, `dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_cohorteId_fkey` FOREIGN KEY (`cohorteId`) REFERENCES `Cohorte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cohorte` ADD CONSTRAINT `Cohorte_postituloId_fkey` FOREIGN KEY (`postituloId`) REFERENCES `Postitulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripto` ADD CONSTRAINT `Inscripto_cohorteId_fkey` FOREIGN KEY (`cohorteId`) REFERENCES `Cohorte`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
