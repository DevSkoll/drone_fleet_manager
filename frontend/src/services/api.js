/**
 * API client abstraction layer
 * Centralizes all backend communication
 * Bryce at JCU//JEDI - arctek.us
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Drone API endpoints
export const droneAPI = {
  getAll: () => apiClient.get('/drones'),
  getById: (id) => apiClient.get(`/drones/${id}`),
  create: (drone) => apiClient.post('/drones', drone),
  update: (id, drone) => apiClient.put(`/drones/${id}`, drone),
  delete: (id) => apiClient.delete(`/drones/${id}`),
};

// Settings API endpoints
export const settingsAPI = {
  get: () => apiClient.get('/settings'),
  update: (settings) => apiClient.put('/settings', settings),
  reset: () => apiClient.post('/settings/reset'),
  generateAuthKey: () => apiClient.post('/settings/generate-auth-key'),
};

export default apiClient;
