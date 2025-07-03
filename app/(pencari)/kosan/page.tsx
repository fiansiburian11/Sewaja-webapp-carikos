"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Kosan {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  hargaPerBulan: number;
  deskripsi: string;
  fotoUrls: string[];
  noWhatsapp: string;
  namaPemilik: string;
  createdAt: string;
}

// Daftar kecamatan yang tersedia
const KECAMATAN_OPTIONS = ["BUKIT_RAYA", "LIMA_PULUH", "MARPOYAN_DAMAI", "PAYUNG_SEKAKI", "PEKANBARU_KOTA", "SAIL", "SENAPELAN", "SUKAJADI", "TENAYAN_RAYA", "BINAWIDYA", "KULIM", "RUMBAI_BARAT", "RUMBAI", "RUMBAI_TIMUR", "TUAHMADANI"];

// Tipe untuk opsi sorting
type SortOption = "default" | "harga-asc" | "harga-desc" | "createdAt-desc";

const KosanPage = () => {
  const [filteredKosan, setFilteredKosan] = useState<Kosan[]>([]);

  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>([]);
  const [minHarga, setMinHarga] = useState("");
  const [maxHarga, setMaxHarga] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  // State UI
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Bangun query parameters
        const params = new URLSearchParams();

        if (searchTerm) params.append("search", searchTerm);
        selectedKecamatan.forEach((k) => params.append("kecamatan", k));
        if (minHarga) params.append("minHarga", minHarga);
        if (maxHarga) params.append("maxHarga", maxHarga);

        // Handle sorting
        if (sortOption !== "default") {
          const [sortBy, sortOrder] = sortOption.split("-");
          params.append("sortBy", sortBy);
          params.append("sortOrder", sortOrder);
        }

        const response = await fetch(`/api/datakos?${params.toString()}`);
        const data = await response.json();

        setFilteredKosan(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedKecamatan, minHarga, maxHarga, sortOption]);

  // Toggle pilihan kecamatan
  const toggleKecamatan = (kecamatan: string) => {
    setSelectedKecamatan((prev) => (prev.includes(kecamatan) ? prev.filter((k) => k !== kecamatan) : [...prev, kecamatan]));
  };

  // Reset semua filter
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKecamatan([]);
    setMinHarga("");
    setMaxHarga("");
    setSortOption("default");
  };

  // Format harga untuk display
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(harga);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm">
        <ol className="flex space-x-2 items-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
            Beranda
          </Link>
          <li>&gt;</li>
          <Link href="/kosan" className="font-semibold text-gray-900cursor-pointer">
            Kosan
          </Link>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold mb-6">Daftar Kosan Tersedia</h1>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter & Sorting</h2>
          <button onClick={() => setShowFilters(!showFilters)} className="text-blue-600 hover:text-blue-800">
            {showFilters ? "Sembunyikan" : "Tampilkan"} Filter
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Cari Nama Kos</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama kos..." className="w-full p-2 border border-gray-300 rounded-md" />
            </div>

            {/* Kecamatan Multi-select */}
            <div>
              <label className="block text-sm font-medium mb-1">Kecamatan</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {KECAMATAN_OPTIONS.map((kec) => (
                  <div key={kec} className="flex items-center mb-1">
                    <input type="checkbox" id={`kec-${kec}`} checked={selectedKecamatan.includes(kec)} onChange={() => toggleKecamatan(kec)} className="mr-2" />
                    <label htmlFor={`kec-${kec}`}>{kec.replace(/_/g, " ")}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Harga Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Rentang Harga</label>
              <div className="flex space-x-2">
                <input type="number" value={minHarga} onChange={(e) => setMinHarga(e.target.value)} placeholder="Min" className="w-full p-2 border border-gray-300 rounded-md" />
                <input type="number" value={maxHarga} onChange={(e) => setMaxHarga(e.target.value)} placeholder="Max" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium mb-1">Urutkan</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="default">Default</option>
                <option value="harga-asc">Harga: Rendah ke Tinggi</option>
                <option value="harga-desc">Harga: Tinggi ke Rendah</option>
                <option value="createdAt-desc">Terbaru</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button onClick={resetFilters} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md">
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Memuat data kosan...</p>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="mb-4">
          <p className="text-gray-600">
            Ditemukan <span className="font-semibold">{filteredKosan.length}</span> kosan
            {searchTerm && ` untuk "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Kosan List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && filteredKosan.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-500">Tidak ada kosan yang ditemukan</p>
            <button onClick={resetFilters} className="mt-4 text-blue-600 hover:text-blue-800 underline">
              Reset filter
            </button>
          </div>
        )}

        {filteredKosan.map((kos) => (
          <div key={kos.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Foto Utama */}
            <Link href={`/kosan/${kos.id}`}>
              <div className="h-48 overflow-hidden">
                {kos.fotoUrls.length > 0 ? (
                  <Image width={1000} height={1000} src={kos.fotoUrls[0]} alt={kos.nama} className="w-full h-full object-contain" />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">Tidak ada gambar</span>
                  </div>
                )}
              </div>

              {/* Badge Tersedia */}
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Tersedia</div>

              {/* Informasi Kosan */}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{kos.nama}</h3>
                  <span className="bg-blue-100 text-blue-900 text-xs font-semibold px-2 py-1 rounded">{kos.kecamatan.replace(/_/g, " ")}</span>
                </div>

                <p className="text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {kos.alamat}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-bold text-blue-900">
                      {formatHarga(kos.hargaPerBulan)}
                      <span className="text-sm font-normal text-gray-600">/bulan</span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(kos.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const formattedNumber = kos.noWhatsapp.replace(/\D/g, "");
                  window.open(`https://wa.me/${formattedNumber}`, "_blank");
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat Pemilik
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KosanPage;
