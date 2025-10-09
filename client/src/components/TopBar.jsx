import React from "react";
import { Bell, ChevronDown, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">

      <div className="flex-1 flex items-center max-w-2xl mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <img
            src={`https://i.pravatar.cc/40?img=12`}
            alt="avatar"
            className="w-9 h-9 rounded-full"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-800">Dr. Oliver Mitchell</div>
            <div className="text-xs text-gray-500 -mt-0.5">Psychotherapist</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
