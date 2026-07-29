'use client'; // Recharts gibi interaktif kütüphaneler client-side çalışır

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TrendChartProps {
  data: {
    donem: string;
    toplamSatis: number;
    donemSonuStok: number;
  }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Veri yükleniyor...</div>;
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="donem" 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            tickMargin={10}
            axisLine={false}
          />
          {/* Sol Eksen: Satışlar için */}
          <YAxis 
            yAxisId="left" 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          {/* Sağ Eksen: Stoklar için (Farklı ölçekte olabilirler) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="toplamSatis" 
            name="Toplam Satış"
            stroke="#3b82f6" // Mavi
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="donemSonuStok" 
            name="Dönem Sonu Stok"
            stroke="#10b981" // Yeşil
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}