'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface StockTurnoverChartProps {
  data: {
    kategori: string;
    devirHizi: number;
    toplamSatis: number;
    toplamStok: number;
  }[];
}

export default function StockTurnoverChart({ data }: StockTurnoverChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Devir hızı verisi yükleniyor...</div>;
  }

  return (
    <div className="h-72 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="kategori" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: any) => [value, name === 'devirHizi' ? 'Devir Hızı Skoru' : name]}
          />
          <Bar dataKey="devirHizi" name="Stok Devir Hızı (Katsayı)" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}