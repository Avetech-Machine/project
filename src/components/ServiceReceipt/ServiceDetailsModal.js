import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import './ServiceDetailsModal.css';

const ServiceDetailsModal = ({ service, onClose }) => {
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
          <div className="machine-info-container">
            {/* Left side - Machine specifications */}
            <div className="machine-specifications">
              <div className="machine-identification">
                <h3 className="machine-title">{service.machineName}</h3>
                
                <div className="spec-row">
                  <span className="spec-label">Marka:</span>
                  <span className="spec-value">{service.brand || service.machineName.split(' ')[0]}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Model:</span>
                  <span className="spec-value">{service.model || service.machineName.split(' ').slice(1).join(' ')}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Üretim Yılı:</span>
                  <span className="spec-value">{service.year}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Kontrol Ünitesi:</span>
                  <span className="spec-value">{service.controlUnit || service.operatingSystem}</span>
                </div>
              </div>

              <div className="technical-details">
                <h4>Teknik Detaylar</h4>
                
                <div className="spec-row">
                  <span className="spec-label">X Hareketleri:</span>
                  <span className="spec-value">{service.xMovements || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Y Hareketleri:</span>
                  <span className="spec-value">{service.yMovements || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Z Hareketleri:</span>
                  <span className="spec-value">{service.zMovements || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">B Hareketleri:</span>
                  <span className="spec-value">{service.bMovements || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">C Hareketleri:</span>
                  <span className="spec-value">{service.cMovements || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Kontrol Ünitesi:</span>
                  <span className="spec-value">{service.controlUnit || service.operatingSystem}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Spindel Devri:</span>
                  <span className="spec-value">{service.spindleSpeed || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Takım Sayısı:</span>
                  <span className="spec-value">{service.toolCount || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Tutucu Türü:</span>
                  <span className="spec-value">{service.holderType || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine En/Boy/Yüks.:</span>
                  <span className="spec-value">{service.machineDimensions || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Elektrik Gücü:</span>
                  <span className="spec-value">{service.machinePower || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Takım İçi Su Verme:</span>
                  <span className="spec-value">{service.internalCoolant || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Talaş Konveyörü:</span>
                  <span className="spec-value">{service.chipConveyor || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Kağıt Filtre:</span>
                  <span className="spec-value">{service.paperFilter || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Max. Malzeme Ağırlığı:</span>
                  <span className="spec-value">{service.maxMaterialWeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Ağırlığı:</span>
                  <span className="spec-value">{service.machineWeight || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Makine Çalışma Saati:</span>
                  <span className="spec-value">{service.operatingHours || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Diğer Bilgiler:</span>
                  <span className="spec-value">{service.otherInfo || '-'}</span>
                </div>
              </div>
            </div>

            {/* Right side - Machine image */}
            <div className="machine-image-section">
              <div className="machine-image-placeholder">
                <div className="image-placeholder-text">
                  <span>Makine Görseli</span>
                  <small>{service.machineName}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
