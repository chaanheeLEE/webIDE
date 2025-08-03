import axios from 'axios';

// Create an Axios instance with a base configuration
const axiosInstance = axios.create({
  // Replace this with your actual backend API URL
  baseURL: 'http://localhost:8080/api', 
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // to send cookies
});

// Request interceptor to add auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
