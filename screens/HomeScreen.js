// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import BottomNavigation from '../components/BottomNavigation';
import FilterModal from '../components/FilterModal';

const HomeScreen = ({ onNavigate, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [userRole, setUserRole] = useState(null);
  
  const [filters, setFilters] = useState({
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

  useEffect(() => {
    loadUserRole();
    const unsubscribe = loadProducts();
    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filters, sortBy]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserRole(userData?.role || 'customer');
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadProducts = () => {
    try {
      let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      }, (error) => {
        console.error('Error loading products:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up products listener:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           product.name?.toLowerCase().includes(searchLower) ||
                           product.brand?.toLowerCase().includes(searchLower) ||
                           product.description?.toLowerCase().includes(searchLower) ||
                           product.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                           product.category?.toLowerCase().includes(searchLower) ||
                           product.color?.toLowerCase().includes(searchLower);
      
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
      
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= filters.priceRange.min && 
                          (filters.priceRange.max === 2000 ? true : productPrice <= filters.priceRange.max);
      
      const matchesSize = filters.sizes.length === 0 || 
                         (product.sizes && product.sizes.some(size => filters.sizes.includes(size)));
      
      const matchesCondition = filters.conditions.length === 0 || filters.conditions.includes(product.condition);
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      
      const matchesColor = filters.colors.length === 0 || 
                          (product.color && filters.colors.some(color => 
                            product.color.toLowerCase().includes(color.toLowerCase())
                          ));
      
      const matchesMaterial = filters.materials.length === 0 || 
                             (product.material && filters.materials.some(material => 
                               product.material.toLowerCase().includes(material.toLowerCase())
                             ));
      
      const matchesGender = filters.genders.length === 0 || filters.genders.includes(product.targetGender);
      const matchesAge = filters.ageGroups.length === 0 || filters.ageGroups.includes(product.ageGroup);
      const matchesSeason = filters.seasons.length === 0 || filters.seasons.includes(product.season);
      const matchesStyle = filters.styles.length === 0 || filters.styles.includes(product.style);
      const matchesRating = filters.rating === 0 || (product.rating || 0) >= filters.rating;
      const matchesFeatured = !filters.featured || product.featured;
      const matchesStock = !filters.inStock || product.inStock !== false;

      return matchesSearch && matchesBrand && matchesPrice && matchesSize && 
             matchesCondition && matchesCategory && matchesColor && matchesMaterial &&
             matchesGender && matchesAge && matchesSeason && matchesStyle &&
             matchesRating && matchesFeatured && matchesStock;
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        break;
      case 'priceHigh':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'priceLow':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
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
    setSearchQuery('');
    setSortBy('newest');
  };

  const getActiveFiltersCount = () => {
    return filters.brands.length + 
           filters.sizes.length + 
           filters.conditions.length +
           filters.categories.length +
           filters.colors.length +
           filters.materials.length +
           filters.genders.length +
           filters.ageGroups.length +
           filters.seasons.length +
           filters.styles.length +
           (filters.rating > 0 ? 1 : 0) +
           (filters.featured ? 1 : 0) +
           (filters.inStock ? 1 : 0) +
           (filters.priceRange.min > 0 || filters.priceRange.max < 2000 ? 1 : 0);
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getUniqueValues = () => {
    if (!products || products.length === 0) {
      return {
        brands: [],
        sizes: [],
        conditions: [],
        categories: [],
        colors: [],
        materials: [],
        genders: [],
        ageGroups: [],
        seasons: [],
        styles: [],
      };
    }

    try {
      return {
        brands: [...new Set(products.map(product => product.brand).filter(Boolean))].sort(),
        sizes: [...new Set(products.flatMap(product => product.sizes || []))].sort(),
        conditions: [...new Set(products.map(product => product.condition).filter(Boolean))].sort(),
        categories: [...new Set(products.map(product => product.category).filter(Boolean))].sort(),
        colors: [...new Set(products.map(product => product.color).filter(Boolean))].sort(),
        materials: [...new Set(products.map(product => product.material).filter(Boolean))].sort(),
        genders: [...new Set(products.map(product => product.targetGender).filter(Boolean))].sort(),
        ageGroups: [...new Set(products.map(product => product.ageGroup).filter(Boolean))].sort(),
        seasons: [...new Set(products.map(product => product.season).filter(Boolean))].sort(),
        styles: [...new Set(products.map(product => product.style).filter(Boolean))].sort(),
      };
    } catch (error) {
      console.error('Error getting unique values:', error);
      return {
        brands: [],
        sizes: [],
        conditions: [],
        categories: [],
        colors: [],
        materials: [],
        genders: [],
        ageGroups: [],
        seasons: [],
        styles: [],
      };
    }
  };

  const uniqueValues = getUniqueValues();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800' }}
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.brandSection}>
                <Ionicons name="diamond" size={28} color="#D1FAE5" />
                <Text style={styles.brandName}>LUXE</Text>
              </View>
              <View>
                <Text style={styles.greeting}>
                  {user ? `Welcome ${userRole === 'admin' ? 'Admin' : 'Fashion Lover'}! ✨` : 'Discover Fashion! ✨'}
                </Text>
                <Text style={styles.welcomeText}>Premium clothing collection</Text>
              </View>
            </View>

            <View style={styles.searchFilterRow}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search clothing, brands, styles..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[styles.filterButton, activeFiltersCount > 0 && styles.activeFilterButton]}
                onPress={() => setShowFilterModal(true)}
              >
                <Ionicons name="options" size={20} color={activeFiltersCount > 0 ? "#FFFFFF" : "#8B5CF6"} />
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
              {[
                { key: 'newest', label: 'New Arrivals', icon: 'flash' },
                { key: 'featured', label: 'Featured', icon: 'star' },
                { key: 'priceLow', label: 'Price ↑', icon: 'trending-up' },
                { key: 'priceHigh', label: 'Price ↓', icon: 'trending-down' },
                { key: 'rating', label: 'Top Rated', icon: 'heart' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[styles.sortChip, sortBy === sort.key && styles.activeSortChip]}
                  onPress={() => setSortBy(sort.key)}
                >
                  <Ionicons 
                    name={sort.icon} 
                    size={14} 
                    color={sortBy === sort.key ? "#FFFFFF" : "#8B5CF6"} 
                  />
                  <Text style={[styles.sortText, sortBy === sort.key && styles.activeSortText]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
          </View>
        </View>
      </ImageBackground>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
        {(activeFiltersCount > 0 || searchQuery.length > 0) && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              currentUserId={user?.uid}
              userRole={userRole}
            />
          ))}
        </View>
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={64} color="#8B5CF6" />
            <Text style={styles.emptyText}>
              {products.length === 0 ? 'No products available' : 'No items match your style'}
            </Text>
            <Text style={styles.emptySubtext}>
              {products.length === 0 
                ? 'Be the first to add a product to our collection!' 
                : 'Try adjusting your filters or search terms'
              }
            </Text>
            {user && (
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => onNavigate('addProduct')}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addProductButtonText}>
                  {products.length === 0 ? 'Add First Product' : 'Add New Product'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        uniqueValues={uniqueValues}
      />

      <BottomNavigation onNavigate={onNavigate} currentScreen="home" user={user} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  headerBackground: {
    paddingBottom: 16,
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D1FAE5',
    marginLeft: 8,
    letterSpacing: 2,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  activeFilterButton: {
    backgroundColor: '#8B5CF6',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sortContainer: {
    marginBottom: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  activeSortChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  sortText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeSortText: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  resultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;