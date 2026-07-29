'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface DepotChartProps {
  data: { depo: string; toplamSatis: number; toplamStok: number }[];
}

export default function DepotChart({ data }: DepotChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-gray-400">Depo verisi yükleniyor...</div>;
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="depo" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="toplamSatis" name="Toplam Satış" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="toplamStok" name="Dönem Sonu Stok" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}