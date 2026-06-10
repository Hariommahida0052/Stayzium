import axios from 'axios';

const uploadService = {
  uploadImage: (formData) => axios.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default uploadService;
