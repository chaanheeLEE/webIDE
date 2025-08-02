import axiosInstance from './axiosInstance';

const setupInterceptors = (auth) => {
    // Response interceptor for token refresh
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }
                    
                    const { data } = await axiosInstance.post('/members/refresh', null, {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`
                        }
                    });
                    
                    const { accessToken } = data;
                    auth.login(accessToken);
                    
                    // Retry the original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    auth.logout();
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            
            return Promise.reject(error);
        }
    );
};

export default setupInterceptors;
