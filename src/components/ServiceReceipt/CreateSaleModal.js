import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDollar, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import saleService from '../../services/saleService';
import offerService from '../../services/offerService';
import './CreateSaleModal.css';

const CreateSaleModal = ({ offer, onClose, onSaleComplete }) => {
  const [salePrice, setSalePrice] = useState('');
  const [salePriceDisplay, setSalePriceDisplay] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(null);

  // Helper function to format number with periods as thousand separators
  const formatNumberWithPeriods = (num) => {
    if (!num && num !== 0) return '';
    const numStr = num.toString().replace(/\./g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Helper function to parse formatted number (remove periods)
  const parseFormattedNumber = (str) => {
    if (!str) return '';
    return str.replace(/\./g, '');
  };

  // Set initial price from offer when modal opens
  useEffect(() => {
    if (offer?.price) {
      const priceValue = offer.price.toString();
      setSalePrice(priceValue);
      setSalePriceDisplay(formatNumberWithPeriods(offer.price));
      setOriginalPrice(offer.price);
    }
  }, [offer?.price]);

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    // Remove all periods and check if remaining is numeric
    const numericOnly = inputValue.replace(/\./g, '');
    
    // Only allow empty string or numeric values
    if (numericOnly === '' || /^\d+$/.test(numericOnly)) {
      if (numericOnly === '') {
        setSalePriceDisplay('');
        setSalePrice('');
      } else {
        const num = parseInt(numericOnly, 10);
        if (!isNaN(num)) {
          // Store numeric value as string
          setSalePrice(num.toString());
          // Display formatted with periods
          setSalePriceDisplay(formatNumberWithPeriods(num));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // salePrice already contains the numeric value as string, parse it to int
    const numericPrice = salePrice ? parseInt(salePrice, 10) : 0;
    
    if (!numericPrice || numericPrice <= 0) {
      setError('Geçerli bir satış fiyatı giriniz');
      return;
    }

    if (!offer?.id) {
      setError('Teklif ID bulunamadı');
      return;
    }

    if (!offer?.projectId) {
      setError('Proje ID bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Compare prices with tolerance for floating point precision
      const priceChanged = originalPrice !== null && Math.abs(numericPrice - originalPrice) > 0.01;
      const description = saleNotes.trim() || '';

      if (!priceChanged) {
        // Use default price - call createSaleFromOffer endpoint
        await saleService.createSaleFromOffer(
          offer.projectId,
          offer.id,
          description
        );
      } else {
        // Price was changed - call createSale endpoint
        // First, fetch the offer to get ccEmails
        const offerDetails = await offerService.getOfferById(offer.id);
        
        const saleData = {
          projectId: offer.projectId,
          clientId: offer.clientId,
          ccEmails: offerDetails.ccEmails || [],
          price: numericPrice, // Send as integer
          description: description
        };

        await saleService.createSaleWithPrice(offer.projectId, saleData);
      }
      
      setShowSuccess(true);
      
      // Close modal and refresh after showing success message
      setTimeout(() => {
        onSaleComplete();
      }, 2000);
    } catch (err) {
      console.error('Create sale error:', err);
      setError(err.message || 'Satış oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSalePrice('');
    setSalePriceDisplay('');
    setSaleNotes('');
    setError('');
    setOriginalPrice(null);
    onClose();
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

  if (!offer) return null;

  return (
    <div className="create-sale-modal-overlay">
      <div className="create-sale-modal">
        <div className="modal-header">
          <h2>
            <FaHandshake className="header-icon" />
            Satış Oluştur
          </h2>
          <button className="close-button" onClick={handleClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="offer-info-section">
            <h3>Teklif Bilgileri</h3>
            <div className="offer-details">
              <div className="info-item">
                <AiOutlineFileText className="info-icon" />
                <span className="info-label">Proje Kodu:</span>
                <span className="info-value">{offer.projectCode}</span>
              </div>
              <div className="info-item">
                <AiOutlineUser className="info-icon" />
                <span className="info-label">Müşteri:</span>
                <span className="info-value">{offer.clientCompanyName}</span>
              </div>
              <div className="info-item">
                <AiOutlineCalendar className="info-icon" />
                <span className="info-label">Teklif Tarihi:</span>
                <span className="info-value">{formatDate(offer.sentAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Durum:</span>
                <span className="info-value status">{offer.status}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sale-form">
            <div className="form-group">
              <label htmlFor="salePrice">
                <AiOutlineDollar className="label-icon" />
                Satış Fiyatı {offer?.price && `(${formatNumberWithPeriods(offer.price)} EUR)`} *
              </label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  id="salePrice"
                  value={salePriceDisplay}
                  onChange={handlePriceChange}
                  placeholder={offer?.price ? `${formatNumberWithPeriods(offer.price)}` : "Satış fiyatını giriniz"}
                  required
                  inputMode="numeric"
                />
                <span className="currency-label">EUR</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="saleNotes">
                <AiOutlineFileText className="label-icon" />
                Satış Notları
              </label>
              <textarea
                id="saleNotes"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Satış ile ilgili notlarınızı buraya yazabilirsiniz..."
                rows="4"
              />
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleClose}
                disabled={loading}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FaHandshake className="btn-icon" />
                    Satış Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message-box">
            <div className="success-icon">
              <FaHandshake />
            </div>
            <h3>Satış Başarıyla Oluşturuldu!</h3>
            <p>Satış kaydı başarıyla oluşturuldu.</p>
            <p className="success-detail">Satış Fiyatı: {salePriceDisplay || formatNumberWithPeriods(salePrice)} EUR</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSaleModal;
