import authService from './authService';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class UserService {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kullanıcılar yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const payload = {
        ...userData,
        role: 'VIEWER',
      };

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kullanıcı oluşturulurken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kullanıcı güncellenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kullanıcı silinirken bir hata oluştu');
      }

      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}

export default new UserService();


