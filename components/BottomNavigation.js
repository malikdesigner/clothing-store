// components/BottomNavigation.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigation = ({ onNavigate, currentScreen, user }) => {
  const handleNavigation = (screen) => {
    if (!user && (screen === 'wishlist' || screen === 'profile')) {
      Alert.alert(
        'Login Required',
        `Please login to access your ${screen}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => onNavigate('login') }
        ]
      );
      return;
    }
    
    onNavigate(screen);
  };

  const navItems = [
    { 
      key: 'home', 
      icon: 'home-outline', 
      activeIcon: 'home',
      label: 'Home',
      requiresAuth: false,
      color: '#8B5CF6'
    },
    { 
      key: 'wishlist', 
      icon: 'heart-outline', 
      activeIcon: 'heart',
      label: 'Wishlist',
      requiresAuth: true,
      color: '#EF4444'
    },
    { 
      key: 'cart', 
      icon: 'bag-outline', 
      activeIcon: 'bag',
      label: 'Cart',
      requiresAuth: false,
      color: '#10B981'
    },
    { 
      key: user ? 'profile' : 'login', 
      icon: user ? 'person-outline' : 'log-in-outline', 
      activeIcon: user ? 'person' : 'log-in',
      label: user ? 'Profile' : 'Login',
      requiresAuth: false,
      color: '#F59E0B'
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = currentScreen === item.key;
          const showLoginPrompt = !user && item.requiresAuth;
          
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => handleNavigation(item.key)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && { backgroundColor: item.color + '20' }
              ]}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? item.color : '#6B7280'}
                />
                {showLoginPrompt && (
                  <View style={styles.loginIndicator}>
                    <Ionicons name="lock-closed" size={8} color="#EF4444" />
                  </View>
                )}
                {isActive && <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />}
              </View>
              <Text style={[
                styles.navText,
                { color: isActive ? item.color : '#6B7280' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeNavItem: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  loginIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BottomNavigation;