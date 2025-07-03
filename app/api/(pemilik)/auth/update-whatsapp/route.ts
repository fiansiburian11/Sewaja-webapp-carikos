import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function PUT(request: NextRequest) {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1]; // Ambil token setelah 'Bearer '

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    // Verifikasi token
    let decoded: JwtPayload & { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: string };

      // Pastikan id ada dalam payload
      if (!decoded.id) {
        return NextResponse.json({ error: "Token tidak mengandung ID pengguna" }, { status: 401 });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    // Dapatkan data dari body request
    const { whatsapp } = await request.json();

    // Validasi nomor WhatsApp
    if (!whatsapp || typeof whatsapp !== "string") {
      return NextResponse.json({ error: "Nomor WhatsApp harus diisi" }, { status: 400 });
    }

    // Normalisasi nomor
    const cleanWhatsApp = whatsapp.replace(/\D/g, "");
    const whatsappRegex = /^(?:62|0)(\d{9,14})$/;

    if (!whatsappRegex.test(cleanWhatsApp)) {
      return NextResponse.json(
        {
          error: "Format nomor tidak valid",
          contoh_valid: ["628123456789", "08123456789", "62123456789"],
        },
        { status: 400 }
      );
    }

    // Format nomor ke 62XX
    const formattedWhatsApp = cleanWhatsApp.startsWith("0") ? "62" + cleanWhatsApp.substring(1) : cleanWhatsApp;

    // Periksa duplikat nomor (kecuali milik user saat ini)
    const existingNumber = await prisma.user.findFirst({
      where: {
        noWhatsapp: formattedWhatsApp,
        NOT: { id: decoded.id }, // Gunakan decoded.id
      },
    });

    if (existingNumber) {
      return NextResponse.json(
        {
          error: "Nomor sudah terdaftar",
          pemilik: existingNumber.email,
        },
        { status: 409 }
      );
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id }, // Gunakan decoded.id
      data: { noWhatsapp: formattedWhatsApp },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        noWhatsapp: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Nomor WhatsApp berhasil diperbarui",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server";
    console.error("Error updating WhatsApp:", error);

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: "Database error",
          code: error.code,
          meta: error.meta,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Terjadi kesalahan server", detail: errorMessage }, { status: 500 });
  }
}
