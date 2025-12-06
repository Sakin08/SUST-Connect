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

SUST Connect is a full-stack web application designed to revolutionize campus life by providing a centralized platform for students, teachers, and staff to connect, collaborate, and access essential campus services. From marketplace to messaging, events to elections, everything you need is in one place.

### 🎯 Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with OTP verification
- 💬 **Real-time Messaging** - Instant chat with Socket.IO
- 📱 **Social Networking** - Posts, comments, likes, and follows
- 🛒 **Campus Marketplace** - Buy/sell items and find housing
- 📅 **Event Management** - Create, RSVP, and track campus events
- 🍔 **Food Ordering** - Browse menus and order from campus restaurants
- 🩸 **Blood Donation** - Connect donors with those in need
- 🗳️ **Digital Elections** - Secure student election voting system
- 📚 **Study Groups** - Collaborate with peers
- 💼 **Job Board** - Find internships and part-time opportunities

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🌐 Social Networking

- Personalized newsfeed
- Create posts with images
- Like, comment, share
- Follow/unfollow users
- User profiles & activity
- Save posts for later

### 🛍️ Marketplace

- **Buy/Sell**: List items for sale
- **Housing**: Find rooms/apartments
- Image uploads & galleries
- Search & filter options
- Contact sellers directly
- Mark items as sold

### 📅 Events & Calendar

- Create & manage events
- RSVP with capacity limits
- Event reminders
- Map integration
- Category-based browsing
- Academic calendar

</td>
<td width="50%">

### 💬 Communication

- Real-time one-on-one chat
- Online status indicators
- Typing indicators
- Read receipts
- File sharing
- Message notifications

### 🍕 Food Services

- Restaurant profiles
- Browse menus
- Place orders
- Quick menu posts
- Reviews & ratings
- Order tracking

### 🎓 Academic Tools

- Study group creation
- Book exchange requests
- Course discussions
- Resource sharing
- Academic events

</td>
</tr>
</table>

### 🚀 Additional Features

- 🩸 **Blood Donation Network** - Emergency blood requests and donor registry
- 🔍 **Lost & Found** - Report and find lost items
- 🗳️ **Student Elections** - Digital voting with real-time results
- 🚌 **Bus Schedule** - Campus transportation timings
- 📢 **Notifications** - Real-time updates for all activities
- 👨‍💼 **Admin Panel** - Complete platform management
- 📊 **Analytics Dashboard** - Usage statistics and insights
- 🔒 **Role-Based Access** - Student, Teacher, Admin roles

---

## 🎬 Demo

### 🌐 Live Application

**Frontend**: [SUST-Connect](https://sust-connect-eta.vercel.app/)  
**Backend API**: Deployed on Render

### 📸 Screenshots  

<table>
  <tr>
    <td>
      <a href="https://i.postimg.cc/hfHfFYbK/home.png">
        <img src="https://i.postimg.cc/hfHfFYbK/home.png" width="400" alt="Home Page" />
      </a>
    </td>
    <td>
      <a href="https://i.postimg.cc/PCYNdM2W/newsfeed.png">
        <img src="https://i.postimg.cc/PCYNdM2W/newsfeed.png" width="400" alt="Newsfeed" />
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://i.postimg.cc/9DZzcBJ0/messages.png">
        <img src="https://i.postimg.cc/9DZzcBJ0/messages.png" width="400" alt="Messaging" />
      </a>
    </td>
    <td>
      <a href="https://i.postimg.cc/sBzxxZN5/marketplace.png">
        <img src="https://i.postimg.cc/sBzxxZN5/marketplace.png" width="400" alt="Marketplace" />
      </a>
    </td>
  </tr>
</table>







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

### Environment Variables



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

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ for SUST Community

[Back to Top](#-sust-connect)

</div>
