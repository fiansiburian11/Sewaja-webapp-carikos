"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Mail, Phone, Lock, User, CreditCard } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");

  const router = useRouter();

  // Fungsi validasi nomor WhatsApp
  const validateWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, ""); // Hapus semua non-digit
    const whatsappRegex = /^(?:62|0)(\d{9,14})$/;

    if (!whatsappRegex.test(cleanNumber)) {
      return "Format nomor tidak valid. Gunakan 08xxxxxxxxxx atau 62xxxxxxxxxx";
    }
    return "";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    //validasi no wa
    const whatsappInput = e.currentTarget.noWhatsapp as HTMLInputElement;
    const whatsappError = validateWhatsApp(whatsappInput.value);

    if (whatsappError) {
      toast.error(whatsappError);
      setWhatsappError(whatsappError);
      return;
    } else {
      setWhatsappError("");
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    // Format nomor WhatsApp sebelum dikirim
    const cleanWhatsApp = payload.noWhatsapp.toString().replace(/\D/g, "");
    const formattedWhatsApp = cleanWhatsApp.startsWith("0") ? "62" + cleanWhatsApp.substring(1) : cleanWhatsApp;

    payload.noWhatsapp = formattedWhatsApp;

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok && data.snapToken) {
      toast.success("Registrasi berhasil, lanjut ke pembayaran...");

      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.MIDTRANS_CLIENT_KEY!);
      document.body.appendChild(script);

      script.onload = () => {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil! Silakan login.");
            router.push("/login");
          },
          onPending: () => toast.info("Menunggu pembayaran..."),
          onError: () => toast.error("Gagal memproses pembayaran"),
          onClose: () => toast.warning("Pembayaran dibatalkan"),
        });
      };
    } else {
      toast.error(data.error || "Gagal daftar");
    }

    setLoading(false);
  }
  // Handler untuk validasi real-time
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateWhatsApp(value);
    setWhatsappError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bergabung dengan Kami</h1>
          <p className="text-gray-600">Daftar sebagai pemilik kos dan mulai kelola properti Anda</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Lengkap Field */}
            <div className="space-y-2">
              <Label htmlFor="namaLengkap" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Lengkap
              </Label>
              <Input
                id="namaLengkap"
                name="namaLengkap"
                required
                placeholder="Masukkan nama lengkap"
                className="h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="masukkan@email.com"
                className="h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* WhatsApp Field */}
            <div className="space-y-2">
              <Label htmlFor="noWhatsapp" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                No WhatsApp
              </Label>
              <Input
                id="noWhatsapp"
                name="noWhatsapp"
                required
                placeholder="08xxxxxxxxxx"
                className={`h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${whatsappError ? "border-red-500 focus:border-red-500" : ""}`}
                onChange={handleWhatsAppChange}
              />
              {whatsappError && <p className="text-red-500 text-xs mt-1">{whatsappError}</p>}
              <p className="text-xs text-gray-500 mt-1">Contoh: 081234567890 atau 6281234567890</p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Buat password yang kuat"
                  className="h-12 px-4 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter dengan kombinasi huruf dan angka</p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informasi Pembayaran</p>
                <p className="text-blue-700">Setelah registrasi, Anda akan diarahkan untuk menyelesaikan pembayaran biaya pendaftaran.</p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Mendaftar...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Daftar & Bayar
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{" "}
              <button type="button" onClick={() => router.push("/login")} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Masuk di sini
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Dengan mendaftar, Anda menyetujui <button className="text-blue-500 hover:text-blue-600 transition-colors">Syarat & Ketentuan</button> dan{" "}
            <button className="text-blue-500 hover:text-blue-600 transition-colors">Kebijakan Privasi</button> kami
          </p>
        </div>
      </div>
    </div>
  );
}
