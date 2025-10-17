import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AiOutlineHome, 
  AiOutlinePlus, 
  AiOutlineFolder,
  AiOutlineUserAdd, // İkon güncellendi
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineFile,
  AiOutlineDelete,
  AiOutlineWarning,
  AiOutlineSend,
  AiOutlineCheckCircle,
  AiOutlineLogout
} from 'react-icons/ai';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Menü öğeleri, daha kolay yönetim için bir nesne içinde gruplandırıldı.
  const menuItems = {
    main: [
      { id: 'main-menu', label: user?.username || 'AVITECH', icon: AiOutlineHome, path: '/mainMenu' }
    ],
    services: [
      { id: 'create-service', label: 'Yeni Proje Oluştur', icon: AiOutlinePlus, path: '/createService' },
      { id: 'all-services', label: 'Bütün Projeler', icon: AiOutlineFolder, path: '/allServices' },
      { id: 'quotes-sent', label: 'Teklif Gönderilen Projeler', icon: AiOutlineSend, path: '/quotesSent' },
      { id: 'closed-projects', label: 'Kapatılan Projeler', icon: AiOutlineCheckCircle, path: '/closedProjects' }
    ],
    users: [
      { id: 'all-users', label: 'Tüm Kullanıcılar', icon: AiOutlineTeam, path: '/allUsers' },
      { id: 'new-user', label: 'Yeni Kullanıcı', icon: AiOutlineUserAdd, path: '/newUser' }, // İkon güncellendi
      { id: 'profile', label: 'Profilim', icon: AiOutlineUser, path: '/profile' }
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
        <item.icon className="menu-icon" />
        <span className="menu-label">{item.label}</span>
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
            <span className="section-title">AYARLAR</span>
          </div>
          {renderMenuItems(menuItems.users)}
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