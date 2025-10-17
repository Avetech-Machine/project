import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import projectService from '../../services/projectService';
import './ServiceDetailsModal.css';

const ServiceDetailsModal = ({ service, onClose }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>MAKİNE BİLGİ FORMU</h2>
          <button className="close-button" onClick={onClose}>
            <AiOutlineClose />
          </button>
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
                  <span className="spec-label">Ek Ekipman:</span>
                  <span className="spec-value">{projectDetails.additionalEquipment || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Maliyet Detayları:</span>
                  <span className="spec-value">{projectDetails.costDetails || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Fiyat Detayları:</span>
                  <span className="spec-value">{projectDetails.priceDetails || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Durum:</span>
                  <span className="spec-value">{projectDetails.status || '-'}</span>
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
    </div>
  );
};

export default ServiceDetailsModal;
