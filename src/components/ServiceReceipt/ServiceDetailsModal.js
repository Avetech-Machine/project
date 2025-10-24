import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineEdit } from 'react-icons/ai';
import projectService from '../../services/projectService';
import EditProjectModal from './EditProjectModal';
import './ServiceDetailsModal.css';

const ServiceDetailsModal = ({ service, onClose, isCompletedProject = false }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!service?.id) {
        setError('Proje ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProjectById(service.id);
        setProjectDetails(data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'Proje detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [service?.id]);

  if (!service) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleEditSaveComplete = (updatedProject) => {
    // Refresh the project details after successful edit
    if (service?.id) {
      const fetchUpdatedDetails = async () => {
        try {
          const data = await projectService.getProjectById(service.id);
          setProjectDetails(data);
        } catch (err) {
          console.error('Error refreshing project details:', err);
        }
      };
      fetchUpdatedDetails();
    }
    setShowEditModal(false);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>MAKİNE BİLGİ FORMU</h2>
          <button className="close-button" onClick={onClose}>
            <AiOutlineClose />
          </button>
        </div>
        
        {!isCompletedProject && (
          <div class="edit-button-container">
            <button class="edit-button" onClick={handleEditClick}>
                Düzenle
            </button>
          </div>
        )}

    <div class="modal-body">
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <p>Proje detayları yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Hata: {error}</p>
            </div>
          )}

          {!loading && !error && projectDetails && (
            <div className="machine-info-container">
              {/* Left side - Machine specifications */}
              <div className="machine-specifications">
                <div className="machine-identification">
                  <h3 className="machine-title">{projectDetails.machineName}</h3>
                  
                  <div className="spec-row">
                    <span className="spec-label">Proje Kodu:</span>
                    <span className="spec-value">{projectDetails.projectCode || '-'}</span>
                  </div>
                  
                  <div className="spec-row">
                    <span className="spec-label">Marka:</span>
                    <span className="spec-value">{projectDetails.make || '-'}</span>
                  </div>
                  
                  <div className="spec-row">
                    <span className="spec-label">Model:</span>
                    <span className="spec-value">{projectDetails.model || '-'}</span>
                  </div>
                  
                  <div className="spec-row">
                    <span className="spec-label">Üretim Yılı:</span>
                    <span className="spec-value">{projectDetails.year || '-'}</span>
                  </div>
                  
                  <div className="spec-row">
                    <span className="spec-label">Seri Numarası:</span>
                    <span className="spec-value">{projectDetails.serialNumber || '-'}</span>
                  </div>
                  
                  <div className="spec-row">
                    <span className="spec-label">Kontrol Ünitesi:</span>
                    <span className="spec-value">{projectDetails.operatingSystem || '-'}</span>
                  </div>
                </div>

              <div className="technical-details">
                <h4>Teknik Detaylar</h4>
                
                <div className="spec-row">
                  <span className="spec-label">Çalışma Saati:</span>
                  <span className="spec-value">{projectDetails.hoursOperated || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">RPM:</span>
                  <span className="spec-value">{projectDetails.rpm || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Takım Sayısı:</span>
                  <span className="spec-value">{projectDetails.takimSayisi || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Net Ağırlık:</span>
                  <span className="spec-value">{projectDetails.netWeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Ek Ağırlık:</span>
                  <span className="spec-value">{projectDetails.additionalWeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Anahtar Bilgisi:</span>
                  <span className="spec-value">{projectDetails.anahtarBilgisi || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Takım Ölçme Probu:</span>
                  <span className="spec-value">{projectDetails.takimOlcmeProbu ? 'Var' : 'Yok'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Parça Ölçme Probu:</span>
                  <span className="spec-value">{projectDetails.parcaOlcmeProbu ? 'Var' : 'Yok'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">İçten Su Verme:</span>
                  <span className="spec-value">{projectDetails.ictenSuVerme ? 'Var' : 'Yok'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Konveyör:</span>
                  <span className="spec-value">{projectDetails.konveyor ? 'Var' : 'Yok'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Kağıt Filtre:</span>
                  <span className="spec-value">{projectDetails.kagitFiltre ? 'Var' : 'Yok'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">X Hareketi:</span>
                  <span className="spec-value">{projectDetails.xMovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Y Hareketi:</span>
                  <span className="spec-value">{projectDetails.yMovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Z Hareketi:</span>
                  <span className="spec-value">{projectDetails.zMovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">B Hareketi:</span>
                  <span className="spec-value">{projectDetails.bMovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">C Hareketi:</span>
                  <span className="spec-value">{projectDetails.cMovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Gripper Tipi:</span>
                  <span className="spec-value">{projectDetails.holderType || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Genişliği:</span>
                  <span className="spec-value">{projectDetails.machineWidth || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Uzunluğu:</span>
                  <span className="spec-value">{projectDetails.machineLength || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Yüksekliği:</span>
                  <span className="spec-value">{projectDetails.machineHeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Maksimum Malzeme Ağırlığı:</span>
                  <span className="spec-value">{projectDetails.maxMaterialWeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Ek Ekipman:</span>
                  <span className="spec-value">{projectDetails.additionalEquipment || '-'}</span>
                </div>
                
                
              </div>
            </div>

            {/* Right side - Machine image */}
            <div className="machine-image-section">
              <div className="machine-image-placeholder">
                <div className="image-placeholder-text">
                  <span>Makine Görseli</span>
                  <small>{projectDetails.machineName}</small>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && projectDetails && (
        <EditProjectModal
          project={projectDetails}
          onClose={handleEditModalClose}
          onSaveComplete={handleEditSaveComplete}
        />
      )}
    </div>
  );
};

export default ServiceDetailsModal;
