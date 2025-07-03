"use client";

import WhatsAppButton from "@/components/wabutton";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PemilikData {
  noWhatsapp: string;
  namaLengkap: string;
}

interface KosanData {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  hargaPerBulan: number;
  deskripsi: string;
  fotoUrls: string[];
  tersedia: boolean;
  createdAt: string;
  pemilik: PemilikData;
}

export default function KosanDetailPage() {
  const { id } = useParams();
  const [kosan, setKosan] = useState<KosanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/datakos/${id}`);
        if (!response.ok) throw new Error("Data not found");
        const data: KosanData = await response.json();
        setKosan(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatRupiah = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  const formatKecamatan = (kecamatan: string) => {
    return kecamatan
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data kosan...</p>
      </div>
    );
  }

  if (error || !kosan) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
          <p className="font-medium">Data kosan tidak ditemukan</p>
          <p className="text-sm mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <ol className="flex space-x-2 items-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
            Beranda
          </Link>
          <li>&gt;</li>
          <Link href="/kosan" className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
            Kosan
          </Link>
          <li>&gt;</li>
          <li className="font-semibold text-gray-900 truncate max-w-xs">{kosan.nama}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Foto Utama & Galeri */}
        <div className="lg:col-span-2">
          <div className="relative h-96 rounded-xl overflow-hidden mb-4">
            {kosan.fotoUrls.length > 0 ? (
              <>
                <Image src={kosan.fotoUrls[activeImage]} alt={kosan.nama} fill className="object-contain transition-all duration-300" priority />

                {/* Navigation Arrows */}
                {kosan.fotoUrls.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : kosan.fotoUrls.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => setActiveImage((prev) => (prev + 1) % kosan.fotoUrls.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full">
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                <span className="text-gray-500">Tidak ada foto tersedia</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {kosan.fotoUrls.map((foto, index) => (
              <button key={index} onClick={() => setActiveImage(index)} className={`aspect-square relative rounded-lg overflow-hidden border-2 ${index === activeImage ? "border-indigo-600 ring-2 ring-indigo-300" : "border-transparent"}`}>
                <Image src={foto} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{kosan.nama}</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${kosan.tersedia ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{kosan.tersedia ? "Tersedia" : "Terisi"}</div>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold text-blue-900">
              {formatRupiah(kosan.hargaPerBulan)}
              <span className="text-base font-normal text-gray-600">/bulan</span>
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-2">Kontak Pemilik</h3>
            <div className="flex items-center justify-between">
              <WhatsAppButton title="Hubungi" noWhatsapp={kosan.pemilik.noWhatsapp} kosanUrl={`/kosan/${kosan.id}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Deskripsi Kosan</h2>
        <p className="text-gray-700 whitespace-pre-line">{kosan.deskripsi || "Tidak ada deskripsi tersedia."}</p>
      </div>

      {/* Informasi Tambahan */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Detail Kosan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start border rounded-lg p-3">
            <div className="text-indigo-600 mr-3 mt-0.5">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Tanggal Ditambahkan</h3>
              <p className="text-gray-600">
                {new Date(kosan.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start border rounded-lg p-3">
            <div className="text-indigo-600 mr-3 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Kecamatan</h3>
              <p className="text-gray-600">{formatKecamatan(kosan.kecamatan)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
