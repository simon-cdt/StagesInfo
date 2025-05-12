/*
  Warnings:

  - You are about to drop the column `color` on the `Secteur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Secteur` DROP COLUMN `color`,
    ADD COLUMN `couleur` VARCHAR(191) NOT NULL DEFAULT 'blue';
