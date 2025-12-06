import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineEuro } from 'react-icons/ai';
import { FaChartLine } from 'react-icons/fa';
import offerService from '../../services/offerService';
import projectService from '../../services/projectService';
import './ProposalInformationModal.css';

const CostInformationModal = ({ service, onClose }) => {
    const [costDetails, setCostDetails] = useState(null);
    const [priceDetails, setPriceDetails] = useState(null);
    const [offerPrice, setOfferPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCostData = async () => {
            if (!service?.id) {
                setError('Proje ID bulunamadı');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch offer details from the new endpoint to extract salePrice
                const offerData = await offerService.getOffersByProject(service.id);

                // Extract salePrice from offers with status "COMPLETED"
                if (offerData && Array.isArray(offerData) && offerData.length > 0) {
                    // Find the first offer with status "COMPLETED" and a salePrice
                    const completedOffer = offerData.find(offer => offer.status === 'COMPLETED' && offer.salePrice);
                    if (completedOffer && completedOffer.salePrice) {
                        setOfferPrice(completedOffer.salePrice);
                    }
                }

                // Fetch cost details
                const costData = await projectService.getProjectCostDetails(service.id);
                setCostDetails(costData.costDetails);
                setPriceDetails(costData.priceDetails);
            } catch (err) {
                console.error('Error fetching cost data:', err);
                setError(err.message || 'Maliyet bilgileri yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchCostData();
    }, [service?.id]);

    const formatCurrency = (amount, currency = 'EUR') => {
        if (currency === 'TRY') {
            return `₺${amount.toLocaleString('tr-TR')}`;
        }
        return `€${amount.toLocaleString('de-DE')}`;
    };

    // Parse cost details from API response
    const parseCostDetails = (costDetailsString) => {
        if (!costDetailsString) return [];

        const items = costDetailsString.split(',').map(item => {
            const [description, currencyAmount] = item.trim().split(':');
            const [currency, amount] = currencyAmount.trim().split(' ');
            return {
                id: Math.random(),
                description: description.trim(),
                currency: currency.trim(),
                amount: isNaN(parseFloat(amount)) ? 0 : parseFloat(amount)
            };
        });

        return items;
    };

    // Parse price details from API response
    const parsePriceDetails = (priceDetailsString) => {
        if (!priceDetailsString) return {};

        const details = {};
        const items = priceDetailsString.split(',').map(item => {
            const [key, value] = item.trim().split(':');
            return { key: key.trim(), value: value.trim() };
        });

        items.forEach(item => {
            const numericValue = parseFloat(item.value) || 0;
            if (item.key.includes('Base price')) {
                details.targetPrice = numericValue;
                details.salesPrice = numericValue;
            } else if (item.key.includes('Satış Fiyatı')) {
                details.salesPrice = numericValue;
            } else if (item.key.includes('Total cost') || item.key.includes('Toplam Maliyet')) {
                details.totalCost = numericValue;
            } else if (item.key.includes('Net profit') || item.key.includes('Net Kâr')) {
                details.netProfit = numericValue;
            }
        });

        return details;
    };

    const parsedCostDetails = parseCostDetails(costDetails);
    const parsedPriceDetails = parsePriceDetails(priceDetails);

    const totalCost = parsedPriceDetails.totalCost || parsedCostDetails.reduce((sum, item) => sum + item.amount, 0);
    // Use price from offer if available, otherwise fallback to parsed price details or service data
    const salesPrice = offerPrice ?? parsedPriceDetails.salesPrice ?? service.salesPrice ?? 0;
    const targetPrice = parsedPriceDetails.targetPrice ?? 0;
    const bidPrice = salesPrice; // Bid price is set to the same value as ask price (salesPrice)
    const netProfit = parsedPriceDetails.netProfit || (salesPrice - totalCost);
    const profitMargin = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

    return (
        <div className="proposal-modal-overlay" onClick={onClose}>
            <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Maliyet Bilgileri</h2>
                        <button className="close-button" onClick={onClose}>
                            <AiOutlineClose />
                        </button>
                    </div>

                    <div className="service-info">
                        <h3>{service.machineName}</h3>
                        <p className="service-id">Proje Kodu: {service.machineName}</p>
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <p>Maliyet bilgileri yükleniyor...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <p>Hata: {error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="proposal-content">
                            {/* Cost Information Section */}
                            <div className="cost-section">
                                <div className="section-header">
                                    <AiOutlineEuro className="section-icon" />
                                    <h4>Maliyet Detayları</h4>
                                </div>
                                <div className="cost-list">
                                    {parsedCostDetails.map((item) => (
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

                            {/* Sales and Profit Information */}
                            <div className="sales-profit-section">
                                <div className="sales-section">
                                    <div className="section-header">
                                        <FaChartLine className="section-icon" />
                                        <h4>Satış Bilgileri</h4>
                                    </div>
                                    <div className="sales-info">
                                        <div className="sales-item">
                                            <span>Hedef Fiyat:</span>
                                            <span className="sales-price">{formatCurrency(targetPrice)}</span>
                                        </div>
                                        <div className="sales-item">
                                            <span>Teklif Fiyatı:</span>
                                            <span className="sales-price">{formatCurrency(bidPrice)}</span>
                                        </div>
                                        <div className="sales-item">
                                            <span>Net Satış Fiyatı:</span>
                                            <span className="sales-price">{formatCurrency(salesPrice)}</span>
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
                                            <span className={`profit-amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                                                {formatCurrency(netProfit)}
                                            </span>
                                        </div>
                                        <div className="profit-item">
                                            <span>Net Kâr Marjı:</span>
                                            <span className={`profit-margin ${profitMargin >= 0 ? 'positive' : 'negative'}`}>
                                                {profitMargin.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CostInformationModal;
