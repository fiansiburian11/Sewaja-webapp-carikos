// app/api/kosan/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, alamat, kecamatan, hargaPerBulan, deskripsi, fotoUrls, pemilikId } = body;

    if (!nama || !alamat || !kecamatan || !hargaPerBulan || !deskripsi || !Array.isArray(fotoUrls) || fotoUrls.length === 0 || !pemilikId) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const kosan = await prisma.kosan.create({
      data: {
        nama,
        alamat,
        kecamatan,
        hargaPerBulan: Number(hargaPerBulan),
        deskripsi,
        fotoUrls,
        pemilikId,
      },
    });

    return NextResponse.json({ kosan }, { status: 201 });
  } catch (error) {
    console.error("Gagal tambah kosan:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
