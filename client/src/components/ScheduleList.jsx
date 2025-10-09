import React from "react";
import { Phone, Video, MoreHorizontal } from "lucide-react";

const rows = [
  { type: "Individual Counselling", name: "Ibrahim Kadri",  date: "05 Feb, 11:00 am - 11:45 am", icon: "👤" },
  { type: "Couple Counselling",     name: "Miqdad ibn Aswad", date: "05 Feb, 12:00 pm - 12:45 pm", icon: "💞" },
  { type: "Teen Counselling",        name: "Sa'd ibn Abi Waqqas", date: "05 Feb, 3:00 pm - 3:45 pm", icon: "🧑" },
  { type: "Individual Counselling",  name: "Abu Talha al-Ansari", date: "06 Feb, 3:00 pm - 3:45 pm", icon: "👤" },
  { type: "Couple Counselling",      name: "Abdullah ibn Masud", date: "06 Feb, 4:00 pm - 4:45 pm", icon: "💞" },
  { type: "Family Counselling",      name: "Zayd ibn Thabit", date: "06 Feb, 7:00 pm - 7:45 pm", icon: "👨‍👩‍👧" },
];

export default function ScheduleList() {
  return (
    <section className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Schedule List</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg">Filter</button>
          <button className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg">Add New</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Appoint for</th>
              <th className="py-2">Name</th>
              <th className="py-2">Date & Time</th>
              <th className="py-2">Type</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-lg">{r.icon}</span>
                    <span className="font-medium text-gray-800">{r.type}</span>
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/32?img=${i+3}`} alt="" />
                    <span className="text-gray-800">{r.name}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-600">{r.date}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <Video className="w-4 h-4 text-emerald-500" />
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
