import { api } from './api';

export type DashboardStats = {
  totalReaders: number;
  totalBooks: number;
  totalCopies: number;
  borrowsThisMonth: number;
  violations: number;
  pendingViolations: number;
  onTimeReturns: number;
  lateReturns: number;
  onTimePercent: number;
};

export const statsApi = {
  dashboard: () => api<DashboardStats>('/api/stats/dashboard', { method: 'GET' }),
};