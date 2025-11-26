import React, { useState, useEffect, useRef } from 'react';
import { convertCurrency, formatCurrency } from '../../services/currencyService';
import { FaChartLine } from 'react-icons/fa';
import './SalesAnalysis.css';

const SalesAnalysis = ({ totalCost, salesPrice, setSalesPrice, netProfit, profitMargin, exchangeRates, isRatesLoading }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [displayPrice, setDisplayPrice] = useState(salesPrice);
  const [inputValue, setInputValue] = useState(String(salesPrice || ''));
  const isUserTypingRef = useRef(false);
  const isChangingCurrencyRef = useRef(false);
  const inputRef = useRef(null);

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
    if (value === '' || value === '.') return value;
    
    // Parse to get clean numeric string
    const cleaned = parseFormattedInput(value);
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

  // Update display price when salesPrice (EUR) changes from external source (not user input)
  useEffect(() => {
    // Don't update if user is actively typing or changing currency
    if (isUserTypingRef.current || isChangingCurrencyRef.current) {
      return;
    }

    // Wait for exchange rates to be loaded before converting
    if (isRatesLoading) {
      return;
    }
    
    if (selectedCurrency === 'EUR') {
      const newValue = String(salesPrice || '');
      const formatted = formatInputValue(newValue);
      setDisplayPrice(salesPrice);
      setInputValue(formatted);
    } else {
      // Convert EUR to selected currency for display
      const converted = convertCurrency(salesPrice, 'EUR', selectedCurrency, exchangeRates);
      const formatted = formatInputValue(String(converted || ''));
      setDisplayPrice(converted || 0);
      setInputValue(formatted);
    }
  }, [salesPrice, selectedCurrency, exchangeRates, isRatesLoading]);

  // Handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    
    // Don't allow currency change if rates are still loading
    if (isRatesLoading) {
      return;
    }
    
    // Set flag to prevent useEffect from interfering
    isChangingCurrencyRef.current = true;
    
    // Get the current input value and parse it (remove formatting dots)
    const currentInput = inputRef.current?.value || inputValue;
    const cleanedValue = parseFormattedInput(currentInput);
    const numericValue = parseFloat(cleanedValue) || 0;
    
    // Convert current input value from old currency to EUR
    const priceInEur = convertCurrency(numericValue, selectedCurrency, 'EUR', exchangeRates);
    
    // Update selected currency
    setSelectedCurrency(newCurrency);
    
    // Always store in EUR
    setSalesPrice(priceInEur || 0);
    
    // Update display based on new currency
    if (newCurrency === 'EUR') {
      const formatted = formatInputValue(String(priceInEur || ''));
      setDisplayPrice(priceInEur || 0);
      setInputValue(formatted);
    } else {
      const newDisplayPrice = convertCurrency(priceInEur || 0, 'EUR', newCurrency, exchangeRates);
      const formatted = formatInputValue(String(newDisplayPrice || ''));
      setDisplayPrice(newDisplayPrice || 0);
      setInputValue(formatted);
    }
    
    // Reset flags after a short delay to allow state updates to complete
    setTimeout(() => {
      isUserTypingRef.current = false;
      isChangingCurrencyRef.current = false;
    }, 0);
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty string, numbers, dots, and decimal points
    // Dots can be thousand separators or user typing dots
    if (rawValue === '' || rawValue === '.' || /^-?[\d.]*$/.test(rawValue)) {
      // Format the input value with dots
      const formattedValue = formatInputValue(rawValue);
      setInputValue(formattedValue);
      isUserTypingRef.current = true;
      
      // Parse to get numeric value (remove dots, keep decimal)
      const cleanedValue = parseFormattedInput(formattedValue);
      const numericValue = parseFloat(cleanedValue);
      
      // Only convert if we have a valid number
      if (!isNaN(numericValue) && cleanedValue !== '' && cleanedValue !== '.') {
        setDisplayPrice(numericValue);
        
        // Convert from selected currency to EUR and store
        if (selectedCurrency === 'EUR') {
          setSalesPrice(numericValue);
        } else {
          // Only convert if rates are loaded
          if (!isRatesLoading && exchangeRates) {
            const priceInEur = convertCurrency(numericValue, selectedCurrency, 'EUR', exchangeRates);
            setSalesPrice(priceInEur || 0);
          }
        }
      } else if (rawValue === '' || rawValue === '.') {
        // Allow empty or just period for user to continue typing
        setDisplayPrice(0);
        setSalesPrice(0);
      }
    }
  };

  // Handle input blur - finalize the value
  const handlePriceBlur = (e) => {
    const rawValue = e.target.value;
    const cleanedValue = parseFormattedInput(rawValue);
    const numericValue = parseFloat(cleanedValue);
    
    if (isNaN(numericValue) || cleanedValue === '' || cleanedValue === '.') {
      // Reset to 0 or current salesPrice converted
      if (selectedCurrency === 'EUR') {
        const formatted = formatInputValue(String(salesPrice || '0'));
        setInputValue(formatted);
        setDisplayPrice(salesPrice || 0);
      } else {
        const converted = convertCurrency(salesPrice || 0, 'EUR', selectedCurrency, exchangeRates);
        const formatted = formatInputValue(String(converted || '0'));
        setInputValue(formatted);
        setDisplayPrice(converted || 0);
      }
    } else {
      // Format the final value with dots
      const formatted = formatInputValue(String(numericValue));
      setInputValue(formatted);
      setDisplayPrice(numericValue);
      
      if (selectedCurrency === 'EUR') {
        setSalesPrice(numericValue);
      } else {
        if (!isRatesLoading && exchangeRates) {
          const priceInEur = convertCurrency(numericValue, selectedCurrency, 'EUR', exchangeRates);
          setSalesPrice(priceInEur || 0);
        }
      }
    }
    
    isUserTypingRef.current = false;
  };

  // Get EUR equivalent for display
  const getEurEquivalent = () => {
    if (selectedCurrency === 'EUR') {
      return salesPrice;
    }
    
    if (isRatesLoading || !exchangeRates) {
      return salesPrice;
    }
    
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue) || inputValue === '' || inputValue === '.') {
      return salesPrice;
    }
    
    return convertCurrency(numericValue, selectedCurrency, 'EUR', exchangeRates) || salesPrice;
  };

  // Function to move focus to the next input field
  const moveToNextField = (currentInput) => {
    // Get all focusable inputs in the form (including parent form)
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
      // First handle blur to finalize the value
      handlePriceBlur(e);
      // Then move to next field
      moveToNextField(e.target);
    }
  };

  // Format number with dots as thousand separators (e.g., 12000.03 -> 12.000.03)
  const formatNumberWithDots = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0.00';
    }
    
    // Handle negative numbers
    const isNegative = number < 0;
    const absNumber = Math.abs(number);
    
    // Convert to string and split by decimal point
    const numStr = absNumber.toString();
    const parts = numStr.split('.');
    
    // Format integer part with dots as thousand separators
    const integerPart = parts[0];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Handle decimal part
    let decimalPart = '00';
    if (parts.length > 1) {
      // Keep decimal part, pad to 2 digits if needed
      decimalPart = parts[1].padEnd(2, '0').substring(0, 2);
    }
    
    // Combine parts with negative sign if needed
    const formatted = `${formattedInteger}.${decimalPart}`;
    return isNegative ? `-${formatted}` : formatted;
  };
  
  const eurEquivalent = getEurEquivalent();

  return (
    <div className="sales-analysis-section">
      <div className="section-header">
        <h2 className="section-title"><FaChartLine /> Hedef Satış ve Kar Analizi</h2>
      </div>

      <div className="analysis-content">
        <div className="analysis-row">
          <div className="analysis-group">
            <label>Hedef Satış Fiyatı</label>
            <div className="input-with-currency">
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                onKeyPress={handleEnterKeyPress}
                placeholder="0"
              />
              <span className="currency-label">{selectedCurrency}</span>
            </div>
          </div>
          <div className="analysis-group">
            <label>Para Birimi</label>
            <select 
              className="currency-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="analysis-group">
            <label>EUR Karşılığı</label>
            <div className="eur-display">
              €{formatNumberWithDots(eurEquivalent || 0)}
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Toplam Maliyet</div>
            <div className="card-value cost">€{formatNumberWithDots(totalCost)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Hedef Satış Fiyatı</div>
            <div className="card-value sales">€{formatNumberWithDots(salesPrice)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Hedeflenen Kar</div>
            <div className={`card-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
              €{formatNumberWithDots(netProfit)}
            </div>
          </div>
        </div>

        <div className="profit-margin-centered">
          <div className="margin-label-center">Kar Marjı: {profitMargin}%</div>
          <div className="margin-bar">
            <div 
              className="margin-fill" 
              style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysis;
