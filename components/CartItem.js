// components/CartItem.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = ({ item, onUpdateQuantity, onRemove, updating }) => {
  const { product, size, quantity } = item;

  if (!product) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            <View style={styles.details}>
              <Text style={styles.size}>Size: {size}</Text>
              {product.color && (
                <View style={styles.colorInfo}>
                  <View style={[styles.colorDot, { backgroundColor: getColorCode(product.color) }]} />
                  <Text style={styles.color}>{product.color}</Text>
                </View>
              )}
            </View>
            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(product.id, size)}
            disabled={updating}
          >
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, updating && styles.disabledButton]}
              onPress={() => onUpdateQuantity(product.id, size, quantity - 1)}
              disabled={updating || quantity <= 1}
            >
              <Ionicons name="remove" size={16} color="#8B5CF6" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, updating && styles.disabledButton]}
              onPress={() => onUpdateQuantity(product.id, size, quantity + 1)}
              disabled={updating}
            >
              <Ionicons name="add" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>${product.price} each</Text>
            <Text style={styles.totalPrice}>
              ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
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
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 90,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  size: {
    fontSize: 14,
    color: '#D1FAE5',
    marginRight: 12,
    fontWeight: '500',
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  color: {
    fontSize: 14,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  quantityButton: {
    padding: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D1FAE5',
    marginTop: 2,
  },
});

export default CartItem;