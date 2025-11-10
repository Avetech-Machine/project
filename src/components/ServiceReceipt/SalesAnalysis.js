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
      setDisplayPrice(salesPrice);
      setInputValue(newValue);
    } else {
      // Convert EUR to selected currency for display
      const converted = convertCurrency(salesPrice, 'EUR', selectedCurrency, exchangeRates);
      setDisplayPrice(converted || 0);
      setInputValue(String(converted || ''));
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
    
    // Get the current input value (as string to preserve periods)
    const currentInput = inputRef.current?.value || inputValue;
    const numericValue = parseFloat(currentInput) || 0;
    
    // Convert current input value from old currency to EUR
    const priceInEur = convertCurrency(numericValue, selectedCurrency, 'EUR', exchangeRates);
    
    // Update selected currency
    setSelectedCurrency(newCurrency);
    
    // Always store in EUR
    setSalesPrice(priceInEur || 0);
    
    // Update display based on new currency
    if (newCurrency === 'EUR') {
      setDisplayPrice(priceInEur || 0);
      setInputValue(String(priceInEur || ''));
    } else {
      const newDisplayPrice = convertCurrency(priceInEur || 0, 'EUR', newCurrency, exchangeRates);
      setDisplayPrice(newDisplayPrice || 0);
      setInputValue(String(newDisplayPrice || ''));
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
    
    // Allow empty string, numbers, and decimal points
    if (rawValue === '' || rawValue === '.' || /^-?\d*\.?\d*$/.test(rawValue)) {
      setInputValue(rawValue);
      isUserTypingRef.current = true;
      
      // Parse numeric value for conversion
      const numericValue = parseFloat(rawValue);
      
      // Only convert if we have a valid number
      if (!isNaN(numericValue) && rawValue !== '' && rawValue !== '.') {
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
    const numericValue = parseFloat(rawValue);
    
    if (isNaN(numericValue) || rawValue === '' || rawValue === '.') {
      // Reset to 0 or current salesPrice converted
      if (selectedCurrency === 'EUR') {
        setInputValue(String(salesPrice || '0'));
        setDisplayPrice(salesPrice || 0);
      } else {
        const converted = convertCurrency(salesPrice || 0, 'EUR', selectedCurrency, exchangeRates);
        setInputValue(String(converted || '0'));
        setDisplayPrice(converted || 0);
      }
    } else {
      // Ensure final value is properly set
      setInputValue(String(numericValue));
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
              €{(eurEquivalent || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Toplam Maliyet</div>
            <div className="card-value cost">€{totalCost.toFixed(2)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Hedef Satış Fiyatı</div>
            <div className="card-value sales">€{salesPrice.toFixed(2)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Hedeflenen Kar</div>
            <div className={`card-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
              €{netProfit.toFixed(2)}
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
