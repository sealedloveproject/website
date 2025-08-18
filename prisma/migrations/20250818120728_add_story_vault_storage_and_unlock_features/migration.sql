-- AlterTable
ALTER TABLE `Story` ADD COLUMN `storeInVault` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `unlockDate` DATETIME(3) NULL,
    ADD COLUMN `unlockPasswordHash` VARCHAR(191) NULL;
