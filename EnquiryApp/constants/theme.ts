/**
 * Professional design system for UCMAS Enquiry App
 */

import { Platform, Dimensions } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection
const Breakpoints = {
  small: 320,   // Small phones
  medium: 375,  // Standard phones
  large: 414,   // Large phones
  tablet: 768,  // Tablets
  desktop: 1024 // Large tablets/desktop
};

export const DeviceType = {
  isSmallPhone: screenWidth < Breakpoints.medium,
  isMediumPhone: screenWidth >= Breakpoints.medium && screenWidth < Breakpoints.large,
  isLargePhone: screenWidth >= Breakpoints.large && screenWidth < Breakpoints.tablet,
  isTablet: screenWidth >= Breakpoints.tablet,
  isLandscape: screenWidth > screenHeight,
};

// Responsive scaling function
const scale = (size: number): number => {
  const baseWidth = 375; // iPhone X width as base
  return Math.round((screenWidth / baseWidth) * size);
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Brand Colors - Matching Original Form
export const BrandColors = {
  primary: '#2E7D32',      // UCMAS Green (from original form header)
  secondary: '#43A047',    // Lighter green
  accent: '#FFD700',       // Gold accent (from original form)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Course Colors - Matching Original Form
export const CourseColors = {
  imaths: '#9C27B0',       // Pink for i-Maths (from original)
  ucmas: '#2E7D32',        // Green for UCMAS (from original)
  obotz: '#ff7400',        // Purple for OBOTZ (from original)
};

// Neutral Colors - Matching Original Form
export const NeutralColors = {
  white: '#FFFFFF',
  cream: '#F5F2E8',        // Cream background from original form
  beige: '#E8E2D5',        // Beige tone from original
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#D0D0D0',      // Slightly darker for better contrast
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',
};

// Text Colors - Matching Original Form
export const TextColors = {
  primary: '#2E2E2E',      // Darker text for better readability
  secondary: '#666666',
  disabled: '#BDBDBD',
  hint: '#999999',
  inverse: '#FFFFFF',
  gold: '#FFD700',         // Gold text from original
};

// Background Colors - Matching Original Form
export const BackgroundColors = {
  primary: '#FFFFFF',
  secondary: '#F5F2E8',    // Cream background from original
  surface: '#FFFFFF',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Shadow
export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Responsive Spacing - Moderate scaling (halfway between original and 1.2x)
export const Spacing = {
  xs: moderateScale(4.5),    // 4 * 1.1 = 4.4 ≈ 4.5, moderate responsive
  sm: moderateScale(9),      // 8 * 1.1 = 8.8 ≈ 9, moderate responsive
  md: moderateScale(17),     // 16 * 1.1 = 17.6 ≈ 17, moderate responsive
  lg: moderateScale(26),     // 24 * 1.1 = 26.4 ≈ 26, moderate responsive
  xl: moderateScale(35),     // 32 * 1.1 = 35.2 ≈ 35, moderate responsive
  xxl: moderateScale(53),    // 48 * 1.1 = 52.8 ≈ 53, moderate responsive
};

// Container widths for different screen sizes
export const ContainerWidth = {
  small: '95%',
  medium: '90%',
  large: '85%',
  tablet: '80%',
  maxWidth: DeviceType.isTablet ? 600 : screenWidth * 0.95,
};

// Border Radius - Scaled up by 1.2x
export const BorderRadius = {
  sm: 5,    // 4 * 1.2 = 4.8 ≈ 5
  md: 10,   // 8 * 1.2 = 9.6 ≈ 10
  lg: 14,   // 12 * 1.2 = 14.4 ≈ 14
  xl: 19,   // 16 * 1.2 = 19.2 ≈ 19
  full: 9999,
};

// Responsive Typography - Moderate scaling (1.1x instead of 1.2x)
export const Typography = {
  h1: {
    fontSize: moderateScale(35),  // 32 * 1.1 = 35.2 ≈ 35, moderate responsive
    fontWeight: '700' as const,
    lineHeight: moderateScale(44), // 40 * 1.1 = 44, moderate responsive
  },
  h2: {
    fontSize: moderateScale(31),  // 28 * 1.1 = 30.8 ≈ 31, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(40), // 36 * 1.1 = 39.6 ≈ 40, moderate responsive
  },
  h3: {
    fontSize: moderateScale(26),  // 24 * 1.1 = 26.4 ≈ 26, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(35), // 32 * 1.1 = 35.2 ≈ 35, moderate responsive
  },
  h4: {
    fontSize: moderateScale(22),  // 20 * 1.1 = 22, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(31), // 28 * 1.1 = 30.8 ≈ 31, moderate responsive
  },
  h5: {
    fontSize: moderateScale(20),  // 18 * 1.1 = 19.8 ≈ 20, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(26), // 24 * 1.1 = 26.4 ≈ 26, moderate responsive
  },
  h6: {
    fontSize: moderateScale(18),  // 16 * 1.1 = 17.6 ≈ 18, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(24), // 22 * 1.1 = 24.2 ≈ 24, moderate responsive
  },
  body1: {
    fontSize: moderateScale(18),  // 16 * 1.1 = 17.6 ≈ 18, moderate responsive
    fontWeight: '400' as const,
    lineHeight: moderateScale(26), // 24 * 1.1 = 26.4 ≈ 26, moderate responsive
  },
  body2: {
    fontSize: moderateScale(15),  // 14 * 1.1 = 15.4 ≈ 15, moderate responsive
    fontWeight: '400' as const,
    lineHeight: moderateScale(22), // 20 * 1.1 = 22, moderate responsive
  },
  caption: {
    fontSize: moderateScale(13),  // 12 * 1.1 = 13.2 ≈ 13, moderate responsive
    fontWeight: '400' as const,
    lineHeight: moderateScale(18), // 16 * 1.1 = 17.6 ≈ 18, moderate responsive
  },
  button: {
    fontSize: moderateScale(18),  // 16 * 1.1 = 17.6 ≈ 18, moderate responsive
    fontWeight: '600' as const,
    lineHeight: moderateScale(22), // 20 * 1.1 = 22, moderate responsive
  },
};

