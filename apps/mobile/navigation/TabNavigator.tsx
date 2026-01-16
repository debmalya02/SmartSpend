import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Receipt, Bot, Calendar } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import LedgerScreen from '../screens/LedgerScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import PlanScreen from '../screens/PlanScreen';
import { COLORS } from '../constants/Theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={['rgba(26, 26, 36, 0.95)', 'rgba(10, 10, 15, 0.98)']}
                style={StyleSheet.absoluteFill}
              />
            </BlurView>
            <LinearGradient
              colors={['rgba(255, 107, 74, 0.3)', 'transparent']}
              style={styles.topGlow}
            />
          </View>
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tab.Screen 
        name="Ledger" 
        component={LedgerScreen}
        options={{
          tabBarIcon: ({ color }) => <Receipt color={color} size={24} />,
        }}
      />
      <Tab.Screen 
        name="AI Coach" 
        component={AiCoachScreen}
        options={{
          tabBarIcon: ({ color }) => <Bot color={color} size={24} />,
        }}
      />
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 90,
    paddingTop: 12,
    paddingBottom: 28,
    elevation: 0,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
