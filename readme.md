# 🌺 MediCose – Telehealth Platform

**MediCose** is a modern telehealth platform designed to seamlessly connect patients and healthcare providers through secure video consultations, intelligent appointment management, and Gemini-powered AI assistance — bringing healthcare to your fingertips.

---

## 🚀 Key Features

### 👩‍⚕️ For Patients

* 🔍 **Smart Doctor Search**
  Filter doctors by specialization, location, availability, and patient ratings.

* 🗕️ **Secure Appointment Booking**
  Book consultations quickly with real-time availability and confirmations.

* 🎥 **Video Consultations (WebRTC)**
  Conduct secure and high-quality video calls with healthcare professionals.

* 📊 **Personalized Patient Dashboard**
  Access your upcoming appointments, medical history, and e-prescriptions in one place.

* 💬 **AI Health Assistant (Gemini)**
  Get instant preliminary health guidance through a conversational interface.

---

### 🧪 For Doctors

* 📝 **Digital Prescription Management**
  Create and share digital prescriptions instantly with patients.

* 🗓️ **Appointment Scheduling System**
  Manage availability and appointments with a dynamic scheduling interface.

* 👨‍⚕️ **Customizable Doctor Profiles**
  Showcase qualifications, specializations, and availability.

* 🔔 **Real-time Notifications**
  Get alerts for new appointments, cancellations, or patient queries.

---

## 🛠️ Tech Stack

### 🖥️ Frontend

* ⚛️ **React 18** with **Vite**
* 🎨 **Tailwind CSS** + **DaisyUI**
* 🔁 **Redux Toolkit** for state management
* 🔄 **React Query** for data fetching and caching
* 📱 **Fully Responsive Design**

### 🖙 Backend

* 🟢 **Node.js** with **Express.js**
* 🍃 **MongoDB** with **Mongoose**
* 🔐 **JWT Authentication**
* 📡 **Socket.IO** for real-time updates
* 🤖 **Gemini API** for AI chatbot functionality

---

## 📸 Screenshots

### 🏠 Home Page

![Home Page](/client/public/Home.png)

### 🔍 Doctor Search Page

![Doctor Search](/client/public/Find_Doctor.png)

### 👨‍⚕️ Doctor Profile Page

![Doctor Profile](/client/public/DoctorProfilePage.png)

### 👁 Login Page

![Login](/client/public/Login.png)

### 📅 Register Page

![Register](/client/public/Register.png)

### 📊 Doctor Appointment Check Page

![Doctor Appointment Check](/client/public/Doctor_AppointmentCheckPage.png)

### 🖊️ Online Prescription & Appointment

![Prescription & Appointment](/client/public/Patient_Appointment\&Prescription_Page.png)

### 📄 Patient Profile Page

![Patient Profile](/client/public/Patient_ProfilePage.png)

### 📱 Mobile View

![Mobile View](/client/public/MobileView.png)

### 🤖 AI Chatbot

![AI ChatBot](/client/public/AI_chatbot.png)

### 🎥 Video Consultation Page

![Video Consultation](/client/public/VideoConsultation.png)

### 📖 Doctor Detail Page

![Doctor Detail](/client/public/Doctor_DetailPage.png)

---

## ⚙️ Quick Start

### 🔧 Prerequisites

* [Node.js](https://nodejs.org/) v18+
* MongoDB Atlas account or local MongoDB setup
* Gemini API key (from Google Cloud Console)

### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/PrinceSingh1005/medicose.git
cd medicose
```

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update the .env file with MongoDB URI, JWT Secret, Gemini API Key
npm run dev
```

#### 3. Frontend Setup

```bash
cd ../client
npm install
cp .env.example .env
# Update frontend .env file if needed
npm run dev
```

---

## 🤝 Contributing

We welcome community contributions!

1. Fork the repository
2. Create your feature branch
   `git checkout -b feature/AmazingFeature`
3. Commit your changes
   `git commit -m "Add: AmazingFeature"`
4. Push to the branch
   `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for more information.

---

## 📩 Contact

**Project Team:** [team@medicose.app](mailto:2003princesingh2003@gmail.com)
**GitHub:** [https://github.com/PrinceSingh1005/medicose](https://github.com/PrinceSingh1005/medicose)

---

## 🌟 Acknowledgements

* **WebRTC** — for enabling secure video consultations
* **Gemini API** — for AI assistant integration
* **Open Source Community** — for tools, libraries, and inspiration
