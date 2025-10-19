import React, { useState, useEffect, useCallback } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import ViewProposalsModal from './ViewProposalsModal';
import SendOfferModal from './SendOfferModal';
import EditProjectModal from './EditProjectModal';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import projectService from '../../services/projectService';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineEuro,
  AiOutlineEye,
  AiOutlineReload,
  AiOutlineDelete
} from 'react-icons/ai';
import { FaChartLine, FaPaperPlane } from 'react-icons/fa';
import './AllServicesTable.css';

const AllServices = ({ onEditService }) => {
  const [projects, setProjects] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isProposalsModalOpen, setIsProposalsModalOpen] = useState(false);
  const [isSendOfferModalOpen, setIsSendOfferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (err) {
      setError(err.message || 'Projeler yüklenirken bir hata oluştu');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadProjects();
  };

  const handleSearch = useCallback(async (query) => {
    setSearchTerm(query);
    setIsSearching(true);
    setError('');
    
    try {
      if (query.trim()) {
        const searchResults = await projectService.searchProjects(query);
        setProjects(searchResults);
      } else {
        // If search is cleared, reload all projects or apply active filters
        if (Object.keys(activeFilters).length > 0 && Object.values(activeFilters).some(v => v !== '')) {
          await handleFilter(activeFilters);
        } else {
          loadProjects();
        }
      }
    } catch (err) {
      setError(err.message || 'Arama sırasında bir hata oluştu');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [activeFilters]);

  const handleFilter = useCallback(async (filters) => {
    setActiveFilters(filters);
    setIsFiltering(true);
    setError('');
    
    try {
      // Check if any filter has a value
      const hasActiveFilters = Object.values(filters).some(value => value !== '');
      
      if (hasActiveFilters) {
        const filterResults = await projectService.filterProjects(filters);
        setProjects(filterResults);
      } else {
        // If no filters, load all projects
        loadProjects();
      }
    } catch (err) {
      setError(err.message || 'Filtreleme sırasında bir hata oluştu');
      console.error('Filter error:', err);
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    loadProjects();
  };

  const handleInfoClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleEditClick = async (service) => {
    try {
      setEditingProjectId(service.id);
      // Fetch full project details from API
      const fullProjectData = await projectService.getProjectById(service.id);
      setSelectedService(fullProjectData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert(`Proje detayları yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setEditingProjectId(null);
    }
  };

  const handleCostDetailClick = (service) => {
    setSelectedService(service);
    setIsProfitModalOpen(true);
  };

  const handleViewProposalsClick = (service) => {
    setSelectedService(service);
    setIsProposalsModalOpen(true);
  };

  const handleSellProposal = (service) => {
    // Update the project status to 'Satıldı' (Sold)
    const updatedProjects = projects.map(p => 
      p.id === service.id ? { ...p, status: 'Satıldı' } : p
    );
    setProjects(updatedProjects);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await projectService.deleteProject(projectId);
        // Refresh the projects list after successful deletion
        loadProjects();
        alert('Proje başarıyla silindi!');
      } catch (error) {
        console.error('Delete project error:', error);
        alert(`Proje silinirken bir hata oluştu: ${error.message}`);
      }
    }
  };

  const handleSubmitOffer = (service) => {
    setSelectedService(service);
    setIsSendOfferModalOpen(true);
  };

  const handleEditSaveComplete = (updatedProject) => {
    // Refresh the projects list after successful update
    loadProjects();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Gönderildi':
        return 'status-sent';
      case 'Taslak':
        return 'status-draft';
      case 'Onaylandı':
        return 'status-approved';
      case 'Satıldı':
        return 'status-sold';
      default:
        return 'status-default';
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="all-services">
      <div className="services-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Bütün Projeler</h1>
            <p>Tüm makine servis projelerinizi buradan görüntüleyebilir ve yönetebilirsiniz.</p>
          </div>
         
        </div>
      </div>

      <SearchBar 
        onSearch={handleSearch}
        placeholder="Projelerde ara... (proje kodu, makine adı, model, marka, yıl, seri numarası)"
      />

      <FilterPanel 
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="services-table-container">
        {loading || isSearching || isFiltering ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>
              {isSearching ? 'Aranıyor...' : 
               isFiltering ? 'Filtreleniyor...' : 
               'Projeler yükleniyor...'}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchTerm || Object.values(activeFilters).some(v => v !== '') 
                ? 'Arama kriterlerinize uygun proje bulunamadı.' 
                : 'Henüz proje bulunmuyor.'}
            </p>
          </div>
        ) : (
          <table className="services-table">
            <thead>
              <tr>
                <th>PROJE KODU</th>
                <th>MAKİNE ADI</th>
                <th>MAKİNE MODELİ</th>
                <th>MAKİNE YILI</th>
                <th>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id} className="service-row">
                  <td className="form-number">{project.projectCode}</td>
                  <td className="company-name">{project.title || 'Belirtilmemiş'}</td>
                  <td className="device-name">{project.model}</td>
                  <td className="start-date">{project.year}</td>
                  <td className="operations">
                    <div className="operation-buttons">
                      <button 
                        className="operation-btn info-btn" 
                        onClick={() => handleInfoClick(project)}
                        title="Bilgi"
                      >
                        <AiOutlineInfoCircle />
                      </button>
                      <button 
                        className="operation-btn cost-btn" 
                        onClick={() => handleCostDetailClick(project)}
                        title="Maliyet"
                      >
                        <AiOutlineEuro />
                      </button>
                      <button 
                        className="operation-btn submit-btn" 
                        onClick={() => handleSubmitOffer(project)}
                        title="Teklif Gönder"
                      >
                        <FaPaperPlane />
                      </button>
                      <button 
                        className="operation-btn edit-btn" 
                        onClick={() => handleEditClick(project)}
                        title="Düzenle"
                        disabled={editingProjectId === project.id}
                      >
                        {editingProjectId === project.id ? (
                          <div className="loading-spinner-small"></div>
                        ) : (
                          <AiOutlineEdit />
                        )}
                      </button>
                      <button 
                        className="operation-btn delete-btn" 
                        onClick={() => handleDeleteProject(project.id)}
                        title="Sil"
                      >
                        <AiOutlineDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isProfitModalOpen && selectedService && (
        <ProfitAnalysisModal
          service={selectedService}
          onClose={() => setIsProfitModalOpen(false)}
        />
      )}

      {isProposalsModalOpen && selectedService && (
        <ViewProposalsModal
          service={selectedService}
          onClose={() => setIsProposalsModalOpen(false)}
          onSell={handleSellProposal}
        />
      )}

      {isSendOfferModalOpen && selectedService && (
        <SendOfferModal
          service={selectedService}
          onClose={() => setIsSendOfferModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedService && (
        <EditProjectModal
          project={selectedService}
          onClose={() => setIsEditModalOpen(false)}
          onSaveComplete={handleEditSaveComplete}
        />
      )}
    </div>
  );
};

export default AllServices;
