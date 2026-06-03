// Central API configuration
// In development: uses http://localhost:5000
// In production: uses VITE_API_BASE_URL from environment variables (your Render backend URL)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rescuesync.onrender.com';

export { API_BASE_URL };
