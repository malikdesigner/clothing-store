// screens/CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import CartItem from '../components/CartItem';
import BottomNavigation from '../components/BottomNavigation';

const GUEST_CART_KEY = 'luxeGuestCart';
const GUEST_CART_EXPIRY = 3 * 60 * 60 * 1000; // 3 hours for fashion shopping

const CartScreen = ({ onNavigate, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCart();
  }, [user]);

  const saveGuestCart = async (cartData) => {
    try {
      const cartWithTimestamp = {
        items: cartData,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartWithTimestamp));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const loadGuestCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const now = Date.now();
        
        if (now - parsedCart.timestamp > GUEST_CART_EXPIRY) {
          await AsyncStorage.removeItem(GUEST_CART_KEY);
          return [];
        }
        
        return parsedCart.items || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  };

  const clearGuestCart = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error('Error clearing guest cart:', error);
    }
  };

  const loadCart = async () => {
    if (!user) {
      try {
        const guestCartItems = await loadGuestCart();
        setCartItems(guestCartItems);
      } catch (error) {
        console.error('Error loading guest cart:', error);
        setCartItems([]);
      }
      setLoading(false);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const cart = userData?.cart || [];

      if (cart.length > 0) {
        const productIds = cart.map(item => item.productId);
        const productsQuery = query(
          collection(db, 'products'),
          where('__name__', 'in', productIds)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = {};
        productsSnapshot.docs.forEach(doc => {
          productsData[doc.id] = { id: doc.id, ...doc.data() };
        });

        const cartWithProductData = cart.map(cartItem => ({
          ...cartItem,
          product: productsData[cartItem.productId]
        })).filter(item => item.product);

        setCartItems(cartWithProductData);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
    setLoading(false);
  };

  const updateCartInFirestore = async (newCart) => {
    if (!user) {
      const cartForStorage = newCart.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        product: item.product
      }));
      await saveGuestCart(cartForStorage);
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        cart: newCart.map(({ product, ...item }) => item)
      });
    } catch (error) {
      Alert.alert('Update Error', 'Failed to update cart');
    }
    setUpdating(false);
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const updatedCart = cartItems.map(item => {
      if (item.productId === productId && item.size === size) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  const removeFromCart = async (productId, size) => {
    const updatedCart = cartItems.filter(item => 
      !(item.productId === productId && item.size === size)
    );

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Shopping Bag',
      'Remove all items from your LUXE shopping bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setCartItems([]);
            if (user) {
              await updateCartInFirestore([]);
            } else {
              await clearGuestCart();
            }
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Shopping Bag', 'Your LUXE shopping bag is empty');
      return;
    }

    if (!user) {
      Alert.alert(
        'LUXE Checkout',
        'Complete your purchase as a guest or join LUXE for exclusive benefits',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Guest Checkout', onPress: () => onNavigate('checkout') },
          { text: 'Join LUXE', onPress: () => onNavigate('login') }
        ]
      );
      return;
    }

    onNavigate('checkout');
  };

  React.useEffect(() => {
    global.addToGuestCart = async (productId, size, quantity = 1, productData) => {
      try {
        const currentCart = await loadGuestCart();
        const existingItemIndex = currentCart.findIndex(
          item => item.productId === productId && item.size === size
        );

        let updatedCart;
        if (existingItemIndex >= 0) {
          updatedCart = [...currentCart];
          updatedCart[existingItemIndex].quantity += quantity;
        } else {
          const newItem = {
            productId,
            size,
            quantity,
            product: productData
          };
          updatedCart = [...currentCart, newItem];
        }

        await saveGuestCart(updatedCart);
        return updatedCart;
      } catch (error) {
        console.error('Error adding to guest cart:', error);
        return [];
      }
    };
    
    return () => {
      delete global.addToGuestCart;
    };
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' }}
          style={styles.headerBackground}
          imageStyle={{ opacity: 0.3 }}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="bag" size={24} color="#8B5CF6" />
                <Text style={styles.headerTitle}>Shopping Bag</Text>
              </View>
              <View style={styles.headerActions}>
                <Text style={styles.headerSubtitle}>
                  Guest Mode • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </Text>
                {cartItems.length > 0 && (
                  <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ImageBackground>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading your style...</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {cartItems.length > 0 ? (
                <>
                  <View style={styles.guestBanner}>
                    <Ionicons name="time" size={20} color="#F59E0B" />
                    <Text style={styles.guestBannerText}>
                      Your items are saved for 3 hours. Join LUXE to save permanently & get exclusive benefits.
                    </Text>
                  </View>

                  {cartItems.map((item, index) => (
                    <CartItem
                      key={`${item.productId}-${item.size}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      updating={updating}
                    />
                  ))}
                  
                  <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>✨ LUXE Benefits</Text>
                    <View style={styles.benefitsList}>
                      <View style={styles.benefitItem}>
                        <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                        <Text style={styles.benefitText}>Secure Checkout</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="refresh" size={18} color="#3B82F6" />
                        <Text style={styles.benefitText}>Easy Returns</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="flash" size={18} color="#F59E0B" />
                        <Text style={styles.benefitText}>Express Delivery</Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="bag-outline" size={80} color="#8B5CF6" />
                  <Text style={styles.guestTitle}>Guest Shopping Bag</Text>
                  <Text style={styles.guestSubtitle}>
                    Start adding items to your LUXE collection. Your selections will be saved for 3 hours.
                  </Text>
                  
                  <View style={styles.guestCartActions}>
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => onNavigate('login')}
                    >
                      <Ionicons name="diamond" size={20} color="#FFFFFF" />
                      <Text style={styles.joinButtonText}>Join LUXE</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => onNavigate('home')}
                  >
                    <Text style={styles.browseButtonText}>Explore Collection</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {cartItems.length > 0 && (
              <View style={styles.checkoutSection}>
                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.totalLabel}>Total ({cartItems.length} items)</Text>
                    <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
                  </View>
                  <View style={styles.shippingInfo}>
                    <Text style={styles.shippingText}>
                      {getTotalPrice() > 150 ? '🚚 FREE Express Delivery' : '+ $12.99 Shipping'}
                    </Text>
                    {getTotalPrice() <= 150 && (
                      <Text style={styles.freeShippingTip}>
                        Add ${(150 - getTotalPrice()).toFixed(2)} more for FREE delivery
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.checkoutButton, updating && styles.disabledButton]}
                  onPress={proceedToCheckout}
                  disabled={updating}
                >
                  <Ionicons name="diamond" size={20} color="#FFFFFF" />
                  <Text style={styles.checkoutButtonText}>
                    {updating ? 'Updating...' : 'Guest Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <BottomNavigation onNavigate={onNavigate} currentScreen="cart" user={user} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your style...</Text>
        </View>
        <BottomNavigation onNavigate={onNavigate} currentScreen="cart" user={user} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' }}
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.3 }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="bag" size={24} color="#8B5CF6" />
              <Text style={styles.headerTitle}>Shopping Bag</Text>
            </View>
            <View style={styles.headerActions}>
              <Text style={styles.headerSubtitle}>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </Text>
              {cartItems.length > 0 && (
                <TouchableOpacity onPress={clearCart}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <CartItem
                key={`${item.productId}-${item.size}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                updating={updating}
              />
            ))}
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>✨ LUXE Benefits</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                  <Text style={styles.benefitText}>Secure Checkout</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="refresh" size={18} color="#3B82F6" />
                  <Text style={styles.benefitText}>Easy Returns</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="flash" size={18} color="#F59E0B" />
                  <Text style={styles.benefitText}>Express Delivery</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={80} color="#8B5CF6" />
            <Text style={styles.emptyText}>Your shopping bag is empty</Text>
            <Text style={styles.emptySubtext}>
              Discover amazing fashion pieces and add them to your collection
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => onNavigate('home')}
            >
              <Ionicons name="diamond" size={20} color="#FFFFFF" />
              <Text style={styles.shopButtonText}>Explore LUXE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutSection}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.totalLabel}>Total ({cartItems.length} items)</Text>
              <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
            </View>
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingText}>
                {getTotalPrice() > 150 ? '🚚 FREE Express Delivery' : '+ $12.99 Shipping'}
              </Text>
              {getTotalPrice() <= 150 && (
                <Text style={styles.freeShippingTip}>
                  Add ${(150 - getTotalPrice()).toFixed(2)} more for FREE delivery
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.checkoutButton, updating && styles.disabledButton]}
            onPress={proceedToCheckout}
            disabled={updating}
          >
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>
              {updating ? 'Updating...' : 'Proceed to Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavigation onNavigate={onNavigate} currentScreen="cart" user={user} />
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
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingVertical: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  clearText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  guestBannerText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  guestCartActions: {
    marginBottom: 16,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 200,
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    minWidth: 200,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  checkoutSection: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D1FAE5',
  },
  shippingInfo: {
    alignItems: 'flex-end',
  },
  shippingText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 2,
  },
  freeShippingTip: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 16,
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
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CartScreen;