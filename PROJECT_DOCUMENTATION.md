# SUST Connect - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features & Modules](#features--modules)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Real-time Features](#real-time-features)
10. [Frontend Components](#frontend-components)
11. [Deployment](#deployment)
12. [Environment Variables](#environment-variables)
13. [Installation & Setup](#installation--setup)
14. [Development Workflow](#development-workflow)
15. [Security Features](#security-features)

---

## 1. Project Overview

**SUST Connect** is a comprehensive campus social networking and management platform designed specifically for Shahjalal University of Science and Technology (SUST). It serves as a centralized hub for students, teachers, and staff to connect, collaborate, and access campus services.

### Purpose

- Connect students, teachers, and staff
- Facilitate campus marketplace (buy/sell, housing)
- Manage events and academic activities
- Enable real-time communication
- Provide essential campus services (food ordering, bus schedules, blood donation)
- Support student elections and governance

### Target Users

- **Students**: Primary users for social networking, marketplace, and services
- **Teachers**: Event management, announcements, and communication
- **Admins**: Platform management, content moderation, and system administration
- **Other**: Alumni, staff, and visitors

---

## 2. Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Express Backend│◄───────►│  MongoDB Atlas  │
│   (Vite + React)│         │   (Node.js)     │         │   (Database)    │
│                 │         │                 │         │                 │
└────────┬────────┘         └────────┬────────┘         └─────────────────┘
         │                           │
         │                           │
         │                  ┌────────▼────────┐
         │                  │                 │
         └─────────────────►│   Socket.IO     │
                            │  (Real-time)    │
                            │                 │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │                 │
                            │   Cloudinary    │
                            │ (Image Storage) │
                            │                 │
                            └─────────────────┘
```

### Design Pattern

- **MVC Architecture**: Model-View-Controller pattern
- **RESTful API**: Standard REST endpoints for CRUD operations
- **Real-time Communication**: WebSocket (Socket.IO) for instant messaging and notifications
- **Microservices Approach**: Modular controllers and services

---

## 3. Technology Stack

### Backend

| Technology | Version           | Purpose                 |
| ---------- | ----------------- | ----------------------- |
| Node.js    | Latest            | Runtime environment     |
| Express.js | 5.1.0             | Web framework           |
| MongoDB    | 8.19.3 (Mongoose) | Database                |
| Socket.IO  | 4.8.1             | Real-time communication |
| JWT        | 9.0.2             | Authentication          |
| Bcrypt.js  | 3.0.3             | Password hashing        |
| Cloudinary | 2.8.0             | Image storage           |
| Multer     | 2.0.2             | File upload handling    |
| Nodemailer | 7.0.10            | Email service           |
| Node-cron  | 4.2.1             | Scheduled tasks         |
| Node-cache | 5.1.2             | In-memory caching       |

### Frontend

| Technology       | Version | Purpose          |
| ---------------- | ------- | ---------------- |
| React            | 19.2.0  | UI library       |
| Vite             | 7.2.2   | Build tool       |
| React Router     | 7.9.5   | Routing          |
| Axios            | 1.13.2  | HTTP client      |
| Socket.IO Client | 4.8.1   | Real-time client |
| Tailwind CSS     | 4.1.17  | Styling          |
| Leaflet          | 1.9.4   | Maps integration |
| Lucide React     | 0.553.0 | Icons            |

### DevOps & Deployment

- **Hosting**: Render (Backend), Vercel (Frontend)
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary
- **Version Control**: Git

---

## 4. Project Structure

### Backend Structure

```
backend/
├── config/              # Configuration files
│   ├── cloudinary.js    # Cloudinary setup
│   ├── db.js           # MongoDB connection
│   └── index.js        # Config exports
├── controllers/         # Business logic (30+ controllers)
│   ├── authController.js
│   ├── postController.js
│   ├── eventController.js
│   └── ... (27 more)
├── middleware/          # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── roleMiddleware.js
│   ├── adminOrOwner.js
│   └── errorHandler.js
├── models/             # Mongoose schemas (35+ models)
│   ├── User.js
│   ├── Post.js
│   ├── Event.js
│   └── ... (32 more)
├── routes/             # API routes (30+ route files)
│   ├── authRoutes.js
│   ├── postRoutes.js
│   └── ... (28 more)
├── services/           # Business services
│   └── eventCleanupService.js
├── socket/             # WebSocket handlers
│   └── socketHandler.js
├── utils/              # Utility functions
├── scripts/            # Admin scripts
│   └── createSystemAdmin.js
├── app.js             # Express app setup
├── server.js          # Server entry point
└── package.json       # Dependencies
```

### Frontend Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── api/          # API configuration
│   │   └── axios.js
│   ├── assets/       # Images, fonts
│   ├── components/   # Reusable components (40+)
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── PostCard.jsx
│   │   └── ... (37 more)
│   ├── context/      # React Context
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components (70+)
│   │   ├── Home.jsx
│   │   ├── Newsfeed.jsx
│   │   ├── admin/    # Admin pages
│   │   └── ... (67 more)
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main app component
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── index.html
├── vite.config.js
└── package.json
```

---

## 5. Features & Modules

### A. Authentication & User Management

- **Registration**: Email-based with OTP verification
- **Login**: JWT-based authentication with refresh tokens
- **User Roles**: Student, Teacher, Admin, Other
- **Profile Management**: Comprehensive user profiles with social links
- **Admin Approval**: New users require admin approval
- **Student Verification**: Registration number validation
- **Password Security**: Bcrypt hashing

### B. Social Networking

- **Newsfeed**: Personalized feed with posts from followed users
- **Posts**: Text, images, links, and shared content
- **Interactions**: Like, comment, share, save
- **Follow System**: Follow/unfollow users
- **User Profiles**: View profiles with activity history
- **Mentions & Tags**: Tag users and topics
- **Engagement Scoring**: Algorithm-based content ranking

### C. Marketplace

#### Buy/Sell

- Create listings for items
- Categories: Electronics, Books, Furniture, etc.
- Image uploads (multiple)
- Price negotiation via chat
- Mark as sold/available
- Search and filter

#### Housing

- Room/apartment listings
- Rent, location, amenities
- Contact landlords directly
- Map integration for locations
- Favorites and saved searches

### D. Events Management

- **Create Events**: Academic, cultural, sports, social
- **RSVP System**: Capacity management and waitlists
- **Event Calendar**: View all upcoming events
- **Reminders**: Automated notifications
- **Map Integration**: Event location on maps
- **Categories & Tags**: Easy discovery
- **Interest Tracking**: Mark interested
- **Auto-cleanup**: Past events archived automatically

### E. Real-time Messaging

- **One-on-one Chat**: Direct messaging between users
- **Online Status**: See who's online
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read status
- **File Sharing**: Send images and attachments
- **Message Deletion**: Delete for self or everyone
- **Chat History**: Persistent message storage
- **Unread Count**: Badge notifications

### F. Food Services

#### Restaurant Management

- Restaurant profiles
- Menu management
- Operating hours
- Reviews and ratings
- Image galleries

#### Food Ordering

- Browse menus
- Place orders
- Order tracking
- Order history
- Quick menu posts (daily specials)

### G. Academic Features

#### Study Groups

- Create/join study groups
- Subject-based groups
- Member management
- Discussion forums
- Resource sharing

#### Book Exchange

- Request books
- Lend/borrow system
- Book availability tracking
- Contact book owners

### H. Campus Services

#### Blood Donation

- Donor registration
- Blood type filtering
- Emergency requests
- Donor availability status
- Contact donors directly
- Request management

#### Lost & Found

- Report lost items
- Post found items
- Category-based search
- Image uploads
- Contact system
- Mark as resolved

#### Bus Schedule

- View bus timings
- Route information
- Real-time updates
- Admin management

#### Holiday Calendar

- Academic calendar
- Public holidays
- Exam schedules
- Admin-managed

### I. Job Board

- Post job opportunities
- Internships and part-time jobs
- Application tracking
- Company information
- Job categories
- Search and filter

### J. Elections & Governance

- **Student Elections**: Digital voting system
- **Candidate Profiles**: Manifestos and information
- **Election Requests**: Students can request elections
- **Voting**: Secure, one-vote-per-user system
- **Results**: Real-time result display
- **Admin Management**: Create and manage elections

### K. Notifications System

- **Real-time Notifications**: Socket.IO powered
- **Types**: Likes, comments, messages, RSVPs, etc.
- **Notification Center**: View all notifications
- **Mark as Read**: Individual or bulk
- **Push Notifications**: Browser notifications

### L. Admin Panel

- **Dashboard**: System statistics and analytics
- **User Management**: Approve, ban, verify users
- **Content Moderation**: Review and remove content
- **Reports Management**: Handle user reports
- **System Settings**: Configure platform settings
- **Election Management**: Create and manage elections
- **Holiday Management**: Update calendar
- **Bus Schedule Management**: Update routes and timings

### M. Additional Features

- **Favorites**: Save posts across all modules
- **Search**: Global search functionality
- **Filters**: Advanced filtering options
- **Reports**: Report inappropriate content
- **Reputation System**: User ratings and badges
- **Contact Form**: User support
- **Help Center**: FAQs and guides
- **Privacy Policy & Terms**: Legal pages

---

## 6. Database Models

### Core Models (35 Total)

#### User Model

```javascript
{
  // Mandatory
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  role: Enum ['student', 'teacher', 'other', 'admin']
  department: String
  registrationNumber: String
  batch: String

  // Profile
  profilePicture: String (Cloudinary URL)
  username: String
  phone: String
  gender: Enum ['male', 'female', 'other']
  dateOfBirth: Date
  bio: String (max 500 chars)
  interests: [String]

  // Social
  followers: [ObjectId -> User]
  following: [ObjectId -> User]
  savedPosts: [{postId, postType, savedAt}]

  // Verification
  isApproved: Boolean
  isVerified: Boolean
  emailVerified: Boolean
  otp: String
  otpExpiry: Date

  // Reputation
  rating: Number (0-5)
  reviewCount: Number
  reputationPoints: Number
  badges: [String]

  // Security
  reportedCount: Number
  isBanned: Boolean
  isSystemAdmin: Boolean

  timestamps: true
}
```

#### Post Model

```javascript
{
  author: ObjectId -> User
  type: Enum ['text', 'event', 'job', 'housing', 'buysell', ...]
  content: {
    text: String
    images: [String]
    link: String
  }
  sharedPost: ObjectId -> Post
  relatedContent: {
    contentType: String
    contentId: ObjectId
  }
  likes: [{user, createdAt}]
  comments: [{user, text, createdAt}]
  shares: [{user, createdAt}]
  saves: [{user, createdAt}]
  visibility: Enum ['public', 'followers', 'private']
  engagementScore: Number
  views: Number
  tags: [String]
  mentions: [ObjectId -> User]
  timestamps: true
}
```

#### Event Model

```javascript
{
  title: String (required)
  description: String (required)
  date: Date (required)
  location: String (required)
  images: [String]
  user: ObjectId -> User
  views: Number
  interested: [ObjectId -> User]
  capacity: Number (0 = unlimited)
  rsvpCount: Number
  requiresRSVP: Boolean
  waitlistEnabled: Boolean
  coordinates: {lat, lng}
  category: Enum ['academic', 'sports', 'cultural', ...]
  tags: [String]
  timestamps: true
}
```

#### Message Model

```javascript
{
  chatId: String (required)
  senderId: ObjectId -> User
  receiverId: ObjectId -> User
  message: String
  messageType: Enum ['text', 'image', 'file']
  attachments: [String]
  read: Boolean
  deletedFor: [ObjectId -> User]
  timestamps: true
}
```

#### BuySellPost Model

```javascript
{
  title: String (required)
  description: String (required)
  price: Number (required)
  category: String (required)
  condition: Enum ['new', 'like-new', 'good', 'fair']
  images: [String]
  user: ObjectId -> User
  status: Enum ['available', 'sold', 'reserved']
  location: String
  contactInfo: {phone, email}
  views: Number
  interested: [ObjectId -> User]
  tags: [String]
  timestamps: true
}
```

#### HousingPost Model

```javascript
{
  title: String (required)
  description: String (required)
  rent: Number (required)
  location: String (required)
  type: Enum ['room', 'apartment', 'house', 'hostel']
  bedrooms: Number
  bathrooms: Number
  amenities: [String]
  images: [String]
  user: ObjectId -> User
  status: Enum ['available', 'rented']
  availableFrom: Date
  contactInfo: {phone, email}
  coordinates: {lat, lng}
  views: Number
  timestamps: true
}
```

#### Job Model

```javascript
{
  title: String (required)
  company: String (required)
  description: String (required)
  type: Enum ['full-time', 'part-time', 'internship', 'contract']
  location: String
  salary: {min, max, currency}
  requirements: [String]
  responsibilities: [String]
  applicationDeadline: Date
  contactEmail: String
  user: ObjectId -> User
  status: Enum ['open', 'closed']
  applicants: [ObjectId -> User]
  views: Number
  timestamps: true
}
```

#### StudyGroup Model

```javascript
{
  name: String (required)
  description: String (required)
  subject: String (required)
  course: String
  creator: ObjectId -> User
  members: [ObjectId -> User]
  maxMembers: Number
  meetingSchedule: String
  location: String
  isOnline: Boolean
  status: Enum ['active', 'inactive', 'full']
  tags: [String]
  timestamps: true
}
```

#### Restaurant Model

```javascript
{
  name: String (required)
  description: String
  owner: ObjectId -> User
  location: String
  phone: String
  images: [String]
  operatingHours: {
    monday: {open, close}
    // ... other days
  }
  rating: Number
  reviewCount: Number
  menuItems: [ObjectId -> MenuItem]
  isActive: Boolean
  timestamps: true
}
```

#### MenuItem Model

```javascript
{
  restaurant: ObjectId -> Restaurant
  name: String (required)
  description: String
  price: Number (required)
  category: String
  image: String
  isAvailable: Boolean
  preparationTime: Number (minutes)
  tags: [String]
  timestamps: true
}
```

#### FoodOrder Model

```javascript
{
  user: ObjectId -> User
  restaurant: ObjectId -> Restaurant
  items: [{menuItem, quantity, price}]
  totalAmount: Number
  status: Enum ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
  deliveryAddress: String
  phone: String
  notes: String
  orderDate: Date
  timestamps: true
}
```

#### BloodDonor Model

```javascript
{
  user: ObjectId -> User
  bloodType: Enum ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  phone: String (required)
  location: String
  lastDonationDate: Date
  isAvailable: Boolean
  emergencyContact: {name, phone}
  medicalInfo: String
  donationCount: Number
  timestamps: true
}
```

#### BloodRequest Model

```javascript
{
  requester: ObjectId -> User
  bloodType: Enum ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  unitsNeeded: Number
  urgency: Enum ['critical', 'urgent', 'normal']
  hospital: String
  location: String
  contactPhone: String
  reason: String
  status: Enum ['active', 'fulfilled', 'cancelled']
  responses: [{donor, message, createdAt}]
  timestamps: true
}
```

#### LostFound Model

```javascript
{
  type: Enum ['lost', 'found']
  title: String (required)
  description: String (required)
  category: String
  location: String
  date: Date
  images: [String]
  user: ObjectId -> User
  contactInfo: {phone, email}
  status: Enum ['active', 'resolved']
  claims: [{user, message, createdAt}]
  timestamps: true
}
```

#### Election Model

```javascript
{
  title: String (required)
  description: String
  startDate: Date (required)
  endDate: Date (required)
  positions: [ObjectId -> ElectionPosition]
  status: Enum ['upcoming', 'active', 'completed']
  eligibleVoters: [ObjectId -> User]
  totalVotes: Number
  createdBy: ObjectId -> User
  timestamps: true
}
```

#### Candidate Model

```javascript
{
  election: ObjectId -> Election
  position: ObjectId -> ElectionPosition
  user: ObjectId -> User
  manifesto: String
  image: String
  votes: Number
  status: Enum ['pending', 'approved', 'rejected']
  timestamps: true
}
```

#### Notification Model

```javascript
{
  recipient: ObjectId -> User
  sender: ObjectId -> User
  type: Enum ['like', 'comment', 'follow', 'message', 'rsvp', ...]
  content: String
  link: String
  read: Boolean
  relatedPost: ObjectId
  relatedUser: ObjectId
  timestamps: true
}
```

#### Other Models

- **RSVP**: Event attendance tracking
- **Reminder**: User reminders for events
- **Report**: Content reporting system
- **Review**: Restaurant/user reviews
- **Vote**: Poll voting
- **Poll**: Community polls
- **Comment**: Post comments
- **Favorite**: Saved items
- **Contact**: Contact form submissions
- **Holiday**: Academic calendar
- **BusSchedule**: Campus bus timings
- **BookRequest**: Book exchange requests
- **QuickMenu**: Daily food specials
- **FoodMenu**: Restaurant menus
- **ElectionRequest**: Student election requests
- **ElectionVote**: Voting records
- **PendingUser**: Pre-approval user data

---

## 7. API Endpoints

### Authentication (`/api/auth`)

```
POST   /register              - Register new user
POST   /login                 - Login user
POST   /logout                - Logout user
POST   /refresh-token         - Refresh access token
POST   /verify-otp            - Verify OTP
POST   /resend-otp            - Resend OTP
GET    /me                    - Get current user
POST   /forgot-password       - Request password reset
POST   /reset-password        - Reset password
```

### Users (`/api/users`)

```
GET    /                      - Get all users (with filters)
GET    /:id                   - Get user by ID
PUT    /:id                   - Update user profile
DELETE /:id                   - Delete user
POST   /:id/follow            - Follow user
POST   /:id/unfollow          - Unfollow user
GET    /:id/followers         - Get user followers
GET    /:id/following         - Get users being followed
POST   /:id/save-post         - Save a post
DELETE /:id/unsave-post       - Unsave a post
GET    /:id/saved-posts       - Get saved posts
```

### Posts (`/api/posts`)

```
GET    /                      - Get all posts (feed)
POST   /                      - Create new post
GET    /:id                   - Get post by ID
PUT    /:id                   - Update post
DELETE /:id                   - Delete post
POST   /:id/like              - Like post
POST   /:id/unlike            - Unlike post
POST   /:id/comment           - Add comment
DELETE /:id/comment/:commentId - Delete comment
POST   /:id/share             - Share post
POST   /:id/save              - Save post
GET    /user/:userId          - Get user's posts
GET    /trending              - Get trending posts
```

### Events (`/api/events`)

```
GET    /                      - Get all events
POST   /                      - Create event
GET    /:id                   - Get event by ID
PUT    /:id                   - Update event
DELETE /:id                   - Delete event
POST   /:id/interested        - Mark interested
DELETE /:id/interested        - Remove interest
GET    /user/:userId          - Get user's events
GET    /upcoming              - Get upcoming events
GET    /past                  - Get past events
```

### RSVP (`/api/rsvp`)

```
POST   /                      - Create RSVP
GET    /event/:eventId        - Get event RSVPs
GET    /user/:userId          - Get user RSVPs
PUT    /:id                   - Update RSVP
DELETE /:id                   - Cancel RSVP
```

### Buy/Sell (`/api/buysell`)

```
GET    /                      - Get all listings
POST   /                      - Create listing
GET    /:id                   - Get listing by ID
PUT    /:id                   - Update listing
DELETE /:id                   - Delete listing
POST   /:id/interested        - Mark interested
GET    /user/:userId          - Get user's listings
GET    /search                - Search listings
```

### Housing (`/api/housing`)

```
GET    /                      - Get all housing posts
POST   /                      - Create housing post
GET    /:id                   - Get housing post by ID
PUT    /:id                   - Update housing post
DELETE /:id                   - Delete housing post
POST   /:id/interested        - Mark interested
GET    /user/:userId          - Get user's housing posts
GET    /search                - Search housing
```

### Jobs (`/api/jobs`)

```
GET    /                      - Get all jobs
POST   /                      - Create job posting
GET    /:id                   - Get job by ID
PUT    /:id                   - Update job
DELETE /:id                   - Delete job
POST   /:id/apply             - Apply for job
GET    /user/:userId          - Get user's job postings
GET    /search                - Search jobs
```

### Study Groups (`/api/study-groups`)

```
GET    /                      - Get all study groups
POST   /                      - Create study group
GET    /:id                   - Get study group by ID
PUT    /:id                   - Update study group
DELETE /:id                   - Delete study group
POST   /:id/join              - Join group
POST   /:id/leave             - Leave group
GET    /user/:userId          - Get user's groups
```

### Restaurants (`/api/restaurants`)

```
GET    /                      - Get all restaurants
POST   /                      - Create restaurant
GET    /:id                   - Get restaurant by ID
PUT    /:id                   - Update restaurant
DELETE /:id                   - Delete restaurant
POST   /:id/review            - Add review
GET    /:id/reviews           - Get reviews
GET    /owner/:userId         - Get owner's restaurants
```

### Menu Items (`/api/menu-items`)

```
GET    /restaurant/:id        - Get restaurant menu
POST   /                      - Add menu item
GET    /:id                   - Get menu item
PUT    /:id                   - Update menu item
DELETE /:id                   - Delete menu item
```

### Food Orders (`/api/food-orders`)

```
GET    /                      - Get all orders
POST   /                      - Create order
GET    /:id                   - Get order by ID
PUT    /:id/status            - Update order status
DELETE /:id                   - Cancel order
GET    /user/:userId          - Get user's orders
GET    /restaurant/:id        - Get restaurant orders
```

### Food Menu (`/api/food-menu`)

```
GET    /                      - Get daily menus
POST   /                      - Create menu
GET    /:id                   - Get menu by ID
PUT    /:id                   - Update menu
DELETE /:id                   - Delete menu
```

### Quick Menu (`/api/quick-menu`)

```
GET    /                      - Get quick menu posts
POST   /                      - Create quick menu post
GET    /:id                   - Get post by ID
DELETE /:id                   - Delete post
```

### Blood Donation (`/api/blood-donation`)

```
GET    /donors                - Get all donors
POST   /donors                - Register as donor
GET    /donors/:id            - Get donor by ID
PUT    /donors/:id            - Update donor profile
DELETE /donors/:id            - Delete donor profile
GET    /donors/search         - Search donors by blood type
POST   /requests              - Create blood request
GET    /requests              - Get all requests
GET    /requests/:id          - Get request by ID
PUT    /requests/:id          - Update request
DELETE /requests/:id          - Delete request
POST   /requests/:id/respond  - Respond to request
```

### Lost & Found (`/api/lost-found`)

```
GET    /                      - Get all items
POST   /                      - Create lost/found post
GET    /:id                   - Get item by ID
PUT    /:id                   - Update item
DELETE /:id                   - Delete item
POST   /:id/claim             - Claim item
GET    /search                - Search items
```

### Elections (`/api/elections`)

```
GET    /                      - Get all elections
POST   /                      - Create election (admin)
GET    /:id                   - Get election by ID
PUT    /:id                   - Update election
DELETE /:id                   - Delete election
POST   /:id/vote              - Cast vote
GET    /:id/results           - Get results
GET    /:id/candidates        - Get candidates
POST   /:id/candidates        - Add candidate
```

### Election Requests (`/api/election-requests`)

```
GET    /                      - Get all requests (admin)
POST   /                      - Create election request
GET    /:id                   - Get request by ID
PUT    /:id/approve           - Approve request (admin)
PUT    /:id/reject            - Reject request (admin)
```

### Books (`/api/book-requests`)

```
GET    /                      - Get all book requests
POST   /                      - Create book request
GET    /:id                   - Get request by ID
PUT    /:id                   - Update request
DELETE /:id                   - Delete request
POST   /:id/respond           - Respond to request
```

### Messages/Chat (`/api/chat`)

```
GET    /conversations         - Get user conversations
GET    /messages/:userId      - Get messages with user
POST   /messages              - Send message
DELETE /messages/:id          - Delete message
PUT    /messages/:id/read     - Mark as read
GET    /unread-count          - Get unread count
```

### Notifications (`/api/notifications`)

```
GET    /                      - Get user notifications
POST   /                      - Create notification
PUT    /:id/read              - Mark as read
PUT    /read-all              - Mark all as read
DELETE /:id                   - Delete notification
GET    /unread-count          - Get unread count
```

### Favorites (`/api/favorites`)

```
POST   /                      - Add to favorites
DELETE /:id                   - Remove from favorites
GET    /                      - Get user favorites
```

### Reports (`/api/reports`)

```
POST   /                      - Create report
GET    /                      - Get all reports (admin)
GET    /:id                   - Get report by ID
PUT    /:id/resolve           - Resolve report (admin)
DELETE /:id                   - Delete report
```

### Reminders (`/api/reminders`)

```
GET    /                      - Get user reminders
POST   /                      - Create reminder
PUT    /:id                   - Update reminder
DELETE /:id                   - Delete reminder
```

### Holidays (`/api/holidays`)

```
GET    /                      - Get all holidays
POST   /                      - Create holiday (admin)
PUT    /:id                   - Update holiday (admin)
DELETE /:id                   - Delete holiday (admin)
```

### Bus Schedule (`/api/bus-schedule`)

```
GET    /                      - Get bus schedules
POST   /                      - Create schedule (admin)
PUT    /:id                   - Update schedule (admin)
DELETE /:id                   - Delete schedule (admin)
```

### Contact (`/api/contact`)

```
POST   /                      - Submit contact form
GET    /                      - Get all submissions (admin)
```

### Admin (`/api/admin`)

```
GET    /dashboard             - Get dashboard stats
GET    /users                 - Get all users
PUT    /users/:id/approve     - Approve user
PUT    /users/:id/ban         - Ban user
PUT    /users/:id/unban       - Unban user
GET    /reports               - Get all reports
GET    /analytics             - Get analytics data
POST   /broadcast             - Send broadcast notification
```

### Comments (`/api/comments`)

```
POST   /                      - Create comment
GET    /post/:postId          - Get post comments
PUT    /:id                   - Update comment
DELETE /:id                   - Delete comment
POST   /:id/like              - Like comment
```

### Saved Posts (`/api/saved-posts`)

```
GET    /                      - Get saved posts
POST   /                      - Save post
DELETE /:id                   - Unsave post
```

---

## 8. Authentication & Authorization

### Authentication Flow

#### Registration Process

1. User submits registration form with:
   - Name, email, password
   - Role (student/teacher/other)
   - Department, registration number (for students)
2. System generates OTP and sends to email
3. User verifies OTP
4. Account created but requires admin approval
5. Admin reviews and approves/rejects
6. User can login after approval

#### Login Process

1. User submits email and password
2. System validates credentials
3. Generates JWT access token (15 min expiry)
4. Generates JWT refresh token (7 days expiry)
5. Tokens sent via HTTP-only cookies
6. User authenticated

#### Token Management

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Token Refresh**: Automatic refresh before expiry
- **Secure Storage**: HTTP-only cookies prevent XSS attacks

### Authorization Levels

#### Public Routes (No Auth Required)

- Home page
- View events, jobs, housing (read-only)
- View study groups
- Login/Register pages
- Static pages (About, FAQ, etc.)

#### Protected Routes (Auth Required)

- Create/Edit/Delete own content
- Messaging
- Notifications
- Profile management
- RSVP to events
- Apply for jobs
- Join study groups
- Save posts

#### Admin Routes (Admin Role Required)

- User management (approve, ban)
- Content moderation
- Reports management
- System settings
- Analytics dashboard
- Election management
- Holiday/Bus schedule management

#### System Admin Routes (Super Admin)

- Create other admins
- System-level configurations
- Cannot be modified by regular admins

### Middleware Stack

#### auth.js

```javascript
// Verifies JWT token
// Attaches user to req.user
// Checks if user is approved and not banned
```

#### roleMiddleware.js

```javascript
// Checks user role
// Allows: admin, teacher, student, etc.
```

#### adminOrOwner.js

```javascript
// Allows action if user is admin OR content owner
// Used for edit/delete operations
```

### Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Secrets**: Separate secrets for access and refresh tokens
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Sanitize all inputs
- **XSS Protection**: HTTP-only cookies
- **CSRF Protection**: Token-based validation

---

## 9. Real-time Features

### Socket.IO Implementation

#### Connection Management

```javascript
// Client connects with userId
socket.emit("userOnline", userId);

// Server tracks online users
onlineUsers.set(userId, socketId);

// Broadcast online status
io.emit("userStatusChange", { userId, online: true });
```

#### Real-time Messaging

```javascript
// Send message
socket.emit("sendMessage", {
  chatId,
  senderId,
  receiverId,
  message,
  messageType,
  attachments,
});

// Receive message
socket.on("receiveMessage", (message) => {
  // Update UI
});

// Typing indicator
socket.emit("typing", { chatId, userId, isTyping: true });
socket.on("userTyping", ({ userId, isTyping }) => {
  // Show typing indicator
});

// Read receipts
socket.emit("markAsRead", { chatId, userId });
socket.on("messagesRead", ({ chatId, userId }) => {
  // Update message status
});
```

#### Notifications

```javascript
// New notification
socket.on("newNotification", (notification) => {
  // Show notification
  // Update notification count
});

// Message notification (when not in chat)
socket.on("newMessageNotification", ({ chatId, senderId, message }) => {
  // Show notification
  // Update unread count
});
```

#### Event Updates

```javascript
// Join events room
socket.emit("joinEvents");

// Receive event updates
socket.on("eventUpdate", ({ type, data }) => {
  // type: 'created', 'updated', 'deleted'
  // Update events list
});
```

#### Online Status

```javascript
// Get online users
socket.on("onlineUsers", (userIds) => {
  // Update UI with online status
});

// User status change
socket.on("userStatusChange", ({ userId, online }) => {
  // Update specific user status
});
```

#### Room Management

```javascript
// Join chat room
socket.emit("joinRoom", chatId);

// Leave room
socket.leave(chatId);

// Messages only sent to users in room
io.to(chatId).emit("receiveMessage", message);
```

### Real-time Features List

1. **Instant Messaging**: One-on-one chat
2. **Online Status**: See who's online
3. **Typing Indicators**: Real-time typing status
4. **Read Receipts**: Message read status
5. **Notifications**: Instant notifications
6. **Event Updates**: Live event changes
7. **Unread Counts**: Real-time badge updates
8. **User Presence**: Last active tracking

---

## 10. Frontend Components

### Core Components (40+ Total)

#### Layout Components

- **Navbar**: Main navigation with user menu, notifications, messages
- **Footer**: Site footer with links
- **ScrollToTop**: Auto-scroll on route change
- **PageTitle**: Dynamic page titles

#### Authentication

- **ProtectedRoute**: Route guard for authenticated users
- **Login/Register**: Authentication forms

#### Post Components

- **PostCard**: Display post with interactions
- **CreatePost**: Create new post form
- **PostForm**: Reusable post form
- **PostDetail**: Full post view with comments
- **CommentsSection**: Comments display and creation

#### Card Components

- **BuySellCard**: Buy/sell listing card
- **HousingCard**: Housing post card
- **EventCard**: Event display card
- **JobCard**: Job listing card
- **LostFoundCard**: Lost/found item card
- **DonorCard**: Blood donor card
- **BookRequestCard**: Book request card
- **PollCard**: Poll display card
- **RequestCard**: Generic request card

#### Interaction Components

- **FavoriteButton**: Add to favorites
- **SaveButton**: Save post
- **ShareButton**: Share content
- **MessageButton**: Send message
- **RSVPButton**: RSVP to events
- **ReportButton**: Report content
- **DeleteButton**: Delete content

#### UI Components

- **SearchBar**: Global search
- **SearchFilter**: Advanced filters
- **FilterBar**: Content filtering
- **ImageGallery**: Image carousel
- **ImageLightbox**: Full-screen image viewer
- **ImageGalleryViewer**: Gallery with navigation
- **SkeletonLoader**: Loading placeholders
- **Toast**: Notification toasts
- **UnreadBadge**: Unread count badge
- **UserAvatar**: User profile picture

#### Feature Components

- **NotificationCenter**: Notifications dropdown
- **ActivityFeed**: User activity timeline
- **TrendingSection**: Trending content
- **PosterInfo**: Post author info
- **EventMap**: Leaflet map integration
- **CalendarPopup**: Event calendar picker
- **ReportModal**: Report content modal
- **CreateEventModal**: Quick event creation

### Page Components (70+ Total)

#### Main Pages

- Home, Newsfeed, Dashboard
- About, Features, FAQ, Help Center
- Contact, Privacy Policy, Terms of Service

#### User Pages

- Login, Register
- UserProfile, EditProfile
- Notifications, Messages, Chat
- SavedPosts, Calendar

#### Marketplace Pages

- BuySell, CreateBuySellPost, EditBuySellPost, BuySellDetails
- Housing, CreateHousingPost, EditHousingPost, HousingDetails
- Jobs, CreateJob, EditJob, JobDetails

#### Event Pages

- Events, CreateEvent, EditEvent

#### Academic Pages

- StudyGroups, CreateStudyGroup, StudyGroupDetails
- Books, CreateBookRequest, BookRequestDetails

#### Food Pages

- FoodMenu, CreateFoodMenu, FoodMenuDetails
- QuickMenuPost
- Restaurants, CreateRestaurant, RestaurantDetails
- MyRestaurants, MyRestaurant, AddMenuItem

#### Services Pages

- BloodDonation, RegisterDonor, CreateBloodRequest, BloodRequestDetails, EditDonorProfile
- LostFound, CreateLostFound, EditLostFound, LostFoundDetails
- HolidayCalendar, BusSchedule

#### Election Pages

- Elections, ElectionDetails, ElectionResults
- RequestElection

#### Admin Pages

- AdminPanel, AdminDashboard
- ContentManager, ReportsManager
- CreateElection, ElectionRequests

### Context Providers

#### AuthContext

```javascript
// Provides:
- user: Current user object
- login(email, password)
- logout()
- register(userData)
- updateUser(userData)
- isAuthenticated: Boolean
- loading: Boolean
```

#### SocketContext

```javascript
// Provides:
- socket: Socket.IO instance
- onlineUsers: Array of online user IDs
- sendMessage(data)
- joinRoom(chatId)
- leaveRoom(chatId)
- connected: Boolean
```

### Custom Hooks

- useAuth: Access authentication context
- useSocket: Access socket context
- useDebounce: Debounce values
- useInfiniteScroll: Infinite scrolling
- useLocalStorage: Persist to localStorage

---

## 11. Deployment

### Architecture Overview

```
Frontend (Vercel) ←→ Backend (Render) ←→ MongoDB Atlas
                           ↓
                      Cloudinary
```

### Frontend Deployment (Vercel)

#### Configuration

- **Platform**: Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Node Version**: 18.x or higher

#### Environment Variables (Vercel)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

#### Deployment Steps

1. Connect GitHub repository to Vercel
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push to main branch

#### vercel.json Configuration

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Backend Deployment (Render)

#### Configuration

- **Platform**: Render
- **Type**: Web Service
- **Region**: Oregon (or closest to users)
- **Plan**: Free tier (can upgrade)
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

#### Environment Variables (Render)

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
JWT_REFRESH_SECRET=your-secret-key
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_EXPIRES=7d
JWT_ACCESS_EXPIRES=15m
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-app.vercel.app
BREVO_SMTP_USER=your-email
BREVO_SMTP_KEY=your-smtp-key
EMAIL_FROM=noreply@sustconnect.com
```

#### render.yaml Configuration

```yaml
services:
  - type: web
    name: sust-connect-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
```

### Database (MongoDB Atlas)

#### Setup

1. Create MongoDB Atlas account
2. Create cluster (Free tier M0)
3. Configure network access (Allow from anywhere: 0.0.0.0/0)
4. Create database user
5. Get connection string
6. Add to backend environment variables

#### Database Name

```
mycampus
```

#### Collections (Auto-created)

- users, posts, events, messages
- buysellposts, housingposts, jobs
- studygroups, restaurants, menuitems
- blooddonors, bloodrequests
- lostfounds, elections, candidates
- notifications, reports, etc.

### Image Storage (Cloudinary)

#### Setup

1. Create Cloudinary account
2. Get cloud name, API key, API secret
3. Configure upload presets
4. Add credentials to backend environment

#### Configuration

- **Folder Structure**: Organized by content type
- **Transformations**: Auto-optimize images
- **Max File Size**: 10MB
- **Allowed Formats**: jpg, png, gif, webp

### CORS Configuration

#### Backend CORS Setup

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "https://sust-connect-silk.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};
```

### Socket.IO Configuration

#### Backend Socket Setup

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "https://sust-connect-silk.vercel.app"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});
```

### Deployment Checklist

#### Pre-deployment

- [ ] Test all features locally
- [ ] Check environment variables
- [ ] Update CORS origins
- [ ] Test database connection
- [ ] Verify Cloudinary setup
- [ ] Test email service

#### Frontend Deployment

- [ ] Build succeeds locally
- [ ] Environment variables set in Vercel
- [ ] API URL points to production backend
- [ ] Deploy to Vercel
- [ ] Test production build

#### Backend Deployment

- [ ] All dependencies in package.json
- [ ] Environment variables set in Render
- [ ] Database connection works
- [ ] Deploy to Render
- [ ] Check logs for errors

#### Post-deployment

- [ ] Test authentication flow
- [ ] Test real-time features (chat, notifications)
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

### Monitoring & Maintenance

#### Logs

- **Render**: View logs in dashboard
- **Vercel**: View deployment logs
- **MongoDB**: Monitor database performance

#### Performance

- **Frontend**: Lighthouse scores
- **Backend**: Response times
- **Database**: Query performance

#### Backups

- **Database**: MongoDB Atlas automatic backups
- **Code**: Git version control
- **Images**: Cloudinary storage

---

## 12. Environment Variables

### Backend Environment Variables

#### Required Variables

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mycampus

# JWT Authentication
JWT_REFRESH_SECRET=your-long-random-secret-key-for-refresh-tokens
JWT_ACCESS_SECRET=your-long-random-secret-key-for-access-tokens
JWT_REFRESH_EXPIRES=7d
JWT_ACCESS_EXPIRES=15m

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Email Service (Brevo/Sendinblue)
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=your-smtp-api-key
EMAIL_FROM=noreply@sustconnect.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Optional Variables

```env
# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret

# Admin
SYSTEM_ADMIN_EMAIL=admin@sust.edu
SYSTEM_ADMIN_PASSWORD=secure-password
```

### Frontend Environment Variables

```env
# API URL
VITE_API_URL=http://localhost:5001/api

# For production
# VITE_API_URL=https://your-backend-url.onrender.com/api

# Optional: Analytics, etc.
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### Security Best Practices

#### JWT Secrets

- Use long, random strings (64+ characters)
- Different secrets for access and refresh tokens
- Never commit to version control
- Rotate periodically

#### Database

- Use strong passwords
- Restrict network access
- Enable authentication
- Regular backups

#### API Keys

- Keep private
- Use environment variables
- Rotate if compromised
- Monitor usage

---

## 13. Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Git

### Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd sust-connect
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:5001`

#### 3. Frontend Setup

```bash
# Navigate to frontend (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 4. Database Setup

##### Option A: MongoDB Atlas (Recommended)

1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string
6. Add to backend .env

##### Option B: Local MongoDB

```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use local connection string
MONGO_URI=mongodb://localhost:27017/mycampus
```

#### 5. Cloudinary Setup

1. Create account at cloudinary.com
2. Get cloud name, API key, API secret from dashboard
3. Add to backend .env

#### 6. Email Service Setup (Optional)

1. Create Brevo account (formerly Sendinblue)
2. Get SMTP credentials
3. Add to backend .env

OR use Gmail:

1. Enable 2FA on Gmail
2. Generate app password
3. Use in EMAIL_USER and EMAIL_PASS

#### 7. Create System Admin

```bash
cd backend
npm run create-system-admin
```

### Verification

#### Test Backend

```bash
curl http://localhost:5001/api/health
# Should return: {"message":"Backend running","timestamp":"..."}
```

#### Test Frontend

Open browser to `http://localhost:5173`

#### Test Database Connection

Check backend console for:

```
MongoDB connected successfully
```

#### Test Socket.IO

Open browser console, should see:

```
Socket connected
```

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env
```

#### MongoDB Connection Failed

- Check MONGO_URI format
- Verify network access in Atlas
- Check database user credentials

#### CORS Errors

- Verify CLIENT_URL in backend .env
- Check VITE_API_URL in frontend .env
- Ensure both servers are running

#### Socket.IO Not Connecting

- Check VITE_API_URL (without /api)
- Verify CORS configuration
- Check browser console for errors

---

## 14. Development Workflow

### Git Workflow

#### Branch Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/* (new features)
bugfix/* (bug fixes)
hotfix/* (urgent fixes)
```

#### Commit Convention

```
feat: Add blood donation feature
fix: Resolve chat message duplication
docs: Update API documentation
style: Format code with prettier
refactor: Optimize event query performance
test: Add unit tests for auth
chore: Update dependencies
```

### Development Process

#### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

#### 2. Code Review

- Review code changes
- Check for bugs and security issues
- Verify tests pass
- Ensure documentation updated

#### 3. Testing

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

#### 4. Deployment

```bash
# Merge to develop
git checkout develop
git merge feature/new-feature

# Test on staging

# Merge to main
git checkout main
git merge develop

# Auto-deploy via Vercel/Render
```

### Code Standards

#### JavaScript/React

- Use ES6+ syntax
- Functional components with hooks
- PropTypes for type checking
- Consistent naming conventions
- Comments for complex logic

#### File Naming

- Components: PascalCase (UserProfile.jsx)
- Utilities: camelCase (formatDate.js)
- Constants: UPPER_SNAKE_CASE
- CSS: kebab-case (user-profile.css)

#### Code Organization

```javascript
// 1. Imports
import React, { useState, useEffect } from "react";
import axios from "axios";

// 2. Constants
const API_URL = "/api/users";

// 3. Component
function UserProfile() {
  // 3a. State
  const [user, setUser] = useState(null);

  // 3b. Effects
  useEffect(() => {
    fetchUser();
  }, []);

  // 3c. Functions
  const fetchUser = async () => {
    // Implementation
  };

  // 3d. Render
  return <div>{/* JSX */}</div>;
}

// 4. Export
export default UserProfile;
```

### Testing Strategy

#### Unit Tests

- Test individual functions
- Mock external dependencies
- Cover edge cases

#### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication flow

#### E2E Tests

- Test user workflows
- Test critical paths
- Test across browsers

### Performance Optimization

#### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Minimize bundle size

#### Backend

- Database indexing
- Query optimization
- Caching (node-cache)
- Connection pooling
- Rate limiting

#### Database

- Proper indexing
- Efficient queries
- Aggregation pipelines
- Regular maintenance

### Debugging

#### Frontend Debugging

```javascript
// React DevTools
// Console logging
console.log("User data:", user);

// Network tab
// Check API requests/responses

// Redux DevTools (if using Redux)
```

#### Backend Debugging

```javascript
// Console logging
console.log('Request body:', req.body);

// Debug mode
DEBUG=* npm run dev

// Postman/Insomnia
// Test API endpoints

// MongoDB Compass
// Inspect database
```

### Documentation

#### Code Comments

```javascript
/**
 * Fetches user profile by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User object
 */
async function getUserProfile(userId) {
  // Implementation
}
```

#### API Documentation

- Document all endpoints
- Include request/response examples
- List required parameters
- Describe error responses

#### README Files

- Project overview
- Setup instructions
- Usage examples
- Contributing guidelines

---

## 15. Security Features

### Authentication Security

#### Password Security

- **Hashing**: Bcrypt with salt rounds (10)
- **Minimum Length**: 8 characters
- **Complexity**: Require uppercase, lowercase, numbers
- **Reset**: Secure password reset flow with tokens

#### JWT Security

- **Short-lived Access Tokens**: 15 minutes
- **Refresh Tokens**: 7 days, stored securely
- **HTTP-only Cookies**: Prevent XSS attacks
- **Secure Flag**: HTTPS only in production
- **Token Rotation**: New tokens on refresh

#### Session Management

- **Automatic Logout**: On token expiry
- **Concurrent Sessions**: Allowed but tracked
- **Last Active**: Track user activity
- **Force Logout**: Admin can force logout

### Authorization Security

#### Role-Based Access Control (RBAC)

```javascript
// Middleware checks
- isAuthenticated: Verify user logged in
- isAdmin: Verify admin role
- isOwner: Verify content ownership
- isApproved: Verify account approved
```

#### Resource Protection

- Users can only edit/delete own content
- Admins can moderate all content
- System admins have full access
- Banned users cannot access platform

### Input Validation

#### Backend Validation

```javascript
// Sanitize inputs
- Trim whitespace
- Escape HTML
- Validate email format
- Validate phone numbers
- Check file types
- Limit file sizes
```

#### Frontend Validation

```javascript
// Client-side checks
- Required fields
- Format validation
- Length limits
- Type checking
- Real-time feedback
```

### API Security

#### Rate Limiting

```javascript
// Prevent abuse
- 100 requests per 15 minutes per IP
- Stricter limits for auth endpoints
- Exponential backoff on failures
```

#### CORS Configuration

```javascript
// Restrict origins
- Whitelist specific domains
- Credentials required
- Specific methods allowed
- Headers validated
```

#### Request Validation

```javascript
// Validate all requests
- Check content-type
- Verify request size
- Validate JSON structure
- Check required fields
```

### Data Security

#### Database Security

- **Authentication**: Required for all connections
- **Encryption**: Data encrypted at rest (MongoDB Atlas)
- **Network**: IP whitelist or VPC
- **Backups**: Automatic daily backups
- **Access Control**: Principle of least privilege

#### Sensitive Data

```javascript
// Never store in plain text
- Passwords: Bcrypt hashed
- Tokens: Encrypted or hashed
- API Keys: Environment variables
- Personal Info: Encrypted if needed
```

#### Data Sanitization

```javascript
// Before saving to database
- Remove script tags
- Escape special characters
- Validate data types
- Check for SQL injection patterns
```

### File Upload Security

#### Validation

```javascript
// Check uploads
- File type whitelist (images only)
- File size limit (10MB)
- Scan for malware
- Validate image format
- Strip EXIF data
```

#### Storage

```javascript
// Cloudinary security
- Signed uploads
- Transformation limits
- Access control
- CDN protection
```

### XSS Prevention

#### Output Encoding

```javascript
// React automatically escapes
- Use dangerouslySetInnerHTML carefully
- Sanitize user-generated content
- Validate URLs
- Escape HTML entities
```

#### Content Security Policy

```javascript
// HTTP headers
- Restrict script sources
- Prevent inline scripts
- Control resource loading
```

### CSRF Prevention

#### Token-Based

```javascript
// CSRF tokens
- Generate unique tokens
- Validate on state-changing requests
- Short expiry time
```

#### SameSite Cookies

```javascript
// Cookie configuration
sameSite: "strict";
secure: true(production);
httpOnly: true;
```

### SQL/NoSQL Injection Prevention

#### Parameterized Queries

```javascript
// Mongoose automatically escapes
- Use schema validation
- Avoid string concatenation
- Validate input types
```

#### Input Sanitization

```javascript
// Clean inputs
- Remove special characters
- Validate against schema
- Use allowlists, not denylists
```

### Error Handling

#### Secure Error Messages

```javascript
// Don't expose internals
// Development
res.status(500).json({ error: error.stack });

// Production
res.status(500).json({ error: "Internal server error" });
```

#### Logging

```javascript
// Log security events
- Failed login attempts
- Unauthorized access attempts
- Suspicious activity
- Error details (server-side only)
```

### Monitoring & Alerts

#### Security Monitoring

- Failed authentication attempts
- Unusual activity patterns
- API abuse
- Database access patterns

#### Incident Response

- Automated alerts
- Log analysis
- Quick response procedures
- User notification system

### Compliance

#### Data Privacy

- **GDPR Compliance**: User data rights
- **Data Minimization**: Collect only necessary data
- **Right to Delete**: Users can delete accounts
- **Data Export**: Users can export their data

#### Terms & Policies

- Privacy Policy
- Terms of Service
- Cookie Policy
- Acceptable Use Policy

### Security Checklist

#### Development

- [ ] All inputs validated
- [ ] Passwords hashed
- [ ] JWT properly configured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error handling secure
- [ ] Dependencies updated

#### Deployment

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database access restricted
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Security headers set
- [ ] Logs properly configured

#### Maintenance

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log monitoring
- [ ] Incident response plan
- [ ] User education
- [ ] Penetration testing
- [ ] Vulnerability scanning

---

## Appendix

### A. Useful Commands

#### Backend

```bash
# Development
npm run dev

# Production
npm start

# Create system admin
npm run create-system-admin

# Seed events
npm run seed:events
```

#### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

#### Database

```bash
# MongoDB shell
mongosh "mongodb+srv://..."

# Backup
mongodump --uri="mongodb+srv://..."

# Restore
mongorestore --uri="mongodb+srv://..." dump/
```

### B. API Response Formats

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

#### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### C. Database Indexes

```javascript
// User indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ registrationNumber: 1 });
userSchema.index({ role: 1 });

// Post indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ engagementScore: -1 });

// Event indexes
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ user: 1 });

// Message indexes
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });
```

### D. Common Queries

#### Get User Feed

```javascript
// Posts from followed users + own posts
const feed = await Post.find({
  $or: [{ author: { $in: user.following } }, { author: user._id }],
})
  .sort({ createdAt: -1 })
  .limit(20)
  .populate("author", "name profilePicture");
```

#### Search Posts

```javascript
const results = await Post.find({
  $or: [
    { "content.text": { $regex: query, $options: "i" } },
    { tags: { $in: [query] } },
  ],
});
```

#### Get Unread Messages

```javascript
const unread = await Message.countDocuments({
  receiverId: userId,
  read: false,
});
```

### E. Troubleshooting

#### Issue: Cannot connect to MongoDB

**Solution**: Check MONGO_URI, network access, and credentials

#### Issue: CORS errors

**Solution**: Verify CLIENT_URL and FRONTEND_URL in backend .env

#### Issue: Images not uploading

**Solution**: Check Cloudinary credentials and file size limits

#### Issue: Socket.IO not connecting

**Solution**: Verify CORS configuration and API URL

#### Issue: JWT token expired

**Solution**: Implement automatic token refresh

#### Issue: Slow queries

**Solution**: Add database indexes and optimize queries

### F. Resources

#### Documentation

- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [MongoDB](https://docs.mongodb.com/)
- [Socket.IO](https://socket.io/docs/)
- [Mongoose](https://mongoosejs.com/)

#### Tools

- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging

#### Learning

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Patterns](https://reactpatterns.com/)
- [MongoDB University](https://university.mongodb.com/)

---

## Conclusion

SUST Connect is a comprehensive campus management and social networking platform built with modern web technologies. This documentation covers all aspects of the project from architecture to deployment.

### Key Highlights

- **35+ Database Models**: Comprehensive data structure
- **30+ API Route Files**: RESTful API design
- **70+ Frontend Pages**: Complete user interface
- **40+ Reusable Components**: Modular architecture
- **Real-time Features**: Socket.IO integration
- **Secure Authentication**: JWT-based auth system
- **Role-Based Access**: Multi-level authorization
- **Cloud Deployment**: Scalable infrastructure

### Future Enhancements

- Mobile app (React Native)
- Push notifications
- Advanced analytics
- AI-powered recommendations
- Video calling
- Payment integration
- Multi-language support
- Progressive Web App (PWA)

### Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained By**: SUST Connect Development Team
