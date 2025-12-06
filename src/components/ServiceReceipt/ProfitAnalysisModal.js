import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineEuro, AiOutlineDownload } from 'react-icons/ai';
import { FaChartLine } from 'react-icons/fa';
import projectService from '../../services/projectService';
import offerService from '../../services/offerService';
import './ProfitAnalysisModal.css';

const ProfitAnalysisModal = ({ service, onClose }) => {
  const [costDetails, setCostDetails] = useState(null);
  const [priceDetails, setPriceDetails] = useState(null);
  const [offerSalePrice, setOfferSalePrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchCostDetails = async () => {
      if (!service?.id) {
        setError('Proje ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch cost details
        const data = await projectService.getProjectCostDetails(service.id);
        setCostDetails(data.costDetails);
        setPriceDetails(data.priceDetails);

        // If the original status is COMPLETED, fetch the salePrice from offers API
        if (service.originalStatus === 'COMPLETED') {
          try {
            const offers = await offerService.getOffersByProject(service.id);
            if (offers && Array.isArray(offers) && offers.length > 0) {
              // Find the first offer with a salePrice
              const offerWithSalePrice = offers.find(offer => offer.salePrice != null);
              if (offerWithSalePrice && offerWithSalePrice.salePrice) {
                setOfferSalePrice(offerWithSalePrice.salePrice);
              }
            }
          } catch (offerError) {
            console.error('Error fetching offer salePrice:', offerError);
            // Continue without setting offerSalePrice - will fallback to service.salesPrice
          }
        }
      } catch (err) {
        console.error('Error fetching cost details:', err);
        setError(err.message || 'Maliyet detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchCostDetails();
  }, [service?.id, service?.originalStatus]);

  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const handleExport = () => {
    // Export functionality - no API connection as requested
    console.log('Export button clicked');
    // Future implementation will go here
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'TEMPLATE':
        return 'Aktif';
      case 'SOLD':
        return 'Tamamlandı';
      case 'OFFER_SENT':
        return 'Teklif Gönderildi';
      case 'BOUGHT':
        return 'Satın Alındı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
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

  // Use offerSalePrice if available (for COMPLETED status), otherwise fallback to parsed or service salesPrice
  // For CLOSED status, offerSalePrice will be null, so it will use service.salesPrice as the current value
  const salesPrice = offerSalePrice ?? parsedPriceDetails.salesPrice ?? service.salesPrice ?? 0;

  const netProfit = parsedPriceDetails.netProfit || (salesPrice - totalCost);
  const profitMargin = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  // Force scroll recalculation after content loads
  useEffect(() => {
    if (!loading && !error && modalRef.current) {
      const forceScrollRecalculation = () => {
        if (modalRef.current) {
          // Force browser to recalculate layout by accessing scroll properties
          // This ensures the scroll container properly calculates its scrollable area
          const scrollHeight = modalRef.current.scrollHeight;
          const clientHeight = modalRef.current.clientHeight;
          void scrollHeight;
          void clientHeight;
          void modalRef.current.scrollTop;
        }
      };

      // Use ResizeObserver to watch for content size changes
      let resizeObserver;
      const contentElement = modalRef.current.querySelector('.modal-content');

      if (window.ResizeObserver && contentElement) {
        resizeObserver = new ResizeObserver(() => {
          // Delay to ensure layout is complete
          setTimeout(() => {
            forceScrollRecalculation();
          }, 0);
        });
        resizeObserver.observe(contentElement);
      }

      // Initial recalculation with multiple delays to ensure DOM is ready
      const timeout1 = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            forceScrollRecalculation();
          });
        });
      }, 0);

      const timeout2 = setTimeout(() => {
        forceScrollRecalculation();
      }, 100);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }
  }, [loading, error, costDetails, priceDetails, offerSalePrice]);

  return (
    <div className="profit-analysis-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="profit-analysis-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <button className="export-button" onClick={handleExport}>
            Excel ile Dışa Aktar
          </button>
          <button className="close-button" onClick={onClose}>
            <AiOutlineClose />
          </button>

          <div className="service-info">
            <h3>{service.machineName}</h3>
          </div>

          {loading && (
            <div className="loading-state">
              <p>Maliyet detayları yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Hata: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="analysis-grid">
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

              <div className="sales-section">
                <div className="section-header">
                  <FaChartLine className="section-icon" />
                  <h4>Satış Bilgileri</h4>
                </div>
                <div className="sales-info">
                  <div className="sales-item">
                    <span>Hedef Satış Fiyatı:</span>
                    <span className="sales-price">{formatCurrency(salesPrice)}</span>
                  </div>
                  <div className="sales-item">
                    <span>Durum:</span>
                    <span className="sales-status">{getDisplayStatus(service.status)}</span>
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
                    <span>Hedef Net Kâr:</span>
                    <span className={`profit-amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                  <div className="profit-item">
                    <span>Hedef Kâr Marjı:</span>
                    <span className={`profit-margin ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
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

export default ProfitAnalysisModal;
