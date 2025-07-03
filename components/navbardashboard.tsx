"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, House, LogOut, Phone, Save, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Tipe data untuk user
interface UserData {
  id: string;
  namaLengkap: string;
  email: string;
  noWhatsapp: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [newWhatsApp, setNewWhatsApp] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const getTokenFromCookies = () => {
    if (typeof document === "undefined") return null;

    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "token") {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal memuat data pengguna");
        }

        const data = await res.json();

        if (data.user) {
          setUser(data.user);
        } else {
          throw new Error("Data pengguna tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching user:", error);

        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data";

        toast.error(errorMessage);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node) && profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Logout berhasil");
        router.push("/login");
      } else {
        toast.error("Gagal logout");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    setShowProfileMenu(false);
  };

  const handleUpdateWhatsApp = async () => {
    if (!newWhatsApp.trim()) {
      toast.error("Nomor WhatsApp tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const token = getTokenFromCookies();
      if (!token) {
        toast.error("Sesi Anda telah habis, silakan login kembali");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/update-whatsapp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ whatsapp: newWhatsApp }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, noWhatsapp: data.user.noWhatsapp } : null));
        toast.success("Nomor WhatsApp berhasil diperbarui");
        setShowWhatsAppModal(false);
        setNewWhatsApp("");
      } else {
        toast.error(data.error || "Gagal memperbarui nomor WhatsApp");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Terjadi kesalahan");
    }
    setLoading(false);
  };

  const openWhatsAppModal = () => {
    if (user) {
      setNewWhatsApp(user.noWhatsapp);
    }
    setShowWhatsAppModal(true);
    setShowProfileMenu(false);
  };

  // Tampilkan loading saat mengambil data user
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SewaJa</h1>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button ref={profileButtonRef} onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{user?.namaLengkap || "Pengguna"}</p>
                  <p className="text-xs text-gray-500">Pemilik Kos</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div ref={profileMenuRef} className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.namaLengkap || "Pengguna"}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.noWhatsapp || "Belum diatur"}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link href="/" className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <House className="w-4 h-4" />
                      Beranda
                    </Link>
                    <button onClick={openWhatsAppModal} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Phone className="w-4 h-4" />
                      Update Nomor WhatsApp
                    </button>

                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* WhatsApp Update Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Update Nomor WhatsApp</h2>
              </div>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                  Nomor WhatsApp Baru
                </Label>
                <Input
                  id="whatsapp"
                  type="text"
                  value={newWhatsApp}
                  onChange={(e) => setNewWhatsApp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="mt-1 h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan nomor WhatsApp aktif untuk komunikasi dengan penyewa</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowWhatsAppModal(false)} variant="outline" className="flex-1 h-11" disabled={loading}>
                  Batal
                </Button>
                <Button onClick={handleUpdateWhatsApp} disabled={loading} className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Simpan
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
