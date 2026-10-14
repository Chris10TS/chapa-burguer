'use client';

import { useState, useEffect } from 'react';
import { isStoreOpen, getScheduleText } from '@/lib/utils';

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isStoreOpen());
    const interval = setInterval(() => setOpen(isStoreOpen()), 60000);
    return () => clearInterval(interval);
  }, []);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const mapsLink = process.env.NEXT_PUBLIC_MAPS_LINK || '#';

  return (
    <header className="bg-gradient-to-b from-chapa-brown to-chapa-brown-light text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="w-28 h-28 rounded-full border-4 border-chapa-yellow shadow-lg mb-4 overflow-hidden">
          <img
            src="/logo-chapa.jpg"
            alt="CHAPA BURGUER Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Nombre y eslogan */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          CHAPA BURGUER
        </h1>
        <p className="text-chapa-yellow font-semibold text-lg mt-1">
          Sabor que une
        </p>

        {/* Estado del local */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              open
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${
              open ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            {open ? 'Abierto ahora - Tomando pedidos' : 'Cerrado'}
          </div>
          <p className="text-white/60 text-sm">
            🕐 Horario: {getScheduleText()}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-5">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all border border-white/20 active:scale-95"
          >
            📍 Cómo llegar
          </a>
        </div>
      </div>
    </header>
  );
}
