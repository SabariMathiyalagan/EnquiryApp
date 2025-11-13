import React, { useState } from 'react';
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
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { 
  BrandColors, 
  CourseColors, 
  NeutralColors, 
  TextColors,   
  BackgroundColors,
  Shadow,
  Spacing,
  BorderRadius,
  Typography,
  DeviceType,
  ContainerWidth,
  moderateScale
} from '@/constants/theme';
import { requestOtp } from '@/app/api/api';



// Logo imports using require for better compatibility
const iMathsLogo = require('@/assets/images/imaths-logo.png');
const ucmasLogo = require('@/assets/images/ucmas-logo.png');
const obotzLogo = require('@/assets/images/obotz-logo.png');



interface Child {
  id: string;
  name: string;
  age: string;
  selectedCourse: 'imaths' | 'ucmas' | 'obotz' | '';
}

interface FormData {
  children: Child[];
  parentName: string;
  contactNumber: string;
  email: string;
  consent: boolean;
  todaysDate: string;
}

export default function EnquiryFormScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    children: [{ id: '1', name: '', age: '', selectedCourse: '' }],
    parentName: '',
    contactNumber: '',
    email: '',
    consent: false,
    todaysDate: new Date().toLocaleDateString(),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState<string>('');
  const [prevPhoneLength, setPrevPhoneLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addChild = () => {
    if (formData.children.length < 5) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: '',
        age: '',
        selectedCourse: '',
      };
      setFormData(prev => ({
        ...prev,
        children: [...prev.children, newChild],
      }));
    }
  };

  const removeChild = (childId: string) => {
    if (formData.children.length > 1) {
      setFormData(prev => ({
        ...prev,
        children: prev.children.filter(child => child.id !== childId),
      }));
    }
  };

  const updateChild = (childId: string, field: keyof Child, value: string) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.id === childId ? { ...child, [field]: value } : child
      ),
    }));
  };

  const formatPhoneNumber = (value: string, isDeleting: boolean): string => {

    if (isDeleting && value.length === 3) {
        return `${value.slice(0, 2)}`;
    } else if (isDeleting && value.length === 7) {
      return `${value.slice(0, 6)}`;
    } else if(value.length === 3 || value.length === 7) {
      return `${value}-`;
    } 
    return value
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    // Auto-format phone number
    if (field === 'contactNumber' && typeof value === 'string') {

      const isDeleting = value.length < prevPhoneLength;
      value = formatPhoneNumber(value, isDeleting);
      setPrevPhoneLength(value.length);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Enhanced validation
    const hasValidChild = formData.children.some(child => child.name.trim() && child.age.trim() && child.selectedCourse);
    
    if (!hasValidChild) {
      Alert.alert('Validation Error', 'Please add at least one child with name, age, and course selection');
      return;
    }
    
    if (!formData.parentName.trim()) {
      Alert.alert('Validation Error', 'Please enter parent name');
      return;
    }
    
    if (!formData.contactNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter contact number');
      return;
    }
    
    // Validate phone number format (XXX-XXX-XXXX)
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(formData.contactNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number in format XXX-XXX-XXXX');
      return;
    }
    
    if (!formData.consent) {
      Alert.alert('Validation Error', 'Please provide consent to continue');
      return;
    }

    // Request OTP
    setIsSubmitting(true);
    
    try {
      const response = await requestOtp(formData.contactNumber);
      
      // Navigate to verify page with requestId and formData
      router.push({
        pathname: './verify' as any,
        params: {
          requestId: response.requestId,
          phone: formData.contactNumber,
          formData: JSON.stringify(formData),
        },
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCourseColor = (course: string) => {
    switch (course) {
      case 'imaths': return CourseColors.imaths;
      case 'ucmas': return CourseColors.ucmas;
      case 'obotz': return CourseColors.obotz;
      default: return NeutralColors.gray400;
    }
  };

  const getCourseName = (course: string) => {
    switch (course) {
      case 'imaths': return 'i-Maths';
      case 'ucmas': return 'UCMAS';
      case 'obotz': return 'OBOTZ';
      default: return 'Select Course';
    }
  };

  const getCourseLogo = (course: string) => {
    switch (course) {
      case 'imaths': return iMathsLogo;
      case 'ucmas': return ucmasLogo;
      case 'obotz': return obotzLogo;
      default: return null;
    }
  };

  const getCourseInfo = (course: string) => {
    switch (course) {
      case 'imaths': 
        return 'i-Maths is an Early Math Enrichment Program designed for children aged 4-7 years. It focuses on building strong mathematical foundations through interactive and engaging activities that make learning math fun and effective.';
      case 'ucmas': 
        return 'UCMAS (Universal Concept of Mental Arithmetic System) is an abacus-based mental math program for children aged 7-13 years. It enhances concentration, memory, and calculation skills through systematic training with the abacus.';
      case 'obotz': 
        return 'OBOTZ is an AI Robotics & Coding Program designed for children aged 8-18 years. It introduces students to programming, robotics, and artificial intelligence through hands-on projects and interactive learning experiences.';
      default: return '';
    }
  };

  const showCourseInfo = (course: string) => {
    setSelectedCourseInfo(getCourseInfo(course));
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={BrandColors.primary} />
    {/*  <CurvedBackground /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>ENQUIRY FORM</Text>
            </View>
            {/* Date Container 
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Today's Date</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{formData.todaysDate}</Text>
              </View>
           
            </View>*/ }
          </View>

          {/* Main Form */}
          <View style={styles.formContainer}>
            {/* Children Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Children Information</Text>
                <Text style={styles.sectionSubtitle}>Add up to 5 children</Text>
              </View>
              
              {formData.children.map((child, index) => (
                <View key={child.id} style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <Text style={styles.childNumber}>Child {index + 1}</Text>
                    {formData.children.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeChild(child.id)}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.childInputRow}>
                    <View style={styles.nameInputContainer}>
                      <Text style={styles.inputLabel}>Name <Text style={styles.requiredAsterisk}>*</Text></Text>
                      <TextInput
                        style={styles.childNameInput}
                        value={child.name}
                        onChangeText={(value) => updateChild(child.id, 'name', value)}
                        placeholder="Enter child's name"
                        placeholderTextColor={NeutralColors.gray500}
                      />
                    </View>
                    <View style={styles.ageInputContainer}>
                      <Text style={styles.inputLabel}>Age <Text style={styles.requiredAsterisk}>*</Text></Text>
                      <TextInput
                        style={styles.ageInput}
                        value={child.age}
                        onChangeText={(value) => updateChild(child.id, 'age', value)}
                        placeholder="Age"
                        placeholderTextColor={NeutralColors.gray500}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </View>

                  {/* Course Selection */}
                  <View style={styles.courseSection}>
                    <View style={styles.courseSectionHeader}>
                      <Text style={styles.inputLabel}>Select Course <Text style={styles.requiredAsterisk}>*</Text></Text>
                    </View>
                    <View style={styles.courseOptions}>
                      {['imaths', 'ucmas', 'obotz'].map((course) => (
                        <View key={course} style={styles.courseOptionContainer}>
                          <TouchableOpacity
                            style={[
                              styles.courseOption,
                              child.selectedCourse === course && {
                                backgroundColor: getCourseColor(course),
                                borderColor: getCourseColor(course),
                              }
                            ]}
                            onPress={() => updateChild(child.id, 'selectedCourse', course)}
                          >
                            <Image source={getCourseLogo(course)} style={styles.courseLogoSmall} />
                            <Text style={[
                              styles.courseOptionText,
                              child.selectedCourse === course && styles.courseOptionTextSelected
                            ]}>
                              {getCourseName(course)}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.infoButton}
                            onPress={() => showCourseInfo(course)}
                          >
                            <Text style={styles.infoButtonText}>i</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}

              {/* Add Child Button */}
              {formData.children.length < 5 && (
                <TouchableOpacity style={styles.addChildButton} onPress={addChild}>
                  <Text style={styles.addChildButtonText}>+ Add Another Child</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Parent Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parent Information</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Parent Name <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  style={styles.fullWidthInput}
                  value={formData.parentName}
                  onChangeText={(value) => handleInputChange('parentName', value)}
                  placeholder="Enter parent's full name"
                  placeholderTextColor={NeutralColors.gray500}
                />
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactRow}>
                <View style={styles.contactField}>
                  <Text style={styles.inputLabel}>Mobile Number <Text style={styles.requiredAsterisk}>*</Text></Text>
                  <TextInput
                    style={styles.contactInput}
                    value={formData.contactNumber}
                    onChangeText={(value) => handleInputChange('contactNumber', value)}
                    placeholder="XXX-XXX-XXXX"
                    placeholderTextColor={NeutralColors.gray500}
                    keyboardType="number-pad"
                    maxLength={12}
                  />
                </View>
                <View style={styles.contactField}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.contactInput}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Enter email address"
                    placeholderTextColor={NeutralColors.gray500}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Consent */}
            <View style={styles.consentSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleInputChange('consent', !formData.consent)}
              >
                <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
                  {formData.consent && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>
                  I hereby give my consent to UCMAS Bantwani to send me information regarding free trial classes, new batch start dates, and other relevant updates pertaining to the UCMAS, i-Maths and OBOTZ programs. I understand that this information will be communicated through email, text messages, or phone calls.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitLoadingContainer}>
                  <ActivityIndicator color={TextColors.inverse} />
                  <Text style={styles.submitButtonText}>Sending Code...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit Enquiry</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Course Information Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Course Information</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{selectedCourseInfo}</Text>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeutralColors.cream,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  curvedSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(16), // Reduced from 20
    fontWeight: 'bold',
    color: TextColors.gold,
    letterSpacing: 0.8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateLabel: {
    ...Typography.caption,
    color: TextColors.inverse,
    marginBottom: Spacing.sm,
  },
  dateBox: {
    backgroundColor: BackgroundColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 80,
    ...Shadow.small,
  },
  dateText: {
    ...Typography.caption,
    color: TextColors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    maxWidth: ContainerWidth.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: moderateScale(16), // Reduced from h5
    color: TextColors.primary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: moderateScale(12), // Reduced from body2
    color: TextColors.secondary,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: moderateScale(13), // Reduced from body2
    color: TextColors.primary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: BrandColors.error,
    fontWeight: 'bold',
  },
  childCard: {
    backgroundColor: BackgroundColors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  childNumber: {
    fontSize: moderateScale(14), // Reduced from h6
    color: BrandColors.primary,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: BrandColors.error,
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: moderateScale(36),
    minHeight: moderateScale(36),
  },
  removeButtonText: {
    color: TextColors.inverse,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  childInputRow: {
    flexDirection: DeviceType.isSmallPhone ? 'column' : 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  nameInputContainer: {
    flex: 1,
  },
  ageInputContainer: {
    width: DeviceType.isSmallPhone ? '100%' : moderateScale(70),
    minWidth: moderateScale(60),
  },
  childNameInput: {
    borderWidth: 1,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: moderateScale(14),
    backgroundColor: BackgroundColors.primary,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: moderateScale(14),
    textAlign: 'center',
    backgroundColor: BackgroundColors.primary,
  },
  courseSection: {
    marginTop: Spacing.sm,
  },
  courseSectionHeader: {
    marginBottom: Spacing.sm,
  },
  courseOptions: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  courseOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: moderateScale(45),
  },
  courseOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: BackgroundColors.primary,
    gap: Spacing.sm,
    minHeight: moderateScale(40),
  },
  courseLogoSmall: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
  },
  courseOptionText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: TextColors.primary,
  },
  courseOptionTextSelected: {
    color: TextColors.inverse,
  },
  infoButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: BrandColors.info,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: moderateScale(36),
    minHeight: moderateScale(36),
  },
  infoButtonText: {
    color: TextColors.inverse,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  addChildButton: {
    borderWidth: 1,
    borderColor: BrandColors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: BackgroundColors.primary,
  },
  addChildButtonText: {
    fontSize: moderateScale(14),
    color: BrandColors.primary,
    fontWeight: '600',
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: moderateScale(14),
    backgroundColor: BackgroundColors.primary,
  },
  contactRow: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  contactField: {
    width: '100%',
  },
  contactInput: {
    borderWidth: 1,
    borderColor: NeutralColors.gray300,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: moderateScale(14),
    backgroundColor: BackgroundColors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: BackgroundColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: BackgroundColors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: DeviceType.isTablet ? '80%' : '95%',
    maxWidth: DeviceType.isTablet ? 500 : 400,
    ...Shadow.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h6,
    color: TextColors.primary,
  },
  modalCloseButton: {
    width: moderateScale(33), // 30 * 1.1 = 33, moderate responsive
    height: moderateScale(33), // 30 * 1.1 = 33, moderate responsive
    borderRadius: moderateScale(17), // 15 * 1.1 ≈ 17, moderate responsive
    backgroundColor: NeutralColors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: moderateScale(44), // Minimum touch target
    minHeight: moderateScale(44), // Minimum touch target
  },
  modalCloseText: {
    fontSize: moderateScale(20), // 18 * 1.1 ≈ 20, moderate responsive
    fontWeight: 'bold',
    color: TextColors.primary,
  },
  modalText: {
    ...Typography.body1,
    color: TextColors.primary,
    lineHeight: 26, // Updated to match new Typography.body1 lineHeight
    marginBottom: Spacing.lg,
  },
  modalButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...Typography.button,
    color: TextColors.inverse,
  },
  consentSection: {
    backgroundColor: BackgroundColors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderWidth: 1,
    borderColor: BrandColors.primary,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BackgroundColors.primary,
    marginTop: 2,
    minWidth: moderateScale(36),
    minHeight: moderateScale(36),
  },
  checkboxChecked: {
    backgroundColor: BrandColors.primary,
  },
  checkmark: {
    color: TextColors.inverse,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: TextColors.primary,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadow.small,
  },
  submitButtonDisabled: {
    backgroundColor: NeutralColors.gray400,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    color: TextColors.inverse,
    fontWeight: '600',
  },
  submitLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
