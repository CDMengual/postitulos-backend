-- AlterTable
ALTER TABLE `user` MODIFY `rol` ENUM('ADMIN', 'REFERENTE', 'FORMADOR', 'COORDINADOR') NOT NULL DEFAULT 'REFERENTE';

-- CreateTable
CREATE TABLE `Aula` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `cohorte` INTEGER NOT NULL,
    `postituloId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Aula_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cursante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `celular` VARCHAR(191) NULL,
    `aulaId` INTEGER NOT NULL,
    `institutoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cursante_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AdminAulas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AdminAulas_AB_unique`(`A`, `B`),
    INDEX `_AdminAulas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CoordinadorAulas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CoordinadorAulas_AB_unique`(`A`, `B`),
    INDEX `_CoordinadorAulas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ReferenteAulas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ReferenteAulas_AB_unique`(`A`, `B`),
    INDEX `_ReferenteAulas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FormadorAulas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FormadorAulas_AB_unique`(`A`, `B`),
    INDEX `_FormadorAulas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_postituloId_fkey` FOREIGN KEY (`postituloId`) REFERENCES `Postitulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cursante` ADD CONSTRAINT `Cursante_aulaId_fkey` FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cursante` ADD CONSTRAINT `Cursante_institutoId_fkey` FOREIGN KEY (`institutoId`) REFERENCES `Instituto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminAulas` ADD CONSTRAINT `_AdminAulas_A_fkey` FOREIGN KEY (`A`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminAulas` ADD CONSTRAINT `_AdminAulas_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoordinadorAulas` ADD CONSTRAINT `_CoordinadorAulas_A_fkey` FOREIGN KEY (`A`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoordinadorAulas` ADD CONSTRAINT `_CoordinadorAulas_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ReferenteAulas` ADD CONSTRAINT `_ReferenteAulas_A_fkey` FOREIGN KEY (`A`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ReferenteAulas` ADD CONSTRAINT `_ReferenteAulas_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FormadorAulas` ADD CONSTRAINT `_FormadorAulas_A_fkey` FOREIGN KEY (`A`) REFERENCES `Aula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FormadorAulas` ADD CONSTRAINT `_FormadorAulas_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
