-- AlterTable
ALTER TABLE `cohorte` ADD COLUMN `formularioId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Formulario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `campos` JSON NOT NULL,
    `postituloId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cohorte` ADD CONSTRAINT `Cohorte_formularioId_fkey` FOREIGN KEY (`formularioId`) REFERENCES `Formulario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Formulario` ADD CONSTRAINT `Formulario_postituloId_fkey` FOREIGN KEY (`postituloId`) REFERENCES `Postitulo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
