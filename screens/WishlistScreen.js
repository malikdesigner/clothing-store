// screens/WishlistScreen.js
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
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import BottomNavigation from '../components/BottomNavigation';

const WishlistScreen = ({ onNavigate, user }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserRole(userData?.role || 'customer');
      
      const wishlist = userData?.wishlist || [];

      if (wishlist.length > 0) {
        const productsQuery = query(
          collection(db, 'products'),
          where('__name__', 'in', wishlist)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setWishlistItems(productsData);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (productId) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        wishlist: arrayRemove(productId)
      });
      
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      Alert.alert('Removed! 💔', 'Item removed from your wishlist');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from wishlist');
    }
  };

  const clearWishlist = async () => {
    Alert.alert(
      'Clear Wishlist',
      'Remove all items from your LUXE wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                wishlist: []
              });
              setWishlistItems([]);
              Alert.alert('Cleared! ✨', 'Your wishlist has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
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
            <View style={styles.guestContainer}>
              <Ionicons name="heart-circle" size={80} color="#8B5CF6" />
              <Text style={styles.guestTitle}>Save Your Favorites</Text>
              <Text style={styles.guestSubtitle}>
                Join LUXE to create your personal wishlist and never lose track of the pieces you love.
              </Text>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => onNavigate('login')}
              >
                <Ionicons name="diamond" size={20} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Join LUXE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => onNavigate('signup')}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => onNavigate('home')}
              >
                <Text style={styles.browseButtonText}>Explore Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        
        <BottomNavigation onNavigate={onNavigate} currentScreen="wishlist" user={user} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
        <BottomNavigation onNavigate={onNavigate} currentScreen="wishlist" user={user} />
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
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.headerTitle}>My Wishlist</Text>
            </View>
            <View style={styles.headerActions}>
              <Text style={styles.headerSubtitle}>
                {wishlistItems.length} favorite{wishlistItems.length !== 1 ? 's' : ''}
              </Text>
              {wishlistItems.length > 0 && (
                <TouchableOpacity onPress={clearWishlist}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {wishlistItems.length > 0 ? (
          <>
            <View style={styles.wishlistInfo}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <Text style={styles.wishlistInfoText}>
                Your curated collection of LUXE favorites. Tap the heart again to remove items.
              </Text>
            </View>

            <View style={styles.productsGrid}>
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  currentUserId={user?.uid}
                  userRole={userRole}
                />
              ))}
            </View>

            <View style={styles.wishlistTips}>
              <Text style={styles.tipsTitle}>✨ Wishlist Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="notifications" size={16} color="#8B5CF6" />
                  <Text style={styles.tipText}>Get notified when prices drop</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="share" size={16} color="#8B5CF6" />
                  <Text style={styles.tipText}>Share your wishlist with friends</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="cart" size={16} color="#8B5CF6" />
                  <Text style={styles.tipText}>Quick add to cart from here</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#8B5CF6" />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Start adding items you love to create your perfect LUXE collection
            </Text>
            
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => onNavigate('home')}
            >
              <Ionicons name="diamond" size={20} color="#FFFFFF" />
              <Text style={styles.exploreButtonText}>Explore LUXE</Text>
            </TouchableOpacity>
            
            <View style={styles.emptyTips}>
              <Text style={styles.emptyTipsTitle}>💡 How to build your wishlist:</Text>
              <Text style={styles.emptyTip}>• Tap the ♡ icon on any product</Text>
              <Text style={styles.emptyTip}>• Browse categories to find your style</Text>
              <Text style={styles.emptyTip}>• Save items for special occasions</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNavigation onNavigate={onNavigate} currentScreen="wishlist" user={user} />
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
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  guestTitle: {
    fontSize: 28,
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 200,
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  signupButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#6B7280',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingTop: 8,
  },
  wishlistInfo: {
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
  wishlistInfoText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  wishlistTips: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 120,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#D1FAE5',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
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
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyTips: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    width: '100%',
  },
  emptyTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyTip: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});

export default WishlistScreen;