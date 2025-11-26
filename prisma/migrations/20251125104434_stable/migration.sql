/*
  Warnings:

  - Added the required column `snapshotName` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotShareValue` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotVoterName` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotVoterShareValue` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_representedById_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_shareholderId_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_nomineeId_fkey`;

-- DropIndex
DROP INDEX `Attendance_representedById_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Attendance_shareholderId_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Vote_nomineeId_fkey` ON `vote`;

-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `snapshotAddress` VARCHAR(191) NULL,
    ADD COLUMN `snapshotName` VARCHAR(191) NOT NULL,
    ADD COLUMN `snapshotPhone` VARCHAR(191) NULL,
    ADD COLUMN `snapshotShareValue` DECIMAL(30, 6) NOT NULL;

-- AlterTable
ALTER TABLE `vote` ADD COLUMN `snapshotVoterName` VARCHAR(191) NOT NULL,
    ADD COLUMN `snapshotVoterShareValue` DECIMAL(30, 6) NOT NULL;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_representedById_fkey` FOREIGN KEY (`representedById`) REFERENCES `Representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_nomineeId_fkey` FOREIGN KEY (`nomineeId`) REFERENCES `Nominee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
