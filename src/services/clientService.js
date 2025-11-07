import authService from './authService';
import { fetchWithAuth } from '../utils/apiUtils';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class ClientService {
  async getClients() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/clients`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get clients error:', error);
      throw error;
    }
  }

  async getClientById(clientId) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/clients/${clientId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get client by ID error:', error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  }

  async updateClient(clientId, clientData) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update client error:', error);
      throw error;
    }
  }
}

export default new ClientService();
