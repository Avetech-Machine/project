import React, { useState } from 'react';
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
import './MainMenu.css';

const MainMenu = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSendOfferModalOpen, setIsSendOfferModalOpen] = useState(false);

  // Mock data for the dashboard cards
  const dashboardStats = [
    {
      title: 'Kapanan Projeler',
      count: 1,
      icon: FaFileInvoice,
      color: 'green'
    },
    {
      title: 'Teklif Gönderilen Projeler',
      count: 1,
      icon: FaPaperPlane,
      color: 'blue'
    }
  ];

  // Mock data for the services cards - converted from table data
  const serviceData = [
    {
      id: '927',
      machineName: 'LF 426CB',
      year: '2025',
      operatingSystem: 'CNC',
      serialNumber: 'LF-426CB-927',
      createdDate: '26.08.2025',
      status: 'TAMAMLANMIŞ',
      totalCost: 15500,
      salesPrice: 22000,
      netProfit: 6500,
      profitMargin: 29.5,
      costDetails: [
        { id: 1, description: 'Servis', currency: 'EUR', amount: 15500 }
      ],
      workingHours: '8000',
      repairHours: '1500',
      teamCount: '2',
      teamMeasurementProbe: 'Var',
      partMeasurementProbe: 'Var',
      insideWaterGiving: 'Yok',
      accessoryData: 'Takım Çantası',
      firmName: 'Durendus Pres İmlt. San. ve Tic. Ltd. Şti.',
      technician: 'Suat Çınar',
      // Additional technical details for ServiceDetailsModal
      brand: 'LF',
      model: '426CB',
      controlUnit: 'CNC',
      xMovements: '426 mm',
      yMovements: '320 mm',
      zMovements: '320 mm',
      bMovements: '360°',
      cMovements: '360°',
      spindleSpeed: '8000 rpm',
      toolCount: '24',
      holderType: 'BT40',
      machineDimensions: '1200 x 800 x 1800 mm',
      machinePower: '15 kW',
      internalCoolant: 'Var',
      chipConveyor: 'Var',
      paperFilter: 'Var',
      maxMaterialWeight: '500 kg',
      machineWeight: '2500 kg',
      operatingHours: '8000 saat',
      otherInfo: 'Takım Çantası dahil'
    },
    {
      id: '926',
      machineName: 'ROD 426/2500',
      year: '2025',
      operatingSystem: 'CNC',
      serialNumber: 'ROD-426-926',
      createdDate: '22.08.2025',
      status: 'TAMAMLANMIŞ',
      totalCost: 12000,
      salesPrice: 18000,
      netProfit: 6000,
      profitMargin: 33.3,
      costDetails: [
        { id: 1, description: 'Servis', currency: 'EUR', amount: 12000 }
      ],
      workingHours: '12000',
      repairHours: '2000',
      teamCount: '3',
      teamMeasurementProbe: 'Var',
      partMeasurementProbe: 'Yok',
      insideWaterGiving: 'Var',
      accessoryData: 'Hidrolik Çakma Sistemi',
      firmName: 'ADS AYHAN DIŞLI SAN. VE DIŞ. TİC. LTD. ŞTİ.',
      technician: 'Suat Çınar',
      // Additional technical details for ServiceDetailsModal
      brand: 'ROD',
      model: '426/2500',
      controlUnit: 'CNC',
      xMovements: '426 mm',
      yMovements: '2500 mm',
      zMovements: '400 mm',
      bMovements: '360°',
      cMovements: '360°',
      spindleSpeed: '6000 rpm',
      toolCount: '32',
      holderType: 'BT50',
      machineDimensions: '1500 x 3000 x 2200 mm',
      machinePower: '22 kW',
      internalCoolant: 'Var',
      chipConveyor: 'Var',
      paperFilter: 'Var',
      maxMaterialWeight: '800 kg',
      machineWeight: '3500 kg',
      operatingHours: '12000 saat',
      otherInfo: 'Hidrolik Çakma Sistemi dahil'
    },
    {
      id: '925',
      machineName: 'TS 460 EXCHANGE SE 660',
      year: '2025',
      operatingSystem: 'CNC',
      serialNumber: 'TS-460-925',
      createdDate: '22.08.2025',
      status: 'TAMAMLANMIŞ',
      totalCost: 15000,
      salesPrice: 15000,
      netProfit: 4000,
      profitMargin: 26.7,
      costDetails: [
        { id: 1, description: 'Exchange', currency: 'EUR', amount: 15000 }
      ],
      workingHours: '5000',
      repairHours: '800',
      teamCount: '2',
      teamMeasurementProbe: 'Yok',
      partMeasurementProbe: 'Var',
      insideWaterGiving: 'Yok',
      accessoryData: 'Otomatik Takım Değiştirici',
      firmName: 'GİMAS GİRGİN MAKİNA İMAL MONTAJ VE MÜH.SAN A.Ş',
      technician: 'Suat Çınar',
      // Additional technical details for ServiceDetailsModal
      brand: 'TS',
      model: '460 EXCHANGE SE 660',
      controlUnit: 'CNC',
      xMovements: '460 mm',
      yMovements: '660 mm',
      zMovements: '400 mm',
      bMovements: '360°',
      cMovements: '360°',
      spindleSpeed: '10000 rpm',
      toolCount: '16',
      holderType: 'BT30',
      machineDimensions: '1000 x 1200 x 1600 mm',
      machinePower: '12 kW',
      internalCoolant: 'Yok',
      chipConveyor: 'Var',
      paperFilter: 'Var',
      maxMaterialWeight: '300 kg',
      machineWeight: '1800 kg',
      operatingHours: '5000 saat',
      otherInfo: 'Otomatik Takım Değiştirici dahil'
    },
    {
      id: '924',
      machineName: 'MC 420 CC 422',
      year: '2025',
      operatingSystem: 'CNC',
      serialNumber: 'MC-420-924',
      createdDate: '22.08.2025',
      status: 'TEKLİF GÖNDERİLECEK',
      totalCost: 18000,
      salesPrice: 18000,
      netProfit: 6000,
      profitMargin: 33.3,
      costDetails: [
        { id: 1, description: 'Servis', currency: 'EUR', amount: 18000 }
      ],
      workingHours: '10000',
      repairHours: '1800',
      teamCount: '3',
      teamMeasurementProbe: 'Var',
      partMeasurementProbe: 'Var',
      insideWaterGiving: 'Var',
      accessoryData: 'Takım Çantası',
      firmName: 'DMG MORI İSTANBUL MAKİNE TİC.LTD.ŞTİ',
      technician: 'Suat Çınar',
      // Additional technical details for ServiceDetailsModal
      brand: 'MC',
      model: '420 CC 422',
      controlUnit: 'CNC',
      xMovements: '420 mm',
      yMovements: '422 mm',
      zMovements: '350 mm',
      bMovements: '360°',
      cMovements: '360°',
      spindleSpeed: '12000 rpm',
      toolCount: '20',
      holderType: 'BT40',
      machineDimensions: '1100 x 900 x 1900 mm',
      machinePower: '18 kW',
      internalCoolant: 'Var',
      chipConveyor: 'Var',
      paperFilter: 'Var',
      maxMaterialWeight: '400 kg',
      machineWeight: '2200 kg',
      operatingHours: '10000 saat',
      otherInfo: 'Takım Çantası dahil'
    },
    {
      id: '923',
      machineName: 'LS 486C / 820 mm',
      year: '2025',
      operatingSystem: 'CNC',
      serialNumber: 'LS-486C-923',
      createdDate: '22.08.2025',
      status: 'TEKLİF GÖNDERİLECEK',
      totalCost: 16000,
      salesPrice: 16000,
      netProfit: 5000,
      profitMargin: 31.3,
      costDetails: [
        { id: 1, description: 'Servis', currency: 'EUR', amount: 16000 }
      ],
      workingHours: '9000',
      repairHours: '1600',
      teamCount: '2',
      teamMeasurementProbe: 'Yok',
      partMeasurementProbe: 'Var',
      insideWaterGiving: 'Yok',
      accessoryData: 'Hidrolik Çakma Sistemi',
      firmName: 'DMG MORI İSTANBUL MAKİNE TİC.LTD.ŞTİ',
      technician: 'Muhammet Tayyip Yormaz',
      // Additional technical details for ServiceDetailsModal
      brand: 'LS',
      model: '486C / 820 mm',
      controlUnit: 'CNC',
      xMovements: '486 mm',
      yMovements: '820 mm',
      zMovements: '380 mm',
      bMovements: '360°',
      cMovements: '360°',
      spindleSpeed: '9000 rpm',
      toolCount: '18',
      holderType: 'BT40',
      machineDimensions: '1300 x 1000 x 2000 mm',
      machinePower: '16 kW',
      internalCoolant: 'Yok',
      chipConveyor: 'Var',
      paperFilter: 'Var',
      maxMaterialWeight: '600 kg',
      machineWeight: '2800 kg',
      operatingHours: '9000 saat',
      otherInfo: 'Hidrolik Çakma Sistemi dahil'
    },
    
  ];

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
        return 'status-approved';
      case 'TEKLİF GÖNDERİLECEK':
        return 'status-draft';
      case 'EXCHANGE CIHAZ TEKLİFİ':
        return 'status-sent';
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
              <div className="stat-count">{stat.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Section */}
      <div className="services-section">
        <div className="section-header">
          <h2>Son Projeler</h2>
        </div>

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
