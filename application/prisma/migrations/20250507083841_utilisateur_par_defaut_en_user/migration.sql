-- AlterTable
ALTER TABLE `Utilisateur` MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';
