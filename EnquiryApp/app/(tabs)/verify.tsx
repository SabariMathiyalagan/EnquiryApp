import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  BrandColors, 
  NeutralColors, 
  TextColors, 
  BackgroundColors,
  Shadow,
  Spacing,
  BorderRadius,
  Typography,
  ContainerWidth,
  moderateScale
} from '@/constants/theme';
import { verifyOtp, submitEnquiry, requestOtp } from '@/app/api/api';

const OTP_LENGTH = 4;
const TIMER_DURATION = 300; // 5 minutes in seconds

export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Extract passed parameters
  const requestId = params.requestId as string;
  const phone = params.phone as string;
  const formDataStr = params.formData as string;
  
  // Parse form data
  const formData = formDataStr ? JSON.parse(formDataStr) : null;
  
  // State
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const pastedData = value.slice(0, OTP_LENGTH).split('');
      pastedData.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    
    // Single character input
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };
  
  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle verify
  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    // Validate OTP
    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter the complete 4-digit code');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      // Step 1: Verify OTP
      await verifyOtp(requestId, otpCode);
      
      // Step 2: Submit enquiry
      setIsSubmitting(true);
      await submitEnquiry(formData);
      
      // Success!
      Alert.alert(
        'Success!',
        'Your enquiry has been submitted successfully. We will contact you soon!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('./');
            }
          }
        ]
      );
    } catch (err: any) {
      setIsVerifying(false);
      setIsSubmitting(false);
      
      // Display user-friendly error messages
      const errorMessage = err.message || 'Verification failed';
      
      if (errorMessage.includes('expired')) {
        setError('Your code has expired. Please request a new one.');
      } else if (errorMessage.includes('Invalid OTP')) {
        setError('Invalid code. Please check and try again.');
      } else if (errorMessage.includes('not found')) {
        setError('Code not found. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
      
      console.error('Verify error:', err);
    }
  };
  
  // Handle resend OTP
  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setOtp(Array(OTP_LENGTH).fill(''));
    
    try {
      const response = await requestOtp(phone);
      
      // Update requestId in params (using router.replace to update params)
      router.replace({
        pathname: './verify' as any,
        params: {
          requestId: response.requestId,
          phone,
          formData: formDataStr,
        },
      });
      
      // Reset timer
      setTimeLeft(TIMER_DURATION);
      setCanResend(false);
      
      Alert.alert('Success', 'A new verification code has been sent to your phone.');
      
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  // Validate required params
  if (!requestId || !phone || !formData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={BrandColors.primary} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Invalid Request</Text>
          <Text style={styles.errorText}>
            Missing required information. Please go back and try again.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const isLoading = isVerifying || isSubmitting;
  const otpComplete = otp.every(digit => digit !== '');
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={BrandColors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>VERIFY PHONE NUMBER</Text>
            </View>
          </View>
          
          {/* Main Content */}
          <View style={styles.formContainer}>
            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Enter Verification Code</Text>
              <Text style={styles.instructionsText}>
                We've sent a 4-digit code to {phone}. Please enter it below to verify your phone number.
              </Text>
            </View>
            
            {/* OTP Input */}
            <View style={styles.otpSection}>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref: any) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                    editable={!isLoading}
                  />
                ))}
              </View>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorMessageContainer}>
                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              )}
            </View>
            
            {/* Timer */}
            <View style={styles.timerSection}>
              {!canResend ? (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>Code expires in:</Text>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
              ) : (
                <View style={styles.expiredContainer}>
                  <Text style={styles.expiredText}>Code expired</Text>
                </View>
              )}
            </View>
            
            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!otpComplete || isLoading) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!otpComplete || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={TextColors.inverse} />
                  <Text style={styles.verifyButtonText}>
                    {isVerifying ? 'Verifying...' : 'Submitting...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Submit</Text>
              )}
            </TouchableOpacity>
            
            {/* Resend Button */}
            <View style={styles.resendSection}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || isResending || isLoading}
                style={styles.resendButton}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={BrandColors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.resendButtonText,
                      (!canResend || isLoading) && styles.resendButtonTextDisabled,
                    ]}
                  >
                    Resend Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Back Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: TextColors.gold,
    letterSpacing: 0.8,
  },
  formContainer: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    maxWidth: ContainerWidth.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  instructionsCard: {
    backgroundColor: BackgroundColors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  instructionsTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: Spacing.sm,
  },
  instructionsText: {
    fontSize: moderateScale(14),
    color: TextColors.secondary,
    lineHeight: 22,
  },
  otpSection: {
    marginBottom: Spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.md,
    fontSize: moderateScale(24),
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: BackgroundColors.primary,
    color: TextColors.primary,
    minHeight: moderateScale(50),
  },
  otpInputFilled: {
    borderColor: BrandColors.primary,
    backgroundColor: BackgroundColors.primary,
  },
  otpInputError: {
    borderColor: BrandColors.error,
  },
  errorMessageContainer: {
    backgroundColor: '#FEE',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.error,
  },
  errorMessage: {
    fontSize: moderateScale(13),
    color: BrandColors.error,
    fontWeight: '500',
  },
  timerSection: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timerLabel: {
    fontSize: moderateScale(14),
    color: TextColors.secondary,
  },
  timerText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: BrandColors.primary,
  },
  expiredContainer: {
    paddingVertical: Spacing.sm,
  },
  expiredText: {
    fontSize: moderateScale(14),
    color: BrandColors.error,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadow.small,
    marginBottom: Spacing.md,
  },
  verifyButtonDisabled: {
    backgroundColor: NeutralColors.gray400,
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: moderateScale(16),
    color: TextColors.inverse,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendLabel: {
    fontSize: moderateScale(13),
    color: TextColors.secondary,
    marginBottom: Spacing.sm,
  },
  resendButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: moderateScale(36),
    justifyContent: 'center',
  },
  resendButtonText: {
    fontSize: moderateScale(14),
    color: BrandColors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: NeutralColors.gray500,
    textDecorationLine: 'none',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: NeutralColors.gray400,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: BackgroundColors.primary,
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    color: TextColors.secondary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h4,
    color: BrandColors.error,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body1,
    color: TextColors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    ...Typography.button,
    color: TextColors.inverse,
  },
});

