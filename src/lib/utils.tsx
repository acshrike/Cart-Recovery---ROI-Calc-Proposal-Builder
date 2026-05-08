import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (val: number, currency: string = '$', decimals: number = 0) => {
  return currency + val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const wrapPlaceholder = (val: string, placeholder: string) => {
  return val.trim() || `<span style="opacity: 0.3; border-bottom: 1px dashed rgba(255,255,255,0.3)">${placeholder}</span>`;
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatNumberWithCommas = (val: string) => {
  if (!val) return '';
  const cleanVal = val.replace(/,/g, '');
  if (isNaN(Number(cleanVal))) return val;
  const parts = cleanVal.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const parseNumberFromCommas = (val: string) => {
  return val.replace(/,/g, '');
};
