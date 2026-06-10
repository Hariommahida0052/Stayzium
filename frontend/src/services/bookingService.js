import axios from 'axios';

const bookingService = {
  createBooking: (data) => axios.post('/bookings', data),
  getBookingById: (id) => axios.get(`/bookings/${id}`),
  getMyBookings: () => axios.get('/bookings/my-bookings'),
  getOwnerBookings: () => axios.get('/bookings/owner-bookings'),
  getAllBookings: (params) => axios.get('/bookings/admin', { params }),
  cancelBooking: (id) => axios.put(`/bookings/${id}/cancel`),
  updateBookingStatus: (id, status) => axios.put(`/bookings/${id}/status`, { status }),
  updateRefundStatus: (id, refundStatus, refundAmount) => axios.put(`/bookings/admin/${id}/refund`, { refundStatus, refundAmount }),
};

export default bookingService;
