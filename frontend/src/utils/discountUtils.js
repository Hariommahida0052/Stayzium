export const calculateDiscountedPrice = (originalPrice, discountString) => {
  if (!discountString || typeof originalPrice !== 'number' || isNaN(originalPrice)) {
    return originalPrice;
  }
  
  const numMatch = discountString.match(/\d+(\.\d+)?/);
  if (!numMatch) return originalPrice;
  
  const value = parseFloat(numMatch[0]);
  
  if (discountString.includes('%')) {
    // Percentage discount
    return Math.max(0, originalPrice * (1 - value / 100));
  } else {
    // Flat discount
    return Math.max(0, originalPrice - value);
  }
};
