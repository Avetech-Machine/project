import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineDollar, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import saleService from '../../services/saleService';
import './CreateSaleModal.css';

const CreateSaleModal = ({ offer, onClose, onSaleComplete }) => {
  const [salePrice, setSalePrice] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      alert('Satış başarıyla oluşturuldu!');
      onSaleComplete();
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
                placeholder="Satış fiyatını giriniz"
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
    </div>
  );
};

export default CreateSaleModal;
