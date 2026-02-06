import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  member_type?: 'FULL' | 'ASSOCIATE';
  description?: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface ScoreTrend {
  schedule_id: string;
  starts_at: string;
  title: string;
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
  getMeHighScore: async (): Promise<{ high_score: number | null }> => {
    const response = await apiClient.get('/scores/me/high');
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
