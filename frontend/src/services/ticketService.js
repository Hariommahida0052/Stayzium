import axios from 'axios';

const ticketService = {
  getAdminTickets: (params) => axios.get('/tickets/admin', { params }),
  updateTicketStatus: (id, status) => axios.put(`/tickets/admin/${id}/status`, { status }),
  addAdminMessage: (id, message) => axios.post(`/tickets/admin/${id}/message`, { message }),
};

export default ticketService;
