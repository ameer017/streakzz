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
  };
} 