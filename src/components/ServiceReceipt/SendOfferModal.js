import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaPlus, FaTrash } from 'react-icons/fa';
import './SendOfferModal.css';

const SendOfferModal = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    customerCompany: '',
    ccList: '',
    documentDate: new Date().toLocaleDateString('tr-TR'),
    salesPrice: service?.salesPrice || 20000
  });
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddEmail = () => {
    if (newEmail.trim() && newEmail.includes('@')) {
      setAdditionalEmails(prev => [...prev, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index) => {
    setAdditionalEmails(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine all emails for display
    const allEmails = [formData.customerEmail, ...additionalEmails].filter(Boolean);
    
    // Simulate email sending process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Close modal after showing success message
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  return (
    <div className="send-offer-modal-overlay">
      <div className="send-offer-modal">
        <div className="modal-header">
          <h2>Teklif Gönder</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="email-form-container">
          <form onSubmit={handleSubmit}>
            <div className="email-inputs">
              <div className="input-group">
                <label>Müşteri Adı:</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Müşteri Adı"
                  required
                />
              </div>
              <div className="input-group">
                <label>Müşteri E-posta Adresi:</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="müşteri@firma.com"
                  required
                />
              </div>
              <div className="input-group">
                <label>Telefon Numarası:</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <div className="input-group">
                <label>Mail Listesine Ekle (CC):</label>
                <input
                  type="text"
                  value={formData.ccList}
                  onChange={(e) => handleInputChange('ccList', e.target.value)}
                  placeholder="ek@firma.com, diger@firma.com"
                />
              </div>
              
              <div className="input-group">
                <label>Fiyat (EUR):</label>
                <input
                  type="number"
                  value={formData.salesPrice}
                  onChange={(e) => handleInputChange('salesPrice', parseFloat(e.target.value) || 0)}
                  placeholder="20000"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* Additional Emails Section */}
              <div className="input-group">
                <label>Ek E-posta Adresleri:</label>
                <div className="additional-emails-container">
                  <div className="email-input-row">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="ek@firma.com"
                      className="email-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddEmail}
                      className="btn-add-email"
                      disabled={!newEmail.trim() || !newEmail.includes('@')}
                    >
                      <FaPlus />
                      Ekle
                    </button>
                  </div>
                  
                  {additionalEmails.length > 0 && (
                    <div className="email-list">
                      {additionalEmails.map((email, index) => (
                        <div key={index} className="email-item">
                          <span className="email-text">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(index)}
                            className="btn-remove-email"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="offer-document">
              <div className="document-header">
                <div className="sender-info">
                  <div className="company-name">
                    <strong>DİJİTAL GÜÇ İŞLEM TEST SİSTEMLERİ ELEKTRONİK SAN. VE TİC. A.Ş</strong>
                  </div>
                  <div className="info-row">
                    <strong>Adres:</strong> Ostim OSB mah. 1201 Cad. No:122/A YENİMAHALLE/ANKARA
                  </div>
                  <div className="info-row">
                    <strong>İletişim Kişisi:</strong> Sefer Erseven
                  </div>
                  <div className="info-row">
                    <strong>Telefon:</strong> +90 533 713 18 66
                  </div>
                  <div className="info-row">
                    <strong>E-Mail:</strong> sefer.erseven@dijitest.com.tr
                  </div>
                  <div className="info-row">
                    <strong>Belge Tarihi:</strong> {formData.documentDate}
                  </div>
                </div>

                <div className="receiver-info">
                  <div className="company-name">
                    <strong>BESTTECH CNC Makine Sanayi Ve Ticaret Limited Şirketi</strong>
                  </div>
                  <div className="info-row">
                    <strong>Adres:</strong> OSTİM OSB MAH.1234. CADDE NO: 15 YENİMAHALLE ANKARA
                  </div>
                  <div className="info-row">
                    <strong>Telefon:</strong> +90 537 849 37 09
                  </div>
                  <div className="info-row">
                    <strong>İletişim Kişisi:</strong> Bahri Eraslan
                  </div>
                  <div className="info-row">
                    <strong>E-Mail:</strong> info@besttechcnc.com
                  </div>
                </div>
              </div>

              <div className="offer-title">
                <h3>TEKLİF</h3>
              </div>

              <div className="machine-details">
                <table className="machine-table">
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Item Description</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="position">1</td>
                      <td className="machine-name">{service?.machineName || 'DMG MORI DMU 75 MONOBLOCK'}</td>
                      <td className="quantity">1</td>
                      <td className="machine-price">{formatCurrency(formData.salesPrice, 'EUR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="offer-footer">
                <div className="total-section">
                  <div className="total-row">
                    <span>TOTAL:</span>
                    <span className="total-price">{formatCurrency(formData.salesPrice, 'EUR')}</span>
                  </div>
                </div>
                
                <div className="terms-section">
                  <div className="terms-row">
                    <strong>Terms of Delivery:</strong> Machines are without guarantee. Exclusive loading costs, transport costs and machine installation costs are under seller's responsibility.
                  </div>
                  <div className="terms-row">
                    <strong>Terms of Payment:</strong> final payment before loading
                  </div>
                  <div className="terms-row">
                    <strong>Delivery Date:</strong> After prior agreement
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                İptal
              </button>
              <button type="submit" className="btn-send" disabled={isSubmitting}>
                <FaPaperPlane />
                {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
              </button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <div className="success-message">
            <div className="success-content">
              <h3>Teklif Başarıyla Gönderildi!</h3>
              <p>Teklif {formData.customerEmail} adresine gönderildi.</p>
              <p>Fiyat: {formatCurrency(formData.salesPrice, 'EUR')}</p>
              {additionalEmails.length > 0 && (
                <p>Ek E-posta Adresleri: {additionalEmails.join(', ')}</p>
              )}
              {formData.ccList && (
                <p>CC: {formData.ccList}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendOfferModal;
