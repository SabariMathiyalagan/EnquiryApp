import { API_URL, API_KEY } from './config';

// Common headers for all API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
});

// ===== API Response Types =====

export interface RequestOtpResponse {
  requestId: string;
}

export interface VerifyOtpResponse {
  ok: boolean;
}

export interface SubmitEnquiryResponse {
  success: boolean;
  enquiryId: string;
}

export interface ApiError {
  error: string;
}

// ===== API Functions =====

/**
 * Request OTP for phone number verification
 * @param phone - Phone number in format XXX-XXX-XXXX (will be converted to E.164 format)
 * @returns Promise with requestId
 */
export const requestOtp = async (phone: string): Promise<RequestOtpResponse> => {
  try {
    // Convert phone format from XXX-XXX-XXXX to +1XXXXXXXXXX
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const e164Phone = `+1${cleanPhone}`;

    const response = await fetch(`${API_URL}/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        phone: e164Phone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request OTP');
    }

    return data;
  } catch (error) {
    console.error('Request OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP code
 * @param requestId - The request ID from requestOtp
 * @param phone - Phone number in format XXX-XXX-XXXX
 * @param otp - 6-digit OTP code
 * @returns Promise with ok status
 */
export const verifyOtp = async (
  requestId: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  try {
    const requestBody = {
      requestId,
      otp,
    };
    
    console.log('API - Sending verify request:', requestBody);
    
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }

    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Submit enquiry form data
 * @param formData - Complete form data object
 * @returns Promise with success status and enquiryId
 */
export const submitEnquiry = async (formData: any): Promise<SubmitEnquiryResponse> => {
  try {
    const response = await fetch(`${API_URL}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit enquiry');
    }

    return data;
  } catch (error) {
    console.error('Submit enquiry error:', error);
    throw error;
  }
};
