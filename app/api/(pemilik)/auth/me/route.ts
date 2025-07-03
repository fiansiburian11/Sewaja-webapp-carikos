// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string; // Perhatikan: sekarang kita menggunakan "id" bukan "userId"
      email: string;
    };

    // Pastikan id ada dalam payload
    if (!decoded.id) {
      return NextResponse.json({ error: "Token tidak mengandung ID pengguna" }, { status: 401 });
    }

    // Gunakan decoded.id untuk mencari user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        noWhatsapp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Token tidak valid", detail: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: "Terjadi kesalahan server", detail: String(error) }, { status: 500 });
  }
}
