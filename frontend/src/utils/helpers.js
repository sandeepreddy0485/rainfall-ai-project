// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get gradient based on value
export const getGradientClass = (value, max = 100) => {
  const percent = (value / max) * 100;
  if (percent < 25) return 'from-green-400 to-green-600';
  if (percent < 50) return 'from-yellow-400 to-yellow-600';
  if (percent < 75) return 'from-orange-400 to-orange-600';
  return 'from-red-400 to-red-600';
};

// Copy to clipboard
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy:', err));
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
