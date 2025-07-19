// components/FilterModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, filters, setFilters, uniqueValues }) => {
  const conditions = ['new', 'like-new', 'good', 'fair', 'vintage'];
  const genders = ['men', 'women', 'unisex', 'kids'];
  const ageGroups = ['adult', 'teen', 'child', 'toddler', 'baby'];
  const seasons = ['all-season', 'summer', 'winter', 'spring', 'fall'];
  const productStyles = ['casual', 'formal', 'business', 'party', 'vintage', 'bohemian', 'minimalist', 'streetwear'];

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      priceRange: { min: 0, max: 2000 },
      sizes: [],
      conditions: [],
      categories: [],
      colors: [],
      materials: [],
      genders: [],
      ageGroups: [],
      seasons: [],
      styles: [],
      rating: 0,
      featured: false,
      inStock: false,
    });
  };

  const FilterSection = ({ title, items, filterKey, type = 'array', icon }) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {icon && <Ionicons name={icon} size={20} color="#8B5CF6" />}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.chipContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                type === 'array' 
                  ? filters[filterKey].includes(item) && styles.selectedChip
                  : filters[filterKey] === item && styles.selectedChip
              ]}
              onPress={() => 
                type === 'array' 
                  ? toggleArrayFilter(filterKey, item)
                  : updateFilter(filterKey, item)
              }
            >
              <Text style={[
                styles.chipText,
                type === 'array'
                  ? filters[filterKey].includes(item) && styles.selectedChipText
                  : filters[filterKey] === item && styles.selectedChipText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="options" size={20} color="#8B5CF6" />
            <Text style={styles.headerTitle}>Style Filters</Text>
          </View>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Price Range</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>
                ${filters.priceRange.min} - ${filters.priceRange.max === 2000 ? '2000+' : filters.priceRange.max}
              </Text>
            </View>
            <View style={styles.priceInputContainer}>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 0 && filters.priceRange.max === 2000 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 0, max: 2000 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 0 && filters.priceRange.max === 2000 && styles.selectedPriceButtonText
                ]}>All Prices</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 0 && filters.priceRange.max === 100 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 0, max: 100 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 0 && filters.priceRange.max === 100 && styles.selectedPriceButtonText
                ]}>Under $100</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 100 && filters.priceRange.max === 300 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 100, max: 300 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 100 && filters.priceRange.max === 300 && styles.selectedPriceButtonText
                ]}>$100 - $300</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 300 && filters.priceRange.max === 500 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 300, max: 500 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 300 && filters.priceRange.max === 500 && styles.selectedPriceButtonText
                ]}>$300 - $500</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 500 && filters.priceRange.max === 2000 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 500, max: 2000 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 500 && filters.priceRange.max === 2000 && styles.selectedPriceButtonText
                ]}>$500+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Brands */}
          <FilterSection 
            title="Brands" 
            items={uniqueValues?.brands || []} 
            filterKey="brands" 
            icon="diamond-outline"
          />

          {/* Categories */}
          <FilterSection 
            title="Categories" 
            items={uniqueValues?.categories || []} 
            filterKey="categories" 
            icon="grid-outline"
          />

          {/* Sizes */}
          {uniqueValues?.sizes && uniqueValues.sizes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="resize-outline" size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Sizes</Text>
              </View>
              <View style={styles.chipContainer}>
                {uniqueValues.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeChip,
                      filters.sizes.includes(size) && styles.selectedChip
                    ]}
                    onPress={() => toggleArrayFilter('sizes', size)}
                  >
                    <Text style={[
                      styles.chipText,
                      filters.sizes.includes(size) && styles.selectedChipText
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Conditions */}
          <FilterSection 
            title="Condition" 
            items={conditions} 
            filterKey="conditions" 
            icon="checkmark-circle-outline"
          />

          {/* Gender */}
          <FilterSection 
            title="Target Gender" 
            items={genders} 
            filterKey="genders" 
            icon="people-outline"
          />

          {/* Age Groups */}
          <FilterSection 
            title="Age Group" 
            items={ageGroups} 
            filterKey="ageGroups" 
            icon="person-outline"
          />

          {/* Seasons */}
          <FilterSection 
            title="Season" 
            items={seasons} 
            filterKey="seasons" 
            icon="sunny-outline"
          />

          {/* Styles */}
          <FilterSection 
            title="Style" 
            items={productStyles} 
            filterKey="styles" 
            icon="brush-outline"
          />

          {/* Colors */}
          {uniqueValues?.colors && uniqueValues.colors.length > 0 && (
            <FilterSection 
              title="Colors" 
              items={uniqueValues.colors} 
              filterKey="colors" 
              icon="color-palette-outline"
            />
          )}

          {/* Materials */}
          {uniqueValues?.materials && uniqueValues.materials.length > 0 && (
            <FilterSection 
              title="Materials" 
              items={uniqueValues.materials} 
              filterKey="materials" 
              icon="layers-outline"
            />
          )}

          {/* Rating */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingChip,
                    filters.rating === rating && styles.selectedChip
                  ]}
                  onPress={() => updateFilter('rating', rating)}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color={filters.rating === rating ? "#FFFFFF" : "#F59E0B"}
                  />
                  <Text style={[
                    styles.chipText,
                    filters.rating === rating && styles.selectedChipText
                  ]}>
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Filters */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Special Filters</Text>
            </View>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.specialChip,
                  filters.featured && styles.selectedSpecialChip
                ]}
                onPress={() => updateFilter('featured', !filters.featured)}
              >
                <Ionicons 
                  name={filters.featured ? "star" : "star-outline"} 
                  size={16} 
                  color={filters.featured ? "#FFFFFF" : "#F59E0B"} 
                />
                <Text style={[
                  styles.specialChipText,
                  filters.featured && styles.selectedSpecialChipText,
                ]}>
                  Featured Only
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.specialChip,
                  filters.inStock && styles.selectedSpecialChip
                ]}
                onPress={() => updateFilter('inStock', !filters.inStock)}
              >
                <Ionicons 
                  name={filters.inStock ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={16} 
                  color={filters.inStock ? "#FFFFFF" : "#10B981"} 
                />
                <Text style={[
                  styles.specialChipText,
                  filters.inStock && styles.selectedSpecialChipText,
                ]}>
                  In Stock Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1A1A1A',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  clearText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D1FAE5',
  },
  priceInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  selectedPriceButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  priceButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  selectedPriceButtonText: {
    color: '#FFFFFF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sizeChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
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
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  specialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  selectedSpecialChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  specialChipText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedSpecialChipText: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1A1A1A',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default FilterModal;