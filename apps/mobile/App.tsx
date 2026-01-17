import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './components/SplashScreen';
import { useExpenseStore } from './stores/useExpenseStore';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchExpenses, fetchDashboardStats, fetchPlans } = useExpenseStore();

  useEffect(() => {
    // Pre-fetch data while splash screen is showing
    const loadData = async () => {
      try {
        await Promise.all([
          fetchExpenses(),
          fetchDashboardStats(),
          fetchPlans(),
        ]);
      } catch (error) {
        console.log('Error preloading data:', error);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setIsLoading(false)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
    </NavigationContainer>
  );
}
