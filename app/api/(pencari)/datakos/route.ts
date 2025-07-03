// import { prisma } from "@/lib/prisma";
// import { Kecamatan } from "@prisma/client";
// import { NextResponse } from "next/server";

// // Definisikan tipe untuk filter
// interface KosanFilter {
//   tersedia?: boolean;
//   nama?: {
//     contains: string;
//     mode: "insensitive";
//   };
//   kecamatan?: {
//     in: Kecamatan[];
//   };
//   hargaPerBulan?: {
//     gte?: number;
//     lte?: number;
//   };
// }

// // Definisikan tipe untuk orderBy
// type OrderByType = { hargaPerBulan: "asc" | "desc" } | { createdAt: "asc" | "desc" };

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     // Dapatkan query parameters
//     const search = searchParams.get("search");
//     const kecamatan = searchParams.getAll("kecamatan");
//     const minHarga = searchParams.get("minHarga");
//     const maxHarga = searchParams.get("maxHarga");
//     const sortBy = searchParams.get("sortBy");
//     const sortOrder = searchParams.get("sortOrder") || "asc";

//     // Siapkan filter dengan tipe yang sudah didefinisikan
//     const filter: KosanFilter = {
//       tersedia: true,
//     };

//     // Tambahkan filter pencarian
//     if (search) {
//       filter.nama = {
//         contains: search,
//         mode: "insensitive",
//       };
//     }

//     // Tambahkan filter kecamatan
//     if (kecamatan.length > 0) {
//       filter.kecamatan = {
//         in: kecamatan.map((k) => k.toUpperCase()) as Kecamatan[],
//       };
//     }

//     // Tambahkan filter harga
//     if (minHarga || maxHarga) {
//       filter.hargaPerBulan = {};

//       if (minHarga) {
//         filter.hargaPerBulan.gte = parseInt(minHarga);
//       }

//       if (maxHarga) {
//         filter.hargaPerBulan.lte = parseInt(maxHarga);
//       }
//     }

//     // Siapkan sorting dengan tipe yang sudah didefinisikan
//     let orderBy: OrderByType | undefined = undefined;

//     if (sortBy === "harga") {
//       orderBy = {
//         hargaPerBulan: sortOrder === "asc" ? "asc" : "desc",
//       };
//     } else if (sortBy === "createdAt") {
//       orderBy = {
//         createdAt: sortOrder === "asc" ? "asc" : "desc",
//       };
//     }

//     const kosanList = await prisma.kosan.findMany({
//       where: filter,
//       include: {
//         pemilik: {
//           select: {
//             noWhatsapp: true,
//             namaLengkap: true,
//           },
//         },
//       },
//       orderBy: orderBy,
//     });

//     // Format data untuk response
//     const formattedData = kosanList.map((kos) => ({
//       id: kos.id,
//       nama: kos.nama,
//       alamat: kos.alamat,
//       kecamatan: kos.kecamatan,
//       hargaPerBulan: kos.hargaPerBulan,
//       deskripsi: kos.deskripsi,
//       fotoUrls: kos.fotoUrls,
//       noWhatsapp: kos.pemilik.noWhatsapp,
//       namaPemilik: kos.pemilik.namaLengkap,
//       createdAt: kos.createdAt.toISOString(),
//     }));

//     return NextResponse.json(formattedData);
//   } catch (error) {
//     console.error("Error fetching kosan data:", error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }
import { prisma } from "@/lib/prisma";
import { Kecamatan } from "@prisma/client";
import { NextResponse } from "next/server";

// Definisikan tipe untuk filter
interface KosanFilter {
  tersedia?: boolean;
  nama?: {
    contains: string;
    mode: "insensitive";
  };
  kecamatan?: {
    in: Kecamatan[];
  };
  hargaPerBulan?: {
    gte?: number;
    lte?: number;
  };
}

// Definisikan tipe untuk orderBy
type OrderByType = { hargaPerBulan: "asc" | "desc" } | { createdAt: "asc" | "desc" };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dapatkan query parameters
    const search = searchParams.get("search");
    const kecamatan = searchParams.getAll("kecamatan");
    const minHarga = searchParams.get("minHarga");
    const maxHarga = searchParams.get("maxHarga");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Tambahkan parameter paginasi
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset") || "0";

    // Siapkan filter dengan tipe yang sudah didefinisikan
    const filter: KosanFilter = {
      tersedia: true,
    };

    // Tambahkan filter pencarian
    if (search) {
      filter.nama = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Tambahkan filter kecamatan
    if (kecamatan.length > 0) {
      filter.kecamatan = {
        in: kecamatan.map((k) => k.toUpperCase()) as Kecamatan[],
      };
    }

    // Tambahkan filter harga
    if (minHarga || maxHarga) {
      filter.hargaPerBulan = {};

      if (minHarga) {
        filter.hargaPerBulan.gte = parseInt(minHarga);
      }

      if (maxHarga) {
        filter.hargaPerBulan.lte = parseInt(maxHarga);
      }
    }

    // Siapkan sorting dengan tipe yang sudah didefinisikan
    let orderBy: OrderByType | undefined = undefined;

    if (sortBy === "harga") {
      orderBy = {
        hargaPerBulan: sortOrder === "asc" ? "asc" : "desc",
      };
    } else if (sortBy === "createdAt") {
      orderBy = {
        createdAt: sortOrder === "asc" ? "asc" : "desc",
      };
    }

    // Hitung total data untuk paginasi
    const totalCount = await prisma.kosan.count({
      where: filter,
    });

    // Konversi limit dan offset ke number
    const take = limit ? parseInt(limit) : undefined;
    const skip = parseInt(offset);

    const kosanList = await prisma.kosan.findMany({
      where: filter,
      include: {
        pemilik: {
          select: {
            noWhatsapp: true,
            namaLengkap: true,
          },
        },
      },
      orderBy: orderBy,
      take, // Jumlah data yang diambil
      skip, // Posisi awal data
    });

    // Format data untuk response
    const formattedData = kosanList.map((kos) => ({
      id: kos.id,
      nama: kos.nama,
      alamat: kos.alamat,
      kecamatan: kos.kecamatan,
      hargaPerBulan: kos.hargaPerBulan,
      deskripsi: kos.deskripsi,
      fotoUrls: kos.fotoUrls,
      noWhatsapp: kos.pemilik.noWhatsapp,
      namaPemilik: kos.pemilik.namaLengkap,
      createdAt: kos.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data: formattedData,
      pagination: {
        total: totalCount,
        limit: take,
        offset: skip,
        hasMore: skip + (take || 0) < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching kosan data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}