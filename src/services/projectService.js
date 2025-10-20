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

  async getOffers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
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
      console.error('Get offers error:', error);
      throw error;
    }
  }

  async getDeletedProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/deleted`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Silinmiş projeler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get deleted projects error:', error);
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

  async sendOfferToClients(projectId, clientIds) {
    try {
      // Send individual requests for each client
      const promises = clientIds.map(async (clientId) => {
        const response = await fetch(`${API_BASE_URL}/api/offers`, {
          method: 'POST',
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: projectId,
            clientId: clientId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Teklif gönderilirken bir hata oluştu (Müşteri ID: ${clientId})`);
        }

        return await response.json();
      });

      // Wait for all requests to complete
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Send offer to clients error:', error);
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

  // Utility function to get the next AVEMAK project code
  getNextAvemakProjectCode(existingProjects = []) {
    try {
      console.log('=== AVEMAK PROJECT CODE GENERATION ===');
      console.log('Existing projects:', existingProjects);
      console.log('Number of existing projects:', existingProjects.length);
      
      // Extract AVEMAK codes from existing projects
      const avemakCodes = existingProjects
        .map(project => {
          console.log('Processing project:', project);
          if (project.projectCode && typeof project.projectCode === 'string' && project.projectCode.startsWith('AVEMAK-')) {
            const match = project.projectCode.match(/AVEMAK-(\d+)/);
            const code = match ? parseInt(match[1]) : 0;
            console.log('Found AVEMAK code:', project.projectCode, '->', code);
            return code;
          }
          console.log('No AVEMAK code found for project:', project.projectCode);
          return 0;
        })
        .filter(code => code > 0);

      console.log('Extracted AVEMAK codes:', avemakCodes);

      // Find the highest existing code, default to 0 if none exist
      const maxCode = avemakCodes.length > 0 ? Math.max(...avemakCodes) : 0;
      console.log('Max existing code:', maxCode);
      
      // Return the next code in AVEMAK-XXX format
      const nextCode = maxCode + 1;
      const result = `AVEMAK-${nextCode.toString().padStart(3, '0')}`;
      console.log('Next AVEMAK code:', result);
      console.log('=====================================');
      
      return result;
    } catch (error) {
      console.error('Error generating next AVEMAK project code:', error);
      // Fallback to AVEMAK-001 if there's an error
      return 'AVEMAK-001';
    }
  }

  // Utility function to get the next AVEMAK project code with duplicate prevention
  async getNextAvemakProjectCodeSafe() {
    try {
      console.log('=== SAFE AVEMAK PROJECT CODE GENERATION ===');
      
      // Get projects from both API and localStorage
      let apiProjects = [];
      let localStorageProjects = [];
      
      try {
        apiProjects = await this.getProjects();
        console.log('API projects for safe numbering:', apiProjects);
      } catch (apiError) {
        console.warn('Could not fetch projects from API for safe numbering:', apiError);
      }
      
      // Check localStorage as well
      const existingServices = JSON.parse(localStorage.getItem('serviceReceipts') || '[]');
      console.log('LocalStorage projects for safe numbering:', existingServices);
      localStorageProjects = existingServices;
      
      // Combine both sources
      const allProjects = [...apiProjects, ...localStorageProjects];
      console.log('All projects for safe numbering:', allProjects);
      
      // Get the next code
      const nextCode = this.getNextAvemakProjectCode(allProjects);
      console.log('Safe next AVEMAK code:', nextCode);
      console.log('==========================================');
      
      return nextCode;
    } catch (error) {
      console.error('Error in safe AVEMAK project code generation:', error);
      return 'AVEMAK-001';
    }
  }
}

export default new ProjectService();
