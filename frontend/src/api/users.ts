import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  description?: string;
  role: 'admin' | 'member';
}

export interface ScoreTrend {
  date: string;
  average: number;
  highest: number;
}

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.patch('/profile', data);
    return response.data;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { current_password: oldPassword, new_password: newPassword });
  },
  getScoreTrend: async (): Promise<ScoreTrend[]> => {
    const response = await apiClient.get('/scores/me/trend');
    return response.data;
  },
  getAllAttendance: async (): Promise<any[]> => {
    const response = await apiClient.get('/attendance/me');
    return response.data;
  },
  getUsers: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  getUser: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  }
};
