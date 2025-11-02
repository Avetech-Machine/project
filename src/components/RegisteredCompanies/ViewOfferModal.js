import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser, AiOutlineProject } from 'react-icons/ai';
import offerService from '../../services/offerService';
import projectService from '../../services/projectService';
import '../ServiceReceipt/ViewOfferModal.css';

const ViewOfferModal = ({ isOpen, onClose, clientId, clientName }) => {
  const [offers, setOffers] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && clientId) {
      loadOffers();
    }
  }, [isOpen, clientId]);

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
      const offersData = await offerService.getOffersByClient(clientId);
      setOffers(offersData);
      
      // Load project details for each unique project
      const uniqueProjectIds = [...new Set(offersData.map(offer => offer.projectId))];
      const projectDetailsPromises = uniqueProjectIds.map(async (projectId) => {
        try {
          const projectData = await projectService.getProjectById(projectId);
          return { projectId, projectData };
        } catch (err) {
          console.error(`Error loading project ${projectId}:`, err);
          return { projectId, projectData: null };
        }
      });
      
      const projectDetailsResults = await Promise.all(projectDetailsPromises);
      const projectDetailsMap = {};
      projectDetailsResults.forEach(({ projectId, projectData }) => {
        projectDetailsMap[projectId] = projectData;
      });
      
      setProjectDetails(projectDetailsMap);
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
    setProjectDetails({});
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
            Teklifler - {clientName}
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
              <p>Bu müşteri için gönderilmiş teklif bulunmuyor.</p>
            </div>
          ) : (
            <div className="offers-list">
              {offers.map((offer) => {
                const project = projectDetails[offer.projectId];
                return (
                  <div key={offer.id} className="offer-card">
                    <div className="offer-header">
                      <div className="offer-info">
                        <h3>
                          <AiOutlineProject className="offer-icon" />
                          {offer.projectCode}
                        </h3>
                        <div className="offer-meta">
                          <span className="offer-date">
                            <AiOutlineCalendar className="date-icon" />
                            {formatDate(offer.sentAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {project ? (
                      <div className="project-details">
                        <h4>Proje Detayları</h4>
                        <div className="project-info-grid">
                          <div className="info-item">
                            <span className="info-label">Proje Adı:</span>
                            <span className="info-value">{project.projectCode || 'Belirtilmemiş'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Fiyat:</span>
                            <span className="info-value price">
                              {(() => {
                                const basePrice = extractBasePrice(project.priceDetails);
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
                          {project.description && (
                            <div className="info-item full-width">
                              <span className="info-label">Açıklama:</span>
                              <span className="info-value">{project.description}</span>
                            </div>
                          )}
                          {project.totalCost && (
                            <div className="info-item">
                              <span className="info-label">Toplam Maliyet:</span>
                              <span className="info-value cost">{project.totalCost} TL</span>
                            </div>
                          )}
                          {project.salesPrice && (
                            <div className="info-item">
                              <span className="info-label">Satış Fiyatı:</span>
                              <span className="info-value sales">{project.salesPrice} TL</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="project-loading">
                        <p>Proje detayları yükleniyor...</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOfferModal;
