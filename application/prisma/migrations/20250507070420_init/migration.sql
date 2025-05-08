-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mdp` VARCHAR(191) NOT NULL,
    `cv` LONGBLOB NOT NULL,
    `competences` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidature` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `statut` ENUM('EnAttente', 'Acceptée', 'Refusée') NOT NULL,
    `lettreMotivation` VARCHAR(191) NOT NULL,
    `cv` LONGBLOB NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stage` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `competences` VARCHAR(191) NOT NULL,
    `duree` VARCHAR(191) NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `lieu` VARCHAR(191) NOT NULL,
    `statut` ENUM('Disponible', 'Pourvue', 'Expirée') NOT NULL,
    `entrepriseId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluationStage` (
    `id` VARCHAR(191) NOT NULL,
    `note` INTEGER NOT NULL,
    `commentaire` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EvaluationStage_stageId_key`(`stageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Entreprise` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mdp` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Entreprise_email_key`(`email`),
    UNIQUE INDEX `Entreprise_contactId_key`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Secteur` (
    `id` VARCHAR(191) NOT NULL,
    `valeur` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecteurEntreprise` (
    `idSecteur` VARCHAR(191) NOT NULL,
    `idEntreprise` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idSecteur`, `idEntreprise`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Candidature` ADD CONSTRAINT `Candidature_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Candidature` ADD CONSTRAINT `Candidature_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stage` ADD CONSTRAINT `Stage_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationStage` ADD CONSTRAINT `EvaluationStage_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Entreprise` ADD CONSTRAINT `Entreprise_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecteurEntreprise` ADD CONSTRAINT `SecteurEntreprise_idSecteur_fkey` FOREIGN KEY (`idSecteur`) REFERENCES `Secteur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecteurEntreprise` ADD CONSTRAINT `SecteurEntreprise_idEntreprise_fkey` FOREIGN KEY (`idEntreprise`) REFERENCES `Entreprise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
