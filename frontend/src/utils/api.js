import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    // The token is automatically included in requests via HttpOnly cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
