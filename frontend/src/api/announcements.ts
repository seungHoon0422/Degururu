import { apiClient } from './client';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

export const announcementsApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get('/announcements');
    return response.data;
  },
  getAnnouncement: async (id: string): Promise<Announcement> => {
    const response = await apiClient.get(`/announcements/${id}`);
    return response.data;
  },
  createAnnouncement: async (data: any): Promise<Announcement> => {
    const response = await apiClient.post('/announcements', data);
    return response.data;
  },
  updateAnnouncement: async (id: string, data: any): Promise<Announcement> => {
    const response = await apiClient.patch(`/announcements/${id}`, data);
    return response.data;
  },
  deleteAnnouncement: async (id: string): Promise<void> => {
    await apiClient.delete(`/announcements/${id}`);
  }
};
