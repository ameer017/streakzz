# Streakzz 🔥

A fullstack web application that allows users to track their project submissions with a visual streak system similar to GitHub's contribution graph.

## Features

- **User Authentication**: Sign up with full name, email, and password; login with email and password
- **Project Submission**: Submit projects with name, description, live link, and GitHub link
- **Visual Streak Tracking**: GitHub-like contribution graph showing daily project submissions
- **Dashboard**: Personal dashboard with project statistics and streak visualization
- **Responsive Design**: Modern UI built with TailwindCSS

## Tech Stack

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- React Hook Form with Zod validation
- Axios for API requests
- Lucide React for icons

## Project Structure

```
streakzz/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Project.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   └── users.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProjectSubmissionForm.tsx
│   │   │   └── StreakGraph.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd streakzz
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

4. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

5. **Environment Configuration**

   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/streakzz
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

### Running the Application

1. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

2. **Development Mode** (runs both frontend and backend)

   ```bash
   npm run dev
   ```

   Or run them separately:

   **Backend only:**

   ```bash
   npm run dev:backend
   ```

   **Frontend only:**

   ```bash
   npm run dev:frontend
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Building for Production

1. **Build both applications**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects

- `POST /api/projects` - Submit a new project (authenticated)
- `GET /api/projects/my-projects` - Get user's projects (authenticated)
- `GET /api/projects/all` - Get all projects (public)

### Users

- `GET /api/users/profile` - Get current user profile with streak data (authenticated)
- `GET /api/users/:userId` - Get public user profile (public)

## Database Schema

### User Model

```typescript
{
  fullName: string;
  email: string; // unique
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### Project Model

```typescript
{
  userId: ObjectId; // reference to User
  name: string;
  description: string;
  liveLink: string;
  githubLink: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Features in Detail

### Streak Visualization

- Shows a year-long contribution graph
- Each day is represented by a colored square
- Color intensity indicates the number of projects submitted that day
- Hover effects show exact dates and project counts

### Project Submission

- Form validation with Zod schemas
- URL validation for live and GitHub links
- Real-time form error handling
- Success feedback and automatic dashboard refresh

### Authentication Flow

- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes on both frontend and backend
- Automatic token refresh and management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
