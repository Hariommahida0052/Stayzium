import axios from 'axios';

const authService = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
};

export default authService;
