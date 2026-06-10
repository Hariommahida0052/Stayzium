# Stayzium

Stayzium is a complete Hotel Booking web application, featuring a modern React frontend and a robust Node.js/Express backend with MongoDB.

## Features

- **Frontend**: Built with React, TailwindCSS, Material-UI, and Framer Motion for smooth animations and beautiful UI.
- **Backend**: Powered by Node.js, Express, and MongoDB (Mongoose).
- **Authentication**: Secure JWT-based authentication system.
- **Payments**: Integrated with Razorpay for handling bookings.
- **Media Storage**: Cloudinary integration for managing and uploading images.
- **Real-time capabilities**: Socket.io integrated for real-time features.
- **Notifications**: Automated email notifications via Nodemailer.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Hariommahida0052/Stayzium.git
cd Stayzium
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure the necessary environment variables:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Start the backend server:

```bash
# Production mode
npm start

# Development mode
npm run dev
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory if required (e.g., `REACT_APP_API_URL` for backend API endpoints).

Start the React development server:

```bash
npm start
```

## Technologies Used

- **MERN Stack**: MongoDB, Express.js, React, Node.js
- **Styling**: Tailwind CSS, Material UI, Emotion
- **Payment Gateway**: Razorpay
- **Image Storage**: Cloudinary
- **Real-time Communication**: Socket.io
- **Charts & Data**: Recharts

## License

This project is licensed under the ISC License.
