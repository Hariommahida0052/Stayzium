import axios from 'axios';

const API_URL = 'http://localhost:5000/api/newsletter/';

const subscribe = async (email) => {
  return axios.post(API_URL + 'subscribe', { email });
};

const newsletterService = {
  subscribe,
};

export default newsletterService;
