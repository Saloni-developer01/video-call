# 📞 Video Call App ⋆˚࿔ (Full-Stack MERN & WebRTC)

**Project Overview:** A robust and feature-rich real-time video conferencing application built on the **MERN stack** (MongoDB, Express.js, React, Node.js). This platform facilitates seamless one-on-one and group communication, leveraging **Socket.IO** and **WebRTC** for low-latency video, audio, and screen-sharing functionalities. The application is designed for an intuitive, interactive user experience with complete session tracking.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **🎥 Real-time Video & Audio** | Seamless and high-quality communication for one-on-one or group calls. |
| **💻 Screen Sharing** | Allows users to share their screen with other participants for presentations and collaborative work. |
| **💬 Integrated Chat** | Text-based chat functionality available during live calls for quick, non-verbal communication. |
| **🎛️ Media Controls** | Intuitive controls to easily **toggle video and microphone** status on/off. |
| **⏱️ Call History** | Dedicated section to view a complete record of past meetings, including participants and timestamps. |
| **🌟 User-Friendly UI/UX** | Clean, intuitive design prioritizing easy navigation and effortless interaction. |

---

## 🛠️ Technology Stack

This application is built using modern, powerful technologies to ensure reliability and speed.

### Frontend (Client)
* **React.js:** For building a dynamic, responsive, and component-based User Interface.
* **HTML5, CSS3, JavaScript:** Core web development standards.

### Backend & Real-time Communication
* **Node.js & Express.js:** The core runtime and web application framework for the server-side.
* **Socket.IO:** Enables **real-time, bidirectional** and low-latency event-based communication between clients and the server (essential for signaling).
* **WebRTC (Web Real-Time Communication):** The fundamental technology powering the direct video and audio streaming peer-to-peer connection.

### Database
* **MongoDB:** A flexible NoSQL database used for storing user data, meeting details, and comprehensive call history logs.

---

## 🔗 Live Demo

You can experience the **Video Call App** live here:

[Experience the Video Call App live! ✮⋆˙](https://video-call-frontend-m89l.onrender.com/)


---

## 🐳 Docker Hub Images
Project images are publicly available on Docker Hub for quick deployment:
* **Backend Image:** `saloniyadav29/zoomclone-backend:v1`
* **Frontend Image:** `saloniyadav29/zoomclone-frontend:v1`

---


## ⚙️ Installation and Setup Guide

### 1. Prerequisites

* Node.js (v18+)
* Docker Desktop (If running via Docker)
* MongoDB Instance (Local or MongoDB Atlas)

### 2. Clone the Repository

```bash
    git clone https://github.com/Saloni-developer01/video-call.git
    cd video-call
```

### 3. Setup Environment Variables

Create a .env file in the root directory (for Docker) or inside backend/ (for manual setup) with the following:

```bash
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
```

### 4. Choose Your Run Mode

### Option A: Run with Docker (Recommended)

```bash
    docker-compose up --build
```

App will be live at: http://localhost:3000

### Option B: Manual Setup

#### 📁 Backend Setup :

```bash
    cd backend
    npm install
    npm run dev
```

#### 💻 Frontend Setup :

```bash
    cd frontend
    npm install
    npm start
```
