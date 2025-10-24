import authService from './authService';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class SaleService {
  async createSale(saleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Satış oluşturulurken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create sale error:', error);
      throw error;
    }
  }

  async getSales() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Satışlar yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get sales error:', error);
      throw error;
    }
  }

  async getSalesByProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/by-project/${projectId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje satışları yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get sales by project error:', error);
      throw error;
    }
  }
}

export default new SaleService();
