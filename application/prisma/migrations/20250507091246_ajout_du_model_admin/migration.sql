/*
  Warnings:

  - You are about to drop the column `role` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Utilisateur` DROP COLUMN `role`;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mdp` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
