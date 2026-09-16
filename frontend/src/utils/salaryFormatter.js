/**
 * HireHub AI — Indian Salary & Currency Formatter Utility
 * Handles conversion and formatting into Indian Rupees (₹) and standard LPA (Lakhs Per Annum)
 */

/**
 * Format salary into standard Indian Rupee representation (e.g. ₹18 - ₹28 LPA or ₹1.2 - ₹1.5 Cr PA)
 * If salary comes in USD (e.g., from overseas roles), it converts to INR (1 USD ≈ 83 INR)
 *
 * @param {number|string} minSalary
 * @param {number|string} maxSalary
 * @param {string} [currency='INR']
 * @returns {string|null} Formatted salary string with ₹
 */
export const formatIndianSalary = (minSalary, maxSalary, currency = 'INR') => {
  let min = Number(minSalary);
  let max = Number(maxSalary);

  if ((!min || isNaN(min)) && (!max || isNaN(max))) {
    return null;
  }

  const isUsd = (currency && currency.toUpperCase() === 'USD');

  // Convert USD to INR if specified (1 USD = 83 INR)
  if (isUsd) {
    if (min && !isNaN(min)) min = Math.round(min * 83);
    if (max && !isNaN(max)) max = Math.round(max * 83);
  }

  // Format single amount into Lakhs / Crores / Thousands
  const formatAmount = (val) => {
    if (!val || isNaN(val)) return '';

    // If value was already entered as a small number representing LPA (e.g. 15 to 60)
    if (val > 0 && val <= 150) {
      return `₹${val} LPA`;
    }

    // 1 Crore = 10,000,000
    if (val >= 10000000) {
      const cr = (val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1);
      return `₹${cr} Cr PA`;
    }

    // 1 Lakh = 100,000
    if (val >= 100000) {
      const lpa = (val / 100000).toFixed(val % 100000 === 0 ? 0 : 1);
      return `₹${lpa} LPA`;
    }

    // Fallback for smaller amounts / monthly stipends
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Helper to extract cleanly without repeating LPA if both in LPA
  if (min && max && min !== max) {
    // Both in LPA range (1 Lakh to 99 Lakhs)
    if (min >= 100000 && max >= 100000 && min < 10000000 && max < 10000000) {
      const minLpa = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
      const maxLpa = (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1);
      return `₹${minLpa} - ₹${maxLpa} LPA`;
    }

    // Both in Crores (>= 1 Cr)
    if (min >= 10000000 && max >= 10000000) {
      const minCr = (min / 10000000).toFixed(min % 10000000 === 0 ? 0 : 1);
      const maxCr = (max / 10000000).toFixed(max % 10000000 === 0 ? 0 : 1);
      return `₹${minCr} - ₹${maxCr} Cr PA`;
    }

    // Already LPA (e.g. 15 - 28)
    if (min <= 150 && max <= 150) {
      return `₹${min} - ₹${max} LPA`;
    }

    return `${formatAmount(min)} - ${formatAmount(max)}`;
  }

  return formatAmount(min || max);
};

export default formatIndianSalary;
