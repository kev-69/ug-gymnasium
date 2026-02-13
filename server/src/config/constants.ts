// Developer Revenue Share
// The client agreed to add 5% to all subscription packages
// This markup will be split between developers and client via Paystack
export const DEVELOPER_MARKUP_PERCENTAGE = 5; // 5%

// Helper function to calculate price with developer markup
export const calculatePriceWithMarkup = (basePrice: number): number => {
  return basePrice * (1 + DEVELOPER_MARKUP_PERCENTAGE / 100);
};

// Helper function to calculate base price from marked-up price
export const calculateBasePrice = (markedUpPrice: number): number => {
  return markedUpPrice / (1 + DEVELOPER_MARKUP_PERCENTAGE / 100);
};

// Calculate developer's share from total amount
export const calculateDeveloperShare = (totalAmount: number): number => {
  const basePrice = calculateBasePrice(totalAmount);
  return totalAmount - basePrice;
};
