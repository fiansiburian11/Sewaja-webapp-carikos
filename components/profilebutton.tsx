"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileButtonProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function ProfileButton({ onLogin, onLogout }: ProfileButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    setShowDropdown(false);
    onLogin?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    onLogout?.();
  };

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
        {isLoggedIn ? (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            <User size={20} />
          </div>
        ) : (
          <Button variant="outline" className="flex items-center">
            <LogIn className="mr-2 h-4 w-4" /> Masuk
          </Button>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-2 border-b">
                <p className="font-medium">Hai, Pemilik!</p>
                <p className="text-sm text-gray-600">Status: Pemilik Kos</p>
              </div>
              <button onClick={() => router.push("/dashboard")} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <User className="mr-2 h-4 w-4" /> Dashboard
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <LogIn className="mr-2 h-4 w-4" /> Masuk sebagai Pemilik
              </button>
              <button onClick={() => router.push("/register")} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <User className="mr-2 h-4 w-4" /> Daftar Pemilik Baru
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
