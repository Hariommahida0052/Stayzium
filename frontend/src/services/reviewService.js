import axios from 'axios';

const reviewService = {
  getHotelReviews: (hotelId) => axios.get(`/reviews/hotel/${hotelId}`),
  addReview: (hotelId, data) => axios.post(`/reviews/hotel/${hotelId}`, data),
  updateReview: (id, data) => axios.put(`/reviews/${id}`, data),
  deleteReview: (id) => axios.delete(`/reviews/${id}`)
};

export default reviewService;
