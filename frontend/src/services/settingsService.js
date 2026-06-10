import axios from 'axios';

const API_URL = '/settings';

// Get public platform settings (no auth required)
const getPublicSettings = () => {
  return axios.get(`${API_URL}/public`);
};

// Get all platform settings (Admin only)
const getSettings = () => {
  return axios.get(API_URL);
};

// Update platform settings (Admin only)
const updateSettings = (data) => {
  return axios.put(API_URL, data);
};

export default {
  getPublicSettings,
  getSettings,
  updateSettings
};
