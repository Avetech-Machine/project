import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDollar, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import saleService from '../../services/saleService';
import offerService from '../../services/offerService';
import './CreateSaleModal.css';

const CreateSaleModal = ({ offer, onClose, onSaleComplete }) => {
  const [salePrice, setSalePrice] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(null);

  // Set initial price from offer when modal opens
  useEffect(() => {
    if (offer?.price) {
      const priceValue = offer.price.toString();
      setSalePrice(priceValue);
      setOriginalPrice(offer.price);
    }
  }, [offer?.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!salePrice || salePrice <= 0) {
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

      const currentPrice = parseFloat(salePrice);
      // Compare prices with tolerance for floating point precision
      const priceChanged = originalPrice !== null && Math.abs(currentPrice - originalPrice) > 0.01;
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
          price: currentPrice,
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
                Satış Fiyatı *
              </label>
              <input
                type="number"
                id="salePrice"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder={offer?.price ? `${offer.price.toLocaleString('tr-TR')} TL` : "Satış fiyatını giriniz"}
                min="0"
                step="0.01"
                required
              />
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
            <p className="success-detail">Satış Fiyatı: {salePrice} TL</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSaleModal;
