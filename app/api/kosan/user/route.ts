// app/api/kosan/user/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const kosan = await prisma.kosan.findMany({
      where: { pemilikId: decoded.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ kosan });
  } catch {
    return NextResponse.json({ error: "Token invalid" }, { status: 401 });
  }
}
