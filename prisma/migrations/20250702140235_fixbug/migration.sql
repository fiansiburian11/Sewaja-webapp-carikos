/*
  Warnings:

  - You are about to drop the column `kecamatan` on the `PendingPembayaran` table. All the data in the column will be lost.
  - Added the required column `password` to the `PendingPembayaran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingPembayaran" DROP COLUMN "kecamatan",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
