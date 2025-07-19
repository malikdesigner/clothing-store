// screens/CheckoutScreen.js
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
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckoutScreen = ({ onNavigate, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    loadCheckoutData();
  }, [user]);

  const loadCheckoutData = async () => {
    try {
      let cart = [];
      
      if (user) {
        // Load user's cart from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        cart = userData?.cart || [];
        
        // Pre-fill shipping info if available
        setShippingInfo(prev => ({
          ...prev,
          fullName: userData?.name || '',
          email: userData?.email || user.email,
          phone: userData?.phone || '',
          address: userData?.address || '',
        }));
      } else {
        // Load guest cart from AsyncStorage
        const storedCart = await AsyncStorage.getItem('luxeGuestCart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          cart = parsedCart.items || [];
        }
      }

      setCartItems(cart);
    } catch (error) {
      console.error('Error loading checkout data:', error);
    }
    setLoading(false);
  };

  const updateShippingInfo = (key, value) => {
    setShippingInfo(prev => ({ ...prev, [key]: value }));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const product = user ? item.product : item.product;
      return total + (product.price * item.quantity);
    }, 0);
  };

  const getShippingCost = () => {
    const total = getTotalPrice();
    return total > 150 ? 0 : 12.99;
  };

  const getTax = () => {
    return getTotalPrice() * 0.08; // 8% tax
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost() + getTax();
  };

  const validateForm = () => {
    const { fullName, email, phone, address, city, state, zipCode } = shippingInfo;
    
    if (!fullName || !email || !phone || !address || !city || !state || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all shipping details');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          productId: user ? item.productId : item.productId,
          quantity: item.quantity,
          size: item.size,
          price: user ? item.product.price : item.product.price,
          productName: user ? item.product.name : item.product.name,
          productBrand: user ? item.product.brand : item.product.brand,
        })),
        shippingInfo,
        paymentMethod,
        subtotal: getTotalPrice(),
        shipping: getShippingCost(),
        tax: getTax(),
        total: getFinalTotal(),
        orderDate: new Date(),
        status: 'confirmed',
        userId: user?.uid || 'guest',
        userEmail: shippingInfo.email,
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Clear cart
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          cart: []
        });
      } else {
        await AsyncStorage.removeItem('luxeGuestCart');
      }

      Alert.alert(
        'Order Confirmed! ✨',
        'Thank you for shopping with LUXE! Your order has been placed successfully.',
        [
          { text: 'Continue Shopping', onPress: () => onNavigate('home') }
        ]
      );
    } catch (error) {
      Alert.alert('Order Failed', 'Failed to place order. Please try again.');
    }
    setPlacing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading checkout...</Text>
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
            <TouchableOpacity onPress={() => onNavigate('cart')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name="diamond" size={24} color="#8B5CF6" />
              <Text style={styles.headerTitle}>LUXE Checkout</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Order Summary</Text>
          {cartItems.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {user ? item.product.name : item.product.name} (Size {item.size})
              </Text>
              <Text style={styles.itemPrice}>
                ${((user ? item.product.price : item.product.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          {cartItems.length > 3 && (
            <Text style={styles.moreItems}>
              +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Shipping Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              value={shippingInfo.fullName}
              onChangeText={(value) => updateShippingInfo('fullName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#6B7280"
              value={shippingInfo.email}
              onChangeText={(value) => updateShippingInfo('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 123-4567"
              placeholderTextColor="#6B7280"
              value={shippingInfo.phone}
              onChangeText={(value) => updateShippingInfo('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor="#6B7280"
              value={shippingInfo.address}
              onChangeText={(value) => updateShippingInfo('address', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#6B7280"
                value={shippingInfo.city}
                onChangeText={(value) => updateShippingInfo('city', value)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#6B7280"
                value={shippingInfo.state}
                onChangeText={(value) => updateShippingInfo('state', value)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="12345"
              placeholderTextColor="#6B7280"
              value={shippingInfo.zipCode}
              onChangeText={(value) => updateShippingInfo('zipCode', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card" size={24} color="#8B5CF6" />
            <Text style={styles.paymentText}>Credit/Debit Card</Text>
            <Ionicons 
              name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"} 
              size={20} 
              color="#8B5CF6" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'paypal' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <Ionicons name="logo-paypal" size={24} color="#8B5CF6" />
            <Text style={styles.paymentText}>PayPal</Text>
            <Ionicons 
              name={paymentMethod === 'paypal' ? "radio-button-on" : "radio-button-off"} 
              size={20} 
              color="#8B5CF6" 
            />
          </TouchableOpacity>
        </View>

        {/* Order Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Order Total</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${getTotalPrice().toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={[styles.totalValue, getShippingCost() === 0 && styles.freeShipping]}>
              {getShippingCost() === 0 ? 'FREE' : `${getShippingCost().toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>${getTax().toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>${getFinalTotal().toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, placing && styles.disabledButton]}
          onPress={placeOrder}
          disabled={placing}
        >
          <Ionicons name="diamond" size={20} color="#FFFFFF" />
          <Text style={styles.placeOrderText}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>

        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>

        <View style={styles.bottomSpace} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
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
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  itemName: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 12,
  },
  selectedPayment: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  paymentText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  totalValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  freeShipping: {
    color: '#10B981',
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    marginTop: 8,
    paddingTop: 12,
  },
  finalTotalLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 18,
    color: '#D1FAE5',
    fontWeight: '700',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 16,
    marginHorizontal: 24,
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
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});

export default CheckoutScreen;