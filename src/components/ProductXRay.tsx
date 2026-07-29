import React from 'react';
import { Search } from 'lucide-react';

interface ProductXRayProps {
  availableProducts: { stokKodu: string; urunAdi: string }[];
  selectedProductCode: string;
  onSelectProduct: (code: string) => void;
  productHistory: any[];
}

export default function ProductXRay({ availableProducts, selectedProductCode, onSelectProduct, productHistory }: ProductXRayProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            Ürün Bazlı ERP Röntgeni (Drill-Down Analizi)
          </h2>
          <p className="text-xs text-slate-400">İstediğiniz ürünü seçerek 6 aylık kesintisiz hareket geçmişini ve null/anomali durumunu inceleyin</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg shadow-sm w-full md:w-72">
          <span className="text-xs font-semibold text-slate-600">Ürün:</span>
          <select 
            value={selectedProductCode} 
            onChange={(e) => onSelectProduct(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer w-full"
          >
            <option value="ALL">-- Ürün Seçiniz --</option>
            {availableProducts.map(p => (
              <option key={p.stokKodu} value={p.stokKodu}>{p.stokKodu} - {p.urunAdi}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedProductCode === 'ALL' ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Detaylı incelemek için yukarıdaki menüden bir ürün seçin (Örn: U003 veya U005).
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Depo</th>
                <th className="px-4 py-3">Giriş Miktarı</th>
                <th className="px-4 py-3">Çıkış (Satış)</th>
                <th className="px-4 py-3">Dönem Sonu Stok</th>
                <th className="px-4 py-3">Birim Maliyet</th>
                <th className="px-4 py-3">Birim Satış</th>
                <th className="px-4 py-3">Veri Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productHistory.map((row, idx) => {
                const isNullOrZero = row.donem_sonu_stok === 0 && row.cikis_miktar === 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.donem}</td>
                    <td className="px-4 py-3">{row.depo}</td>
                    <td className="px-4 py-3">{row.giris_miktar} Adet</td>
                    <td className="px-4 py-3">{row.cikis_miktar} Adet</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{row.donem_sonu_stok} Adet</td>
                    <td className="px-4 py-3">{row.birim_maliyet_tl} TL</td>
                    <td className="px-4 py-3">{row.birim_satis_tl} TL</td>
                    <td className="px-4 py-3">
                      {isNullOrZero ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">Kritik / Boş Veri</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">Normal Akış</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}