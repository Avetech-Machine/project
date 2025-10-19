import authService from './authService';

const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class ProjectService {
  async getProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Projeler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  async getProjectById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje detayları yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get project by id error:', error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      // Log the request details
      console.log('=== PROJECT SERVICE REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/api/projects`);
      console.log('Method: POST');
      console.log('Headers:', {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      });
      console.log('Body (stringified):', JSON.stringify(projectData));
      console.log('Body (raw):', projectData);
      console.log('================================');
      
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('=== RESPONSE DETAILS ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error Response:', errorData);
        console.log('=======================');
        throw new Error(errorData.message || 'Proje oluşturulurken bir hata oluştu');
      }

      const data = await response.json();
      console.log('Success Response:', data);
      console.log('=======================');
      return data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  async updateProject(id, projectData) {
    try {
      // Log the request details
      console.log('=== PROJECT UPDATE REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/api/projects/${id}`);
      console.log('Method: PUT');
      console.log('Headers:', {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      });
      console.log('Body (stringified):', JSON.stringify(projectData));
      console.log('Body (raw):', projectData);
      console.log('==============================');
      
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('=== UPDATE RESPONSE DETAILS ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error Response:', errorData);
        console.log('Error Status:', response.status);
        console.log('Error Status Text:', response.statusText);
        console.log('==============================');
        
        // Provide more detailed error message
        let errorMessage = 'Proje güncellenirken bir hata oluştu';
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          errorMessage = `Validation Error: ${JSON.stringify(errorData.details)}`;
        } else if (response.status === 400) {
          errorMessage = 'Geçersiz veri formatı. Lütfen tüm alanları kontrol edin.';
        } else if (response.status === 404) {
          errorMessage = 'Proje bulunamadı.';
        } else if (response.status === 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success Response:', data);
      console.log('==============================');
      return data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje silinirken bir hata oluştu');
      }

      return true;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  async getProjectsByStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/status/${status}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Projeler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get projects by status error:', error);
      throw error;
    }
  }

  async getProjectCostDetails(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/cost-details`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Maliyet detayları yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get project cost details error:', error);
      throw error;
    }
  }

  async sendOffer(id, offerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/send-offer`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Teklif gönderilirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send offer error:', error);
      throw error;
    }
  }

  async getProjectCountsByStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/count-by-status`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statuses: ["TEMPLATE", "SOLD", "BOUGHT", "OFFER_SENT", "CANCELLED"]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje sayıları yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get project counts by status error:', error);
      throw error;
    }
  }

  async searchProjects(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje arama sırasında bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search projects error:', error);
      throw error;
    }
  }

  async filterProjects(filters) {
    try {
      // Build query string from filters object
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/projects/filter?${queryParams.toString()}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Proje filtreleme sırasında bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Filter projects error:', error);
      throw error;
    }
  }
}

export default new ProjectService();
