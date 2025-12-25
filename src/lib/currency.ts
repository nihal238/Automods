/**
 * Format price in Indian Rupees (INR)
 * @param price - Price in paise (smallest currency unit)
 * @returns Formatted price string with ₹ symbol
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price / 100);
};

/**
 * Format price from decimal value (e.g., form input)
 * @param price - Price in rupees (decimal)
 * @returns Formatted price string with ₹ symbol
 */
export const formatPriceFromDecimal = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};
