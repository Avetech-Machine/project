import React, { useState, useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);
  const lastProjectIdRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = isOpen;

    if (isOpen && projectId) {
      // Only reload if projectId actually changed
      const projectIdChanged = lastProjectIdRef.current !== projectId;

      if (projectIdChanged) {
        // Clear previous data only if projectId changed
        setOffers([]);
        setProjectsDetails({});
        setError('');
        lastProjectIdRef.current = projectId;
        loadOffers();
      } else if (lastProjectIdRef.current === null) {
        // First time loading for this modal session
        lastProjectIdRef.current = projectId;
        loadOffers();
      }
      // If projectId hasn't changed and we've already loaded, do nothing
    } else if (!isOpen) {
      // Clear data when modal closes
      setOffers([]);
      setProjectsDetails({});
      setError('');
      setLoading(false);
      lastProjectIdRef.current = null;
    }

    return () => {
      if (!isOpen) {
        isMountedRef.current = false;
      }
    };
  }, [isOpen, projectId]);

  const loadOffers = async () => {
    // Don't load if modal is not open or projectId is missing
    if (!isOpen || !projectId) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Load offers for the project
      const offersData = await offerService.getOffersByProject(projectId);

      // Only update state if modal is still open
      if (!isMountedRef.current || !isOpen) {
        return;
      }

      setOffers(offersData);

      // Load project details for each offer using offer.projectId
      const projectDetailsMap = {};
      const projectPromises = offersData.map(async (offer) => {
        try {
          const projectData = await projectService.getProjectById(offer.projectId);
          // Check again if modal is still open before updating
          if (isMountedRef.current && isOpen) {
            projectDetailsMap[offer.id] = projectData;
          }
        } catch (projectError) {
          // Silently handle individual project detail errors
          // Don't show error for missing project details, just mark as null
          // This prevents "Proje bulunamadı" errors from showing up
          if (isMountedRef.current && isOpen) {
            projectDetailsMap[offer.id] = null;
          }
        }
      });

      // Wait for all project details to load
      await Promise.all(projectPromises);

      // Only update state if modal is still open
      if (isMountedRef.current && isOpen) {
        setProjectsDetails(projectDetailsMap);
      }
    } catch (err) {
      // Only show error if modal is still open
      if (isMountedRef.current && isOpen) {
        console.error('Error loading offers:', err);
        // Don't show "Proje bulunamadı" or project-related errors
        // Only show general loading errors
        const errorMessage = err.message || 'Teklifler yüklenirken bir hata oluştu';
        if (errorMessage.includes('bulunamadı') || errorMessage.toLowerCase().includes('project') || errorMessage.toLowerCase().includes('proje')) {
          // For project-related errors, just show empty state without error message
          setOffers([]);
          setError('');
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      if (isMountedRef.current && isOpen) {
        setLoading(false);
      }
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

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return 'Belirtilmemiş';
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  // Helper function to parse description and separate offer note from sales note
  const parseDescription = (description) => {
    if (!description) return { offerNote: '', salesNote: '' };

    // Check if description contains "Satış Notu" heading
    const salesNoteIndex = description.indexOf('Satış Notu');

    if (salesNoteIndex === -1) {
      // No sales note found, entire description is offer note
      return { offerNote: description.trim(), salesNote: '' };
    }

    // Split at "Satış Notu"
    const offerNote = description.substring(0, salesNoteIndex).trim();
    // Get everything after "Satış Notu\n"
    const salesNote = description.substring(salesNoteIndex + 'Satış Notu'.length).trim();

    return { offerNote, salesNote };
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
                        Teklif
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
                            {formatCurrency(offer.price, 'EUR')}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Müşteri:</span>
                          <span className="info-value">{offer.clientCompanyName}</span>
                        </div>
                        {projectsDetails[offer.id].totalCost && (
                          <div className="info-item">
                            <span className="info-label">Toplam Maliyet:</span>
                            <span className="info-value cost">{formatCurrency(projectsDetails[offer.id].totalCost, 'EUR')}</span>
                          </div>
                        )}
                        {projectsDetails[offer.id].salesPrice && (
                          <div className="info-item">
                            <span className="info-label">Satış Fiyatı:</span>
                            <span className="info-value sales">{formatCurrency(projectsDetails[offer.id].salesPrice, 'EUR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Description Section - matching ProposalInformationModal layout */}
                      {offer.description && (() => {
                        const { offerNote, salesNote } = parseDescription(offer.description);
                        return (
                          <>
                            {offerNote && (
                              <div className="offer-description">
                                <div className="description-header">
                                  <AiOutlineFileText className="detail-icon" />
                                  <span className="description-label">Teklif Notu:</span>
                                </div>
                                <div className="description-content">
                                  {offerNote}
                                </div>
                              </div>
                            )}
                            {salesNote && (
                              <div className="offer-description">
                                <div className="description-header">
                                  <AiOutlineFileText className="detail-icon" />
                                  <span className="description-label">Satış Notu:</span>
                                </div>
                                <div className="description-content">
                                  {salesNote}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : loading ? (
                    <div className="project-loading">
                      <p>Proje detayları yükleniyor...</p>
                    </div>
                  ) : (
                    <div className="project-loading">
                      <p>Proje detayları mevcut değil</p>
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
