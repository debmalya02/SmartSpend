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
import { COLORS, GRADIENTS, SHADOWS } from '../constants/Theme';

const Tab = createBottomTabNavigator();

// Custom tab bar icon with glow effect when active
const TabIcon = ({ Icon, focused, color }: { Icon: any; focused: boolean; color: string }) => {
  return (
    <View style={styles.iconContainer}>
      {focused && (
        <View style={styles.glowDot} />
      )}
      <Icon 
        color={color} 
        size={24} 
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
};

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
            {/* Top border glow */}
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Ledger" 
        component={LedgerScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Receipt} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="AI Coach" 
        component={AiCoachScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Bot} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Calendar} color={color} focused={focused} />
          ),
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
    letterSpacing: 0.3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
  },
  glowDot: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
