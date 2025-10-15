/*
  Warnings:

  - A unique constraint covering the columns `[meetingId,nomineeId,voterId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_meetingId_fkey`;

-- DropIndex
DROP INDEX `Vote_meetingId_nomineeId_key` ON `vote`;

-- CreateIndex
CREATE UNIQUE INDEX `Vote_meetingId_nomineeId_voterId_key` ON `Vote`(`meetingId`, `nomineeId`, `voterId`);

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
