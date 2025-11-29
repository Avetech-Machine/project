import React from 'react';
import { convertCurrency } from '../../services/currencyService';
import { FaEuroSign, FaTrashAlt } from 'react-icons/fa';
import './CostDetails.css';

const CostDetails = ({ costDetails, onAddCost, onUpdateCost, onDeleteCost, exchangeRates, isRatesLoading }) => {
  const totalCost = costDetails.reduce((sum, item) => {
    const eurValue = convertCurrency(item.amount, item.currency, 'EUR', exchangeRates);
    return sum + (parseFloat(eurValue) || 0);
  }, 0);

  // Predefined cost items
  const costItemOptions = [
    'Makine Alım Bedeli',
    'Dış Firma Komisyonu',
    'Lojistik',
    'Uçak',
    'Araç Kirası',
    'Ek Masraf',
    'Gümrük',
    'Ardiye Depolama',
    'Kurulum'
  ];

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
      moveToNextField(e.target);
    }
  };

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

  // Format number with dots as thousand separators for display (e.g., 12000.03 -> 12.000.03)
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

  return (
    <div className="cost-details-section">
      <div className="section-header">
        <h2 className="section-title"><FaEuroSign /> Maliyet Detayları</h2>
        <button className="btn-add-cost header-button" onClick={onAddCost}>
          + Maliyet Ekle
        </button>
      </div>

      {/* Ana Değişiklik: "cost-table" div'i kaldırıldı */}
      <div className="cost-list-container">
        <div className="table-header">
          <div className="col-description">Maliyet Kalemleri</div>
          <div className="col-currency">Para Birimi</div>
          <div className="col-amount">Tutar</div>
          <div className="col-eur-equivalent">EUR Karşılığı</div>
          <div className="col-actions"></div>
        </div>

        {costDetails.map((item) => {
          // Items with id <= 9 are initial predefined items - they can use dropdown/datalist
          // Items with id > 9 are newly added - they should only have plain text input
          const isNewlyAdded = item.id > 9;

          return (
            <div key={item.id} className="table-row">
              <div className="col-description">
                {isNewlyAdded ? (
                  // Newly added items - plain text input only (no dropdown)
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onUpdateCost(item.id, 'description', e.target.value)}
                    onKeyPress={handleEnterKeyPress}
                    className="cost-item-dropdown"
                    placeholder="Maliyet Kalemi Yazın"
                  />
                ) : (
                  // Initial predefined items - read-only, static text (cannot be edited)
                  <input
                    type="text"
                    value={item.description}
                    readOnly
                    className="cost-item-dropdown readonly"
                    style={{ cursor: 'default' }}
                  />
                )}
              </div>
              <div className="col-currency">
                <select
                  value={item.currency}
                  onChange={(e) => onUpdateCost(item.id, 'currency', e.target.value)}
                  className="currency-dropdown"
                >
                  <option value="">Para Birimi Seçin</option>
                  <option value="EUR">EUR</option>
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="col-amount">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInputValue(item.amount)}
                  onChange={(e) => {
                    const rawValue = e.target.value;

                    // Allow empty string, numbers, dots, and decimal points
                    if (rawValue === '' || rawValue === '.' || /^-?[\d.]*$/.test(rawValue)) {
                      // Parse to get numeric value (remove dots, keep decimal)
                      const cleanedValue = parseFormattedInput(rawValue);
                      const numericValue = parseFloat(cleanedValue);

                      // Update with numeric value (or empty string)
                      if (cleanedValue === '' || cleanedValue === '.') {
                        onUpdateCost(item.id, 'amount', '');
                      } else if (!isNaN(numericValue)) {
                        onUpdateCost(item.id, 'amount', numericValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Format on blur to ensure proper display
                    const rawValue = e.target.value;
                    const cleanedValue = parseFormattedInput(rawValue);
                    const numericValue = parseFloat(cleanedValue);

                    if (cleanedValue === '' || cleanedValue === '.' || isNaN(numericValue)) {
                      onUpdateCost(item.id, 'amount', '');
                    } else {
                      onUpdateCost(item.id, 'amount', numericValue);
                    }
                  }}
                  onKeyPress={handleEnterKeyPress}
                  placeholder="0"
                />
              </div>
              <div className="col-eur-equivalent">
                <div className="eur-amount-box">
                  {isRatesLoading ? (
                    <span className="loading">Yükleniyor...</span>
                  ) : (
                    `€${formatNumberWithDots(convertCurrency(item.amount, item.currency, 'EUR', exchangeRates))}`
                  )}
                </div>
              </div>
              <div className="col-actions">
                <button
                  className="btn-delete icon-button"
                  onClick={() => onDeleteCost(item.id)}
                  title="Sil"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ana Değişiklik: "cost-summary" yapısı güncellendi */}
      <div className="cost-summary">
        <span className="total-cost-label">Toplam Maliyet:</span>
        <span className="total-cost-value">€{formatNumberWithDots(totalCost)}</span>
      </div>
    </div>
  );
};

export default CostDetails;