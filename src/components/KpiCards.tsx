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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Toplam Satış</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{kpis?.toplamSatisHacmi.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">Adet</span></p>
        </div>
        <div className="bg-blue-50 p-2.5 rounded-lg"><Package className="text-blue-600" size={20} /></div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Ort. Kâr Marjı</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">%{kpis?.ortalamaKarMarji}</p>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-lg"><TrendingUp className="text-emerald-600" size={20} /></div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Toplam Ciro</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{kpis?.toplamCiro.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">TL</span></p>
        </div>
        <div className="bg-purple-50 p-2.5 rounded-lg"><DollarSign className="text-purple-600" size={20} /></div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Net Tahmini Kâr</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{kpis?.toplamKar.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-500">TL</span></p>
        </div>
        <div className="bg-indigo-50 p-2.5 rounded-lg"><Layers className="text-indigo-600" size={20} /></div>
      </div>
    </div>
  );
}