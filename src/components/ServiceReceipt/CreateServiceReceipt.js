import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CostDetails from './CostDetails';
import SalesAnalysis from './SalesAnalysis';
import { getExchangeRates } from '../../services/currencyService';
import projectService from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { FaEuroSign, FaChartLine, FaPlus, FaCamera, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CreateServiceReceipt.css';

const CreateServiceReceipt = ({ editingService, onSaveComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Machine Information
    machineName: '',
    model: '', // New machine model field
    year: '',
    workingHours: '',
    repairHours: '', // This now represents "Devri/dakika"
    serialNumber: '',
    teamCount: '',
    machineNetWeight: '', // New field
    additionalWeight: '', // New field
    machineType: '', // Machine type (sent as string)
    condition: '', // Machine condition (sent as enum: NEW, VERY_GOOD, GOOD, POOR)

    // Operating System
    operatingSystem: 'Heidenhain',
    customOperatingSystem: '', // Custom OS input when "Other" is selected

    // Measurement Probes
    teamMeasurementProbe: 'Var',
    partMeasurementProbe: 'Var',
    insideWaterGiving: 'Yok',

    // New Features
    conveyor: 'Yok',
    paperFilter: 'Yok',

    // Movement Fields
    xMovement: '',
    yMovement: '',
    zMovement: '',
    bMovement: '',
    cMovement: '',

    // Gripper Type
    holderType: '',

    // Machine Dimensions
    machineWidth: '',
    machineLength: '',
    machineHeight: '',

    // Max Material Weight
    maxMaterialWeight: '',

    // Accessory Data
    accessoryData: '',

    // Photos
    photos: []
  });

  const [keyInformation, setKeyInformation] = useState(1); // New state for key information tabs
  const [projectCode, setProjectCode] = useState('AVEMAK-001'); // Project code starting at AVEMAK-001
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Drag-and-drop state
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverSide, setDragOverSide] = useState(null); // 'left' or 'right'


  const [costDetails, setCostDetails] = useState([
    { id: 1, description: 'Makine Alım Bedeli', currency: 'EUR', amount: '' },
    { id: 2, description: 'Dış Firma Komisyonu', currency: 'EUR', amount: '' },
    { id: 3, description: 'Lojistik', currency: 'EUR', amount: '' },
    { id: 4, description: 'Uçak', currency: 'EUR', amount: '' },
    { id: 5, description: 'Araç Kirası', currency: 'EUR', amount: '' },
    { id: 6, description: 'Ek Masraf', currency: 'EUR', amount: '' },
    { id: 7, description: 'Gümrük', currency: 'EUR', amount: '' },
    { id: 8, description: 'Ardiye Depolama', currency: 'EUR', amount: '' },
    { id: 9, description: 'Kurulum', currency: 'EUR', amount: '' }
  ]);

  const [salesPrice, setSalesPrice] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({
    EUR: 1.0,
    TRY: 34.5,
    USD: 1.09
  });
  const [isRatesLoading, setIsRatesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expenseItems, setExpenseItems] = useState([]);
  const [isLoadingExpenseItems, setIsLoadingExpenseItems] = useState(true);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [isLoadingOperatingSystems, setIsLoadingOperatingSystems] = useState(true);

  // Parse formatted input (remove thousand separators, keep decimal point)
  const parseFormattedInput = (value) => {
    if (value === '' || value === '.') return value;

    // Remove all dots to get clean number
    const withoutDots = value.replace(/\./g, '');

    // If original had dots, try to determine if last part was decimal
    const parts = value.split('.');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      // If last part has 1-2 digits, it's likely a decimal part
      if (lastPart.length <= 2 && /^\d+$/.test(lastPart)) {
        // Reconstruct: all parts except last are integer, last is decimal
        const integerPart = parts.slice(0, -1).join('').replace(/\./g, '');
        return `${integerPart}.${lastPart}`;
      }
    }

    // No decimal detected, return without dots
    return withoutDots;
  };

  // Format input value with dots as thousand separators
  const formatInputValue = (value) => {
    if (value === '' || value === '.' || value === null || value === undefined) return value === null || value === undefined ? '' : value;

    // Convert to string if it's a number
    const strValue = String(value);
    if (strValue === '' || strValue === '.') return strValue;

    // Parse to get clean numeric string
    const cleaned = parseFormattedInput(strValue);
    if (cleaned === '' || cleaned === '.') return cleaned;

    // Split by decimal point
    const parts = cleaned.split('.');
    const integerPart = parts[0].replace(/\D/g, ''); // Remove non-digits
    const decimalPart = parts[1] || '';

    // Format integer part with dots
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Combine with decimal part
    if (decimalPart) {
      return `${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger;
  };

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

  // Fetch expense items from API
  useEffect(() => {
    const fetchExpenseItems = async () => {
      setIsLoadingExpenseItems(true);
      try {
        const items = await projectService.getExpenseItems();
        console.log('Fetched expense items:', items);
        setExpenseItems(items);

        // Initialize costDetails with fetched expense items if not editing
        if (!editingService && items && items.length > 0) {
          const initialCostDetails = items.map((item, index) => ({
            id: index + 1,
            description: item.name,
            currency: 'EUR',
            amount: ''
          }));
          setCostDetails(initialCostDetails);
        }
      } catch (error) {
        console.error('Error fetching expense items:', error);
        // Keep the default hardcoded values if API fails
      } finally {
        setIsLoadingExpenseItems(false);
      }
    };

    fetchExpenseItems();
  }, [editingService]);

  // Fetch operating systems from API
  useEffect(() => {
    const fetchOperatingSystems = async () => {
      setIsLoadingOperatingSystems(true);
      try {
        const systems = await projectService.getOperatingSystems();
        console.log('Fetched operating systems:', systems);
        setOperatingSystems(systems);
      } catch (error) {
        console.error('Error fetching operating systems:', error);
        // Keep the default hardcoded values if API fails
      } finally {
        setIsLoadingOperatingSystems(false);
      }
    };

    fetchOperatingSystems();
  }, []);

  // Populate form when editing a service
  useEffect(() => {
    if (editingService) {
      // Check if operating system is a custom value (not one of the predefined options)
      const predefinedOS = ['Heidenhain', 'Siemens', 'Fanuc'];
      const osValue = editingService.operatingSystem || '';
      const isCustomOS = osValue && !predefinedOS.includes(osValue);

      // Helper to format numeric value with dots and unit
      const formatWithUnit = (value, unit) => {
        if (!value && value !== 0) return '';
        // If already has unit, return as is
        if (String(value).includes(unit)) return String(value);
        // Extract numeric value
        const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, ''));
        if (isNaN(num)) return '';
        // Format with dots and add unit
        const formatted = formatInputValue(String(Math.round(num)));
        return formatted ? `${formatted}${unit}` : '';
      };

      setFormData({
        machineName: editingService.machineName || '',
        model: editingService.model || '',
        year: editingService.year || '',
        workingHours: formatWithUnit(editingService.workingHours, ' saat'),
        repairHours: editingService.repairHours || '',
        serialNumber: editingService.serialNumber || '',
        teamCount: editingService.teamCount || '',
        machineNetWeight: formatWithUnit(editingService.machineNetWeight, 'kg'),
        additionalWeight: formatWithUnit(editingService.additionalWeight, 'kg'),
        operatingSystem: isCustomOS ? 'Other' : (editingService.operatingSystem || 'Heidenhain'),
        customOperatingSystem: isCustomOS ? osValue : (editingService.customOperatingSystem || ''),
        teamMeasurementProbe: editingService.teamMeasurementProbe || 'Var',
        partMeasurementProbe: editingService.partMeasurementProbe || 'Var',
        insideWaterGiving: editingService.insideWaterGiving || 'Yok',
        conveyor: editingService.conveyor || 'Yok',
        paperFilter: editingService.paperFilter || 'Yok',
        xMovement: editingService.xmovement || editingService.xMovement || '',
        yMovement: editingService.ymovement || editingService.yMovement || '',
        zMovement: editingService.zmovement || editingService.zMovement || '',
        bMovement: editingService.bmovement || editingService.bMovement || '',
        cMovement: editingService.cmovement || editingService.cMovement || '',
        holderType: editingService.holderType || '',
        machineWidth: editingService.machineWidth || '',
        machineLength: editingService.machineLength || '',
        machineHeight: editingService.machineHeight || '',
        maxMaterialWeight: editingService.maxMaterialWeight || '',
        accessoryData: editingService.accessoryData || '',
        photos: editingService.photos || []
      });

      // Set key information if it exists, otherwise default to 1
      setKeyInformation(editingService.keyInformation || 1);

      // Set project code if it exists, otherwise get next available code
      if (editingService.projectCode) {
        // If it's already in AVEMAK format, use it directly
        if (editingService.projectCode.startsWith('AVEMAK-')) {
          setProjectCode(editingService.projectCode);
        } else {
          // If it's in old format (like PRJ-1001), convert to AVEMAK format
          const codeMatch = editingService.projectCode.match(/PRJ-(\d+)/);
          if (codeMatch) {
            const codeNumber = parseInt(codeMatch[1]);
            setProjectCode(`AVEMAK-${codeNumber.toString().padStart(3, '0')}`);
          } else {
            // Fallback to the original code
            setProjectCode(editingService.projectCode);
          }
        }
      }

      if (editingService.costDetails) {
        setCostDetails(editingService.costDetails);
      }

      if (editingService.salesPrice) {
        setSalesPrice(editingService.salesPrice);
      }
    } else {
      // For new projects, get the next available AVEMAK project code
      // Use the safe method that checks both API and localStorage
      const getNextProjectCode = async () => {
        try {
          console.log('=== GETTING NEXT PROJECT CODE ===');
          const nextAvemakCode = await projectService.getNextAvemakProjectCodeSafe();
          console.log('Setting project code to:', nextAvemakCode);
          setProjectCode(nextAvemakCode);
        } catch (error) {
          console.error('Error getting next project code:', error);
          // Ultimate fallback
          setProjectCode('AVEMAK-001');
        }
      };

      getNextProjectCode();
    }
  }, [editingService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMovementBlur = (field, value) => {
    let processedValue = value;

    // Auto-add units for movement fields on blur
    if (['xMovement', 'yMovement', 'zMovement'].includes(field)) {
      // Remove existing 'mm' or ' mm' if present to avoid duplication
      processedValue = value.replace(/\s*mm$/, '').trim();
      // Add ' mm' if there's a value and it doesn't already end with 'mm' or ' mm'
      if (processedValue && !processedValue.endsWith('mm') && !processedValue.endsWith(' mm')) {
        processedValue = processedValue + ' mm';
      }
    } else if (['bMovement', 'cMovement'].includes(field)) {
      // Remove existing '°' or ' °' if present to avoid duplication
      processedValue = value.replace(/\s*°$/, '').trim();
      // Add ' °' if there's a value and it doesn't already end with '°' or ' °'
      if (processedValue && !processedValue.endsWith('°') && !processedValue.endsWith(' °')) {
        processedValue = processedValue + ' °';
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Generic: whether letters are allowed for a given field
  const isAlphabetAllowed = (field) => {
    return [
      'machineName',
      'model',
      'serialNumber',
      'holderType'
    ].includes(field);
  };

  // Sanitize input to remove letters (including Turkish letters) for numeric-only fields
  const sanitizeNumeric = (value) => {
    return value.replace(/[A-Za-zğüşöçıİĞÜŞÖÇ]/g, '');
  };

  // Unified handler that enforces numeric-only when letters are not allowed
  const handleRestrictedInput = (field, value) => {
    const nextValue = isAlphabetAllowed(field) ? value : sanitizeNumeric(value);
    setFormData(prev => ({
      ...prev,
      [field]: nextValue
    }));
  };

  // Round dimension fields to nearest cm and append unit on blur
  const handleDimensionBlur = (field, value) => {
    // Remove existing 'cm' or ' cm' if present
    const cleanedValue = String(value).replace(/\s*cm$/, '').trim();
    const numeric = parseFloat(cleanedValue.replace(/[^\d.,-]/g, '').replace(',', '.'));
    const processedValue = isNaN(numeric) ? '' : `${Math.round(numeric)} cm`;
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Handle weight input change (format with dots while typing)
  const handleWeightInput = (field, value) => {
    // Remove "kg" if present
    const cleanedValue = value.replace(/kg$/, '').trim();

    // Allow empty string, numbers, dots, and decimal points
    if (cleanedValue === '' || cleanedValue === '.' || /^-?[\d.]*$/.test(cleanedValue)) {
      // Format the input value with dots
      const formattedValue = formatInputValue(cleanedValue);
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    }
  };

  // Round weight to nearest kg and append unit on blur
  const handleWeightBlur = (field, value) => {
    // Remove "kg" if present
    let cleanedValue = value.replace(/kg$/, '').trim();

    // Parse to get numeric value (remove dots, keep decimal)
    cleanedValue = parseFormattedInput(cleanedValue);
    const numeric = parseFloat(cleanedValue);

    if (isNaN(numeric) || cleanedValue === '' || cleanedValue === '.') {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    // Round to nearest integer and format with dots
    const rounded = Math.round(numeric);
    const formatted = formatInputValue(String(rounded));
    const processedValue = `${formatted} kg`;

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Function to manually refresh project code (for testing)
  const refreshProjectCode = async () => {
    try {
      console.log('=== MANUALLY REFRESHING PROJECT CODE ===');
      const nextAvemakCode = await projectService.getNextAvemakProjectCodeSafe();
      console.log('New project code:', nextAvemakCode);
      setProjectCode(nextAvemakCode);
    } catch (error) {
      console.error('Error refreshing project code:', error);
    }
  };

  const handleRpmInput = (e) => {
    const value = e.target.value;
    // If the value already contains "Max 1/min" (formatted), keep it as is
    if (value.includes('Max 1/min')) {
      setFormData(prev => ({
        ...prev,
        repairHours: value
      }));
    } else {
      // Remove "Max 1/min" if present
      const cleanedValue = value.replace(/Max 1\/min$/, '').trim();

      // Allow empty string, numbers, commas, dots, and decimal points
      if (cleanedValue === '' || /^-?[\d.,]*$/.test(cleanedValue)) {
        // Format with dots as thousand separators (consistent with other fields)
        const formattedValue = formatInputValue(cleanedValue);
        setFormData(prev => ({
          ...prev,
          repairHours: formattedValue
        }));
      }
    }
  };

  const handleRpmBlur = (e) => {
    const value = e.target.value;

    // If already formatted with "Max 1/min", don't process again
    if (value.includes('Max 1/min')) {
      return;
    }

    // Parse to get numeric value (remove commas, dots, and any formatting)
    const cleanedValue = parseFormattedInput(value.replace(/,/g, ''));
    const numericValue = parseFloat(cleanedValue);

    // Check if it's a valid number
    if (cleanedValue !== '' && cleanedValue !== '.' && !isNaN(numericValue)) {
      // Round to integer and format with dots
      const rounded = Math.round(numericValue);
      const formattedValue = formatInputValue(String(rounded));
      // Add "Max 1/min" suffix
      const finalValue = `${formattedValue} Max 1/min`;

      setFormData(prev => ({
        ...prev,
        repairHours: finalValue
      }));
    }
  };

  const handleWorkingHoursInput = (e) => {
    const value = e.target.value;
    // Remove "saat" if present
    const cleanedValue = value.replace(/saat$/, '').trim();

    // Allow empty string, numbers, dots, and decimal points
    if (cleanedValue === '' || cleanedValue === '.' || /^-?[\d.]*$/.test(cleanedValue)) {
      // Format the input value with dots
      const formattedValue = formatInputValue(cleanedValue);
      setFormData(prev => ({
        ...prev,
        workingHours: formattedValue
      }));
    }
  };

  const handleWorkingHoursBlur = (e) => {
    const value = e.target.value;
    // Remove "saat" if present
    let cleanedValue = value.replace(/saat$/, '').trim();

    // Parse to get numeric value (remove dots, keep decimal)
    cleanedValue = parseFormattedInput(cleanedValue);
    const numeric = parseFloat(cleanedValue);

    if (isNaN(numeric) || cleanedValue === '' || cleanedValue === '.') {
      setFormData(prev => ({
        ...prev,
        workingHours: ''
      }));
      return;
    }

    // Round to nearest integer and format with dots
    const rounded = Math.round(numeric);
    const formatted = formatInputValue(String(rounded));
    const processedValue = `${formatted} saat`;

    setFormData(prev => ({
      ...prev,
      workingHours: processedValue
    }));
  };

  const handleWorkingHoursKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target;
      // Trigger blur to format the value
      handleWorkingHoursBlur(e);
      // Move to next field
      moveToNextField(input);
    }
  };

  // Function to move focus to the next input field
  const moveToNextField = (currentInput) => {
    // Get all focusable inputs in the form
    const form = currentInput.closest('.create-service-receipt');
    if (!form) return;

    // Get all focusable elements (inputs, selects, textareas, but not buttons or hidden inputs)
    const focusableElements = form.querySelectorAll(
      'input:not([type="hidden"]):not([type="file"]):not([type="button"]):not([type="submit"]), select, textarea'
    );

    // Convert NodeList to Array for easier manipulation
    const focusableArray = Array.from(focusableElements);

    // Find current input index
    const currentIndex = focusableArray.indexOf(currentInput);

    // If there's a next field, focus it
    if (currentIndex < focusableArray.length - 1) {
      const nextField = focusableArray[currentIndex + 1];
      nextField.focus();
      // For select elements, we might want to open them
      if (nextField.tagName === 'SELECT') {
        nextField.focus();
      }
    }
  };

  // Generic handler for Enter key to move to next field
  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      moveToNextField(e.target);
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

  // Drag-and-drop handlers for photo reordering
  const handleDragStart = (e, index) => {
    // Event'in yukarı (forma) sıçramasını engelle
    e.stopPropagation();

    // Safari için veri seti
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    // Create a clean, isolated drag image to prevent ghost elements
    const imgElement = e.currentTarget.querySelector('img');
    if (imgElement && e.dataTransfer.setDragImage) {
      // Clone the image to create a completely isolated drag preview
      const dragImage = imgElement.cloneNode(true);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px'; // Move off-screen
      dragImage.style.width = '100px';
      dragImage.style.height = '100px';
      dragImage.style.objectFit = 'cover';
      dragImage.style.borderRadius = '8px';
      dragImage.style.pointerEvents = 'none';

      // Append to body temporarily
      document.body.appendChild(dragImage);

      // Set the cloned image as drag image
      e.dataTransfer.setDragImage(dragImage, 50, 50);

      // Clean up after drag starts (browser has already captured it)
      setTimeout(() => {
        if (dragImage && dragImage.parentNode) {
          dragImage.parentNode.removeChild(dragImage);
        }
      }, 0);
    }

    // Use requestAnimationFrame for smoother state update, avoiding "hangs"
    requestAnimationFrame(() => {
      setDraggedPhotoIndex(index);
    });
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedPhotoIndex !== null && draggedPhotoIndex !== index) {
      setDragOverIndex(index);

      // Immediately set the side on enter
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX;
      const photoCenter = rect.left + rect.width / 2;
      const insertBefore = mouseX < photoCenter;
      setDragOverSide(insertBefore ? 'left' : 'right');
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Always update the side indicator as mouse moves for smoother feedback
    if (draggedPhotoIndex !== null && draggedPhotoIndex !== index) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX;
      const photoCenter = rect.left + rect.width / 2;
      const insertBefore = mouseX < photoCenter;
      const newSide = insertBefore ? 'left' : 'right';

      // Update side and make sure index is set
      if (dragOverIndex !== index) {
        setDragOverIndex(index);
      }
      if (dragOverSide !== newSide) {
        setDragOverSide(newSide);
      }
    }
  };

  const handleDragLeave = (e, index) => {
    if (e.currentTarget === e.target) {
      if (dragOverIndex === index) {
        setDragOverIndex(null);
        setDragOverSide(null);
      }
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedPhotoIndex === null) {
      return;
    }

    // Determine the actual insert position based on which side was indicated
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const photoCenter = rect.left + rect.width / 2;
    const insertBefore = mouseX < photoCenter;

    // Calculate target index
    let targetIndex = dropIndex;
    if (!insertBefore) {
      targetIndex = dropIndex + 1;
    }

    console.log('=== PHOTO DROP DEBUG ===');
    console.log('Dragged photo index:', draggedPhotoIndex);
    console.log('Drop photo index:', dropIndex);
    console.log('Insert before?', insertBefore);
    console.log('Target index:', targetIndex);

    // Calculate what the position will be after removal
    const finalPosition = draggedPhotoIndex < targetIndex ? targetIndex - 1 : targetIndex;

    // Only skip if we're dropping at the exact same position
    // (where the photo is currently located)
    if (finalPosition === draggedPhotoIndex) {
      console.log('Same position, skipping');
      console.log('=======================');
      setDragOverIndex(null);
      setDragOverSide(null);
      return;
    }

    setFormData(prev => {
      const newPhotos = [...prev.photos];
      console.log('Before:', newPhotos.map((p, i) => `${i}: ${p.name || p.id}`));

      const draggedPhoto = newPhotos[draggedPhotoIndex];

      // Remove the dragged photo from its original position
      newPhotos.splice(draggedPhotoIndex, 1);
      console.log('After remove:', newPhotos.map((p, i) => `${i}: ${p.name || p.id}`));

      // Adjust target index if necessary
      const adjustedIndex = draggedPhotoIndex < targetIndex ? targetIndex - 1 : targetIndex;
      console.log('Adjusted index:', adjustedIndex);

      // Insert it at the target position
      newPhotos.splice(adjustedIndex, 0, draggedPhoto);
      console.log('After insert:', newPhotos.map((p, i) => `${i}: ${p.name || p.id}`));
      console.log('=======================');

      return {
        ...prev,
        photos: newPhotos
      };
    });

    setDragOverIndex(null);
    setDragOverSide(null);
  };

  const handleDragEnd = (e) => {
    // Sadece state'leri sıfırla, React render edince class'lar otomatik düzelir
    setDraggedPhotoIndex(null);
    setDragOverIndex(null);
    setDragOverSide(null);

    // Manuel class silme işlemlerini kaldırabilirsin, React halleder.
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

  const addCostDetail = async () => {
    const newId = Math.max(...costDetails.map(item => item.id), 0) + 1;
    const newDescription = ''; // Empty initially, user will fill it

    // Add the new cost detail to the UI immediately with empty description
    const newCostDetail = { id: newId, description: newDescription, currency: 'EUR', amount: 0 };
    setCostDetails(prev => [...prev, newCostDetail]);
  };

  // Function to create new expense items in bulk after project creation
  const createNewExpenseItems = async () => {
    try {
      // Find all newly added cost items that don't exist in the expense items from API
      const newExpenseItems = costDetails
        .filter(item => {
          // Only consider items with non-empty descriptions
          if (!item.description || !item.description.trim()) {
            return false;
          }
          // Check if this description already exists in the API
          const exists = expenseItems.some(ei => ei.name === item.description.trim());
          return !exists; // Only include items that DON'T exist in API
        })
        .map(item => ({ name: item.description.trim() }));

      // If there are new items, create them via bulk API
      if (newExpenseItems.length > 0) {
        console.log('Creating new expense items:', newExpenseItems);
        await projectService.createExpenseItems(newExpenseItems);
        console.log('New expense items created successfully');

        // Refresh the expense items list
        const items = await projectService.getExpenseItems();
        setExpenseItems(items);
      }
    } catch (error) {
      console.error('Error creating new expense items:', error);
      // Don't throw error - we don't want to fail project creation if expense items fail
      // Just log it for debugging
    }
  };

  // Function to create a new operating system after project creation
  const createNewOperatingSystem = async () => {
    try {
      // Check if user selected "Other" and entered a custom OS
      if (formData.operatingSystem === 'Other' && formData.customOperatingSystem && formData.customOperatingSystem.trim()) {
        const customOSName = formData.customOperatingSystem.trim();

        // Double-check that it doesn't already exist (case-insensitive)
        const exists = operatingSystems.some(os =>
          os.name.toLowerCase() === customOSName.toLowerCase()
        );

        if (!exists) {
          console.log('Creating new operating system:', customOSName);
          await projectService.createOperatingSystem({ name: customOSName });
          console.log('New operating system created successfully');

          // Refresh the operating systems list
          const systems = await projectService.getOperatingSystems();
          setOperatingSystems(systems);
        } else {
          console.log('Operating system already exists, skipping creation:', customOSName);
        }
      }
    } catch (error) {
      console.error('Error creating new operating system:', error);
      // Don't throw error - we don't want to fail project creation if OS creation fails
      // Just log it for debugging
    }
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

  const totalCost = costDetails.reduce((sum, item) => {
    const amount = parseFloat(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
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

  // Map form data to API format - Exact structure as specified
  const mapFormDataToAPI = () => {
    const apiData = {
      projectCode: projectCode,
      machineName: formData.machineName || '',
      model: formData.model || '', // Using separate model field
      make: (formData.machineName && formData.machineName.split(' ')[0]) || 'Unknown', // Extract make from machine name
      year: parseInt(formData.year) || 2024,
      hoursOperated: (() => {
        // Extract numeric value from workingHours (remove "saat" and dots)
        const cleaned = String(formData.workingHours || '').replace(/saat$/, '').trim().replace(/\./g, '');
        const numeric = parseInt(cleaned) || 0;
        return numeric;
      })(),
      rpm: (() => {
        // Extract numeric value from repairHours (remove "Max 1/min", commas, and dots)
        const cleaned = String(formData.repairHours || '')
          .replace(/Max 1\/min$/, '') // Remove "Max 1/min" suffix
          .trim()
          .replace(/,/g, '') // Remove commas
          .replace(/\./g, ''); // Remove dots
        const numeric = parseInt(cleaned) || 0;
        return numeric;
      })(), // Using repairHours as rpm
      serialNumber: formData.serialNumber || '',
      takimSayisi: parseInt(formData.teamCount) || 0,
      netWeight: (() => {
        // Extract numeric value from machineNetWeight (remove "kg" and dots)
        const cleaned = String(formData.machineNetWeight || '').replace(/kg$/, '').trim().replace(/\./g, '');
        const numeric = parseFloat(cleaned);
        return (!isNaN(numeric) && cleaned !== '') ? Math.round(numeric) : null;
      })(),
      additionalWeight: (() => {
        // Extract numeric value from additionalWeight (remove "kg" and dots)
        const cleaned = String(formData.additionalWeight || '').replace(/kg$/, '').trim().replace(/\./g, '');
        const numeric = parseFloat(cleaned);
        return (!isNaN(numeric) && cleaned !== '') ? Math.round(numeric) : null;
      })(),
      type: formData.machineType || '', // Machine type sent as string
      condition: formData.condition || '', // Machine condition sent as enum
      operatingSystem: formData.operatingSystem === 'Other' ? (formData.customOperatingSystem || '') : (formData.operatingSystem || ''),
      anahtarBilgisi: keyInformation ? keyInformation.toString() : '',
      takimOlcmeProbu: formData.teamMeasurementProbe === 'Var',
      parcaOlcmeProbu: formData.partMeasurementProbe === 'Var',
      ictenSuVerme: formData.insideWaterGiving === 'Var',
      konveyor: formData.conveyor === 'Var',
      kagitFiltre: formData.paperFilter === 'Var',
      xmovement: formData.xMovement || '',
      ymovement: formData.yMovement || '',
      zmovement: formData.zMovement || '',
      bmovement: formData.bMovement || '',
      cmovement: formData.cMovement || '',
      holderType: formData.holderType || '',
      machineWidth: (formData.machineWidth && !isNaN(parseFloat(formData.machineWidth))) ? parseFloat(formData.machineWidth) : null,
      machineLength: (formData.machineLength && !isNaN(parseFloat(formData.machineLength))) ? parseFloat(formData.machineLength) : null,
      machineHeight: (formData.machineHeight && !isNaN(parseFloat(formData.machineHeight))) ? parseFloat(formData.machineHeight) : null,
      maxMaterialWeight: (formData.maxMaterialWeight && !isNaN(parseFloat(formData.maxMaterialWeight))) ? parseFloat(formData.maxMaterialWeight) : null,
      additionalEquipment: formData.accessoryData || '',
      costDetails: costDetails.map(cost => `${cost.description}: ${cost.currency} ${cost.amount}`).join(', ') || '',
      priceDetails: `Base price: ${salesPrice}, Total cost: ${totalCost}, Net profit: ${netProfit}`,
      salesProfitAnalysis: `Sales Price: ${salesPrice} EUR, Total Cost: ${totalCost} EUR, Net Profit: ${netProfit} EUR, Profit Margin: ${profitMargin}%`,
      targetSalePrice: parseFloat(salesPrice) || null,
      targetNetProfit: parseFloat(netProfit) || null,
      status: "TEMPLATE"
      // Note: photos are now sent separately as files, not as URLs
    };

    return validateAndCleanData(apiData);
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple submissions

    // Validate custom operating system before saving
    if (formData.operatingSystem === 'Other' && formData.customOperatingSystem && formData.customOperatingSystem.trim()) {
      const customOSName = formData.customOperatingSystem.trim();
      const exists = operatingSystems.some(os =>
        os.name.toLowerCase() === customOSName.toLowerCase()
      );

      if (exists) {
        alert('Bu işletim sistemi zaten mevcut. Lütfen farklı bir isim giriniz veya listeden seçiniz.');
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(true);
    try {
      // Map form data to API format
      const apiData = mapFormDataToAPI();

      // Log the data being sent to API
      console.log('=== API REQUEST DATA ===');
      console.log('Raw API Data:', apiData);
      console.log('Photo Files to Upload:', formData.photos);
      console.log('Number of photos:', formData.photos.length);
      console.log('========================');

      // Call API to create project with photo files
      const response = await projectService.createProject(apiData, formData.photos);

      // After successful project creation, create any new expense items
      await createNewExpenseItems();

      // After successful project creation, create new operating system if needed
      await createNewOperatingSystem();

      // Create service object for local storage (for backward compatibility)
      const serviceData = {
        id: response.id || generateServiceId(),
        ...formData,
        keyInformation: keyInformation,
        projectCode: projectCode,
        costDetails: costDetails,
        totalCost: totalCost,
        salesPrice: salesPrice,
        netProfit: netProfit,
        profitMargin: parseFloat(profitMargin),
        createdDate: new Date().toLocaleDateString('tr-TR'),
        status: 'TEMPLATE',
        apiId: response.id // Store API ID for future reference
      };

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

      // Navigate to all services page
      navigate('/allServices');

      // Reset form if creating new service
      if (!editingService) {
        setFormData({
          machineName: '',
          model: '',
          year: '',
          workingHours: '',
          repairHours: '',
          serialNumber: '',
          teamCount: '',
          machineNetWeight: '',
          additionalWeight: '',
          machineType: '',
          condition: '',
          operatingSystem: 'Heidenhain',
          teamMeasurementProbe: 'Var',
          partMeasurementProbe: 'Var',
          insideWaterGiving: 'Yok',
          conveyor: 'Yok',
          paperFilter: 'Yok',
          xMovement: '',
          yMovement: '',
          zMovement: '',
          bMovement: '',
          cMovement: '',
          holderType: '',
          machineWidth: '',
          machineLength: '',
          machineHeight: '',
          maxMaterialWeight: '',
          accessoryData: '',
          photos: []
        });
        setCostDetails([
          { id: 1, description: 'Makine Alım Bedeli', currency: 'EUR', amount: '' },
          { id: 2, description: 'Uçak', currency: 'EUR', amount: '' },
          { id: 3, description: 'Otel', currency: 'EUR', amount: '' },
          { id: 4, description: 'Ek Giderler (Yemek vb.)', currency: 'EUR', amount: '' },
          { id: 5, description: 'Lojistik', currency: 'EUR', amount: '' },
          { id: 6, description: 'Dış Firma Komisyonu', currency: 'EUR', amount: '' },
          { id: 7, description: 'Kurulum', currency: 'EUR', amount: '' }
        ]);
        setSalesPrice(20000);
      }

      alert(editingService ? 'Proje güncellendi!' : 'Proje başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Proje kaydetme hatası:', error);
      alert(`Proje kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
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
                    <div
                      key={photo.id}
                      className={`photo-preview-container ${draggedPhotoIndex === index ? 'dragging' : ''} ${dragOverIndex === index && dragOverSide === 'left' ? 'drag-over-left' : ''} ${dragOverIndex === index && dragOverSide === 'right' ? 'drag-over-right' : ''}`}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={(e) => handleDragLeave(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="photo-order-number">{index + 1}</div>
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="photo-preview"
                        onClick={() => handlePhotoClick(index)}
                        draggable="false"  // <-- BU SATIRI EKLE
                        style={{ userSelect: 'none', WebkitUserSelect: 'none' }} // <-- BUNU DA EKLERSEN İYİ OLU
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
        <div className="form-row machine-info-row">
          <div className="form-group machine-brand">
            <label>Makine Markası</label>
            <input
              type="text"
              value={formData.machineName}
              onChange={(e) => handleInputChange('machineName', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="Dmg Mori"
            />
          </div>
          <div className="form-group machine-model">
            <label>Makine Modeli</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="Model adı"
            />
          </div>
          <div className="form-group machine-year">
            <label>Makine Yılı</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => handleRestrictedInput('year', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="Makine yılı"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Makine Tipi</label>
            <input
              type="text"
              value={formData.machineType}
              onChange={(e) => handleInputChange('machineType', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="CNC işleme merkezi"
            />
          </div>
          <div className="form-group">
            <label>Makine Durumu</label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="form-select"
            >
              <option value="">Seçiniz</option>
              <option value="NEW">Sıfır / Yeni</option>
              <option value="VERY_GOOD">Çok İyi / Az Kullanılmış</option>
              <option value="GOOD">İyi / Kullanılmış</option>
              <option value="POOR">Kötü / Bakım Gerekir</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Saati</label>
            <input
              type="text"
              value={formData.workingHours}
              onChange={handleWorkingHoursInput}
              onBlur={handleWorkingHoursBlur}
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
              onBlur={handleRpmBlur}
              onKeyPress={handleEnterKeyPress}
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
              onKeyPress={handleEnterKeyPress}
              placeholder="Seri numarası"
            />
          </div>
          <div className="form-group">
            <label>Takım Sayısı</label>
            <input
              type="text"
              value={formData.teamCount}
              onChange={(e) => handleRestrictedInput('teamCount', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="Takım sayısı"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Makine Net Kilo</label>
            <input
              type="text"
              value={formData.machineNetWeight}
              onChange={(e) => handleWeightInput('machineNetWeight', e.target.value)}
              onBlur={(e) => handleWeightBlur('machineNetWeight', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="kg"
            />
          </div>
          <div className="form-group">
            <label>Ek Kilo</label>
            <input
              type="text"
              value={formData.additionalWeight}
              onChange={(e) => handleWeightInput('additionalWeight', e.target.value)}
              onBlur={(e) => handleWeightBlur('additionalWeight', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="kg"
            />
          </div>
        </div>

        {/* Movement Fields Section */}
        <div className="form-row">
          <div className="form-group">
            <label>X Hareketi</label>
            <input
              type="text"
              value={formData.xMovement}
              onChange={(e) => handleRestrictedInput('xMovement', e.target.value)}
              onBlur={(e) => handleMovementBlur('xMovement', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="1000mm"
            />
          </div>
          <div className="form-group">
            <label>Y Hareketi</label>
            <input
              type="text"
              value={formData.yMovement}
              onChange={(e) => handleRestrictedInput('yMovement', e.target.value)}
              onBlur={(e) => handleMovementBlur('yMovement', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="500mm"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Z Hareketi</label>
            <input
              type="text"
              value={formData.zMovement}
              onChange={(e) => handleRestrictedInput('zMovement', e.target.value)}
              onBlur={(e) => handleMovementBlur('zMovement', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="300mm"
            />
          </div>
          <div className="form-group">
            <label>B Hareketi</label>
            <input
              type="text"
              value={formData.bMovement}
              onChange={(e) => handleRestrictedInput('bMovement', e.target.value)}
              onBlur={(e) => handleMovementBlur('bMovement', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="360°"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>C Hareketi</label>
            <input
              type="text"
              value={formData.cMovement}
              onChange={(e) => handleRestrictedInput('cMovement', e.target.value)}
              onBlur={(e) => handleMovementBlur('cMovement', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="360°"
            />
          </div>
          <div className="form-group">
            <label>Tutucu Tipi</label>
            <input
              type="text"
              value={formData.holderType}
              onChange={(e) => handleInputChange('holderType', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="HSK-63A"
            />
          </div>
        </div>

        {/* Machine Dimensions Section */}
        <div className="form-row">
          <div className="form-group">
            <label>Makine Genişliği</label>
            <input
              type="text"
              value={formData.machineWidth}
              onChange={(e) => handleRestrictedInput('machineWidth', e.target.value)}
              onBlur={(e) => handleDimensionBlur('machineWidth', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="2000cm"
            />
          </div>
          <div className="form-group">
            <label>Makine Uzunluğu</label>
            <input
              type="text"
              value={formData.machineLength}
              onChange={(e) => handleRestrictedInput('machineLength', e.target.value)}
              onBlur={(e) => handleDimensionBlur('machineLength', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="3000cm"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Makine Yüksekliği</label>
            <input
              type="text"
              value={formData.machineHeight}
              onChange={(e) => handleRestrictedInput('machineHeight', e.target.value)}
              onBlur={(e) => handleDimensionBlur('machineHeight', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="2500cm"
            />
          </div>
          <div className="form-group">
            <label>Maksimum Malzeme Ağırlığı</label>
            <input
              type="text"
              value={formData.maxMaterialWeight}
              onChange={(e) => handleRestrictedInput('maxMaterialWeight', e.target.value)}
              onBlur={(e) => handleWeightBlur('maxMaterialWeight', e.target.value)}
              onKeyPress={handleEnterKeyPress}
              placeholder="5000kg"
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
              {/* Dynamically populate from API */}
              {operatingSystems.map(os => (
                <option key={os.id} value={os.name}>{os.name}</option>
              ))}
              {/* Fallback options if API hasn't loaded yet */}
              {operatingSystems.length === 0 && (
                <>
                  <option value="Heidenhain">Heidenhain</option>
                  <option value="Siemens">Siemens</option>
                  <option value="Fanuc">Fanuc</option>
                </>
              )}
              <option value="Other">Other</option>
            </select>
            {formData.operatingSystem === 'Other' && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="İşletim sistemi adını giriniz"
                  value={formData.customOperatingSystem}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('customOperatingSystem', value);

                    // Check if the entered value already exists in the API (case-insensitive)
                    const exists = operatingSystems.some(os =>
                      os.name.toLowerCase() === value.trim().toLowerCase()
                    );

                    // Show visual feedback if duplicate
                    if (exists && value.trim()) {
                      e.target.style.borderColor = 'red';
                      e.target.title = 'Bu işletim sistemi zaten mevcut';
                    } else {
                      e.target.style.borderColor = '';
                      e.target.title = '';
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    // Check if duplicate on blur
                    const exists = operatingSystems.some(os =>
                      os.name.toLowerCase() === value.trim().toLowerCase()
                    );

                    if (exists && value.trim()) {
                      alert('Bu işletim sistemi zaten mevcut. Lütfen farklı bir isim giriniz.');
                      e.target.focus();
                    }
                  }}
                  onKeyPress={handleEnterKeyPress}
                  className="form-input"
                />
              </div>
            )}
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
        expenseItems={expenseItems}
        isLoadingExpenseItems={isLoadingExpenseItems}
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
        <button
          type="button"
          className="btn-save"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Kaydediliyor...' : (editingService ? 'Güncelle' : 'Kaydet')}
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

