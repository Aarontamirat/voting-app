/*
  Warnings:

  - The primary key for the `vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `castByRepresentativeId` on the `vote` table. All the data in the column will be lost.
  - You are about to drop the column `shareholderId` on the `vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[meetingId,nomineeId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `voterId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_shareholderId_fkey`;

-- DropIndex
DROP INDEX `Vote_meetingId_nomineeId_shareholderId_key` ON `vote`;

-- DropIndex
DROP INDEX `Vote_shareholderId_fkey` ON `vote`;

-- AlterTable
ALTER TABLE `vote` DROP PRIMARY KEY,
    DROP COLUMN `castByRepresentativeId`,
    DROP COLUMN `shareholderId`,
    ADD COLUMN `voterId` VARCHAR(191) NOT NULL,
    ADD COLUMN `weight` DOUBLE NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Vote_meetingId_nomineeId_key` ON `Vote`(`meetingId`, `nomineeId`);

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
