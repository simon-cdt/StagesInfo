/*
  Warnings:

  - Added the required column `secteurId` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Stage` ADD COLUMN `secteurId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Stage` ADD CONSTRAINT `Stage_secteurId_fkey` FOREIGN KEY (`secteurId`) REFERENCES `Secteur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
