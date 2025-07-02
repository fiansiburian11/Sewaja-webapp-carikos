-- CreateEnum
CREATE TYPE "Kecamatan" AS ENUM ('BUKIT_RAYA', 'LIMA_PULUH', 'MARPOYAN_DAMAI', 'PAYUNG_SEKAKI', 'PEKANBARU_KOTA', 'SAIL', 'SENAPELAN', 'SUKAJADI', 'TENAYAN_RAYA', 'BINAWIDYA', 'KULIM', 'RUMBAI_BARAT', 'RUMBAI', 'RUMBAI_TIMUR', 'TUAHMADANI');

-- CreateTable
CREATE TABLE "PendingPembayaran" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noWhatsapp" TEXT NOT NULL,
    "kecamatan" "Kecamatan" NOT NULL,
    "snapToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingPembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "noWhatsapp" TEXT NOT NULL,
    "kecamatan" "Kecamatan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kosan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kecamatan" "Kecamatan" NOT NULL,
    "hargaPerBulan" INTEGER NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "fotoUrls" TEXT[],
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pemilikId" TEXT NOT NULL,

    CONSTRAINT "Kosan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingPembayaran_email_key" ON "PendingPembayaran"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Kosan" ADD CONSTRAINT "Kosan_pemilikId_fkey" FOREIGN KEY ("pemilikId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
