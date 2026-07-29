'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react';

interface AnomalyBannerProps {
  anomalies: {
    kopyaKayitSayisi: number;
    doldurulanEksikVeri: number;
    kritikHataSayisi: number;
  } | null;
}

export default function AnomalyBanner({ anomalies }: AnomalyBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalIssues = (anomalies?.kopyaKayitSayisi || 0) + 
                      (anomalies?.doldurulanEksikVeri || 0) + 
                      (anomalies?.kritikHataSayisi || 0);

  // Dışarı tıklandığında menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!anomalies || totalIssues === 0) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold shadow-sm">
        <ShieldCheck size={15} />
        <span>Veri Kalitesi: Kusursuz (Anomali Yok)</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sağ Üstte Görünecek Tıklanabilir Buton */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
      >
        <AlertTriangle size={15} className="text-amber-600 animate-pulse" />
        <span>Veri Durumu ({totalIssues} Düzeltme)</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

{/* Tıklandığında Açılan Detay Kutusu (Dropdown Popover) */}
{isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ERP Veri Kalitesi Raporu</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Temizlendi</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            {anomalies.kopyaKayitSayisi > 0 && (
              <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                <span className="text-amber-600 font-bold">•</span>
                <span><b>{anomalies.kopyaKayitSayisi} adet</b> mükerrer (kopya) kayıt engellendi.</span>
              </li>
            )}
            {anomalies.doldurulanEksikVeri > 0 && (
              <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                <span className="text-amber-600 font-bold">•</span>
                <span><b>{anomalies.doldurulanEksikVeri} satırda</b> eksik metrik güvenli 0 ile tamamlandı.</span>
              </li>
            )}
            {anomalies.kritikHataSayisi > 0 && (
              <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                <span className="text-amber-600 font-bold">•</span>
                <span><b>{anomalies.kritikHataSayisi} adet</b> mantıksal hata (negatif stok vb.) düzeltildi.</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}