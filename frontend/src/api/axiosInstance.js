import axios from 'axios';

// Create an Axios instance with a base configuration
const axiosInstance = axios.create({
  // Replace this with your actual backend API URL
  baseURL: 'http://localhost:8080/api', 
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Interceptor Examples (currently commented out) ===

// // Request Interceptor: Runs before every request is sent
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Example: Add an authorization token to headers
//     // const token = localStorage.getItem('token');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     // Handle request errors
//     return Promise.reject(error);
//   }
// );

// // Response Interceptor: Runs after a response is received
// axiosInstance.interceptors.response.use(
//   (response) => {
//     // Any status code within the range of 2xx causes this function to trigger
//     // You can directly return response.data to simplify data access
//     return response;
//   },
//   (error) => {
//     // Any status codes outside the range of 2xx cause this function to trigger
//     // Example: Handle global errors like 401 Unauthorized
//     // if (error.response && error.response.status === 401) {
//     //   // Redirect to login page or refresh token
//     //   console.error('Unauthorized! Redirecting to login...');
//     // }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
