import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { Card } from '../components/Card';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/Theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { dashboardStats, fetchDashboardStats } = useExpenseStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats = dashboardStats || {
    income: 0,
    expense: 0,
    savings: 0,
    savingsRate: 0,
  };

  return (
    <View style={styles.container}>
      {/* Ambient Background Glow - Seamless multi-stop gradient */}
      <LinearGradient
        colors={[
          'rgba(255, 107, 74, 0.15)',
          'rgba(255, 107, 74, 0.08)',
          'rgba(255, 107, 74, 0.03)',
          'rgba(255, 107, 74, 0.01)',
          'rgba(10, 10, 15, 0)',
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.ambientGlow}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good Evening</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>

          {/* Primary Savings Card with Glow */}
          <Card variant="primary" glow>
            <View style={styles.savingsHeader}>
              <View style={styles.iconBadge}>
                <PiggyBank color={COLORS.white} size={24} />
              </View>
              <Text style={styles.savingsLabel}>Monthly Savings</Text>
            </View>
            
            <Text style={styles.savingsAmount}>₹{stats.savings.toLocaleString()}</Text>
            
            <View style={styles.savingsRow}>
              <View style={styles.percentageBadge}>
                <TrendingUp color={COLORS.white} size={14} />
                <Text style={styles.percentageText}>{stats.savingsRate}%</Text>
              </View>
              <Text style={styles.savingsSubtext}>saved this month</Text>
            </View>
            
            {/* Premium Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.min(stats.savingsRate, 100)}%` }]}
                />
              </View>
              <View style={styles.progressMarkers}>
                <Text style={styles.progressMarker}>0%</Text>
                <Text style={styles.progressMarker}>50%</Text>
                <Text style={styles.progressMarker}>100%</Text>
              </View>
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Income Card */}
            <View style={styles.statCardWrapper}>
              <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 214, 143, 0.15)' }]}>
                  <TrendingUp color={COLORS.success} size={20} />
                </View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  ₹{stats.income.toLocaleString()}
                </Text>
                <View style={styles.statTrend}>
                  <View style={[styles.trendDot, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.trendText}>This month</Text>
                </View>
              </Card>
            </View>

            {/* Expenses Card */}
            <View style={styles.statCardWrapper}>
              <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                  <TrendingDown color={COLORS.danger} size={20} />
                </View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={[styles.statValue, { color: COLORS.danger }]}>
                  ₹{stats.expense.toLocaleString()}
                </Text>
                <View style={styles.statTrend}>
                  <View style={[styles.trendDot, { backgroundColor: COLORS.danger }]} />
                  <Text style={styles.trendText}>This month</Text>
                </View>
              </Card>
            </View>
          </View>

          {/* Balance Overview Card */}
          <Card variant="glass">
            <View style={styles.balanceHeader}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 107, 74, 0.15)' }]}>
                <Wallet color={COLORS.primary} size={20} />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Net Balance</Text>
                <Text style={styles.balanceValue}>
                  ₹{(stats.income - stats.expense).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.balanceBar}>
              <LinearGradient
                colors={GRADIENTS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.balanceBarFill, { 
                  width: stats.income > 0 ? `${Math.min((stats.income - stats.expense) / stats.income * 100, 100)}%` : '0%'
                }]}
              />
            </View>
          </Card>

          {/* Bottom Spacing for Tab Bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.l,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.hero,
    color: COLORS.text,
  },
  
  // Savings Card
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  savingsLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  savingsAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -2,
    marginBottom: SPACING.s,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.s,
  },
  percentageText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    marginLeft: 4,
  },
  savingsSubtext: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressContainer: {
    marginTop: SPACING.s,
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressMarker: {
    ...TYPOGRAPHY.small,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.s,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: SPACING.s,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  trendText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  
  // Balance Card
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  balanceInfo: {
    marginLeft: SPACING.s,
    flex: 1,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  balanceBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  balanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  bottomSpacer: {
    height: 100,
  },
});
