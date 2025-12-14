import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Connects to your Python backend
});

export default api;