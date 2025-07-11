export interface User {
  id: string;
  fullName: string;
  email: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  liveLink: string;
  githubLink: string;
  technologies: string[];
  submittedAt: string;
  author?: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'participant' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface UserProfile {
  user: User;
  stats: {
    totalProjects: number;
    streakData: { [key: string]: number };
    points: number;
  };
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSubmissionDate: string | null;
  firstSubmissionDate: string | null;
  hasReachedThirtyProjects: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  projectCount: number;
  streakCount: number;
  hasReachedThirtyProjects: boolean;
  points: number;
  joinedAt: string;
} 