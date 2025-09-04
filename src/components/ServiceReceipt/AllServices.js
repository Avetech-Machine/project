import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import ViewProposalsModal from './ViewProposalsModal';
import SendOfferModal from './SendOfferModal';
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

const AllServices = ({ onEditService }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isProposalsModalOpen, setIsProposalsModalOpen] = useState(false);
  const [isSendOfferModalOpen, setIsSendOfferModalOpen] = useState(false);

  // Load services from localStorage or use demo data
  useEffect(() => {
    loadServicesFromStorage();
    
    // Refresh services when window gains focus (e.g., when navigating back)
    const handleFocus = () => {
      loadServicesFromStorage();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadServicesFromStorage = () => {
    // Check if there are any cached services in localStorage
    const cachedServices = localStorage.getItem('serviceReceipts');
    if (cachedServices) {
      setServices(JSON.parse(cachedServices));
    } else {
      // Demo data for initial display (only if no cached data exists)
      const demoServices = [
        {
          id: 'DMG-2020-001',
          machineName: 'DMG MORI NHX5000',
          brand: 'DMG MORI',
          model: 'NHX5000',
          year: '2012',
          operatingSystem: 'Mitsubishi M730',
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
          // Machine specifications
          xMovements: '730 MM',
          yMovements: '730 MM',
          zMovements: '880 MM',
          bMovements: '360° / 1°',
          cMovements: '',
          controlUnit: 'Mitsubishi M730',
          spindleSpeed: '12.000 MIN/-1',
          toolCount: '40',
          holderType: 'BT 40',
          machineDimensions: '',
          machinePower: '',
          internalCoolant: 'VAR',
          chipConveyor: 'VAR',
          paperFilter: 'YOK',
          maxMaterialWeight: '700 KG',
          machineWeight: '',
          operatingHours: '',
          otherInfo: '',
          workingHours: '8000',
          repairHours: '1500',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          accessoryData: 'Takım Çantası'
        },
        {
          id: 'MAZ-2019-045',
          machineName: 'Mazak Integrex i-400',
          brand: 'Mazak',
          model: 'Integrex i-400',
          year: '2019',
          operatingSystem: 'Mazatrol',
          serialNumber: 'MAZ-2019-045',
          createdDate: '12.01.2024',
          status: 'Taslak',
          totalCost: 1200000,
          salesPrice: 1200000,
          netProfit: 6800,
          profitMargin: 19.5,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'TRY', amount: 500000 },
            { id: 2, description: 'İşçilik', currency: 'TRY', amount: 700000 }
          ],
          // Machine specifications
          xMovements: '650 MM',
          yMovements: '650 MM',
          zMovements: '800 MM',
          bMovements: '360° / 1°',
          cMovements: '360° / 1°',
          controlUnit: 'Mazatrol Matrix',
          spindleSpeed: '10.000 MIN/-1',
          toolCount: '32',
          holderType: 'BT 50',
          machineDimensions: '2500 x 1800 x 2800 MM',
          machinePower: '22 KW',
          internalCoolant: 'VAR',
          chipConveyor: 'VAR',
          paperFilter: 'VAR',
          maxMaterialWeight: '500 KG',
          machineWeight: '8500 KG',
          operatingHours: '12000',
          otherInfo: 'Çoklu işlem merkezi',
          workingHours: '12000',
          repairHours: '2000',
          teamCount: '3',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Yok',
          insideWaterGiving: 'Var',
          accessoryData: 'Hidrolik Çakma Sistemi'
        },
        {
          id: 'HAAS-2021-012', 
          machineName: 'Haas VF-4SS',
          brand: 'Haas',
          model: 'VF-4SS',
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
          // Machine specifications
          xMovements: '1016 MM',
          yMovements: '508 MM',
          zMovements: '635 MM',
          bMovements: '',
          cMovements: '',
          controlUnit: 'Haas Control',
          spindleSpeed: '8100 MIN/-1',
          toolCount: '20',
          holderType: 'BT 40',
          machineDimensions: '2200 x 1600 x 2400 MM',
          machinePower: '15 KW',
          internalCoolant: 'VAR',
          chipConveyor: 'VAR',
          paperFilter: 'YOK',
          maxMaterialWeight: '450 KG',
          machineWeight: '3200 KG',
          operatingHours: '5000',
          otherInfo: 'Yüksek hızlı işleme',
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
      localStorage.setItem('serviceReceipts', JSON.stringify(demoServices));
    }
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
    // Update the service status to 'Satıldı' (Sold)
    const updatedServices = services.map(s => 
      s.id === service.id ? { ...s, status: 'Satıldı' } : s
    );
    setServices(updatedServices);
    localStorage.setItem('serviceReceipts', JSON.stringify(updatedServices));
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
        <h1>Bütün Projeler</h1>
        <p>Tüm makine servis projelerinizi buradan görüntüleyebilir ve yönetebilirsiniz.</p>
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

            <div className={`card-actions ${service.status === 'Satıldı' ? 'sold-item' : ''}`}>
              {service.status !== 'Satıldı' && (
                <button 
                  className="btn-offer"
                  onClick={() => handleEditClick(service)}
                >
                  <FaPaperPlane className="btn-icon" />
                  Teklif Gönder
                </button>
              )}
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
            {service.status === 'Gönderildi' && (
              <div className="card-actions-secondary">
                <button 
                  className="btn-view-proposals"
                  onClick={() => handleViewProposalsClick(service)}
                >
                  <AiOutlineEye className="btn-icon" />
                  Teklifleri Görüntüle
                </button>
              </div>
            )}
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
