'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface DepotTrendChartProps {
  data: {
    donem: string;
    [key: string]: any;
  }[];
}

export default function DepotTrendChart({ data }: DepotTrendChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Depo trendleri yükleniyor...</div>;
  }

  const depots = Object.keys(data[0] || {}).filter(key => key !== 'donem');
  const colors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c'];

  return (
    <div className="h-72 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="donem" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
          {depots.map((depot, index) => (
            <Line 
              key={depot}
              type="monotone"
              dataKey={depot}
              name={depot}
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