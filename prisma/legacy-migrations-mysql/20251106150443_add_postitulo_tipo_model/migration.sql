-- CreateTable
CREATE TABLE `PostituloTipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ESPECIALIZACION', 'DIPLOMATURA', 'ACTUALIZACION') NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `postituloId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostituloTipo` ADD CONSTRAINT `PostituloTipo_postituloId_fkey` FOREIGN KEY (`postituloId`) REFERENCES `Postitulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
