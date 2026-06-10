import axios from 'axios';

const reportService = {
  getAdminReports: (params) => axios.get('/reports/admin', { params }),
  updateReportStatus: (id, status, adminNotes) => axios.put(`/reports/admin/${id}/status`, { status, adminNotes }),
};

export default reportService;
