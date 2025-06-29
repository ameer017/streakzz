import axios from 'axios';
import type { AuthResponse, Project, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL

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
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/auth/delete-account');
    return response.data;
  },

};

// Projects API
export const projectsAPI = {
  submit: async (data: { name: string; description: string; liveLink: string; githubLink: string }): Promise<Project> => {
    const response = await api.post('/api/projects/submit-project', data);
    return response.data.project;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/projects/my-projects');
    return response.data.projects;
  },

  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/projects/all');
    return response.data.projects;
  },

  getParticipants: async (): Promise<any[]> => {
    const response = await api.get('/api/projects/admin/participants');
    return response.data.participants;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
};

export default api; 