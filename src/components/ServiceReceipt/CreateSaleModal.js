import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineDollar, AiOutlineFileText, AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { FaHandshake } from 'react-icons/fa';
import saleService from '../../services/saleService';
import offerService from '../../services/offerService';
import projectService from '../../services/projectService';
import './CreateSaleModal.css';

const CreateSaleModal = ({ offer, onClose, onSaleComplete }) => {
  const [salePrice, setSalePrice] = useState('');
  const [salePriceDisplay, setSalePriceDisplay] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [financingCost, setFinancingCost] = useState('');
  const [financingCostDisplay, setFinancingCostDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [originalOfferDescription, setOriginalOfferDescription] = useState('');

  // Helper function to format number with periods as thousand separators
  const formatNumberWithPeriods = (num) => {
    if (!num && num !== 0) return '';
    const numStr = num.toString().replace(/\./g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Helper function to parse formatted number (remove periods)
  const parseFormattedNumber = (str) => {
    if (!str) return '';
    return str.replace(/\./g, '');
  };

  // Set initial price and store original description from offer when modal opens
  useEffect(() => {
    if (offer?.price) {
      const priceValue = offer.price.toString();
      setSalePrice(priceValue);
      setSalePriceDisplay(formatNumberWithPeriods(offer.price));
      setOriginalPrice(offer.price);
    }

    // Store the original offer description if it exists
    if (offer?.description) {
      setOriginalOfferDescription(offer.description);
    } else {
      // If description is not in the offer object, fetch the full offer details
      const fetchOfferDescription = async () => {
        if (offer?.id) {
          try {
            const offerDetails = await offerService.getOfferById(offer.id);
            if (offerDetails?.description) {
              setOriginalOfferDescription(offerDetails.description);
            }
          } catch (err) {
            console.error('Error fetching offer description:', err);
            // Continue without description if fetch fails
          }
        }
      };
      fetchOfferDescription();
    }
  }, [offer]);

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    // Remove all periods and check if remaining is numeric
    const numericOnly = inputValue.replace(/\./g, '');

    // Only allow empty string or numeric values
    if (numericOnly === '' || /^\d+$/.test(numericOnly)) {
      if (numericOnly === '') {
        setSalePriceDisplay('');
        setSalePrice('');
      } else {
        const num = parseInt(numericOnly, 10);
        if (!isNaN(num)) {
          // Store numeric value as string
          setSalePrice(num.toString());
          // Display formatted with periods
          setSalePriceDisplay(formatNumberWithPeriods(num));
        }
      }
    }
  };

  const handleFinancingCostChange = (e) => {
    const inputValue = e.target.value;
    // Remove all periods and check if remaining is numeric
    const numericOnly = inputValue.replace(/\./g, '');

    // Only allow empty string or numeric values
    if (numericOnly === '' || /^\d+$/.test(numericOnly)) {
      if (numericOnly === '') {
        setFinancingCostDisplay('');
        setFinancingCost('');
      } else {
        const num = parseInt(numericOnly, 10);
        if (!isNaN(num)) {
          // Store numeric value as string
          setFinancingCost(num.toString());
          // Display formatted with periods
          setFinancingCostDisplay(formatNumberWithPeriods(num));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // salePrice already contains the numeric value as string, parse it to int
    const numericPrice = salePrice ? parseInt(salePrice, 10) : 0;

    if (!numericPrice || numericPrice <= 0) {
      setError('Geçerli bir satış fiyatı giriniz');
      return;
    }

    if (!offer?.id) {
      setError('Teklif ID bulunamadı');
      return;
    }

    if (!offer?.projectId) {
      setError('Proje ID bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Compare prices with tolerance for floating point precision
      const priceChanged = originalPrice !== null && Math.abs(numericPrice - originalPrice) > 0.01;

      // Combine original offer description with new sale notes
      const newNotes = saleNotes.trim();
      let finalDescription = '';

      if (originalOfferDescription && newNotes) {
        // Both exist: combine them
        finalDescription = `${originalOfferDescription}\n\n${newNotes}`;
      } else if (originalOfferDescription) {
        // Only original exists: use it
        finalDescription = originalOfferDescription;
      } else if (newNotes) {
        // Only new notes exist: use them
        finalDescription = newNotes;
      }
      // If neither exists, finalDescription remains empty string

      if (!priceChanged) {
        // Use default price - call createSaleFromOffer endpoint
        await saleService.createSaleFromOffer(
          offer.projectId,
          offer.id,
          finalDescription
        );
      } else {
        // Price was changed - call createSale endpoint
        // First, fetch the offer to get ccEmails
        const offerDetails = await offerService.getOfferById(offer.id);

        const saleData = {
          projectId: offer.projectId,
          clientId: offer.clientId,
          ccEmails: offerDetails.ccEmails || [],
          price: numericPrice, // Send as integer
          description: finalDescription
        };

        await saleService.createSaleWithPrice(offer.projectId, saleData);
      }

      // If financing cost was provided, update project's costDetails and priceDetails
      if (financingCost && parseInt(financingCost, 10) > 0) {
        try {
          // Fetch current project details
          const currentProject = await projectService.getProjectById(offer.projectId);

          // Build new costDetails string
          let updatedCostDetails = currentProject.costDetails || '';
          const financingCostValue = parseInt(financingCost, 10);
          const financingCostText = `Finansman Maliyeti: EUR ${financingCostValue}`;

          // Append financing cost to existing costDetails
          if (updatedCostDetails.trim()) {
            updatedCostDetails += `, ${financingCostText}`;
          } else {
            updatedCostDetails = financingCostText;
          }

          // Parse and update priceDetails
          let updatedPriceDetails = currentProject.priceDetails || '';

          if (updatedPriceDetails) {
            // Parse current priceDetails: "Base price: 1441, Total cost: 124, Net profit: 1317"
            const basePriceMatch = updatedPriceDetails.match(/Base price:\s*(\d+)/);
            const totalCostMatch = updatedPriceDetails.match(/Total cost:\s*(\d+)/);
            const netProfitMatch = updatedPriceDetails.match(/Net profit:\s*(\d+)/);

            if (basePriceMatch && totalCostMatch) {
              const basePrice = parseInt(basePriceMatch[1], 10);
              const currentTotalCost = parseInt(totalCostMatch[1], 10);

              // Calculate new values
              const newTotalCost = currentTotalCost + financingCostValue;
              const newNetProfit = basePrice - newTotalCost;

              // Rebuild priceDetails string
              updatedPriceDetails = `Base price: ${basePrice}, Total cost: ${newTotalCost}, Net profit: ${newNetProfit}`;
            }
          }

          // Update project with new costDetails and priceDetails
          // IMPORTANT: Include existing photos to prevent them from being deleted
          const existingPhotoUrls = currentProject.photos || [];

          await projectService.updateProject(
            offer.projectId,
            {
              ...currentProject,
              costDetails: updatedCostDetails,
              priceDetails: updatedPriceDetails
            },
            [], // No new photo files
            existingPhotoUrls // Keep existing photos
          );

          console.log('Project costDetails updated:', updatedCostDetails);
          console.log('Project priceDetails updated:', updatedPriceDetails);
          console.log('Existing photos preserved:', existingPhotoUrls.length);
        } catch (updateError) {
          console.error('Error updating project costDetails/priceDetails:', updateError);
          // Don't fail the entire sale creation if costDetails update fails
          // Just log the error
        }
      }

      setShowSuccess(true);

      // Close modal and refresh after showing success message
      setTimeout(() => {
        onSaleComplete();
      }, 2000);
    } catch (err) {
      console.error('Create sale error:', err);
      setError(err.message || 'Satış oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSalePrice('');
    setSalePriceDisplay('');
    setSaleNotes('');
    setFinancingCost('');
    setFinancingCostDisplay('');
    setError('');
    setOriginalPrice(null);
    onClose();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!offer) return null;

  return (
    <div className="create-sale-modal-overlay">
      <div className="create-sale-modal">
        <div className="modal-header">
          <h2>
            <FaHandshake className="header-icon" />
            Satış Oluştur
          </h2>
          <button className="close-button" onClick={handleClose}>
            <AiOutlineClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="offer-info-section">
            <h3>Teklif Bilgileri</h3>
            <div className="offer-details">
              <div className="info-item">
                <AiOutlineFileText className="info-icon" />
                <span className="info-label">Proje Kodu:</span>
                <span className="info-value">{offer.projectCode}</span>
              </div>
              <div className="info-item">
                <AiOutlineUser className="info-icon" />
                <span className="info-label">Müşteri:</span>
                <span className="info-value">{offer.clientCompanyName}</span>
              </div>
              <div className="info-item">
                <AiOutlineCalendar className="info-icon" />
                <span className="info-label">Teklif Tarihi:</span>
                <span className="info-value">{formatDate(offer.sentAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Durum:</span>
                <span className="info-value status">{offer.status}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sale-form">
            <div className="form-group">
              <label htmlFor="salePrice">
                <AiOutlineDollar className="label-icon" />
                Satış Fiyatı {offer?.price && `(${formatNumberWithPeriods(offer.price)} EUR)`} *
              </label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  id="salePrice"
                  value={salePriceDisplay}
                  onChange={handlePriceChange}
                  placeholder={offer?.price ? `${formatNumberWithPeriods(offer.price)}` : "Satış fiyatını giriniz"}
                  required
                  inputMode="numeric"
                />
                <span className="currency-label">EUR</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="financingCost">
                <AiOutlineDollar className="label-icon" />
                Finansman Maliyeti (EUR)
              </label>
              <div className="price-input-wrapper">
                <input
                  type="text"
                  id="financingCost"
                  value={financingCostDisplay}
                  onChange={handleFinancingCostChange}
                  placeholder="Finansman maliyetini giriniz"
                  inputMode="numeric"
                />
                <span className="currency-label">EUR</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="saleNotes">
                <AiOutlineFileText className="label-icon" />
                Satış Notları
              </label>
              <textarea
                id="saleNotes"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Satış ile ilgili notlarınızı buraya yazabilirsiniz..."
                rows="4"
              />
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FaHandshake className="btn-icon" />
                    Satış Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message-box">
            <div className="success-icon">
              <FaHandshake />
            </div>
            <h3>Satış Başarıyla Oluşturuldu!</h3>
            <p>Satış kaydı başarıyla oluşturuldu.</p>
            <p className="success-detail">Satış Fiyatı: {salePriceDisplay || formatNumberWithPeriods(salePrice)} EUR</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSaleModal;
