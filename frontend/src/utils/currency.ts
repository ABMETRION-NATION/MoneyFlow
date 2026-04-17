export type Currency = {
  code: string;
  symbol: string;
  label: string;
  locale: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', locale: 'en-AE' },
];

export const getCurrency = (code: string): Currency => {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
};

export const formatAmount = (amount: number, currencyCode: string, withSymbol = true): string => {
  const c = getCurrency(currencyCode);
  const abs = Math.abs(amount);
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(c.locale, {
      minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(abs);
  } catch {
    formatted = abs.toFixed(2);
  }
  if (!withSymbol) return formatted;
  return `${c.symbol}${formatted}`;
};

export const formatSigned = (amount: number, type: 'income' | 'expense', currencyCode: string): string => {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatAmount(amount, currencyCode)}`;
};
