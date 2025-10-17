/*
  Warnings:

  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `nominee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Nominee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_nomineeId_fkey`;

-- DropIndex
DROP INDEX `Vote_nomineeId_fkey` ON `vote`;

-- AlterTable
ALTER TABLE `attendance` DROP PRIMARY KEY,
    ADD COLUMN `representativeName` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `nominee` DROP PRIMARY KEY,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `vote` MODIFY `nomineeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_nomineeId_fkey` FOREIGN KEY (`nomineeId`) REFERENCES `Nominee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
