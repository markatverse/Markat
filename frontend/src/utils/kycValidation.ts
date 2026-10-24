/**
 * Indian KYC & Tax Verification Utilities
 * Validates real GST, PAN, and Aadhaar formats according to Indian Government standards.
 */

// GST: 15 alphanumeric characters: 2 state digits + 10 PAN chars + 1 entity digit + 'Z' + 1 checksum char
export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// PAN: 10 alphanumeric characters: 5 letters + 4 digits + 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Aadhaar: 12 digits: cannot start with 0 or 1
export const AADHAAR_REGEX = /^[2-9]{1}[0-9]{11}$/;

export interface KycValidationResult {
  isValid: boolean;
  valid: boolean;
  error?: string;
  message?: string;
  pan?: string;
}

/**
 * Validates a GSTIN string.
 */
export function validateGst(gst: string): KycValidationResult {
  if (!gst) return { isValid: false, valid: false, error: 'GST number is required.', message: 'GST number is required.' };
  const clean = gst.trim().toUpperCase();
  if (clean.length !== 15) {
    const msg = `GST must be exactly 15 characters (currently ${clean.length}).`;
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  if (!GST_REGEX.test(clean)) {
    const msg = 'Invalid GST format. (e.g. 07AAAAA0000A1Z5)';
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  const pan = clean.substring(2, 12);
  return { isValid: true, valid: true, pan };
}

/**
 * Validates a PAN string.
 */
export function validatePan(pan: string): KycValidationResult {
  if (!pan) return { isValid: false, valid: false, error: 'PAN number is required.', message: 'PAN number is required.' };
  const clean = pan.trim().toUpperCase();
  if (clean.length !== 10) {
    const msg = `PAN must be exactly 10 characters (currently ${clean.length}).`;
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  if (!PAN_REGEX.test(clean)) {
    const msg = 'Invalid PAN format. (e.g. ABCDE1234F)';
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  return { isValid: true, valid: true };
}

/**
 * Validates a 12-digit Aadhaar number string (ignoring spaces or dashes).
 */
export function validateAadhaar(aadhaar: string): KycValidationResult {
  if (!aadhaar) return { isValid: false, valid: false, error: 'Aadhaar number is required.', message: 'Aadhaar number is required.' };
  const digitsOnly = aadhaar.replace(/\D/g, '');
  if (digitsOnly.length !== 12) {
    const msg = `Aadhaar must be exactly 12 digits (currently ${digitsOnly.length}).`;
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  if (!AADHAAR_REGEX.test(digitsOnly)) {
    const msg = 'Invalid Aadhaar number. Aadhaar cannot start with 0 or 1.';
    return { isValid: false, valid: false, error: msg, message: msg };
  }
  return { isValid: true, valid: true };
}

/**
 * Checks if at least one valid tax identifier is provided (either valid GST or valid PAN).
 */
export function hasValidTaxId(gst?: string, pan?: string): boolean {
  if (gst && validateGst(gst).isValid) return true;
  if (pan && validatePan(pan).isValid) return true;
  return false;
}

/**
 * Formats a raw Aadhaar input into "XXXX XXXX XXXX" blocks.
 */
export function formatAadhaarInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Masks an Aadhaar number for secure display: "•••• •••• 1234"
 */
export function maskAadhaar(val?: string | null): string {
  if (!val) return 'Not Provided';
  const digits = val.replace(/\D/g, '');
  if (digits.length < 4) return val;
  const last4 = digits.slice(-4);
  return `•••• •••• ${last4}`;
}
