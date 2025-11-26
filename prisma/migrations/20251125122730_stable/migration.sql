-- AlterTable
ALTER TABLE `meeting` MODIFY `snapshotTotalHolders` INTEGER NULL,
    MODIFY `snapshotTotalShares` DECIMAL(65, 30) NULL;
