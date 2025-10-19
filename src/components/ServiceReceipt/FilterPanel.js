import React, { useState } from 'react';
import { AiOutlineFilter, AiOutlineClear } from 'react-icons/ai';
import './FilterPanel.css';

const FilterPanel = ({ onFilter, onClear }) => {
  const [filters, setFilters] = useState({
    projectCode: '',
    machineName: '',
    model: '',
    make: '',
    year: '',
    status: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const statusOptions = [
    { value: '', label: 'Durum Seçin' },
    { value: 'TEMPLATE', label: 'Taslak' },
    { value: 'OFFER_SENT', label: 'Teklif Gönderildi' },
    { value: 'SOLD', label: 'Satıldı' },
    { value: 'BOUGHT', label: 'Satın Alındı' },
    { value: 'CANCELLED', label: 'İptal Edildi' }
  ];

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = async () => {
    setIsFiltering(true);
    try {
      await onFilter(filters);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      projectCode: '',
      machineName: '',
      model: '',
      make: '',
      year: '',
      status: ''
    };
    setFilters(emptyFilters);
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="filter-panel-container">
      <div className="filter-header">
        <button 
          className="filter-toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <AiOutlineFilter className="filter-icon" />
          <span>Filtreler</span>
          {hasActiveFilters && <span className="active-indicator"></span>}
        </button>
        
        {hasActiveFilters && (
          <button 
            className="clear-filters-button"
            onClick={handleClearFilters}
            title="Filtreleri Temizle"
          >
            <AiOutlineClear />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-grid">
            <div className="filter-field">
              <label htmlFor="projectCode">Proje Kodu</label>
              <input
                id="projectCode"
                type="text"
                placeholder="Proje kodunu girin"
                value={filters.projectCode}
                onChange={(e) => handleInputChange('projectCode', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="machineName">Makine Adı</label>
              <input
                id="machineName"
                type="text"
                placeholder="Makine adını girin"
                value={filters.machineName}
                onChange={(e) => handleInputChange('machineName', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                type="text"
                placeholder="Model adını girin"
                value={filters.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="make">Marka</label>
              <input
                id="make"
                type="text"
                placeholder="Marka adını girin"
                value={filters.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="year">Yıl</label>
              <input
                id="year"
                type="number"
                placeholder="Yıl girin"
                value={filters.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                min="1900"
                max="2030"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="status">Durum</label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button 
              className="apply-filter-button"
              onClick={handleApplyFilter}
              disabled={isFiltering}
            >
              {isFiltering ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Filtreleniyor...</span>
                </>
              ) : (
                <>
                  <AiOutlineFilter />
                  <span>Filtrele</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
