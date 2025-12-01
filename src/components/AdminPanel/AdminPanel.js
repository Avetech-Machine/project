import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters, AiOutlineReload } from 'react-icons/ai';
import { FaFileExcel } from 'react-icons/fa';
import projectService from '../../services/projectService';
import offerService from '../../services/offerService';
import './AdminPanel.css';

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Extract numeric value from currency string
  const extractNumericValue = (value) => {
    if (!value || value === 'N/A') return 0;
    const valueStr = String(value);
    const currencyMatch = valueStr.match(/(EUR|TRY|USD)?\s*([\d.,]+)/i);
    if (currencyMatch) {
      const numericStr = currencyMatch[2].replace(/,/g, '').replace(/\./g, '');
      const numericValue = parseFloat(numericStr);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all projects
      const projects = await projectService.getProjects();
      console.log('Fetched projects:', projects);

      // Process each project to gather complete data
      const dataPromises = projects.map(async (project) => {
        try {
          // Fetch detailed project info for cost details and price details
          const projectDetails = await projectService.getProjectById(project.id);
          console.log(`Project ${project.id} details:`, projectDetails);

          // Extract purchase price from costDetails
          let purchasePrice = 'EUR 0';
          if (projectDetails.costDetails) {
            const costMatch = projectDetails.costDetails.match(/Makine Alım Bedeli:\s*([^,]+)/i);
            if (costMatch) {
              let extractedValue = costMatch[1].trim();
              // Check if there's a number after EUR, if not set to EUR 0
              if (extractedValue.match(/EUR\s*$/i) || extractedValue === 'EUR') {
                purchasePrice = 'EUR 0';
              } else {
                purchasePrice = extractedValue;
              }
            }
          }

          // Extract total cost from priceDetails
          let totalCost = 'EUR 0';
          if (projectDetails.priceDetails) {
            const costMatch = projectDetails.priceDetails.match(/Total cost:\s*([^,]+)/i);
            if (costMatch) {
              let extractedValue = costMatch[1].trim();
              // Add EUR prefix if not present
              if (!extractedValue.toLowerCase().startsWith('eur')) {
                totalCost = 'EUR ' + extractedValue;
              } else {
                totalCost = extractedValue;
              }
            }
          }

          // Calculate other costs (Diğer Maliyetler) = Total Cost - Purchase Price
          const purchasePriceNum = extractNumericValue(purchasePrice);
          const totalCostNum = extractNumericValue(totalCost);
          const otherCostsNum = totalCostNum - purchasePriceNum;
          const otherCosts = otherCostsNum >= 0 ? `EUR ${otherCostsNum}` : 'EUR 0';

          // Fetch offers for this project to get sale information
          let saleDate = null;
          let salePrice = null;
          let companySold = null;

          try {
            const offers = await offerService.getOffersByProject(project.id);
            console.log(`Offers for project ${project.id}:`, offers);

            // Find the first COMPLETED offer
            const completedOffer = offers.find(offer => offer.status === 'COMPLETED');
            if (completedOffer) {
              saleDate = completedOffer.sentAt;
              // Ensure EUR prefix for sale price
              let price = completedOffer.price;
              if (price && !price.toString().toLowerCase().includes('eur')) {
                salePrice = 'EUR ' + price;
              } else {
                salePrice = price;
              }
              companySold = completedOffer.clientCompanyName;
            }
          } catch (offerError) {
            console.warn(`Could not fetch offers for project ${project.id}:`, offerError);
          }

          // Calculate gross profit = Sale Price - Total Cost
          const salePriceNum = extractNumericValue(salePrice);
          const grossProfitNum = salePriceNum - totalCostNum;
          // Only show gross profit if there's a sale price
          const grossProfit = salePriceNum > 0 ? `EUR ${grossProfitNum}` : null;

          return {
            id: project.id,
            projectCode: project.projectCode || 'N/A',
            make: project.make || 'N/A',
            model: project.model || 'N/A',
            purchaseDate: project.createdAt,
            purchasePrice,
            otherCosts,
            saleDate,
            salePrice,
            grossProfit,
            companySold,
            status: project.status === 'SOLD' ? 'SATILDI' : 'STOKTA',
            rawStatus: project.status
          };
        } catch (projectError) {
          console.error(`Error processing project ${project.id}:`, projectError);
          // Return basic data even if detailed fetch fails
          return {
            id: project.id,
            projectCode: project.projectCode || 'N/A',
            make: project.make || 'N/A',
            model: project.model || 'N/A',
            purchaseDate: project.createdAt,
            purchasePrice: 'EUR 0',
            otherCosts: 'EUR 0',
            saleDate: null,
            salePrice: null,
            grossProfit: null,
            companySold: null,
            status: project.status === 'SOLD' ? 'SATILDI' : 'STOKTA',
            rawStatus: project.status
          };
        }
      });

      const data = await Promise.all(dataPromises);
      console.log('Complete admin data:', data);
      setAdminData(data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Format number with dots as thousand separators
  const formatNumberWithDots = (number) => {
    if (number === null || number === undefined || number === '' || isNaN(number)) {
      return null;
    }
    const num = typeof number === 'number' ? number : parseFloat(number);
    if (isNaN(num)) return null;

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const numStr = Math.round(absNum).toString();
    const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return isNegative ? '-' + formatted : formatted;
  };

  const formatCurrency = (value) => {
    if (!value || value === 'N/A') return 'N/A';

    // Extract numeric value from string like "EUR 18000" or "18000" or "EUR -5000"
    const valueStr = String(value);
    const currencyMatch = valueStr.match(/(EUR|TRY|USD)?\s*([-\d.,]+)/i);

    if (currencyMatch) {
      const currency = currencyMatch[1] || 'EUR';
      const numericStr = currencyMatch[2].replace(/,/g, '').replace(/\./g, '');
      const numericValue = parseFloat(numericStr);

      if (!isNaN(numericValue)) {
        const formatted = formatNumberWithDots(numericValue);
        return formatted ? `${currency} ${formatted}` : value;
      }
    }

    return value;
  };

  const handleExportToExcel = async () => {
    try {
      await projectService.exportProjectsToExcel();
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Excel dışa aktarma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h1>Yönetici Paneli</h1>
        </div>
        <div className="admin-panel-loading">
          <AiOutlineLoading3Quarters className="loading-spinner" />
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h1>Yönetici Paneli</h1>
        </div>
        <div className="admin-panel-error">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchAdminData}>
            <AiOutlineReload /> Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Yönetici Paneli</h1>
        <button className="export-excel-button" onClick={handleExportToExcel}>
          <FaFileExcel /> Excel ile Dışa Aktar
        </button>
      </div>

      <div className="admin-panel-table-wrapper">
        <div className="admin-panel-table-container">
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>Proje Kodu</th>
                <th>Marka & Model</th>
                <th>Satın Alma Tarihi</th>
                <th>Satın Alma Fiyatı</th>
                <th>Diğer Maliyetler</th>
                <th>Satış Tarihi</th>
                <th>Satış Fiyatı</th>
                <th>Satılan Firma</th>
                <th>Brüt Kar</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {adminData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    Gösterilecek veri bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                adminData.map((item) => (
                  <tr key={item.id}>
                    <td className="project-code">{item.projectCode}</td>
                    <td className="make-model">{item.make} {item.model}</td>
                    <td>{formatDate(item.purchaseDate)}</td>
                    <td className="currency">{formatCurrency(item.purchasePrice)}</td>
                    <td className="currency">{formatCurrency(item.otherCosts)}</td>
                    <td>{formatDate(item.saleDate)}</td>
                    <td className="currency">
                      {item.salePrice ? formatCurrency(item.salePrice) : 'N/A'}
                    </td>
                    <td>{item.companySold || 'N/A'}</td>
                    <td className="currency">
                      {item.grossProfit ? formatCurrency(item.grossProfit) : 'N/A'}
                    </td>
                    <td className={`status-cell ${item.status === 'SATILDI' ? 'sold' : 'instock'}`}>
                      {item.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

