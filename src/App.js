import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import CreateServiceReceipt from './components/ServiceReceipt/CreateServiceReceipt';
import AllServices from './components/ServiceReceipt/AllServices';
import QuotesSent from './components/ServiceReceipt/QuotesSent';
import ClosedProjects from './components/ServiceReceipt/ClosedProjects';
import MainMenu from './components/MainMenu/MainMenu';
import './App.css';

function App() {
  const [activeComponent, setActiveComponent] = useState('main-menu');
  const [editingService, setEditingService] = useState(null);

  const handleEditService = (service) => {
    setEditingService(service);
    setActiveComponent('create-service');
  };

  const handleSaveComplete = (savedService) => {
    setEditingService(null);
    setActiveComponent('all-services');
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'create-service':
        return (
          <CreateServiceReceipt 
            editingService={editingService}
            onSaveComplete={handleSaveComplete}
          />
        );
      case 'main-menu':
        return <MainMenu />;
      case 'all-services':
        return (
          <AllServices 
            onEditService={handleEditService}
          />
        );
      case 'quotes-sent':
        return (
          <QuotesSent 
            onEditService={handleEditService}
          />
        );
      case 'closed-projects':
        return (
          <ClosedProjects 
            onEditService={handleEditService}
          />
        );
      default:
        return (
          <div className="placeholder-content">
            <h1>Sayfa Bulunamadı</h1>
            <p>Seçilen sayfa henüz hazır değil.</p>
          </div>
        );
    }
  };

  const handleMenuItemChange = (menuItem) => {
    // Reset editing service when manually navigating to create-service
    if (menuItem === 'create-service' && editingService) {
      setEditingService(null);
    }
    setActiveComponent(menuItem);
  };

  return (
    <div className="App">
      <MainLayout activeMenuItem={activeComponent} setActiveMenuItem={handleMenuItemChange}>
        {renderContent()}
      </MainLayout>
    </div>
  );
}

export default App;
