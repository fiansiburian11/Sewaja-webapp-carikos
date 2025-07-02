/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `PendingPembayaran` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `PendingPembayaran` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingPembayaran" ADD COLUMN     "orderId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "PendingPembayaran_orderId_key" ON "PendingPembayaran"("orderId");
