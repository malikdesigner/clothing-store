// screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ScrollView,
  Modal,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const SignupScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleOptions = [
    { value: 'customer', label: 'Fashion Enthusiast', icon: 'diamond-outline', description: 'Shop & sell fashion items' },
    { value: 'admin', label: 'Brand Administrator', icon: 'shield-checkmark-outline', description: 'Manage the LUXE platform' },
  ];

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRoleSelect = (role) => {
    updateFormData('role', role);
    setShowRoleDropdown(false);
  };

  const handleSignup = async () => {
    const { name, email, password, phone, role } = formData;
    
    if (!name || !email || !password || !phone || !role) {
      Alert.alert('Missing Information', 'Please fill in all required fields to join LUXE');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters for security');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email,
        phone: phone,
        address: formData.address || '',
        role: formData.role,
        createdAt: new Date(),
        wishlist: [],
        cart: [],
        isActive: true,
        memberSince: new Date(),
        totalPurchases: 0,
        loyaltyPoints: 0,
      });

      Alert.alert('Welcome to LUXE! ✨', `Your ${formData.role} account has been created successfully!`);
      onNavigate('home');
    } catch (error) {
        console.log(error)
      let errorMessage = 'Account creation failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already part of the LUXE community';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password';
      }
      Alert.alert('Signup Error', errorMessage);
    }
    setLoading(false);
  };

  const selectedRole = roleOptions.find(option => option.value === formData.role) || { icon: "chevron-down-outline", label: "Choose Your Role *" };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' }}
        style={styles.background}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.authContainer}>
              <View style={styles.header}>
                <View style={styles.brandContainer}>
                  <Ionicons name="diamond" size={50} color="#D1FAE5" />
                  <Text style={styles.title}>LUXE</Text>
                  <Text style={styles.subtitle}>Join the Fashion Elite</Text>
                </View>
              </View>

              <View style={styles.form}>
                <Text style={styles.formTitle}>Create Your Account</Text>
                
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowRoleDropdown(true)}
                  >
                    <Ionicons 
                      name={formData.role ? selectedRole.icon : "chevron-down-outline"} 
                      size={20} 
                      color="#8B5CF6" 
                      style={styles.inputIcon} 
                    />
                    <Text style={[
                      styles.dropdownText,
                      !formData.role && styles.placeholderText
                    ]}>
                      {formData.role ? selectedRole.label : "Choose Your Role *"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name *"
                    placeholderTextColor="#6B7280"
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address *"
                    placeholderTextColor="#6B7280"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number *"
                    placeholderTextColor="#6B7280"
                    value={formData.phone}
                    onChangeText={(value) => updateFormData('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Shipping Address (Optional)"
                    placeholderTextColor="#6B7280"
                    value={formData.address}
                    onChangeText={(value) => updateFormData('address', value)}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create Password (min 6 characters) *"
                    placeholderTextColor="#6B7280"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.primaryButton, loading && styles.disabledButton]} 
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <Ionicons name="diamond" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Creating Account...' : (formData.role ? `Join as ${selectedRole.label}` : 'Join LUXE Community')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => onNavigate('login')}
                >
                  <Text style={styles.linkText}>Already a member? Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => onNavigate('home')}
                >
                  <Text style={styles.guestText}>Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <Modal
            visible={showRoleDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowRoleDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowRoleDropdown(false)}
            >
              <View style={styles.dropdownModal}>
                <Text style={styles.dropdownTitle}>Choose Your Role</Text>
                {roleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      formData.role === option.value && styles.selectedOption
                    ]}
                    onPress={() => handleRoleSelect(option.value)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={formData.role === option.value ? "#8B5CF6" : "#6B7280"} 
                    />
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.dropdownOptionText,
                        formData.role === option.value && styles.selectedOptionText
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                    {formData.role === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#D1FAE5',
    marginTop: 12,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    width: '100%',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#6B7280',
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#FFFFFF',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#D1FAE5',
    fontSize: 16,
    fontWeight: '500',
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  guestText: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '85%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  selectedOption: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#D1FAE5',
  },
  optionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default SignupScreen;
