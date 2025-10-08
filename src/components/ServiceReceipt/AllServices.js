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
import './AllServicesTable.css';

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
    // Always load the new mock data for now
    // TODO: Remove this and restore localStorage logic when ready
      // Demo data for initial display (only if no cached data exists)
      const demoServices = [
        {
          id: 'DMG-2020-001',
          machineName: 'DMG MORI NHX5000',
          brand: 'GESAM ASANSÖR',
          model: 'NHX5000',
          year: '2012',
          operatingSystem: 'Mitsubishi M730',
          serialNumber: 'DMG-2020-001',
          createdDate: '07.10.2025',
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
          brand: 'HURON MAKİNA SERVİS VE DIŞ TİC.LTD.ŞTİ',
          model: 'Integrex i-400',
          year: '2019',
          operatingSystem: 'Mazatrol',
          serialNumber: 'MAZ-2019-045',
          createdDate: '06.10.2025',
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
          brand: 'KAAN HAVALI KIRICI MAKİNA OTO.',
          model: 'VF-4SS',
          year: '2021',
          operatingSystem: 'Haas Control',
          serialNumber: 'HAAS-2021-012',
          createdDate: '07.10.2025',
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
        },
        {
          id: 'BOSCH-2022-001',
          machineName: 'Bosch Rexroth LC 483',
          brand: 'HİSARLAR MAKİNA SAN.VE TİC.A.Ş',
          model: 'LC 483',
          year: '2022',
          operatingSystem: 'Bosch Rexroth',
          serialNumber: 'BOSCH-2022-001',
          createdDate: '07.10.2025',
          status: 'Gönderildi',
          totalCost: 18000,
          salesPrice: 25000,
          netProfit: 7000,
          profitMargin: 28.0,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 12000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 6000 }
          ],
          workingHours: '6000',
          repairHours: '1200',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Var',
          accessoryData: 'Hidrolik Sistem'
        },
        {
          id: 'AKIS-2023-002',
          machineName: 'Akış Asansör ECN 1313',
          brand: 'AKIŞ ASANSÖR MAKİNA MOTOR DOKÜM SANAYİ',
          model: 'ECN 1313',
          year: '2023',
          operatingSystem: 'Akış Control',
          serialNumber: 'AKIS-2023-002',
          createdDate: '06.10.2025',
          status: 'Taslak',
          totalCost: 22000,
          salesPrice: 30000,
          netProfit: 8000,
          profitMargin: 26.7,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 15000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 7000 }
          ],
          workingHours: '8000',
          repairHours: '1500',
          teamCount: '3',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Var',
          accessoryData: 'Asansör Sistemi'
        },
        {
          id: 'AKIS-2023-003',
          machineName: 'Akış Asansör ECN 1313',
          brand: 'AKIŞ ASANSÖR MAKİNA MOTOR DOKÜM SANAYİ',
          model: 'ECN 1313',
          year: '2023',
          operatingSystem: 'Akış Control',
          serialNumber: 'AKIS-2023-003',
          createdDate: '06.10.2025',
          status: 'Gönderildi',
          totalCost: 22000,
          salesPrice: 30000,
          netProfit: 8000,
          profitMargin: 26.7,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 15000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 7000 }
          ],
          workingHours: '8000',
          repairHours: '1500',
          teamCount: '3',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Var',
          accessoryData: 'Asansör Sistemi'
        },
        {
          id: 'BOSCH-2024-001',
          machineName: 'Bosch Rexroth LC 483',
          brand: 'BOSCH REXROTH OTOMASYON SAN. TİC. A.Ş.',
          model: 'LC 483',
          year: '2024',
          operatingSystem: 'Bosch Rexroth',
          serialNumber: 'BOSCH-2024-001',
          createdDate: '03.10.2025',
          status: 'Satıldı',
          totalCost: 16000,
          salesPrice: 22000,
          netProfit: 6000,
          profitMargin: 27.3,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 10000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 6000 }
          ],
          workingHours: '7000',
          repairHours: '1300',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Yok',
          insideWaterGiving: 'Var',
          accessoryData: 'Otomasyon Sistemi'
        },
        {
          id: 'BOSCH-2024-002',
          machineName: 'Bosch Rexroth LS 406C',
          brand: 'BOSCH REXROTH OTOMASYON SAN. TİC. A.Ş.',
          model: 'LS 406C',
          year: '2024',
          operatingSystem: 'Bosch Rexroth',
          serialNumber: 'BOSCH-2024-002',
          createdDate: '03.10.2025',
          status: 'Gönderildi',
          totalCost: 14000,
          salesPrice: 20000,
          netProfit: 6000,
          profitMargin: 30.0,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 9000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 5000 }
          ],
          workingHours: '6000',
          repairHours: '1100',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          accessoryData: 'Hidrolik Sistem'
        },
        {
          id: 'ASTE-2024-001',
          machineName: 'Aste Otomotiv LC 181',
          brand: 'ASTE OTOMOTİV YEDEK PARÇA İMALAT SAN.TİC.LTD.ŞTİ',
          model: 'LC 181',
          year: '2024',
          operatingSystem: 'Aste Control',
          serialNumber: 'ASTE-2024-001',
          createdDate: '01.10.2025',
          status: 'Taslak',
          totalCost: 12000,
          salesPrice: 18000,
          netProfit: 6000,
          profitMargin: 33.3,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 8000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 4000 }
          ],
          workingHours: '5000',
          repairHours: '1000',
          teamCount: '2',
          teamMeasurementProbe: 'Yok',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Var',
          accessoryData: 'Otomotiv Sistemi'
        },
        {
          id: 'BOSCH-2024-003',
          machineName: 'Bosch Rexroth LC 483',
          brand: 'BOSCH REXROTH OTOMASYON SAN. TİC. A.Ş.',
          model: 'LC 483',
          year: '2024',
          operatingSystem: 'Bosch Rexroth',
          serialNumber: 'BOSCH-2024-003',
          createdDate: '03.10.2025',
          status: 'Gönderildi',
          totalCost: 16000,
          salesPrice: 22000,
          netProfit: 6000,
          profitMargin: 27.3,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 10000 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 6000 }
          ],
          workingHours: '7000',
          repairHours: '1300',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Yok',
          insideWaterGiving: 'Var',
          accessoryData: 'Otomasyon Sistemi'
        },
        {
          id: 'BOSCH-2024-004',
          machineName: 'Bosch Rexroth LC483',
          brand: 'BOSCH REXROTH OTOMASYON SAN TIC AS',
          model: 'LC483',
          year: '2024',
          operatingSystem: 'Bosch Rexroth',
          serialNumber: 'BOSCH-2024-004',
          createdDate: '03.10.2025',
          status: 'Satıldı',
          totalCost: 15000,
          salesPrice: 21000,
          netProfit: 6000,
          profitMargin: 28.6,
          costDetails: [
            { id: 1, description: 'Malzeme', currency: 'EUR', amount: 9500 },
            { id: 2, description: 'İşçilik', currency: 'EUR', amount: 5500 }
          ],
          workingHours: '6500',
          repairHours: '1200',
          teamCount: '2',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          accessoryData: 'Hidrolik Sistem'
        }
      ];
      setServices(demoServices);
      localStorage.setItem('serviceReceipts', JSON.stringify(demoServices));
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

      <div className="services-table-container">
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
            {services.map((service, index) => (
              <tr key={service.id} className="service-row">
                <td className="form-number">{1082 - index}</td>
                <td className="company-name">{service.brand}</td>
                <td className="device-name">{service.machineName}</td>
                <td className="start-date">{service.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
