// app/api/(pemilik)/kosan/[id]/GET.ts
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";

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
