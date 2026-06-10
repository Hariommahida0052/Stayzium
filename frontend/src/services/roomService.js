import axios from 'axios';

const roomService = {
  getRoomsByHotel: (hotelId) => axios.get(`/hotels/${hotelId}/rooms`),
  createRoom: (hotelId, data) => axios.post(`/hotels/${hotelId}/rooms`, data),
  updateRoom: (roomId, data) => axios.put(`/rooms/${roomId}`, data),
  deleteRoom: (roomId) => axios.delete(`/rooms/${roomId}`),
};

export default roomService;
