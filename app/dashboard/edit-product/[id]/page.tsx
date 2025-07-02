"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Save, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Kosan {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  hargaPerBulan: number;
  deskripsi: string;
  fotoUrls: string[];
  tersedia: boolean;
}

// Sesuaikan dengan enum di schema Prisma
const kecamatanOptions = ["BUKIT_RAYA", "LIMA_PULUH", "MARPOYAN_DAMAI", "PAYUNG_SEKAKI", "PEKANBARU_KOTA", "SAIL", "SENAPELAN", "SUKAJADI", "TENAYAN_RAYA", "BINAWIDYA", "KULIM", "RUMBAI_BARAT", "RUMBAI", "RUMBAI_TIMUR", "TUAHMADANI"];

// Fungsi untuk mengubah format enum menjadi teks lebih readable
const formatKecamatan = (kecamatan: string) => {
  return kecamatan
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function EditKosanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [kosan, setKosan] = useState<Kosan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKosan = async () => {
      try {
        const response = await fetch(`/api/kosan/${id}`);

        if (!response.ok) {
          // Tangani error response dengan benar
          const errorText = await response.text();
          let errorMessage = `HTTP error! status: ${response.status}`;

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const data: Kosan = await response.json();
        setKosan(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Gagal memuat data kosan");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchKosan();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKosan((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSwitchChange = (checked: boolean) => {
    setKosan((prev) => (prev ? { ...prev, tersedia: checked } : null));
  };

  const handleSelectChange = (value: string) => {
    setKosan((prev) => (prev ? { ...prev, kecamatan: value } : null));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveExistingImage = (url: string) => {
    if (!kosan) return;

    setKosan({
      ...kosan,
      fotoUrls: kosan.fotoUrls.filter((img) => img !== url),
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk upload gambar ke Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("images") // Ganti dengan nama bucket Anda
      .upload(`kosan/${fileName}`, file);

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Gagal mengupload gambar");
    }

    // Dapatkan URL publik
    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kosan) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Upload semua gambar baru ke Supabase
      const uploadedImageUrls: string[] = [];

      for (const file of newImages) {
        try {
          const url = await uploadImageToSupabase(file);
          uploadedImageUrls.push(url);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(`Gagal upload gambar: ${file.name}`);
        }
      }

      // 2. Gabungkan URL gambar lama dan baru
      const allFotoUrls = [...kosan.fotoUrls, ...uploadedImageUrls];

      // 3. Update data utama dengan PATCH
      const updateResponse = await fetch(`/api/kosan/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: kosan.nama,
          alamat: kosan.alamat,
          kecamatan: kosan.kecamatan,
          hargaPerBulan: Number(kosan.hargaPerBulan),
          deskripsi: kosan.deskripsi,
          fotoUrls: allFotoUrls, // Kirim semua URL gambar
          tersedia: kosan.tersedia,
        }),
      });

      if (!updateResponse.ok) {
        let errorMessage = "Gagal mengupdate data kosan";

        try {
          const errorText = await updateResponse.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      toast.success("Kosan berhasil diperbarui!");
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Terjadi kesalahan saat mengupdate kosan");
      toast.error("Gagal memperbarui kosan");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Memuat data kosan...</p>
      </div>
    );
  }

  if (error || !kosan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="mb-4">{error || "Kosan tidak ditemukan"}</p>
          <p className="text-sm mb-4">ID: {id}</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Edit Kosan: {kosan.nama}</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Dasar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nama">Nama Kosan *</Label>
                  <Input id="nama" name="nama" value={kosan.nama} onChange={handleChange} placeholder="Nama kosan" required />
                </div>

                <div>
                  <Label htmlFor="hargaPerBulan">Harga per Bulan (Rp) *</Label>
                  <Input id="hargaPerBulan" name="hargaPerBulan" type="number" value={kosan.hargaPerBulan} onChange={handleChange} placeholder="Contoh: 1500000" required />
                </div>

                <div>
                  <Label htmlFor="alamat">Alamat Lengkap *</Label>
                  <Input id="alamat" name="alamat" value={kosan.alamat} onChange={handleChange} placeholder="Alamat lengkap" required />
                </div>

                <div>
                  <Label>Kecamatan *</Label>
                  <Select value={kosan.kecamatan} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kecamatanOptions.map((kec) => (
                        <SelectItem key={kec} value={kec}>
                          {formatKecamatan(kec)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <Label htmlFor="deskripsi">Deskripsi Kosan *</Label>
                <Textarea id="deskripsi" name="deskripsi" value={kosan.deskripsi} onChange={handleChange} placeholder="Deskripsikan fasilitas, aturan, dan keunggulan kosan" rows={4} required />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <Switch id="tersedia" checked={kosan.tersedia} onCheckedChange={handleSwitchChange} />
                <div>
                  <Label htmlFor="tersedia" className="text-base">
                    {kosan.tersedia ? "Kosan Tersedia" : "Kosan Tidak Tersedia"}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{kosan.tersedia ? "Kosan akan ditampilkan dalam pencarian" : "Kosan tidak akan ditampilkan dalam pencarian"}</p>
                </div>
              </div>

              {/* Gambar */}
              <div className="space-y-4">
                <div>
                  <Label>Gambar Kosan</Label>
                  <p className="text-sm text-gray-600 mb-3">Unggah gambar yang menunjukkan kondisi kosan (maks. 5MB per gambar)</p>

                  {/* Gambar yang ada */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Gambar Saat Ini</h3>
                    {kosan.fotoUrls.length === 0 ? (
                      <p className="text-gray-500 italic">Belum ada gambar</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {kosan.fotoUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <Image src={url} alt={`Gambar kosan ${index + 1}`} width={200} height={200} className="object-cover w-full h-full" />
                            </div>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveExistingImage(url)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gambar baru */}
                  <div>
                    <h3 className="font-medium mb-3">Gambar Baru</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="w-24 h-24 rounded-lg overflow-hidden border">
                            <Image width={1000} height={1000} src={URL.createObjectURL(file)} alt={`Gambar baru ${index + 1}`} className="object-cover w-full h-full" />
                          </div>
                          <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 w-6 h-6 rounded-full" onClick={() => handleRemoveNewImage(index)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (max. 5MB)</p>
                      </div>
                      <Input id="image-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                    </Label>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                  Batal
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
