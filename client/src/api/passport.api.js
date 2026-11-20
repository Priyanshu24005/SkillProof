import axios from 'axios';

const passportApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getPublicPassport = (username) => passportApi.get(`/passport/${username}`);