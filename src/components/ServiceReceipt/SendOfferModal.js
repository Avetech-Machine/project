import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import projectService from '../../services/projectService';
import clientService from '../../services/clientService';
import './SendOfferModal.css';

const SendOfferModal = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    ccList: '',
    documentDate: new Date().toLocaleDateString('tr-TR'),
    salesPrice: service?.salesPrice || 20000
  });
  const [selectedClients, setSelectedClients] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [editableTexts, setEditableTexts] = useState({
    companyName: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    deliveryTerms: 'Makineler garanti dışıdır. Yükleme maliyetleri, nakliye maliyetleri ve makine kurulum maliyetleri satıcının sorumluluğundadır.',
    paymentTerms: 'Yükleme öncesi nihai ödeme',
    deliveryDate: 'Önceden anlaşma sonrası'
  });

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const clients = await clientService.getClients();
        setAvailableClients(clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Müşteriler yüklenirken bir hata oluştu');
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const handleInputChange = (field, value) => { 
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddClient = () => {
    if (selectedClientId) {
      const client = availableClients.find(c => c.id === parseInt(selectedClientId));
      if (client && !selectedClients.find(c => c.id === client.id)) {
        setSelectedClients(prev => [...prev, client]);
        setSelectedClientId('');
      }
    }
  };

  const handleRemoveClient = (clientId) => {
    setSelectedClients(prev => prev.filter(client => client.id !== clientId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddClient();
    }
  };

  const handleEditClick = (field) => {
    setEditingField(field);
  };

  const handleEditSave = (field, value) => {
    setEditableTexts(prev => ({
      ...prev,
      [field]: value
    }));
    setEditingField(null);
  };

  const handleEditCancel = () => {
    setEditingField(null);
  };

  const handleEditKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave(field, e.target.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if at least one client is selected
      if (selectedClients.length === 0) {
        setError('Lütfen en az bir müşteri seçin');
        setIsSubmitting(false);
        return;
      }

      // Extract client IDs from selected clients
      const clientIds = selectedClients.map(client => client.id);
      
      // Send offer to selected clients using new endpoint
      await projectService.sendOfferToClients(service.id, clientIds);
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending offer:', err);
      setError(err.message || 'Teklif gönderilirken bir hata oluştu');
      setIsSubmitting(false);
    }
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
          <div className="header-right">
            <img 
              src="/assets/avitech_logo.png" 
              alt="Avitech Logo" 
              className="avitech-logo"
            />
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="email-form-container">
          <form onSubmit={handleSubmit}>
            <div className="email-inputs">
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
              
              {/* Client Selection Section */}
              <div className="input-group">
                <label>Müşteri Seçimi:</label>
                <div className="client-selection-container">
                  <div className="client-input-row">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="client-select"
                      disabled={loadingClients}
                    >
                      <option value="">
                        {loadingClients ? 'Müşteriler yükleniyor...' : 'Müşteri seçin'}
                      </option>
                      {availableClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.companyName} - {client.contactName} ({client.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddClient}
                      className="btn-add-client"
                      disabled={!selectedClientId || selectedClients.find(c => c.id === parseInt(selectedClientId))}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  {selectedClients.length > 0 && (
                    <div className="client-list">
                      {selectedClients.map((client) => (
                        <div key={client.id} className="client-item">
                          <span className="client-text">
                            {client.companyName} - {client.contactName} ({client.email})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClient(client.id)}
                            className="btn-remove-client"
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
                  <div className="info-row">
                    <strong>Şirket Adı:</strong> 
                    {editingField === 'companyName' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.companyName}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, companyName: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'companyName')}
                          onBlur={() => handleEditSave('companyName', editableTexts.companyName)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('companyName', editableTexts.companyName)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`editable-text ${!editableTexts.companyName ? 'placeholder' : ''}`} 
                          onClick={() => handleEditClick('companyName')}
                        >
                          {editableTexts.companyName || 'Şirket Adı'}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('companyName')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Adres:</strong> 
                    {editingField === 'address' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.address}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, address: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'address')}
                          onBlur={() => handleEditSave('address', editableTexts.address)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('address', editableTexts.address)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`editable-text ${!editableTexts.address ? 'placeholder' : ''}`} 
                          onClick={() => handleEditClick('address')}
                        >
                          {editableTexts.address || 'Adres'}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('address')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>İletişim Kişisi:</strong> 
                    {editingField === 'contactPerson' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.contactPerson}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, contactPerson: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'contactPerson')}
                          onBlur={() => handleEditSave('contactPerson', editableTexts.contactPerson)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('contactPerson', editableTexts.contactPerson)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`editable-text ${!editableTexts.contactPerson ? 'placeholder' : ''}`} 
                          onClick={() => handleEditClick('contactPerson')}
                        >
                          {editableTexts.contactPerson || 'İletişim Kişisi'}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('contactPerson')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Telefon:</strong> 
                    {editingField === 'phone' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.phone}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, phone: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'phone')}
                          onBlur={() => handleEditSave('phone', editableTexts.phone)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('phone', editableTexts.phone)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`editable-text ${!editableTexts.phone ? 'placeholder' : ''}`} 
                          onClick={() => handleEditClick('phone')}
                        >
                          {editableTexts.phone || 'Telefon'}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('phone')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>E-Mail:</strong> 
                    {editingField === 'email' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.email}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, email: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'email')}
                          onBlur={() => handleEditSave('email', editableTexts.email)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('email', editableTexts.email)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`editable-text ${!editableTexts.email ? 'placeholder' : ''}`} 
                          onClick={() => handleEditClick('email')}
                        >
                          {editableTexts.email || 'E-Mail'}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('email')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Belge Tarihi:</strong> {formData.documentDate}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-row">
                    <strong>Avitech Metal Teknolojileri Anonim Şirketi</strong>
                  </div>
                  <div className="info-row"> 
                    <strong>Adres:</strong> Rüzgarlıbahçe, K Plaza 34805 Beykoz/Istanbul, Turkey
                  </div>
                  <div className="info-row">
                    <strong>Telefon:</strong> +90 541 563 49 90
                  </div>
                  <div className="info-row">
                    <strong>İletişim Kişisi:</strong> Bora Urçar
                  </div>
                  <div className="info-row">
                    <strong>E-Mail:</strong> bora.urcar@avitech.com.tr
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
                    <span>TOPLAM:</span>
                    <span className="total-price">{formatCurrency(formData.salesPrice, 'EUR')}</span>
                  </div>
                </div>
                
                <div className="terms-section">
                  <div className="terms-row">
                    <strong>Teslimat Şartları:</strong> 
                    {editingField === 'deliveryTerms' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.deliveryTerms}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'deliveryTerms')}
                          onBlur={() => handleEditSave('deliveryTerms', editableTexts.deliveryTerms)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('deliveryTerms', editableTexts.deliveryTerms)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="editable-text" onClick={() => handleEditClick('deliveryTerms')}>
                          {editableTexts.deliveryTerms}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('deliveryTerms')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="terms-row">
                    <strong>Ödeme Şartları:</strong> 
                    {editingField === 'paymentTerms' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.paymentTerms}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, paymentTerms: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'paymentTerms')}
                          onBlur={() => handleEditSave('paymentTerms', editableTexts.paymentTerms)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('paymentTerms', editableTexts.paymentTerms)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="editable-text" onClick={() => handleEditClick('paymentTerms')}>
                          {editableTexts.paymentTerms}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('paymentTerms')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="terms-row">
                    <strong>Teslimat Tarihi:</strong> 
                    {editingField === 'deliveryDate' ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          value={editableTexts.deliveryDate}
                          onChange={(e) => setEditableTexts(prev => ({ ...prev, deliveryDate: e.target.value }))}
                          onKeyDown={(e) => handleEditKeyPress(e, 'deliveryDate')}
                          onBlur={() => handleEditSave('deliveryDate', editableTexts.deliveryDate)}
                          className="edit-input"
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button 
                            type="button" 
                            className="btn-save-edit" 
                            onClick={() => handleEditSave('deliveryDate', editableTexts.deliveryDate)}
                          >
                            ✓
                          </button>
                          <button 
                            type="button" 
                            className="btn-cancel-edit" 
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="editable-text" onClick={() => handleEditClick('deliveryDate')}>
                          {editableTexts.deliveryDate}
                        </span>
                        <button className="edit-icon" type="button" onClick={() => handleEditClick('deliveryDate')}>
                          <FaPencilAlt />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p>Hata: {error}</p>
              </div>
            )}

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
              <p>Fiyat: {formatCurrency(formData.salesPrice, 'EUR')}</p>
              {selectedClients.length > 0 && (
                <p>Gönderilen Müşteriler: {selectedClients.map(c => c.companyName).join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendOfferModal;
