import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, activeMenuItem, setActiveMenuItem }) => {
  return (
    <div className="main-layout">
      <Sidebar 
        activeMenuItem={activeMenuItem} 
        setActiveMenuItem={setActiveMenuItem} 
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
