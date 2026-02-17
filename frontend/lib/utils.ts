import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOCALE = process.env.NEXT_PUBLIC_LOCALE || 'en-US';
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'USD';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

/**
 * Format a number as a currency string (e.g., "$1,234.56").
 * Configure via NEXT_PUBLIC_LOCALE and NEXT_PUBLIC_CURRENCY env vars.
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
