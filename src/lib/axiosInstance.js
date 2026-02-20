import axios from 'axios';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BACKEND,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('superadminToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle token expiration
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('superadminToken');

            // Only redirect if not already on login page
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
