import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AnomalyBannerProps {
  anomalies: {
    kopyaKayitSayisi: number;
    doldurulanEksikVeri: number;
    kritikHataSayisi: number;
  } | null;
}

export default function AnomalyBanner({ anomalies }: AnomalyBannerProps) {
  if (!anomalies || (anomalies.kopyaKayitSayisi === 0 && anomalies.doldurulanEksikVeri === 0 && anomalies.kritikHataSayisi === 0)) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg shadow-sm flex items-start">
      <AlertTriangle className="text-amber-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
      <div className="text-amber-900 text-sm">
        <strong className="block mb-1 font-bold">ERP Veri Kalitesi & Anomali Denetim Raporu:</strong>
        <ul className="list-disc ml-5 space-y-1 text-xs md:text-sm">
          {anomalies.kopyaKayitSayisi > 0 && <li>{anomalies.kopyaKayitSayisi} adet mükerrer (kopya) kayıt tespit edilip temizlendi.</li>}
          {anomalies.doldurulanEksikVeri > 0 && <li>{anomalies.doldurulanEksikVeri} satırda eksik metrik, zaman serisi bütünlüğü için güvenli 0 değeri ile rekonstrükte edildi.</li>}
          {anomalies.kritikHataSayisi > 0 && <li>{anomalies.kritikHataSayisi} adet mantıksal veri hatası (negatif stok vb.) otomatik düzeltildi.</li>}
        </ul>
      </div>
    </div>
  );
}