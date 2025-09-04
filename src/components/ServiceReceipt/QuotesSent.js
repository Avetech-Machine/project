import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineEuro
} from 'react-icons/ai';
import { FaChartLine, FaPaperPlane } from 'react-icons/fa';
import './AllServices.css';

const QuotesSent = ({ onEditService }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);

  // Demo data - this will be replaced with actual cached data
  useEffect(() => {
    // Check if there are any cached services in localStorage
    const cachedServices = localStorage.getItem('serviceReceipts');
    if (cachedServices) {
      const allServices = JSON.parse(cachedServices);
      // Filter only services with "Gönderildi" status
      const quotesSentServices = allServices.filter(service => service.status === 'Gönderildi');
      setServices(quotesSentServices);
    } else {
      // Demo data for initial display
      const demoServices = [
        {
          id: 'DMG-2020-001',
          machineName: 'DMG MORI DMU 50',
          year: '2020',
          operatingSystem: 'FANUC',
          serialNumber: 'DMG-2020-001',
          createdDate: '15.01.2024',
          status: 'Gönderildi',
          totalCost: 15500,
          salesPrice: 22000,
          netProfit: 6500,
          profitMargin: 29.5,
          costDetails: [
            { id: 1, description: 'Otel', currency: 'EUR', amount: 200 },
            { id: 2, description: 'Lojistik', currency: 'EUR', amount: 10000 }
          ],
          workingHours: '8000',
          repairHours: '1500',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          accessoryData: 'Takım Çantası'
        }
      ];
      setServices(demoServices);
    }
  }, []);

  const handleInfoClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleEditClick = (service) => {
    if (onEditService) {
      onEditService(service);
    }
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
    </div>
  );
};

export default QuotesSent;
