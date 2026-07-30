// Supported currencies with their display information
export const SUPPORTED_CURRENCIES: Record<
  string,
  { code: string; symbol: string; name: string; locale: string }
> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc", locale: "de-CH" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
};

/**
 * Format a numeric amount with the correct currency symbol and locale formatting.
 * Uses Intl.NumberFormat for proper locale-aware formatting (e.g., ₹1,00,000.00 for INR).
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currencyCode === "JPY" ? 0 : 2,
    maximumFractionDigits: currencyCode === "JPY" ? 0 : 2,
  }).format(amount);
}

/**
 * Get just the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode: string = "USD"): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || "$";
}

/** List of currency codes for use in dropdowns */
export const CURRENCY_LIST = Object.values(SUPPORTED_CURRENCIES);
