/*
  Warnings:

  - You are about to drop the column `nomineePassOne` on the `meeting` table. All the data in the column will be lost.
  - You are about to drop the column `nomineePassTwo` on the `meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `meeting` DROP COLUMN `nomineePassOne`,
    DROP COLUMN `nomineePassTwo`,
    ADD COLUMN `firstPassers` VARCHAR(191) NULL,
    ADD COLUMN `secondPassers` VARCHAR(191) NULL;
