// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import midtransClient from "midtrans-client";
// import bcrypt from "bcrypt";
// import { v4 as uuidv4 } from "uuid";
// import crypto from "crypto";

// const snap = new midtransClient.Snap({
//   isProduction: false,
//   serverKey: process.env.MIDTRANS_SERVER_KEY!,
// });

// export async function POST(req: Request) {
//   const { namaLengkap, email, noWhatsapp, password } = await req.json();

//   if (!email || !namaLengkap || !noWhatsapp || !password) {
//     return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
//   }

//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     const existingPending = await prisma.pendingPembayaran.findUnique({ where: { email } });

//     if (existingUser || existingPending) {
//       return NextResponse.json({ error: "Email sudah terdaftar atau sedang menunggu pembayaran" }, { status: 400 });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const emailHash = crypto.createHash("md5").update(email).digest("hex").slice(0, 8); // 8 char hash
//     const orderId = `reg_${emailHash}_${uuidv4().slice(0, 12)}`; // aman & unik

//     const parameter = {
//       transaction_details: {
//         order_id: orderId,
//         gross_amount: 50000,
//       },
//       customer_details: {
//         first_name: namaLengkap,
//         email,
//         phone: noWhatsapp,
//       },
//     };

//     const snapResponse = await snap.createTransaction(parameter);
//     const snapToken = snapResponse.token;

//     await prisma.pendingPembayaran.create({
//       data: {
//         namaLengkap,
//         email,
//         noWhatsapp,
//         snapToken,
//         status: "pending",
//         orderId,
//         password: hashed,
//       },
//     });

//     return NextResponse.json({ snapToken }, { status: 200 });
//   } catch (err) {
//     console.error("Register Error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

// Fungsi untuk memformat nomor WhatsApp
const formatWhatsAppNumber = (number: string) => {
  const cleanNumber = number.replace(/\D/g, "");
  return cleanNumber.startsWith("0") ? "62" + cleanNumber.substring(1) : cleanNumber;
};

export async function POST(req: Request) {
  const { namaLengkap, email, noWhatsapp, password } = await req.json();

  if (!email || !namaLengkap || !noWhatsapp || !password) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  try {
    // Format nomor WhatsApp untuk konsistensi
    const formattedWhatsApp = formatWhatsAppNumber(noWhatsapp);

    // Cek email di database
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    const existingPendingByEmail = await prisma.pendingPembayaran.findUnique({
      where: { email },
    });

    if (existingUserByEmail || existingPendingByEmail) {
      return NextResponse.json({ error: "Email sudah terdaftar atau sedang menunggu pembayaran" }, { status: 400 });
    }

    // Cek nomor WhatsApp di database
    const existingUserByWhatsApp = await prisma.user.findFirst({
      where: { noWhatsapp: formattedWhatsApp },
    });

    const existingPendingByWhatsApp = await prisma.pendingPembayaran.findFirst({
      where: { noWhatsapp: formattedWhatsApp },
    });

    if (existingUserByWhatsApp || existingPendingByWhatsApp) {
      return NextResponse.json({ error: "Nomor WhatsApp sudah terdaftar atau sedang menunggu pembayaran" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const emailHash = crypto.createHash("md5").update(email).digest("hex").slice(0, 8);
    const orderId = `reg_${emailHash}_${uuidv4().slice(0, 12)}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 50000,
      },
      customer_details: {
        first_name: namaLengkap,
        email,
        phone: formattedWhatsApp, // Gunakan nomor yang sudah diformat
      },
    };

    const snapResponse = await snap.createTransaction(parameter);
    const snapToken = snapResponse.token;

    await prisma.pendingPembayaran.create({
      data: {
        namaLengkap,
        email,
        noWhatsapp: formattedWhatsApp, // Simpan nomor yang sudah diformat
        snapToken,
        status: "pending",
        orderId,
        password: hashed,
      },
    });

    return NextResponse.json({ snapToken }, { status: 200 });
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}