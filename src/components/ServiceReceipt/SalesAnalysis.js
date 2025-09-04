import React from 'react';
import { convertCurrency, formatCurrency } from '../../services/currencyService';
import { FaChartLine } from 'react-icons/fa';
import './SalesAnalysis.css';

const SalesAnalysis = ({ totalCost, salesPrice, setSalesPrice, netProfit, profitMargin, exchangeRates, isRatesLoading }) => {
  return (
    <div className="sales-analysis-section">
      <div className="section-header">
        <h2 className="section-title"><FaChartLine /> Satış ve Kar Analizi</h2>
      </div>

      <div className="analysis-content">
        <div className="analysis-row">
          <div className="analysis-group">
            <label>Satış Fiyatı</label>
            <div className="input-with-currency">
              <input
                type="number"
                value={salesPrice}
                onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                placeholder="20000"
              />
              <span className="currency-label">EUR</span>
            </div>
          </div>
          <div className="analysis-group">
            <label>Para Birimi</label>
            <select className="currency-select">
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="analysis-group">
            <label>EUR Karşılığı</label>
            <div className="eur-display">
              €{salesPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Toplam Maliyet</div>
            <div className="card-value cost">€{totalCost.toFixed(2)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Satış Fiyatı</div>
            <div className="card-value sales">€{salesPrice.toFixed(2)}</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Net Kar</div>
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
