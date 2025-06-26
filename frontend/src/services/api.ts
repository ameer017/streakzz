import axios from 'axios';
import type { AuthResponse, Project, UserProfile } from '../types';

const API_BASE_URL = 'http://localhost:1500/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete('/auth/delete-account');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  submit: async (data: { name: string; description: string; liveLink: string; githubLink: string }): Promise<Project> => {
    const response = await api.post('/projects/submit-project', data);
    return response.data.project;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/my-projects');
    return response.data.projects;
  },

  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/all');
    return response.data.projects;
  },

  getParticipants: async (): Promise<any[]> => {
    const response = await api.get('/projects/admin/participants');
    return response.data.participants;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export default api; 