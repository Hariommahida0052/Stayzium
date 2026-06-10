import axios from 'axios';

const analyticsService = {
  getAdminSummary: () => axios.get('/analytics/admin-summary'),
  getOwnerSummary: () => axios.get('/analytics/owner-summary'),
  getChartData: (timeframe) => axios.get(`/analytics/chart-data?timeframe=${timeframe}`),
  getSystemHealth: () => axios.get('/analytics/system-health'),
  downloadOwnerReport: () => axios.get('/analytics/owner/export', { responseType: 'blob' }),
};

export default analyticsService;
