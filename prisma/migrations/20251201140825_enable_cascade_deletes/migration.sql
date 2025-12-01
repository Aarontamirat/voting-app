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

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_representedById_fkey` FOREIGN KEY (`representedById`) REFERENCES `Representative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_nomineeId_fkey` FOREIGN KEY (`nomineeId`) REFERENCES `Nominee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
