// تنسيق الأعداد للعرض (Intl) مع خيار الأرقام اللاتينية/الهندية.
import type { DigitStyle } from './dates';

function loc(digits: DigitStyle) {
  return `ar-OM-u-nu-${digits === 'arab' ? 'arab' : 'latn'}`;
}

export function formatNumber(
  value: number | null | undefined,
  digits: DigitStyle = 'latn',
  maxFraction = 2,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(loc(digits), {
    maximumFractionDigits: maxFraction,
    useGrouping: false,
  }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  digits: DigitStyle = 'latn',
  maxFraction = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${formatNumber(value, digits, maxFraction)}%`;
}

/** «8.5 / 10» */
export function formatFraction(
  value: number | null | undefined,
  of: number,
  digits: DigitStyle = 'latn',
): string {
  return `${formatNumber(value, digits)} / ${formatNumber(of, digits)}`;
}
