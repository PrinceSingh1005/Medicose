import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
// import "../Style/calendar.css"

const DateFilter = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Change Date Filter</h2>
      <Calendar
        onChange={setDate}
        value={date}
        className="border-0"
      />
      <p className="mt-3 text-sm text-gray-500">
        Selected: <span className="font-medium">{date.toDateString()}</span>
      </p>
    </div>
  );
};

export default DateFilter;
