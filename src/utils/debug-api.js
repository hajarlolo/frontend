import { api } from '../services/api';

// Debug API configuration
console.log('=== API Configuration Debug ===');
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Test API base URL
console.log('API Base URL:', api.defaults.baseURL);

// Test a simple API call
api.get('/health').then(response => {
  console.log('Health check successful:', response.data);
}).catch(error => {
  console.log('Health check failed:', error);
});

export { api };
