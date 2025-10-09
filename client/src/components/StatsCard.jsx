import React from "react";
import { CalendarCheck, Clock, Users, Activity } from "lucide-react";

const stats = [
  { icon: CalendarCheck, title: "Total Counselling", value: "2.9K", change: "+5.6%", up: true },
  { icon: Clock, title: "Overall Booking", value: "3.2K", change: "-0.2%", up: false },
  { icon: Users, title: "New Appointments", value: "254", change: "-4.0%", up: false },
  { icon: Activity, title: "Total Visitors", value: "144.7K", change: "+7.5%", up: true },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-xl shadow flex items-center gap-4"
        >
          <stat.icon className="w-8 h-8 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
            <p
              className={`text-sm font-medium ${
                stat.up ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
