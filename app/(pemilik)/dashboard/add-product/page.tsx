"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import { ChevronLeft, UploadCloud, Trash2, Loader2 } from "lucide-react";

export default function FormUploadKosan() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    kecamatan: "",
    hargaPerBulan: "",
    deskripsi: "",
    pemilikId: "",
    fotoFiles: [] as File[],
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Ambil pemilikId dari token
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      try {
        const decoded: { id: string; email: string } = jwtDecode(token);
        setFormData((prev) => ({
          ...prev,
          pemilikId: decoded.id,
        }));
      } catch (err) {
        console.error("Gagal decode token:", err);
      }
    }
  }, []);

  // Buat preview gambar
  useEffect(() => {
    const urls = formData.fotoFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.fotoFiles]);

  // Hapus gambar dari preview
  const removeImage = (index: number) => {
    const newFiles = [...formData.fotoFiles];
    newFiles.splice(index, 1);
    setFormData({ ...formData, fotoFiles: newFiles });
  };

  async function handleUploadAndSubmit() {
    setLoading(true);

    // Validasi form
    if (!formData.nama || !formData.alamat || !formData.kecamatan || !formData.hargaPerBulan || !formData.deskripsi) {
      toast.error("Harap isi semua kolom yang wajib diisi");
      setLoading(false);
      return;
    }

    if (formData.fotoFiles.length === 0) {
      toast.error("Harap unggah minimal satu foto");
      setLoading(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      // Upload setiap gambar ke Supabase
      for (const file of formData.fotoFiles) {
        const filePath = `kosan/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("images").upload(filePath, file);
        if (error) throw error;

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      // Kirim data ke API
      const res = await fetch("/api/kosan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hargaPerBulan: Number(formData.hargaPerBulan),
          fotoUrls: uploadedUrls,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result?.error || "Gagal mengirim data kosan");

      toast.success("Kosan berhasil ditambahkan");
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      console.error("Upload error:", err);
      toast.error(error.message || "Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
              Tambah Kosan Baru
            </CardTitle>
            <p className="text-gray-600 mt-2">Isi form di bawah untuk menambahkan kosan baru ke dalam sistem</p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nama">Nama Kosan *</Label>
                <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Kosan Sejahtera" />
                <p className="text-xs text-gray-500 mt-1">Nama yang mudah diingat untuk kosan Anda</p>
              </div>

              <div>
                <Label htmlFor="alamat">Alamat Lengkap *</Label>
                <Input id="alamat" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} placeholder="Contoh: Jl. Merdeka No. 123" />
                <p className="text-xs text-gray-500 mt-1">Alamat lengkap termasuk nomor rumah</p>
              </div>

              <div>
                <Label>Kecamatan *</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, kecamatan: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {["BUKIT_RAYA", "LIMA_PULUH", "MARPOYAN_DAMAI", "PAYUNG_SEKAKI", "PEKANBARU_KOTA", "SAIL", "SENAPELAN", "SUKAJADI", "TENAYAN_RAYA", "BINAWIDYA", "KULIM", "RUMBAI", "RUMBAI_BARAT", "RUMBAI_TIMUR", "TUAHMADANI"].map(
                      (k) => (
                        <SelectItem key={k} value={k}>
                          {k.replace(/_/g, " ")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Pilih kecamatan lokasi kosan</p>
              </div>

              <div>
                <Label htmlFor="harga">Harga per Bulan (Rp) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                  <Input id="harga" type="number" value={formData.hargaPerBulan} onChange={(e) => setFormData({ ...formData, hargaPerBulan: e.target.value })} className="pl-8" placeholder="Contoh: 1500000" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Harga sewa per bulan tanpa biaya tambahan</p>
              </div>
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi Kosan *</Label>
              <Textarea id="deskripsi" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsikan fasilitas, aturan, dan keunggulan kosan" rows={5} />
              <p className="text-xs text-gray-500 mt-1">Berikan informasi selengkap mungkin agar menarik bagi calon penyewa</p>
            </div>

            <div>
              <Label>Foto Kosan *</Label>
              <p className="text-sm text-gray-600 mb-3">Unggah foto yang menunjukkan kondisi kosan (minimal 1 foto, maks. 5MB per foto)</p>

              {/* Preview gambar */}
              <div className="flex flex-wrap gap-4 mb-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <Image src={url} alt={`preview-${idx}`} width={128} height={128} className="w-full h-full object-cover" />
                    </div>
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(idx)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Area upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <Label htmlFor="file-upload" className="flex flex-col items-center justify-center p-8 cursor-pointer">
                  <UploadCloud className="w-10 h-10 text-indigo-500 mb-3" />
                  <p className="font-medium text-gray-700">Klik untuk upload atau drag & drop file</p>
                  <p className="text-sm text-gray-500 mt-1">Format PNG, JPG, JPEG (max. 5MB per file)</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={(e) => e.preventDefault()}>
                    Pilih File
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFormData((prev) => ({
                      ...prev,
                      fotoFiles: [...prev.fotoFiles, ...newFiles],
                    }));
                  }}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t py-6">
            <Button onClick={handleUploadAndSubmit} disabled={loading} className="w-full md:w-auto px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Menambahkan Kosan...
                </>
              ) : (
                "Tambahkan Kosan"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Pastikan semua informasi yang Anda berikan akurat dan lengkap. Kosan akan ditinjau sebelum ditampilkan di platform.</p>
        </div>
      </div>
    </div>
  );
}
