'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface MarginTrendChartProps {
  data: {
    donem: string;
    ortalamaKarMarji: number;
    ortalamaMaliyet: number;
    ortalamaSatis: number;
  }[];
}

export default function MarginTrendChart({ data }: MarginTrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Marj trendleri yükleniyor...</div>;
  }

  return (
    <div className="h-72 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="donem" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
          <Line yAxisId="left" type="monotone" dataKey="ortalamaKarMarji" name="Ort. Kâr Marjı (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="ortalamaMaliyet" name="Birim Maliyet (TL)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}