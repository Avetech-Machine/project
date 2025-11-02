import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import projectService from '../../services/projectService';
import clientService from '../../services/clientService';
import './SendOfferModal.css';

const SendOfferModal = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    ccList: '',
    documentDate: new Date().toLocaleDateString('tr-TR'),
    salesPrice: service?.salesPrice || service?.totalCost || 0
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [ccEmails, setCcEmails] = useState([]);
  const [newCcEmail, setNewCcEmail] = useState('');
  const [loadingCostDetails, setLoadingCostDetails] = useState(false);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientDataReady, setNewClientDataReady] = useState(false);
  const [newClientData, setNewClientData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    vergiDairesi: '',
    vergiNo: ''
  });
  const [editableTexts, setEditableTexts] = useState({
    companyName: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    vergiDairesi: '',
    vergiNo: '',
    deliveryTerms: 'Makineler garanti dışıdır. Yükleme maliyetleri, nakliye maliyetleri ve makine kurulum maliyetleri satıcının sorumluluğundadır.',
    paymentTerms: 'Yükleme öncesi nihai ödeme.',
    deliveryDate: 'Önceden anlaşma sonrası.'
  });

  // Fetch cost details and extract base price
  useEffect(() => {
    const fetchCostDetails = async () => {
      if (!service?.id) return;
      
      setLoadingCostDetails(true);
      try {
        const costData = await projectService.getProjectCostDetails(service.id);
        
        // Extract base price from priceDetails string
        // Format: "Base price: 12332, Total cost: 10200, Net profit: 2132"
        if (costData.priceDetails) {
          const basePriceMatch = costData.priceDetails.match(/Base price:\s*([\d,]+(?:\.\d+)?)/i);
          if (basePriceMatch) {
            // Remove commas and parse as float
            const basePrice = parseFloat(basePriceMatch[1].replace(/,/g, ''));
            console.log('Extracted base price from API:', basePrice);
            
            setFormData(prev => ({
              ...prev,
              salesPrice: basePrice
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching cost details:', error);
        // Don't show error to user, just use fallback values
      } finally {
        setLoadingCostDetails(false);
      }
    };

    fetchCostDetails();
  }, [service?.id]);

  // Update form data when service prop changes (fallback if API fails)
  useEffect(() => {
    if (service && !loadingCostDetails) {
      setFormData(prev => ({
        ...prev,
        salesPrice: prev.salesPrice || service.salesPrice || service.totalCost || 0
      }));
    }
  }, [service, loadingCostDetails]);

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

  // Auto-fill form when client is selected
  useEffect(() => {
    const handleClientSelection = async () => {
      if (selectedClientId && !selectedClient) {
        const client = availableClients.find(c => c.id === parseInt(selectedClientId));
        if (client) {
          try {
            // Fetch detailed client information
            const detailedClient = await clientService.getClientById(selectedClientId);
            
            // Auto-fill form fields with client information
            setEditableTexts(prev => ({
              ...prev,
              companyName: detailedClient.companyName || '',
              address: detailedClient.address || '',
              contactPerson: detailedClient.contactName || '',
              phone: detailedClient.phone || '',
              email: detailedClient.email || '',
              vergiDairesi: detailedClient.vergiDairesi || '',
              vergiNo: detailedClient.vergiNo || ''
            }));
            
            setSelectedClient(client);
            setIsAutoFilled(true);
          } catch (error) {
            console.error('Error fetching client details:', error);
            // Still add the client even if detailed fetch fails
            setSelectedClient(client);
            setIsAutoFilled(true);
          }
        }
      }
    };

    handleClientSelection();
  }, [selectedClientId, availableClients, selectedClient]);

  const handleAddClient = () => {
    // Only allow adding new client when no client is selected
    if (!selectedClientId && !selectedClient) {
      setIsAddingNewClient(true);
      setNewClientData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        vergiDairesi: '',
        vergiNo: ''
      });
      // Clear the editable texts to allow manual entry
      setEditableTexts(prev => ({
        ...prev,
        companyName: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        vergiDairesi: '',
        vergiNo: ''
      }));
      // Scroll to company name section in the document
      setTimeout(() => {
        const companySection = document.querySelector('.left-column');
        if (companySection) {
          companySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleCompanyFieldChange = (field, value) => {
    // Update editable texts
    setEditableTexts(prev => ({
      ...prev,
      [field]: value
    }));

    // Update new client data based on field mapping
    if (field === 'companyName') {
      setNewClientData(prev => ({ ...prev, companyName: value }));
    } else if (field === 'contactPerson') {
      setNewClientData(prev => ({ ...prev, contactName: value }));
    } else if (field === 'email') {
      setNewClientData(prev => ({ ...prev, email: value }));
    } else if (field === 'phone') {
      setNewClientData(prev => ({ ...prev, phone: value }));
    } else if (field === 'address') {
      setNewClientData(prev => ({ ...prev, address: value }));
    } else if (field === 'vergiDairesi') {
      setNewClientData(prev => ({ ...prev, vergiDairesi: value }));
    } else if (field === 'vergiNo') {
      setNewClientData(prev => ({ ...prev, vergiNo: value }));
    }
  };

  const handleSaveNewClient = () => {
    // Validate all required fields
    if (!newClientData.companyName.trim()) {
      setError('Lütfen şirket adını girin');
      return;
    }
    if (!newClientData.contactName.trim()) {
      setError('Lütfen iletişim kişisini girin');
      return;
    }
    if (!newClientData.email.trim()) {
      setError('Lütfen e-posta adresini girin');
      return;
    }
    if (!newClientData.phone.trim()) {
      setError('Lütfen telefon numarasını girin');
      return;
    }
    if (!newClientData.address.trim()) {
      setError('Lütfen adresi girin');
      return;
    }

    // Mark new client data as ready
    setNewClientDataReady(true);
    setIsAddingNewClient(false);
    setError(null);
  };

  const handleCancelNewClient = () => {
    setIsAddingNewClient(false);
    setNewClientDataReady(false);
    setNewClientData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      vergiDairesi: '',
      vergiNo: ''
    });
    // Clear the preview as well
    setEditableTexts(prev => ({
      ...prev,
      companyName: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      vergiDairesi: '',
      vergiNo: ''
    }));
  };

  const handleRemoveClient = () => {
    setSelectedClient(null);
    setSelectedClientId('');
    setIsAutoFilled(false);
    setIsAddingNewClient(false);
    setNewClientDataReady(false);
    setNewClientData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      vergiDairesi: '',
      vergiNo: ''
    });
    setEditableTexts(prev => ({
      ...prev,
      companyName: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      vergiDairesi: '',
      vergiNo: ''
    }));
  };

  const handleAddCcEmail = () => {
    if (newCcEmail.trim() && !ccEmails.includes(newCcEmail.trim())) {
      setCcEmails(prev => [...prev, newCcEmail.trim()]);
      setNewCcEmail('');
    }
  };

  const handleRemoveCcEmail = (emailToRemove) => {
    setCcEmails(prev => prev.filter(email => email !== emailToRemove));
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
      let clientToUse = selectedClient;

      // If we have new client data ready, create the client first
      if (newClientDataReady && !selectedClient) {
        try {
          const createdClient = await clientService.createClient(newClientData);
          clientToUse = createdClient;
          
          // Reset new client state
          setNewClientDataReady(false);
          setNewClientData({
            companyName: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            vergiDairesi: '',
            vergiNo: ''
          });
        } catch (createError) {
          console.error('Error creating client:', createError);
          setError(createError.message || 'Müşteri oluşturulurken bir hata oluştu');
          setIsSubmitting(false);
          return;
        }
      } else if (!selectedClient) {
        // Check if a client is selected or new client data is ready
        setError('Lütfen bir müşteri seçin veya yeni müşteri bilgilerini kaydedin');
        setIsSubmitting(false);
        return;
      }

      // Send offer to the client using new endpoint
      await projectService.sendOfferToClients(service.id, [clientToUse.id], ccEmails);
      
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
                  placeholder={loadingCostDetails ? "Fiyat yükleniyor..." : "Proje maliyetini girin"}
                  min="0"
                  step="0.01"
                  disabled={loadingCostDetails}
                />
              </div>
              
              {/* Client Selection Section */}
              <div className="input-group">
                <div className="input-label-row">
                  <label>Müşteri Seçimi:</label>
                  <button
                    type="button"
                    onClick={handleAddClient}
                    className="btn-add-client"
                    disabled={selectedClient || selectedClientId || isAddingNewClient}
                    title={isAddingNewClient ? 'Yeni müşteri formu zaten açık' : 'Yeni müşteri ekle'}
                  >
                    <FaPlus />
                    <span style={{ marginLeft: 8 }}>Müşteri Ekle</span>
                  </button>
                </div>
                <div className="client-selection-container">
                  <div className="client-input-row">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="client-select"
                      disabled={loadingClients || selectedClient}
                    >
                      <option value="">
                        {loadingClients ? 'Müşteriler yükleniyor...' : selectedClient ? 'Müşteri seçildi' : 'Müşteri seçin'}
                      </option>
                      {availableClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.companyName} - {client.contactName} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedClient && (
                    <div className="client-list">
                      <div className="client-item">
                        <span className="client-text">
                          {selectedClient.companyName} - {selectedClient.contactName} ({selectedClient.email})
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveClient}
                          className="btn-remove-client"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CC Email Section */}
              <div className="input-group">
                <label>CC E-postalar:</label>
                <div className="cc-email-container">
                  <div className="cc-email-input-row">
                    <input
                      type="email"
                      value={newCcEmail}
                      onChange={(e) => setNewCcEmail(e.target.value)}
                      placeholder="CC e-posta adresi girin. (Eklemek istediğiniz mailleri + tuşuna basarak ekleyebilirsiniz)"
                      className="cc-email-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCcEmail();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCcEmail}
                      className="btn-add-cc"
                      disabled={!newCcEmail.trim()}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  {ccEmails.length > 0 && (
                    <div className="cc-email-list">
                      {ccEmails.map((email, index) => (
                        <div key={index} className="cc-email-item">
                          <span className="cc-email-text">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCcEmail(email)}
                            className="btn-remove-cc"
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
                <div className="left-column">
                  <div className="info-row">
                    <strong>Şirket Adı:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="text"
                        value={editableTexts.companyName}
                        onChange={(e) => handleCompanyFieldChange('companyName', e.target.value)}
                        placeholder="Şirket adını girin"
                        className="inline-edit-input"
                        autoFocus
                      />
                    ) : (
                      <span className="info-value">{editableTexts.companyName || 'Şirket Adı'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Adres:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="text"
                        value={editableTexts.address}
                        onChange={(e) => handleCompanyFieldChange('address', e.target.value)}
                        placeholder="Adresi girin"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.address || 'Adres'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>İletişim Kişisi:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="text"
                        value={editableTexts.contactPerson}
                        onChange={(e) => handleCompanyFieldChange('contactPerson', e.target.value)}
                        placeholder="İletişim kişisini girin"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.contactPerson || 'İletişim Kişisi'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Telefon:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="tel"
                        value={editableTexts.phone}
                        onChange={(e) => handleCompanyFieldChange('phone', e.target.value)}
                        placeholder="+905551234567"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.phone || 'Telefon'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>E-Mail:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="email"
                        value={editableTexts.email}
                        onChange={(e) => handleCompanyFieldChange('email', e.target.value)}
                        placeholder="email@example.com"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.email || 'E-Mail'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Vergi Dairesi:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="text"
                        value={editableTexts.vergiDairesi}
                        onChange={(e) => handleCompanyFieldChange('vergiDairesi', e.target.value)}
                        placeholder="Vergi dairesini girin"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.vergiDairesi || 'Vergi Dairesi'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Vergi No:</strong> 
                    {isAddingNewClient ? (
                      <input
                        type="text"
                        value={editableTexts.vergiNo}
                        onChange={(e) => handleCompanyFieldChange('vergiNo', e.target.value)}
                        placeholder="Vergi numarasını girin"
                        className="inline-edit-input"
                      />
                    ) : (
                      <span className="info-value">{editableTexts.vergiNo || 'Vergi No'}</span>
                    )}
                  </div>
                  <div className="info-row">
                    <strong>Belge Tarihi:</strong> 
                    <span className="info-value">{formData.documentDate}</span>
                  </div>
                  
                  {isAddingNewClient && (
                    <div className="inline-edit-actions">
                      <button
                        type="button"
                        onClick={handleCancelNewClient}
                        className="btn-cancel-inline-edit"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNewClient}
                        className="btn-save-inline-edit"
                      >
                        Kaydet
                      </button>
                    </div>
                  )}
                  
                  
                </div>

                <div className="right-column">
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
                      <td className="machine-name">{service?.machineName || service?.title || service?.machineTitle || 'Makine Adı'}</td>
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
                      <span>
                        <span className="editable-text" onClick={() => handleEditClick('deliveryTerms')}>
                          {editableTexts.deliveryTerms}
                        </span>
                        <span
                          onClick={() => handleEditClick('deliveryTerms')}
                          title="Düzenle"
                          style={{ marginLeft: 8, cursor: 'pointer', color: '#555', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <FaPencilAlt />
                        </span>
                      </span>
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
                      <span>
                        <span className="editable-text" onClick={() => handleEditClick('paymentTerms')}>
                          {editableTexts.paymentTerms}
                        </span>
                        <span
                          onClick={() => handleEditClick('paymentTerms')}
                          title="Düzenle"
                          style={{ marginLeft: 8, cursor: 'pointer', color: '#555', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <FaPencilAlt />
                        </span>
                      </span>
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
                      <span>
                        <span className="editable-text" onClick={() => handleEditClick('deliveryDate')}>
                          {editableTexts.deliveryDate}
                        </span>
                        <span
                          onClick={() => handleEditClick('deliveryDate')}
                          title="Düzenle"
                          style={{ marginLeft: 8, cursor: 'pointer', color: '#555', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <FaPencilAlt />
                        </span>
                      </span>
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
              {selectedClient && (
                <p>Gönderilen Müşteri: {selectedClient.companyName}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendOfferModal;
