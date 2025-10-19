import React, { useEffect, useRef } from "react";

const NotificationDialog = ({
  open,
  onClose,
  confirmedAppointments,
  handleUpdateStatus,
}) => {
  const dialogRef = useRef(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      style={{
        position: "absolute",
        top: "40px", // just below the bell icon
        right: "0px", // aligned to the right edge of bell
        width: "280px",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        zIndex: 100,
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "16px" }}>
          Confirmed Appointment Requests
        </h4>
      </div>

      {confirmedAppointments.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#555" }}>No new notifications</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {confirmedAppointments.map((appt) => (
            <li
              key={appt.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px" }}>
                {appt.patient?.name} <br />
                <small>{appt.appointmentTime}</small>
              </p>
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => handleUpdateStatus(appt.id, "approved")}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid green",
                    borderRadius: "4px",
                    background: "green",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(appt.id, "rejected")}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid red",
                    borderRadius: "4px",
                    background: "red",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDialog;
