"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Facebook, Instagram, MapPin, Star, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface KosanDataProps {
  id: string; // Diubah menjadi string karena Prisma menggunakan cuid
  nama: string;
  alamat: string;
  kecamatan: string;
  fotoUrls: string[]; // Diubah menjadi array string
  hargaPerBulan: number; // Nama properti disesuaikan
  deskripsi: string;
  noWhatsapp: string;
  namaPemilik: string;
  createdAt: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [kosanData, setKosanData] = useState<KosanDataProps[]>([]); // Diubah menjadi array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/datakos?limit=6");

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        setKosanData(data.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data slider (bisa diganti dengan gambar asli)
  const sliderData = [
    {
      title: "Temukan Kosan Nyaman dengan Harga Terjangkau",
      subtitle: "Lebih dari 1000 kosan terdaftar di seluruh Pekanbaru",
      image: "/3.jpg",
    },
    {
      title: "Promo Spesial Untuk Pendaftaran Pertama!",
      subtitle: "Dapatkan diskon 10% untuk pendaftaran pertama",
      image: "/2.jpg",
    },
    {
      title: "Kosan Premium dengan Fasilitas Lengkap",
      subtitle: "AC, WiFi, Kamar Mandi Dalam, dan Parkir Luas",
      image: "/1.jpg",
    },
  ];

  // Fungsi untuk slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderData.length]);

  // Format harga untuk display
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(harga);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      {/* Hero Slider */}
      <div className="relative h-[500px] w-full overflow-hidden">
        {sliderData.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <Image src={slide.image} alt={`Slide ${index}`} fill className="absolute inset-0 object-cover" />
            <div className="container mx-auto h-full flex items-center relative z-10 px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)]">{slide.title}</h1>
                <p className="text-xl mb-8 text-gray-200 animate-fadeIn drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)]">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button onClick={() => setCurrentSlide(currentSlide === 0 ? sliderData.length - 1 : currentSlide - 1)} className="absolute left-4 top-1/2 z-20 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition-all">
          <ChevronLeft size={32} />
        </button>
        <button onClick={() => setCurrentSlide(currentSlide === sliderData.length - 1 ? 0 : currentSlide + 1)} className="absolute right-4 top-1/2 z-20 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition-all">
          <ChevronRight size={32} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {sliderData.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-blue-600" : "bg-white/50"}`} />
          ))}
        </div>
      </div>

      {/* Featured Kosan Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className=" items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Kosan Terpopuler</h2>
              <p className="text-gray-600 mt-2">Temukan kosan terbaik dengan fasilitas lengkap</p>
            </div>
            <div className="mt-8 flex justify-end">
              <Link href="/kosan" className="border p-2 rounded-md text-blue-600 hover:text-blue-800 font-medium text-xs">
                Lihat Semua →
              </Link>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Memuat data kosan...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Coba Lagi
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {kosanData.map((kosan) => (
                <div key={kosan.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-56">
                    {kosan.fotoUrls.length > 0 ? (
                      <Image src={kosan.fotoUrls[0]} alt={kosan.nama} layout="fill" objectFit="contain" className="transition-transform duration-500 hover:scale-105" />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">Tidak ada gambar</span>
                      </div>
                    )}
                    {/* <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                      <Heart className="text-gray-500 hover:text-red-500 cursor-pointer" />
                    </div> */}
                    <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{formatHarga(kosan.hargaPerBulan)}/bln</div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{kosan.nama}</h3>
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm font-bold">4.5</span>
                        <span className="text-gray-500 text-sm ml-1">(20)</span>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{kosan.kecamatan.replace(/_/g, " ")}</span>
                    </div>

                    <Button onClick={() => router.push(`/kosan/${kosan.id}`)} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Daftarkan Kosan Anda Sekarang!</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">Jadilah bagian dari platform kos terbesar di Pekanbaru dan dapatkan lebih banyak penyewa</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => router.push("/register")} className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold">
              Daftar sebagai Pemilik
            </Button>
            <Button onClick={() => router.push("/login")} className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-6 text-lg">
              Login Sebagai Pemilik
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Image width={50} height={50} src="/logosewaja.png" alt="Logo Sewaja" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4" />
              <p className="text-gray-400 mb-4">Platform pencarian kos terbesar di Pekanbaru dengan berbagai pilihan kosan berkualitas.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/kosan" className="text-gray-400 hover:text-white transition-colors">
                    Kosan
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-400">+62 823 4567 8910</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400">info@sewaja.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">Jl. Sudirman No. 123, Pekanbaru, Riau</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} SewaJa. Hak Cipta Dilindungi.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
