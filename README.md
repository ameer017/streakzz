# Streakzz - Project Streak Tracker

A full-stack application for tracking daily project submissions and building streaks. Built with Node.js, Express, MongoDB, React, and TypeScript.

## Features

### 🏠 Landing Page
- Beautiful landing page with hero section, metrics, and footer
- Gradient backgrounds and modern UI design
- Call-to-action for registration

### 👤 User Authentication & Management
- User registration and login
- Email verification using Nodemailer
- JWT-based authentication
- Delete account functionality
- Admin and participant roles

### 📊 Dashboard & Analytics
- Personal dashboard with project submissions
- 30-day streak visualization with color coding:
  - **Red (1-10 days)**: Early streak
  - **Amber (10-20 days)**: Building momentum  
  - **Green (20-25 days)**: Strong streak
  - **Super Green (25-30 days)**: Outstanding streak
- Daily motivational quotes
- Project statistics and metrics

### 🚀 Project Submission
- Project submission form with validation
- Time restrictions (7 AM - 11:59 PM daily)
- Success/error animations
- Live demo and GitHub repository links
- Scrollable project history

### 👑 Admin Dashboard
- Comprehensive admin panel
- Participant management table
- View all user statistics
- Sortable and searchable participant data
- Real-time metrics

### 📧 Email Features
- Email verification for new accounts
- Daily project submission reminders (9 AM)
- Professional email templates

### 🎨 UI/UX Features
- Responsive design
- Beautiful animations with Framer Motion
- Toast notifications
- Loading states
- Modern glassmorphism design

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **TypeScript** for type safety
- **JWT** for authentication
- **Nodemailer** for emails
- **Node-cron** for scheduled tasks
- **Express-validator** for validation

### Frontend
- **React** with **TypeScript**
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **React Hook Form** for form handling
- **Lucide React** for icons
- **Tailwind CSS** for styling

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Gmail account (for email features)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment variables:**
   Create a `.env` file in the backend folder with:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/streakzz
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Server Port
   PORT=1500
   ```

3. **Gmail App Password Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Use the App Password in the `EMAIL_PASS` field

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Visit `http://localhost:3000` in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `DELETE /api/auth/delete-account` - Delete user account

### Projects
- `POST /api/projects/submit-project` - Submit new project
- `GET /api/projects/my-projects` - Get user's projects
- `GET /api/projects/admin/participants` - Get all participants (Admin)

### Users
- `GET /api/users/profile` - Get user profile with streak data

## Project Structure

```
streakzz/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Project.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   └── users.ts
│   │   └── services/
│   │       ├── emailService.ts
│   │       └── scheduledTasks.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StreakGraph.tsx
│   │   │   ├── MotivationalQuote.tsx
│   │   │   └── ProjectSubmissionForm.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Usage

### For Participants
1. **Register** with email verification
2. **Submit daily projects** between 7 AM - 11:59 PM
3. **Track your streak** with the visual graph
4. **View project history** in the projects tab
5. **Get motivated** with daily quotes

### For Admins
1. **Access admin dashboard** with admin role
2. **Monitor all participants** and their progress
3. **View detailed statistics** and metrics
4. **Search and sort** participant data

## Deployment

### Backend (Vercel)
The backend includes a `vercel.json` configuration for easy deployment to Vercel.

### Frontend (Netlify/Vercel)
The frontend can be deployed to any static hosting service.

## Environment Variables Reference

### Required Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend application URL
- `PORT`: Backend server port

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ by the Streakzz Team**
