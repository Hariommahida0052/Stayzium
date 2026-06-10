import axios from 'axios';

const offerService = {
  // Public APIs
  getPublicOffers: () => axios.get('/offers'),
  getOfferById: (id) => axios.get(`/offers/${id}`),

  // Admin APIs
  getAllOffers: () => axios.get('/offers/admin/all'),
  createOffer: (data) => axios.post('/offers', data),
  updateOffer: (id, data) => axios.put(`/offers/${id}`, data),
  deleteOffer: (id) => axios.delete(`/offers/${id}`),
  toggleOfferStatus: (id) => axios.put(`/offers/${id}/toggle`),
};

export default offerService;
