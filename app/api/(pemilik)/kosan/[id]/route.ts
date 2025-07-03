import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Hapus kosan berdasarkan ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    // Cari kosan dan pastikan pemiliknya cocok
    const kosan = await prisma.kosan.findUnique({
      where: { id: params.id },
    });

    if (!kosan) {
      return NextResponse.json({ error: "Kosan tidak ditemukan" }, { status: 404 });
    }

    if (kosan.pemilikId !== userId) {
      return NextResponse.json({ error: "Kamu tidak berhak menghapus kosan ini" }, { status: 403 });
    }

    // Hapus kosan
    await prisma.kosan.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Kosan berhasil dihapus" }, { status: 200 });
  } catch (err) {
    console.error("Gagal hapus kosan:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET: Endpoint untuk mengambil detail kosan
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    const kosan = await prisma.kosan.findUnique({
      where: { id: params.id },
    });

    if (!kosan) {
      return NextResponse.json({ error: "Kosan tidak ditemukan" }, { status: 404 });
    }

    if (kosan.pemilikId !== userId) {
      return NextResponse.json({ error: "Kamu tidak berhak mengakses kosan ini" }, { status: 403 });
    }

    return NextResponse.json(kosan, { status: 200 });
  } catch (err) {
    console.error("Get kosan error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: Endpoint untuk update kosan
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    const kosan = await prisma.kosan.findUnique({
      where: { id: params.id },
    });

    if (!kosan) {
      return NextResponse.json({ error: "Kosan tidak ditemukan" }, { status: 404 });
    }

    if (kosan.pemilikId !== userId) {
      return NextResponse.json({ error: "Kamu tidak berhak mengedit kosan ini" }, { status: 403 });
    }

    const body = await req.json();
    const {
      nama,
      alamat,
      kecamatan,
      hargaPerBulan,
      deskripsi,
      fotoUrls,
      tersedia
    } = body;

    // Validasi minimal
    if (!nama || !alamat || !kecamatan || !hargaPerBulan || !deskripsi) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.kosan.update({
      where: { id: params.id },
      data: {
        nama,
        alamat,
        kecamatan,
        hargaPerBulan: Number(hargaPerBulan),
        deskripsi,
        fotoUrls: fotoUrls || [],
        tersedia
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("Update kosan error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}