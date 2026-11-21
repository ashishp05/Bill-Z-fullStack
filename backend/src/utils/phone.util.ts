// Indian mobile numbers are stored in one display format so lookups can match exactly.
const MOBILE_DIGITS = 10;

export const mobileDigits = (value: string): string =>
  value.replace(/\D/g, '').slice(-MOBILE_DIGITS);

export const isValidIndianMobile = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local);
};

// Returns "+91 98765 43210".
export const normalizeIndianMobile = (value: string): string => {
  const digits = mobileDigits(value);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};
