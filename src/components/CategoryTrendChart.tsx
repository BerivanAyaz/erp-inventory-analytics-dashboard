'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface CategoryTrendChartProps {
  data: {
    donem: string;
    [key: string]: any;
  }[];
}

export default function CategoryTrendChart({ data }: CategoryTrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Kategori trendleri yükleniyor...</div>;
  }

  // Kategorileri dinamik olarak bulalım (Giyimlik, Döşemelik vb.)
  const categories = Object.keys(data[0] || {}).filter(key => key !== 'donem');
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="h-72 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="donem" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
          {categories.map((cat, index) => (
            <Line 
              key={cat}
              type="monotone"
              dataKey={cat}
              name={cat}
              stroke={colors[index % colors.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}