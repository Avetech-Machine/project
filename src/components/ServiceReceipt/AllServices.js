import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import ViewProposalsModal from './ViewProposalsModal';
import SendOfferModal from './SendOfferModal';
import projectService from '../../services/projectService';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineEuro,
  AiOutlineEye,
  AiOutlineReload
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load projects from API
  useEffect(() => {
    loadProjects();
    
    // Refresh projects when window gains focus (e.g., when navigating back)
    const handleFocus = () => {
      loadProjects();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
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

  const handleInfoClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setIsSendOfferModalOpen(true);
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

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="services-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Projeler yükleniyor...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>Henüz proje bulunmuyor.</p>
          </div>
        ) : (
          <table className="services-table">
            <thead>
              <tr>
                <th>FORM NO</th>
                <th>FİRMA ADI</th>
                <th>CİHAZ</th>
                <th>BAŞLANGIÇ TARİHİ</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id} className="service-row">
                  <td className="form-number">{project.id}</td>
                  <td className="company-name">{project.make || 'Belirtilmemiş'}</td>
                  <td className="device-name">{project.title}</td>
                  <td className="start-date">{formatDate(project.createdAt)}</td>
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
    </div>
  );
};

export default AllServices;
