import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Cari user aktif
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    // Set cookie manual
    const cookie = serialize("token", token, {
      httpOnly: false, // FE bisa baca token
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return new Response(JSON.stringify({ message: "Login berhasil" }), {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
    });
  }

  // Cek apakah email ada di pending pembayaran
  const pending = await prisma.pendingPembayaran.findUnique({ where: { email } });

  if (pending) {
    if (pending.status !== "lunas") {
      return NextResponse.json({ error: "Akun belum aktif, silakan lakukan pembayaran terlebih dahulu." }, { status: 401 });
    } else {
      return NextResponse.json({ error: "Akun dalam proses aktivasi, coba lagi nanti." }, { status: 401 });
    }
  }

  // Tidak ditemukan sama sekali
  return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
}
