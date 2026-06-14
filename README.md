<div align="center">

![Stayzium Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

<br/>

**A full-stack hotel booking web application built with the MERN stack.**  
**Search destinations, book rooms, manage properties, and handle everything from a powerful admin panel.**

![React](https://img.shields.io/badge/REACT-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/NODE.JS-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MONGODB-ATLAS-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TAILWIND-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**[🔗 Live Demo Website](https://stayzium.vercel.app/) | [💻 GitHub Repository](https://github.com/Hariommahida0052/Stayzium)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Author](#-author)

---

## 🏨 Overview

Stayzium is a comprehensive, multi-vendor hotel booking platform. It allows customers to discover hotels, check room availability, apply promotional offers, and make secure online bookings. The platform features three distinct user roles: Customers, Hotel Owners, and Administrators. Hotel owners get a dedicated dashboard to manage their properties and earnings, while admins have full control over the platform's analytics, users, and settings.

Built during an internship at Vihil Infotech Private Limited.

---

## ✨ Features

### 🧑‍💻 Customer Portal
- 🔐 JWT-based authentication with OTP verification
- 🏨 Browse and search hotels by destination or name
- 🛏️ View detailed hotel amenities and room types
- 📅 Book rooms with real-time availability checking
- 💳 Secure online payments via Razorpay (test mode)
- ❤️ Save favorite properties to a Wishlist
- ⭐ Leave reviews and ratings for completed stays
- 📜 View complete booking history and current status
- 👤 Profile management and settings

### 🏢 Hotel Owner Dashboard
- 📈 Dashboard with earnings and booking statistics
- 📝 Create and manage hotel listings (images, amenities, location)
- 🚪 Manage room inventory, pricing, and capacity
- 📋 View and update booking statuses
- 💰 Digital wallet system for tracking earnings
- 💸 Request payouts from the admin
- 🔔 Real-time notifications for new bookings via Socket.io

### 🛡️ Admin Panel
- 📊 Global dashboard with real-time stats (users, bookings, revenue)
- 👥 User management (Customers, Owners, Admins)
- 🏨 Oversee all hotel properties and rooms
- 🎁 Manage promotional offers and discount codes
- 📩 Create and send Newsletter campaigns via Brevo API
- 🎫 Handle customer support tickets
- ⚙️ Global site settings management

### 🔧 Technical
- ✅ Protected routes (frontend + backend role-based access)
- ✅ Cloudinary image optimization and storage
- ✅ Toast notifications for user feedback
- ✅ Fully responsive design across all devices
- ✅ Modern UI with Framer Motion animations
- ✅ Transactional emails for booking confirmations

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Material UI, Framer Motion, React Router |
| **Backend** | Node.js, Express.js, REST API, MVC Architecture |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Images** | Cloudinary, Multer |
| **Payment** | Razorpay (test mode) |
| **Email** | Brevo API |
| **Real-time**| Socket.io |
| **Icons** | Lucide React, React Icons |
| **Notifications** | React Hot Toast |

---

## 📁 Project Structure

```text
stayzium/
├── frontend/                  # React application
│   ├── public/
│   │   ├── images/            # Static assets
│   │   ├── index.html
│   │   └── logo.png
│   └── src/
│       ├── api/               # API connection
│       │   └── axios.js       # Axios instance with interceptors
│       ├── components/        # Reusable UI components
│       │   ├── admin/         # Admin-specific components
│       │   ├── common/        # Shared components (Navbar, Footer, etc.)
│       │   ├── layout/        # Layout wrappers (AdminLayout, OwnerLayout)
│       │   └── owner/         # Owner-specific components (AddPropertyModal)
│       ├── context/           # React Context for global state
│       │   └── AuthContext.jsx
│       ├── pages/             # Page components grouped by role
│       │   ├── admin/         # Admin pages (Dashboard, Users, Hotels, Offers...)
│       │   ├── auth/          # Auth pages (Login, Signup, ResetPassword)
│       │   ├── owner/         # Hotel Owner pages (Dashboard, Rooms, Wallet...)
│       │   ├── public/        # Public pages (Home, Destinations, Contact)
│       │   └── user/          # Customer pages (BookingPage, Wishlist, MyBookings...)
│       ├── utils/             # Helper functions (toastUtils)
│       ├── App.js             # Main router configuration
│       ├── index.css          # Tailwind and global styles
│       └── index.js           # React entry point
│
└── backend/                   # Node.js + Express API
    ├── config/                # Configuration files
    │   ├── cloudinary.js      # Cloudinary setup
    │   ├── db.js              # MongoDB connection
    │   └── razorpay.js        # Razorpay setup
    ├── controllers/           # Route logic (MVC pattern)
    │   ├── analyticsController.js
    │   ├── authController.js
    │   ├── bookingController.js
    │   ├── hotelController.js
    │   ├── newsletterController.js
    │   ├── offerController.js
    │   ├── paymentController.js
    │   ├── roomController.js
    │   └── userController.js
    ├── middleware/            # Custom Express middleware
    │   ├── authMiddleware.js  # JWT validation & role checking
    │   ├── errorMiddleware.js # Global error handler
    │   └── uploadMiddleware.js# Multer setup for file uploads
    ├── models/                # Mongoose database schemas
    │   ├── Booking.js
    │   ├── Hotel.js
    │   ├── Notification.js
    │   ├── Offer.js
    │   ├── Review.js
    │   ├── Room.js
    │   ├── Ticket.js
    │   └── User.js
    ├── routes/                # Express API route definitions
    │   ├── analyticsRoutes.js
    │   ├── authRoutes.js
    │   ├── bookingRoutes.js
    │   ├── hotelRoutes.js
    │   ├── offerRoutes.js
    │   ├── paymentRoutes.js
    │   ├── roomRoutes.js
    │   └── userRoutes.js
    ├── utils/                 # Backend utilities
    │   └── sendEmail.js       # Brevo API email implementation
    ├── .env                   # Environment variables
    └── server.js              # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account (test mode)
- Brevo account (for API key)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Hariommahida0052/Stayzium.git
cd Stayzium
```

**2. Setup Backend**
```bash
cd backend
npm install
```

**3. Setup Frontend**
```bash
cd ../frontend
npm install
```

**4. Add environment variables (see below)**

**5. Run Backend**
```bash
cd backend
npm run dev
```

**6. Run Frontend**
```bash
cd frontend
npm start
```

---

## 🔒 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
BREVO_API_KEY=your_brevo_api_key
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Protected |
| PUT | `/api/auth/profile` | Protected |
| POST | `/api/auth/verify-otp` | Public |

### Hotels & Rooms
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| GET | `/api/hotels` | Public |
| GET | `/api/hotels/:id` | Public |
| POST | `/api/hotels` | Owner |
| PUT | `/api/hotels/:id` | Owner |
| POST | `/api/rooms/hotel/:hotelId` | Owner |

### Bookings
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/api/bookings/create` | Protected |
| GET | `/api/bookings/my-bookings` | Protected |
| GET | `/api/bookings/owner/:hotelId` | Owner |
| PUT | `/api/bookings/:id/status` | Owner/Admin |

### Offers
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| GET | `/api/offers/active` | Public |
| POST | `/api/offers` | Admin |
| DELETE | `/api/offers/:id` | Admin |

### Payment
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/api/payment/create-order` | Protected |
| POST | `/api/payment/verify` | Protected |

---

## 👨‍💻 Author

**Hariom Mahida**  
Full Stack Developer (MERN Stack)  
Intern at Vihil Infotech Private Limited, Gujarat

- 📧 [hetmahida353@gmail.com](mailto:hariommahida.svma@gmail.com)
- 🔗 [LinkedIn Profile](https://www.linkedin.com/in/hariom-mahida-7ba67a382/)
- 🐙 [GitHub Profile](https://github.com/Hariommahida0052)

---

<div align="center">

Made with ❤️ in Gujarat, India <br/>
🌙 **Stayzium** — Book your perfect stay, effortlessly.

</div>
