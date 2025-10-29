import React, { useState, useEffect } from 'react';
import clientService from '../../services/clientService';
import { 
  AiOutlineReload,
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineFileText,
  AiOutlineEdit
} from 'react-icons/ai';
import ViewOfferModal from './ViewOfferModal';
import EditCompanyModal from './EditCompanyModal';
import './RegisteredCompanies.css';

const RegisteredCompanies = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewOfferModalOpen, setIsViewOfferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const clientsData = await clientService.getClients();
      setClients(clientsData);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err.message || 'Müşteriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadClients();
  };

  const handleViewOffers = (client) => {
    setSelectedClient(client);
    setIsViewOfferModalOpen(true);
  };

  const handleCloseViewOfferModal = () => {
    setIsViewOfferModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditCompany = (client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleEditSuccess = () => {
    loadClients();
  };

  if (loading) {
    return (
      <div className="registered-companies">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registered-companies">
        <div className="error-container">
          <h2>Hata</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            <AiOutlineReload className="icon" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registered-companies">
      <div className="companies-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Kayıtlı Firmalar</h1>
            <p>Kayıtlı müşteri firmalarının listesi</p>
          </div>
          
        </div>
      </div>

      <div className="companies-content">
        {clients.length === 0 ? (
          <div className="empty-state">
            <AiOutlineHome className="empty-icon" />
            <h3>Henüz kayıtlı firma bulunmuyor</h3>
            <p>Kayıtlı müşteri firmaları burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="companies-grid">
            {clients.map((client) => (
              <div key={client.id} className="company-card">
                <div className="company-header">
                  <AiOutlineHome className="company-icon" />
                  <h3 className="company-name">{client.companyName}</h3>
                </div>
                
                <div className="company-details">
                  <div className="detail-item">
                    <AiOutlineUser className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">İletişim Kişisi</span>
                      <span className="detail-value">{client.contactName}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <AiOutlineMail className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">E-posta</span>
                      <span className="detail-value">{client.email}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <AiOutlinePhone className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Telefon</span>
                      <span className="detail-value">{client.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="company-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditCompany(client)}
                  >
                    <AiOutlineEdit className="button-icon" />
                    Düzenle
                  </button>
                  <button 
                    className="view-offer-button"
                    onClick={() => handleViewOffers(client)}
                  >
                    <AiOutlineFileText className="button-icon" />
                    Teklifleri Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ViewOfferModal
        isOpen={isViewOfferModalOpen}
        onClose={handleCloseViewOfferModal}
        clientId={selectedClient?.id}
        clientName={selectedClient?.companyName}
      />
      
      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        client={editingClient}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default RegisteredCompanies;
