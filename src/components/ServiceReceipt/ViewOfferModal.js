import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser, AiOutlineProject, AiOutlineDollar } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import offerService from '../../services/offerService';
import projectService from '../../services/projectService';
import './ViewOfferModal.css';

const ViewOfferModal = ({ isOpen, onClose, projectId, projectCode, onCreateSale }) => {
  const [offers, setOffers] = useState([]);
  const [projectsDetails, setProjectsDetails] = useState({}); // Store project details by offer id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      loadOffers();
    }
  }, [isOpen, projectId]);

  // Expose loadOffers function for parent components to trigger refresh
  useEffect(() => {
    if (isOpen) {
      // Refresh offers when modal opens
      loadOffers();
    }
  }, [isOpen]);

  // Helper function to extract base price from priceDetails string
  const extractBasePrice = (priceDetails) => {
    if (!priceDetails || typeof priceDetails !== 'string') {
      return null;
    }
    
    // Parse format: "Base price: 20000, Total cost: 10200, Net profit: 9800"
    const match = priceDetails.match(/Base price:\s*([\d,]+\.?\d*)/);
    if (match && match[1]) {
      // Remove commas and convert to number
      const priceValue = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(priceValue) ? null : priceValue;
    }
    
    return null;
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load offers for the project
      const offersData = await offerService.getOffersByProject(projectId);
      setOffers(offersData);
      
      // Load project details for each offer using offer.projectId
      const projectDetailsMap = {};
      const projectPromises = offersData.map(async (offer) => {
        try {
          const projectData = await projectService.getProjectById(offer.projectId);
          projectDetailsMap[offer.id] = projectData;
        } catch (projectError) {
          console.error(`Error loading project details for offer ${offer.id}:`, projectError);
          projectDetailsMap[offer.id] = null;
        }
      });
      
      // Wait for all project details to load
      await Promise.all(projectPromises);
      setProjectsDetails(projectDetailsMap);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError(err.message || 'Teklifler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleClose = () => {
    setOffers([]);
    setProjectsDetails({});
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="view-offer-modal-overlay">
      <div className="view-offer-modal">
        <div className="modal-header">
          <h2>
            <AiOutlineFileText className="header-icon" />
            Proje Teklifleri - {projectCode}
          </h2>
          <button className="close-button" onClick={handleClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Teklifler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Hata</h3>
              <p>{error}</p>
              <button onClick={loadOffers} className="retry-button">
                Tekrar Dene
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="empty-state">
              <AiOutlineFileText className="empty-icon" />
              <h3>Henüz teklif bulunmuyor</h3>
              <p>Bu proje için gönderilmiş teklif bulunmuyor.</p>
            </div>
          ) : (
            <div className="offers-list">
              {offers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-header">
                    <div className="offer-info">
                      <h3>
                        <AiOutlineProject className="offer-icon" />
                        Teklif #{offer.id}
                      </h3>
                      <div className="offer-meta">
                        <span className="offer-id">Proje Kodu: {offer.projectCode}</span>
                        <span className="offer-date">
                          <AiOutlineCalendar className="date-icon" />
                          Gönderilme Tarihi: {formatDate(offer.sentAt)}
                        </span>
                        <span className="offer-date">
                          <AiOutlineUser className="date-icon" />
                          Müşteri: {offer.clientCompanyName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {projectsDetails[offer.id] ? (
                    <div className="project-details">
                      <h4>Proje Detayları</h4>
                      <div className="project-info-grid">
                        <div className="info-item">
                          <span className="info-label">Proje Kodu:</span>
                          <span className="info-value">{projectsDetails[offer.id].projectCode || 'Belirtilmemiş'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Fiyat:</span>
                          <span className="info-value price">
                            {(() => {
                              const basePrice = extractBasePrice(projectsDetails[offer.id].priceDetails);
                              return basePrice !== null 
                                ? `${basePrice.toLocaleString('tr-TR')} TL` 
                                : 'Belirtilmemiş';
                            })()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Müşteri:</span>
                          <span className="info-value">{offer.clientCompanyName}</span>
                        </div>
                        {projectsDetails[offer.id].description && (
                          <div className="info-item full-width">
                            <span className="info-label">Açıklama:</span>
                            <span className="info-value">{projectsDetails[offer.id].description}</span>
                          </div>
                        )}
                        {projectsDetails[offer.id].totalCost && (
                          <div className="info-item">
                            <span className="info-label">Toplam Maliyet:</span>
                            <span className="info-value cost">{projectsDetails[offer.id].totalCost} TL</span>
                          </div>
                        )}
                        {projectsDetails[offer.id].salesPrice && (
                          <div className="info-item">
                            <span className="info-label">Satış Fiyatı:</span>
                            <span className="info-value sales">{projectsDetails[offer.id].salesPrice} TL</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="project-loading">
                      <p>Proje detayları yükleniyor...</p>
                    </div>
                  )}

                  <div className="offer-actions">
                    <button 
                      className="create-sale-btn"
                      onClick={() => onCreateSale(offer)}
                      title="Bu teklif için satış oluştur"
                    >
                      <FaHandshake className="btn-icon" />
                      Satış Oluştur
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOfferModal;
