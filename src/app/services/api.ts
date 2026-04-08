/**
 * BIUST Smart Maintenance System - API Service
 *
 * Axios instance configured for backend communication.
 * - Base URL points to local backend server
 * - Automatically attaches JWT token from localStorage
 * - Ensures all protected routes include Authorization header
 */

import axios from 'axios';

/**
 * Create Axios instance with base URL
 */
const API = axios.create({
    baseURL: 'http://localhost:5000',
});

/**
 * Request interceptor
 * - Reads JWT token from localStorage
 * - Attaches Authorization header if token exists
 */
API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;