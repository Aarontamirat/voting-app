/*
  Warnings:

  - Made the column `nameAm` on table `nominee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `nominee` MODIFY `nameAm` VARCHAR(191) NOT NULL;
