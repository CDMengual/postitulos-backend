-- CreateTable
CREATE TABLE `Postitulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ESPECIALIZACION', 'DIPLOMATURA', 'ACTUALIZACION') NOT NULL,
    `destinatarios` VARCHAR(191) NULL,
    `descripcion` VARCHAR(191) NULL,
    `autores` VARCHAR(191) NULL,
    `titulo` VARCHAR(191) NULL,
    `resolucion` VARCHAR(191) NULL,
    `planEstudios` VARCHAR(191) NULL,
    `resolucionPuntaje` VARCHAR(191) NULL,
    `dictamen` VARCHAR(191) NULL,
    `modalidad` VARCHAR(191) NULL,
    `cargaHoraria` INTEGER NULL,
    `horasSincronicas` INTEGER NULL,
    `horasVirtuales` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
