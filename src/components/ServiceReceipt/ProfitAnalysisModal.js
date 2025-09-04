import React from 'react';
import { AiOutlineClose, AiOutlineEuro } from 'react-icons/ai';
import { FaChartLine } from 'react-icons/fa';
import './ProfitAnalysisModal.css';

const ProfitAnalysisModal = ({ service, onClose }) => {
  const formatCurrency = (amount, currency = 'EUR') => {
    if (currency === 'TRY') {
      return `₺${amount.toLocaleString('tr-TR')}`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const calculateTotalCost = () => {
    return service.costDetails.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
  };

  const totalCost = calculateTotalCost();
  const profit = service.salesPrice - totalCost;
  const profitMargin = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

  return (
    <div className="profit-analysis-modal-overlay" onClick={onClose}>
      <div className="profit-analysis-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>
            <AiOutlineClose />
          </button>
          
          <div className="service-info">
            <h3>{service.machineName}</h3>
            <p className="service-id">Proje ID: {service.id}</p>
          </div>

          <div className="analysis-grid">
            <div className="cost-section">
              <div className="section-header">
                <AiOutlineEuro className="section-icon" />
                <h4>Maliyet Detayları</h4>
              </div>
              <div className="cost-list">
                {service.costDetails.map((item) => (
                  <div key={item.id} className="cost-item">
                    <span className="cost-description">{item.description}</span>
                    <span className="cost-amount">{formatCurrency(item.amount, item.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="total-cost">
                <span>Toplam Maliyet:</span>
                <span className="total-amount">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <div className="sales-section">
              <div className="section-header">
                <FaChartLine className="section-icon" />
                <h4>Satış Bilgileri</h4>
              </div>
              <div className="sales-info">
                <div className="sales-item">
                  <span>Satış Fiyatı:</span>
                  <span className="sales-price">{formatCurrency(service.salesPrice)}</span>
                </div>
                <div className="sales-item">
                  <span>Durum:</span>
                  <span className="sales-status">{service.status}</span>
                </div>
              </div>
            </div>

            <div className="profit-section">
              <div className="section-header">
                <FaChartLine className="section-icon" />
                <h4>Kâr Analizi</h4>
              </div>
              <div className="profit-info">
                <div className="profit-item">
                  <span>Net Kâr:</span>
                  <span className={`profit-amount ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="profit-item">
                  <span>Kâr Marjı:</span>
                  <span className={`profit-margin ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="profit-item">
                  <span>ROI:</span>
                  <span className={`roi-amount ${profit >= 0 ? 'positive' : 'negative'}`}>
                    {totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitAnalysisModal;
