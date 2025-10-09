import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import doctorAvatar from "../../../public/Profile.jpeg";
import NotificationDialog from "./NotificationDialog";

const Header = ({ userInfo, appointments, handleUpdateStatus }) => {
    console.log('Header userInfo:', userInfo);
    const [open, setOpen] = useState(false);
    const confirmedAppointments = appointments.filter(
        (appt) => appt.status === "confirmed"
    );

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: "16rem",
                right: 0,
                height: "64px",
                background: "#fff",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                zIndex: 50,
            }}
        >
            {/* Left Side */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                {/* Search Bar */}
                <div style={{ position: "relative" }}>
                    <Search
                        size={16}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "12px",
                            transform: "translateY(-50%)",
                            color: "#888",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search patients, appointments..."
                        style={{
                            padding: "8px 8px 8px 36px",
                            width: "320px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                        }}
                    />
                </div>
            </div>

            {/* Right Side */}
            {/* Notification Button + Dialog */}
            <div className="flex items-center gap-6">
            <div style={{ position: "relative" }}>
                <button
                    style={{ position: "relative", padding: "6px", borderRadius: "8px" }}
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <Bell size={20} />
                    {confirmedAppointments.length > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                height: "20px",
                                width: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "red",
                                color: "#fff",
                                fontSize: "12px",
                            }}
                        >
                            {confirmedAppointments.length}
                        </span>
                    )}
                </button>

                {/* Notification Dialog */}
                <NotificationDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    confirmedAppointments={confirmedAppointments}
                    handleUpdateStatus={handleUpdateStatus}
                />
            </div>


            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Avatar */}
                <div
                    style={{
                        height: "32px",
                        width: "32px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #ddd",
                    }}
                >
                    <img
                            src={userInfo?.profilePhoto || doctorAvatar}
                            alt="Doctor"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span>Dr</span>
                </div>

                {/* Doctor Info */}
                <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                        {userInfo?.name || "Dr. Sarah Johnson"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                        {userInfo?.specialization || "Cardiologist"}
                    </p>
                </div>
            </div>
            </div>
    </header >
  );
};

export default Header;
