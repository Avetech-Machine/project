import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AiOutlineHome, 
  AiOutlinePlus, 
  AiOutlineFolder,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineFile,
  AiOutlineDelete,
  AiOutlineWarning,
  AiOutlineSend,
  AiOutlineCheckCircle,
  AiOutlineLogout,
  AiOutlineBank
} from 'react-icons/ai';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Menü öğeleri, daha kolay yönetim için bir nesne içinde gruplandırıldı.
  const menuItems = {
    main: [
      { id: 'main-menu', label: '', icon: null, path: '/mainMenu', isLogo: true }
    ],
    services: [
      { id: 'create-service', label: 'Yeni Proje Oluştur', icon: AiOutlinePlus, path: '/createService' },
      { id: 'all-services', label: 'Aktif Projeler', icon: AiOutlineFolder, path: '/allServices' },
      { id: 'quotes-sent', label: 'Teklifler', icon: AiOutlineSend, path: '/quotesSent' },
      { id: 'closed-projects', label: 'Tamamlanan Projeler', icon: AiOutlineCheckCircle, path: '/closedProjects' }
    ],
    userActions: [
      { id: 'user-management', label: 'Kullanıcı İşlemleri', icon: AiOutlineTeam, path: '/userManagement' },
      { id: 'registered-companies', label: 'Kayıtlı Firmalar', icon: AiOutlineBank, path: '/registeredCompanies' }
    ],
    other: [
      { id: 'manual', label: 'Kullanım Kılavuzu', icon: AiOutlineFile, path: '/manual' },
      { id: 'error-receipts', label: 'Hatalı Proje Formları', icon: AiOutlineDelete, path: '/errorReceipts' },
    ]
  };

  // Belirli bir bölümdeki menü öğelerini render eden yardımcı fonksiyon
  const renderMenuItems = (items) => {
    return items.map(item => (
      <div 
        key={item.id}
        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
        onClick={() => navigate(item.path)}
      >
        {item.isLogo ? (
          <img 
            src="/assets/avitech_logo.png" 
            alt="Avitech Logo" 
            className="menu-logo"
          />
        ) : (
          <item.icon className="menu-icon" />
        )}
        {!item.isLogo && <span className="menu-label">{item.label}</span>}
      </div>
    ));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Ana Menü */}
        <div className="menu-section">
          {renderMenuItems(menuItems.main)}
        </div>

        {/* Servis İşlemleri */}
        <div className="menu-section">
          <div className="section-header">
            <span className="section-title">SERVİS İŞLEMLERİ</span>
          </div>
          {renderMenuItems(menuItems.services)}
        </div>

        {/* Kullanıcı İşlemleri */}
        <div className="menu-section">
          <div className="section-header">
            <span className="section-title">KULLANICI İŞLEMLERİ</span>
          </div>
          {renderMenuItems(menuItems.userActions)}
        </div>

        {/* Diğer İçerikler */}
        <div className="menu-section">
          <div className="section-header">
            <span className="section-title">DİĞER İÇERİKLER</span>
          </div>
          {renderMenuItems(menuItems.other)}
        </div>

        {/* Kullanıcı Bilgisi ve Çıkış */}
        <div className="menu-section user-section">
         
          <div 
            className="menu-item logout-item"
            onClick={handleLogout}
          >
            <AiOutlineLogout className="menu-icon" />
            <span className="menu-label">Çıkış Yap</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;