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

  async getOffersByProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/by-project/${projectId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje teklifleri yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get offers by project error:', error);
      throw error;
    }
  }

  async getOfferById(offerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Teklif yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      // Find the offer with matching ID
      const offer = Array.isArray(data) ? data.find(o => o.id === offerId) : null;
      if (!offer) {
        throw new Error('Teklif bulunamadı');
      }
      return offer;
    } catch (error) {
      console.error('Get offer by id error:', error);
      throw error;
    }
  }
}

export default new OfferService();
