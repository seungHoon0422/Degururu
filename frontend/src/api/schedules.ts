import { apiClient } from './client';

export interface Schedule {
  id: string;
  title: string;
  notes?: string;
  location: string;
  starts_at: string;
  is_cancelled: boolean;
}

export interface Attendance {
  id: string;
  schedule_id: string;
  user_id: string;
  status: 'UNKNOWN' | 'ATTEND' | 'ABSENT';
  comment?: string;
}

export const schedulesApi = {
  getSchedules: async (): Promise<Schedule[]> => {
    const response = await apiClient.get('/schedules');
    return response.data;
  },
  getSchedule: async (id: string): Promise<Schedule> => {
    const response = await apiClient.get(`/schedules/${id}`);
    return response.data;
  },
  getScheduleAttendance: async (id: string): Promise<Attendance[]> => {
    const response = await apiClient.get(`/schedules/${id}/attendance`);
    return response.data;
  },
  getScheduleScores: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/schedules/${id}/scores`);
    return response.data;
  },
  updateMyAttendance: async (scheduleId: string, status: string): Promise<Attendance> => {
    const response = await apiClient.put(`/schedules/${scheduleId}/attendance/me`, { status });
    return response.data;
  },
  submitScores: async (scheduleId: string, score: number, game_no: number): Promise<any> => {
    const response = await apiClient.post(`/schedules/${scheduleId}/scores`, { score, game_no });
    return response.data;
  },
  createSchedule: async (data: any): Promise<Schedule> => {
    const response = await apiClient.post('/schedules', data);
    return response.data;
  },
  updateSchedule: async (id: string, data: any): Promise<Schedule> => {
    const response = await apiClient.patch(`/schedules/${id}`, data);
    return response.data;
  },
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },
  updateAttendanceByAdmin: async (scheduleId: string, userId: string, status: string): Promise<Attendance> => {
    const response = await apiClient.put(`/schedules/${scheduleId}/attendance/${userId}`, { status });
    return response.data;
  }
};
