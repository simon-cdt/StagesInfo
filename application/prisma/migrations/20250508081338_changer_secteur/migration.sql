/*
  Warnings:

  - You are about to drop the column `valeur` on the `Secteur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Secteur` DROP COLUMN `valeur`,
    ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'blue';
