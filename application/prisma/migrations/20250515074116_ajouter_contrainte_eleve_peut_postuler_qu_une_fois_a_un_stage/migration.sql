/*
  Warnings:

  - A unique constraint covering the columns `[studentId,offerId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Submission_studentId_offerId_key` ON `Submission`(`studentId`, `offerId`);
