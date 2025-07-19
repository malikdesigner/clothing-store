// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import AddProductScreen from './screens/AddProductScreen';
import EditProductScreen from './screens/EditProductScreen';
import WishlistScreen from './screens/WishlistScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import CheckoutScreen from './screens/CheckoutScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const navigateToScreen = (screen, product = null) => {
    setSelectedProduct(product);
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (currentScreen === 'home') {
    return <HomeScreen onNavigate={navigateToScreen} user={user} />;
  }
  if (currentScreen === 'login') {
    return <LoginScreen onNavigate={navigateToScreen} />;
  }
  if (currentScreen === 'signup') {
    return <SignupScreen onNavigate={navigateToScreen} />;
  }
  if (currentScreen === 'addProduct') {
    return <AddProductScreen onNavigate={navigateToScreen} user={user} />;
  }
  if (currentScreen === 'editProduct') {
    return <EditProductScreen onNavigate={navigateToScreen} user={user} product={selectedProduct} />;
  }
  if (currentScreen === 'wishlist') {
    return <WishlistScreen onNavigate={navigateToScreen} user={user} />;
  }
  if (currentScreen === 'cart') {
    return <CartScreen onNavigate={navigateToScreen} user={user} />;
  }
  if (currentScreen === 'profile') {
    return <ProfileScreen onNavigate={navigateToScreen} user={user} />;
  }
  if (currentScreen === 'checkout') {
    return <CheckoutScreen onNavigate={navigateToScreen} user={user} />;
  }
  
  return <HomeScreen onNavigate={navigateToScreen} user={user} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
});

export default App;