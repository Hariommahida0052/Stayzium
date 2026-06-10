import axios from 'axios';

const hotelService = {
  getAllHotels: (query = '') => axios.get(`/hotels${query ? `?${query}` : ''}`),
  getHotelById: (id) => axios.get(`/hotels/${id}`),
  getOwnerHotels: () => axios.get('/hotels/owner/my-hotels'),
  createHotel: (data) => axios.post('/hotels', data),
  updateHotel: (id, data) => axios.put(`/hotels/${id}`, data),
  deleteHotel: (id) => axios.delete(`/hotels/${id}`),
  getAdminHotels: (params) => axios.get('/hotels/admin/all', { params }),
  updateHotelStatus: (id, status, rejectionReason = '') => axios.put(`/hotels/admin/${id}/status`, { status, rejectionReason }),
  syncCalendar: () => axios.post('/hotels/owner/sync-calendar'),
  getDestinations: () => axios.get('/hotels/public/destinations'),
};

export default hotelService;
