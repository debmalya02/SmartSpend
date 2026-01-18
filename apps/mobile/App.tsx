import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import TabNavigator from './navigation/TabNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './components/SplashScreen';
import { useExpenseStore } from './stores/useExpenseStore';
import { useAuthStore } from './stores/useAuthStore';
import UsernameSetupScreen from './screens/auth/UsernameSetupScreen';
import { COLORS } from './constants/Theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { fetchExpenses, fetchDashboardStats, fetchPlans } = useExpenseStore();
  const { 
    isInitialized, 
    isLoggedIn, 
    needsOnboarding, 
    userProfile,
    isLoading,
    initialize 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app start
    initialize();
  }, []);

  useEffect(() => {
    // Pre-fetch data when user is logged in, onboarded, AND profile is loaded
    if (isLoggedIn && !needsOnboarding && userProfile) {
      const loadData = async () => {
        try {
          await Promise.allSettled([
            fetchExpenses(),
            fetchDashboardStats(),
            fetchPlans(),
          ]);
        } catch (error) {
          console.log('Error preloading data:', error);
        }
      };
      loadData();
    }
  }, [isLoggedIn, needsOnboarding, userProfile]);

  // Show splash screen while initializing
  if (showSplash || !isInitialized) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // Not logged in - show auth flow
  if (!isLoggedIn) {
    return (
      <NavigationContainer>
        <StatusBar style="light" />
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Logged in but still loading user profile
  if (isLoading || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Logged in but needs username setup
  if (needsOnboarding) {
    return (
      <NavigationContainer>
        <StatusBar style="light" />
        <UsernameSetupScreen />
      </NavigationContainer>
    );
  }

  // Fully authenticated - show main app
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
