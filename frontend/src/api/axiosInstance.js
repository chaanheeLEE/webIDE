import axios from 'axios';

// API base URL을 환경에 따라 동적으로 설정
const getBaseURL = () => {
  // 프로덕션 환경에서는 현재 도메인의 /api 경로 사용
  if (import.meta.env.PROD) {
    return '/api';
  }
  // 개발 환경에서는 localhost:8080 사용
  return 'http://localhost:8080/api';
};

// Create an Axios instance with a base configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
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
