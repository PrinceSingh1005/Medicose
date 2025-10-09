import React from "react";

const requests = [
  { name: "Uthman ibn Hunain",   type: "Individual Counselling", time: "06 Feb, 10:00 am - 11:45 am", img: 20 },
  { name: "Sa'd ibn Mu'adh",     type: "Couple Counselling",     time: "08 Feb, 4:00 pm - 5:00 pm",   img: 21 },
  { name: "Zubayr ibn al-Awwam", type: "Family Counselling",     time: "09 Feb, 8:00 pm - 9:00 pm",   img: 22 },
  { name: "Khalil Ahmed",        type: "Individual Counselling", time: "10 Feb, 1:00 pm - 2:00 pm",   img: 23 },
];

export default function AppointRequest() {
  return (
    <aside className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Appoint Request</h3>
        <button className="text-sm text-indigo-600">See All</button>
      </div>

      <div className="space-y-3">
        {requests.map((r, i) => (
          <div key={i} className="p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <img className="w-10 h-10 rounded-full" src={`https://i.pravatar.cc/40?img=${r.img}`} alt="" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">{r.time}</div>
                <div className="text-xs text-gray-500">{r.type}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200">Reject</button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600">
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
