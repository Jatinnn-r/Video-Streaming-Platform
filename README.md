# StreamSafe - Intelligent Video Streaming Platform 🎥

**StreamSafe** is a scalable video streaming application featuring real-time content sensitivity analysis, role-based access control (RBAC), and adaptive HTTP streaming.

Built to demonstrate **Event-Driven Architecture** using Socket.io and Node.js streams.

![Tech Stack](https://skillicons.dev/icons?i=react,nodejs,express,mongodb,tailwind)

# Key Features

* **⚡ Real-Time Processing Engine:** Simulates AI content moderation with live progress updates pushed to the client via WebSockets.
* **🛡️ Multi-Tenant Security:** Role-Based Access Control (RBAC) ensuring data isolation between Viewers and Admins.
* **🌊 Optimized Streaming:** Implements HTTP Range Requests (Status 206) for efficient video buffering (Chunked Streaming).
* **🔒 Secure Auth:** JWT-based authentication with Bcrypt password hashing.

## 🛠️ Architecture

* **Frontend:** React (Vite), TailwindCSS, Socket.io Client
* **Backend:** Node.js, Express, Multer (File Handling)
* **Database:** MongoDB Atlas (Cloud)
* **Real-Time:** Socket.io (Bi-directional communication)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/video-streaming-app.git](https://github.com/YOUR_USERNAME/video-streaming-app.git)
cd video-streaming-app