/*
  Warnings:

  - You are about to alter the column `firstPassers` on the `meeting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `secondPassers` on the `meeting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `meeting` MODIFY `firstPassers` INTEGER NULL,
    MODIFY `secondPassers` INTEGER NULL;
