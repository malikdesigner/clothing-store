// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import BottomNavigation from '../components/BottomNavigation';

const ProfileScreen = ({ onNavigate, user }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    wishlistCount: 0,
    cartCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Load user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserProfile(userData);

      // Load user statistics
      const stats = {
        totalProducts: 0,
        totalSales: 0,
        wishlistCount: userData?.wishlist?.length || 0,
        cartCount: userData?.cart?.length || 0,
      };

      // Count products created by user
      const productsQuery = query(
        collection(db, 'products'),
        where('sellerId', '==', user.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      stats.totalProducts = productsSnapshot.size;

      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Leave LUXE?',
      'Are you sure you want to sign out of your LUXE account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert('Goodbye! ✨', 'You have been signed out of LUXE');
              onNavigate('home');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
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
              <Ionicons name="person-circle" size={80} color="#8B5CF6" />
              <Text style={styles.guestTitle}>Join LUXE Community</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to access your profile, track orders, save favorites, and enjoy exclusive member benefits.
              </Text>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => onNavigate('login')}
              >
                <Ionicons name="diamond" size={20} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Sign In</Text>
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
                <Text style={styles.browseButtonText}>Continue Browsing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        
        <BottomNavigation onNavigate={onNavigate} currentScreen="profile" user={user} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
        <BottomNavigation onNavigate={onNavigate} currentScreen="profile" user={user} />
      </SafeAreaView>
    );
  }

  const getMembershipLevel = () => {
    if (userProfile?.role === 'admin') return 'Administrator';
    if (userStats.totalProducts >= 10) return 'Elite Member';
    if (userStats.totalProducts >= 5) return 'Premium Member';
    return 'Fashion Member';
  };

  const getMembershipColor = () => {
    if (userProfile?.role === 'admin') return '#8B5CF6';
    if (userStats.totalProducts >= 10) return '#F59E0B';
    if (userStats.totalProducts >= 5) return '#10B981';
    return '#3B82F6';
  };

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
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userProfile?.name || 'LUXE Member'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={[styles.membershipBadge, { backgroundColor: getMembershipColor() }]}>
                  <Ionicons name="diamond" size={14} color="#FFFFFF" />
                  <Text style={styles.membershipText}>{getMembershipLevel()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>✨ Your LUXE Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="shirt" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{userStats.totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.statNumber}>{userStats.wishlistCount}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bag" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{userStats.cartCount}</Text>
              <Text style={styles.statLabel}>Cart Items</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{userProfile?.loyaltyPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate('addProduct')}
            >
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate('wishlist')}
            >
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.actionText}>My Wishlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate('cart')}
            >
              <Ionicons name="bag" size={24} color="#10B981" />
              <Text style={styles.actionText}>Shopping Bag</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Account Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="person-circle" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Profile Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="location" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Shipping Address</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="card" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Payment Methods</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💎 Support & Info</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="help-circle" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      <BottomNavigation onNavigate={onNavigate} currentScreen="profile" user={user} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:10,
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  membershipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 24,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  signOutSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerSpace: {
    height: 120,
  },
});

export default ProfileScreen;