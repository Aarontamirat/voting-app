/*
  Warnings:

  - Added the required column `snapshotTotalHolders` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotTotalShares` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `meeting` ADD COLUMN `snapshotTotalHolders` INTEGER NOT NULL,
    ADD COLUMN `snapshotTotalShares` DECIMAL(65, 30) NOT NULL;
