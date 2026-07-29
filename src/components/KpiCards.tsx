import React from 'react';
import { Package, TrendingUp, DollarSign, Layers } from 'lucide-react';

interface KpiCardsProps {
  kpis: {
    toplamSatisHacmi: number;
    ortalamaKarMarji: string;
    toplamCiro: number;
    toplamKar: number;
  } | null;
}

export default function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
        <div className="bg-blue-50 p-4 rounded-xl mr-4"><Package className="text-blue-600" size={24} /></div>
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Toplam Satış Hacmi</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis?.toplamSatisHacmi.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">Adet</span></p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
        <div className="bg-emerald-50 p-4 rounded-xl mr-4"><TrendingUp className="text-emerald-600" size={24} /></div>
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ortalama Kâr Marjı</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">%{kpis?.ortalamaKarMarji}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
        <div className="bg-purple-50 p-4 rounded-xl mr-4"><DollarSign className="text-purple-600" size={24} /></div>
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Toplam Ciro</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis?.toplamCiro.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">TL</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
        <div className="bg-indigo-50 p-4 rounded-xl mr-4"><Layers className="text-indigo-600" size={24} /></div>
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Net Tahmini Kâr</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis?.toplamKar.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">TL</span></p>
        </div>
      </div>
    </div>
  );
}