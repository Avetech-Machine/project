import React, { useState, useEffect } from 'react';
import { 
  FaFileInvoice, 
  FaPaperPlane, 
  FaClock, 
  FaExchangeAlt,
  FaSearch,
  FaEye,
  FaLock,
  FaChevronDown
} from 'react-icons/fa';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineClose
} from 'react-icons/ai';
import ServiceDetailsModal from '../ServiceReceipt/ServiceDetailsModal';
import SendOfferModal from '../ServiceReceipt/SendOfferModal';
import projectService from '../../services/projectService';
import './MainMenu.css';

const MainMenu = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSendOfferModalOpen, setIsSendOfferModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectCounts, setProjectCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(null);
  const projectsPerPage = 6;

  // Fetch projects data on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch project counts by status
  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        setCountsLoading(true);
        setCountsError(null);
        const data = await projectService.getProjectCountsByStatus();
        setProjectCounts(data);
      } catch (err) {
        console.error('Error fetching project counts:', err);
        setCountsError(err.message || 'Proje sayıları yüklenirken bir hata oluştu');
      } finally {
        setCountsLoading(false);
      }
    };

    fetchProjectCounts();
  }, []);

  // Calculate dashboard stats from API data
  const completedProjects = projectCounts?.statusCounts?.SOLD || 0;
  const submittedOffers = projectCounts?.statusCounts?.OFFER_SENT || 0;

  const dashboardStats = [
    {
      title: 'Kapanan Projeler',
      count: completedProjects,
      icon: FaFileInvoice,
      color: 'green',
      loading: countsLoading,
      error: countsError
    },
    {
      title: 'Teklif Gönderilen Projeler',
      count: submittedOffers,
      icon: FaPaperPlane,
      color: 'blue',
      loading: countsLoading,
      error: countsError
    }
  ];

  // Pagination logic
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  // Transform API data to match the expected format for the cards
  const serviceData = currentProjects.map(project => ({
    id: project.id || project._id,
    machineName: project.title || project.machineName || 'N/A',
    year: project.year || new Date(project.createdAt).getFullYear().toString(),
    operatingSystem: project.model || project.operatingSystem || project.controlUnit || 'N/A',
    serialNumber: project.serialNumber || 'N/A',
    createdDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : 'N/A',
    status: project.status || 'UNKNOWN',
    totalCost: project.totalCost || 0,
    salesPrice: project.salesPrice || 0,
    netProfit: project.netProfit || 0,
    profitMargin: project.profitMargin || 0,
    costDetails: project.costDetails || [],
    workingHours: project.workingHours || '0',
    repairHours: project.repairHours || '0',
    teamCount: project.teamCount || '0',
    teamMeasurementProbe: project.teamMeasurementProbe || 'N/A',
    partMeasurementProbe: project.partMeasurementProbe || 'N/A',
    insideWaterGiving: project.insideWaterGiving || 'N/A',
    accessoryData: project.accessoryData || 'N/A',
    firmName: project.firmName || 'N/A',
    technician: project.technician || 'N/A',
    // Additional technical details for ServiceDetailsModal
    brand: project.brand || 'N/A',
    model: project.model || 'N/A',
    controlUnit: project.controlUnit || 'CNC',
    xMovements: project.xMovements || 'N/A',
    yMovements: project.yMovements || 'N/A',
    zMovements: project.zMovements || 'N/A',
    bMovements: project.bMovements || 'N/A',
    cMovements: project.cMovements || 'N/A',
    spindleSpeed: project.spindleSpeed || 'N/A',
    toolCount: project.toolCount || 'N/A',
    holderType: project.holderType || 'N/A',
    machineDimensions: project.machineDimensions || 'N/A',
    machinePower: project.machinePower || 'N/A',
    internalCoolant: project.internalCoolant || 'N/A',
    chipConveyor: project.chipConveyor || 'N/A',
    paperFilter: project.paperFilter || 'N/A',
    maxMaterialWeight: project.maxMaterialWeight || 'N/A',
    machineWeight: project.machineWeight || 'N/A',
    operatingHours: project.operatingHours || 'N/A',
    otherInfo: project.otherInfo || 'N/A'
  }));

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInfoClick = (service) => {
    setSelectedService(service);
    setShowInfoModal(true);
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
    setSelectedService(null);
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setIsSendOfferModalOpen(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TAMAMLANMIŞ':
      case 'SOLD':
        return 'status-approved';
      case 'TEKLİF GÖNDERİLECEK':
      case 'TEMPLATE':
        return 'status-draft';
      case 'EXCHANGE CIHAZ TEKLİFİ':
      case 'OFFER_SENT':
        return 'status-sent';
      case 'BOUGHT':
        return 'status-sold';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'TAMAMLANMIŞ':
        return 'TAMAMLANMIŞ';
      case 'TEKLİF GÖNDERİLECEK':
        return 'TEKLİF GÖNDERİLECEK';
      case 'EXCHANGE CIHAZ TEKLİFİ':
        return 'EXCHANGE CIHAZ TEKLİFİ';
      case 'SOLD':
        return 'SATILDI';
      case 'OFFER_SENT':
        return 'TEKLİF GÖNDERİLDİ';
      case 'TEMPLATE':
        return 'TASLAK';
      case 'BOUGHT':
        return 'SATIN ALINDI';
      case 'CANCELLED':
        return 'İPTAL EDİLDİ';
      default:
        return status;
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };



  return (
    <div className="main-menu">
      {/* Dashboard Stats Cards */}
      <div className="dashboard-stats">
        {dashboardStats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-count">
                {stat.loading ? (
                  <span className="loading-text">Yükleniyor...</span>
                ) : stat.error ? (
                  <span className="error-text">Hata</span>
                ) : (
                  stat.count
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="section-header">
          <h2>Son Projeler</h2>
        </div>

        {loading && (
          <div className="loading-state">
            <p>Projeler yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>Hata: {error}</p>
          </div>
        )}

        {!loading && !error && serviceData.length === 0 && (
          <div className="empty-state">
            <p>Henüz proje bulunmuyor.</p>
          </div>
        )}

        {!loading && !error && serviceData.length > 0 && (
          <>
            <div className="services-grid">
              {serviceData.map((service) => (
            <div key={service.id} className="service-card">
              <div className="card-header">
                <h3 className="machine-name">{service.machineName}</h3>
                <div className={`status-badge ${getStatusClass(service.status)}`}>
                  {getDisplayStatus(service.status)}
                </div>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <AiOutlineCalendar className="detail-icon" />
                  <span className="detail-label">{service.year}</span>
                  <AiOutlineSetting className="detail-icon" />
                  <span className="detail-label">{service.operatingSystem}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Seri No:</span>
                  <span className="detail-value serial-number">{service.serialNumber}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Oluşturma:</span>
                  <span className="detail-value creation-date">{service.createdDate}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-offer"
                  onClick={() => handleEditClick(service)}
                >
                  <FaPaperPlane className="btn-icon" />
                  Teklif Gönder
                </button>
                <button 
                  className="btn-info"
                  onClick={() => handleInfoClick(service)}
                >
                  <AiOutlineInfoCircle className="btn-icon" />
                  Bilgi
                </button>
              </div>
            </div>
          ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </button>
                <span className="pagination-info">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Service Details Modal */}
      {showInfoModal && selectedService && (
        <ServiceDetailsModal 
          service={selectedService} 
          onClose={handleCloseModal} 
        />
      )}

      {/* Send Offer Modal */}
      {isSendOfferModalOpen && selectedService && (
        <SendOfferModal
          service={selectedService}
          onClose={() => setIsSendOfferModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MainMenu;
