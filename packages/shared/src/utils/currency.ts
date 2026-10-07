export interface CurrencyFormattingOptions {
  currencySymbol?: string;
  currencyPlacement?: 'prefix' | 'suffix';
  decimalPlaces?: number;
}

export const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', placement: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', placement: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', placement: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', placement: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)', placement: 'prefix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', placement: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', placement: 'prefix' },
] as const;

export function formatPrice(
  amount: number | null | undefined,
  options?: CurrencyFormattingOptions,
): string {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const symbol = options?.currencySymbol ?? '$';
  const placement = options?.currencyPlacement ?? 'prefix';
  const decimals = options?.decimalPlaces !== undefined ? options.decimalPlaces : 2;

  const formattedNumber = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (placement === 'suffix') {
    return `${formattedNumber} ${symbol}`;
  }
  return `${symbol}${formattedNumber}`;
}
