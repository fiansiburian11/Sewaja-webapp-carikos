import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const kosan = await prisma.kosan.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nama: true,
      alamat: true,
      kecamatan: true,
      hargaPerBulan: true,
      deskripsi: true,
      fotoUrls: true,
      tersedia: true,
      createdAt: true,
      pemilik: {
        select: {
          noWhatsapp: true,
          namaLengkap: true,
        },
      },
    },
  });

  if (!kosan) {
    return NextResponse.json({ message: "Kosan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(kosan);
}
