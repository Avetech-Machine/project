import authService from './authService';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class OfferService {
  async getOffersByClient(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/by-client/${clientId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Teklifler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get offers by client error:', error);
      throw error;
    }
  }
}

export default new OfferService();
