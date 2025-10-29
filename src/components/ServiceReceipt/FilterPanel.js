import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineFilter, AiOutlineClear, AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import './FilterPanel.css';

const FilterPanel = ({ onFilter, onClear }) => {
  const [activeFilters, setActiveFilters] = useState([]); // Array of { field: '', value: '' }
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addFilterContainerRef = useRef(null);

  // Available filter options (excluding status)
  const availableFilterOptions = [
    { key: 'projectCode', label: 'Proje Kodu', type: 'text', placeholder: 'Proje kodunu girin' },
    { key: 'machineName', label: 'Makine Adı', type: 'text', placeholder: 'Makine adını girin' },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'Model adını girin' },
    { key: 'make', label: 'Marka', type: 'text', placeholder: 'Marka adını girin' },
    { key: 'year', label: 'Yıl', type: 'number', placeholder: 'Yıl girin', min: '1900', max: '2030' },
    { key: 'serialNumber', label: 'Seri Numarası', type: 'text', placeholder: 'Seri numarasını girin' },
    { key: 'firmName', label: 'Firma Adı', type: 'text', placeholder: 'Firma adını girin' },
    { key: 'controlUnit', label: 'Kontrol Ünitesi', type: 'text', placeholder: 'Kontrol ünitesini girin' }
  ];

  // Get available options that haven't been added yet
  const getAvailableOptions = () => {
    const activeFields = activeFilters.map(f => f.field);
    return availableFilterOptions.filter(opt => !activeFields.includes(opt.key));
  };

  // Handle adding a new filter field
  const handleAddFilter = (fieldKey) => {
    const option = availableFilterOptions.find(opt => opt.key === fieldKey);
    if (option) {
      setActiveFilters(prev => [...prev, { 
        field: fieldKey, 
        value: '',
        label: option.label,
        type: option.type,
        placeholder: option.placeholder,
        min: option.min,
        max: option.max
      }]);
    }
    setShowAddDropdown(false);
  };

  // Handle removing a filter field
  const handleRemoveFilter = (index) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  // Handle input value change
  const handleInputChange = (index, value) => {
    setActiveFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, value } : filter
    ));
  };

  // Convert active filters to the format expected by the API
  const getFiltersObject = () => {
    const filters = {};
    activeFilters.forEach(filter => {
      if (filter.value !== '') {
        filters[filter.field] = filter.value;
      }
    });
    return filters;
  };

  // Auto-apply filter when values change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeFilters.length > 0) {
        const filters = getFiltersObject();
        if (Object.keys(filters).length > 0) {
          handleApplyFilter();
        }
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  // Apply filter
  const handleApplyFilter = async () => {
    setIsFiltering(true);
    try {
      const filters = getFiltersObject();
      await onFilter(filters);
    } finally {
      setIsFiltering(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters([]);
    onClear();
  };

  const hasActiveFilters = activeFilters.some(f => f.value !== '');
  const availableOptions = getAvailableOptions();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showAddDropdown) return;

    const handleClickOutside = (event) => {
      if (addFilterContainerRef.current && !addFilterContainerRef.current.contains(event.target)) {
        setShowAddDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddDropdown]);

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
          <div className="filter-fields-container">
            {activeFilters.map((filter, index) => (
              <div key={`${filter.field}-${index}`} className="filter-field-row">
                <div className="filter-field">
                  <label>{filter.label}</label>
                  <input
                    type={filter.type}
                    placeholder={filter.placeholder}
                    value={filter.value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    min={filter.min}
                    max={filter.max}
                  />
                </div>
                <button
                  className="remove-filter-button"
                  onClick={() => handleRemoveFilter(index)}
                  title="Filtreyi Kaldır"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}

            {availableOptions.length > 0 && (
              <div className="add-filter-container" ref={addFilterContainerRef}>
                <button
                  className="add-filter-button"
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                >
                  <AiOutlinePlus />
                  <span>Filtre Ekle</span>
                </button>
                {showAddDropdown && (
                  <div className="filter-dropdown">
                    {availableOptions.map(option => (
                      <button
                        key={option.key}
                        className="filter-dropdown-item"
                        onClick={() => handleAddFilter(option.key)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isFiltering && (
            <div className="filter-loading">
              <div className="loading-spinner-small"></div>
              <span>Filtreleniyor...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;



