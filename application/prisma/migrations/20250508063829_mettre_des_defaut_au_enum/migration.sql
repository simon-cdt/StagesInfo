-- AlterTable
ALTER TABLE `Candidature` MODIFY `statut` ENUM('EnAttente', 'Acceptée', 'Refusée') NOT NULL DEFAULT 'EnAttente';

-- AlterTable
ALTER TABLE `Stage` MODIFY `statut` ENUM('Disponible', 'Pourvue', 'Expirée') NOT NULL DEFAULT 'Disponible';
