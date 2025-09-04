import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import { 
  AiOutlineInfoCircle, 
  AiOutlineEdit, 
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineEuro,
  AiOutlineEye,
  AiOutlineSend
} from 'react-icons/ai';
import { FaChartLine, FaPaperPlane } from 'react-icons/fa';
import './AllServices.css';

const ClosedProjects = ({ onEditService }) => {
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
      // Filter only services with "Satıldı" status
      const closedServices = allServices.filter(service => service.status === 'Satıldı');
      setServices(closedServices);
    } else {
      // Demo data for initial display
      const demoServices = [
        {
          id: 'HAAS-2021-012',
          machineName: 'Haas VF-4SS',
          year: '2021',
          operatingSystem: 'Haas Control',
          serialNumber: 'HAAS-2021-012',
          createdDate: '10.01.2024',
          status: 'Satıldı',
          totalCost: 12500,
          salesPrice: 12500,
          netProfit: 4000,
          profitMargin: 32.0,
          costDetails: [
            { id: 1, description: 'Taşıma', currency: 'EUR', amount: 800 },
            { id: 2, description: 'Montaj', currency: 'EUR', amount: 3700 }
          ],
          workingHours: '5000',
          repairHours: '800',
          teamCount: '2',
          teamMeasurementProbe: 'Yok',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          accessoryData: 'Otomatik Takım Değiştirici'
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

  const handleSeeCostAll = () => {
    // Handle "See Cost" for all projects
    console.log('See Cost for all closed projects');
  };

  const handleSubmitInformationAll = () => {
    // Handle "Submit Information" for all projects
    console.log('Submit Information for all closed projects');
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
        <h1>Kapatılan Projeler</h1>
        <p>Satılmış ve tamamlanmış projelerinizi buradan görüntüleyebilirsiniz.</p>
      </div>

      {/* Action buttons above the cards */}
      <div className="action-buttons-container">
        
          
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

            <div className="card-actions sold-item">
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

export default ClosedProjects;
