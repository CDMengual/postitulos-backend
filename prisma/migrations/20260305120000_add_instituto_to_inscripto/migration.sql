-- AlterTable
ALTER TABLE `inscripto`
ADD COLUMN `institutoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `inscripto`
ADD CONSTRAINT `inscripto_institutoId_fkey`
FOREIGN KEY (`institutoId`) REFERENCES `instituto`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
