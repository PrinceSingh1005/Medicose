import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const AppointmentCard = ({ appt, handleUpdateStatus }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition">
      <div className="flex justify-between items-center">
        {/* PATIENT INFO */}
        <div className="flex items-center gap-2">
          <div>
            <img src={appt.patient?.profilePhoto} alt={appt.patient?.name} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{appt.patient?.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(appt.appointmentDate).toLocaleDateString()} at{" "}
              {appt.appointmentTime}
            </p>
          </div>

          {/* STATUS BADGE */}
          <span
            className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full
              ${
                appt.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : appt.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : appt.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
          >
            {appt.status}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex space-x-3">
          {appt.status === "pending" && (
            <>
              <button
                onClick={() => handleUpdateStatus(appt._id, "confirmed")}
                className="text-green-600 hover:text-green-800"
                title="Confirm Appointment"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleUpdateStatus(appt._id, "rejected")}
                className="text-red-600 hover:text-red-800"
                title="Reject Appointment"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {appt.status === "confirmed" && appt.consultationType === "video" && (
            <Link
              to={`/doctor/video-call/${appt._id}`}
              className="text-indigo-600 hover:text-indigo-800"
              title="Join Video Call"
            >
              <VideoCameraIcon className="h-5 w-5" />
            </Link>
          )}

          {appt.status === "confirmed" && (
            <button
              onClick={() => handleUpdateStatus(appt._id, "completed")}
              className="text-blue-600 hover:text-blue-800"
              title="Mark as Completed"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
          )}

          {appt.status === "completed" && (
            <Link
              to={`/doctor/create-prescription/${appt._id}`}
              className="text-purple-600 hover:text-purple-800"
              title="Create Prescription"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
