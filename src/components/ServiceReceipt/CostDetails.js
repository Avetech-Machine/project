import React from 'react';
import { convertCurrency, formatCurrency } from '../../services/currencyService';
import { FaEuroSign, FaTrashAlt } from 'react-icons/fa';
import './CostDetails.css';

const CostDetails = ({ costDetails, onAddCost, onUpdateCost, onDeleteCost, exchangeRates, isRatesLoading }) => {
  const totalCost = costDetails.reduce((sum, item) => {
    const eurValue = convertCurrency(item.amount, item.currency, 'EUR', exchangeRates);
    return sum + (parseFloat(eurValue) || 0);
  }, 0);

  // Predefined cost items
  const costItemOptions = [
    'Uçak',
    'Otel',
    'Ek Giderler (Yemek vb.)',
    'Lojistik',
    'Dış Firma Komisyonu',
    'Makine Alım Bedeli',
    'Kurulum'
  ];

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

        {costDetails.map((item) => (
          <div key={item.id} className="table-row">
            <div className="col-description">
              <select
                value={item.description}
                onChange={(e) => onUpdateCost(item.id, 'description', e.target.value)}
                className="cost-item-dropdown"
              >
                <option value="">Maliyet Kalemi Seçin</option>
                {costItemOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-currency">
              <select
                value={item.currency}
                onChange={(e) => onUpdateCost(item.id, 'currency', e.target.value)}
                className="currency-dropdown"
              >
                <option value="EUR">EUR</option>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="col-amount">
              <input
                type="number"
                value={item.amount}
                onChange={(e) => onUpdateCost(item.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="col-eur-equivalent">
              <div className="eur-amount-box">
                {isRatesLoading ? (
                  <span className="loading">Yükleniyor...</span>
                ) : (
                  formatCurrency(
                    convertCurrency(item.amount, item.currency, 'EUR', exchangeRates),
                    'EUR'
                  )
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
        ))}
      </div>

      {/* Ana Değişiklik: "cost-summary" yapısı güncellendi */}
      <div className="cost-summary">
        <span className="total-cost-label">Toplam Maliyet:</span>
        <span className="total-cost-value">{formatCurrency(totalCost, 'EUR')}</span>
      </div>
    </div>
  );
};

export default CostDetails;