import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDollar, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import saleService from '../../services/saleService';
import projectService from '../../services/projectService';
import './CreateSaleModal.css';

const CreateSaleModal = ({ offer, onClose, onSaleComplete }) => {
  const [salePrice, setSalePrice] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [basePrice, setBasePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Fetch cost details and extract base price
  useEffect(() => {
    const fetchBasePrice = async () => {
      if (!offer?.projectId) return;
      
      setLoadingPrice(true);
      try {
        const costData = await projectService.getProjectCostDetails(offer.projectId);
        
        // Extract base price from priceDetails string
        // Format: "Base price: 12332, Total cost: 10200, Net profit: 2132"
        if (costData.priceDetails) {
          const basePriceMatch = costData.priceDetails.match(/Base price:\s*([\d,]+(?:\.\d+)?)/i);
          if (basePriceMatch) {
            // Remove commas and parse as float
            const extractedBasePrice = parseFloat(basePriceMatch[1].replace(/,/g, ''));
            console.log('Extracted base price from API for sale modal:', extractedBasePrice);
            setBasePrice(extractedBasePrice);
          }
        }
      } catch (error) {
        console.error('Error fetching cost details for sale modal:', error);
        // Don't show error to user, just continue without placeholder
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchBasePrice();
  }, [offer?.projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!salePrice || salePrice <= 0) {
      setError('Geçerli bir satış fiyatı giriniz');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const saleData = {
        projectId: offer.projectId,
        clientId: offer.clientId,
        salePrice: parseFloat(salePrice),
        saleNotes: saleNotes.trim(),
        saleDate: new Date().toISOString()
      };

      await saleService.createSale(saleData);
      
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
                placeholder={loadingPrice ? "Fiyat yükleniyor..." : (basePrice ? `${basePrice} €` : "Satış fiyatını giriniz")}
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
