import React from 'react';

interface RiskMatrixTableProps {
  risks: any[];
}

export default function RiskMatrixTable({ risks }: RiskMatrixTableProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Öncelikli Aksiyon Matrisi (Riskli Ürünler)</h2>
          <p className="text-xs text-slate-400">Stoğu tükenen, kritik eşikteki veya marjı daralan ürünlerin acil yönetim listesi</p>
        </div>
        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
          {risks.length} Riskli Kalem
        </span>
      </div>

      <div className="overflow-y-auto max-h-[350px] pr-2">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 sticky top-0 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">Stok Kodu & Ürün Adı</th>
              <th className="px-4 py-3">Risk Faktörü / Seviye</th>
              <th className="px-4 py-3">Kâr Marjı</th>
              <th className="px-4 py-3">Mevcut Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {risks.length > 0 ? risks.map((risk, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {risk.stokKodu}
                  <span className="block text-xs text-slate-400 font-normal">{risk.urunAdi}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    risk.riskSeviyesi === 'Kritik' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {risk.riskTuru}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">%{risk.karMarji}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{risk.stok} Adet</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">Seçilen kriterlerde risk tespit edilmedi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}