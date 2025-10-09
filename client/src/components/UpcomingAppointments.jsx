import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildDays(base = new Date()) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const days = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function UpcomingAppointments() {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => buildDays(cursor), [cursor]);

  return (
    <section className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-600">
            {cursor.toLocaleString("default", { month: "long" })} {cursor.getFullYear()}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {days.slice(12, 24).map((d) => {
          const day = d.getDate();
          const isToday = new Date().toDateString() === d.toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`min-w-[52px] flex flex-col items-center border rounded-lg px-3 py-2
                ${isToday ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-200"}`}
            >
              <div className="text-xs text-gray-500">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className="text-sm font-semibold">{day}</div>
              <div className="mt-1 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
