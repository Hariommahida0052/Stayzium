import axios from 'axios';

const userService = {
  getProfile: () => axios.get('/users/profile'),
  updateProfile: (data) => axios.put('/users/profile', data),
  changePassword: (data) => axios.put('/users/profile/password', data),
  getDashboardStats: () => axios.get('/users/dashboard'),
  getWishlist: () => axios.get('/users/wishlist'),
  toggleWishlist: (hotelId) => axios.post(`/users/wishlist/${hotelId}`),
  getAllUsers: (params) => axios.get('/users/admin', { params }),
  getUserById: (id) => axios.get(`/users/admin/${id}`),
  updateUserStatus: (id, status) => axios.put(`/users/admin/${id}/status`, { status }),
  toggleUserVerification: (id) => axios.put(`/users/admin/${id}/verify`),
  deleteUser: (id) => axios.delete(`/users/admin/${id}`),
};

export default userService;
