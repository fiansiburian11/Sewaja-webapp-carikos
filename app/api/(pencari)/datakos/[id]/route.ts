import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const kosan = await prisma.kosan.findUnique({
      where: { id: params.id },
      include: {
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

    // Format data sesuai dengan yang diharapkan di frontend
    const responseData = {
      id: kosan.id,
      nama: kosan.nama,
      alamat: kosan.alamat,
      kecamatan: kosan.kecamatan,
      hargaPerBulan: kosan.hargaPerBulan,
      deskripsi: kosan.deskripsi,
      fotoUrls: kosan.fotoUrls,
      tersedia: kosan.tersedia,
      createdAt: kosan.createdAt.toISOString(),
      pemilik: {
        noWhatsapp: kosan.pemilik.noWhatsapp,
        namaLengkap: kosan.pemilik.namaLengkap,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching kosan detail:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
