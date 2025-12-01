import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ProfitAnalysisModal from './ProfitAnalysisModal';
import ProposalInformationModal from './ProposalInformationModal';
import CostInformationModal from './CostInformationModal';
import projectService from '../../services/projectService';
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
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, projectId: null });

  // Fetch projects with SOLD status from API
  useEffect(() => {
    const fetchClosedProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectsByStatus('SOLD');

        // Fetch detailed information for each project to get sentToAccounting status
        const projectsWithDetails = await Promise.all(
          data.map(async (project) => {
            try {
              const detailedProject = await projectService.getProjectById(project.id);
              return { ...project, sentToAccounting: detailedProject.sentToAccounting || false };
            } catch (error) {
              console.error(`Error fetching details for project ${project.id}:`, error);
              return { ...project, sentToAccounting: false };
            }
          })
        );

        // Transform API data to align center card fields with MainMenu
        const transformedServices = projectsWithDetails.map(project => {
          const cleanTitle = (title) => {
            if (!title || title === 'N/A') return title;
            return title.replace(/\s*\([^)]*\)\s*/g, '').trim();
          };
          const machineTitle = cleanTitle(project.title || project.machineName || project.projectCode);
          const operatingSystem = project.model || project.operatingSystem || project.controlUnit || 'N/A';
          const year = project.year || (project.createdAt ? new Date(project.createdAt).getFullYear().toString() : 'N/A');

          return {
            id: project.id,
            machineName: project.projectCode,
            machineTitle,
            operatingSystem,
            year,
            serialNumber: project.serialNumber,
            createdDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : '-',
            status: 'ONAYLANDI',
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
            accessoryData: project.additionalEquipment || '-',
            sentToAccounting: project.sentToAccounting || false
          };
        });

        setServices(transformedServices);
      } catch (err) {
        console.error('Error fetching closed projects:', err);
        setError(err.message || 'Kapatılan projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchClosedProjects();
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

  const handleProposalInfoClick = (service) => {
    setSelectedService(service);
    setIsProposalModalOpen(true);
  };

  const handleCostInfoClick = (service) => {
    setSelectedService(service);
    setIsCostModalOpen(true);
  };

  const handleSeeCostAll = () => {
    // Handle "See Cost" for all projects
    console.log('See Cost for all closed projects');
  };

  const handleSubmitInformationAll = () => {
    // Handle "Submit Information" for all projects
    console.log('Submit Information for all closed projects');
  };

  const handleAccountingToggle = (service) => {
    // Don't allow toggling if already sent to accounting
    if (service.sentToAccounting) {
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({ show: true, projectId: service.id });
  };

  const handleConfirmAccounting = async () => {
    const projectId = confirmDialog.projectId;
    setConfirmDialog({ show: false, projectId: null });

    try {
      await projectService.sentToAccounting(projectId);

      // Update the service in the list to mark it as sent to accounting
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === projectId
            ? { ...service, sentToAccounting: true }
            : service
        )
      );
    } catch (err) {
      console.error('Error sending to accounting:', err);
      alert('Muhasebe gönderimi sırasında bir hata oluştu: ' + err.message);
    }
  };

  const handleCancelAccounting = () => {
    setConfirmDialog({ show: false, projectId: null });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Gönderildi':
        return 'status-sent';
      case 'Taslak':
        return 'status-draft';
      case 'Onaylandı':
        return 'status-approved';
      case 'ONAYLANDI':
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
        <h1>Tamamlanan Projeler</h1>
        <p>Satılmış ve tamamlanmış projelerinizi buradan görüntüleyebilirsiniz.</p>
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

      {!loading && !error && services.length === 0 && (
        <div className="empty-state">
          <p>Tamamlanmış proje bulunmamaktadır.</p>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <>
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
                    <AiOutlineSetting className="detail-icon" />
                    <span className="detail-value">{service.operatingSystem}</span>
                    <span className="detail-value">{service.machineTitle}</span>
                    <AiOutlineCalendar className="detail-icon" />
                    <span className="detail-value">{service.year}</span>
                  </div>

                  <div className="accounting-toggle-row">
                    <label className="accounting-toggle-label">
                      Muhasebe Onayı:
                    </label>
                    <div
                      className={`accounting-toggle ${service.sentToAccounting ? 'active' : 'inactive'} ${service.sentToAccounting ? 'disabled' : ''}`}
                      onClick={() => handleAccountingToggle(service)}
                    >
                      <div className="toggle-slider"></div>
                    </div>
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
                    className="btn-proposal-info"
                    onClick={() => handleProposalInfoClick(service)}
                  >
                    <FaPaperPlane className="btn-icon" />
                    Teklif
                  </button>
                  <button
                    className="btn-cost-info"
                    onClick={() => handleCostInfoClick(service)}
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
        </>
      )}

      {isModalOpen && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setIsModalOpen(false)}
          isCompletedProject={true}
        />
      )}

      {isProposalModalOpen && selectedService && (
        <ProposalInformationModal
          service={selectedService}
          onClose={() => setIsProposalModalOpen(false)}
        />
      )}

      {isCostModalOpen && selectedService && (
        <CostInformationModal
          service={selectedService}
          onClose={() => setIsCostModalOpen(false)}
        />
      )}

      {confirmDialog.show && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Muhasebe Onayı</h3>
            <p>Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?</p>
            <div className="confirmation-actions">
              <button
                className="btn-cancel"
                onClick={handleCancelAccounting}
              >
                İptal
              </button>
              <button
                className="btn-confirm"
                onClick={handleConfirmAccounting}
              >
                Evet, Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosedProjects;
