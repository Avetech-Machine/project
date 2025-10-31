import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import SendOfferModal from './SendOfferModal';
import ViewOfferModal from './ViewOfferModal';
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
  const [isViewOfferModalOpen, setIsViewOfferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch offers from the new API endpoint
  useEffect(() => {
    const fetchQuotesSentProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const offersData = await projectService.getOffers();
        
        // Transform offers data to match the expected format
        const transformedServices = await Promise.all(offersData.map(async (offer) => {
          try {
            // Fetch project details for each offer
            const projectDetails = await projectService.getProjectById(offer.projectId);
            
            return {
              id: offer.projectId, // Use projectId as the main ID for modals
              offerId: offer.id, // Keep offer ID for reference
              projectId: offer.projectId,
              projectCode: offer.projectCode,
              clientId: offer.clientId,
              clientCompanyName: offer.clientCompanyName,
              senderUserName: offer.senderUserName,
              sentAt: offer.sentAt,
              machineName: projectDetails.title || offer.projectCode,
              machineTitle: projectDetails.title || offer.projectCode,
              model: projectDetails.model || '-',
              year: projectDetails.year || '-',
              operatingSystem: projectDetails.title || offer.projectCode,
              serialNumber: projectDetails.serialNumber || '-',
              createdDate: offer.sentAt ? new Date(offer.sentAt).toLocaleDateString('tr-TR') : '-',
              status: 'ONAY BEKLİYOR', // All offers will show as "Gönderildi"
              totalCost: projectDetails.totalCost || 0,
              salesPrice: projectDetails.salesPrice || 0,
              netProfit: projectDetails.netProfit || 0,
              profitMargin: projectDetails.profitMargin || 0,
              costDetails: projectDetails.costDetails || [],
              workingHours: projectDetails.hoursOperated || '-',
              repairHours: projectDetails.repairHours || '-',
              teamCount: projectDetails.teamCount || '-',
              teamMeasurementProbe: projectDetails.takimOlcmeProbu ? 'Var' : 'Yok',
              partMeasurementProbe: projectDetails.parcaOlcmeProbu ? 'Var' : 'Yok',
              insideWaterGiving: projectDetails.ictenSuVerme ? 'Var' : 'Yok',
              accessoryData: projectDetails.additionalEquipment || '-'
            };
          } catch (projectError) {
            console.error(`Error fetching project details for offer ${offer.id}:`, projectError);
            // Return basic offer data if project details can't be fetched
            return {
              id: offer.projectId, // Use projectId as the main ID for modals
              offerId: offer.id, // Keep offer ID for reference
              projectId: offer.projectId,
              projectCode: offer.projectCode,
              clientId: offer.clientId,
              clientCompanyName: offer.clientCompanyName,
              senderUserName: offer.senderUserName,
              sentAt: offer.sentAt,
              machineName: offer.projectCode,
              machineTitle: offer.projectCode,
              model: '-',
              year: '-',
              operatingSystem: offer.projectCode,
              serialNumber: '-',
              createdDate: offer.sentAt ? new Date(offer.sentAt).toLocaleDateString('tr-TR') : '-',
              status: 'ONAY BEKLİYOR',
              totalCost: 0,
              salesPrice: 0,
              netProfit: 0,
              profitMargin: 0,
              costDetails: [],
              workingHours: '-',
              repairHours: '-',
              teamCount: '-',
              teamMeasurementProbe: 'Yok',
              partMeasurementProbe: 'Yok',
              insideWaterGiving: 'Yok',
              accessoryData: '-'
            };
          }
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

  const handleViewOfferClick = (service) => {
    setSelectedService(service);
    setIsViewOfferModalOpen(true);
  };

  const handleCostDetailClick = (service) => {
    setSelectedService(service);
    setIsProfitModalOpen(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ONAY BEKLİYOR':
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
        <h1>Teklifler</h1>
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

            <div className="sender-info">
              <span className="sender-label">Gönderen:</span>
              <span className="sender-name">{service.senderUserName || 'Bilinmiyor'}</span>
            </div>

            <div className="card-details">
              <div className="detail-row">
                <AiOutlineSetting className="detail-icon" />
                <span className="detail-value">{service.model}</span>
                <span className="detail-value">{service.machineTitle}</span>
                <AiOutlineCalendar className="detail-icon" />
                <span className="detail-value">{service.year}</span>
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
                className="btn-info"
                onClick={() => handleInfoClick(service)}
              >
                <AiOutlineInfoCircle className="btn-icon" />
                Bilgi
              </button>
              <button 
                className="btn-cost-detail"
                onClick={() => handleCostDetailClick(service)}
              >
                <AiOutlineEuro className="btn-icon" />
                Maliyet
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

      {isViewOfferModalOpen && selectedService && (
        <ViewOfferModal
          isOpen={isViewOfferModalOpen}
          onClose={() => setIsViewOfferModalOpen(false)}
          projectId={selectedService.projectId}
          projectCode={selectedService.projectCode}
        />
      )}
    </div>
  );
};

export default QuotesSent;
