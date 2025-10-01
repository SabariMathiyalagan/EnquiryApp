import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface FormData {
  child1Name: string;
  child1Age: string;
  child2Name: string;
  child2Age: string;
  parentName: string;
  contactNumber: string;
  email: string;
  consent: boolean;
  todaysDate: string;
}

export default function EnquiryFormScreen() {
  const [formData, setFormData] = useState<FormData>({
    child1Name: '',
    child1Age: '',
    child2Name: '',
    child2Age: '',
    parentName: '',
    contactNumber: '',
    email: '',
    consent: false,
    todaysDate: new Date().toLocaleDateString(),
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.child1Name || !formData.parentName || !formData.contactNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (!formData.consent) {
      Alert.alert('Error', 'Please provide consent to continue');
      return;
    }

    Alert.alert('Success', 'Enquiry submitted successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ENQUIRY FORM</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Today's Date</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{formData.todaysDate}</Text>
              </View>
            </View>
          </View>

          {/* Main Form */}
          <View style={styles.formContainer}>
            {/* Children Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Name of the Child</Text>
              
              <View style={styles.childRow}>
                <Text style={styles.childLabel}>Child 1</Text>
                <View style={styles.childInputContainer}>
                  <TextInput
                    style={styles.childNameInput}
                    value={formData.child1Name}
                    onChangeText={(value) => handleInputChange('child1Name', value)}
                    placeholder="Enter child's name"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.ageContainer}>
                    <Text style={styles.ageLabel}>Age</Text>
                    <TextInput
                      style={styles.ageInput}
                      value={formData.child1Age}
                      onChangeText={(value) => handleInputChange('child1Age', value)}
                      placeholder="Age"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.childRow}>
                <Text style={styles.childLabel}>Child 2</Text>
                <View style={styles.childInputContainer}>
                  <TextInput
                    style={styles.childNameInput}
                    value={formData.child2Name}
                    onChangeText={(value) => handleInputChange('child2Name', value)}
                    placeholder="Enter child's name (optional)"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.ageContainer}>
                    <Text style={styles.ageLabel}>Age</Text>
                    <TextInput
                      style={styles.ageInput}
                      value={formData.child2Age}
                      onChangeText={(value) => handleInputChange('child2Age', value)}
                      placeholder="Age"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Parent Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Name of the Parent</Text>
              <TextInput
                style={styles.fullWidthInput}
                value={formData.parentName}
                onChangeText={(value) => handleInputChange('parentName', value)}
                placeholder="Enter parent's name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <View style={styles.contactRow}>
                <View style={styles.contactField}>
                  <Text style={styles.sectionTitle}>Contact no. (Mobile)</Text>
                  <TextInput
                    style={styles.contactInput}
                    value={formData.contactNumber}
                    onChangeText={(value) => handleInputChange('contactNumber', value)}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.contactField}>
                  <Text style={styles.sectionTitle}>Email ID</Text>
                  <TextInput
                    style={styles.contactInput}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Enter email address"
                    placeholderTextColor="#999"
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
                  I hereby give my consent to UCMAS Bantwani to send me information regarding free trial classes, new batch start dates, and other relevant updates pertaining to the UCMAS, i-Maths and Robotics program. I understand that this information will be communicated through email, text messages, or phone calls.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Program Information */}
            <View style={styles.programSection}>
              <View style={styles.programCard}>
                <View style={styles.programHeader}>
                  <Text style={styles.iMathsTitle}>i-Maths</Text>
                  <Text style={styles.programSubtitle}>Early Math Enrichment Program</Text>
                  <Text style={styles.ageRange}>Age 4-7 yrs</Text>
                </View>
              </View>

              <View style={styles.programCard}>
                <View style={styles.ucmasHeader}>
                  <View style={styles.ucmasLogo}>
                    <Text style={styles.ucmasLogoText}>20</Text>
                    <Text style={styles.ucmasYears}>YEARS OF</Text>
                    <Text style={styles.ucmasEmpowering}>EMPOWERING</Text>
                    <Text style={styles.ucmasMinds}>YOUNG MINDS</Text>
                  </View>
                  <View style={styles.ucmasInfo}>
                    <Text style={styles.ucmasTitle}>UCMAS</Text>
                    <Text style={styles.ucmasSubtitle}>EDUCATION WITH A DIFFERENCE</Text>
                    <Text style={styles.ucmasProgram}>Abacus-based Mental Math Program</Text>
                    <Text style={styles.ageRange}>Age 7-13 yrs</Text>
                  </View>
                </View>
              </View>

              <View style={styles.programCard}>
                <View style={styles.programHeader}>
                  <Text style={styles.codingTitle}>GoZ</Text>
                  <Text style={styles.programSubtitle}>AI Robotics & Coding Program</Text>
                  <Text style={styles.ageRange}>Age 8-18 yrs</Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Enquiry</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  dateBox: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    minWidth: 80,
  },
  dateText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  childRow: {
    marginBottom: 15,
  },
  childLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  childInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  childNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  ageContainer: {
    alignItems: 'center',
  },
  ageLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    width: 50,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 15,
  },
  contactField: {
    flex: 1,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  consentSection: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: '#333',
    lineHeight: 16,
  },
  programSection: {
    marginBottom: 20,
  },
  programCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    alignItems: 'center',
  },
  iMathsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 5,
  },
  ucmasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  ucmasLogo: {
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ucmasLogoText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ucmasYears: {
    color: 'white',
    fontSize: 6,
  },
  ucmasEmpowering: {
    color: 'white',
    fontSize: 6,
  },
  ucmasMinds: {
    color: 'white',
    fontSize: 6,
  },
  ucmasInfo: {
    flex: 1,
  },
  ucmasTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  ucmasSubtitle: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  ucmasProgram: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  codingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginBottom: 5,
  },
  programSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  ageRange: {
    fontSize: 11,
    color: '#333',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
