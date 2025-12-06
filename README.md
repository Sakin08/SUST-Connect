<div align="center">

# 🎓 SUST Connect  
### Your Complete Campus Companion

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://sust-connect-eta.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19.2.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)

**A comprehensive social networking and campus management platform for Shahjalal University of Science and Technology (SUST)**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack)  

</div>

---

## 📖 About

SUST Connect is a full-stack web application designed to improve campus life by providing a single digital platform for students, teachers, and staff. From marketplace to messaging, events to elections — everything is in one place.

### 🎯 Key Highlights

- 🔐 **Secure Authentication** – JWT + OTP verification  
- 💬 **Real-time Chat** – Socket.IO messaging  
- 🛒 **Marketplace** – Buy/sell items & housing  
- 📱 **Social Networking** – Posts, comments, likes  
- 📅 **Events** – Create, RSVP, reminders  
- 🍔 **Food Menu & Orders**  
- 🩸 **Blood Donation Network**  
- 🗳️ **Digital Elections**  
- 💼 **Job Board**  
- 📚 **Study Groups**

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🌐 Social Networking
- Personalized newsfeed  
- Create posts with images  
- Like, comment, share  
- Follow/Unfollow users  
- Save posts  
- User profiles  

### 🛍️ Marketplace
- Buy & Sell items  
- Housing listings  
- Search & filters  
- Contact sellers  
- Image gallery  
- Mark items sold  

### 📅 Events
- Event creation  
- RSVP system  
- Reminders  
- Map integration  
- Academic calendar  

</td>
<td width="50%">

### 💬 Messaging
- Real-time chat  
- Typing indicator  
- Online status  
- File sending  
- Read receipts  

### 🍕 Food Services
- Restaurant profiles  
- Menus  
- Order system  
- Reviews & ratings  

### 🎓 Academic Tools
- Study groups  
- Book exchange  
- Course discussions  
- Academic resources  

</td>
</tr>
</table>

### 🚀 Additional

- Lost & Found  
- Bus schedules  
- Notifications  
- Admin panel  
- Analytics dashboard  

---

## 🎬 Demo

### 🌐 Live Application  
**Frontend**: https://sust-connect-eta.vercel.app  
**Backend API**: Render Hosting

---

## 📸 Screenshots  

<table>
  <tr>
    <td>
      <a href="https://i.postimg.cc/hfHfFYbK/home.png">
        <img src="https://i.postimg.cc/hfHfFYbK/home.png" width="420" alt="Home Page" />
      </a>
    </td>
    <td>
      <a href="https://i.postimg.cc/PCYNdM2W/newsfeed.png">
        <img src="https://i.postimg.cc/PCYNdM2W/newsfeed.png" width="420" alt="Newsfeed" />
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://i.postimg.cc/9DZzcBJ0/messages.png">
        <img src="https://i.postimg.cc/9DZzcBJ0/messages.png" width="420" alt="Messaging" />
      </a>
    </td>
    <td>
      <a href="https://i.postimg.cc/sBzxxZN5/marketplace.png">
        <img src="https://i.postimg.cc/sBzxxZN5/marketplace.png" width="420" alt="Marketplace" />
      </a>
    </td>
  </tr>
</table>

---


---

## 🛠️ Tech Stack

### Frontend

```
React 19.2.0          - UI Library
Vite 7.2.2            - Build Tool
React Router 7.9.5    - Routing
Tailwind CSS 4.1.17   - Styling
Socket.IO Client      - Real-time Communication
Axios                 - HTTP Client
Leaflet               - Maps Integration
Lucide React          - Icons
```

### Backend

```
Node.js               - Runtime
Express.js 5.1.0      - Web Framework
MongoDB 8.19.3        - Database (Mongoose)
Socket.IO 4.8.1       - WebSocket Server
JWT                   - Authentication
Bcrypt.js             - Password Hashing
Cloudinary            - Image Storage
Nodemailer            - Email Service
Node-cron             - Scheduled Tasks
```

### DevOps

```
Vercel                - Frontend Hosting
Render                - Backend Hosting
MongoDB Atlas         - Database Hosting
Cloudinary            - CDN & Image Storage
Git & GitHub          - Version Control
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/sust-connect.git
cd sust-connect
```

2. **Backend Setup**

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_EXPIRES=7d
JWT_ACCESS_EXPIRES=15m
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start backend server:

```bash
npm run dev
```

Backend runs on `http://localhost:5001`

3. **Frontend Setup**

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5001/api
```

Start frontend server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

4. **Create System Admin**

```bash
cd backend
npm run create-system-admin
```

### 🎉 You're all set!

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
sust-connect/
├── backend/
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic (30+ controllers)
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # Mongoose schemas (35+ models)
│   ├── routes/              # API routes (30+ route files)
│   ├── services/            # Business services
│   ├── socket/              # Socket.IO handlers
│   ├── utils/               # Utility functions
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # API configuration
│   │   ├── assets/          # Images, fonts
│   │   ├── components/      # Reusable components (40+)
│   │   ├── context/         # React Context (Auth, Socket)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components (70+)
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── PROJECT_DOCUMENTATION.md  # Complete documentation
├── README.md                 # This file
└── render.yaml              # Render deployment config
```

---


## 🔌 API Endpoints

### Core Endpoints

```
Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

Users
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
POST   /api/users/:id/follow

Posts
GET    /api/posts
POST   /api/posts
POST   /api/posts/:id/like
POST   /api/posts/:id/comment

Events
GET    /api/events
POST   /api/events
POST   /api/events/:id/interested

Messaging
GET    /api/chat/conversations
GET    /api/chat/messages/:userId
POST   /api/chat/messages

... and 200+ more endpoints
```



---

## 🔐 Authentication Flow

1. **Registration** → OTP Verification → Admin Approval → Login
2. **Login** → JWT Access Token (15 min) + Refresh Token (7 days)
3. **Authorization** → Role-based access (Student, Teacher, Admin)
4. **Security** → Bcrypt password hashing, HTTP-only cookies

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Backend (Render)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push



---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---



---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---


## 🐛 Known Issues

- [ ] Mobile responsiveness needs improvement
- [ ] Image upload size optimization needed
- [ ] Search functionality can be enhanced

See [Issues](https://github.com/yourusername/sust-connect/issues) for more.


---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Video calling
- [ ] AI-powered recommendations
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Advanced analytics

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**SUST Connect Development Team**


- GitHub: [@sakin08](https://github.com/sakin08) – Sr Sakin 
- GitHub: [@arif-bepari](https://github.com/arif-bepari) – Arif 
- GitHub: [@ufms64](https://github.com/ufms64) – Farhana  

- Email: www.mdsrsakin2001@gmail.com 
- Email: 2021331003@student.sust.edu 
- Email: 2021331064@student.sust.edu


- GitHub: [@yourusername](https://github.com/yourusername)
- Email: contact@sustconnect.com


---

## 🙏 Acknowledgments

- SUST community for feedback and support
- Open source libraries and frameworks
- Contributors and testers

---

## 📞 Support


- 📧 Email: teamsustconnect@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/sakin08/sust-connect/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/sakin08/sust-connect/discussions)
=======
- 📧 Email: support@sustconnect.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sust-connect/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/sust-connect/discussions)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ for SUST Community

[Back to Top](#-sust-connect)

</div>
