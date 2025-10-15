/*
  Warnings:

  - Added the required column `shareholderId` to the `Nominee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `nominee` ADD COLUMN `shareholderId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Nominee` ADD CONSTRAINT `Nominee_shareholderId_fkey` FOREIGN KEY (`shareholderId`) REFERENCES `Shareholder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
