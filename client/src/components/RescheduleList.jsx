import React from "react";

const appointments = [
  { name: "Koman Manurung", type: "Teeth Cleaning", time: "10:00 AM" },
  { name: "Miller Sykes", type: "Teeth Extraction", time: "01:45 PM" },
  { name: "Emma Gebber", type: "Dental Checkup", time: "04:45 PM" },
];

const RescheduleList = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Reschedule Appointment</h2>
      <ul className="space-y-3">
        {appointments.map((a, i) => (
          <li key={i} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-sm text-gray-500">{a.type} • {a.time}</p>
            </div>
            <button className="text-blue-500 hover:underline">Reschedule</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RescheduleList;
