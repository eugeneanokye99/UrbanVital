import API from './api';

export interface Notification {
  id: number;
  user: string | null;
  action: string;
  message: string;
  created_at: string;
  is_read: boolean;
  extra?: any;
}

export const fetchNotifications = async () => {
  const response = await API.get('/notifications/');
  return response.data as Notification[];
};

export const markNotificationRead = async (id: number) => {
  await API.post(`/notifications/${id}/read/`);
};
