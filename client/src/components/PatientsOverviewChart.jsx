import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle,
} from "recharts";

const base = [
  { range: "8-15", count: 17 },
  { range: "16-20", count: 45 },
  { range: "21-29", count: 102 },
  { range: "30-39", count: 148 },
  { range: "40-45", count: 58 },
  { range: "46-60", count: 46 },
  { range: "61-80", count: 33 },
];

export default function PatientsOverviewChart({ className = "" }) {
  const [period, setPeriod] = useState("This Month");
  const data = base; // wire real data here when available

  return (
    <section className={`bg-white rounded-xl shadow p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Patients Overview</h3>
        <select
          className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg outline-none"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <XAxis dataKey="range" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} ticks={[0, 50, 100, 150]} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar
              dataKey="count"
              shape={<Rectangle radius={[8, 8, 8, 8]} />}
              fill="#E5E7EB"
              activeBar={<Rectangle radius={[8, 8, 8, 8]} fill="#6366F1" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
