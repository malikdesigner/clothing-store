// screens/AddProductScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AddProductScreen = ({ onNavigate, user }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    imageUrl: '',
    additionalImages: '',
    description: '',
    condition: 'new',
    category: 'tops',
    color: '',
    material: '',
    weight: '',
    manufacturer: '',
    countryOfOrigin: '',
    sku: '',
    tags: '',
    targetGender: 'unisex',
    ageGroup: 'adult',
    season: 'all-season',
    productStyle: 'casual',
    featured: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
  const conditions = ['new', 'like-new', 'good', 'fair', 'vintage'];
  const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'activewear', 'lingerie', 'accessories', 'shoes', 'bags', 'jewelry'];
  const genders = ['men', 'women', 'unisex', 'kids'];
  const ageGroups = ['adult', 'teen', 'child', 'toddler', 'baby'];
  const seasons = ['all-season', 'summer', 'winter', 'spring', 'fall'];
  const productStyles = ['casual', 'formal', 'business', 'party', 'vintage', 'bohemian', 'minimalist', 'streetwear'];

  useEffect(() => {
    loadUserRole();
  }, [user]);

  const loadUserRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserRole(userData?.role || 'customer');
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole('customer');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' }}
          style={styles.background}
          imageStyle={{ opacity: 0.3 }}
        >
          <View style={styles.overlay}>
            <View style={styles.restrictedContainer}>
              <Ionicons name="person-add" size={64} color="#8B5CF6" />
              <Text style={styles.restrictedTitle}>Join LUXE Community</Text>
              <Text style={styles.restrictedSubtitle}>
                Only registered members can add products to our premium collection. Join our exclusive fashion community!
              </Text>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => onNavigate('signup')}
              >
                <Ionicons name="diamond" size={20} color="#FFFFFF" />
                <Text style={styles.signupButtonText}>Join LUXE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => onNavigate('login')}
              >
                <Text style={styles.loginButtonText}>Already a member? Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => onNavigate('home')}
              >
                <Text style={styles.backButtonText}>Back to Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (userRole !== 'customer' && userRole !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.restrictedContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedSubtitle}>
            Only customers can add products to sell in our marketplace. Your current role doesn't allow this action.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <Text style={styles.backButtonText}>Back to Collection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  const handleAddProduct = async () => {
    const { name, brand, price, imageUrl } = formData;
    
    if (!name || !brand || !price || !imageUrl) {
      Alert.alert('Missing Information', 'Please fill in all required fields: Name, Brand, Price, and Image URL');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
      return;
    }

    if (selectedSizes.length === 0) {
      Alert.alert('Missing Sizes', 'Please select at least one available size');
      return;
    }

    setSubmitting(true);
    try {
      const additionalImagesArray = formData.additionalImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await addDoc(collection(db, 'products'), {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price: parseFloat(price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(price),
        
        image: imageUrl.trim(),
        additionalImages: additionalImagesArray,
        
        description: formData.description.trim(),
        condition: formData.condition,
        category: formData.category,
        color: formData.color.trim(),
        material: formData.material.trim(),
        weight: formData.weight.trim(),
        
        manufacturer: formData.manufacturer.trim(),
        countryOfOrigin: formData.countryOfOrigin.trim(),
        sku: formData.sku.trim(),
        
        targetGender: formData.targetGender,
        ageGroup: formData.ageGroup,
        season: formData.season,
        style: formData.productStyle,
        
        sizes: selectedSizes,
        featured: userRole === 'admin' ? formData.featured : false,
        tags: tagsArray,
        
        rating: 0,
        ratingCount: 0,
        views: 0,
        likes: 0,
        
        sellerId: user.uid,
        sellerEmail: user.email,
        sellerRole: userRole,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        
        isActive: true,
        inStock: true,
      });

      Alert.alert(
        'Success! ✨', 
        'Your product has been added to the LUXE collection!',
        [
          { text: 'Add Another', onPress: () => {
            setFormData({
              name: '',
              brand: '',
              price: '',
              originalPrice: '',
              imageUrl: '',
              additionalImages: '',
              description: '',
              condition: 'new',
              category: 'tops',
              color: '',
              material: '',
              weight: '',
              manufacturer: '',
              countryOfOrigin: '',
              sku: '',
              tags: '',
              targetGender: 'unisex',
              ageGroup: 'adult',
              season: 'all-season',
              productStyle: 'casual',
              featured: false,
            });
            setSelectedSizes([]);
          }},
          { text: 'View Collection', onPress: () => onNavigate('home') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to add product: ${error.message}`);
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backIconButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Add to Collection</Text>
          {userRole === 'admin' && (
            <Text style={styles.adminBadge}>Admin Mode</Text>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.sellerBanner}>
            <View style={styles.sellerInfo}>
              <Ionicons name="diamond" size={24} color="#8B5CF6" />
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>Selling as: {user.email}</Text>
                <Text style={styles.sellerRole}>{userRole === 'admin' ? 'Administrator' : 'Fashion Member'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>✨ Product Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vintage Denim Jacket, Silk Evening Dress"
              placeholderTextColor="#6B7280"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Gucci, Zara, H&M, Custom"
              placeholderTextColor="#6B7280"
              value={formData.brand}
              onChangeText={(value) => updateFormData('brand', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="89"
                placeholderTextColor="#6B7280"
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Original Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                placeholderTextColor="#6B7280"
                value={formData.originalPrice}
                onChangeText={(value) => updateFormData('originalPrice', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Black, White, Red"
                placeholderTextColor="#6B7280"
                value={formData.color}
                onChangeText={(value) => updateFormData('color', value)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Material</Text>
              <TextInput
                style={styles.input}
                placeholder="Cotton, Silk, Polyester"
                placeholderTextColor="#6B7280"
                value={formData.material}
                onChangeText={(value) => updateFormData('material', value)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Sizes * ({selectedSizes.length} selected)</Text>
            <View style={styles.sizeGrid}>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeChip,
                    selectedSizes.includes(size) && styles.selectedSizeChip
                  ]}
                  onPress={() => toggleSize(size)}
                >
                  <Text style={[
                    styles.sizeChipText,
                    selectedSizes.includes(size) && styles.selectedSizeChipText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>🏷️ Category & Style</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      formData.category === category && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('category', category)}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.category === category && styles.selectedChipText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {conditions.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.chip,
                      formData.condition === condition && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('condition', condition)}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.condition === condition && styles.selectedChipText
                    ]}>
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {userRole === 'admin' && (
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.toggleContainer, formData.featured && styles.toggleActive]}
                onPress={() => updateFormData('featured', !formData.featured)}
              >
                <Ionicons 
                  name={formData.featured ? "star" : "star-outline"} 
                  size={24} 
                  color={formData.featured ? "#F59E0B" : "#6B7280"} 
                />
                <Text style={[styles.toggleText, formData.featured && styles.toggleActiveText]}>
                  Featured Product (Admin Only)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>📸 Images & Description</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Main Image URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/product-image.jpg"
              placeholderTextColor="#6B7280"
              value={formData.imageUrl}
              onChangeText={(value) => updateFormData('imageUrl', value)}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              💡 Use high-quality fashion photos for better sales
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the style, fit, fabric quality, styling tips, and any special details..."
              placeholderTextColor="#6B7280"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, submitting && styles.disabledButton]}
            onPress={handleAddProduct}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Adding to Collection...</Text>
              </>
            ) : (
              <>
                <Ionicons name="diamond" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add to LUXE Collection</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
            <Text style={styles.disclaimerText}>
              By adding this product, you agree to our seller terms. 
              Ensure all information is accurate and images represent the actual item.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  restrictedSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1A1A1A',
  },
  backIconButton: {
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  adminBadge: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  sellerBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sellerRole: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1FAE5',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  selectedChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sizeChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    margin: 4,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  selectedSizeChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  sizeChipText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  selectedSizeChipText: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  toggleActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  toggleText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
    fontWeight: '500',
  },
  toggleActiveText: {
    color: '#F59E0B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
});

export default AddProductScreen;