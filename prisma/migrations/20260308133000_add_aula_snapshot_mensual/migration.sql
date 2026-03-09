CREATE TABLE `AulaSnapshotMensual` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aulaId` INTEGER NOT NULL,
    `fechaCorte` DATETIME(3) NOT NULL,
    `anio` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `totalInicial` INTEGER NOT NULL,
    `activos` INTEGER NOT NULL,
    `adeuda` INTEGER NOT NULL,
    `baja` INTEGER NOT NULL,
    `finalizado` INTEGER NOT NULL,
    `totalFoto` INTEGER NOT NULL,
    `observaciones` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AulaSnapshotMensual_fechaCorte_idx`(`fechaCorte`),
    UNIQUE INDEX `AulaSnapshotMensual_aulaId_anio_mes_key`(`aulaId`, `anio`, `mes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AulaSnapshotMensual`
    ADD CONSTRAINT `AulaSnapshotMensual_aulaId_fkey`
    FOREIGN KEY (`aulaId`) REFERENCES `Aula`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
