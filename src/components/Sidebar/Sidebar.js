import React from 'react';
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
  AiOutlineCheckCircle
} from 'react-icons/ai';
import './Sidebar.css';

// activeMenuItem ve setActiveMenuItem proptype'ları, hangi menü öğesinin aktif olduğunu belirlemek için kullanılır.
const Sidebar = ({ activeMenuItem, setActiveMenuItem }) => {
  
  // Menü öğeleri, daha kolay yönetim için bir nesne içinde gruplandırıldı.
  const menuItems = {
    main: [
      { id: 'main-menu', label: 'AVITECH', icon: AiOutlineHome }
    ],
    services: [
      { id: 'create-service', label: 'Yeni Proje Oluştur', icon: AiOutlinePlus },
      { id: 'all-services', label: 'Bütün Projeler', icon: AiOutlineFolder },
      { id: 'quotes-sent', label: 'Teklif Gönderilen Projeler', icon: AiOutlineSend },
      { id: 'closed-projects', label: 'Kapatılan Projeler', icon: AiOutlineCheckCircle }
    ],
    users: [
      { id: 'all-users', label: 'Tüm Kullanıcılar', icon: AiOutlineTeam },
      { id: 'new-user', label: 'Yeni Kullanıcı', icon: AiOutlineUserAdd }, // İkon güncellendi
      { id: 'profile', label: 'Profilim', icon: AiOutlineUser }
    ],
    other: [
      { id: 'manual', label: 'Kullanım Kılavuzu', icon: AiOutlineFile },
      { id: 'error-receipts', label: 'Hatalı Proje Formları', icon: AiOutlineDelete },
    ]
  };

  // Belirli bir bölümdeki menü öğelerini render eden yardımcı fonksiyon
  const renderMenuItems = (items) => {
    return items.map(item => (
      <div 
        key={item.id}
        className={`menu-item ${activeMenuItem === item.id ? 'active' : ''}`}
        onClick={() => setActiveMenuItem(item.id)}
      >
        <item.icon className="menu-icon" />
        <span className="menu-label">{item.label}</span>
      </div>
    ));
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
      </div>
    </div>
  );
};

export default Sidebar;