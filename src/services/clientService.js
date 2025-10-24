import authService from './authService';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class ClientService {
  async getClients() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Müşteriler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get clients error:', error);
      throw error;
    }
  }

  async getClientById(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Müşteri bilgileri yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get client by ID error:', error);
      throw error;
    }
  }
}

export default new ClientService();
