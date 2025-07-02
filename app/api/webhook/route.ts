import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction_status, order_id } = body;

    if (!transaction_status || !order_id) {
      console.error("Payload webhook tidak lengkap", body);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Langsung cocokkan ke orderId
    const pending = await prisma.pendingPembayaran.findUnique({
      where: { orderId: order_id },
    });

    if (!pending) {
      console.warn(`Pending pembayaran tidak ditemukan untuk order_id: ${order_id}`);
      return NextResponse.json({ received: true });
    }

    if (transaction_status === "settlement" || transaction_status === "capture") {
      await prisma.user.create({
        data: {
          namaLengkap: pending.namaLengkap,
          email: pending.email,
          noWhatsapp: pending.noWhatsapp,
          password: pending.password,
        },
      });

      await prisma.pendingPembayaran.delete({
        where: { id: pending.id },
      });

      console.log(`✅ User ${pending.email} berhasil dibuat setelah pembayaran.`);
    } else {
      console.log(`ℹ️ Status transaksi ${transaction_status}, tidak diproses.`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
