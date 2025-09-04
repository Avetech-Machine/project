import React, { useState, useEffect, useRef } from 'react';
import CostDetails from './CostDetails';
import SalesAnalysis from './SalesAnalysis';
import { getExchangeRates } from '../../services/currencyService';
import { FaEuroSign, FaChartLine, FaPlus, FaCamera, FaTimes } from 'react-icons/fa';
import './CreateServiceReceipt.css';

const CreateServiceReceipt = ({ editingService, onSaveComplete }) => {
  const [formData, setFormData] = useState({
    // Machine Information
    machineName: '',
    year: '2024',
    workingHours: '',
    repairHours: '', // This now represents "Devri/dakika"
    serialNumber: '',
    teamCount: '2',
    machineNetWeight: '', // New field
    additionalWeight: '', // New field
    
    // Operating System
    operatingSystem: 'Heidenhain',
    
    // Measurement Probes
    teamMeasurementProbe: 'Var',
    partMeasurementProbe: 'Var', 
    insideWaterGiving: 'Yok',
    
    // New Features
    conveyor: 'Yok',
    paperFilter: 'Yok',
    
    // Accessory Data
    accessoryData: '',
    
    // Photos
    photos: []
  });

  const [keyInformation, setKeyInformation] = useState(1); // New state for key information tabs
  const [projectCode, setProjectCode] = useState(1000); // Project code starting at 1000
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [costDetails, setCostDetails] = useState([
    { id: 1, description: 'Otel', currency: 'EUR', amount: 200 },
    { id: 2, description: 'Lojistik', currency: 'EUR', amount: 10000 }
  ]);

  const [salesPrice, setSalesPrice] = useState(20000);
  const [exchangeRates, setExchangeRates] = useState({
    EUR: 1.0,
    TRY: 34.5,
    USD: 1.09
  });
  const [isRatesLoading, setIsRatesLoading] = useState(true);

  // Fetch live exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsRatesLoading(true);
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setIsRatesLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 10 minutes
    const intervalId = setInterval(fetchExchangeRates, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Populate form when editing a service
  useEffect(() => {
    if (editingService) {
      setFormData({
        machineName: editingService.machineName || '',
        year: editingService.year || '2024',
        workingHours: editingService.workingHours || '',
        repairHours: editingService.repairHours || '',
        serialNumber: editingService.serialNumber || '',
        teamCount: editingService.teamCount || '2',
        machineNetWeight: editingService.machineNetWeight || '',
        additionalWeight: editingService.additionalWeight || '',
        operatingSystem: editingService.operatingSystem || 'Heidenhain',
        teamMeasurementProbe: editingService.teamMeasurementProbe || 'Var',
        partMeasurementProbe: editingService.partMeasurementProbe || 'Var',
        insideWaterGiving: editingService.insideWaterGiving || 'Yok',
        conveyor: editingService.conveyor || 'Yok',
        paperFilter: editingService.paperFilter || 'Yok',
        accessoryData: editingService.accessoryData || '',
        photos: editingService.photos || []
      });
      
      // Set key information if it exists, otherwise default to 1
      setKeyInformation(editingService.keyInformation || 1);
      
      // Set project code if it exists, otherwise get next available code
      if (editingService.projectCode) {
        setProjectCode(editingService.projectCode);
      }
      
      if (editingService.costDetails) {
        setCostDetails(editingService.costDetails);
      }
      
      if (editingService.salesPrice) {
        setSalesPrice(editingService.salesPrice);
      }
    } else {
      // For new projects, get the next available project code
      const existingServices = JSON.parse(localStorage.getItem('serviceReceipts') || '[]');
      const maxProjectCode = Math.max(...existingServices.map(service => service.projectCode || 999), 999);
      setProjectCode(maxProjectCode + 1);
    }
  }, [editingService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRpmInput = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      repairHours: value
    }));
  };

  const handleRpmKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target;
      const value = input.value.replace(/,/g, ''); // Remove existing commas
      
      // Check if it's a valid number
      if (!isNaN(value) && value !== '') {
        // Format with commas
        const formattedValue = parseInt(value).toLocaleString();
        // Add "Max 1/min" suffix
        const finalValue = `${formattedValue} Max 1/min`;
        
        setFormData(prev => ({
          ...prev,
          repairHours: finalValue
        }));
        
        // Close keyboard by blurring the input
        input.blur();
      }
    }
  };

  const handleWorkingHoursInput = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      workingHours: value
    }));
  };

  const handleWorkingHoursKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target;
      const value = input.value.replace(/,/g, ''); // Remove existing commas
      
      // Check if it's a valid number
      if (!isNaN(value) && value !== '') {
        // Format with commas
        const formattedValue = parseInt(value).toLocaleString();
        // Add "saat" suffix
        const finalValue = `${formattedValue} saat`;
        
        setFormData(prev => ({
          ...prev,
          workingHours: finalValue
        }));
        
        // Close keyboard by blurring the input
        input.blur();
      }
    }
  };

  const handleKeyInformationChange = (tabNumber) => {
    setKeyInformation(tabNumber);
  };

  // Photo handling functions
  const handlePhotoUpload = (event, source) => {
    console.log('Photo upload triggered:', source);
    const files = event.target.files;
    console.log('Selected files:', files);
    
    if (files && files.length > 0) {
      const newPhotos = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      
      console.log('New photos to add:', newPhotos);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
    
    // Reset input
    event.target.value = '';
  };

  const handlePhotoDelete = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotoIndex(null);
  };

  const openFileUpload = () => {
    console.log('Opening file upload...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const addCostDetail = () => {
    const newId = Math.max(...costDetails.map(item => item.id), 0) + 1;
    setCostDetails(prev => [
      ...prev,
      { id: newId, description: '', currency: 'EUR', amount: 0 }
    ]);
  };

  const updateCostDetail = (id, field, value) => {
    setCostDetails(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const deleteCostDetail = (id) => {
    setCostDetails(prev => prev.filter(item => item.id !== id));
  };

  const totalCost = costDetails.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const netProfit = salesPrice - totalCost;
  const profitMargin = totalCost > 0 ? ((netProfit / salesPrice) * 100).toFixed(1) : 0;

  const generateServiceId = () => {
    const machinePrefix = formData.machineName
      .split(' ')
      .map(word => word.substring(0, 3).toUpperCase())
      .join('');
    const year = formData.year;
    const timestamp = Date.now().toString().slice(-3);
    return `${machinePrefix}-${year}-${timestamp}`;
  };

  const handleSave = () => {
    // Create service object
    const serviceData = {
      id: editingService?.id || generateServiceId(),
      ...formData,
      keyInformation: keyInformation, // Add key information to saved data
      projectCode: projectCode, // Add project code to saved data
      costDetails: costDetails,
      totalCost: totalCost,
      salesPrice: salesPrice,
      netProfit: netProfit,
      profitMargin: parseFloat(profitMargin),
      createdDate: editingService?.createdDate || new Date().toLocaleDateString('tr-TR'),
      status: editingService?.status || 'Taslak'
    };

    // Special handling for Haas VF-4SS - preserve "Satıldı" status
    if (editingService?.id === 'HAAS-2021-012') {
      serviceData.status = 'Satıldı';
    }

    // Get existing services from localStorage
    const existingServices = JSON.parse(localStorage.getItem('serviceReceipts') || '[]');
    
    if (editingService) {
      // Update existing service
      const updatedServices = existingServices.map(service => 
        service.id === editingService.id ? serviceData : service
      );
      localStorage.setItem('serviceReceipts', JSON.stringify(updatedServices));
    } else {
      // Add new service
      const updatedServices = [...existingServices, serviceData];
      localStorage.setItem('serviceReceipts', JSON.stringify(updatedServices));
    }

    // Call the callback if provided
    if (onSaveComplete) {
      onSaveComplete(serviceData);
    }

    // Reset form if creating new service
    if (!editingService) {
      setFormData({
        machineName: '',
        year: '2024',
        workingHours: '',
        repairHours: '',
        serialNumber: '',
        teamCount: '2',
        machineNetWeight: '',
        additionalWeight: '',
        operatingSystem: 'Heidenhain',
        teamMeasurementProbe: 'Var',
        partMeasurementProbe: 'Var',
        insideWaterGiving: 'Yok',
        conveyor: 'Yok',
        paperFilter: 'Yok',
        accessoryData: '',
        photos: []
      });
      setCostDetails([
        { id: 1, description: 'Otel', currency: 'EUR', amount: 200 },
        { id: 2, description: 'Lojistik', currency: 'EUR', amount: 10000 }
      ]);
      setSalesPrice(20000);
    }

    alert(editingService ? 'Proje güncellendi!' : 'Proje başarıyla oluşturuldu!');
  };

  return (
    <div className="create-service-receipt">
      
      {/* Machine Information Section */}
      <div className="form-section">
        <h2 className="section-title">Makine Bilgileri</h2>
        
        {/* Photo Upload Section */}
        <div className="form-row">
          <div className="form-group full-width">
            <label>Fotoğraf Ekle</label>
            <div className="photo-upload-container">
              <div className="photo-upload-buttons">
                <button 
                  type="button" 
                  className="photo-upload-btn"
                  onClick={openFileUpload}
                >
                  <FaPlus className="upload-icon" />
                  Dosyadan Ekle
                </button>
                <button 
                  type="button" 
                  className="photo-upload-btn camera-btn"
                  onClick={openCamera}
                >
                  <FaCamera className="upload-icon" />
                  Kamera ile Çek
                </button>
              </div>
              
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'file')}
                style={{ display: 'none' }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload(e, 'camera')}
                style={{ display: 'none' }}
              />
              
              {/* Photo previews */}
              {formData.photos.length > 0 && (
                <div className="photo-previews">
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id} className="photo-preview-container">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="photo-preview"
                        onClick={() => handlePhotoClick(index)}
                      />
                      <button
                        type="button"
                        className="photo-delete-btn"
                        onClick={() => handlePhotoDelete(photo.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Project Code Display */}
        <div className="project-code-display">
          Proje Kodu: {projectCode}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Makine Adı</label>
            <input
              type="text"
              value={formData.machineName}
              onChange={(e) => handleInputChange('machineName', e.target.value)}
              placeholder="Dmg Mori"
            />
          </div>
          <div className="form-group">
            <label>Yılı</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
  <div className="form-group">
    <label>Saati</label>
    <input
      type="text"
      value={formData.workingHours}
      onChange={handleWorkingHoursInput}
      onKeyPress={handleWorkingHoursKeyPress}
      placeholder="Çalışma saati"
    />
  </div>
  <div className="form-group">
    <label>Devri</label>
    <input
      type="text"
      value={formData.repairHours}
      onChange={handleRpmInput}
      onKeyPress={handleRpmKeyPress}
      placeholder="Devri/dakika"
    />
  </div>
</div>

        <div className="form-row">
          <div className="form-group">
            <label>Seri No</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              placeholder="Seri numarası"
            />
          </div>
          <div className="form-group">
            <label>Takım Sayısı</label>
            <input
              type="text"
              value={formData.teamCount}
              onChange={(e) => handleInputChange('teamCount', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Makine Net Kilo</label>
            <input
              type="text"
              value={formData.machineNetWeight}
              onChange={(e) => handleInputChange('machineNetWeight', e.target.value)}
              placeholder="kg"
            />
          </div>
          <div className="form-group">
            <label>Ek Kilo</label>
            <input
              type="text"
              value={formData.additionalWeight}
              onChange={(e) => handleInputChange('additionalWeight', e.target.value)}
              placeholder="kg"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>İşletim Sistemi</label>
            <select
              value={formData.operatingSystem}
              onChange={(e) => handleInputChange('operatingSystem', e.target.value)}
              className="form-select"
            >
              <option value="Heidenhain">Heidenhain</option>
              <option value="Siemens">Siemens</option>
              <option value="Fanuc">Fanuc</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group justify-end">
            <label>Anahtar Bilgisi</label>
            <div className="tab-indicators">
              <span 
                className={`tab-number ${keyInformation === 1 ? 'active' : ''}`}
                onClick={() => handleKeyInformationChange(1)}
              >
                1
              </span>
              <span 
                className={`tab-number ${keyInformation === 2 ? 'active' : ''}`}
                onClick={() => handleKeyInformationChange(2)}
              >
                2
              </span>
              <span 
                className={`tab-number ${keyInformation === 3 ? 'active' : ''}`}
                onClick={() => handleKeyInformationChange(3)}
              >
                3
              </span>
              <span 
                className={`tab-number ${keyInformation === 4 ? 'active' : ''}`}
                onClick={() => handleKeyInformationChange(4)}
              >
                4
              </span>
            </div>
          </div>
        </div>

        {/* Measurement Probes Section */}
        <div className="measurement-section">
          <div className="measurement-row">
            <div className="measurement-group">
              <span className="measurement-label">Takım Ölçme Probu</span>
              <div className="radio-group-vertical">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="teamMeasurementProbe"
                    value="Var"
                    checked={formData.teamMeasurementProbe === 'Var'}
                    onChange={(e) => handleInputChange('teamMeasurementProbe', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Var
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="teamMeasurementProbe"
                    value="Yok"
                    checked={formData.teamMeasurementProbe === 'Yok'}
                    onChange={(e) => handleInputChange('teamMeasurementProbe', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Yok
                </label>
              </div>
            </div>

            <div className="measurement-group">
              <span className="measurement-label">Parça Ölçme Probu</span>
              <div className="radio-group-vertical">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="partMeasurementProbe"
                    value="Var"
                    checked={formData.partMeasurementProbe === 'Var'}
                    onChange={(e) => handleInputChange('partMeasurementProbe', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Var
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="partMeasurementProbe"
                    value="Yok"
                    checked={formData.partMeasurementProbe === 'Yok'}
                    onChange={(e) => handleInputChange('partMeasurementProbe', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Yok
                </label>
              </div>
            </div>

            <div className="measurement-group">
              <span className="measurement-label">İçten Su Verme</span>
              <div className="radio-group-vertical">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="insideWaterGiving"
                    value="Var"
                    checked={formData.insideWaterGiving === 'Var'}
                    onChange={(e) => handleInputChange('insideWaterGiving', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Var
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="insideWaterGiving"
                    value="Yok"
                    checked={formData.insideWaterGiving === 'Yok'}
                    onChange={(e) => handleInputChange('insideWaterGiving', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Yok
                </label>
              </div>
            </div>

            <div className="measurement-group">
              <span className="measurement-label">Konveyör</span>
              <div className="radio-group-vertical">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="conveyor"
                    value="Var"
                    checked={formData.conveyor === 'Var'}
                    onChange={(e) => handleInputChange('conveyor', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Var
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="conveyor"
                    value="Yok"
                    checked={formData.conveyor === 'Yok'}
                    onChange={(e) => handleInputChange('conveyor', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Yok
                </label>
              </div>
            </div>

            <div className="measurement-group">
              <span className="measurement-label">Kağıt Filtre</span>
              <div className="radio-group-vertical">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paperFilter"
                    value="Var"
                    checked={formData.paperFilter === 'Var'}
                    onChange={(e) => handleInputChange('paperFilter', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Var
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paperFilter"
                    value="Yok"
                    checked={formData.paperFilter === 'Yok'}
                    onChange={(e) => handleInputChange('paperFilter', e.target.value)}
                  />
                  <span className="radio-dot"></span>
                  Yok
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Yanında Verilecek Ek Aksesuar</label>
            <textarea
              value={formData.accessoryData}
              onChange={(e) => handleInputChange('accessoryData', e.target.value)}
              placeholder="Takım Çantası"
              className="accessory-textarea"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Cost Details Section */}
      <CostDetails
        costDetails={costDetails}
        onAddCost={addCostDetail}
        onUpdateCost={updateCostDetail}
        onDeleteCost={deleteCostDetail}
        exchangeRates={exchangeRates}
        isRatesLoading={isRatesLoading}
      />

      {/* Sales and Profit Analysis */}
      <SalesAnalysis
        totalCost={totalCost}
        salesPrice={salesPrice}
        setSalesPrice={setSalesPrice}
        netProfit={netProfit}
        profitMargin={profitMargin}
        exchangeRates={exchangeRates}
        isRatesLoading={isRatesLoading}
      />

      {/* Action Buttons */}
      <div className="form-actions">
        <button type="button" className="btn-cancel">İptal</button>
        <button type="button" className="btn-save" onClick={handleSave}>
          {editingService ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedPhotoIndex !== null && (
        <div className="photo-modal-overlay" onClick={closePhotoModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={closePhotoModal}>
              <FaTimes />
            </button>
            <img
              src={formData.photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="photo-modal-image"
            />
            <div className="photo-modal-nav">
              <button
                className="photo-nav-btn"
                onClick={() => setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1))}
                disabled={selectedPhotoIndex === 0}
              >
                ‹
              </button>
              <span className="photo-counter">
                {selectedPhotoIndex + 1} / {formData.photos.length}
              </span>
              <button
                className="photo-nav-btn"
                onClick={() => setSelectedPhotoIndex(Math.min(formData.photos.length - 1, selectedPhotoIndex + 1))}
                disabled={selectedPhotoIndex === formData.photos.length - 1}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateServiceReceipt;