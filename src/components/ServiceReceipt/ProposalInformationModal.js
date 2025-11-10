import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineEuro, AiOutlineUser, AiOutlineMail, AiOutlineCalendar } from 'react-icons/ai';
import { FaPaperPlane, FaChartLine } from 'react-icons/fa';
import offerService from '../../services/offerService';
import projectService from '../../services/projectService';
import './ProposalInformationModal.css';

const ProposalInformationModal = ({ service, onClose }) => {
  const [offerDetails, setOfferDetails] = useState(null);
  const [costDetails, setCostDetails] = useState(null);
  const [priceDetails, setPriceDetails] = useState(null);
  const [offerPrice, setOfferPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!service?.id) {
        setError('Proje ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch offer details
        const offerData = await offerService.getOffersByProject(service.id);
        setOfferDetails(offerData);
        
        // Extract price from the first available offer
        if (offerData && offerData.length > 0) {
          // Find the first offer with a price, preferring SENT status offers
          const sentOffer = offerData.find(offer => offer.status === 'SENT' && offer.price);
          const anyOfferWithPrice = offerData.find(offer => offer.price);
          const priceToUse = sentOffer?.price || anyOfferWithPrice?.price || null;
          setOfferPrice(priceToUse);
        }
        
        // Fetch cost details
        const costData = await projectService.getProjectCostDetails(service.id);
        setCostDetails(costData.costDetails);
        setPriceDetails(costData.priceDetails);
      } catch (err) {
        console.error('Error fetching proposal data:', err);
        setError(err.message || 'Teklif bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
  }, [service?.id]);

  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse cost details from API response
  const parseCostDetails = (costDetailsString) => {
    if (!costDetailsString) return [];
    
    const items = costDetailsString.split(',').map(item => {
      const [description, currencyAmount] = item.trim().split(':');
      const [currency, amount] = currencyAmount.trim().split(' ');
      return {
        id: Math.random(),
        description: description.trim(),
        currency: currency.trim(),
        amount: isNaN(parseFloat(amount)) ? 0 : parseFloat(amount)
      };
    });
    
    return items;
  };

  // Parse price details from API response
  const parsePriceDetails = (priceDetailsString) => {
    if (!priceDetailsString) return {};
    
    const details = {};
    const items = priceDetailsString.split(',').map(item => {
      const [key, value] = item.trim().split(':');
      return { key: key.trim(), value: value.trim() };
    });
    
    items.forEach(item => {
      const numericValue = parseFloat(item.value) || 0;
      if (item.key.includes('Base price') || item.key.includes('Satış Fiyatı')) {
        details.salesPrice = numericValue;
      } else if (item.key.includes('Total cost') || item.key.includes('Toplam Maliyet')) {
        details.totalCost = numericValue;
      } else if (item.key.includes('Net profit') || item.key.includes('Net Kâr')) {
        details.netProfit = numericValue;
      }
    });
    
    return details;
  };

  const parsedCostDetails = parseCostDetails(costDetails);
  const parsedPriceDetails = parsePriceDetails(priceDetails);
  
  const totalCost = parsedPriceDetails.totalCost || parsedCostDetails.reduce((sum, item) => sum + item.amount, 0);
  // Use price from offer if available, otherwise fallback to parsed price details or service data
  const salesPrice = offerPrice ?? parsedPriceDetails.salesPrice ?? service.salesPrice ?? 0;
  const netProfit = parsedPriceDetails.netProfit || (salesPrice - totalCost);
  const profitMargin = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
        return '#28a745';
      case 'DRAFT':
        return '#ffc107';
      case 'PENDING':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SENT':
        return 'Gönderildi';
      case 'DRAFT':
        return 'Taslak';
      case 'PENDING':
        return 'Beklemede';
      default:
        return status;
    }
  };

  return (
    <div className="proposal-modal-overlay" onClick={onClose}>
      <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Teklif Bilgileri</h2>
            <button className="close-button" onClick={onClose}>
              <AiOutlineClose />
            </button>
          </div>
          
          <div className="service-info">
            <h3>{service.machineName}</h3>
            <p className="service-id">Proje Kodu: {service.machineName}</p>
            {offerDetails && offerDetails.length > 0 && (
              <p className="offer-count">Toplam {offerDetails.length} teklif bulundu</p>
            )}
          </div>

          {loading && (
            <div className="loading-state">
              <p>Teklif bilgileri yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Hata: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="proposal-content">
              {/* Offer Information Section */}
              <div className="offer-section">
                <div className="section-header">
                  <FaPaperPlane className="section-icon" />
                  <h4>Teklif Detayları</h4>
                </div>
                
                {offerDetails && offerDetails.length > 0 ? (
                  <div className="offer-list">
                    {offerDetails.map((offer, index) => {
                      const isUsedForPrice = offer.price && offer.price === offerPrice;
                      return (
                        <div key={offer.id || index} className={`offer-card ${isUsedForPrice ? 'price-source' : ''}`}>
                          <div className="offer-header">
                            <div className="offer-info">
                              <span className="offer-id">Teklif</span>
                              <span 
                                className="offer-status"
                                style={{ color: getStatusColor(offer.status) }}
                              >
                                {getStatusText(offer.status)}
                              </span>
                              
                            </div>
                            <span className="offer-date">
                              {formatDate(offer.sentAt)}
                            </span>
                          </div>
                          
                          <div className="offer-details">
                            <div className="detail-row">
                              <AiOutlineUser className="detail-icon" />
                              <span className="detail-label">Gönderen:</span>
                              <span className="detail-value">{offer.senderUserName}</span>
                            </div>
                            
                            <div className="detail-row">
                              <AiOutlineUser className="detail-icon" />
                              <span className="detail-label">Müşteri:</span>
                              <span className="detail-value">{offer.clientCompanyName}</span>
                            </div>
                            
                            <div className="detail-row">
                              <span className="detail-label">Proje Kodu:</span>
                              <span className="detail-value">{offer.projectCode}</span>
                            </div>
                            
                            {offer.price && (
                              <div className="detail-row">
                                <AiOutlineEuro className="detail-icon" />
                                <span className="detail-label">Teklif Fiyatı:</span>
                                <span className="detail-value highlight-price">{formatCurrency(offer.price)}</span>
                              </div>
                            )}
                            
                            {offer.ccEmails && offer.ccEmails.length > 0 && (
                              <div className="detail-row">
                                <AiOutlineMail className="detail-icon" />
                                <span className="detail-label">CC E-postalar:</span>
                                <span className="detail-value">{offer.ccEmails.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-offers">
                    <p>Bu proje için henüz teklif gönderilmemiş.</p>
                  </div>
                )}
              </div>

              {/* Cost Information Section */}
              <div className="cost-section">
                <div className="section-header">
                  <AiOutlineEuro className="section-icon" />
                  <h4>Maliyet Detayları</h4>
                </div>
                <div className="cost-list">
                  {parsedCostDetails.map((item) => (
                    <div key={item.id} className="cost-item">
                      <span className="cost-description">{item.description}</span>
                      <span className="cost-amount">{formatCurrency(item.amount, item.currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="total-cost">
                  <span>Toplam Maliyet:</span>
                  <span className="total-amount">{formatCurrency(totalCost)}</span>
                </div>
              </div>

              {/* Sales and Profit Information */}
              <div className="sales-profit-section">
                <div className="sales-section">
                  <div className="section-header">
                    <FaChartLine className="section-icon" />
                    <h4>Satış Bilgileri</h4>
                  </div>
                  <div className="sales-info">
                    <div className="sales-item">
                      <span>Net Satış Fiyatı:</span>
                      <span className="sales-price">{formatCurrency(salesPrice)}</span>
                    </div>
                    <div className="sales-item">
                      <span>Durum:</span>
                      <span className="sales-status">{service.status}</span>
                    </div>
                  </div>
                </div>

                <div className="profit-section">
                  <div className="section-header">
                    <FaChartLine className="section-icon" />
                    <h4>Kâr Analizi</h4>
                  </div>
                  <div className="profit-info">
                    <div className="profit-item">
                      <span>Net Kâr:</span>
                      <span className={`profit-amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <div className="profit-item">
                      <span>Net Kâr Marjı:</span>
                      <span className={`profit-margin ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                        {profitMargin.toFixed(1)}%
                      </span>
                    </div>
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

export default ProposalInformationModal;
