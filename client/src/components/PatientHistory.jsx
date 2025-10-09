import React from "react";

const patients = [
  { name: "Cameron Thomas", issue: "Basic Checkup", date: "23 Mar 1998", badgeColor: "bg-yellow-100 text-yellow-800" },
  { name: "Frederica Kohl", issue: "Dental Checkup", date: "23 Jun 1995", badgeColor: "bg-green-100 text-green-800" },
  { name: "Miller Sykes", issue: "Teeth Extraction", date: "12 Mar 1998", badgeColor: "bg-blue-100 text-blue-800" },
  { name: "Emma Gebber", issue: "Basic Checkup", date: "05 Aug 1999", badgeColor: "bg-yellow-100 text-yellow-800" },
];

const PatientHistory = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Patient History</h2>
      <input
        type="text"
        placeholder="Search Patient Name"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-2">Patient Name</th>
            <th className="text-left py-2">Latest Visit Issue</th>
            <th className="text-left py-2">Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{p.name}</td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.badgeColor}`}>
                  {p.issue}
                </span>
              </td>
              <td className="py-2">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientHistory;
