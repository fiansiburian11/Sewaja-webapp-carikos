"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Kosan {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  hargaPerBulan: number;
  deskripsi: string;
  fotoUrls: string[];
  tersedia: boolean;
  createdAt: string;
}

export default function DashboardKosanList() {
  const [kosans, setKosans] = useState<Kosan[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kosanToDelete, setKosanToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/kosan/user")
      .then((res) => res.json())
      .then((data) => {
        setKosans(data.kosan);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleDelete = async () => {
    if (!kosanToDelete) return;
    const res = await fetch(`/api/kosan/${kosanToDelete}`, { method: "DELETE" });
    if (res.ok) {
      setKosans((prev) => prev.filter((k) => k.id !== kosanToDelete));
      setDeleteDialogOpen(false);
    }
  };

  const openPreview = (images: string[], index = 0) => {
    setSelectedImages(images);
    setSelectedIndex(index);
    setOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Kosan</h1>
        <Button onClick={() => router.push("/dashboard/add-product")} className="w-full sm:w-auto">
          <Plus className="mr-2 w-4 h-4" /> Tambah Kosan
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton height={180} />
              <CardContent className="p-4 space-y-3">
                <Skeleton count={3} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : kosans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl text-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          <h3 className="mt-4 text-lg font-medium">Belum ada kosan</h3>
          <p className="text-gray-500 mb-4">Tambahkan kosan pertama Anda</p>
          <Button onClick={() => router.push("/dashboard/add-product")} className="bg-blue-500">
            <Plus className="mr-2 w-4 h-4 " /> Tambah Kosan
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kosans.map((kosan) => (
            <Card key={kosan.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              {/* Image Gallery */}
              <div className="relative h-48 border-b cursor-pointer" onClick={() => openPreview(kosan.fotoUrls, 0)}>
                {kosan.fotoUrls.length > 0 ? (
                  <>
                    <Image src={kosan.fotoUrls[0]} alt={kosan.nama} fill className="object-contain" />
                    {kosan.fotoUrls.length > 1 && <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">+{kosan.fotoUrls.length - 1} gambar</div>}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
                )}
              </div>

              <CardHeader>
                <h2 className="text-lg font-semibold line-clamp-1">{kosan.nama}</h2>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${kosan.tersedia ? "bg-green-500" : "bg-red-500"}`}></span>
                  {kosan.tersedia ? "Tersedia" : "Tidak Tersedia"}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Alamat:</span>
                  <span className="line-clamp-1">{kosan.alamat}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Kecamatan:</span>
                  <span>{kosan.kecamatan.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Harga:</span>
                  <span className="font-semibold text-primary">Rp {kosan.hargaPerBulan.toLocaleString()}/bulan</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">{kosan.deskripsi}</p>
              </CardContent>

              <CardFooter className="flex justify-between gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/edit-product/${kosan.id}`)}>
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* Delete Button with AlertDialog */}
                <AlertDialog open={deleteDialogOpen && kosanToDelete === kosan.id} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setKosanToDelete(kosan.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kosan ini?
                        <span className="font-semibold text-foreground"> {kosan.nama}</span>? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/80" onClick={handleDelete}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative">
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
              {selectedIndex + 1} / {selectedImages.length}
            </div>
            <Image width={800} height={600} src={selectedImages[selectedIndex]} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg" />
            {selectedImages.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full" onClick={prevImage}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full" onClick={nextImage}>
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
