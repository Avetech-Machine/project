import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import SendOfferModal from './SendOfferModal';
import projectService from '../../services/projectService';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineEuro,
  AiOutlineEye
} from 'react-icons/ai';
import { FaChartLine, FaPaperPlane } from 'react-icons/fa';
import './AllServices.css';

const QuotesSent = ({ onEditService }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isSendOfferModalOpen, setIsSendOfferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects with OFFER_SENT status from API
  useEffect(() => {
    const fetchQuotesSentProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectsByStatus('OFFER_SENT');
        
        // Transform API data to match the expected format
        const transformedServices = data.map(project => ({
          id: project.id,
          machineName: project.title,
          year: project.year,
          operatingSystem: project.title,
          serialNumber: project.serialNumber,
          createdDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : '-',
          status: 'Gönderildi', // All projects from this endpoint will show as "Gönderildi"
          totalCost: project.totalCost || 0,
          salesPrice: project.salesPrice || 0,
          netProfit: project.netProfit || 0,
          profitMargin: project.profitMargin || 0,
          costDetails: project.costDetails || [],
          workingHours: project.hoursOperated || '-',
          repairHours: project.repairHours || '-',
          teamCount: project.teamCount || '-',
          teamMeasurementProbe: project.takimOlcmeProbu ? 'Var' : 'Yok',
          partMeasurementProbe: project.parcaOlcmeProbu ? 'Var' : 'Yok',
          insideWaterGiving: project.ictenSuVerme ? 'Var' : 'Yok',
          accessoryData: project.additionalEquipment || '-'
        }));
        
        setServices(transformedServices);
      } catch (err) {
        console.error('Error fetching quotes sent projects:', err);
        setError(err.message || 'Teklif gönderilen projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotesSentProjects();
  }, []);

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

  return (
    <div className="all-services">
      <div className="services-header">
        <h1>Teklif Gönderilen Projeler</h1>
        <p>Teklif gönderilmiş projelerinizi buradan görüntüleyebilir ve yönetebilirsiniz.</p>
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

      {!loading && !error && (
        <div className="services-grid">
          {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="card-header">
              <h3 className="machine-name">{service.machineName}</h3>
              <div className={`status-badge ${getStatusClass(service.status)}`}>
                {service.status}
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
                className="btn-cost-detail"
                onClick={() => handleCostDetailClick(service)}
              >
                <AiOutlineEuro className="btn-icon" />
                Maliyet
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
      )}

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

      {isSendOfferModalOpen && selectedService && (
        <SendOfferModal
          service={selectedService}
          onClose={() => setIsSendOfferModalOpen(false)}
        />
      )}
    </div>
  );
};

export default QuotesSent;
