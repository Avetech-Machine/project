import React, { useState, useEffect, useRef } from 'react';
import CostDetails from './CostDetails';
import SalesAnalysis from './SalesAnalysis';
import { getExchangeRates } from '../../services/currencyService';
import projectService from '../../services/projectService';
import { FaEuroSign, FaChartLine, FaPlus, FaCamera, FaTimes } from 'react-icons/fa';
import './CreateServiceReceipt.css';
import './EditProjectModal.css';

const EditProjectModal = ({ project, onClose, onSaveComplete }) => {
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
  const [isSaving, setIsSaving] = useState(false);

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

  // Populate form when editing a project
  useEffect(() => {
    if (project) {
      console.log('=== PROJECT DATA FOR EDITING ===');
      console.log('Raw project data:', project);
      console.log('Project ID:', project.id);
      console.log('Machine Name:', project.machineName);
      console.log('Year:', project.year, 'Type:', typeof project.year);
      console.log('Hours Operated:', project.hoursOperated, 'Type:', typeof project.hoursOperated);
      console.log('RPM:', project.rpm, 'Type:', typeof project.rpm);
      console.log('Serial Number:', project.serialNumber);
      console.log('Team Number:', project.teamNumber, 'Type:', typeof project.teamNumber);
      console.log('Takim Sayisi (legacy):', project.takimSayisi, 'Type:', typeof project.takimSayisi);
      console.log('Net Weight:', project.netWeight, 'Type:', typeof project.netWeight);
      console.log('Additional Weight:', project.additionalWeight, 'Type:', typeof project.additionalWeight);
      console.log('Operating System:', project.operatingSystem);
      console.log('Key Info:', project.keyInfo, 'Type:', typeof project.keyInfo);
      console.log('Anahtar Bilgisi (legacy):', project.anahtarBilgisi, 'Type:', typeof project.anahtarBilgisi);
      console.log('Tool Measure Probe:', project.toolMeasureProbe, 'Type:', typeof project.toolMeasureProbe);
      console.log('Takim Olcme Probu (legacy):', project.takimOlcmeProbu, 'Type:', typeof project.takimOlcmeProbu);
      console.log('Part Measure Probe:', project.partMeasureProbe, 'Type:', typeof project.partMeasureProbe);
      console.log('Parca Olcme Probu (legacy):', project.parcaOlcmeProbu, 'Type:', typeof project.parcaOlcmeProbu);
      console.log('Internal Water:', project.internalWater, 'Type:', typeof project.internalWater);
      console.log('Icten Su Verme (legacy):', project.ictenSuVerme, 'Type:', typeof project.ictenSuVerme);
      console.log('Conveyor:', project.conveyor, 'Type:', typeof project.conveyor);
      console.log('Paper Filter:', project.paperFilter, 'Type:', typeof project.paperFilter);
      console.log('Kagit Filtre (legacy):', project.kagitFiltre, 'Type:', typeof project.kagitFiltre);
      console.log('Cost Details:', project.costDetails);
      console.log('Price Details:', project.priceDetails);
      console.log('================================');
      
      setFormData({
        machineName: project.machineName || project.title || '',
        year: project.year ? project.year.toString() : '2024',
        workingHours: project.hoursOperated ? project.hoursOperated.toString() : (project.workingHours || ''),
        repairHours: project.rpm ? project.rpm.toString() : (project.repairHours || ''),
        serialNumber: project.serialNumber || '',
        teamCount: (project.teamNumber || project.takimSayisi) ? (project.teamNumber || project.takimSayisi).toString() : (project.teamCount || '2'),
        machineNetWeight: project.netWeight ? project.netWeight.toString() : (project.machineNetWeight || ''),
        additionalWeight: project.additionalWeight ? project.additionalWeight.toString() : '',
        operatingSystem: project.operatingSystem || 'Heidenhain',
        teamMeasurementProbe: (project.toolMeasureProbe || project.takimOlcmeProbu) ? 'Var' : (project.teamMeasurementProbe || 'Var'),
        partMeasurementProbe: (project.partMeasureProbe || project.parcaOlcmeProbu) ? 'Var' : (project.partMeasurementProbe || 'Var'),
        insideWaterGiving: (project.internalWater || project.ictenSuVerme) ? 'Var' : (project.insideWaterGiving || 'Yok'),
        conveyor: project.conveyor ? 'Var' : (project.conveyor || 'Yok'),
        paperFilter: (project.paperFilter || project.kagitFiltre) ? 'Var' : (project.paperFilter || 'Yok'),
        accessoryData: project.additionalEquipment || project.accessoryData || '',
        photos: project.photos || []
      });
      
      console.log('=== FORM DATA SET ===');
      console.log('Form Data after setting:', {
        machineName: project.machineName || project.title || '',
        year: project.year ? project.year.toString() : '2024',
        workingHours: project.hoursOperated ? project.hoursOperated.toString() : (project.workingHours || ''),
        repairHours: project.rpm ? project.rpm.toString() : (project.repairHours || ''),
        teamCount: project.takimSayisi ? project.takimSayisi.toString() : (project.teamCount || '2'),
        teamMeasurementProbe: project.takimOlcmeProbu ? 'Var' : (project.teamMeasurementProbe || 'Var'),
        partMeasurementProbe: project.parcaOlcmeProbu ? 'Var' : (project.partMeasurementProbe || 'Var'),
        insideWaterGiving: project.ictenSuVerme ? 'Var' : (project.insideWaterGiving || 'Yok'),
        conveyor: project.konveyor ? 'Var' : (project.conveyor || 'Yok'),
        paperFilter: project.kagitFiltre ? 'Var' : (project.paperFilter || 'Yok')
      });
      console.log('=====================');
      
      // Set key information if it exists, otherwise default to 1
      const keyInfo = project.keyInfo || project.anahtarBilgisi || project.keyInformation || 1;
      setKeyInformation(typeof keyInfo === 'string' ? parseInt(keyInfo) : keyInfo);
      
      // Set project code if it exists, otherwise get next available code
      if (project.projectCode) {
        // Extract number from project code like "PRJ-1001"
        const codeMatch = project.projectCode.match(/PRJ-(\d+)/);
        if (codeMatch) {
          setProjectCode(parseInt(codeMatch[1]));
        } else {
          setProjectCode(project.projectCode);
        }
      }
      
      // Parse cost details from string format
      if (project.costDetails && typeof project.costDetails === 'string') {
        try {
          console.log('Parsing cost details string:', project.costDetails);
          // Parse cost details from string like "Hotel: EUR 200, Logistics: EUR 10000"
          const costItems = project.costDetails.split(', ').map((item, index) => {
            console.log(`Parsing cost item ${index}:`, item);
            // Split by colon first, then by space for currency and amount
            const parts = item.split(': ');
            if (parts.length === 2) {
              const description = parts[0];
              const currencyAmount = parts[1].split(' ');
              const currency = currencyAmount[0] || 'EUR';
              const amount = parseFloat(currencyAmount[1]) || 0;
              
              console.log(`Parsed: description=${description}, currency=${currency}, amount=${amount}`);
              
              return {
                id: index + 1,
                description: description || '',
                currency: currency || 'EUR',
                amount: amount
              };
            }
            return {
              id: index + 1,
              description: item,
              currency: 'EUR',
              amount: 0
            };
          });
          console.log('Final parsed cost items:', costItems);
          setCostDetails(costItems);
        } catch (error) {
          console.error('Error parsing cost details:', error);
          setCostDetails([
            { id: 1, description: 'Otel', currency: 'EUR', amount: 200 },
            { id: 2, description: 'Lojistik', currency: 'EUR', amount: 10000 }
          ]);
        }
      } else if (project.costDetails && Array.isArray(project.costDetails)) {
        console.log('Using array cost details:', project.costDetails);
        setCostDetails(project.costDetails);
      }
      
      // Parse sales price from price details
      if (project.priceDetails && typeof project.priceDetails === 'string') {
        try {
          // Parse price details from string like "Base price: 20000, Total cost: 10200, Net profit: 9800"
          const priceMatch = project.priceDetails.match(/Base price:\s*(\d+)/);
          if (priceMatch) {
            setSalesPrice(parseFloat(priceMatch[1]));
          }
        } catch (error) {
          console.error('Error parsing price details:', error);
          setSalesPrice(20000);
        }
      } else if (project.salesPrice) {
        setSalesPrice(project.salesPrice);
      }
    }
  }, [project]);

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

  // Validate and clean data for JSON serialization
  const validateAndCleanData = (data) => {
    try {
      // Test if data can be serialized
      JSON.stringify(data);
      return data;
    } catch (error) {
      console.error('JSON serialization error:', error);
      console.error('Problematic data:', data);
      throw new Error('Veri JSON formatına dönüştürülemiyor');
    }
  };

  // Map form data to API format - Using correct field names as per API structure
  const mapFormDataToAPI = () => {
    // Extract numeric values from formatted strings
    const extractNumericValue = (value) => {
      if (!value) return 0;
      const numericPart = value.toString().replace(/[^\d]/g, '');
      return parseInt(numericPart) || 0;
    };

    const apiData = {
      id: project.id, // Include the project ID for update
      projectCode: `PRJ-${projectCode}`, // Format project code properly
      machineName: formData.machineName || '',
      model: formData.machineName || '', // Use machine name as model for now
      make: formData.machineName || '', // Use machine name as make for now
      year: parseInt(formData.year) || 2024,
      hoursOperated: extractNumericValue(formData.workingHours),
      rpm: extractNumericValue(formData.repairHours),
      serialNumber: formData.serialNumber || '',
      teamSayisi: parseInt(formData.teamCount) || 0, // Fixed field name
      netWeight: (formData.machineNetWeight && !isNaN(parseFloat(formData.machineNetWeight))) ? parseFloat(formData.machineNetWeight) : 0,
      additionalWeight: (formData.additionalWeight && !isNaN(parseFloat(formData.additionalWeight))) ? parseFloat(formData.additionalWeight) : 0,
      operatingSystem: formData.operatingSystem || 'Heidenhain',
      keyInformation: keyInformation.toString(), // Fixed field name
      teamMeasurementProbe: formData.teamMeasurementProbe === 'Var', // Fixed field name
      partMeasurementProbe: formData.partMeasurementProbe === 'Var', // Fixed field name
      internalSuverme: formData.insideWaterGiving === 'Var', // Fixed field name
      conveyor: formData.conveyor === 'Var', // Fixed field name
      paperFilter: formData.paperFilter === 'Var', // Fixed field name
      additionalEquipment: formData.accessoryData || '',
      costDetails: costDetails.map(cost => `${cost.description}: ${cost.currency} ${cost.amount}`).join(', '),
      priceDetails: `Base price: ${salesPrice}, Total cost: ${totalCost}, Net profit: ${netProfit}`,
      status: "TEMPLATE",
      photos: []
    };
    
    console.log('=== VALIDATION CHECK ===');
    console.log('id:', apiData.id, 'Type:', typeof apiData.id);
    console.log('projectCode:', apiData.projectCode, 'Type:', typeof apiData.projectCode);
    console.log('machineName:', apiData.machineName, 'Type:', typeof apiData.machineName);
    console.log('model:', apiData.model, 'Type:', typeof apiData.model);
    console.log('make:', apiData.make, 'Type:', typeof apiData.make);
    console.log('year:', apiData.year, 'Type:', typeof apiData.year);
    console.log('hoursOperated:', apiData.hoursOperated, 'Type:', typeof apiData.hoursOperated);
    console.log('rpm:', apiData.rpm, 'Type:', typeof apiData.rpm);
    console.log('teamSayisi:', apiData.teamSayisi, 'Type:', typeof apiData.teamSayisi);
    console.log('netWeight:', apiData.netWeight, 'Type:', typeof apiData.netWeight);
    console.log('additionalWeight:', apiData.additionalWeight, 'Type:', typeof apiData.additionalWeight);
    console.log('keyInformation:', apiData.keyInformation, 'Type:', typeof apiData.keyInformation);
    console.log('teamMeasurementProbe:', apiData.teamMeasurementProbe, 'Type:', typeof apiData.teamMeasurementProbe);
    console.log('partMeasurementProbe:', apiData.partMeasurementProbe, 'Type:', typeof apiData.partMeasurementProbe);
    console.log('internalSuverme:', apiData.internalSuverme, 'Type:', typeof apiData.internalSuverme);
    console.log('conveyor:', apiData.conveyor, 'Type:', typeof apiData.conveyor);
    console.log('paperFilter:', apiData.paperFilter, 'Type:', typeof apiData.paperFilter);
    console.log('=======================');
    
    return validateAndCleanData(apiData);
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple submissions
    
    setIsSaving(true);
    try {
      // Map form data to API format
      const apiData = mapFormDataToAPI();
      
      // Log the data being sent to API
      console.log('=== API UPDATE REQUEST DATA ===');
      console.log('Raw API Data:', apiData);
      console.log('JSON Stringified:', JSON.stringify(apiData, null, 2));
      console.log('==============================');
      
      // Call API to update project using POST method as specified
      const response = await projectService.updateProject(project.id, apiData);
      
      // Call the callback if provided
      if (onSaveComplete) {
        onSaveComplete(response);
      }
      
      // Close modal
      onClose();

      alert('Proje başarıyla güncellendi!');
    } catch (error) {
      console.error('Proje güncelleme hatası:', error);
      alert(`Proje güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-project-modal-overlay">
      <div className="edit-project-modal">
        <div className="modal-header">
          <h2>Proje Düzenle</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
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
              <button type="button" className="btn-cancel" onClick={onClose}>İptal</button>
              <button 
                type="button" 
                className="btn-save" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Güncelleniyor...' : 'Güncelle'}
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
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
