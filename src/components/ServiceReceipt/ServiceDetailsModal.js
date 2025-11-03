import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineEdit, AiOutlineDownload } from 'react-icons/ai';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import EditProjectModal from './EditProjectModal';
import './ServiceDetailsModal.css';

const ServiceDetailsModal = ({ service, onClose, isCompletedProject = false }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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

  const handleDownload = async () => {
    if (!service?.id) {
      alert('Proje ID bulunamadı');
      return;
    }

    try {
      setDownloading(true);
      const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/api/pdf/machines/${service.id}/info`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'PDF indirilirken bir hata oluştu');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `makine-bilgi-${service.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(err.message || 'PDF indirilirken bir hata oluştu');
    } finally {
      setDownloading(false);
    }
  };

  const handlePhotoClick = (index = 0) => {
    setSelectedPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  const handleClosePhotoGallery = () => {
    setShowPhotoGallery(false);
  };

  const handlePhotoGalleryOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePhotoGallery();
    }
  };

  const handlePreviousPhoto = () => {
    const photos = projectDetails?.photos || [];
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    const photos = projectDetails?.photos || [];
    setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
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
          <div className="edit-button-container">
            <button className="edit-button" onClick={handleEditClick}>
                <AiOutlineEdit className="button-icon" />
                Düzenle
            </button>
            <button 
              className="download-button" 
              onClick={handleDownload}
              disabled={downloading}
            >
                <AiOutlineDownload className="button-icon" />
                {downloading ? 'İndiriliyor...' : 'İndir'}
            </button>
          </div>
        )}

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
                  <span className="spec-label">Devir:</span>
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
                  <span className="spec-value">{projectDetails.xmovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Y Hareketi:</span>
                  <span className="spec-value">{projectDetails.ymovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Z Hareketi:</span>
                  <span className="spec-value">{projectDetails.zmovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">B Hareketi:</span>
                  <span className="spec-value">{projectDetails.bmovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">C Hareketi:</span>
                  <span className="spec-value">{projectDetails.cmovement || '-'}</span>
                </div>
                
                <div className="spec-row">
                  <span className="spec-label">Tutucu Türü:</span>
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
              {projectDetails.photos && projectDetails.photos.length > 0 ? (
                <div 
                  className="machine-image-container"
                  onClick={() => handlePhotoClick(0)}
                >
                  <img 
                    src={projectDetails.photos[0]} 
                    alt={projectDetails.machineName || 'Makine Görseli'}
                    className="machine-image"
                  />
                  {projectDetails.photos.length > 1 && (
                    <div className="photo-count-badge">
                      +{projectDetails.photos.length - 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="machine-image-placeholder">
                  <div className="image-placeholder-text">
                    <span>Makine Görseli</span>
                    <small>{projectDetails.machineName}</small>
                  </div>
                </div>
              )}
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

      {/* Photo Gallery Modal */}
      {showPhotoGallery && projectDetails?.photos && projectDetails.photos.length > 0 && (
        <div className="photo-gallery-overlay" onClick={handlePhotoGalleryOverlayClick}>
          <div className="photo-gallery-content" onClick={(e) => e.stopPropagation()}>
            <div className="photo-gallery-header">
              <h3>Makine Fotoğrafları</h3>
              <button className="photo-gallery-close" onClick={handleClosePhotoGallery}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="photo-gallery-body">
              <button 
                className="photo-gallery-nav photo-gallery-prev" 
                onClick={handlePreviousPhoto}
                disabled={projectDetails.photos.length <= 1}
              >
                ‹
              </button>
              <div className="photo-gallery-main-image">
                <img 
                  src={projectDetails.photos[selectedPhotoIndex]} 
                  alt={`Makine Fotoğrafı ${selectedPhotoIndex + 1}`}
                />
              </div>
              <button 
                className="photo-gallery-nav photo-gallery-next" 
                onClick={handleNextPhoto}
                disabled={projectDetails.photos.length <= 1}
              >
                ›
              </button>
            </div>
            {projectDetails.photos.length > 1 && (
              <div className="photo-gallery-footer">
                <span className="photo-gallery-counter">
                  {selectedPhotoIndex + 1} / {projectDetails.photos.length}
                </span>
                <div className="photo-gallery-thumbnails">
                  {projectDetails.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className={`photo-thumbnail ${selectedPhotoIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedPhotoIndex(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsModal;
