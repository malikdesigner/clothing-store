// screens/EditProductScreen.js
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const EditProductScreen = ({ onNavigate, user, product }) => {
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
  const [loading, setLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
  const conditions = ['new', 'like-new', 'good', 'fair', 'vintage'];
  const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'activewear', 'lingerie', 'accessories', 'shoes', 'bags', 'jewelry'];
  const genders = ['men', 'women', 'unisex', 'kids'];
  const ageGroups = ['adult', 'teen', 'child', 'toddler', 'baby'];
  const seasons = ['all-season', 'summer', 'winter', 'spring', 'fall'];
  const productStyles = ['casual', 'formal', 'business', 'party', 'vintage', 'bohemian', 'minimalist', 'streetwear'];

  useEffect(() => {
    if (product) {
      const additionalImagesString = product.additionalImages ? product.additionalImages.join(', ') : '';
      const tagsString = product.tags ? product.tags.join(', ') : '';

      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        imageUrl: product.image || '',
        additionalImages: additionalImagesString,
        description: product.description || '',
        condition: product.condition || 'new',
        category: product.category || 'tops',
        color: product.color || '',
        material: product.material || '',
        weight: product.weight || '',
        manufacturer: product.manufacturer || '',
        countryOfOrigin: product.countryOfOrigin || '',
        sku: product.sku || '',
        tags: tagsString,
        targetGender: product.targetGender || 'unisex',
        ageGroup: product.ageGroup || 'adult',
        season: product.season || 'all-season',
        productStyle: product.style || 'casual',
        featured: product.featured || false,
      });
      setSelectedSizes(product.sizes || []);
    }
  }, [product]);

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

  const handleUpdateProduct = async () => {
    const { name, brand, price, imageUrl } = formData;
    
    if (!name || !brand || !price || !imageUrl) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    if (selectedSizes.length === 0) {
      Alert.alert('Missing Sizes', 'Please select at least one size');
      return;
    }

    setLoading(true);
    try {
      const additionalImagesArray = formData.additionalImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await updateDoc(doc(db, 'products', product.id), {
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
        featured: formData.featured,
        tags: tagsArray,
        
        updatedAt: new Date(),
      });

      Alert.alert('Success! ✨', 'Product updated successfully in the LUXE collection!');
      onNavigate('home');
    } catch (error) {
      Alert.alert('Update Error', error.message);
    }
    setLoading(false);
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Product not found</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' }}
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backIconButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="create" size={24} color="#8B5CF6" />
              <Text style={styles.headerTitle}>Edit Product</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>✨ Product Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vintage Denim Jacket"
              placeholderTextColor="#6B7280"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Gucci, Zara, H&M"
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

          <Text style={styles.sectionTitle}>🏷️ Classification</Text>

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
            <Text style={styles.label}>Target Gender *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {genders.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.chip,
                      formData.targetGender === gender && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('targetGender', gender)}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.targetGender === gender && styles.selectedChipText
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Style *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {productStyles.map((styleOption) => (
                  <TouchableOpacity
                    key={styleOption}
                    style={[
                      styles.chip,
                      formData.productStyle === styleOption && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('productStyle', styleOption)}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.productStyle === styleOption && styles.selectedChipText
                    ]}>
                      {styleOption}
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
                Featured Product
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>📸 Media & Description</Text>

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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the style, fit, fabric quality, styling tips..."
              placeholderTextColor="#6B7280"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdateProduct}
            disabled={loading}
          >
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating Product...' : 'Update LUXE Product'}
            </Text>
          </TouchableOpacity>
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
  headerBackground: {
    paddingBottom: 16,
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
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
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 24,
    marginTop: 16,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProductScreen;