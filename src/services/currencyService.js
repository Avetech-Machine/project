// Currency conversion service using a free API
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';
const FALLBACK_RATES = {
  TRY: 34.5,
  USD: 1.09,
  EUR: 1.0
};

/**
 * Fetches current exchange rates for EUR
 * @returns {Promise<Object>} Object containing exchange rates
 */
export const getExchangeRates = async () => {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      EUR: 1.0,
      TRY: data.rates.TRY || FALLBACK_RATES.TRY,
      USD: data.rates.USD || FALLBACK_RATES.USD,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback rates:', error);
    
    return {
      EUR: FALLBACK_RATES.EUR,
      TRY: FALLBACK_RATES.TRY,
      USD: FALLBACK_RATES.USD,
      timestamp: new Date().toISOString(),
      isOffline: true
    };
  }
};

/**
 * Converts amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to EUR first, then to target currency
  const eurAmount = fromCurrency === 'EUR' ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === 'EUR' ? eurAmount : eurAmount * rates[toCurrency];
  
  return convertedAmount;
};

/**
 * Formats currency value with proper symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency) => {
  const symbols = {
    EUR: '€',
    TRY: '₺',
    USD: '$'
  };
  
  const symbol = symbols[currency] || currency;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${symbol}${formattedAmount}`;
};
