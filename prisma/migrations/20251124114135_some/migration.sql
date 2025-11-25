-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_representedById_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_shareholderId_fkey`;

-- DropForeignKey
ALTER TABLE `nominee` DROP FOREIGN KEY `Nominee_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `nominee` DROP FOREIGN KEY `Nominee_shareholderId_fkey`;

-- DropForeignKey
ALTER TABLE `representation` DROP FOREIGN KEY `Representation_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `representation` DROP FOREIGN KEY `Representation_representativeId_fkey`;

-- DropForeignKey
ALTER TABLE `representation` DROP FOREIGN KEY `Representation_shareholderId_fkey`;

-- DropForeignKey
ALTER TABLE `representative` DROP FOREIGN KEY `Representative_shareholderId_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `Vote_nomineeId_fkey`;

-- DropIndex
DROP INDEX `Attendance_representedById_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Attendance_shareholderId_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `Nominee_meetingId_fkey` ON `nominee`;

-- DropIndex
DROP INDEX `Nominee_shareholderId_fkey` ON `nominee`;

-- DropIndex
DROP INDEX `Representation_representativeId_fkey` ON `representation`;

-- DropIndex
DROP INDEX `Representation_shareholderId_fkey` ON `representation`;

-- DropIndex
DROP INDEX `Representative_shareholderId_fkey` ON `representative`;

-- DropIndex
DROP INDEX `Vote_nomineeId_fkey` ON `vote`;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representation` ADD CONSTRAINT `Representation_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representation` ADD CONSTRAINT `Representation_representativeId_fkey` FOREIGN KEY (`representativeId`) REFERENCES `Representative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representation` ADD CONSTRAINT `Representation_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_representedById_fkey` FOREIGN KEY (`representedById`) REFERENCES `Representative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nominee` ADD CONSTRAINT `Nominee_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nominee` ADD CONSTRAINT `Nominee_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_nomineeId_fkey` FOREIGN KEY (`nomineeId`) REFERENCES `Nominee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
