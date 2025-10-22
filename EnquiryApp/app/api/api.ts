import { API_URL } from './config';

// Validate E.164 phone number format
const isValidPhone = (phone: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

// Validate 6-digit OTP
const isValidOtp = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Validate API_URL is set
if (!API_URL) {
  throw new Error('API_URL must be set in config.ts');
}

/**
 * Request OTP for phone number
 * @param phone - E.164 formatted phone number (+1234567890)
 * @param formData - Optional additional form data
 * @returns Promise with requestId
 */
export async function requestOtp(phone: string, formData?: Record<string, any>): Promise<{ requestId: string }> {
  if (!isValidPhone(phone)) {
    throw new Error('Invalid phone format. Must be E.164 format (+1234567890)');
  }

  try {
    const response = await fetch(`${API_URL}/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        formData: formData || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to request OTP');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

/**
 * Verify OTP with requestId and phone
 * @param requestId - UUID from requestOtp response
 * @param phone - E.164 formatted phone number
 * @param otp - 6-digit OTP code
 * @returns Promise with success status
 */
export async function verifyOtp(requestId: string, phone: string, otp: string): Promise<{ ok: true }> {
  if (!isValidPhone(phone)) {
    throw new Error('Invalid phone format. Must be E.164 format (+1234567890)');
  }

  if (!isValidOtp(otp)) {
    throw new Error('Invalid OTP format. Must be 6 digits');
  }

  if (!requestId) {
    throw new Error('RequestId is required');
  }

  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        phone,
        otp,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to verify OTP');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}
