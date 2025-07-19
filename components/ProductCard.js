// components/ProductCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProductCard = ({ product, onNavigate, currentUserId, userRole }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const canEditDelete = () => {
    if (!currentUserId) return false;
    if (userRole === 'admin') return true;
    return currentUserId === product.sellerId;
  };

  const handleDelete = () => {
    if (!canEditDelete()) {
      Alert.alert('Permission Denied', 'You can only delete your own products');
      return;
    }

    Alert.alert(
      'Delete Product',
      'Are you sure you want to remove this item from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', product.id));
              Alert.alert('Success', 'Product removed successfully!');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!canEditDelete()) {
      Alert.alert('Permission Denied', 'You can only edit your own products');
      return;
    }
    onNavigate('editProduct', product);
  };

  const toggleWishlist = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'Please login to save to wishlist');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUserId);
      if (isLiked) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(product.id)
        });
        setIsLiked(false);
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(product.id)
        });
        setIsLiked(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const addToCart = async (size) => {
    setIsAddingToCart(true);
    try {
      if (currentUserId) {
        const userRef = doc(db, 'users', currentUserId);
        await updateDoc(userRef, {
          cart: arrayUnion({
            productId: product.id,
            size: size,
            quantity: 1,
            addedAt: new Date()
          })
        });
        Alert.alert('Added to Cart! 🛍️', 'Item has been added to your cart');
      } else {
        Alert.alert('Added to Cart! 🛍️', 
          `${product.brand} ${product.name} (Size ${size}) has been added to your guest cart.\n\nNote: Guest cart items are temporary. Login to save items permanently.`, [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => onNavigate('cart') },
          { text: 'Checkout Now', onPress: () => onNavigate('checkout') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
    setIsAddingToCart(false);
  };

  const showSizeSelector = () => {
    if (!product.sizes || product.sizes.length === 0) {
      Alert.alert('Error', 'No sizes available');
      return;
    }

    const sizeOptions = product.sizes.map(size => ({
      text: `Size ${size}`,
      onPress: () => addToCart(size)
    }));

    Alert.alert(
      'Select Size',
      'Choose your perfect fit:',
      [
        ...sizeOptions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();

  return (
    <View style={styles.productCard}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        {/* Overlay Gradient */}
        <View style={styles.imageOverlay} />
        
        {/* Wishlist Button */}
        {currentUserId && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={toggleWishlist}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color={isLiked ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>
        )}

        {/* Top Badges */}
        <View style={styles.topBadges}>
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Bottom Badge */}
        <View style={styles.bottomBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <Text style={styles.productBrand}>{product.brand}</Text>
            {product.condition && (
              <View style={[styles.conditionDot, getConditionBadgeStyle(product.condition)]} />
            )}
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.rating}>{product.rating || 0}</Text>
          </View>
        </View>

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

        {/* Product Details */}
        <View style={styles.detailsRow}>
          {product.color && (
            <View style={styles.colorContainer}>
              <View style={[styles.colorDot, { backgroundColor: getColorCode(product.color) }]} />
              <Text style={styles.colorText}>{product.color}</Text>
            </View>
          )}
          <View style={styles.stockContainer}>
            <View style={[styles.stockDot, { backgroundColor: product.inStock ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.stockText, { color: product.inStock ? '#10B981' : '#EF4444' }]}>
              {product.inStock ? 'Available' : 'Sold Out'}
            </Text>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
            <Text style={styles.price}>${product.price}</Text>
          </View>
          {product.sizes && product.sizes.length > 0 && (
            <Text style={styles.sizesText}>
              {product.sizes.slice(0, 2).join(', ')}{product.sizes.length > 2 ? '+' : ''}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {canEditDelete() ? (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Ionicons name="create-outline" size={14} color="#8B5CF6" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addToCartButton, 
                (isAddingToCart || !product.inStock) && styles.disabledButton
              ]}
              onPress={showSizeSelector}
              disabled={isAddingToCart || !product.inStock}
            >
              <Ionicons 
                name={product.inStock ? "bag-add" : "close-circle"} 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.addToCartText}>
                {isAddingToCart ? 'Adding...' : !product.inStock ? 'Sold Out' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seller Info */}
        {(userRole === 'admin' || currentUserId !== product.sellerId) && (
          <View style={styles.sellerContainer}>
            <Text style={styles.sellerText}>
              by {product.sellerEmail?.split('@')[0] || 'Seller'}
            </Text>
            {userRole === 'admin' && (
              <View style={styles.adminIndicator}>
                <Ionicons name="shield-checkmark" size={10} color="#8B5CF6" />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const getConditionBadgeStyle = (condition) => {
  switch (condition) {
    case 'new':
      return { backgroundColor: '#10B981' };
    case 'like-new':
      return { backgroundColor: '#06B6D4' };
    case 'good':
      return { backgroundColor: '#3B82F6' };
    case 'fair':
      return { backgroundColor: '#F59E0B' };
    case 'vintage':
      return { backgroundColor: '#8B5CF6' };
    default:
      return { backgroundColor: '#6B7280' };
  }
};

const getColorCode = (colorName) => {
  const colorMap = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'gray': '#6B7280',
    'brown': '#92400E',
    'navy': '#1E3A8A',
    'beige': '#D2B48C',
    'cream': '#F5F5DC',
  };
  return colorMap[colorName.toLowerCase()] || '#8B5CF6';
};

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
    backdropFilter: 'blur(10px)',
  },
  topBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 3,
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Content Section
  contentContainer: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productBrand: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    color: '#F59E0B',
    marginLeft: 2,
    fontWeight: '600',
  },
  
  // Product Name
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 8,
  },

  // Details Row
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorText: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Price Section
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 10,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D1FAE5',
  },
  sizesText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Action Section
  actionSection: {
    marginBottom: 8,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  editText: {
    fontSize: 11,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteText: {
    fontSize: 11,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  addToCartText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '700',
  },

  // Seller Section
  sellerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
  },
  sellerText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  adminIndicator: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    padding: 2,
  },
});

export default ProductCard;