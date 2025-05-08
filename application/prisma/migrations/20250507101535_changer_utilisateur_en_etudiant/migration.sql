/*
  Warnings:

  - You are about to drop the column `utilisateurId` on the `Candidature` table. All the data in the column will be lost.
  - You are about to drop the `Utilisateur` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `etudiantId` to the `Candidature` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Candidature` DROP FOREIGN KEY `Candidature_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `Candidature_utilisateurId_fkey` ON `Candidature`;

-- AlterTable
ALTER TABLE `Candidature` DROP COLUMN `utilisateurId`,
    ADD COLUMN `etudiantId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Utilisateur`;

-- CreateTable
CREATE TABLE `Etudiant` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mdp` VARCHAR(191) NOT NULL,
    `cv` LONGBLOB NOT NULL,
    `competences` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Etudiant_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Candidature` ADD CONSTRAINT `Candidature_etudiantId_fkey` FOREIGN KEY (`etudiantId`) REFERENCES `Etudiant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
