"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
interface WhatsAppButtonProps {
  title: string;
  noWhatsapp: string;
  kosanUrl: string; // misalnya: `/kosan/abc123`
}

const WhatsAppButton = ({ title, noWhatsapp, kosanUrl }: WhatsAppButtonProps) => {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin); // contoh: https://namasite.com
    }
  }, []);

  const pesan = encodeURIComponent(`Halo! Saya tertarik dengan kosan ini: ${origin}${kosanUrl}`);

  return (
    <Link href={`https://wa.me/${noWhatsapp}?text=${pesan}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex gap-1 items-center transition-colors">
      {/* WhatsApp icon */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M20.52 3.48A11.85 11.85 0 0 0 12 0C5.37 0 0 5.37 0 12a11.92 11.92 0 0 0 1.67 6.1L0 24l6.25-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.66 0-3.27-.41-4.69-1.18l-.34-.19-3.7.97.99-3.66-.22-.35A9.96 9.96 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.15-7.4c-.28-.14-1.65-.82-1.91-.91-.26-.1-.45-.15-.64.14-.19.28-.74.9-.9 1.08-.17.18-.34.2-.63.07-.3-.13-1.26-.46-2.39-1.47-.88-.78-1.48-1.74-1.65-2.03-.17-.3-.02-.47.13-.62.13-.13.3-.33.44-.5.14-.17.2-.28.3-.47.1-.2.05-.37-.02-.51-.07-.15-.63-1.51-.87-2.07-.23-.56-.46-.48-.63-.49h-.54c-.2 0-.52.07-.78.35-.26.28-1 1-1 2.44s1.07 2.83 1.23 3.03c.16.2 2.07 3.28 5.11 4.59.72.31 1.28.49 1.72.63.73.23 1.38.2 1.89.13.58-.09 1.75-.71 2.01-1.4.26-.69.26-1.28.18-1.41-.08-.14-.29-.22-.6-.36z" />
      </svg>
      <span>{title}</span>
    </Link>
  );
};

export default WhatsAppButton;
